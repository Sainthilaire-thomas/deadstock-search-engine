# Current State - Deadstock Search Engine

**Dernière mise à jour** : 9 Janvier 2026

**Session** : 21

---

## État Global du Projet

| Métrique                  | Valeur                            |
| -------------------------- | --------------------------------- |
| **MVP Phase 1**      | ~95% complet                      |
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
* **NEW Session 21** : Composant `PriceDisplay` avec dual pricing pour produits hybrid

### ✅ Textile Detail Page (100%) - NEW Session 21

* Page `/textiles/[id]` créée
* Affichage image + miniatures
* Prix selon `sale_type` (fixed_length, hybrid, cut_to_order)
* Caractéristiques (fiber, color, pattern, weave, width, weight)
* Description HTML
* Boutons Favoris + Board
* Lien vers source externe

### ✅ Favorites Module (100%)

* Sync instantanée avec optimistic updates
* React Context pour état global
* Support anonymous + authenticated users

### ✅ Boards Module (95%)

* Canvas drag-drop fonctionnel
* Éléments: textiles, notes, color palettes, zones
* Cristallisation zones → projets concrets

### ✅ Admin Module - Sites & Discovery (98%)

* Discovery automatique sites Shopify
* Deadstock Score calculation
* Extraction patterns detection
* **NEW Session 21** : Sale Type detection au Discovery
* **NEW Session 21** : `SaleTypeCard` component affichant le type détecté
* Interface `/admin/discovery/[siteSlug]`

### ✅ Admin Module - Scraping (95%)

* Pipeline complet avec normalisation
* Variant analysis intelligent (ADR-025)
* `sale_type` detection (fixed_length, hybrid, cut_to_order)
* `price_per_meter` calculation
* `quantity_value` extraction depuis variants
* Dual-write: `textiles` + `textile_attributes`
* Materialized view refresh automatique

### ✅ Admin Module - Tuning (90%)

* Interface unknowns `/admin/tuning`
* Multi-locale dictionaries (FR/EN)
* Approve/Reject workflow

### ⏳ Admin Module - Discovery UI Avancée (40%)

* Patterns d'extraction affichés
* **NEW** : Sale Type Card avec confiance et preuves
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

### Colonnes Importantes

* `textiles.sale_type` : 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece'
* `textiles.price_per_meter` : Calculated price per meter
* `site_profiles.sale_type_detection` : JSON avec détection Discovery

### Materialized View

* `textiles_search` : Vue optimisée pour recherche, refresh après scraping
* Colonnes pivotées : fiber, color, pattern, weave, site_name

---

## Code - Fichiers Créés/Modifiés (Session 21)

| Fichier                                             | Modification                                     |
| --------------------------------------------------- | ------------------------------------------------ |
| `src/features/admin/utils/saleTypeDetector.ts`    | **NEW**- Détection sale_type au Discovery |
| `src/features/admin/services/discoveryService.ts` | Intégration saleTypeDetector                    |
| `src/features/admin/components/SaleTypeCard.tsx`  | **NEW**- Affichage sale_type dans Admin UI |
| `src/app/admin/discovery/[siteSlug]/page.tsx`     | Ajout SaleTypeCard                               |
| `src/components/search/PriceDisplay.tsx`          | **NEW**- Dual pricing display              |
| `src/components/search/TextileGrid.tsx`           | Utilise PriceDisplay                             |
| `src/app/(main)/textiles/[id]/page.tsx`           | **NEW**- Page détail textile              |

---

## ADR-026 Complet ✅

| Partie | Description                      | Status |
| ------ | -------------------------------- | ------ |
| Part 1 | Sale type detection at Discovery | ✅     |
| Part 2 | SaleTypeCard in Admin UI         | ✅     |
| Part 3 | PriceDisplay with dual pricing   | ✅     |
| Bonus  | Page détail textile             | ✅     |

---

## Performance

| Métrique                 | Valeur |
| ------------------------- | ------ |
| Search query              | 2.8ms  |
| Materialized view refresh | ~270ms |
| Scraping 10 products      | ~4s    |
| Textile detail page       | ~350ms |

---

## Points d'Attention

### Problème Supabase Schema

Le client Supabase server (`src/lib/supabase/server.ts`) ne spécifie pas le schema `deadstock` par défaut.
**Workaround actuel** : Utiliser `.schema('deadstock')` dans les requêtes.
**Fix recommandé** : Ajouter `db: { schema: 'deadstock' }` dans la config.

### Caractéristiques Vides

Sur certains textiles, la section "Caractéristiques" est vide (fiber, color non affichés).
À investiguer si c'est un problème de données ou de mapping dans la vue.

---

## Prochaines Priorités

1. **Fix "1unit"** → "Vente au mètre" pour cut_to_order
2. **Investiguer caractéristiques vides** dans page détail
3. **Scraping scale** - Plus de produits
4. **Filtre sale_type** dans la recherche
