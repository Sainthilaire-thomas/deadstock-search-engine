# Session 20 - Variant Analysis & Nona Source Fix

**Date** : 9 Janvier 2026  
**Durée** : ~2 heures  
**Focus** : Correction bug critique Nona Source + Architecture clarification

---

## 🎯 Objectifs de la Session

1. ✅ Investiguer pourquoi 79% des textiles Nona Source étaient marqués `unavailable`
2. ✅ Corriger les données existantes
3. ✅ Modifier le scraper pour éviter le bug à l'avenir
4. ✅ Documenter l'écart entre vision et implémentation admin

---

## 🔍 Analyse du Problème

### Symptôme
Après migration 025 (ajout `sale_type`), 79 textiles Nona Source sur 100 marqués `available = false`.

### Cause Racine
Le scraper prenait **uniquement le premier variant** pour déterminer :
- `available` = `product.variants[0].available`
- `price_value` = `product.variants[0].price`
- `quantity_value` = `1` (défaut)

Or chez Nona Source :
- Les produits ont 50-100 variants (différentes couleurs/longueurs)
- Le premier variant peut être épuisé alors que d'autres sont disponibles
- La longueur est dans `variant.option2` (ex: "10" pour 10m)
- Certains produits ont une option "Cutting" dans `option3`

### Structure Variants Nona Source
```
option1 = Color ("Black", "Porcelain Rose")
option2 = Length in meters ("1", "5", "10")
option3 = Lot reference ("T24A.001") OR "Cutting"
```

---

## 🛠️ Solutions Implémentées

### 1. Migration SQL 026
**Fichier** : `026_fix_nona_source_variants.sql`

- Ajout colonne `sale_type` sur `textiles`
- Création fonction `analyze_nona_variants(raw_data JSONB)` 
- Mise à jour des 100 textiles Nona Source depuis leur `raw_data`
- Calcul intelligent de `available`, `sale_type`, `price_per_meter`, `quantity_value`

**Résultat** :
| Avant | Après |
|-------|-------|
| 79% unavailable | 0% unavailable |
| sale_type = null | 92 fixed_length, 8 hybrid |
| price_per_meter = null | 7€ - 23€ |
| quantity_value = 1 | 35m - 101m |

### 2. ADR-025 Admin Architecture Clarification
**Fichier** : `ADR_025_ADMIN_ARCHITECTURE_CLARIFICATION.md`

Document l'écart entre :
- **Vision** : Discovery analyse structure → Admin configure règles → Scraping applique
- **Implémenté** : Discovery basique, Scraping sans analyse variants

Définit le plan de correction en 3 phases.

### 3. Variant Analyzer
**Fichier** : `src/features/admin/utils/variantAnalyzer.ts`

Nouveau module qui analyse tous les variants d'un produit Shopify :

```typescript
interface VariantAnalysis {
  available: boolean;           // any variant available
  saleType: SaleType;           // fixed_length | hybrid | cut_to_order
  hasCuttingOption: boolean;    // option3 = "Cutting"
  pricePerMeter: number | null; // calculated
  maxLength: number | null;     // from option2
  bestVariant: ShopifyVariant;  // for display
}
```

### 4. Modification scrapingRepo.ts
Intégration de `analyzeVariants()` dans le pipeline de sauvegarde :

```typescript
// STEP 4: Analyze variants (NEW - ADR-025)
const variantAnalysis = analyzeVariants(product);

const textileData = {
  available: variantAnalysis.available,  // ← FIXED
  sale_type: variantAnalysis.saleType,
  price_per_meter: variantAnalysis.pricePerMeter,
  quantity_value: variantAnalysis.maxLength || ...,
  // ...
};
```

### 5. Types ShopifyVariant enrichis
Ajout `option1`, `option2`, `option3` à l'interface `ShopifyVariant`.

---

## 📊 Résultats

### Test Scraping 10 Produits
```
✅ Scraping Complete!
   Duration: 4s
   Products: 10 valid, 0 skipped, 10 saved
   Quality: 100%
   Errors: 0
```

Logs montrent :
```
🔍 Variants: 12/73 available, type=fixed_length
💰 Price/m: 12€
📏 Max length: 34m
```

### Données Finales Nona Source
| Métrique | Valeur |
|----------|--------|
| Total textiles | 100 |
| Available | 100 (100%) |
| fixed_length | 92 |
| hybrid | 8 |
| Avg price/m (fixed) | 8.05€ |
| Avg price/m (hybrid) | 22.63€ |
| Avg quantity | 60.92m |

---

## 📁 Fichiers Créés/Modifiés

### Créés
| Fichier | Description |
|---------|-------------|
| `migrations/026_fix_nona_source_variants.sql` | Migration fix données |
| `ADR_025_ADMIN_ARCHITECTURE_CLARIFICATION.md` | Documentation écart |
| `src/features/admin/utils/variantAnalyzer.ts` | Analyseur variants |

### Modifiés
| Fichier | Modification |
|---------|--------------|
| `src/features/admin/infrastructure/scrapingRepo.ts` | Import + utilisation variantAnalyzer |
| `src/features/admin/services/scrapingService.ts` | Types ShopifyVariant enrichis |

---

## 💡 Insights & Décisions

### D1 : Sale Type comme colonne
Ajout `sale_type` sur `textiles` plutôt que calcul à la volée.
- Permet filtrage efficace
- Clarifie interprétation `quantity_value`

### D2 : Analyse au Scraping (pas Discovery)
L'analyse des variants se fait au moment du scraping, pas du discovery.
- Discovery = structure générale du site
- Scraping = données produit précises

### D3 : Price per meter calculé
- `hybrid` : prix du variant "Cutting" (déjà au mètre)
- `fixed_length` : prix / longueur du variant max
- `cut_to_order` : prix tel quel (déjà au mètre)

---

## ⚠️ Points d'Attention

1. **Autres sources** : TFS et MLC n'ont pas la même structure variants. Le code gère ça (fallback sur `by_piece`).

2. **Produits hybrid** : Affichage frontend à adapter (2 prix possibles).

3. **Documentation** : Occupe 22% du context window. Consolidation recommandée.

---

## 🚀 Prochaines Étapes

1. **Consolidation documentation** - Créer `PROJECT_CONTEXT_COMPACT.md`
2. **Interface Discovery avancée** - Toggle patterns, coverage preview
3. **Scraping scale** - Plus de produits Nona Source et MLC

---

## 📝 Notes pour Prochaine Session

### Recommandation Documentation
Ne plus charger systématiquement :
- ADR_001 à ADR_023 (historique)
- SESSION_7 à SESSION_19 (historique)
- SPEC_* volumineux (implémentés)

Créer un document consolidé `PROJECT_CONTEXT_COMPACT.md` (~20KB) avec l'essentiel.

### Fichiers à Commit
```
git add migrations/026_fix_nona_source_variants.sql
git add docs/decisions/ADR_025_ADMIN_ARCHITECTURE_CLARIFICATION.md
git add src/features/admin/utils/variantAnalyzer.ts
git add src/features/admin/infrastructure/scrapingRepo.ts
git add src/features/admin/services/scrapingService.ts
git commit -m "fix(scraping): variant analysis for Nona Source - ADR-025"
```

---

**Status** : ✅ Session complétée avec succès  
**Bug Nona Source** : ✅ Corrigé  
**MVP Progress** : 90% → 92%
