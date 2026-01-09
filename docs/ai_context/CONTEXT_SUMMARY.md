
# Context Summary - Deadstock Search Engine

**Version** : 2.0

**Date** : 9 Janvier 2026

---

## 🎯 Qu'est-ce que Deadstock Search Engine ?

**Plateforme B2B SaaS** qui agrège les inventaires de tissus deadstock de multiples fournisseurs dans une interface de recherche unifiée pour les créateurs de mode indépendants.

### Problème résolu

* Designers cherchent des tissus deadstock (fins de série, chutes) pour créations éco-responsables
* Sources fragmentées (MLC, Nona Source, TFS, Recovo...)
* Difficile de comparer prix, disponibilités, caractéristiques

### Solution

* Moteur de recherche unifié multi-sources
* Normalisation des données (matière, couleur, motif)
* Filtres intelligents
* Favoris et boards pour organiser la recherche

---

## 🏗️ Architecture Technique

### Stack

* **Frontend** : Next.js 16, React 19, TypeScript, Tailwind
* **Backend** : Supabase PostgreSQL (schema `deadstock`)
* **Pattern** : Light DDD avec feature modules

### Structure Modules

```
src/features/
├── admin/          # Discovery, Scraping, Tuning
├── search/         # Recherche textiles
├── favorites/      # Gestion favoris
├── boards/         # Canvas de travail
├── normalization/  # Pipeline normalisation
└── tuning/         # Gestion dictionnaire
```

### Base de Données - Tables Clés

```
deadstock.textiles          # Produits scrapés
deadstock.textile_attributes # Attributs EAV (fiber, color, pattern)
deadstock.dictionary_mappings # Traductions/normalisation
deadstock.sites             # Sources configurées
deadstock.site_profiles     # Résultats discovery
deadstock.textiles_search   # Vue matérialisée (recherche)
```

---

## 🔄 Pipeline de Données

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  DISCOVERY  │────▶│  SCRAPING   │────▶│   SEARCH    │
│             │     │             │     │             │
│ Analyse     │     │ Fetch +     │     │ Materialized│
│ structure   │     │ Normalize + │     │ view +      │
│ site        │     │ Save        │     │ Filters     │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Discovery

* Analyse collections Shopify
* Détecte patterns d'extraction
* Calcule Deadstock Score
* Stocke dans `site_profiles`

### Scraping (Session 20 - amélioré)

* Fetch produits via Shopify API
* **Variant Analysis** : Analyse TOUS les variants pour:
  * `available` = any variant available
  * `sale_type` = fixed_length | hybrid | cut_to_order
  * `price_per_meter` = calculé intelligemment
  * `quantity_value` = longueur depuis option2
* Normalisation via dictionnaire (FR/EN)
* Dual-write: `textiles` + `textile_attributes`
* Refresh materialized view

### Search

* Query sur `textiles_search` (materialized view)
* Filtres dynamiques depuis `textile_attributes`
* Performance ~3ms

---

## 📊 État Actuel (Session 20)

| Source           | Textiles      | Available      | Sale Type                     |
| ---------------- | ------------- | -------------- | ----------------------------- |
| My Little Coupon | 59            | 100%           | fixed_length                  |
| Nona Source      | 100           | 100%           | fixed_length (92), hybrid (8) |
| The Fabric Sales | 109           | 100%           | cut_to_order                  |
| **Total**  | **268** | **100%** | -                             |

---

## 🔧 Fichiers Importants à Connaître

### Scraping Pipeline

* `src/features/admin/services/scrapingService.ts` - Orchestration
* `src/features/admin/infrastructure/scrapingRepo.ts` - Persistence + normalisation
* `src/features/admin/utils/variantAnalyzer.ts` - **NEW** Analyse variants
* `src/features/admin/utils/extractTerms.ts` - Extraction termes depuis tags

### Normalisation

* `src/features/normalization/application/normalizeTextile.ts` - Entry point
* `src/features/normalization/infrastructure/normalizationService.ts` - Dictionary lookup

### Search

* `src/features/search/infrastructure/textileRepository.ts` - Queries
* Vue matérialisée: `deadstock.textiles_search`

---

## ⚠️ Points d'Attention

### Sale Types (Modèles de vente)

| Type             | Description                          | quantity_value      |
| ---------------- | ------------------------------------ | ------------------- |
| `fixed_length` | Coupons fixes (MLC, Nona)            | Longueur en mètres |
| `hybrid`       | Coupons + coupe à la demande (Nona) | Longueur max        |
| `cut_to_order` | Vente au mètre (TFS)                | Stock ou NULL       |
| `by_piece`     | Vente à la pièce                   | Nombre de pièces   |

### Variant Analysis (Nona Source)

* `option1` = Color
* `option2` = Length (meters)
* `option3` = Lot reference OR "Cutting"
* Si "Cutting" présent → `sale_type = hybrid`

---

## 📝 ADRs Récents Importants

| ADR     | Sujet                                               | Status          |
| ------- | --------------------------------------------------- | --------------- |
| ADR-024 | Textile Standard System (EAV + Materialized View)   | ✅ Implémenté |
| ADR-025 | Admin Architecture Clarification (Variant Analysis) | ✅ Implémenté |

---

## 🚀 Prochaines Étapes

1. Interface Discovery avancée (toggle patterns, coverage)
2. Scraping à grande échelle
3. Consolidation documentation (réduire taille)
