
# Contexte Projet - Deadstock Search Engine

**Pour reprendre rapidement le contexte entre sessions**

---

## 🎯 En une phrase

Moteur de recherche multi-sources pour tissus deadstock avec **Board créatif** comme pivot central de l'expérience utilisateur.

---

## 📍 Où on en est (Session 11)

**Pivot majeur UX réalisé** - L'architecture a été repensée :

| Avant                                  | Après                                           |
| -------------------------------------- | ------------------------------------------------ |
| Parcours linéaire 9 étapes           | Board comme espace de travail central            |
| `/journey`rigide                     | `/boards`flexible                              |
| Création projet obligatoire au début | Exploration libre → cristallisation quand prêt |

### Documents créés cette session

* `GLOSSAIRE.md` - Nomenclature des concepts
* `ARCHITECTURE_UX_BOARD_REALISATION.md` - Vision UX complète
* `SPEC_BOARD_MODULE.md` - Spécifications techniques
* `SPEC_CRISTALLISATION.md` - Flux Board → Projet
* `MIGRATION_JOURNEY_TO_BOARD.md` - Plan de migration

---

## 🏗️ Nouvelle architecture

```
EXPLORATION                     RÉALISATION
─────────────────────────────────────────────────

Recherche ──┐
Inspirations ├──▶ BOARD ──▶ Cristallisation ──▶ PROJET
Favoris ────┤       │                              │
Calcul ─────┘       │                              ▼
                    │                         COLLECTION
              (espace de travail)
              (zones, éléments)
```

### Concepts clés

| Terme                     | Définition                                                     |
| ------------------------- | --------------------------------------------------------------- |
| **Board**           | Espace de réflexion visuel (granularité libre)                |
| **Zone**            | Regroupement spatial sur un board                               |
| **Élément**       | Unité sur le board (tissu, palette, calcul, note, inspiration) |
| **Cristallisation** | Transformation board → projet (wizard 4 étapes)               |
| **Projet**          | Intention de réalisation concrète                             |

---

## 🗂️ Fichiers clés

### Nouvelle documentation (à lire en priorité)

```
GLOSSAIRE.md                           # Nomenclature
ARCHITECTURE_UX_BOARD_REALISATION.md   # Vision UX
SPEC_BOARD_MODULE.md                   # Specs techniques
SPEC_CRISTALLISATION.md                # Flux cristallisation
MIGRATION_JOURNEY_TO_BOARD.md          # Plan migration
```

### Code existant (à migrer)

```
src/features/journey/                  # Module actuel (sera remplacé)
├── config/garments.ts                 # À CONSERVER
├── services/yardageCalculator.ts      # À CONSERVER
├── infrastructure/projectsRepository  # À ADAPTER
└── ... (reste à supprimer)

src/app/journey/                       # Pages actuelles (seront remplacées)
```

### Code à créer

```
src/features/boards/                   # NOUVEAU MODULE
├── domain/types.ts
├── infrastructure/boardsRepository.ts
├── actions/boardActions.ts
├── context/BoardContext.tsx
└── components/BoardCanvas/, etc.

src/app/boards/                        # NOUVELLES PAGES
├── page.tsx
└── [boardId]/page.tsx
```

---

## 📊 État des tables

| Table              | Status       | Notes                                |
| ------------------ | ------------ | ------------------------------------ |
| `textiles`       | ✅ OK        | ~160 produits                        |
| `favorites`      | ✅ OK        | Fonctionnel                          |
| `projects`       | ✅ OK        | À adapter (ajouter source_board_id) |
| `boards`         | 🆕 À créer | Migration 015                        |
| `board_zones`    | 🆕 À créer | Migration 015                        |
| `board_elements` | 🆕 À créer | Migration 015                        |

---

## 🚀 Pour reprendre

### Session 12 : Créer le module Board

1. **Migration SQL**
   ```sql
   -- 015_create_boards_tables.sql
   CREATE TABLE deadstock.boards (...);
   CREATE TABLE deadstock.board_zones (...);
   CREATE TABLE deadstock.board_elements (...);
   ```
2. **Types TypeScript** → `src/features/boards/domain/types.ts`
3. **Repository** → `src/features/boards/infrastructure/boardsRepository.ts`
4. **Actions** → `src/features/boards/actions/boardActions.ts`
5. **Pages** → `/boards` et `/boards/[id]`

---

## ⚠️ Points d'attention

* Le code `/journey` existant reste fonctionnel mais sera remplacé
* Ne pas supprimer `/journey` tant que `/boards` n'est pas complet
* Migration progressive en 5 phases (voir `MIGRATION_JOURNEY_TO_BOARD.md`)
* Estimation : 5-9 sessions pour la migration complète

---

## 📁 Documents de référence

| Document                                 | Usage                         |
| ---------------------------------------- | ----------------------------- |
| `GLOSSAIRE.md`                         | Définitions des termes       |
| `ARCHITECTURE_UX_BOARD_REALISATION.md` | Vision globale UX             |
| `SPEC_BOARD_MODULE.md`                 | Comment implémenter le board |
| `SPEC_CRISTALLISATION.md`              | Flux de cristallisation       |
| `MIGRATION_JOURNEY_TO_BOARD.md`        | Plan de migration             |
| `PROJECT_OVERVIEW.md`                  | Vision produit globale        |
