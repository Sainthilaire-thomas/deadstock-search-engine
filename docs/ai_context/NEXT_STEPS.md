
# Prochaines Étapes - Deadstock Search Engine

**Mis à jour:** 04/01/2026 - Fin Session 12

---

## ✅ Complété (Session 12)

### Module Boards - Phase 1 ✓

* [X] Migration SQL 015 (boards, board_zones, board_elements)
* [X] Types TypeScript complets avec mappers
* [X] boardsRepository.ts
* [X] elementsRepository.ts
* [X] zonesRepository.ts
* [X] boardActions.ts
* [X] elementActions.ts
* [X] zoneActions.ts
* [X] BoardContext.tsx (state management)
* [X] Page `/boards` (liste)
* [X] Page `/boards/[id]` (canvas)
* [X] BoardCanvas avec drag & drop
* [X] BoardHeader avec édition titre
* [X] BoardToolPanel avec boutons création
* [X] NoteEditor (édition double-clic)
* [X] AddToBoardButton (popover sélection board)
* [X] Intégration FavoritesGrid
* [X] Intégration TextileGrid (search)
* [X] Toast confirmation avec lien
* [X] Lien Boards dans sidebar
* [X] Zones draggables avec couleurs

---

## 🎯 Priorité Immédiate (Session 13)

### 1. Bouton "Tissu depuis favoris" fonctionnel

**Objectif:** Permettre d'ajouter des tissus au board depuis le panel

**Tâches:**

* [ ] Créer composant `FavoritesSelector.tsx`
* [ ] Modal/Sheet avec liste des favoris
* [ ] Click pour ajouter au board actuel
* [ ] Feedback visuel (tissu ajouté)

**Estimation:** 1-2 heures

### 2. Amélioration UX Canvas

**Tâches:**

* [ ] Redimensionnement zones (poignées de resize)
* [ ] Édition nom zone (double-clic sur header)
* [ ] Snap to grid optionnel
* [ ] Minimap pour grands boards

**Estimation:** 2-3 heures

---

## 📋 Court terme (Sessions 13-15)

### Phase 2 : Outils modulaires

* [ ] Extraire calculateur en `/calculator` standalone
* [ ] Module `/inspirations` (palettes avancées)
* [ ] Extraction palette depuis image uploadée
* [ ] Intégration calculateur dans board

### Phase 3 : Cristallisation

* [ ] Wizard 4 étapes (voir `SPEC_CRISTALLISATION.md`)
  * Étape 1: Sélection éléments à garder
  * Étape 2: Informations projet
  * Étape 3: Budget et timeline
  * Étape 4: Confirmation
* [ ] Création projet depuis board
* [ ] Archivage board après cristallisation
* [ ] Page `/projects` avec liste projets

---

## 🔄 Moyen terme (Sessions 16-18)

### Nettoyage & Optimisation

* [ ] Supprimer code `/journey` obsolète
* [ ] Redirections anciennes URLs
* [ ] Mise à jour sidebar (retirer étapes legacy)
* [ ] Tests de non-régression
* [ ] Optimisation performances canvas (virtualisation)

### Améliorations UX

* [ ] Autosave board (debounced)
* [ ] Historique modifications (undo/redo)
* [ ] Raccourcis clavier (Suppr, Ctrl+Z, etc.)
* [ ] Mode présentation board

### Normalisation Avancée

* [ ] Nouveaux patterns matières
* [ ] Amélioration détection couleurs
* [ ] Synonymes et variantes
* [ ] Dashboard qualité données

---

## 🚀 Long terme (Phase 2+)

### Collaboration

* [ ] Partage de boards (lien public)
* [ ] Commentaires sur éléments
* [ ] Édition temps réel multi-utilisateurs

### Authentification

* [ ] Supabase Auth integration
* [ ] Migration session → user_id
* [ ] Profil utilisateur
* [ ] Historique et préférences

### Monétisation

* [ ] Plans Freemium/Pro/Studio
* [ ] Limites par plan (boards, éléments)
* [ ] API professionnelle
* [ ] Marketplace inversé (demandes tissus)

### Site Marketing

* [ ] Landing page par persona
* [ ] Pages pricing
* [ ] Onboarding guidé
* [ ] Blog/Resources

---

## 📚 Documents de référence

| Document                                 | Description                      |
| ---------------------------------------- | -------------------------------- |
| `GLOSSAIRE.md`                         | Nomenclature des concepts        |
| `ARCHITECTURE_UX_BOARD_REALISATION.md` | Vision UX complète              |
| `SPEC_BOARD_MODULE.md`                 | Spécifications techniques Board |
| `SPEC_CRISTALLISATION.md`              | Flux de cristallisation          |
| `MIGRATION_JOURNEY_TO_BOARD.md`        | Plan de migration                |
| `SESSION_12_BOARD_MODULE.md`           | Détails session 12              |

---

## ✅ Critères de succès Session 13

1. Bouton "Tissu depuis favoris" fonctionnel
2. Au moins une amélioration UX canvas
3. Tests manuels complets du flow
4. Documentation mise à jour

---

## 💡 Notes techniques

### Pour le sélecteur de favoris

```tsx
// Utiliser Sheet de shadcn/ui
<Sheet>
  <SheetTrigger asChild>
    <Button>Tissu depuis favoris</Button>
  </SheetTrigger>
  <SheetContent>
    <FavoritesList onSelect={handleAddToBoard} />
  </SheetContent>
</Sheet>
```

### Pour le redimensionnement zones

* Utiliser `react-resizable` ou custom avec CSS resize handles
* Sauvegarder dimensions en base après resize
* Contraintes min/max pour éviter zones trop petites

---

**Estimation migration complète Journey → Boards:** 3-5 sessions restantes
