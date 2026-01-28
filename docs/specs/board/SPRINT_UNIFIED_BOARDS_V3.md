# SPRINT : Unified Boards Architecture

**Version** : 3.0
**Date** : 28 Janvier 2026
**Référence** : ADR-032, SPRINT_PERFORMANCE_V2
**Durée estimée** : 12h | **Temps passé** : ~8h

---

## 🎯 Objectif

Fusionner les concepts `Board` et `Zone` en une seule entité hiérarchique pour simplifier l'architecture et permettre une imbrication infinie.

---

## 📊 Tableau de Suivi

| Sprint | Nom                     | Durée   | Status      | Dépendances |
| ------ | ----------------------- | ------- | ----------- | ----------- |
| UB-1   | Migration Database      | 1h      | ✅ Terminé  | -           |
| UB-2   | Types et Mappers        | 45min   | ✅ Terminé  | UB-1        |
| UB-3   | Repository Unifié       | 45min   | ✅ Terminé  | UB-2        |
| UB-4   | Actions et Context      | 1h30    | ✅ Terminé  | UB-3        |
| UB-5   | Composants UI           | 3h      | ✅ Terminé  | UB-4        |
| UB-6   | Hooks (inclus UB-5)     | -       | ✅ Terminé  | -           |
| UB-7   | Journey (minimal)       | 30min   | ✅ Terminé  | UB-5        |
| UB-8   | Nettoyage et Tests      | 30min   | ⬜ À faire  | UB-7        |
| UB-9   | Focus Mode Transfert    | 2h      | ✅ Terminé  | UB-5        |
| UB-10  | Journey Complet         | 2h      | ⬜ À faire  | UB-9        |

**Légende** : ⬜ À faire | 🔄 En cours | ✅ Terminé | ⏸️ Bloqué

---

## ✅ UB-1 à UB-4 : Terminés (voir V2)

Pas de changement, voir document V2.

---

## ✅ UB-5 : Composants UI (TERMINÉ)

**Durée réelle** : 3h
**Session** : 28 Janvier 2026

### Travail effectué

#### 5.1 - ZoneFocusContext.tsx
- `focusedZone` → `focusedChildBoard`
- Types adaptés pour `Board`

#### 5.2 - CanvasModals.tsx
- `crystallizingZone` → `crystallizingChildBoard`
- Import `Board` au lieu de `BoardZone`

#### 5.3 - CrystallizationDialog.tsx
- Props renommées
- Appel `crystallizeBoardAction` au lieu de `crystallizeZoneAction`

#### 5.4 - AutoArrangeDialog.tsx
- `zones` → `childBoards`
- Types adaptés

#### 5.5 - boardUtils.ts (NOUVEAU)
Créé pour remplacer zoneUtils.ts :
```typescript
export function isElementInChildBoard(element: BoardElement, childBoard: Board): boolean
export function getActiveChildBoards(childBoards: Board[]): Board[]
export function getCrystallizedChildBoards(childBoards: Board[]): Board[]
export function getRandomBoardColor(): string
export function getNextChildBoardPosition(existingChildBoards: Board[]): { x: number; y: number }
```

#### 5.6 - zoneUtils.ts (TRANSITION)
Re-exports depuis boardUtils avec aliases deprecated.

#### 5.7 - autoArrange.ts
- `zoneMoves` → `childBoardMoves`
- Types adaptés

#### 5.8 - useZoneDrag.ts
- Hook renommé `useChildBoardDrag` avec alias `useZoneDrag`
- Toutes les variables internes renommées
- Null checks pour `childBoard.positionX/Y`

#### 5.9 - useZoneResize.ts
- Hook renommé `useChildBoardResize` avec alias `useZoneResize`

#### 5.10 - useKeyboardShortcuts.ts
- Props `selectedChildBoardId`, `removeChildBoard`
- Aliases deprecated pour compatibilité

#### 5.11 - hooks/index.ts
- Exports des nouveaux noms + aliases

#### 5.12 - ZoneFocusOverlay.tsx
- Focus Mode adapté avec:
  - Affichage `previewElements` + `newlyTransferredElements`
  - Counter utilisant `elementCount`
  - Indicateur "+N" si plus de 6 éléments
  - Drag & drop fonctionnel (transfert en DB)

#### 5.13 - ZoneCard.tsx
- Props `zone: Board` au lieu de `BoardZone`
- Utilise `zone.previewElements` et `zone.elementCount`
- Plus besoin de `elements` prop
- Border color via `borderLeftColor`

#### 5.14 - boardsRepository.ts
- Chargement `previewElements` (max 6 par child board)
- Chargement `elementCount` par child board
- Query groupée (pas N+1)

#### 5.15 - types.ts
- Ajout `elementCount?: number` sur `Board`
- Ajout `previewElements?: BoardElement[]` sur `Board`

#### 5.16 - BoardCanvas.tsx (MAJEUR)
Refactoring complet (~800 lignes) :
- `zones` → `childBoards`
- `selectedZoneId` → `selectedChildBoardId`
- `moveZoneLocal` → `moveChildBoardLocal`
- `saveZonePosition` → `saveChildBoardPosition`
- `resizeZoneLocal` → `resizeChildBoardLocal`
- `saveZoneSize` → `saveChildBoardSize`
- `updateZone` → `updateChildBoard`
- `removeZone` → `removeChildBoard`
- `selectZone` → `selectChildBoard`
- `addZone` → `addChildBoard`
- `editingZoneId` → `editingChildBoardId`
- `crystallizingZone` → `crystallizingChildBoard`
- `useZoneDrag` → `useChildBoardDrag`
- `zoneDragPosition` → `childBoardDragPosition`
- `zoneDragElementPositions` → `childBoardDragElementPositions`
- `draggingZoneId` → `draggingChildBoardId`
- `handleZoneMouseDown` → `handleChildBoardMouseDown`
- Null checks pour positions
- `positionedChildBoards` filter

### Checklist UB-5

- [X] ZoneFocusContext adapté
- [X] CanvasModals adapté
- [X] CrystallizationDialog adapté
- [X] AutoArrangeDialog adapté
- [X] boardUtils.ts créé
- [X] zoneUtils.ts en transition
- [X] autoArrange.ts adapté
- [X] useChildBoardDrag créé (avec alias)
- [X] useChildBoardResize créé (avec alias)
- [X] useKeyboardShortcuts adapté
- [X] hooks/index.ts adapté
- [X] ZoneFocusOverlay adapté (previewElements + drag&drop)
- [X] ZoneCard adapté (previewElements)
- [X] boardsRepository previewElements
- [X] types.ts elementCount + previewElements
- [X] BoardCanvas.tsx entièrement refactorisé
- [X] TypeScript compile ✅

---

## ✅ UB-6 : Hooks Drag/Resize (INCLUS DANS UB-5)

Fait dans UB-5.8 à UB-5.11.

---

## ✅ UB-7 : Journey (MINIMAL - TERMINÉ)

**Durée** : 30min

### Travail effectué

#### 7.1 - JourneyClientWrapper.tsx
- `BoardZone` → `Board`
- `zones` → `childBoards`
- `selectedZoneId` → `selectedChildBoardId`
- `crystallizedZones` → `crystallizedChildBoards`
- `zonesByStatus` → `childBoardsByStatus`
- `CrystallizedZoneItem` → `CrystallizedChildBoardItem`
- Suppression `getElementsInZone` (plus applicable)
- Affichage temporaire "Ouvrez cette pièce pour voir son contenu"

#### 7.2 - orderActions.ts
- Adapté pour nouvelle architecture
- Suppression référence à `zone.boardId`
- Utilise `getElementsByBoard(sourceChildBoardId)` directement

### Checklist UB-7

- [X] JourneyClientWrapper adapté (minimal)
- [X] orderActions.ts adapté
- [X] TypeScript compile ✅

---

## ⬜ UB-8 : Nettoyage et Tests

**Durée estimée** : 30min

### À faire

- [ ] Supprimer aliases deprecated dans BoardContext
- [ ] Supprimer `zonesRepository.ts`
- [ ] Supprimer `zoneActions.ts`
- [ ] Remplacer `zoneUtils.ts` par import direct de `boardUtils.ts`
- [ ] DROP TABLE board_zones (après validation complète)
- [ ] Tests manuels complets

---

## ✅ UB-9 : Focus Mode - Transfert d'Éléments (TERMINÉ)

**Durée réelle** : 2h30
**Session** : 28 Janvier 2026

### Travail effectué

- [X] `moveElementToBoardAction` créé
- [X] Focus Mode affiche `previewElements` existants
- [X] Focus Mode affiche `newlyTransferredElements` (droppés cette session)
- [X] Drag & drop depuis canvas vers Focus Mode fonctionne
- [X] Toast de confirmation
- [X] Élément retiré du board parent (optimistic update)
- [X] Élément persiste après navigation vers child board

### 🐛 BUG RÉSOLU : Élément transféré disparaissait

**Symptôme** : L'élément droppé apparaissait dans le Focus Mode mais disparaissait quand on ouvrait le child board.

**Cause identifiée** : `removeElement()` dans le contexte appelait `removeElementAction()` qui **supprimait l'élément de la DB** après le transfert !

**Fix appliqué** :

1. **BoardContext.tsx** - Ajout de `removeElementLocal` :
```typescript
// UB-9: Retire un élément du state local SANS le supprimer de la DB
const removeElementLocal = useCallback((id: string) => {
  dispatch({ type: 'REMOVE_ELEMENT', payload: id });
}, []);
```

2. **ZoneFocusOverlay.tsx** - Utilisation de `removeElementLocal` au lieu de `removeElement` :
```typescript
const { elements, removeElementLocal } = useBoard();
// ...
if (result.success) {
  setNewlyTransferredElements(prev => [...prev, element]);
  removeElementLocal(elementId);  // Ne supprime PAS de la DB
  toast.success(`Élément ajouté à "${focusedChildBoard.name}"`);
}
```

3. **elementsRepository.ts** - Repositionnement automatique lors du transfert :
```typescript
export async function moveElementToBoard(
  elementId: string,
  targetBoardId: string,
  newPosition?: { x: number; y: number }
): Promise<BoardElement | null> {
  const positionX = newPosition?.x ?? 100 + Math.random() * 200;
  const positionY = newPosition?.y ?? 100 + Math.random() * 200;
  // UPDATE avec nouvelles coordonnées
}
```

### Checklist UB-9

- [X] moveElementToBoardAction fonctionne
- [X] Focus Mode drag & drop UI
- [X] Optimistic update (retrait du parent sans suppression DB)
- [X] Repositionnement automatique des coordonnées
- [X] Élément visible après navigation vers child board
- [X] Tests manuels complets ✅

### Note performance

Le drag dans le child board "veste beige" (9 éléments) montre quelques ralentissements. À investiguer dans un sprint futur (optimisation React, memoization des éléments).

---

## ⬜ UB-10 : Journey Complet

**Durée estimée** : 2h
**Dépendances** : UB-9

### Contexte

Dans la nouvelle architecture, les éléments d'un child board ne sont plus accessibles via `getElementsInZone()` depuis le board parent. Ils appartiennent au child board (via `boardId`).

### À faire

#### 10.1 - Charger les éléments du child board sélectionné

Dans `JourneyClientWrapper.tsx`, quand on sélectionne un child board cristallisé :
- Appeler une action pour charger ses éléments
- Afficher les éléments dans la section "Contenu"

```typescript
// Nouveau hook ou state
const [selectedChildBoardElements, setSelectedChildBoardElements] = useState<BoardElement[]>([]);

useEffect(() => {
  if (selectedChildBoardId) {
    loadChildBoardElements(selectedChildBoardId).then(setSelectedChildBoardElements);
  }
}, [selectedChildBoardId]);
```

#### 10.2 - Créer action `getChildBoardElementsAction`

```typescript
// src/features/boards/actions/elementActions.ts
export async function getChildBoardElementsAction(boardId: string): Promise<BoardElement[]>
```

#### 10.3 - OrderForm avec éléments corrects

Le formulaire de commande doit recevoir les éléments du child board, pas du board parent.

### Checklist UB-10

- [ ] Action getChildBoardElementsAction
- [ ] JourneyClientWrapper charge éléments du child board
- [ ] Affichage correct dans la section "Contenu"
- [ ] OrderForm reçoit les bons éléments
- [ ] Tests manuels Journey

---

## 📋 Résumé des fichiers modifiés (Session 28/01)

| Fichier | Action |
|---------|--------|
| `src/features/boards/context/ZoneFocusContext.tsx` | Modifié |
| `src/features/boards/components/canvas/CanvasModals.tsx` | Modifié |
| `src/features/boards/components/CrystallizationDialog.tsx` | Modifié |
| `src/features/boards/components/AutoArrangeDialog.tsx` | Modifié |
| `src/features/boards/utils/boardUtils.ts` | **CRÉÉ** |
| `src/features/boards/utils/zoneUtils.ts` | Modifié (transition) |
| `src/features/boards/utils/autoArrange.ts` | Modifié |
| `src/features/boards/components/canvas/hooks/useZoneDrag.ts` | Modifié (renommé) |
| `src/features/boards/components/canvas/hooks/useZoneResize.ts` | Modifié (renommé) |
| `src/features/boards/components/canvas/hooks/useKeyboardShortcuts.ts` | Modifié |
| `src/features/boards/components/canvas/hooks/index.ts` | Modifié |
| `src/features/boards/components/ZoneFocusOverlay.tsx` | Modifié (UB-9 fix) |
| `src/features/boards/components/ZoneCard.tsx` | Modifié |
| `src/features/boards/infrastructure/boardsRepository.ts` | Modifié (previewElements) |
| `src/features/boards/infrastructure/elementsRepository.ts` | Modifié (moveElementToBoard coords) |
| `src/features/boards/domain/types.ts` | Modifié (elementCount, previewElements) |
| `src/features/boards/components/BoardCanvas.tsx` | **MAJEUR** - Refactoring complet |
| `src/features/boards/context/BoardContext.tsx` | Modifié (removeElementLocal UB-9) |
| `src/features/journey/components/JourneyClientWrapper.tsx` | Modifié |
| `src/features/journey/actions/orderActions.ts` | Modifié |

---

## 🎯 Prochaines étapes

1. **UB-10** : Journey complet
   - Charger les éléments du child board sélectionné
   - Adapter OrderForm

2. **UB-8** : Nettoyage final
   - Supprimer aliases deprecated
   - Supprimer fichiers obsolètes
   - Retirer les console.log de debug

3. **Performance** : Investiguer les ralentissements de drag dans les boards avec beaucoup d'éléments

---

**Auteur** : Claude
**Dernière mise à jour** : 28 Janvier 2026 - 18h10
