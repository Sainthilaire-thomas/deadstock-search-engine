
# CURRENT_STATE.md - État Actuel du Projet

**Dernière mise à jour** : 6 janvier 2026

**Session** : 17

---

## Vue d'Ensemble

Le **Deadstock Textile Search Engine** est une plateforme SaaS permettant aux designers de mode indépendants de rechercher des tissus deadstock auprès de multiples fournisseurs via une interface unifiée.

---

## État des Modules

### Module Search (100% ✅)

* Recherche full-text avec filtres
* Normalisation des matières/couleurs/motifs
* Interface responsive avec grille de résultats

### Module Favorites (100% ✅)

* Synchronisation instantanée (optimistic updates)
* Repository unifié client/serveur
* Toggle depuis n'importe quelle vue

### Module Board (95% ✅)

* Canvas drag-and-drop
* Zones de travail redimensionnables
* Import depuis favoris
* Cristallisation en projets

### Module Admin - Sites (95% ✅)

* Discovery automatique des sites Shopify
* Configuration des collections à scraper
* Scraping avec normalisation
* **NOUVEAU** : Extraction des dimensions (longueur, largeur, poids)

### Module Admin - Tuning (75% ⚠️)

* Interface unknowns avec filtres
* Dictionnaire FR fonctionnel
* **À faire** : Dictionnaire EN, LLM suggestions

### Module Cristallisation (85% ✅)

* Transformation zone → projet
* Règles de validation
* Migration données

---

## Base de Données

### Tables Principales (Schema: deadstock)

| Table               | Enregistrements | Notes                    |
| ------------------- | --------------- | ------------------------ |
| textiles            | ~500            | Produits scrapés        |
| sites               | 3               | MLC, TFS, Recovo         |
| site_profiles       | 2               | Avec extraction_patterns |
| dictionary_mappings | ~250            | FR principalement        |
| unknown_terms       | ~620            | Majoritairement EN (TFS) |
| favorites           | Variable        | Par session user         |
| boards              | Variable        | Par session user         |

### Colonnes Clés textiles

| Colonne            | Utilisation                            |
| ------------------ | -------------------------------------- |
| `material_type`  | Matière normalisée (EN)              |
| `color`          | Couleur normalisée (EN)               |
| `pattern`        | Motif normalisé (EN)                  |
| `quantity_value` | **Longueur en mètres**(nouveau) |
| `width_value`    | **Largeur en cm**(nouveau)       |
| `weight_value`   | **Grammage gsm**(nouveau)        |

---

## Architecture Technique

### Stack

* **Frontend** : Next.js 16.1.1, React 19, TypeScript
* **Styling** : Tailwind CSS, Lucide React
* **Backend** : Supabase PostgreSQL
* **Schema** : `deadstock` (séparé du public)

### Patterns Architecturaux

* Domain-Driven Design (light)
* Repository Pattern (client/server unifié)
* Adapter Pattern (scrapers)
* Optimistic Updates (favorites)

### Fichiers Clés

```
src/
├── features/
│   ├── admin/
│   │   ├── services/
│   │   │   ├── discoveryService.ts      # Discovery sites
│   │   │   ├── scrapingService.ts       # Scraping orchestration
│   │   │   ├── extractionPatternDetector.ts  # Pattern detection
│   │   │   └── extractionService.ts     # Dimension extraction
│   │   └── infrastructure/
│   │       └── scrapingRepo.ts          # Persistence
│   ├── normalization/                   # Normalisation pipeline
│   └── tuning/                          # Dictionnaire & unknowns
├── app/
│   └── admin/
│       ├── discovery/[siteSlug]/        # Détail site + patterns
│       ├── scraping/                    # Jobs scraping
│       └── tuning/                      # Dictionnaire UI
```

---

## Métriques Actuelles

### Qualité des Données (My Little Coupon)

| Métrique               | Valeur        |
| ----------------------- | ------------- |
| Images                  | 100%          |
| Prix                    | 100%          |
| Tags                    | 100%          |
| Poids                   | 86%           |
| Product Type            | 94%           |
| **Overall Score** | **98%** |

### Extraction Dimensions (MLC)

| Dimension        | Couverture |
| ---------------- | ---------- |
| Longueur         | 100%       |
| Largeur          | 100%       |
| Poids (grammage) | 86%        |

### Normalisation

| Source   | Couverture Dict  |
| -------- | ---------------- |
| FR (MLC) | ~85%             |
| EN (TFS) | ~10% (à seeder) |

### Unknowns

| Source   | Count | Cause        |
| -------- | ----- | ------------ |
| TFS (EN) | ~600  | Dict EN vide |
| MLC (FR) | ~20   | Normal       |

---

## Dernières Modifications (Session 17)

### Nouveaux Fichiers

* `extractionPatternDetector.ts` - Détection auto patterns
* `extractionService.ts` - Application patterns
* `ExtractionPatternsCard.tsx` - UI patterns
* `/admin/discovery/[siteSlug]/page.tsx` - Page détail

### Modifications

* `discoveryService.ts` - Intégration détection patterns
* `scrapingService.ts` - Chargement patterns
* `scrapingRepo.ts` - Sauvegarde dimensions
* Migration DB `extraction_patterns`

---

## Configuration

### Sites Configurés

| Site             | URL                | Locale | Status                 |
| ---------------- | ------------------ | ------ | ---------------------- |
| My Little Coupon | mylittlecoupon.fr  | FR     | ✅ Active              |
| The Fabric Sales | thefabricsales.com | EN     | ⚠️ Dict EN à seeder |
| Recovo           | recovo.co          | EN     | 🔲 Non configuré      |

### Patterns Extraction (MLC)

| Field  | Source    | Coverage | Enabled |
| ------ | --------- | -------- | ------- |
| length | tags      | 100%     | ✅      |
| width  | body_html | 82%      | ✅      |
| width  | title     | 18%      | ❌      |
| weight | body_html | 86%      | ✅      |
| weight | variant   | 86%      | ✅      |

---

## Liens Documentation

* [PROJECT_OVERVIEW.md](https://claude.ai/mnt/project/PROJECT_OVERVIEW.md)
* [DATABASE_ARCHITECTURE.md](https://claude.ai/mnt/project/DATABASE_ARCHITECTURE.md)
* [PHASES_V2.md](https://claude.ai/mnt/project/PHASES_V2.md)
* [ADR Index](https://claude.ai/mnt/project/) - ADR_001 à ADR_021
