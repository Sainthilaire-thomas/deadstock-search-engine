
# Prochaines Étapes - Deadstock Search Engine

**Mis à jour:** 04/01/2026 - Fin Session 13

---

## ✅ Complété (Session 13)

### FavoritesSelector + Refactoring ✓

* [X] Créer composant `FavoritesSelector.tsx`
* [X] Sheet avec liste des favoris (images, prix, matière)
* [X] Click pour ajouter au board actuel
* [X] Indicateur "Ajouté" pour tissus déjà sur le board
* [X] Intégration dans `BoardToolPanel.tsx`
* [X] **Refactoring:** Unifier `favoritesRepository.ts` (suppression doublon Server)
* [X] Correction colonnes SQL (alignement avec vrai schéma)
* [X] Amélioration `BoardToolPanel` : scroll + affichage sélection visible

---

## ✅ Complété (Session 12)

### Module Boards - Phase 1 ✓

* [X] Migration SQL 015 (boards, board_zones, board_elements)
* [X] Types TypeScript complets avec mappers
* [X] Repositories (boards, elements, zones)
* [X] Server Actions complètes
* [X] BoardContext.tsx (state management)
* [X] Pages `/boards` et `/boards/[id]`
* [X] BoardCanvas avec drag & drop
* [X] BoardHeader, BoardToolPanel, NoteEditor
* [X] AddToBoardButton (popover sélection board)
* [X] Intégrations FavoritesGrid et TextileGrid
* [X] Zones draggables avec couleurs

---

## 🎯 Priorité Immédiate (Session 14)

### 1. Amélioration UX Canvas

**Tâches:**

* [ ] Redimensionnement zones (poignées de resize)
* [ ] Édition nom zone (double-clic sur header)
* [ ] Snap to grid optionnel
* [ ] Minimap pour grands boards

**Estimation:** 2-3 heures

### 2. Amélioration FavoritesSelector

**Tâches:**

* [ ] Ne pas recharger la page après ajout (utiliser context)
* [ ] Fermer automatiquement le Sheet après ajout
* [ ] Toast de confirmation

**Estimation:** 1 heure

---

## 📋 Court terme (Sessions 14-16)

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

## 🔄 Moyen terme (Sessions 17-19)

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
| `SESSION_13_FAVORITES_SELECTOR.md`     | Détails session 13              |

---

## ✅ Critères de succès Session 14

1. Redimensionnement zones fonctionnel
2. Amélioration UX ajout depuis favoris (sans reload)
3. Tests manuels complets du flow
4. Documentation mise à jour

---

## 💡 Notes techniques

### Pour le redimensionnement zones

* Utiliser `react-resizable` ou custom avec CSS resize handles
* Sauvegarder dimensions en base après resize
* Contraintes min/max pour éviter zones trop petites
* Débouncer les appels API pendant le resize

### Pour améliorer FavoritesSelector

```tsx
// Au lieu de window.location.reload()
const handleAddTextile = async (favorite) => {
  const result = await addTextileToBoard(...);
  if (result.success && result.data) {
    // Ajouter directement dans le context
    addElement(result.data);
    // Fermer le sheet
    setIsOpen(false);
    // Toast
    toast.success('Tissu ajouté au board');
  }
};
```

---

**Estimation migration complète Journey → Boards:** 2-4 sessions restantes
