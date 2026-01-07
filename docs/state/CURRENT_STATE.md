# Current State - Deadstock Search Engine

**Dernière mise à jour:** 7 Janvier 2026 (Session 18)

---

## 🎯 Statut Global

| Métrique               | Valeur                          |
| ----------------------- | ------------------------------- |
| **Phase**         | MVP Phase 1                     |
| **Progression**   | ~90%                            |
| **Sprint actuel** | Data Architecture & Performance |

---

## 📊 Données en Base

### Textiles

| Métrique            | Valeur    |
| -------------------- | --------- |
| Total textiles       | 160       |
| Textiles disponibles | 160       |
| Avec fiber           | 95 (59%)  |
| Avec color           | 115 (72%) |
| Avec pattern         | 83 (52%)  |

### Sources

| Site             | Status    | Textiles | Qualité |
| ---------------- | --------- | -------- | -------- |
| My Little Coupon | ✅ Actif  | ~100     | 98%      |
| The Fabric Sales | ✅ Actif  | ~60      | 90%      |
| Recovo           | 🔲 Prévu | —       | —       |

### Dictionnaire

| Métrique      | Valeur |
| -------------- | ------ |
| Termes EN      | 181    |
| Termes FR      | 75     |
| Total mappings | 256    |
| Unknown terms  | <10    |

### Nouvelle Architecture (Session 18)

| Table                         | Rows | Status     |
| ----------------------------- | ---- | ---------- |
| `textile_attributes`        | 293  | ✅ Peuplé |
| `textiles_search`(vue mat.) | 160  | ✅ Créé  |
| `attribute_categories`      | 4    | ✅ Actif   |

---

## 🏗️ Modules Applicatifs

### ✅ Complétés

| Module                    | Status  | Description                          |
| ------------------------- | ------- | ------------------------------------ |
| **Search**          | ✅ 95%  | Recherche textiles avec filtres      |
| **Favorites**       | ✅ 100% | Système favoris avec sync instant   |
| **Boards**          | ✅ 90%  | Canvas interactif, zones, éléments |
| **Crystallization** | ✅ 85%  | Board → Projet                      |
| **Admin Sites**     | ✅ 100% | CRUD sites, discovery                |
| **Admin Scraping**  | ✅ 100% | Configuration, jobs, preview         |
| **Admin Tuning**    | ✅ 90%  | Dictionnaire, unknowns               |
| **Pattern Import**  | ✅ 80%  | Upload PDF, calcul métrage          |

### 🔄 En Cours

| Module                       | Status | Reste à faire                      |
| ---------------------------- | ------ | ----------------------------------- |
| **Data Architecture**  | 🔄 70% | Connecter API à vue matérialisée |
| **Admin Discovery**    | 🔄 80% | Interface mapping standard          |
| **Filtres Dynamiques** | 🔄 30% | Utiliser `attribute_categories`   |

### 🔲 À Faire

| Module               | Priorité | Description              |
| -------------------- | --------- | ------------------------ |
| Admin Pattern Tuning | P3        | Interface regex par site |
| Authentification     | P2        | Supabase Auth            |
| Multi-langue UI      | P3        | i18n français/anglais   |

---

## 🗄️ Architecture Base de Données

### Schema `deadstock`

```
Tables principales:
├── textiles (160 rows)
├── textile_attributes (293 rows) ← NOUVEAU
├── attribute_categories (4 rows)
├── dictionary_mappings (256 rows)
├── unknown_terms
├── sites (3 rows)
├── site_profiles
├── scraping_jobs
├── favorites
├── boards
├── board_elements
├── board_zones
└── projects

Vues:
├── textiles_search (vue matérialisée) ← NOUVEAU
├── textiles_with_attributes
└── active_textiles

Fonctions:
├── refresh_textiles_search() ← NOUVEAU
├── get_searchable_categories()
└── increment_mapping_usage()
```

### Performance Recherche

| Métrique               | Valeur    |
| ----------------------- | --------- |
| Temps requête filtrée | 2.8 ms    |
| Temps refresh vue       | 96 ms     |
| Index utilisés         | BitmapAnd |

---

## 🔧 Stack Technique

### Frontend

* Next.js 15.1.1
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui

### Backend

* Supabase (PostgreSQL)
* Server Actions
* Row Level Security

### Infrastructure

* Vercel (hosting)
* Supabase (database)

---

## 📁 Structure Projet

```
src/
├── app/
│   ├── admin/
│   │   ├── discovery/
│   │   ├── sites/
│   │   ├── jobs/
│   │   ├── tuning/
│   │   └── dictionary/
│   ├── boards/
│   ├── favorites/
│   ├── search/
│   └── tools/
├── features/
│   ├── admin/
│   ├── boards/
│   ├── favorites/
│   ├── normalization/
│   ├── search/
│   └── tuning/
└── components/
    ├── search/
    └── ui/
```

---

## 📋 ADRs Actifs

| ADR               | Titre                              | Status                |
| ----------------- | ---------------------------------- | --------------------- |
| ADR-010           | Dynamic Attribute System           | ✅ Implémenté       |
| ADR-020           | Source Locale Configuration        | ✅ Implémenté       |
| ADR-021           | Extraction Patterns System         | ✅ Implémenté       |
| ADR-022           | Demand Driven Indexation           | 📋 Prévu             |
| ADR-023           | Scraping Normalization Integration | ✅ Implémenté       |
| **ADR-024** | **Textile Standard System**  | **🔄 En cours** |

---

## 🎯 Prochaines Priorités

### Immédiat (Session 19)

1. Connecter API recherche à `textiles_search`
2. Filtres dynamiques via `attribute_categories`
3. Commit migrations SQL

### Court terme

4. Dual-write scraping → `textile_attributes`
5. Refresh vue après scraping
6. Clarifier `quantity_value` avec `sale_type`

### Moyen terme

7. Interface tuning patterns
8. Hiérarchie catégories
9. Authentification utilisateurs

---

## 🔗 Liens Utiles

* [Vercel Dashboard](https://vercel.com/)
* [Supabase Dashboard](https://supabase.com/dashboard)
* [GitHub Repository](https://github.com/)

---

**Dernière session:** Session 18 - Textile Standard System
