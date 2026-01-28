# SPRINT : Unified Boards Architecture

**Version** : 2.0
**Date** : 28 Janvier 2026
**Référence** : ADR-032, SPRINT_PERFORMANCE_V2
**Durée estimée** : 8h30 | **Temps passé** : ~3h

---

## 🎯 Objectif

Fusionner les concepts `Board` et `Zone` en une seule entité hiérarchique pour simplifier l'architecture et permettre une imbrication infinie.

---

## 📊 Tableau de Suivi

| Sprint | Nom                     | Durée | Status      | Dépendances |
| ------ | ----------------------- | ------ | ----------- | ------------ |
| UB-1   | Migration Database      | 1h     | ✅ Terminé | -            |
| UB-2   | Types et Mappers        | 45min  | ✅ Terminé | UB-1         |
| UB-3   | Repository Unifié      | 45min  | ✅ Terminé | UB-2         |
| UB-4   | Actions et Context      | 1h30   | ✅ Terminé | UB-3         |
| UB-5   | Composants UI           | 2h30   | 🔄 En cours | UB-4         |
| UB-6   | Hooks Drag/Resize       | 1h15   | ⬜ À faire | UB-5         |
| UB-7   | Journey et Auto-Arrange | 1h     | ⬜ À faire | UB-5         |
| UB-8   | Nettoyage et Tests      | 30min  | ⬜ À faire | UB-7         |

**Légende** : ⬜ À faire | 🔄 En cours | ✅ Terminé | ⏸️ Bloqué

---

## ✅ UB-1 : Migration Database (TERMINÉ)

**Fichier** : `database/migrations/035_unified_boards.sql`

### Checklist UB-1

- [X] Colonnes ajoutées à `boards`: position_x, position_y, width, height, color, crystallized_at, linked_project_id
- [X] Index `idx_boards_parent_children` créé
- [X] Données `board_zones` migrées vers `boards` (aucune zone existante)
- [X] Colonne `zone_id` supprimée de `board_elements`
- [X] Table `board_zones` conservée en backup (suppression manuelle ultérieure)
- [X] `database.types.ts` regénéré via Supabase CLI

---

## ✅ UB-2 : Types et Mappers (TERMINÉ)

**Fichier** : `src/features/boards/domain/types.ts`

### Modifications effectuées

#### Interface `Board` enrichie

```typescript
export interface Board {
  // ... champs existants ...
  
  // NOUVEAUX CHAMPS UB-2 (ex-zone)
  positionX: number | null;      // null pour boards racine
  positionY: number | null;
  width: number;                  // default 280
  height: number;                 // default 140
  color: string;                  // default '#6366F1'
  crystallizedAt: Date | null;
  linkedProjectId: string | null;
  linkedProjectStatus?: ProjectStatus;
}
```

#### BoardStatus étendu

```typescript
export type BoardStatus = 'draft' | 'ordered' | 'in_progress' | 'completed' | 'cancelled' | 'archived';
```

#### Nouveaux helpers

```typescript
isBoardRoot(board: Board): boolean
isBoardChildBoard(board: Board): boolean
isBoardCrystallized(board: Board): boolean
isBoardOrdered(board: Board): boolean
isBoardPiece(board: Board): boolean
isBoardCategory(board: Board): boolean
canTransitionTo(board: Board, newStatus: BoardStatus): boolean
```

#### Types supprimés

- `BoardZone`, `BoardZoneRow`
- `CreateZoneInput`, `UpdateZoneInput`
- `mapZoneFromRow()`
- `zoneId` dans `BoardElement` et `BoardElementRow`
- `isZoneCrystallized()`, `isZoneOrdered()`, `isZoneLinked()`
- `ZONE_TYPE_LABELS`

### Checklist UB-2

- [X] Interface Board enrichie avec champs ex-zone
- [X] BoardStatus étendu avec lifecycle complet
- [X] BOARD_STATUS_CONFIG avec icônes et couleurs
- [X] BOARD_STATUS_TRANSITIONS défini
- [X] Helpers de statut créés
- [X] BoardWithDetails.zones → childBoards
- [X] BoardWithPreview.zoneCount → childBoardCount
- [X] Types zone supprimés
- [X] mapBoardFromRow mis à jour

---

## ✅ UB-3 : Repository Unifié (TERMINÉ)

**Fichier** : `src/features/boards/infrastructure/boardsRepository.ts`

### Nouvelles fonctions

```typescript
// Remplace zonesRepository.createZone
createChildBoard(parentBoardId, input, userId): Promise<Board>

// Remplace zonesRepository.moveZone
moveChildBoard(boardId, positionX, positionY): Promise<boolean>

// Remplace zonesRepository.resizeZone
resizeChildBoard(boardId, width, height): Promise<boolean>

// Remplace zonesRepository.crystallizeZone
crystallizeBoard(boardId, projectId): Promise<Board | null>

// Nouveaux helpers
getChildBoards(parentBoardId): Promise<Board[]>
getBoardAncestors(boardId): Promise<Board[]>
listRootBoards(userId): Promise<Board[]>
getRootBoardsCount(userId): Promise<number>
```

### Modifications

- `listBoardsWithPreview()` : compte `childBoardCount` au lieu de `zoneCount`
- `getBoard()` : récupère `childBoards` au lieu de `zones`
- `createBoard()` : supporte position/size/color pour child boards
- `updateBoard()` : supporte tous les nouveaux champs

### Checklist UB-3

- [X] createChildBoard créé
- [X] moveChildBoard créé
- [X] resizeChildBoard créé
- [X] crystallizeBoard créé
- [X] getBoard retourne childBoards
- [X] listBoardsWithPreview retourne childBoardCount
- [X] zonesRepository.ts → fichier de transition (deprecated)

---

## ✅ UB-4 : Actions et Context (TERMINÉ)

### boardActions.ts

**Fichier** : `src/features/boards/actions/boardActions.ts`

Nouvelles actions :

- `createChildBoardAction()` - remplace createZoneAction
- `moveChildBoardAction()` - remplace moveZoneAction
- `resizeChildBoardAction()` - remplace resizeZoneAction
- `crystallizeBoardAction()` - remplace crystallizeZoneAction
- `deleteChildBoardAction()` - remplace deleteZoneAction
- `listRootBoardsAction()`
- `getRootBoardsCountAction()`
- `getBoardAncestorsAction()`
- `getChildBoardsAction()`

### elementActions.ts

**Fichier** : `src/features/boards/actions/elementActions.ts`

- Supprimé : `assignElementToZoneAction`
- Ajouté : `moveElementToBoardAction()` - déplace un élément vers un autre board

### zoneActions.ts (TRANSITION)

**Fichier** : `src/features/boards/actions/zoneActions.ts`

Fichier de transition avec aliases deprecated qui redirigent vers boardActions.

### crystallizationActions.ts

**Fichier** : `src/features/boards/actions/crystallizationActions.ts`

- `CrystallizeBoardInput` remplace `CrystallizeZoneInput`
- `crystallizeBoardAction()` remplace `crystallizeZoneAction()`
- Alias deprecated conservés pour compatibilité

### BoardContext.tsx

**Fichier** : `src/features/boards/context/BoardContext.tsx`

#### State renommé

- `zones` → `childBoards`
- `selectedZoneId` → `selectedChildBoardId`

#### Actions renommées

| Ancien               | Nouveau                    |
| -------------------- | -------------------------- |
| `addZone`          | `addChildBoard`          |
| `updateZone`       | `updateChildBoard`       |
| `moveZone`         | `moveChildBoard`         |
| `moveZoneLocal`    | `moveChildBoardLocal`    |
| `saveZonePosition` | `saveChildBoardPosition` |
| `resizeZone`       | `resizeChildBoard`       |
| `resizeZoneLocal`  | `resizeChildBoardLocal`  |
| `saveZoneSize`     | `saveChildBoardSize`     |
| `crystallizeZone`  | `crystallizeChildBoard`  |
| `removeZone`       | `removeChildBoard`       |
| `selectZone`       | `selectChildBoard`       |

#### Aliases deprecated (pour migration progressive)

```typescript
// Conservés temporairement pour compatibilité
zones: state.childBoards,
selectedZoneId: state.selectedChildBoardId,
addZone: addChildBoard,
// ... etc
```

### Checklist UB-4

- [X] boardActions avec nouvelles fonctions childBoard
- [X] elementActions sans zoneId
- [X] zoneActions en fichier de transition
- [X] crystallizationActions adapté
- [X] BoardContext avec childBoards
- [X] Aliases deprecated pour migration progressive

---

## 🔄 UB-5 : Composants UI (EN COURS)

**Durée estimée** : 2h30
**Fichiers** : Composants boards

### Erreurs TypeScript actuelles (35 erreurs)

```
src/app/(main)/boards/page.tsx          → zoneCount → childBoardCount (3 erreurs)
src/features/boards/components/AutoArrangeDialog.tsx → BoardZone (1 erreur)
src/features/boards/components/BoardCanvas.tsx       → Gros fichier (15+ erreurs)
src/features/boards/components/canvas/CanvasModals.tsx → BoardZone (1 erreur)
src/features/boards/components/CrystallizationDialog.tsx → BoardZone, zoneId (3 erreurs)
src/features/boards/components/ZoneCard.tsx          → BoardZone, helpers (3 erreurs)
src/features/boards/components/ZoneFocusOverlay.tsx  → assignElementToZone, zoneId (2 erreurs)
src/features/boards/components/canvas/hooks/useZoneDrag.ts → BoardZone (1 erreur)
src/features/boards/components/canvas/hooks/useZoneResize.ts → BoardZone (1 erreur)
```

### 5.1 - boards/page.tsx (Simple)

```typescript
// AVANT
const zoneLabel = `${board.zoneCount} zone${board.zoneCount > 1 ? 's' : ''}`;
{board.zoneCount > 0 && ...}

// APRÈS
const pieceLabel = `${board.childBoardCount} pièce${board.childBoardCount > 1 ? 's' : ''}`;
{board.childBoardCount > 0 && ...}
```

**Status** : ⬜ À faire

### 5.2 - ZoneCard.tsx → ChildBoardCard.tsx (Renommage + Adaptation)

```typescript
// AVANT
import { BoardZone, isZoneCrystallized, isZoneOrdered } from '../domain/types';
interface ZoneCardProps { zone: BoardZone; ... }

// APRÈS
import { Board, isBoardCrystallized, isBoardOrdered } from '../domain/types';
interface ChildBoardCardProps { childBoard: Board; ... }
```

**Performance** : Ajouter React.memo, forwardRef, CSS transform

**Status** : ⬜ À faire

### 5.3 - ZoneFocusOverlay.tsx → BoardFocusOverlay.tsx

- Remplacer `assignElementToZone` par logique avec `moveElementToBoardAction`
- Remplacer `zoneId` par `boardId` dans les éléments

**Status** : ⬜ À faire

### 5.4 - CrystallizationDialog.tsx

```typescript
// AVANT
interface Props { zone: BoardZone; ... }
{ zoneId: zone.id, ... }

// APRÈS
interface Props { childBoard: Board; ... }
{ boardId: childBoard.id, parentBoardId: ... }
```

**Status** : ⬜ À faire

### 5.5 - AutoArrangeDialog.tsx

```typescript
// AVANT
import { BoardZone } from '../domain/types';

// APRÈS
import { Board } from '../domain/types';
// Adapter les références
```

**Status** : ⬜ À faire

### 5.6 - CanvasModals.tsx

```typescript
// AVANT
import { BoardZone } from '../../domain/types';

// APRÈS
import { Board } from '../../domain/types';
```

**Status** : ⬜ À faire

### 5.7 - BoardCanvas.tsx (GROS FICHIER - 802 lignes)

Modifications nécessaires :

1. Imports : `BoardZone` → `Board`, `isZoneOrdered` → `isBoardOrdered`
2. Destructuring context : `zones` → `childBoards` (ou utiliser alias)
3. Variable `boardId` : adapter pour childBoards
4. `useZoneDrag` : adapter les types
5. Références `zone.positionX` : gérer les `null` (child boards ont position, root non)
6. `zone.boardId` n'existe plus : utiliser `zone.parentBoardId`
7. `el.zoneId` n'existe plus

**Status** : ⬜ À faire

### Checklist UB-5

- [ ] boards/page.tsx : zoneCount → childBoardCount
- [ ] ZoneCard.tsx renommé en ChildBoardCard.tsx
- [ ] ChildBoardCard avec React.memo + forwardRef
- [ ] ChildBoardCard avec CSS transform
- [ ] ZoneFocusOverlay.tsx renommé en BoardFocusOverlay.tsx
- [ ] BoardFocusOverlay adapté (sans assignElementToZone)
- [ ] CrystallizationDialog adapté
- [ ] AutoArrangeDialog adapté
- [ ] CanvasModals adapté
- [ ] BoardCanvas.tsx adapté
- [ ] TypeScript compile

---

## ⬜ UB-6 : Hooks Drag/Resize

**Durée estimée** : 1h15

### 6.1 - useZoneDrag.ts → useChildBoardDrag.ts

```typescript
// AVANT
import { BoardZone } from '../../../domain/types';
handleZoneMouseDown: (e: React.MouseEvent, zone: BoardZone) => void

// APRÈS
import { Board } from '../../../domain/types';
handleChildBoardMouseDown: (e: React.MouseEvent, childBoard: Board) => void
```

Adaptations :

- `zone.positionX` → `childBoard.positionX ?? 0`
- `zone.positionY` → `childBoard.positionY ?? 0`
- Import `getElementsInZone` → créer équivalent ou supprimer si plus nécessaire

### 6.2 - useZoneResize.ts → useChildBoardResize.ts

Même pattern d'adaptation.

### 6.3 - Créer boardUtils.ts

```typescript
// src/features/boards/utils/boardUtils.ts

export function getActiveChildBoards(childBoards: Board[]): Board[]
export function getCrystallizedChildBoards(childBoards: Board[]): Board[]
export function getRandomBoardColor(): string
export function getNextChildBoardPosition(existingChildBoards: Board[]): { x: number; y: number }
```

### Checklist UB-6

- [ ] useChildBoardDrag.ts créé
- [ ] useChildBoardResize.ts créé
- [ ] boardUtils.ts créé
- [ ] Fichiers obsolètes supprimés
- [ ] TypeScript compile

---

## ⬜ UB-7 : Journey et Auto-Arrange

**Durée estimée** : 1h

### 7.1 - JourneyClientWrapper.tsx

```typescript
// AVANT
import { BoardZone } from '@/features/boards/domain/types';
const crystallizedZones = zones.filter(z => z.crystallizedAt !== null);

// APRÈS
import { Board } from '@/features/boards/domain/types';
const crystallizedBoards = childBoards.filter(cb => cb.crystallizedAt !== null);
```

### 7.2 - autoArrange.ts

```typescript
// AVANT
export function autoArrange(elements: BoardElement[], zones: BoardZone[]): ArrangeResult

// APRÈS
export function autoArrange(elements: BoardElement[], childBoards: Board[]): ArrangeResult
```

### Checklist UB-7

- [ ] JourneyClientWrapper adapté
- [ ] autoArrange adapté
- [ ] Compteurs Journey corrects
- [ ] TypeScript compile

---

## ⬜ UB-8 : Nettoyage et Tests

**Durée estimée** : 30min

### 8.1 - Supprimer fichiers obsolètes

```
À SUPPRIMER :
- src/features/boards/infrastructure/zonesRepository.ts (après validation)
- src/features/boards/actions/zoneActions.ts (après validation)
- src/features/boards/utils/zoneUtils.ts
- Fichiers renommés (anciennes versions)
```

### 8.2 - Supprimer aliases deprecated dans BoardContext

Une fois tous les composants migrés, retirer :

```typescript
// À SUPPRIMER de BoardContext.tsx
zones: state.childBoards,
selectedZoneId: state.selectedChildBoardId,
addZone: addChildBoard,
// ... etc
```

### 8.3 - Migration DB finale

```sql
-- Une fois tout validé
DROP TABLE IF EXISTS deadstock.board_zones;
```

### 8.4 - Tests manuels

- [ ] Créer un board
- [ ] Ajouter des éléments
- [ ] Créer un board enfant (ex-zone)
- [ ] Drag & drop du board enfant
- [ ] Resize du board enfant
- [ ] Ouvrir le board enfant (navigation)
- [ ] Vérifier le breadcrumb
- [ ] Cristalliser un board enfant
- [ ] Vérifier Journey
- [ ] Vérifier Auto-Arrange

### Checklist UB-8

- [ ] Fichiers obsolètes supprimés
- [ ] Aliases deprecated supprimés
- [ ] Table board_zones supprimée
- [ ] TypeScript compile sans erreur
- [ ] Tests manuels passent



## ⬜ UB-9 : Focus Mode avec Transfert d'Éléments

**Durée estimée** : 2h
**Dépendances** : UB-8 (nettoyage terminé)

### 9.1 - Action moveElementToBoardAction (30min)

- Déplace un élément d'un board vers un autre
- Met à jour `boardId` de l'élément
- Recalcule la position relative si nécessaire

### 9.2 - Adaptation BoardContext (30min)

- Ajouter `moveElementToChildBoard(elementId, targetBoardId)`
- Retirer l'élément du state local
- Optimistic update

### 9.3 - Focus Mode Drag & Drop (1h)

- Activer le drop dans ZoneFocusOverlay
- Appeler moveElementToChildBoard au drop
- Afficher l'élément transféré immédiatement
- Feedback toast "Élément déplacé vers {childBoardName}"

---

## 📋 Résumé des fichiers

### ✅ Créés/Modifiés (UB-1 à UB-4)

| Fichier                                                      | Status                     |
| ------------------------------------------------------------ | -------------------------- |
| `database/migrations/035_unified_boards.sql`               | ✅ Créé et exécuté     |
| `src/types/database.types.ts`                              | ✅ Regénéré             |
| `src/features/boards/domain/types.ts`                      | ✅ Modifié                |
| `src/features/boards/infrastructure/boardsRepository.ts`   | ✅ Modifié                |
| `src/features/boards/infrastructure/elementsRepository.ts` | ✅ Modifié                |
| `src/features/boards/infrastructure/zonesRepository.ts`    | ✅ Transition (deprecated) |
| `src/features/boards/actions/boardActions.ts`              | ✅ Modifié                |
| `src/features/boards/actions/elementActions.ts`            | ✅ Modifié                |
| `src/features/boards/actions/zoneActions.ts`               | ✅ Transition (deprecated) |
| `src/features/boards/actions/crystallizationActions.ts`    | ✅ Modifié                |
| `src/features/boards/context/BoardContext.tsx`             | ✅ Modifié                |

### 🔄 À modifier (UB-5 à UB-7)

| Fichier                                                          | Action                             |
| ---------------------------------------------------------------- | ---------------------------------- |
| `src/app/(main)/boards/page.tsx`                               | Modifier (zoneCount)               |
| `src/features/boards/components/ZoneCard.tsx`                  | Renommer → ChildBoardCard.tsx     |
| `src/features/boards/components/ZoneFocusOverlay.tsx`          | Renommer → BoardFocusOverlay.tsx  |
| `src/features/boards/components/CrystallizationDialog.tsx`     | Modifier                           |
| `src/features/boards/components/AutoArrangeDialog.tsx`         | Modifier                           |
| `src/features/boards/components/BoardCanvas.tsx`               | Modifier (gros)                    |
| `src/features/boards/components/canvas/CanvasModals.tsx`       | Modifier                           |
| `src/features/boards/components/canvas/hooks/useZoneDrag.ts`   | Renommer → useChildBoardDrag.ts   |
| `src/features/boards/components/canvas/hooks/useZoneResize.ts` | Renommer → useChildBoardResize.ts |
| `src/features/boards/utils/zoneUtils.ts`                       | Remplacer → boardUtils.ts         |
| `src/features/boards/utils/autoArrange.ts`                     | Modifier                           |
| `src/features/journey/components/JourneyClientWrapper.tsx`     | Modifier                           |

### ⬜ À supprimer (UB-8)

| Fichier                                                   | Quand                       |
| --------------------------------------------------------- | --------------------------- |
| `src/features/boards/infrastructure/zonesRepository.ts` | Après validation           |
| `src/features/boards/actions/zoneActions.ts`            | Après validation           |
| `src/features/boards/utils/zoneUtils.ts`                | Après remplacement         |
| Table `board_zones`                                     | Après validation complète |

---

## 🎯 Prochaines étapes immédiates

1. **UB-5.1** : Corriger `boards/page.tsx` (5 min)
2. **UB-5.2** : Créer `ChildBoardCard.tsx` à partir de `ZoneCard.tsx` (30 min)
3. **UB-5.3** : Créer `BoardFocusOverlay.tsx` à partir de `ZoneFocusOverlay.tsx` (30 min)
4. **UB-5.4-5.6** : Adapter les petits composants (30 min)
5. **UB-5.7** : Adapter `BoardCanvas.tsx` (45 min)
6. **Test TypeScript** : `npx tsc --noEmit`

---

**Auteur** : Claude
**Dernière mise à jour** : 28 Janvier 2026 - 16h30
