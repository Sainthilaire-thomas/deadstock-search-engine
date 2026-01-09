
# Current State - Deadstock Search Engine

**Dernière mise à jour** : 9 Janvier 2026

**Session** : 20

---

## État Global du Projet

| Métrique                  | Valeur                            |
| -------------------------- | --------------------------------- |
| **MVP Phase 1**      | ~92% complet                      |
| **Textiles en base** | 268                               |
| **Sources actives**  | 4 (MLC, TFS, Nona Source, Recovo) |
| **Unknowns pending** | 0                                 |

---

## Modules - État Détaillé

### ✅ Search Module (100%)

* Interface de recherche fonctionnelle
* Filtres dynamiques via `textiles_search` materialized view
* 2.8ms query performance
* Filtres: Fiber, Color, Pattern, Price range

### ✅ Favorites Module (100%)

* Sync instantanée avec optimistic updates
* React Context pour état global
* Support anonymous + authenticated users

### ✅ Boards Module (95%)

* Canvas drag-drop fonctionnel
* Éléments: textiles, notes, color palettes, zones
* Cristallisation zones → projets concrets

### ✅ Admin Module - Sites & Discovery (95%)

* Discovery automatique sites Shopify
* Deadstock Score calculation
* Extraction patterns detection
* Interface `/admin/discovery/[siteId]`

### ✅ Admin Module - Scraping (95%)

* Pipeline complet avec normalisation
* **NEW** : Variant analysis intelligent (ADR-025)
* **NEW** : `sale_type` detection (fixed_length, hybrid, cut_to_order)
* **NEW** : `price_per_meter` calculation
* **NEW** : `quantity_value` extraction depuis variants
* Dual-write: `textiles` + `textile_attributes`
* Materialized view refresh automatique

### ✅ Admin Module - Tuning (90%)

* Interface unknowns `/admin/tuning`
* Multi-locale dictionaries (FR/EN)
* Approve/Reject workflow

### ⏳ Admin Module - Discovery UI Avancée (30%)

* Patterns d'extraction affichés
* **TODO** : Toggle enable/disable patterns
* **TODO** : Coverage preview dashboard
* **TODO** : Test pattern live

---

## Base de Données

### Tables Principales

| Table                   | Rows | Status    |
| ----------------------- | ---- | --------- |
| `textiles`            | 268  | ✅ Active |
| `textile_attributes`  | ~500 | ✅ Active |
| `dictionary_mappings` | 256  | ✅ Active |
| `sites`               | 4    | ✅ Active |
| `site_profiles`       | 4    | ✅ Active |
| `favorites`           | ~20  | ✅ Active |
| `boards`              | ~5   | ✅ Active |

### Colonnes Récentes (Session 20)

* `textiles.sale_type` : 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece'
* `textiles.price_per_meter` : Calculated price per meter

### Materialized View

* `textiles_search` : Vue optimisée pour recherche, refresh après scraping

---

## Code - Fichiers Clés Modifiés (Session 20)

| Fichier                                               | Modification                                          |
| ----------------------------------------------------- | ----------------------------------------------------- |
| `src/features/admin/utils/variantAnalyzer.ts`       | **NEW**- Analyse intelligente variants Shopify  |
| `src/features/admin/infrastructure/scrapingRepo.ts` | Utilise variantAnalyzer pour available/price/quantity |
| `src/features/admin/services/scrapingService.ts`    | Types ShopifyVariant enrichis (option1/2/3)           |

---

## Bugs Corrigés (Session 20)

### Bug Critique: Nona Source 79% Unavailable

* **Cause** : Scraper prenait uniquement `variants[0]` pour `available` et `price`
* **Impact** : 79 textiles marqués unavailable à tort
* **Solution** : `variantAnalyzer.ts` analyse TOUS les variants
* **Status** : ✅ Corrigé - 100% available maintenant

---

## Performance

| Métrique                 | Valeur |
| ------------------------- | ------ |
| Search query              | 2.8ms  |
| Materialized view refresh | ~270ms |
| Scraping 10 products      | ~4s    |

---

## Prochaines Priorités

1. **Interface Discovery avancée** - Toggle patterns, coverage dashboard
2. **Scraping complet** - Plus de produits depuis les sources
3. **Optimisation documentation** - Consolidation pour réduire context window
