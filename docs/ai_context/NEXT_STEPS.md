
# Prochaines Étapes - Deadstock Search Engine

**Mis à jour:** 04/01/2026 - Session 11 (Brainstorm UX)

---

## 🔄 Pivot majeur : Journey → Board

Suite au brainstorm de la session 11, l'architecture UX a été repensée :

* **Avant :** Parcours linéaire en 9 étapes (rigide)
* **Après :** Board comme pivot central (flexible)

Voir `ARCHITECTURE_UX_BOARD_REALISATION.md` pour les détails.

---

## 🎯 Priorité Immédiate (Session 12)

### 1. Créer le module Board - Phase 1

**Migration SQL :**

* [ ] Créer `015_create_boards_tables.sql`
* [ ] Tables : boards, board_zones, board_elements
* [ ] RLS policies
* [ ] Exécuter migration

**Infrastructure TypeScript :**

* [ ] `src/features/boards/domain/types.ts`
* [ ] `src/features/boards/infrastructure/boardsRepository.ts`
* [ ] `src/features/boards/infrastructure/elementsRepository.ts`
* [ ] `src/features/boards/actions/boardActions.ts`
* [ ] `src/features/boards/actions/elementActions.ts`

**Pages de base :**

* [ ] `/boards` - Liste des boards
* [ ] `/boards/[id]` - Canvas du board (basique)

---

## 📋 Court terme (Sessions 12-14)

### Phase 1 : Module Board complet

* [ ] BoardContext.tsx
* [ ] Composants : BoardCanvas, BoardElement, BoardZone
* [ ] Drag & drop basique
* [ ] Création/suppression de zones

### Phase 2 : Outils modulaires

* [ ] Extraire calculateur en module standalone `/calculator`
* [ ] Créer module `/inspirations` (palettes)
* [ ] Bouton "Ajouter au board" sur favoris
* [ ] Bouton "Ajouter au board" sur recherche
* [ ] Panel outils sur le board

### Phase 3 : Cristallisation

* [ ] Wizard 4 étapes (voir `SPEC_CRISTALLISATION.md`)
* [ ] Création projet depuis board
* [ ] Archivage board après cristallisation

---

## 🔄 Moyen terme (Sessions 15-17)

### Intégrations avancées

* [ ] Extraction palette depuis images
* [ ] Suggestions tissus compatibles
* [ ] Calcul prix estimé temps réel

### Nettoyage

* [ ] Supprimer ancien code `/journey`
* [ ] Redirections anciennes URLs
* [ ] Mise à jour sidebar principale

### Améliorations UX

* [ ] Autosave board
* [ ] Historique modifications
* [ ] Raccourcis clavier

---

## 🚀 Long terme (Phase 2+)

### Collaboration

* [ ] Partage de boards
* [ ] Commentaires sur éléments
* [ ] Édition temps réel multi-utilisateurs

### Site Marketing

* [ ] Landing page par persona
* [ ] Pages pricing
* [ ] Onboarding guidé

### Monétisation

* [ ] Plans Freemium/Pro/Studio
* [ ] API professionnelle
* [ ] Marketplace inversé

---

## 📚 Documents de référence

| Document                                 | Description                      |
| ---------------------------------------- | -------------------------------- |
| `GLOSSAIRE.md`                         | Nomenclature des concepts        |
| `ARCHITECTURE_UX_BOARD_REALISATION.md` | Vision UX complète              |
| `SPEC_BOARD_MODULE.md`                 | Spécifications techniques Board |
| `SPEC_CRISTALLISATION.md`              | Flux de cristallisation          |
| `MIGRATION_JOURNEY_TO_BOARD.md`        | Plan de migration                |

---

## ✅ Critères de succès Session 12

1. Tables boards créées en base
2. Types TypeScript complets
3. CRUD board fonctionnel (create, list, get, delete)
4. Page /boards avec liste
5. Page /boards/[id] avec affichage basique des éléments

---

## 💡 Notes techniques

### Pour le Board Canvas

* Utiliser `@dnd-kit/core` pour drag & drop
* Positions en pixels absolus sur le canvas
* Zoom/pan avec transform CSS
* z-index géré dans le state

### Pour les éléments

* Structure polymorphe (element_type + element_data JSONB)
* Snapshot des tissus (prix au moment de l'ajout)
* Redimensionnement optionnel

---

**Estimation migration complète :** 5-9 sessions
