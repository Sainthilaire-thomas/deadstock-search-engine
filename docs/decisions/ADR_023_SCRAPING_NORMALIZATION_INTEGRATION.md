# ADR-021 : Intégration de la Normalisation dans le Pipeline de Scraping

## Statut
**Accepté** - Implémenté le 06/01/2026

## Contexte

Le système de scraping (`scrapingService.ts`) sauvegardait les données brutes des produits sans passer par le système de normalisation. Cela causait plusieurs problèmes :

1. **Données non normalisées** : Les champs `material_type`, `color`, `pattern` restaient vides
2. **Doublon de code** : `scrapingService.ts` avait sa propre méthode `saveProductsToDatabase()` qui bypassait `scrapingRepo.saveProducts()` qui, lui, intégrait la normalisation
3. **Pas de support multi-locale** : Les sources anglaises (The Fabric Sales) généraient ~600 termes "unknown" car le dictionnaire ne contenait que des mappings français

### Architecture avant modification

```
scrapingService.ts                    scrapingRepo.ts (NON UTILISÉ)
       │                                     │
       ▼                                     ▼
saveProductsToDatabase()              saveProducts()
       │                                     │
       ▼                                     ▼
  Sauvegarde brute                    extractTermsFromShopify()
  (material_original only)                   │
                                             ▼
                                      normalizeTextile()
                                             │
                                             ▼
                                      Sauvegarde normalisée
                                      (material_type, color, pattern)
```

## Décision

### 1. Unifier le flux de sauvegarde

`scrapingService.ts` utilise maintenant `scrapingRepo.saveProducts()` au lieu de sa propre méthode, garantissant que **tous les produits passent par la normalisation**.

### 2. Propager `sourceLocale` de bout en bout

Le flux complet passe maintenant la locale du site :

```
sites.source_locale (DB)
       │
       ▼
actions.ts → triggerFullScraping()
       │
       ▼ { ...config, sourceLocale: site.source_locale }
       │
scrapingService.ts → scrapeSite()
       │
       ▼ scrapingRepo.saveProducts(..., sourceLocale)
       │
scrapingRepo.ts
       │
       ▼ extractTermsFromShopify(product, sourceLocale)
       │
extractTerms.ts
       │
       ▼ { ...extractedTerms, sourceLocale }
       │
normalizeTextile.ts
       │
       ▼ normalizationService.normalize(term, sourceLocale)
       │
normalizationService.ts
       │
       ▼ SELECT FROM dictionary_mappings WHERE source_locale = ?
```

### 3. Paramètre `forceLocale` dans l'extraction

`extractTermsFromShopify()` accepte maintenant un paramètre optionnel `forceLocale` qui override la détection automatique :

```typescript
export function extractTermsFromShopify(
  product: { title: string; body_html: string; tags: string | string[] },
  forceLocale?: Locale  // Nouveau paramètre
): ExtractedTerms
```

## Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `src/features/admin/utils/extractTerms.ts` | Ajout paramètre `forceLocale` optionnel |
| `src/features/admin/infrastructure/scrapingRepo.ts` | Ajout paramètre `sourceLocale`, import `Locale` |
| `src/features/admin/services/scrapingService.ts` | Import `scrapingRepo`, utilise `scrapingRepo.saveProducts()`, ajout `sourceLocale` dans `ScrapingConfig` et `DEFAULT_CONFIG` |
| `src/features/admin/application/actions.ts` | Passe `site.source_locale` au scraping, default `'fr'` pour nouveaux sites |
| `src/features/admin/components/SiteAnalysisCard.tsx` | Fix bug `deadstockScore` undefined (non lié mais découvert) |

## Conséquences

### Positives

1. **Normalisation automatique** : Tous les produits scrapés sont normalisés
2. **Support multi-locale** : Sources EN/FR/ES/IT/DE correctement traitées
3. **Traçabilité** : `material_original` + `material_type` permettent de voir avant/après
4. **Réduction des unknowns** : De ~600 à ~0 pour TFS grâce au dictionnaire EN
5. **Code unifié** : Une seule méthode de sauvegarde avec normalisation

### Négatives

1. **Dépendance au dictionnaire** : Les termes non présents génèrent des unknowns
2. **Performance** : Lookup dictionnaire pour chaque produit (mitigé par le cache)

## Métriques de validation

Test sur The Fabric Sales (10 produits) :

```
✅ Scraping Complete!
   Duration: 2s
   Products: 10 valid, 0 skipped, 10 saved
   Quality: 100%
   Normalization coverage: 100%

Exemples de normalisation :
- "virgin wool" → "wool"
- "grey" → "gray" (standardisation orthographe US)
- "polyester" → "polyester" (passthrough EN)
```

## Architecture du système d'extraction (actuelle vs future)

### Architecture actuelle (Option A)

```
┌─────────────────────────────────────────────────────────────┐
│                     EXTRACTION                               │
│  Keywords hardcodés dans extractTerms.ts                    │
│  - Détection des termes textiles dans les tags              │
│  - Listes par langue (fr, en, es, it, de)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   NORMALISATION                              │
│  Dictionnaire Supabase (dictionary_mappings)                │
│  - Traduction/standardisation des termes extraits           │
│  - Lookup par source_locale + category                      │
└─────────────────────────────────────────────────────────────┘
```

**Inconvénient** : Double maintenance (keywords hardcodés + dictionnaire DB)

### Architecture future (Option B) - À implémenter

```
┌─────────────────────────────────────────────────────────────┐
│                 DISCOVERY + ADMIN UI                         │
│  Analyse des tags du site → Classification par l'admin      │
│  Stockage dans site_extraction_rules                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              EXTRACTION DYNAMIQUE                            │
│  Charge les règles depuis DB au lieu de keywords hardcodés  │
│  Une seule source de vérité                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   NORMALISATION                              │
│  (Inchangé - dictionnaire Supabase)                         │
└─────────────────────────────────────────────────────────────┘
```

### Table proposée pour Option B

```sql
CREATE TABLE deadstock.site_extraction_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id),
  tag_pattern TEXT NOT NULL,        -- "wool", "3M", regex possible
  category TEXT NOT NULL,           -- 'fiber', 'color', 'pattern', 'length', 'stopword'
  action TEXT DEFAULT 'extract',    -- 'extract', 'ignore'
  priority INT DEFAULT 0,           -- Pour résoudre conflits
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(site_id, tag_pattern)
);
```

**Avantages** :
- Keywords gérés via interface admin
- Spécifiques par site
- Pas de déploiement requis pour nouveaux termes
- Support dimensions (3M, laize 150cm) facilité

## Relations avec autres ADRs

- **ADR-020** : Source Locale - Architecture multi-locale du dictionnaire
- **ADR-004** : Normalization Tuning System - Système de tuning admin
- **ADR-007** : Adapter Pattern Scrapers - Pattern d'adaptation par source

## Tests de non-régression

```bash
# Vérifier que les textiles ont des données normalisées
SELECT 
  COUNT(*) as total,
  COUNT(material_type) as with_material,
  COUNT(color) as with_color,
  COUNT(pattern) as with_pattern
FROM deadstock.textiles
WHERE source_platform LIKE '%thefabricsales%';
```

Résultat attendu : `with_material`, `with_color`, `with_pattern` > 0
