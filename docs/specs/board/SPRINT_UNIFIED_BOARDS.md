# SPRINT : Unified Boards Architecture

**Version** : 1.1  
**Date** : 28 Janvier 2026  
**Référence** : ADR-032, SPRINT_PERFORMANCE_V2  
**Durée estimée** : 8h30  

---

## 🎯 Objectif

Fusionner les concepts `Board` et `Zone` en une seule entité hiérarchique pour simplifier l'architecture et permettre une imbrication infinie.

---

## ⚡ Préconisations Performance à Respecter

> Référence : `SPRINT_PERFORMANCE_V2.md` - Phases 2 et 3

### Règles obligatoires pour TOUS les composants modifiés

#### 1. Props stables pour React.memo (REACT-2)
```typescript
// ❌ INTERDIT - Nouvel objet à chaque render
<ChildBoardCard childBoard={{ ...board, positionX: pos.x }} />

// ✅ OBLIGATOIRE - Props séparées
<ChildBoardCard childBoard={board} position={position} />
```

#### 2. CSS Transform au lieu de left/top (REACT-2)
```typescript
// ❌ INTERDIT - Déclenche layout recalculation
style={{ left: position.x, top: position.y }}

// ✅ OBLIGATOIRE - GPU accelerated
style={{ 
  left: 0, 
  top: 0, 
  transform: `translate(${position.x}px, ${position.y}px)` 
}}
```

#### 3. forwardRef + useImperativeHandle pour manipulation DOM (SCALE-2)
```typescript
// Tous les composants draggables DOIVENT exposer setTransform
export interface ChildBoardCardHandle {
  setTransform: (x: number, y: number) => void;
  resetTransform: () => void;
}

export const ChildBoardCard = React.memo(
  forwardRef<ChildBoardCardHandle, ChildBoardCardProps>((props, ref) => {
    const cardRef = useRef<HTMLDivElement>(null);
    
    useImperativeHandle(ref, () => ({
      setTransform: (x: number, y: number) => {
        if (cardRef.current) {
          cardRef.current.style.transform = `translate(${x}px, ${y}px)`;
        }
      },
      resetTransform: () => {
        if (cardRef.current) {
          cardRef.current.style.transform = '';
        }
      },
    }));
    
    // ...
  })
);
```

#### 4. requestAnimationFrame throttling pour drag (SCALE-2)
```typescript
// Dans useChildBoardDrag.ts
const rafRef = useRef<number | null>(null);

const handleMouseMove = useCallback((e: MouseEvent) => {
  if (rafRef.current) return; // Skip si frame en cours
  
  rafRef.current = requestAnimationFrame(() => {
    // Manipulation DOM directe pendant le drag
    cardRef.current?.setTransform(newX, newY);
    rafRef.current = null;
  });
}, []);
```

#### 5. Lazy mount des modals (REACT-1)
```typescript
// ❌ INTERDIT - Toujours monté
<BoardFocusOverlay isOpen={showFocusOverlay} ... />

// ✅ OBLIGATOIRE - Lazy mount
{showFocusOverlay && <BoardFocusOverlay ... />}
```

#### 6. Mémoisation des callbacks dans les maps
```typescript
// Pour les listes de boards enfants, utiliser useMemo pour les callbacks
const childBoardCallbacks = useMemo(() => {
  const map = new Map<string, ChildBoardCallbacks>();
  childBoards.forEach(cb => {
    map.set(cb.id, {
      onMouseDown: (e: React.MouseEvent) => handleChildBoardMouseDown(e, cb),
      onDoubleClick: () => handleDoubleClick(cb),
    });
  });
  return map;
}, [childBoards, handleChildBoardMouseDown, handleDoubleClick]);
```

### Checklist Performance à valider pour chaque composant

- [ ] `React.memo()` wrapping
- [ ] Props position/size séparées (pas de spread)
- [ ] CSS `transform` pour positionnement
- [ ] `forwardRef` + `useImperativeHandle` si draggable
- [ ] RAF throttling dans les hooks de drag
- [ ] Lazy mount pour overlays/modals
- [ ] Callbacks mémorisés pour les listes

---

## 📊 Tableau de Suivi

| Sprint | Nom | Durée | Status | Dépendances |
|--------|-----|-------|--------|-------------|
| UB-1 | Migration Database | 1h | ⬜ À faire | - |
| UB-2 | Types et Mappers | 45min | ⬜ À faire | UB-1 |
| UB-3 | Repository Unifié | 45min | ⬜ À faire | UB-2 |
| UB-4 | BoardContext Adapté | 1h30 | ⬜ À faire | UB-3 |
| UB-5 | Composants UI (+ Perf) | 2h30 | ⬜ À faire | UB-4 |
| UB-6 | Hooks Drag/Resize (+ Perf) | 1h15 | ⬜ À faire | UB-5 |
| UB-7 | Journey et Auto-Arrange | 1h | ⬜ À faire | UB-5 |
| UB-8 | Nettoyage et Tests | 30min | ⬜ À faire | UB-7 |

**Total estimé : 9h15**

**Légende** : ⬜ À faire | 🔄 En cours | ✅ Terminé | ⏸️ Bloqué

### Optimisations Performance intégrées

| Réf | Optimisation | Sprint(s) |
|-----|--------------|-----------|
| REACT-1 | Lazy mount modals/overlays | UB-5 |
| REACT-2 | Props stables + CSS Transform | UB-5 |
| SCALE-2 | RAF throttling + DOM direct | UB-6 |
| FUTURE-3 | Callbacks mémorisés | UB-5 |

---

## UB-1 : Migration Database

**Durée** : 1h  
**Fichiers** : `database/migrations/035_unified_boards.sql`

### 1.1 - Ajouter colonnes à `boards`

```sql
-- Migration: 035_unified_boards.sql
-- Unification Board + Zone

-- 1. Ajouter colonnes de positionnement (pour affichage sur canvas parent)
ALTER TABLE deadstock.boards
ADD COLUMN IF NOT EXISTS position_x FLOAT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS position_y FLOAT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS width FLOAT DEFAULT 280,
ADD COLUMN IF NOT EXISTS height FLOAT DEFAULT 140;

-- 2. Ajouter couleur (pour la carte visuelle)
ALTER TABLE deadstock.boards
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6366F1';

-- 3. Ajouter colonnes de cristallisation (depuis zones)
ALTER TABLE deadstock.boards
ADD COLUMN IF NOT EXISTS crystallized_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS linked_project_id UUID REFERENCES deadstock.projects(id) ON DELETE SET NULL;

-- 4. Index pour les boards enfants d'un parent
CREATE INDEX IF NOT EXISTS idx_boards_parent_children 
ON deadstock.boards(parent_board_id) 
WHERE parent_board_id IS NOT NULL;

COMMENT ON COLUMN deadstock.boards.position_x IS 'Position X sur le canvas du board parent (null si board racine)';
COMMENT ON COLUMN deadstock.boards.position_y IS 'Position Y sur le canvas du board parent (null si board racine)';
COMMENT ON COLUMN deadstock.boards.color IS 'Couleur de la carte visuelle';
COMMENT ON COLUMN deadstock.boards.crystallized_at IS 'Date de cristallisation (passage en projet)';
```

### 1.2 - Migrer données `board_zones` → `boards`

```sql
-- Migrer les zones existantes en boards enfants
INSERT INTO deadstock.boards (
  id,
  user_id,
  session_id,
  parent_board_id,
  name,
  status,
  board_type,
  position_x,
  position_y,
  width,
  height,
  color,
  crystallized_at,
  linked_project_id,
  created_at,
  updated_at
)
SELECT 
  bz.id,  -- Garder le même ID pour ne pas casser les références
  b.user_id,
  b.session_id,
  bz.board_id AS parent_board_id,  -- Le board_id de la zone devient le parent
  bz.name,
  CASE WHEN bz.crystallized_at IS NOT NULL THEN 'crystallized' ELSE 'active' END,
  COALESCE(bz.zone_type, 'piece'),
  bz.position_x,
  bz.position_y,
  bz.width,
  bz.height,
  bz.color,
  bz.crystallized_at,
  bz.linked_project_id,
  bz.created_at,
  NOW()
FROM deadstock.board_zones bz
JOIN deadstock.boards b ON bz.board_id = b.id
WHERE NOT EXISTS (
  SELECT 1 FROM deadstock.boards WHERE id = bz.id
);
```

### 1.3 - Migrer `zone_id` des éléments vers `board_id`

```sql
-- Les éléments avec zone_id doivent pointer vers le board (ex-zone)
UPDATE deadstock.board_elements
SET board_id = zone_id
WHERE zone_id IS NOT NULL;
```

### 1.4 - Supprimer `zone_id` et table `board_zones`

```sql
-- Supprimer la colonne zone_id
ALTER TABLE deadstock.board_elements
DROP COLUMN IF EXISTS zone_id;

-- Supprimer la table board_zones (après vérification migration OK)
-- DROP TABLE IF EXISTS deadstock.board_zones;
-- Note: Garder commenté jusqu'à validation complète
```

### Checklist UB-1
- [ ] Migration 035 créée et testée localement
- [ ] Données migrées correctement
- [ ] Éléments pointent vers les bons boards
- [ ] Backup avant migration prod

---

## UB-2 : Types et Mappers

**Durée** : 45min  
**Fichiers** : `src/features/boards/domain/types.ts`

### 2.1 - Enrichir interface `Board`

```typescript
// AVANT
export interface Board {
  id: string;
  userId: string | null;
  sessionId: string | null;
  parentBoardId: string | null;
  name: string | null;
  description: string | null;
  status: BoardStatus;
  boardType: BoardType;
  coverImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// APRÈS
export interface Board {
  id: string;
  userId: string | null;
  sessionId: string | null;
  parentBoardId: string | null;
  name: string | null;
  description: string | null;
  status: BoardStatus;
  boardType: BoardType;
  coverImageUrl: string | null;
  // Nouveaux champs (depuis zones)
  positionX: number | null;      // null si board racine
  positionY: number | null;      // null si board racine
  width: number;
  height: number;
  color: string;
  crystallizedAt: Date | null;
  linkedProjectId: string | null;
  linkedProjectStatus: string | null;  // Pour affichage
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 - Supprimer `BoardZone` et types associés

```typescript
// SUPPRIMER
export interface BoardZone { ... }
export interface BoardZoneRow { ... }
export interface CreateZoneInput { ... }
export interface UpdateZoneInput { ... }
export type ZoneType = 'piece' | 'category';

// GARDER et ADAPTER
export interface CreateBoardInput {
  name?: string;
  description?: string;
  status?: BoardStatus;
  parentBoardId?: string;      // Pour créer un board enfant
  boardType?: BoardType;
  // Nouveaux champs optionnels
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  color?: string;
}
```

### 2.3 - Adapter `mapBoardFromRow`

```typescript
export function mapBoardFromRow(row: BoardRow): Board {
  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id,
    parentBoardId: row.parent_board_id,
    name: row.name,
    description: row.description,
    status: row.status as BoardStatus,
    boardType: (row.board_type || 'free') as BoardType,
    coverImageUrl: row.cover_image_url,
    // Nouveaux champs
    positionX: row.position_x,
    positionY: row.position_y,
    width: row.width ?? 280,
    height: row.height ?? 140,
    color: row.color ?? '#6366F1',
    crystallizedAt: row.crystallized_at ? new Date(row.crystallized_at) : null,
    linkedProjectId: row.linked_project_id,
    linkedProjectStatus: row.linked_project_status || null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
```

### 2.4 - Supprimer `mapZoneFromRow`

Supprimer complètement la fonction.

### Checklist UB-2
- [ ] Interface Board enrichie
- [ ] BoardZone et types associés supprimés
- [ ] Mappers adaptés
- [ ] TypeScript compile sans erreur

---

## UB-3 : Repository Unifié

**Durée** : 45min  
**Fichiers** : `src/features/boards/infrastructure/boardsRepository.ts`

### 3.1 - Ajouter fonctions pour boards enfants

```typescript
// Récupérer les boards enfants (ex-zones) d'un board
export async function getChildBoards(parentBoardId: string): Promise<Board[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('parent_board_id', parentBoardId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getChildBoards error:', error);
    throw error;
  }

  return (data || []).map((row) => mapBoardFromRow(row as BoardRow));
}

// Créer un board enfant (ex-zone)
export async function createChildBoard(
  parentBoardId: string,
  input: CreateBoardInput,
  userId: string
): Promise<Board> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('boards')
    .insert({
      user_id: userId,
      parent_board_id: parentBoardId,
      name: input.name || 'Nouvelle pièce',
      status: input.status || 'active',
      board_type: input.boardType || 'piece',
      position_x: input.positionX ?? 50,
      position_y: input.positionY ?? 50,
      width: input.width ?? 280,
      height: input.height ?? 140,
      color: input.color || getRandomColor(),
    })
    .select()
    .single();

  if (error) {
    console.error('createChildBoard error:', error);
    throw error;
  }

  return mapBoardFromRow(data as BoardRow);
}

// Déplacer un board enfant sur le canvas
export async function moveChildBoard(
  boardId: string,
  positionX: number,
  positionY: number
): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('boards')
    .update({ position_x: positionX, position_y: positionY })
    .eq('id', boardId);

  if (error) {
    console.error('moveChildBoard error:', error);
    throw error;
  }

  return true;
}

// Redimensionner un board enfant
export async function resizeChildBoard(
  boardId: string,
  width: number,
  height: number
): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('boards')
    .update({ width, height })
    .eq('id', boardId);

  if (error) {
    console.error('resizeChildBoard error:', error);
    throw error;
  }

  return true;
}

// Cristalliser un board (ex-zone)
export async function crystallizeBoard(
  boardId: string,
  projectId: string
): Promise<Board | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('boards')
    .update({
      crystallized_at: new Date().toISOString(),
      linked_project_id: projectId,
      status: 'crystallized',
    })
    .eq('id', boardId)
    .select()
    .single();

  if (error) {
    console.error('crystallizeBoard error:', error);
    throw error;
  }

  return mapBoardFromRow(data as BoardRow);
}
```

### 3.2 - Adapter `getBoard` pour inclure les enfants

```typescript
export async function getBoard(
  boardId: string,
  userId: string
): Promise<BoardWithDetails | null> {
  // ... code existant pour récupérer le board et ses éléments ...

  // Récupérer les boards enfants (remplace zones)
  const { data: childBoardsData, error: childBoardsError } = await supabase
    .from('boards')
    .select('*')
    .eq('parent_board_id', boardId)
    .order('created_at', { ascending: true });

  if (childBoardsError) {
    console.error('getBoard childBoards error:', childBoardsError);
    throw childBoardsError;
  }

  const childBoards = (childBoardsData || []).map((row) => mapBoardFromRow(row as BoardRow));

  return {
    ...board,
    elements,
    childBoards,  // Remplace zones
    elementCount: elements.length,
    childBoardCount: childBoards.length,
  };
}
```

### 3.3 - Supprimer `zonesRepository.ts`

Le fichier entier sera supprimé après migration complète.

### Checklist UB-3
- [ ] Fonctions childBoards ajoutées
- [ ] getBoard retourne childBoards
- [ ] Export mis à jour
- [ ] TypeScript compile

---

## UB-4 : BoardContext Adapté

**Durée** : 1h30  
**Fichiers** : `src/features/boards/context/BoardContext.tsx`

### 4.1 - Remplacer `zones` par `childBoards`

```typescript
// AVANT
interface BoardState {
  board: Board | null;
  elements: BoardElement[];
  zones: BoardZone[];
  // ...
}

// APRÈS
interface BoardState {
  board: Board | null;
  elements: BoardElement[];
  childBoards: Board[];  // Remplace zones
  // ...
}
```

### 4.2 - Adapter les actions

```typescript
// AVANT
type BoardAction =
  | { type: 'ADD_ZONE'; zone: BoardZone }
  | { type: 'UPDATE_ZONE'; zone: BoardZone }
  | { type: 'DELETE_ZONE'; zoneId: string }
  | { type: 'ASSIGN_ELEMENT_TO_ZONE'; elementId: string; zoneId: string | null }
  // ...

// APRÈS
type BoardAction =
  | { type: 'ADD_CHILD_BOARD'; childBoard: Board }
  | { type: 'UPDATE_CHILD_BOARD'; childBoard: Board }
  | { type: 'DELETE_CHILD_BOARD'; childBoardId: string }
  | { type: 'MOVE_ELEMENT_TO_BOARD'; elementId: string; targetBoardId: string }
  // ...
```

### 4.3 - Adapter le reducer

```typescript
function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'ADD_CHILD_BOARD':
      return {
        ...state,
        childBoards: [...state.childBoards, action.childBoard],
      };

    case 'UPDATE_CHILD_BOARD':
      return {
        ...state,
        childBoards: state.childBoards.map((cb) =>
          cb.id === action.childBoard.id ? action.childBoard : cb
        ),
      };

    case 'DELETE_CHILD_BOARD':
      return {
        ...state,
        childBoards: state.childBoards.filter((cb) => cb.id !== action.childBoardId),
      };

    case 'MOVE_ELEMENT_TO_BOARD':
      // L'élément disparaît du board courant (il est dans un autre board maintenant)
      return {
        ...state,
        elements: state.elements.filter((el) => el.id !== action.elementId),
      };

    // ... autres cas
  }
}
```

### 4.4 - Adapter les callbacks exposés

```typescript
// AVANT
const addZone = useCallback(async (name, position) => { ... }, []);
const updateZone = useCallback(async (zoneId, input) => { ... }, []);
const deleteZone = useCallback(async (zoneId) => { ... }, []);
const assignElementToZone = useCallback(async (elementId, zoneId) => { ... }, []);

// APRÈS
const addChildBoard = useCallback(async (name: string, position?: { x: number; y: number }) => {
  if (!board) return;
  const result = await createChildBoardAction(board.id, name, position);
  if (result.success && result.data) {
    dispatch({ type: 'ADD_CHILD_BOARD', childBoard: result.data });
  }
  return result;
}, [board]);

const updateChildBoard = useCallback(async (childBoardId: string, input: UpdateBoardInput) => {
  const result = await updateBoardAction(childBoardId, input);
  if (result.success && result.data) {
    dispatch({ type: 'UPDATE_CHILD_BOARD', childBoard: result.data });
  }
  return result;
}, []);

const deleteChildBoard = useCallback(async (childBoardId: string) => {
  const result = await deleteBoardAction(childBoardId);
  if (result.success) {
    dispatch({ type: 'DELETE_CHILD_BOARD', childBoardId });
  }
  return result;
}, []);

const moveElementToBoard = useCallback(async (elementId: string, targetBoardId: string) => {
  const result = await moveElementToBoardAction(elementId, targetBoardId);
  if (result.success) {
    dispatch({ type: 'MOVE_ELEMENT_TO_BOARD', elementId, targetBoardId });
  }
  return result;
}, []);
```

### Checklist UB-4
- [ ] State adapté (zones → childBoards)
- [ ] Actions adaptées
- [ ] Reducer adapté
- [ ] Callbacks adaptés
- [ ] TypeScript compile

---

## UB-5 : Composants UI (avec Performance)

**Durée** : 2h30  
**Fichiers** : Voir liste ci-dessous  
**Performance** : REACT-1, REACT-2, SCALE-2

### 5.1 - Créer `ChildBoardCard.tsx` (remplace ZoneCard)

```typescript
// src/features/boards/components/ChildBoardCard.tsx
'use client';

import React, { forwardRef, useRef, useImperativeHandle, memo } from 'react';
import { ChildBoardThumbnail } from './ChildBoardThumbnail';
import type { Board } from '../domain/types';

// ===== PERFORMANCE: Interface pour manipulation DOM directe =====
export interface ChildBoardCardHandle {
  setTransform: (x: number, y: number) => void;
  resetTransform: () => void;
}

interface ChildBoardCardProps {
  childBoard: Board;
  // PERFORMANCE: Props séparées pour position (pas de spread)
  position: { x: number; y: number };
  size: { width: number; height: number };
  isSelected?: boolean;
  isCrystallized?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
}

export const ChildBoardCard = memo(
  forwardRef<ChildBoardCardHandle, ChildBoardCardProps>(
    ({ childBoard, position, size, isSelected, isCrystallized, onMouseDown, onDoubleClick }, ref) => {
      const cardRef = useRef<HTMLDivElement>(null);

      // ===== PERFORMANCE: Expose DOM manipulation for drag =====
      useImperativeHandle(ref, () => ({
        setTransform: (x: number, y: number) => {
          if (cardRef.current) {
            cardRef.current.style.transform = `translate(${x}px, ${y}px)`;
          }
        },
        resetTransform: () => {
          if (cardRef.current) {
            cardRef.current.style.transform = '';
          }
        },
      }));

      return (
        <div
          ref={cardRef}
          className={`
            absolute cursor-pointer
            bg-white dark:bg-gray-800
            border-2 rounded-xl shadow-md
            transition-shadow hover:shadow-lg
            ${isSelected ? 'ring-2 ring-blue-500' : ''}
            ${isCrystallized ? 'border-amber-400' : 'border-gray-200 dark:border-gray-700'}
          `}
          // ===== PERFORMANCE: CSS Transform au lieu de left/top =====
          style={{
            left: 0,
            top: 0,
            transform: `translate(${position.x}px, ${position.y}px)`,
            width: size.width,
            height: size.height,
            borderLeftColor: childBoard.color,
            borderLeftWidth: 4,
          }}
          onMouseDown={onMouseDown}
          onDoubleClick={onDoubleClick}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-medium text-sm truncate">
              {childBoard.name || 'Sans titre'}
            </h3>
          </div>
          
          {/* Thumbnails grid */}
          <div className="p-2">
            <ChildBoardThumbnail boardId={childBoard.id} />
          </div>
        </div>
      );
    }
  )
);

ChildBoardCard.displayName = 'ChildBoardCard';
```

### 5.2 - Créer `BoardFocusOverlay.tsx` (remplace ZoneFocusOverlay)

```typescript
// PERFORMANCE: Lazy mount obligatoire dans le parent
// {showFocusOverlay && <BoardFocusOverlay ... />}

// Le composant charge les éléments du board enfant
const [childBoardElements, setChildBoardElements] = useState<BoardElement[]>([]);

useEffect(() => {
  if (focusedChildBoard) {
    // Charger les éléments du board enfant
    getElementsByBoardAction(focusedChildBoard.id).then(result => {
      if (result.success) {
        setChildBoardElements(result.data || []);
      }
    });
  }
}, [focusedChildBoard]);
```

### 5.3 - Adapter `BoardCanvas.tsx`

```typescript
// PERFORMANCE: Utiliser les callbacks mémorisés
const childBoardRefs = useRef<Map<string, ChildBoardCardHandle>>(new Map());

// Callbacks mémorisés pour les boards enfants
const childBoardCallbacks = useMemo(() => {
  const map = new Map<string, {
    onMouseDown: (e: React.MouseEvent) => void;
    onDoubleClick: () => void;
  }>();
  
  childBoards.forEach(cb => {
    map.set(cb.id, {
      onMouseDown: (e: React.MouseEvent) => handleChildBoardMouseDown(e, cb),
      onDoubleClick: () => openFocusMode(cb),
    });
  });
  
  return map;
}, [childBoards, handleChildBoardMouseDown, openFocusMode]);

// Rendu avec refs
{childBoards.map((childBoard) => {
  const callbacks = childBoardCallbacks.get(childBoard.id);
  return (
    <ChildBoardCard
      key={childBoard.id}
      ref={(handle) => {
        if (handle) childBoardRefs.current.set(childBoard.id, handle);
        else childBoardRefs.current.delete(childBoard.id);
      }}
      childBoard={childBoard}
      position={{ x: childBoard.positionX ?? 0, y: childBoard.positionY ?? 0 }}
      size={{ width: childBoard.width, height: childBoard.height }}
      isSelected={selectedIds.includes(childBoard.id)}
      isCrystallized={childBoard.crystallizedAt !== null}
      onMouseDown={callbacks?.onMouseDown}
      onDoubleClick={callbacks?.onDoubleClick}
    />
  );
})}

// PERFORMANCE: Lazy mount du focus overlay
{focusedChildBoard && (
  <BoardFocusOverlay />
)}
```

### 5.4 - Adapter `BoardToolbar.tsx`

Le bouton "Ajouter zone" devient "Ajouter pièce" et appelle `addChildBoard`.

### Checklist UB-5
- [ ] ChildBoardCard avec React.memo + forwardRef
- [ ] ChildBoardCard utilise CSS transform
- [ ] ChildBoardCard expose setTransform/resetTransform
- [ ] BoardFocusOverlay en lazy mount
- [ ] BoardCanvas avec callbacks mémorisés
- [ ] BoardCanvas maintient Map de refs
- [ ] Tous les imports mis à jour
- [ ] TypeScript compile

---

## UB-6 : Hooks (Drag, Resize) avec Performance

**Durée** : 1h15  
**Fichiers** : `src/features/boards/hooks/`  
**Performance** : SCALE-2 (RAF throttling, DOM direct)

### 6.1 - Créer `useChildBoardDrag.ts` (remplace useZoneDrag)

```typescript
// src/features/boards/hooks/useChildBoardDrag.ts
'use client';

import { useCallback, useRef, useEffect } from 'react';
import { moveChildBoardAction } from '../actions/boardActions';
import type { Board } from '../domain/types';
import type { ChildBoardCardHandle } from '../components/ChildBoardCard';

interface UseChildBoardDragProps {
  childBoard: Board;
  cardRef: React.RefObject<ChildBoardCardHandle>;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  disabled?: boolean;
}

export function useChildBoardDrag({
  childBoard,
  cardRef,
  onDragStart,
  onDragEnd,
  disabled = false,
}: UseChildBoardDragProps) {
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startMouse = useRef({ x: 0, y: 0 });
  
  // ===== PERFORMANCE: RAF throttling =====
  const rafRef = useRef<number | null>(null);
  const currentPos = useRef({ x: childBoard.positionX ?? 0, y: childBoard.positionY ?? 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    isDragging.current = true;
    startPos.current = { x: childBoard.positionX ?? 0, y: childBoard.positionY ?? 0 };
    startMouse.current = { x: e.clientX, y: e.clientY };
    currentPos.current = startPos.current;
    
    onDragStart?.();
  }, [childBoard.positionX, childBoard.positionY, disabled, onDragStart]);

  useEffect(() => {
    if (!isDragging.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      // ===== PERFORMANCE: Skip si frame en cours =====
      if (rafRef.current) return;
      
      rafRef.current = requestAnimationFrame(() => {
        const deltaX = e.clientX - startMouse.current.x;
        const deltaY = e.clientY - startMouse.current.y;
        
        const newX = startPos.current.x + deltaX;
        const newY = startPos.current.y + deltaY;
        
        currentPos.current = { x: newX, y: newY };
        
        // ===== PERFORMANCE: Manipulation DOM directe =====
        cardRef.current?.setTransform(newX, newY);
        
        rafRef.current = null;
      });
    };

    const handleMouseUp = async () => {
      if (!isDragging.current) return;
      
      // Cancel pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      isDragging.current = false;
      
      // ===== PERFORMANCE: Reset transform et sync React state =====
      cardRef.current?.resetTransform();
      
      // Sauvegarder la position finale
      const { x, y } = currentPos.current;
      if (x !== startPos.current.x || y !== startPos.current.y) {
        await moveChildBoardAction(childBoard.id, x, y);
      }
      
      onDragEnd?.();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [childBoard.id, cardRef, onDragEnd]);

  return { handleMouseDown, isDragging: isDragging.current };
}
```

### 6.2 - Créer `useChildBoardResize.ts` (remplace useZoneResize)

```typescript
// Même pattern avec RAF throttling et DOM direct
// Utilise cardRef.current.style.width/height pendant le resize
// Sync avec React state à la fin
```

### 6.3 - Supprimer fichiers obsolètes

```
À SUPPRIMER :
- src/features/boards/hooks/useZoneDrag.ts
- src/features/boards/hooks/useZoneResize.ts  
- src/features/boards/utils/zoneUtils.ts
```

### 6.4 - Créer `boardUtils.ts` (remplace zoneUtils)

```typescript
// src/features/boards/utils/boardUtils.ts

import type { Board, BoardElement } from '../domain/types';

// Récupérer les boards enfants non cristallisés
export function getActiveChildBoards(childBoards: Board[]): Board[] {
  return childBoards.filter(cb => cb.crystallizedAt === null);
}

// Récupérer les boards enfants cristallisés
export function getCrystallizedChildBoards(childBoards: Board[]): Board[] {
  return childBoards.filter(cb => cb.crystallizedAt !== null);
}

// Générer une couleur aléatoire pour un nouveau board enfant
const BOARD_COLORS = [
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#06B6D4', // Cyan
];

export function getRandomBoardColor(): string {
  return BOARD_COLORS[Math.floor(Math.random() * BOARD_COLORS.length)];
}

// Calculer la prochaine position disponible pour un nouveau board enfant
export function getNextChildBoardPosition(
  existingChildBoards: Board[],
  canvasWidth: number = 1200
): { x: number; y: number } {
  if (existingChildBoards.length === 0) {
    return { x: 50, y: 400 }; // En bas du canvas par défaut
  }
  
  // Trouver la position la plus à droite
  const rightmost = existingChildBoards.reduce((max, cb) => {
    const right = (cb.positionX ?? 0) + cb.width;
    return right > max ? right : max;
  }, 0);
  
  // Si on dépasse la largeur, nouvelle ligne
  if (rightmost + 300 > canvasWidth) {
    const bottommost = existingChildBoards.reduce((max, cb) => {
      const bottom = (cb.positionY ?? 0) + cb.height;
      return bottom > max ? bottom : max;
    }, 0);
    return { x: 50, y: bottommost + 20 };
  }
  
  return { x: rightmost + 20, y: existingChildBoards[0]?.positionY ?? 400 };
}
```

### Checklist UB-6
- [ ] useChildBoardDrag avec RAF throttling
- [ ] useChildBoardDrag avec DOM direct (setTransform)
- [ ] useChildBoardDrag sync React à la fin du drag
- [ ] useChildBoardResize même pattern
- [ ] boardUtils créé avec helpers
- [ ] Fichiers obsolètes supprimés (useZoneDrag, useZoneResize, zoneUtils)
- [ ] TypeScript compile

---

## UB-7 : Journey et Auto-Arrange

**Durée** : 1h  
**Fichiers** : Journey components, autoArrange.ts

### 7.1 - Adapter `JourneyClientWrapper.tsx`

```typescript
// AVANT
const crystallizedZones = zones.filter(z => z.crystallizedAt !== null);

// APRÈS  
const crystallizedBoards = childBoards.filter(cb => cb.crystallizedAt !== null);
```

### 7.2 - Adapter `autoArrange.ts`

```typescript
// AVANT
export function autoArrange(elements: BoardElement[], zones: BoardZone[]): ArrangeResult

// APRÈS
export function autoArrange(elements: BoardElement[], childBoards: Board[]): ArrangeResult {
  // Même logique mais avec childBoards
  // Les boards enfants vont dans la section "Pièces" en bas
}
```

### 7.3 - Adapter phase Execution

```typescript
// La phase "execution" affiche les boards enfants cristallisés
{phase.id === 'execution' && (
  <div className="grid gap-4">
    {crystallizedBoards.map(childBoard => (
      <CrystallizedBoardCard 
        key={childBoard.id} 
        board={childBoard}
        onClick={() => router.push(`/boards/${childBoard.id}`)}
      />
    ))}
  </div>
)}
```

### Checklist UB-7
- [ ] JourneyClientWrapper adapté
- [ ] autoArrange adapté
- [ ] Phase Execution adaptée
- [ ] Compteurs Journey corrects

---

## UB-8 : Nettoyage et Tests

**Durée** : 30min

### 8.1 - Supprimer fichiers obsolètes

```
À SUPPRIMER :
- src/features/boards/infrastructure/zonesRepository.ts
- src/features/boards/actions/zoneActions.ts (fusionner dans boardActions)
- src/features/boards/utils/zoneUtils.ts
- src/features/boards/context/ZoneFocusContext.tsx (renommé)
- src/features/boards/components/ZoneCard.tsx (renommé)
- src/features/boards/components/ZoneFocusOverlay.tsx (renommé)
- src/features/boards/components/ZoneElementThumbnail.tsx (renommer en ChildBoardThumbnail)
- src/features/boards/hooks/useZoneDrag.ts (renommé)
- src/features/boards/hooks/useZoneResize.ts (renommé)
```

### 8.2 - Vérification TypeScript

```powershell
npx tsc --noEmit
```

### 8.3 - Tests manuels

- [ ] Créer un board
- [ ] Ajouter des éléments
- [ ] Créer un board enfant (ex-zone)
- [ ] Glisser un élément dans le board enfant via Focus Mode
- [ ] Ouvrir le board enfant (navigation)
- [ ] Vérifier le breadcrumb
- [ ] Créer un board petit-enfant (récursivité)
- [ ] Cristalliser un board enfant
- [ ] Vérifier Journey
- [ ] Vérifier Auto-Arrange

### 8.4 - Migration commentée finale

```sql
-- Une fois tout validé, supprimer la table board_zones
DROP TABLE IF EXISTS deadstock.board_zones;
```

### Checklist UB-8
- [ ] Fichiers obsolètes supprimés
- [ ] TypeScript compile sans erreur
- [ ] Tests manuels passent
- [ ] Migration finale appliquée

---

## 📋 Résumé des fichiers impactés

### À CRÉER
- `database/migrations/035_unified_boards.sql`

### À MODIFIER
- `src/features/boards/domain/types.ts`
- `src/features/boards/infrastructure/boardsRepository.ts`
- `src/features/boards/context/BoardContext.tsx`
- `src/features/boards/components/BoardCanvas.tsx`
- `src/features/boards/components/BoardToolbar.tsx`
- `src/features/journey/components/JourneyClientWrapper.tsx`
- `src/features/boards/utils/autoArrange.ts`

### À RENOMMER
- `ZoneCard.tsx` → `ChildBoardCard.tsx`
- `ZoneFocusOverlay.tsx` → `BoardFocusOverlay.tsx`
- `ZoneFocusContext.tsx` → `BoardFocusContext.tsx`
- `ZoneElementThumbnail.tsx` → `ChildBoardThumbnail.tsx`
- `useZoneDrag.ts` → `useChildBoardDrag.ts`
- `useZoneResize.ts` → `useChildBoardResize.ts`

### À SUPPRIMER
- `src/features/boards/infrastructure/zonesRepository.ts`
- `src/features/boards/actions/zoneActions.ts`
- `src/features/boards/utils/zoneUtils.ts`

---

## 🎯 Critères de succès

| Critère | Mesure |
|---------|--------|
| Compilation | `npx tsc --noEmit` sans erreur |
| Fonctionnalités | Toutes les features existantes marchent |
| Performance drag | Rendering < 200ms (vs 359ms avant optimisations) |
| Performance total | Total drag < 7s pour 30 éléments |
| Code | ~25% de fichiers en moins |
| Récursivité | Board → Board enfant → Board petit-enfant fonctionne |

### Checklist Performance finale

- [ ] ChildBoardCard utilise `React.memo` + `forwardRef`
- [ ] ChildBoardCard utilise CSS `transform` (pas left/top)
- [ ] useChildBoardDrag utilise `requestAnimationFrame`
- [ ] useChildBoardDrag fait manipulation DOM directe pendant drag
- [ ] BoardFocusOverlay en lazy mount
- [ ] Callbacks mémorisés dans BoardCanvas
- [ ] Pas de spread d'objets dans les props

---

**Auteur** : Claude  
**Dernière mise à jour** : 28 Janvier 2026
