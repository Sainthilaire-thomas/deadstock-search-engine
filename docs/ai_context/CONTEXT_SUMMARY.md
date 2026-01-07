
# CONTEXT_SUMMARY.md - Résumé du Contexte Projet

**Dernière mise à jour** : 6 janvier 2026

---

## Le Projet en Bref

**Deadstock Textile Search Engine** est un moteur de recherche B2B permettant aux designers de mode de trouver des tissus deadstock (fins de série, surplus de production) auprès de multiples fournisseurs européens.

### Proposition de Valeur

* **Agrégation** : Un seul point de recherche pour tous les fournisseurs
* **Normalisation** : Données uniformisées (matières, couleurs, motifs)
* **Outils Design** : Boards visuels, favoris, cristallisation en projets

### Marché Cible

* Designers de mode indépendants
* Petites marques éco-responsables
* Studios de design textile

---

## Architecture Conceptuelle

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN PIPELINE                               │
│  Discovery → Configuration → Scraping → Normalisation → Storage │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                   │
│  textiles | dictionary | unknowns | sites | profiles           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DESIGNER INTERFACE                           │
│  Search → Favorites → Boards → Projects (Cristallisation)      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flux de Données Clés

### 1. Pipeline Admin (Indexation)

```
Site Shopify → Discovery (structure) → Profile
           → Scraping (produits) → Extraction dimensions
           → Normalisation (FR/EN → EN) → Storage textiles
```

### 2. Parcours Designer

```
Search → Résultats filtrés → Favoris
      → Board (canvas visuel) → Zones
      → Cristallisation → Projet concret
```

### 3. Système de Normalisation

```
Terme FR ("soie") → Dictionary Lookup → Terme EN ("silk")
Terme inconnu → Unknown Terms → Admin Review → Dictionary
```

---

## Décisions Architecturales Clés

### ADR-001 à ADR-021 (Points Majeurs)

| ADR               | Décision            | Impact                        |
| ----------------- | -------------------- | ----------------------------- |
| ADR-005           | Light DDD            | Structure modules par domaine |
| ADR-007           | Adapter Pattern      | Scrapers extensibles          |
| ADR-009           | i18n Strategy        | FR source → EN storage       |
| ADR-017           | Unified Repositories | Client/Server same API        |
| ADR-020           | Source Locale        | Dictionnaires par langue      |
| **ADR-021** | Extraction Patterns  | Dimensions auto-détectées   |

### Principes Établis

1. **Qualité > Quantité** : Préférer 80% de couverture avec données propres
2. **Admin-Driven** : Configuration sans code via UI admin
3. **Demand-Driven** : Indexation sur demande (pas scraping continu)
4. **Optimistic Updates** : UX réactive (favoris, boards)

---

## État MVP Phase 1

### Complété (~90%)

* ✅ Recherche avec filtres
* ✅ Système favoris instantané
* ✅ Boards avec drag-and-drop
* ✅ Admin discovery/scraping
* ✅ Normalisation FR fonctionnelle
* ✅ **Extraction dimensions (nouveau)**

### En Cours

* ⚠️ Dictionnaire EN (600 unknowns TFS)
* ⚠️ Dashboard qualité unifié
* ⚠️ Toggle patterns UI

### Planifié

* 🔲 LLM suggestions unknowns
* 🔲 API professionnelle
* 🔲 Multi-tenant

---

## Sources de Données

### Actuellement Supportées

| Source           | Plateforme | Locale | Produits |
| ---------------- | ---------- | ------ | -------- |
| My Little Coupon | Shopify    | FR     | ~11,000  |
| The Fabric Sales | Shopify    | EN     | ~3,000   |

### Planifiées

* Recovo (Shopify)
* Nona Source (Custom)
* Première Vision (API?)

---

## Technologies Utilisées

### Core Stack

* **Next.js 16** : Framework React full-stack
* **TypeScript** : Typage strict
* **Supabase** : PostgreSQL + Auth + Realtime
* **Tailwind CSS** : Styling utility-first

### Libraries Clés

* `lucide-react` : Icons
* `date-fns` : Manipulation dates
* `@supabase/supabase-js` : Client DB

### Outils Dev

* PowerShell (Windows)
* Supabase CLI
* VS Code

---

## Conventions de Code

### Structure Fichiers

```
src/features/{domain}/
├── domain/types.ts       # Interfaces domaine
├── application/          # Use cases, actions
├── infrastructure/       # Repos, services externes
└── components/           # UI spécifique domaine
```

### Naming

* **Files** : camelCase (`extractionService.ts`)
* **Components** : PascalCase (`ExtractionPatternsCard`)
* **Types** : PascalCase (`ExtractionPattern`)
* **Tables DB** : snake_case (`extraction_patterns`)

### Patterns

* Repository pour accès données
* Server Actions pour mutations
* Optimistic Updates pour UX

---

## Liens Importants

### Documentation Projet

* [PROJECT_OVERVIEW.md](https://claude.ai/mnt/project/PROJECT_OVERVIEW.md)
* [PRODUCT_VISION.md](https://claude.ai/mnt/project/PRODUCT_VISION.md)
* [PHASES_V2.md](https://claude.ai/mnt/project/PHASES_V2.md)

### Specs Techniques

* [DATABASE_ARCHITECTURE.md](https://claude.ai/mnt/project/DATABASE_ARCHITECTURE.md)
* [SPEC_ADMIN_DATA_TUNING_COMPLETE.md](https://claude.ai/mnt/project/SPEC_ADMIN_DATA_TUNING_COMPLETE.md)
* [SPEC_BOARD_MODULE.md](https://claude.ai/mnt/project/SPEC_BOARD_MODULE.md)

### ADRs Récents

* [ADR-020 Source Locale](https://claude.ai/mnt/project/ADR_020_SCRAPER_SOURCE_LOCALE.md)
* [ADR-021 Extraction Patterns](https://claude.ai/mnt/project/ADR_021_EXTRACTION_PATTERNS_SYSTEM.md)
