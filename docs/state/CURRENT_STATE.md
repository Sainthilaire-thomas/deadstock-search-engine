
# Deadstock Search Engine - État Actuel

**Dernière mise à jour:** 04/01/2026 - Session 11

---

## 🎯 Vision Produit

Moteur de recherche multi-sources pour tissus deadstock, destiné aux créateurs textiles indépendants. Seul agrégateur du marché avec **Board créatif** comme pivot central de l'expérience utilisateur.

---

## 🔄 Pivot UX (Session 11)

**Changement majeur d'architecture :**

| Avant                        | Après                                |
| ---------------------------- | ------------------------------------- |
| Parcours linéaire 9 étapes | Board comme espace de travail central |
| `/journey`rigide           | `/boards`flexible                   |
| Création projet obligatoire | Exploration libre → cristallisation  |

```
NOUVELLE ARCHITECTURE
─────────────────────────────────────────────────

  Recherche    Inspirations    Calcul    Favoris
       │            │           │          │
       └────────────┴─────┬─────┴──────────┘
                          │
                     ┌────▼────┐
                     │  BOARD  │  ← Pivot central
                     └────┬────┘
                          │
                    Cristallisation
                          │
                     ┌────▼────┐
                     │ PROJET  │
                     └─────────┘
```

---

## 📊 Progression Globale

| Module                  | Progression | Status                         |
| ----------------------- | ----------- | ------------------------------ |
| **Recherche**     | 90%         | ✅ Fonctionnel                 |
| **Favoris**       | 100%        | ✅ Complet                     |
| **Admin**         | 100%        | ✅ Complet                     |
| **Scraping**      | 100%        | ✅ Pipeline complet            |
| **Normalisation** | 80%         | ✅ Dictionnaires FR→EN        |
| **Journey**       | 45%         | ⏸️ Suspendu (sera remplacé) |
| **Board**         | 0%          | 🆕 À implémenter             |

---

## 🗄️ Base de données

### Tables actives (schema `deadstock`)

| Table                | Rows     | Description            |
| -------------------- | -------- | ---------------------- |
| `textiles`         | ~160     | Produits normalisés   |
| `favorites`        | Variable | Favoris par session    |
| `projects`         | Variable | Projets designer       |
| `scraping_sources` | 4        | Sources configurées   |
| `scraping_jobs`    | ~10      | Historique jobs        |
| `dictionary_*`     | ~200     | Mappings normalisation |
| `unknown_terms`    | Variable | Termes à valider      |

### Tables à créer (Migration 015)

| Table              | Description                  |
| ------------------ | ---------------------------- |
| `boards`         | Espaces de travail créatifs |
| `board_zones`    | Zones de regroupement        |
| `board_elements` | Éléments polymorphes       |

### Dernière migration

**014_create_projects_table.sql** - Table projets avec :

* 30 colonnes (toutes étapes du parcours)
* JSONB : mood_board, garments, fabric_modifiers, yardage_details
* RLS policies permissives
* Indexes optimisés

---

## 🏗️ Architecture

### Structure actuelle

```
src/
├── app/
│   ├── page.tsx              # Landing
│   ├── search/               # Recherche textile
│   ├── favorites/            # Gestion favoris
│   ├── admin/                # Module admin complet
│   └── journey/              # ⏸️ Sera remplacé par /boards
│
├── features/
│   ├── search/               # Recherche & filtres
│   ├── favorites/            # Favoris (complet)
│   ├── admin/                # Admin (complet)
│   ├── scraping/             # Pipeline scraping
│   ├── normalization/        # Normalisation FR→EN
│   ├── tuning/               # Supervision mappings
│   └── journey/              # ⏸️ Partiellement réutilisé
│       ├── config/garments.ts       # ✅ À conserver
│       ├── services/yardageCalculator.ts  # ✅ À conserver
│       └── ... (reste à migrer/supprimer)
│
└── lib/supabase/             # Clients (anon, server, admin)
```

### Structure à créer

```
src/
├── app/boards/               # 🆕 NOUVELLE SECTION
│   ├── page.tsx              # Liste des boards
│   └── [boardId]/
│       └── page.tsx          # Canvas du board
│
└── features/
    ├── boards/               # 🆕 NOUVEAU MODULE
    │   ├── domain/types.ts
    │   ├── infrastructure/boardsRepository.ts
    │   ├── actions/boardActions.ts
    │   ├── context/BoardContext.tsx
    │   └── components/
    │       ├── BoardCanvas/
    │       ├── BoardElement/
    │       └── Cristallisation/
    │
    ├── calculator/           # 🆕 Extrait de journey
    └── inspirations/         # 🆕 Nouveau module
```

---

## ✅ Fonctionnalités Complètes

### Recherche

* Recherche full-text avec normalisation
* Filtres : matière, couleur, prix, source
* Grille responsive avec pagination
* Intégration favoris

### Favoris

* Ajout/retrait instantané (optimistic updates)
* Persistance session (cookie httpOnly 90j)
* Page dédiée avec navigation
* Badge compteur temps réel

### Admin

* Dashboard avec statistiques
* Gestion sources scraping (CRUD)
* Discovery automatique structure sites
* Configuration scraping par source
* Monitoring jobs avec logs

### Scraping

* Pipeline complet (discover → scrape → normalize → save)
* Adapters par plateforme (Shopify, custom)
* Normalisation intégrée (material, color)
* CLI avec options (--test, --limit, --collection)
* Gestion erreurs et retry

---

## 🔄 En cours / À faire

### Module Board (Priorité haute)

* [ ] Migration SQL 015 (tables boards)
* [ ] Types TypeScript
* [ ] Repository + Actions
* [ ] BoardContext
* [ ] Page /boards (liste)
* [ ] Page /boards/[id] (canvas)
* [ ] Composants éléments
* [ ] Drag & drop

### Cristallisation

* [ ] Wizard 4 étapes
* [ ] Mapping board → projet
* [ ] Archivage board

### Migration journey → boards

* [ ] Extraire calculateur
* [ ] Créer module inspirations
* [ ] Supprimer ancien code

---

## 📚 Documentation clé

| Document                                 | Description                      |
| ---------------------------------------- | -------------------------------- |
| `GLOSSAIRE.md`                         | Nomenclature des concepts        |
| `ARCHITECTURE_UX_BOARD_REALISATION.md` | Vision UX complète              |
| `SPEC_BOARD_MODULE.md`                 | Spécifications techniques Board |
| `SPEC_CRISTALLISATION.md`              | Flux de cristallisation          |
| `MIGRATION_JOURNEY_TO_BOARD.md`        | Plan de migration                |

---

## 📈 Métriques Techniques

| Métrique        | Valeur                     |
| ---------------- | -------------------------- |
| Lignes de code   | ~15,000                    |
| Composants React | ~50                        |
| Server Actions   | ~40                        |
| Types TypeScript | ~100                       |
| Tables Supabase  | 8 (→ 11 après migration) |
| Sources scraping | 4                          |

---

## 🛠️ Stack Technique

* **Frontend:** Next.js 16.1, React 19, TypeScript
* **Styling:** Tailwind CSS, shadcn/ui
* **Backend:** Supabase (PostgreSQL, Auth, RLS)
* **Scraping:** Cheerio, node-fetch
* **State:** React Context, Server Actions
* **i18n:** next-intl (préparé)

---

## 🔗 URLs Principales

| Route              | Status | Description        |
| ------------------ | ------ | ------------------ |
| `/`              | ✅     | Landing page       |
| `/search`        | ✅     | Recherche textiles |
| `/favorites`     | ✅     | Mes favoris        |
| `/admin`         | ✅     | Dashboard admin    |
| `/admin/sources` | ✅     | Gestion sources    |
| `/journey`       | ⏸️   | Sera remplacé     |
| `/boards`        | 🆕     | À créer          |
| `/boards/[id]`   | 🆕     | À créer          |
| `/calculator`    | 🆕     | À créer          |

---

## ⚠️ Points d'attention

1. **Ne pas supprimer `/journey`** tant que `/boards` n'est pas complet
2. Erreurs TypeScript préexistantes dans scripts/ (non bloquantes)
3. Dark mode incomplet sur certains formulaires
4. i18n préparé mais non branché (labels hardcodés)

---

## 📅 Historique Sessions

| Session      | Date                 | Focus                                 |
| ------------ | -------------------- | ------------------------------------- |
| 1-6          | Nov-Dec 2025         | Fondations, recherche, admin          |
| 7            | Dec 2025             | Système favoris                      |
| 8            | Dec 2025             | Module admin complet                  |
| 9            | Jan 2026             | Pipeline scraping                     |
| 10           | 03/01/2026           | Module Journey (45%)                  |
| **11** | **04/01/2026** | **Pivot UX : Journey → Board** |

---

## 🎯 Estimation prochaines sessions

| Phase           | Sessions      | Objectif                         |
| --------------- | ------------- | -------------------------------- |
| Phase 1         | 2-3           | Module Board fonctionnel         |
| Phase 2         | 1-2           | Outils modulaires                |
| Phase 3         | 1-2           | Cristallisation                  |
| Phase 4-5       | 1-2           | Migration & nettoyage            |
| **Total** | **5-9** | **Architecture complète** |
