# ADR-009: Internationalization (i18n) Strategy

**Date**: 2024-12-28  
**Status**: Accepted  
**Context**: Phase 1 Complete - Before Phase 2 Multi-Sources  
**Authors**: Thomas

---

## Context

### Current Situation

Le projet est actuellement **monolingue français** avec normalisation **FR→EN** :
- Interface en français
- Dictionnaire mappings : `terme FR` → `valeur EN`
- Base de données avec textes FR
- URLs en français

### Vision Produit

**Le site est destiné à être international rapidement** :
- Cible primaire : Europe (FR, EN, ES, IT, DE)
- Designers internationaux cherchent deadstock
- Sources multi-pays (MLC France, TFS UK, Recovo ES...)
- SEO multi-langues critique pour acquisition

### Problème

Si on attend Phase 4-5 pour implémenter i18n, on devra :
- ❌ Refactor toute la base de données (mappings, textiles)
- ❌ Réécrire tous les adapters (parsing multilingue)
- ❌ Refactor interface complète
- ❌ Migrer les données existantes
- ❌ **Coût : 3-4 semaines de refactor** 😱

---

## Decision

### Stratégie Progressive en 3 Phases

#### Phase 0 : Architecture Ready (MAINTENANT - Avant Phase 2)

**Objectif** : Préparer l'architecture pour i18n SANS implémenter l'UI complète.

**Actions critiques** (1-2 jours) :
1. **Refactor dictionary schema** → Support multi-langues
2. **Préparer normalization service** → Détection langue source
3. **Structure backend** → Accept `locale` param
4. **URLs structure** → `/[locale]/...` ready

**Non-critique** (peut attendre) :
- ⏳ Traduction UI complète
- ⏳ Sélecteur de langue
- ⏳ Content management
- ⏳ SEO multi-langues

#### Phase 1 : Backend i18n (Phase 2-3 du projet)

**Objectif** : Backend supporte multi-langues, UI reste FR.

**Actions** (1 semaine) :
1. Traduire interface basique (EN)
2. API multi-langues fonctionnelle
3. Adapters détectent langue source
4. Routes `/en/...` et `/fr/...` fonctionnelles

#### Phase 2 : Full i18n (Phase 4+ du projet)

**Objectif** : Expérience complète multi-langues.

**Actions** (2-3 semaines) :
1. Traductions complètes (ES, IT, DE)
2. Sélecteur langue dans UI
3. SEO multi-langues
4. Content management translations

---

## Architecture Changes (Phase 0 - CRITICAL)

### 1. Database Schema - Dictionary Mappings

**AVANT (actuel)** :
```sql
CREATE TABLE dictionary_mappings (
  term TEXT,           -- Terme français
  value TEXT,          -- Valeur anglaise
  category TEXT
);
```

**APRÈS (i18n ready)** :
```sql
CREATE TABLE dictionary_mappings (
  id UUID PRIMARY KEY,
  
  -- Source language term
  source_term TEXT NOT NULL,
  source_locale TEXT NOT NULL DEFAULT 'fr',  -- 'fr', 'en', 'es', 'it', 'de'
  
  -- Target translations (JSONB for flexibility)
  translations JSONB NOT NULL,
  -- Example: {"en": "silk", "es": "seda", "it": "seta", "de": "Seide"}
  
  category TEXT NOT NULL,
  
  -- Metadata
  source TEXT DEFAULT 'manual',
  confidence FLOAT DEFAULT 1.0,
  validated_at TIMESTAMP DEFAULT NOW(),
  validated_by UUID,
  notes TEXT,
  usage_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraint unicité : source_term + source_locale + category
  UNIQUE(source_term, source_locale, category)
);

-- Index for lookups
CREATE INDEX idx_dict_source ON dictionary_mappings(source_term, source_locale, category);
CREATE INDEX idx_dict_translations ON dictionary_mappings USING gin(translations);
```

**Migration Path** :
```sql
-- Migrate existing data
UPDATE dictionary_mappings 
SET 
  source_term = term,
  source_locale = 'fr',
  translations = jsonb_build_object('en', value)
WHERE source_locale IS NULL;
```

**Bénéfices** :
- ✅ Support N langues sans changer schema
- ✅ Facile ajouter nouvelle langue (juste update JSONB)
- ✅ Backward compatible via migration

### 2. Textiles Table - Content Translations

**Option A : JSONB Columns (RECOMMANDÉ)** :
```sql
CREATE TABLE textiles (
  id UUID PRIMARY KEY,
  
  -- Multilingual fields
  name JSONB NOT NULL,
  -- {"fr": "Crêpe de Chine", "en": "Crepe de Chine", "es": "Crepé de China"}
  
  description JSONB,
  -- {"fr": "Découvrez...", "en": "Discover...", "es": "Descubre..."}
  
  -- Normalized fields (still EN for consistency)
  material_type TEXT,
  color TEXT,
  pattern TEXT,
  
  -- Rest unchanged
  ...
);

-- Helper functions
CREATE FUNCTION get_translated_text(jsonb_field JSONB, locale TEXT) 
RETURNS TEXT AS $$
  SELECT COALESCE(
    jsonb_field->>locale,
    jsonb_field->>'en',
    jsonb_field->>'fr'
  );
$$ LANGUAGE SQL IMMUTABLE;
```

**Option B : Separate Translations Table** :
```sql
CREATE TABLE textile_translations (
  id UUID PRIMARY KEY,
  textile_id UUID REFERENCES textiles(id),
  locale TEXT NOT NULL,
  name TEXT,
  description TEXT,
  
  UNIQUE(textile_id, locale)
);
```

**Décision** : **Option A (JSONB)** car :
- ✅ Moins de joins
- ✅ Facile à query
- ✅ Flexible (pas toutes les langues nécessaires)

### 3. Normalization Service - Language Detection

**Nouveau flow** :
```typescript
interface NormalizeInput {
  text: string;
  sourceLocale?: string;  // 'fr', 'en', 'es', auto-detect si null
  targetLocale?: string;  // Default 'en'
}

async function normalize(input: NormalizeInput) {
  // 1. Detect source language if not provided
  const sourceLang = input.sourceLocale || await detectLanguage(input.text);
  
  // 2. Lookup in dictionary
  const mapping = await dictionaryRepo.find({
    term: input.text,
    sourceLocale: sourceLang,
    category: 'material'
  });
  
  // 3. Return translation in target language
  if (mapping) {
    return {
      found: true,
      value: mapping.translations[input.targetLocale || 'en'],
      sourceLocale: sourceLang
    };
  }
  
  // 4. Unknown
  return {
    found: false,
    unknown: input.text,
    sourceLocale: sourceLang
  };
}
```

### 4. Smart Parsing - Multi-Language Adapters

**Chaque adapter doit spécifier sa langue** :
```typescript
class MyLittleCouponAdapter {
  readonly sourceLocale = 'fr';  // MLC = français
  
  smartParse(raw: RawProduct): ExtractedTerms {
    return {
      materials: this.parseMaterials(raw),
      colors: this.parseColors(raw),
      patterns: this.parsePatterns(raw),
      sourceLocale: this.sourceLocale  // ← NOUVEAU
    };
  }
}

class TheFabricSalesAdapter {
  readonly sourceLocale = 'en';  // TFS = anglais
  // ...
}

class RecovoAdapter {
  readonly sourceLocale = 'es';  // Recovo = espagnol
  // ...
}
```

### 5. URLs Structure - Locale Routing

**Next.js routing** :
```
/[locale]/admin/tuning
/[locale]/search
/[locale]/textiles/[id]

Examples:
/fr/admin/tuning
/en/admin/tuning
/es/admin/tuning
```

**Middleware** :
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if locale in pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (pathnameHasLocale) return;
  
  // Redirect to default locale
  const locale = getLocale(request); // From cookie, header, or default
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}
```

---

## Migration Plan

### Phase 0 : Prep Architecture (AVANT Phase 2) - 1-2 JOURS

**CRITICAL - Ne pas skipper** ⚠️

#### Jour 1 : Database Schema

1. **Créer migration 005** : i18n-ready schema
```sql
-- Add columns to dictionary_mappings
ALTER TABLE dictionary_mappings 
  ADD COLUMN source_term TEXT,
  ADD COLUMN source_locale TEXT DEFAULT 'fr',
  ADD COLUMN translations JSONB;

-- Migrate existing data
UPDATE dictionary_mappings 
SET 
  source_term = term,
  translations = jsonb_build_object('en', value);

-- Drop old columns (after validation)
ALTER TABLE dictionary_mappings 
  DROP COLUMN term,
  DROP COLUMN value;

-- Update constraint
ALTER TABLE dictionary_mappings 
  DROP CONSTRAINT dictionary_mappings_term_category_key;
  
ALTER TABLE dictionary_mappings 
  ADD CONSTRAINT dictionary_mappings_unique 
  UNIQUE(source_term, source_locale, category);
```

2. **Update textiles table**
```sql
-- Add JSONB columns
ALTER TABLE textiles
  ADD COLUMN name_i18n JSONB,
  ADD COLUMN description_i18n JSONB;

-- Migrate existing data
UPDATE textiles 
SET 
  name_i18n = jsonb_build_object('fr', name),
  description_i18n = jsonb_build_object('fr', description);

-- Keep old columns for now (backward compat)
```

#### Jour 2 : Code Refactoring

1. **Update interfaces**
```typescript
// types.ts
export type Locale = 'fr' | 'en' | 'es' | 'it' | 'de';

export interface DictionaryMapping {
  source_term: string;
  source_locale: Locale;
  translations: Record<Locale, string>;
  category: TermCategory;
}

export interface ExtractedTerms {
  materials: string[];
  colors: string[];
  patterns: string[];
  sourceLocale: Locale;  // ← NEW
}
```

2. **Update repositories**
```typescript
// dictionaryRepo.ts
async find(term: string, sourceLocale: Locale, category: string) {
  const { data } = await supabase
    .from('dictionary_mappings')
    .select('*')
    .eq('source_term', term)
    .eq('source_locale', sourceLocale)
    .eq('category', category)
    .single();
    
  return data;
}

async getTranslation(
  term: string, 
  sourceLocale: Locale, 
  targetLocale: Locale
): Promise<string | null> {
  const mapping = await this.find(term, sourceLocale, category);
  return mapping?.translations[targetLocale] || null;
}
```

3. **Update adapters**
```typescript
class MyLittleCouponAdapter {
  readonly sourceLocale: Locale = 'fr';
  
  smartParse(raw: RawProduct): ExtractedTerms {
    return {
      materials: this.parseMaterials(raw),
      colors: this.parseColors(raw),
      patterns: this.parsePatterns(raw),
      sourceLocale: this.sourceLocale
    };
  }
}
```

4. **Update normalizeTextile**
```typescript
const normalized = await normalizeTextile({
  extractedTerms: product.extracted,
  sourceLocale: product.extracted.sourceLocale,  // ← NEW
  targetLocale: 'en',  // Default target
  ...
});
```

**Estimation** : 2 jours max
**Risk** : Low (mostly mechanical changes)

---

### Phase 1 : Basic i18n (Phase 2-3 projet) - 1 SEMAINE

**Non-bloquant pour Phase 2, mais recommended**

1. **Setup i18n library** (next-intl ou react-i18next)
2. **Traduire interface basique** (FR + EN)
3. **Implémenter locale routing** ([locale] folder)
4. **Cookie/header detection** locale user
5. **API accepts locale param**

**Estimation** : 5-7 jours

---

### Phase 2 : Full i18n (Phase 4+) - 2-3 SEMAINES

**Future, non-urgent**

1. Traductions complètes (ES, IT, DE)
2. Language switcher UI
3. SEO multi-langues (hreflang, sitemaps)
4. Content management translations
5. LLM translations automatiques

**Estimation** : 2-3 semaines

---

## Impact par Phase Projet

### Phase 1 (Completed) ✅
- ✅ Pas d'impact (déjà fini)

### Phase 2 (Multi-Sources) - ⚠️ CRITICAL
**DOIT implémenter Phase 0 i18n AVANT** 

**Pourquoi** :
- TFS = source anglaise
- Recovo = source espagnole
- Sans i18n ready → Mix FR/EN/ES non géré
- Refactor massif si on attend

**Timeline** : 2 jours AVANT de commencer adapters TFS/Recovo

### Phase 3 (LLM Fallback)
- ⚡ Impact moyen
- LLM peut traduire N→N langues
- Plus facile avec schema i18n ready

### Phase 4 (Design Tools)
- Impact faible
- Calculateur métrage = logique, pas textes
- Patterns PDF = multilingue anyway

### Phase 5 (Marketplace)
- Impact élevé
- Users postent dans leur langue
- Reviews multi-langues
- **Nécessite Full i18n (Phase 2)**

---

## Timing Critical Path

### ❌ BAD : Attendre Phase 5
```
Phase 1 ✅ → Phase 2 → Phase 3 → Phase 4 → Phase 5
                                            ↓
                                    Refactor massif i18n (4 semaines)
                                    - Database migration complexe
                                    - Toutes les sources à refactor
                                    - Tous les mappings à migrer
```

### ✅ GOOD : Phase 0 maintenant
```
Phase 1 ✅ → [i18n Prep 2j] → Phase 2 → Phase 3 → Phase 4 → Phase 5
                                                              ↓
                                                    Full i18n (1 semaine)
                                                    - Juste traductions UI
                                                    - Backend déjà ready
```

**Économie** : 4 semaines - 2 jours = **3.5 semaines saved** 💰

---

## Locales Prioritaires

### Tier 1 (Launch) - Phase 1 i18n
- 🇫🇷 Français (default, done)
- 🇬🇧 English (critical pour scale international)

### Tier 2 (M6) - Phase 2 i18n
- 🇪🇸 Español (Recovo, marché espagnol)
- 🇮🇹 Italiano (marché italien actif mode)

### Tier 3 (M12+) - Future
- 🇩🇪 Deutsch (marché allemand)
- 🇳🇱 Nederlands (marché néerlandais)

---

## SEO Considerations

### URLs Multi-Langues
```
https://deadstock.com/fr/textiles/crepe-de-chine
https://deadstock.com/en/textiles/crepe-de-chine
https://deadstock.com/es/textiles/crepe-de-chine
```

### Hreflang Tags
```html
<link rel="alternate" hreflang="fr" href="https://deadstock.com/fr/textiles/..." />
<link rel="alternate" hreflang="en" href="https://deadstock.com/en/textiles/..." />
<link rel="alternate" hreflang="es" href="https://deadstock.com/es/textiles/..." />
<link rel="alternate" hreflang="x-default" href="https://deadstock.com/en/textiles/..." />
```

### Sitemap Multi-Langues
```xml
<url>
  <loc>https://deadstock.com/fr/textiles/123</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://deadstock.com/en/textiles/123" />
  <xhtml:link rel="alternate" hreflang="es" href="https://deadstock.com/es/textiles/123" />
</url>
```

---

## Libraries Recommandées

### i18n Framework
**next-intl** (Recommended pour Next.js)
- ✅ SSR friendly
- ✅ Type-safe
- ✅ Locale routing built-in
- ✅ Performance optimized

**Alternative** : react-i18next
- ✅ Plus features
- ⚠️ Plus complexe

### Language Detection
**@formatjs/intl-locale** : Detect user locale from headers

### Translations Management
- **Tolgee** : Open-source, collaborative translations
- **Crowdin** : Professional, intégrations Git

---

## Cost Estimation

### Phase 0 (Architecture Prep)
- **Dev time** : 2 jours
- **Cost** : ~€500 (si freelance)
- **ROI** : Évite 3.5 semaines refactor = €8,750 saved

### Phase 1 (Basic i18n)
- **Dev time** : 1 semaine
- **Translations** : €500-1000 (FR→EN)
- **Total** : €2,000-2,500

### Phase 2 (Full i18n)
- **Dev time** : 2-3 semaines
- **Translations** : €2,000-3,000 (4 langues)
- **Total** : €6,000-9,000

---

## Success Metrics

### Phase 0 (Architecture)
- ✅ Schema i18n-ready deployed
- ✅ Existing data migrated
- ✅ No breaking changes
- ✅ Tests pass

### Phase 1 (Basic)
- ✅ Site available in FR + EN
- ✅ Locale switching works
- ✅ URLs with locale prefix
- ✅ Cookie persistence locale

### Phase 2 (Full)
- ✅ 4+ langues complètes
- ✅ SEO multi-langues (hreflang)
- ✅ Translations quality >95%
- ✅ Traffic split : 40% FR, 40% EN, 20% autres

---

## Alternatives Considered

### Alternative 1 : Machine Translation Only
**Rejected** : Quality insuffisante pour SEO et UX

### Alternative 2 : English Only
**Rejected** : Limite croissance marché français (core market)

### Alternative 3 : Separate Sites per Locale
**Rejected** : Coût maintenance × N sites

---

## References

- Next.js i18n Routing: https://nextjs.org/docs/app/building-your-application/routing/internationalization
- next-intl: https://next-intl-docs.vercel.app/
- Google i18n Best Practices: https://developers.google.com/search/docs/specialty/international

---

## Decision Summary

### ✅ CRITICAL : Phase 0 AVANT Phase 2

**Timeline** : 2 jours AVANT de commencer TFS/Recovo adapters

**Actions** :
1. Migration 005 : i18n database schema
2. Update interfaces : ExtractedTerms.sourceLocale
3. Update repositories : translations JSONB
4. Update adapters : specify sourceLocale

**Non-négociable** : Sans ça, Phase 2 multi-sources sera un cauchemar 😱

---

### 🟡 RECOMMANDÉ : Phase 1 pendant Phase 2-3

**Timeline** : 1 semaine pendant Phase 2-3 projet

**Bénéfices** :
- Prêt pour launch international
- SEO multi-langues early
- User experience améliorée

---

### 🟢 OPTIONNEL : Phase 2 en Phase 4+

**Timeline** : 2-3 semaines quand scale international

**Dépend** : Traffic, budget, priorités business

---

**Status** : Accepted  
**Priority** : CRITICAL (Phase 0 avant Phase 2)  
**Next Actions** : Implémenter Phase 0 dans les 2 prochains jours
