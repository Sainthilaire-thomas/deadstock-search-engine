# CURRENT_STATE.md - État Actuel du Projet

**Dernière mise à jour** : 5 janvier 2026 (Session 16)

**Version** : 0.9.0-alpha

---

## Vue d'Ensemble

Le **Deadstock Textile Search Engine** est à  **~87% du MVP Phase 1** .

```
┌─────────────────────────────────────────────────────────────┐
│                    MVP PHASE 1 STATUS                       │
├─────────────────────────────────────────────────────────────┤
│  Search Module      ████████████████████  100%  ✅          │
│  Favorites System   ████████████████████  100%  ✅          │
│  Board Module       ███████████████████░   95%  ✅          │
│  Admin Sites        ██████████████████░░   90%  ✅          │
│  Admin Tuning       ██████████████░░░░░░   70%  ⚠️          │
│  Cristallisation    █████████████████░░░   85%  ✅          │
├─────────────────────────────────────────────────────────────┤
│  OVERALL            █████████████████░░░   87%              │
└─────────────────────────────────────────────────────────────┘
```

---

## Modules Complétés ✅

### Search Module (100%)

* Interface de recherche avec filtres (matière, couleur, pattern)
* Intégration patterns importés
* Résultats paginés avec images

### Favorites System (100%)

* Ajout/suppression instantané (optimistic updates)
* Synchronisation via React Context
* Persistance Supabase avec RLS

### Board Module (95%)

* Canvas drag-and-drop (react-dnd)
* Items : textiles, notes, palettes couleur
* Resize handles fonctionnels
* Toolbar actions (add note, add palette)
* Migration depuis Journey terminée

### Admin Sites (90%)

* Discovery : analyse collections, tags, qualité
* Configuration : sélection collections à scraper
* Scraping : pipeline complet avec upsert
* Jobs : historique et monitoring

### Cristallisation (85%)

* Règles de cristallisation définies
* Migration Journey → Board effectuée
* Boards non-cristallisés protégés

---

## En Cours ⚠️

### Admin Tuning (70%)

**Ce qui fonctionne :**

* UI review unknowns (1 par 1)
* Contexte enrichi (image, URL, texte)
* Approve → crée mapping dictionnaire
* Reject → marque comme rejeté

**Ce qui manque :**

* ❌ Dictionnaire EN (0 entrées) - **ADR-020 créé**
* ❌ sourceLocale sur sites - **ADR-020 créé**
* ❌ Dashboard qualité globale
* ❌ LLM suggestions pour unknowns
* ❌ Batch processing
* ❌ Filtres avancés (par source, catégorie)
* ❌ Browser dictionnaire

**Problème critique identifié :**

* ~600 unknowns pour The Fabric Sales (source EN)
* Cause : dictionnaire ne contient que des termes FR
* Solution : ADR-020 (sourceLocale + seed dict EN)

---

## Architecture Technique

### Stack

```
Frontend:  Next.js 15 + TypeScript + Tailwind CSS
Backend:   Supabase (PostgreSQL + Auth + RLS)
State:     React Context + Server Actions
Styling:   Tailwind + Lucide Icons (outline)
DnD:       react-dnd + react-dnd-html5-backend
```

### Structure Projet

```
src/
├── app/                    # Next.js App Router
│   ├── admin/              # Module admin
│   │   ├── sites/          # Gestion sources
│   │   ├── tuning/         # Review unknowns
│   │   └── jobs/           # Monitoring jobs
│   ├── search/             # Recherche textiles
│   └── boards/             # Module boards
├── features/               # Domain-Driven Design
│   ├── admin/              # Services admin
│   ├── favorites/          # Système favoris
│   ├── normalization/      # Pipeline normalisation
│   ├── textiles/           # Domaine textiles
│   └── tuning/             # Dictionnaire + unknowns
├── components/             # Composants réutilisables
└── lib/                    # Utilitaires
```

### Base de Données (Schéma deadstock)

```
Tables principales:
├── textiles              # Produits scrapés normalisés
├── favorites             # Favoris utilisateur
├── boards                # Tableaux de réalisation
├── board_items           # Items sur les boards
├── sites                 # Sources à scraper
├── site_profiles         # Profils extraction
├── dictionary_mappings   # Dictionnaire normalisation
├── attribute_categories  # Catégories (fiber, color, etc.)
├── unknown_terms         # Termes non reconnus
├── discovery_jobs        # Jobs discovery
└── scraping_jobs         # Jobs scraping
```

---

## Données Actuelles

### Sites Configurés

| Site             | Domain             | Locale | Status    |
| ---------------- | ------------------ | ------ | --------- |
| My Little Coupon | mylittlecoupon.fr  | FR     | ✅ Active |
| The Fabric Sales | thefabricsales.com | EN     | ✅ Active |

### Métriques Normalisation

| Dimension         | Couverture | Notes           |
| ----------------- | ---------- | --------------- |
| Fiber (matière)  | ~80%       | Dict FR ok      |
| Color (couleur)   | ~55%       | Dict FR partiel |
| Pattern (motif)   | ~40%       | Dict FR partiel |
| Weave (armure)    | ~20%       | Peu de mappings |
| Length (longueur) | ~15%       | ❌ Hardcoded    |
| Width (largeur)   | 0%         | ❌ Non extrait  |

### Unknowns

| Source             | Pending | Cause           |
| ------------------ | ------- | --------------- |
| thefabricsales.com | ~600    | Pas de dict EN  |
| mylittlecoupon.fr  | ~20     | Nouveaux termes |

---

## ADRs Actifs

| ADR           | Titre                            | Status                     |
| ------------- | -------------------------------- | -------------------------- |
| 001           | Database Architecture            | ✅ Implémenté            |
| 002           | Normalisation EN + i18n          | ✅ Implémenté            |
| 004           | Normalization Tuning System      | ⚠️ Partiel (LLM pending) |
| 007           | Adapter Pattern Scrapers         | ✅ Implémenté            |
| 016           | Board Architecture               | ✅ Implémenté            |
| 017           | Unified Repositories             | ✅ Implémenté            |
| 018           | Crystallization Rules            | ✅ Implémenté            |
| 019           | Fabric Dimensions Extraction     | 📋 Planifié               |
| **020** | **Source Locale Scrapers** | **📋 Créé**        |

---

## Bloquants Actuels

### 🔴 Critique

1. **Dictionnaire EN vide** → ADR-020 résout
   * Impact : 600+ faux unknowns
   * Action : Seed ~150 termes EN

### 🟡 Important

2. **Extraction dimensions manquante** → ADR-019 planifié
   * Impact : Longueur/largeur non exploitables
   * Action : Détecter patterns dans tags/body
3. **LLM fallback non implémenté**
   * Impact : Unknowns restent manuels
   * Action : Phase 5 du plan tuning

---

## Prochaines Priorités

1. **Exécuter ADR-020** (Session 17)
   * Migration sourceLocale
   * Seed dictionnaire EN
   * Cleanup unknowns
2. **Implémenter extraction dimensions**
   * Patterns longueur/largeur
   * Modifier scrapingService
3. **Dashboard qualité admin**
   * Métriques par dimension
   * Alertes sources problématiques

---

## Notes de Version

### v0.9.0-alpha (5 jan 2026)

* ✅ Board module complet
* ✅ Cristallisation implémentée
* ✅ ADR-020 créé (source locale)
* ✅ Spec admin tuning complète
* ⚠️ Dict EN à seeder

### v0.8.0-alpha (4 jan 2026)

* ✅ Migration Journey → Board
* ✅ Favorites selector dans Board
* ✅ Resize items fonctionnel

### v0.7.0-alpha (3 jan 2026)

* ✅ Admin scraping pipeline
* ✅ Pattern import système
* ✅ Search avec filtres
