
# NEXT_STEPS.md - Prochaines Étapes

**Dernière mise à jour** : 5 janvier 2026

**Prochaine session** : 17

---

## Session 17 : Admin Module Complet

### Objectif Principal

Résoudre le problème des unknowns EN et améliorer le pipeline de normalisation.

---

## Étape 1 : Exécuter ADR-020 (30 min) 🔴 CRITIQUE

### 1.1 Migration Base de Données

```sql
-- Ajouter source_locale à la table sites
ALTER TABLE deadstock.sites 
ADD COLUMN IF NOT EXISTS source_locale TEXT NOT NULL DEFAULT 'fr';

-- Contrainte de validation
ALTER TABLE deadstock.sites
ADD CONSTRAINT sites_source_locale_check 
CHECK (source_locale IN ('fr', 'en', 'es', 'it', 'de'));

-- Mettre à jour The Fabric Sales
UPDATE deadstock.sites 
SET source_locale = 'en' 
WHERE domain = 'thefabricsales.com';

-- Index
CREATE INDEX IF NOT EXISTS idx_sites_locale ON deadstock.sites(source_locale);
```

### 1.2 Seed Dictionnaire EN

```sql
-- Script complet dans ADR-020
-- ~150 termes : colors, fibers, patterns, weaves
-- Passthrough EN → EN
```

### 1.3 Cleanup Unknowns EN

```sql
-- Supprimer unknowns maintenant couverts
DELETE FROM deadstock.unknown_terms ut
WHERE ut.source_platform = 'thefabricsales.com'
  AND EXISTS (
    SELECT 1 FROM deadstock.dictionary_mappings dm
    WHERE dm.source_term = ut.term
      AND dm.source_locale = 'en'
  );

-- Marquer stopwords comme rejected
UPDATE deadstock.unknown_terms
SET status = 'rejected', review_notes = 'Stopword'
WHERE term IN ('fabric', 'colour', 'color', 'pattern', 'or');
```

### 1.4 Vérification

```sql
-- Compter unknowns restants
SELECT source_platform, COUNT(*) 
FROM deadstock.unknown_terms 
WHERE status = 'pending' 
GROUP BY source_platform;

-- Devrait montrer TFS < 100 (vs ~600 avant)
```

---

## Étape 2 : Extraction Dimensions (2h) 🔴 HIGH

### 2.1 Patterns à Détecter

**Longueur (dans tags principalement) :**

```typescript
const LENGTH_PATTERNS = [
  /(\d+(?:[.,]\d+)?)\s*[mM](?:ètres?)?/,     // "3M", "3m", "3 mètres"
  /(\d+(?:[.,]\d+)?)\s*(?:meter|metre)s?/i,   // "3 meters"
  /coupon\s*(\d+(?:[.,]\d+)?)\s*[mM]/i,       // "coupon 2.5m"
  /length[:\s]*(\d+(?:[.,]\d+)?)\s*(?:cm|m)/i // "Length: 150cm"
];
```

**Largeur (dans body_html, title) :**

```typescript
const WIDTH_PATTERNS = [
  /laize[:\s]*(\d+(?:[.,]\d+)?)\s*cm/i,       // "Laize: 150cm"
  /width[:\s]*(\d+(?:[.,]\d+)?)\s*cm/i,       // "Width: 140cm"
  /largeur[:\s]*(\d+(?:[.,]\d+)?)\s*cm/i,     // "Largeur: 145cm"
  /(\d{2,3})\s*cm\s*(?:de\s+)?(?:large|width)/i // "150cm de large"
];
```

### 2.2 Modifier scrapingService.ts

```typescript
// Ajouter extraction dimensions
function extractDimensions(product: ShopifyProduct): Dimensions {
  const allText = `${product.title} ${product.body_html} ${product.tags.join(' ')}`;
  
  return {
    length_value: extractLength(allText, product.tags),
    length_unit: 'm',
    width_value: extractWidth(allText),
    width_unit: 'cm'
  };
}
```

### 2.3 Stocker dans textiles

```sql
-- Colonnes existantes à utiliser
quantity_value DECIMAL,  -- Longueur
quantity_unit TEXT,      -- 'm' ou 'cm'
width_cm DECIMAL         -- Largeur en cm
```

---

## Étape 3 : Dashboard Qualité (1h) 🟡 MEDIUM

### 3.1 Créer la Page

```
src/app/admin/quality/page.tsx
```

### 3.2 Métriques à Afficher

```typescript
interface QualityMetrics {
  global: {
    totalTextiles: number;
    withMaterial: number;    // %
    withColor: number;       // %
    withPattern: number;     // %
    withLength: number;      // %
    withWidth: number;       // %
  };
  bySource: {
    [sourcePlatform: string]: {
      total: number;
      metrics: SameAsGlobal;
      alerts: string[];      // "0% width extracted"
    };
  };
  unknowns: {
    pendingTotal: number;
    byCategory: Record<string, number>;
    weeklyProgress: number;  // Traités cette semaine
  };
}
```

### 3.3 UI Mockup

```
┌─────────────────────────────────────────────────────┐
│ 📊 Data Quality Dashboard                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Global Coverage                                    │
│  ┌───────────────────────────────────────────────┐ │
│  │ Material  ████████████████░░░░  80%           │ │
│  │ Color     ███████████░░░░░░░░░  55%           │ │
│  │ Pattern   ████████░░░░░░░░░░░░  40%           │ │
│  │ Length    ███░░░░░░░░░░░░░░░░░  15%    ⚠️     │ │
│  │ Width     ░░░░░░░░░░░░░░░░░░░░   0%    🔴     │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ⚠️ Alerts                                         │
│  • TFS: Width not extracted (pattern detected)     │
│  • MLC: 20 new unknowns this week                  │
│                                                     │
│  By Source                        [View Details]   │
│  ┌──────────────┬───────┬────────┬──────────────┐ │
│  │ Source       │ Total │ Quality│ Actions      │ │
│  ├──────────────┼───────┼────────┼──────────────┤ │
│  │ MLC          │ 1,245 │  72%   │ [Configure]  │ │
│  │ TFS          │   892 │  45%   │ [Configure]  │ │
│  └──────────────┴───────┴────────┴──────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Étape 4 : Modifier Code Normalisation (30 min)

### 4.1 scrapingService.ts

```typescript
// Passer sourceLocale à la normalisation
const normalized = await normalizeTextile({
  extracted,
  sourceLocale: site.source_locale,  // ← Nouveau
  targetLocale: 'en'
});
```

### 4.2 normalizationService.ts

```typescript
// Filtrer par sourceLocale
const mapping = await dictionaryCache.get(
  term,
  sourceLocale,  // ← Nouveau paramètre
  categoryId
);
```

### 4.3 dictionaryCache.ts

```typescript
// Cache par locale
private cache: Map<SourceLocale, Map<string, DictionaryMapping>>;

get(term: string, locale: SourceLocale, categoryId: string) {
  return this.cache.get(locale)?.get(`${term}:${categoryId}`);
}
```

---

## Étape 5 : Test Pipeline (30 min)

### 5.1 Re-scraper TFS

```typescript
// Via admin UI ou script
await scrapeSite('tfs', { limit: 50, dryRun: false });
```

### 5.2 Vérifier Résultats

```sql
-- Nouveaux unknowns ?
SELECT * FROM unknown_terms 
WHERE source_platform = 'thefabricsales.com' 
  AND created_at > NOW() - INTERVAL '1 hour';

-- Textiles avec dimensions ?
SELECT COUNT(*) as with_width 
FROM textiles 
WHERE width_cm IS NOT NULL;
```

---

## Checklist Session 17

* [ ] Migration source_locale sur sites
* [ ] Seed dictionnaire EN (~150 termes)
* [ ] Cleanup unknowns EN existants
* [ ] Ajouter stopwords
* [ ] Patterns extraction longueur
* [ ] Patterns extraction largeur
* [ ] Modifier scrapingService
* [ ] Dashboard qualité basique
* [ ] Test re-scrape TFS
* [ ] Vérifier réduction unknowns

---

## Sessions Futures

### Session 18 : Enhanced Tuning UI

* Filtres avancés (source, catégorie, date)
* Batch processing (select all, approve batch)
* LLM suggestions affichées

### Session 19 : Dictionary Browser

* Browse/Search tous les mappings
* Add/Edit/Delete manuel
* Import/Export CSV

### Session 20 : LLM Suggestions

* API Claude pour suggestions
* Afficher avec confidence
* Approve avec 1 clic

---

## Ressources

### Fichiers Clés à Modifier

```
src/features/admin/services/scrapingService.ts
src/features/normalization/infrastructure/normalizationService.ts
src/features/normalization/infrastructure/dictionaryCache.ts
src/app/admin/quality/page.tsx (à créer)
database/migrations/XXX_source_locale.sql (à créer)
```

### Documents de Référence

```
/mnt/project/ADR_020_SCRAPER_SOURCE_LOCALE.md
/mnt/project/SPEC_ADMIN_DATA_TUNING_COMPLETE.md
/mnt/project/DATABASE_ARCHITECTURE.md
```
