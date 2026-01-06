# ADR 020 : Source Locale Configuration for Scrapers

**Date** : 5 janvier 2026  
**Statut** : ✅ Accepté  
**Décideurs** : Thomas  
**Tags** : `scraping`, `i18n`, `normalization`, `dictionary`, `architecture`

---

## Contexte

### Problème Observé

L'analyse des `unknown_terms` révèle un problème majeur :

| Source | Termes Inconnus | Exemples |
|--------|-----------------|----------|
| thefabricsales.com (EN) | ~600 | `blue`, `red`, `cotton`, `wool`, `solid` |
| my_little_coupon (FR) | ~20 | `7A1`, `Rising Red` |

**Constat** : Des termes anglais basiques (`blue`, `cotton`, `wool`) sont marqués comme "unknown" car :
1. Le dictionnaire contient principalement des termes FR → EN
2. Le scraper TFS (source anglaise) n'a pas de `sourceLocale` configuré
3. La normalisation cherche ces termes EN dans un dictionnaire FR

### Architecture Actuelle

```
Scraper TFS (EN source)
    ↓
Extract "blue", "cotton"
    ↓
Lookup in dictionary (FR entries only)
    ↓
Not found → Log as unknown
    ↓
❌ 600+ false unknowns
```

### Architecture Cible

```
Scraper TFS (sourceLocale: 'en')
    ↓
Extract "blue", "cotton"
    ↓
Lookup in dictionary WHERE source_locale = 'en'
    ↓
Found! "blue" → "blue", "cotton" → "cotton"
    ↓
✅ Passthrough EN → EN
```

---

## Décision

**Ajouter `sourceLocale` obligatoire à chaque configuration de site scraper et structurer les dictionnaires par langue source.**

### 1. Configuration Site avec sourceLocale

```typescript
interface SiteConfig {
  id: string;
  name: string;
  domain: string;
  sourceLocale: SourceLocale;  // ← OBLIGATOIRE
  platform: 'shopify' | 'custom' | 'woocommerce';
  // ...
}

type SourceLocale = 'fr' | 'en' | 'es' | 'it' | 'de';
```

**Exemples** :
```typescript
const sites: SiteConfig[] = [
  {
    id: 'mlc',
    name: 'My Little Coupon',
    domain: 'mylittlecoupon.fr',
    sourceLocale: 'fr',       // Source française
    platform: 'shopify'
  },
  {
    id: 'tfs',
    name: 'The Fabric Sales',
    domain: 'thefabricsales.com',
    sourceLocale: 'en',       // Source anglaise
    platform: 'shopify'
  },
  {
    id: 'recovo',
    name: 'Recovo',
    domain: 'recovo.co',
    sourceLocale: 'es',       // Source espagnole
    platform: 'custom'
  }
];
```

### 2. Structure Dictionnaire par Langue

**Table `dictionary_mappings`** (existante, rappel) :
```sql
CREATE TABLE dictionary_mappings (
  id UUID PRIMARY KEY,
  source_term TEXT NOT NULL,           -- "coton", "blue", "seda"
  source_locale TEXT NOT NULL,         -- "fr", "en", "es"
  translations JSONB NOT NULL,         -- {"en": "cotton", "fr": "coton"}
  category_id UUID REFERENCES attribute_categories(id),
  -- ...
  UNIQUE(source_term, source_locale, category_id)
);
```

**Organisation Logique** :

```
Dictionnaire FR (source_locale = 'fr')
├── "coton" → {"en": "cotton", "fr": "coton"}
├── "soie" → {"en": "silk", "fr": "soie"}
├── "bleu" → {"en": "blue", "fr": "bleu"}
└── "rouge" → {"en": "red", "fr": "rouge"}

Dictionnaire EN (source_locale = 'en')
├── "cotton" → {"en": "cotton"}        # Passthrough
├── "silk" → {"en": "silk"}
├── "blue" → {"en": "blue"}
├── "navy blue" → {"en": "navy blue"}
└── "wool blend" → {"en": "wool blend"}

Dictionnaire ES (source_locale = 'es')
├── "algodón" → {"en": "cotton", "es": "algodón"}
├── "seda" → {"en": "silk", "es": "seda"}
└── "azul" → {"en": "blue", "es": "azul"}

Dictionnaire IT (source_locale = 'it')
├── "cotone" → {"en": "cotton", "it": "cotone"}
├── "seta" → {"en": "silk", "it": "seta"}
└── "blu" → {"en": "blue", "it": "blu"}
```

### 3. Flow de Normalisation

```
┌─────────────────────────────────────────────────────────────┐
│ Scraping The Fabric Sales (sourceLocale: 'en')              │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Extract Terms: "blue", "wool blend", "floral"               │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Normalize avec sourceLocale = 'en'                          │
│                                                             │
│ SELECT * FROM dictionary_mappings                           │
│ WHERE source_term = 'blue'                                  │
│   AND source_locale = 'en'                                  │
│   AND category_id = (color category)                        │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Result: translations->>'en' = 'blue'                        │
│ (Passthrough EN → EN)                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Implémentation

### 1. Migration Base de Données

Ajouter `source_locale` à la table `sites` :

```sql
-- Migration: Add source_locale to sites
ALTER TABLE deadstock.sites 
ADD COLUMN source_locale TEXT NOT NULL DEFAULT 'fr';

-- Add constraint
ALTER TABLE deadstock.sites
ADD CONSTRAINT sites_source_locale_check 
CHECK (source_locale IN ('fr', 'en', 'es', 'it', 'de'));

-- Update existing sites
UPDATE deadstock.sites SET source_locale = 'fr' WHERE domain LIKE '%.fr';
UPDATE deadstock.sites SET source_locale = 'en' WHERE domain LIKE '%.com';

-- Index for queries
CREATE INDEX idx_sites_locale ON deadstock.sites(source_locale);
```

### 2. Seed Dictionnaire EN

Script pour ajouter les termes EN de base :

```sql
-- ============================================
-- SEED: English Dictionary (Passthrough EN→EN)
-- ============================================

-- Get category IDs
WITH categories AS (
  SELECT id, slug FROM deadstock.attribute_categories
)

-- Colors EN
INSERT INTO deadstock.dictionary_mappings 
  (source_term, source_locale, translations, category_id, source, confidence)
SELECT 
  term,
  'en',
  jsonb_build_object('en', term),
  (SELECT id FROM categories WHERE slug = 'color'),
  'seed',
  1.0
FROM unnest(ARRAY[
  'red', 'blue', 'green', 'black', 'white', 'grey', 'gray',
  'pink', 'purple', 'brown', 'beige', 'navy', 'navy blue',
  'khaki', 'burgundy', 'yellow', 'orange', 'taupe', 'lilac',
  'cream', 'ivory', 'vanilla', 'camel', 'cognac', 'rust',
  'teal', 'aqua', 'mint', 'forest green', 'lime', 'coral',
  'salmon', 'peach', 'gold', 'silver', 'bronze', 'copper',
  'multicolor', 'multicolour', 'off white', 'off-white'
]) AS term
ON CONFLICT (source_term, source_locale, category_id) DO NOTHING;

-- Fibers EN
INSERT INTO deadstock.dictionary_mappings 
  (source_term, source_locale, translations, category_id, source, confidence)
SELECT 
  term,
  'en',
  jsonb_build_object('en', term),
  (SELECT id FROM categories WHERE slug = 'fiber'),
  'seed',
  1.0
FROM unnest(ARRAY[
  'cotton', 'silk', 'wool', 'linen', 'polyester', 'viscose',
  'nylon', 'cashmere', 'acetate', 'rayon', 'modal', 'tencel',
  'lyocell', 'hemp', 'bamboo', 'alpaca', 'mohair', 'angora',
  'cupro', 'elastane', 'spandex', 'lycra', 'acrylic',
  'wool blend', 'cotton blend', 'silk blend', 'linen blend',
  'virgin wool', 'merino wool', 'organic cotton', 'recycled polyester',
  'polyamide', 'polycotton'
]) AS term
ON CONFLICT (source_term, source_locale, category_id) DO NOTHING;

-- Patterns EN
INSERT INTO deadstock.dictionary_mappings 
  (source_term, source_locale, translations, category_id, source, confidence)
SELECT 
  term,
  'en',
  jsonb_build_object('en', term),
  (SELECT id FROM categories WHERE slug = 'pattern'),
  'seed',
  1.0
FROM unnest(ARRAY[
  'solid', 'striped', 'stripes', 'floral', 'abstract', 'geometric',
  'checks', 'checkered', 'plaid', 'tartan', 'houndstooth',
  'paisley', 'polka dots', 'dots', 'animal', 'leopard', 'zebra',
  'camouflage', 'tie-dye', 'ombre', 'gradient', 'printed',
  'embroidered', 'jacquard', 'brocade', 'damask', 'toile',
  'gingham', 'herringbone', 'chevron', 'ikat', 'batik',
  'prince of wales', 'monogram', 'cable knit', 'textured',
  'bouclé', 'boucle', 'sequin', 'stars', 'leaves', 'zigzag'
]) AS term
ON CONFLICT (source_term, source_locale, category_id) DO NOTHING;

-- Weaves EN
INSERT INTO deadstock.dictionary_mappings 
  (source_term, source_locale, translations, category_id, source, confidence)
SELECT 
  term,
  'en',
  jsonb_build_object('en', term),
  (SELECT id FROM categories WHERE slug = 'weave'),
  'seed',
  1.0
FROM unnest(ARRAY[
  'plain', 'twill', 'satin', 'sateen', 'jersey', 'knit',
  'woven', 'dobby', 'jacquard', 'crepe', 'chiffon', 'organza',
  'voile', 'tulle', 'velvet', 'corduroy', 'denim', 'canvas',
  'poplin', 'oxford', 'flannel', 'fleece', 'terry', 'mesh',
  'lace', 'crochet', 'tricot', 'interlock', 'rib', 'piqué',
  'double face', 'double-face', 'gabardine', 'suede', 'suède'
]) AS term
ON CONFLICT (source_term, source_locale, category_id) DO NOTHING;
```

### 3. Modification du Scraping Service

```typescript
// src/features/admin/services/scrapingService.ts

interface ScrapingContext {
  site: Site;
  profile: SiteProfile;
  sourceLocale: SourceLocale;  // ← Ajouté
}

async function scrapeProducts(context: ScrapingContext): Promise<ScrapingResult> {
  const { site, profile, sourceLocale } = context;
  
  // ... fetch products ...
  
  for (const product of products) {
    // Extract terms
    const extracted = await smartParse(product, profile.extractionRules);
    
    // Normalize avec sourceLocale
    const normalized = await normalizeTextile({
      extracted,
      sourceLocale,  // ← Passé à la normalisation
      targetLocale: 'en'  // Toujours EN en base
    });
    
    // Save textile
    await textileRepo.upsert({
      ...normalized,
      source_locale: sourceLocale,  // ← Stocké pour référence
      // ...
    });
  }
}
```

### 4. Modification du Normalization Service

```typescript
// src/features/normalization/infrastructure/normalizationService.ts

interface NormalizeOptions {
  term: string;
  category: string;
  sourceLocale: SourceLocale;  // ← Obligatoire
  targetLocale?: TargetLocale; // Default 'en'
}

async function normalizeTerm(options: NormalizeOptions): Promise<NormalizeResult> {
  const { term, category, sourceLocale, targetLocale = 'en' } = options;
  
  // 1. Lookup in dictionary for THIS source locale
  const mapping = await dictionaryCache.get(term, sourceLocale, category);
  
  if (mapping) {
    // Found! Return translation
    const translated = mapping.translations[targetLocale] || mapping.translations['en'];
    await incrementUsage(mapping.id);
    
    return {
      found: true,
      original: term,
      normalized: translated,
      sourceLocale,
      confidence: mapping.confidence
    };
  }
  
  // 2. Not found → Log as unknown WITH sourceLocale
  await unknownsRepo.logOrIncrement({
    term,
    category,
    sourceLocale,  // ← Important pour le tuning
    sourcePlatform: context.site.domain
  });
  
  return {
    found: false,
    original: term,
    normalized: null,
    sourceLocale,
    needsReview: true
  };
}
```

### 5. Modification du Dictionary Cache

```typescript
// src/features/normalization/infrastructure/dictionaryCache.ts

class DictionaryCache {
  // Cache par locale
  private cache: Map<SourceLocale, Map<string, DictionaryMapping>> = new Map();
  
  async initialize() {
    // Charger tous les mappings groupés par locale
    const mappings = await supabase
      .from('dictionary_mappings')
      .select('*')
      .order('source_locale');
    
    for (const mapping of mappings.data) {
      const localeCache = this.cache.get(mapping.source_locale) || new Map();
      const key = `${mapping.source_term}:${mapping.category_id}`;
      localeCache.set(key, mapping);
      this.cache.set(mapping.source_locale, localeCache);
    }
  }
  
  get(term: string, sourceLocale: SourceLocale, categoryId: string): DictionaryMapping | null {
    const localeCache = this.cache.get(sourceLocale);
    if (!localeCache) return null;
    
    const key = `${term.toLowerCase()}:${categoryId}`;
    return localeCache.get(key) || null;
  }
  
  invalidate(sourceLocale?: SourceLocale) {
    if (sourceLocale) {
      this.cache.delete(sourceLocale);
    } else {
      this.cache.clear();
    }
  }
}
```

### 6. UI Admin - Configuration Site

```tsx
// src/app/admin/sites/[id]/configure/page.tsx

function SiteConfigForm({ site }: { site: Site }) {
  return (
    <form>
      {/* ... autres champs ... */}
      
      <FormField
        name="sourceLocale"
        label="Langue Source"
        description="Langue des données sur ce site (pour la normalisation)"
      >
        <Select
          value={site.sourceLocale}
          options={[
            { value: 'fr', label: '🇫🇷 Français' },
            { value: 'en', label: '🇬🇧 English' },
            { value: 'es', label: '🇪🇸 Español' },
            { value: 'it', label: '🇮🇹 Italiano' },
            { value: 'de', label: '🇩🇪 Deutsch' },
          ]}
        />
      </FormField>
      
      {/* ... */}
    </form>
  );
}
```

---

## Conséquences

### Positives ✅

1. **Réduction Massive des Unknowns**
   - Avant : ~600 unknowns pour TFS (EN)
   - Après : ~50 unknowns (vrais nouveaux termes)

2. **Dictionnaires Propres par Langue**
   - FR : termes français → EN
   - EN : termes anglais → EN (passthrough)
   - ES/IT/DE : ready pour futures sources

3. **Tuning Ciblé**
   - Admin voit unknowns par locale
   - Peut filtrer : "Montrer unknowns EN uniquement"
   - Approvals créent mappings dans la bonne locale

4. **Scalabilité Multi-Source**
   - Ajouter source IT = configurer `sourceLocale: 'it'`
   - Seeder dictionnaire IT
   - Scraping fonctionne automatiquement

5. **Traçabilité**
   - Chaque textile a `source_locale` stocké
   - Permet analytics par langue
   - Debug facilité

### Négatives ❌ (et Mitigations)

1. **Migration Initiale**
   - **Impact** : Seed dictionnaire EN (~150 termes)
   - **Mitigation** : Script SQL fourni, 5 min à exécuter

2. **Cache Plus Complexe**
   - **Impact** : Cache par locale vs cache global
   - **Mitigation** : Architecture Map<locale, Map<term, mapping>> claire

3. **Bulk Approve à Adapter**
   - **Impact** : Les unknowns EN existants doivent être retraités
   - **Mitigation** : Script de nettoyage fourni

---

## Actions Immédiates

### Étape 1 : Migration DB (10 min)
```sql
-- Ajouter source_locale à sites
ALTER TABLE deadstock.sites 
ADD COLUMN IF NOT EXISTS source_locale TEXT NOT NULL DEFAULT 'fr';

-- Mettre à jour TFS
UPDATE deadstock.sites 
SET source_locale = 'en' 
WHERE domain = 'thefabricsales.com';
```

### Étape 2 : Seed Dictionnaire EN (5 min)
- Exécuter le script SQL du seed ci-dessus

### Étape 3 : Nettoyer Unknowns EN (10 min)
```sql
-- Supprimer les unknowns EN qui sont maintenant dans le dictionnaire
DELETE FROM deadstock.unknown_terms ut
WHERE ut.source_platform = 'thefabricsales.com'
  AND EXISTS (
    SELECT 1 FROM deadstock.dictionary_mappings dm
    WHERE dm.source_term = ut.term
      AND dm.source_locale = 'en'
      AND dm.category_id = (
        SELECT id FROM deadstock.attribute_categories 
        WHERE slug = ut.category
      )
  );
```

### Étape 4 : Ajouter Stopwords (5 min)
```sql
-- Marquer les faux positifs comme rejected
UPDATE deadstock.unknown_terms
SET status = 'rejected', review_notes = 'Stopword - not a textile attribute'
WHERE term IN ('fabric', 'colour', 'color', 'pattern', 'solid', 'or');
```

### Étape 5 : Modifier Code (30 min)
- Adapter `scrapingService.ts`
- Adapter `normalizationService.ts`
- Adapter `dictionaryCache.ts`

---

## Métriques de Succès

| Métrique | Avant | Après | Cible |
|----------|-------|-------|-------|
| Unknowns TFS | ~600 | <50 | <30 |
| Unknowns MLC | ~20 | ~20 | <15 |
| Couverture dict EN | 0% | 90% | 95% |
| Couverture dict FR | 85% | 85% | 90% |
| Temps normalization | 50ms | 50ms | <100ms |

---

## Références

- **ADR-002** : Normalisation en anglais + i18n layer
- **ADR-004** : Système de tuning hybrid (dict + LLM)
- **ADR-007** : Adapter pattern pour scrapers
- **ADR-009** : Stratégie d'internationalisation
- **DATABASE_ARCHITECTURE.md** : Schema dictionary_mappings

---

## Historique

| Date | Changement | Auteur |
|------|-----------|--------|
| 2026-01-05 | Création ADR suite analyse unknowns TFS | Thomas |

---

**Statut Final** : ✅ **ACCEPTÉ**  
**Impact** : Architecture normalisation multi-locale  
**Prochaine Action** : Exécuter migration + seed dictionnaire EN
