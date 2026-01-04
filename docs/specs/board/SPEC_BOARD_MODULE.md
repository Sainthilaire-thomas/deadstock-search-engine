# Spécifications Module Board

**Version:** 1.0  
**Date:** 04/01/2026  
**Statut:** À implémenter

---

## 1. Vue d'ensemble

Le module Board est le **pivot central** de l'application. Il permet aux utilisateurs d'accumuler, organiser et faire mûrir leurs idées créatives avant de les transformer en projets concrets.

### Principes directeurs

1. **Board = espace de travail visuel** (canvas 2D)
2. **Éléments hétérogènes** (tissus, palettes, images, calculs, notes)
3. **Organisation libre** avec zones optionnelles
4. **Persistence temps réel** (sauvegarde automatique)
5. **Multi-boards** par utilisateur

---

## 2. Modèle de données

### 2.1 Schéma relationnel

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     boards      │       │  board_elements │       │   board_zones   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │    ┌──│ id (PK)         │
│ user_id (FK)    │  │    │ board_id (FK)   │◀───┤  │ board_id (FK)   │◀──┐
│ session_id      │  └───▶│ zone_id (FK)    │────┘  │ name            │   │
│ name            │       │ element_type    │       │ color           │   │
│ description     │       │ element_data    │       │ position_x      │   │
│ status          │       │ position_x      │       │ position_y      │   │
│ created_at      │       │ position_y      │       │ width           │   │
│ updated_at      │       │ width           │       │ height          │   │
└─────────────────┘       │ height          │       │ created_at      │   │
                          │ z_index         │       └─────────────────┘   │
                          │ created_at      │                             │
                          │ updated_at      │                             │
                          └─────────────────┘                             │
                                   │                                      │
                                   └──────────────────────────────────────┘
```

### 2.2 Table `boards`

```sql
CREATE TABLE deadstock.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ownership (même pattern que favorites/projects)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  
  -- Métadonnées
  name TEXT,  -- NULL = "Sans titre"
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',  -- draft, active, archived
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Contraintes
  CONSTRAINT boards_owner_check CHECK (
    user_id IS NOT NULL OR session_id IS NOT NULL
  )
);

-- Index
CREATE INDEX idx_boards_user_id ON deadstock.boards(user_id);
CREATE INDEX idx_boards_session_id ON deadstock.boards(session_id);
CREATE INDEX idx_boards_status ON deadstock.boards(status);
CREATE INDEX idx_boards_updated_at ON deadstock.boards(updated_at DESC);

-- RLS
ALTER TABLE deadstock.boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "boards_select_own" ON deadstock.boards
  FOR SELECT USING (
    user_id = auth.uid() OR 
    session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "boards_insert_own" ON deadstock.boards
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "boards_update_own" ON deadstock.boards
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "boards_delete_own" ON deadstock.boards
  FOR DELETE USING (
    user_id = auth.uid() OR 
    session_id = current_setting('app.session_id', true)
  );
```

### 2.3 Table `board_zones`

```sql
CREATE TABLE deadstock.board_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES deadstock.boards(id) ON DELETE CASCADE,
  
  -- Métadonnées
  name TEXT NOT NULL DEFAULT 'Nouvelle zone',
  color TEXT DEFAULT '#E5E7EB',  -- Couleur de fond/bordure
  
  -- Position et taille sur le canvas
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  width FLOAT NOT NULL DEFAULT 400,
  height FLOAT NOT NULL DEFAULT 300,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_board_zones_board_id ON deadstock.board_zones(board_id);

-- RLS (hérite du board parent)
ALTER TABLE deadstock.board_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_zones_access" ON deadstock.board_zones
  FOR ALL USING (
    board_id IN (
      SELECT id FROM deadstock.boards 
      WHERE user_id = auth.uid() 
      OR session_id = current_setting('app.session_id', true)
    )
  );
```

### 2.4 Table `board_elements`

```sql
CREATE TABLE deadstock.board_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES deadstock.boards(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES deadstock.board_zones(id) ON DELETE SET NULL,
  
  -- Type d'élément
  element_type TEXT NOT NULL,  -- textile, palette, inspiration, calculation, note
  
  -- Données spécifiques au type (JSONB polymorphe)
  element_data JSONB NOT NULL DEFAULT '{}',
  
  -- Position et taille sur le canvas
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  width FLOAT,   -- NULL = taille auto
  height FLOAT,  -- NULL = taille auto
  z_index INT NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Contraintes
  CONSTRAINT board_elements_type_check CHECK (
    element_type IN ('textile', 'palette', 'inspiration', 'calculation', 'note')
  )
);

-- Index
CREATE INDEX idx_board_elements_board_id ON deadstock.board_elements(board_id);
CREATE INDEX idx_board_elements_zone_id ON deadstock.board_elements(zone_id);
CREATE INDEX idx_board_elements_type ON deadstock.board_elements(element_type);

-- RLS (hérite du board parent)
ALTER TABLE deadstock.board_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_elements_access" ON deadstock.board_elements
  FOR ALL USING (
    board_id IN (
      SELECT id FROM deadstock.boards 
      WHERE user_id = auth.uid() 
      OR session_id = current_setting('app.session_id', true)
    )
  );
```

### 2.5 Structure `element_data` par type

#### Type: `textile`
```json
{
  "textile_id": "uuid",
  "snapshot": {
    "name": "Lin bleu lavande",
    "source": "My Little Coupon",
    "price": 15.00,
    "currency": "EUR",
    "image_url": "https://...",
    "available_quantity": 3.0,
    "material": "lin",
    "color": "blue"
  },
  "note": "Parfait pour la robe"
}
```

#### Type: `palette`
```json
{
  "name": "Palette été",
  "colors": ["#1E3A5F", "#8B4513", "#FFFFFF", "#F4D03F"],
  "source": "extracted",
  "source_image_url": "https://..."
}
```

#### Type: `inspiration`
```json
{
  "image_url": "https://...",
  "thumbnail_url": "https://...",
  "caption": "Robe fluide Pinterest",
  "source_url": "https://pinterest.com/...",
  "extracted_colors": ["#1E3A5F", "#FFFFFF"]
}
```

#### Type: `calculation`
```json
{
  "calculation_id": "uuid",
  "summary": "Robe midi M = 2.8m",
  "garment_type": "dress",
  "size": "M",
  "variations": {
    "length": "midi",
    "sleeves": "none"
  },
  "result": {
    "base_yardage": 2.5,
    "total_yardage": 2.8,
    "recommended": 3.0
  }
}
```

#### Type: `note`
```json
{
  "content": "Bretelles fines, esprit vacances",
  "format": "plain",
  "color": "#FEF3C7"
}
```

---

## 3. Types TypeScript

### 3.1 Types de base

```typescript
// src/features/boards/domain/types.ts

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type BoardStatus = 'draft' | 'active' | 'archived';

export type ElementType = 'textile' | 'palette' | 'inspiration' | 'calculation' | 'note';

// ============================================
// BOARD
// ============================================

export interface Board {
  id: string;
  userId?: string;
  sessionId?: string;
  name: string | null;
  description: string | null;
  status: BoardStatus;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (chargées séparément ou avec le board)
  elements?: BoardElement[];
  zones?: BoardZone[];
  
  // Computed
  elementCount?: number;
}

export interface BoardSummary {
  id: string;
  name: string | null;
  status: BoardStatus;
  elementCount: number;
  updatedAt: Date;
}

// ============================================
// ZONE
// ============================================

export interface BoardZone {
  id: string;
  boardId: string;
  name: string;
  color: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  createdAt: Date;
}

export interface CreateZoneInput {
  boardId: string;
  name?: string;
  color?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
}

export interface UpdateZoneInput {
  name?: string;
  color?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
}

// ============================================
// ELEMENT (polymorphe)
// ============================================

export interface BoardElementBase {
  id: string;
  boardId: string;
  zoneId: string | null;
  elementType: ElementType;
  positionX: number;
  positionY: number;
  width: number | null;
  height: number | null;
  zIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

// Element data par type
export interface TextileElementData {
  textileId: string;
  snapshot: {
    name: string;
    source: string;
    price: number;
    currency: string;
    imageUrl: string;
    availableQuantity: number | null;
    material: string | null;
    color: string | null;
  };
  note?: string;
}

export interface PaletteElementData {
  name?: string;
  colors: string[];  // hex codes
  source: 'manual' | 'extracted';
  sourceImageUrl?: string;
}

export interface InspirationElementData {
  imageUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  sourceUrl?: string;
  extractedColors?: string[];
}

export interface CalculationElementData {
  calculationId?: string;
  summary: string;
  garmentType: string;
  size: string;
  variations?: Record<string, string>;
  result: {
    baseYardage: number;
    totalYardage: number;
    recommended: number;
  };
}

export interface NoteElementData {
  content: string;
  format: 'plain' | 'rich';
  color?: string;
}

// Union type pour element_data
export type ElementData = 
  | TextileElementData 
  | PaletteElementData 
  | InspirationElementData 
  | CalculationElementData 
  | NoteElementData;

// Element complet avec data typée
export interface BoardElement<T extends ElementData = ElementData> extends BoardElementBase {
  elementData: T;
}

// Alias pour éléments typés
export type TextileElement = BoardElement<TextileElementData>;
export type PaletteElement = BoardElement<PaletteElementData>;
export type InspirationElement = BoardElement<InspirationElementData>;
export type CalculationElement = BoardElement<CalculationElementData>;
export type NoteElement = BoardElement<NoteElementData>;

// ============================================
// INPUTS
// ============================================

export interface CreateBoardInput {
  name?: string;
  description?: string;
}

export interface UpdateBoardInput {
  name?: string;
  description?: string;
  status?: BoardStatus;
}

export interface AddElementInput {
  boardId: string;
  elementType: ElementType;
  elementData: ElementData;
  zoneId?: string;
  positionX?: number;
  positionY?: number;
}

export interface UpdateElementInput {
  zoneId?: string | null;
  elementData?: Partial<ElementData>;
  positionX?: number;
  positionY?: number;
  width?: number | null;
  height?: number | null;
  zIndex?: number;
}

export interface MoveElementInput {
  positionX: number;
  positionY: number;
  zoneId?: string | null;
}

// ============================================
// CANVAS STATE
// ============================================

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasSelection {
  elementIds: string[];
  zoneIds: string[];
}

export interface DragState {
  isDragging: boolean;
  elementId: string | null;
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
}
```

---

## 4. Server Actions

### 4.1 Actions Board

```typescript
// src/features/boards/actions/boardActions.ts

'use server';

import { revalidatePath } from 'next/cache';
import { boardsRepository } from '../infrastructure/boardsRepository';
import { getSessionId } from '@/lib/session';
import type { 
  Board, 
  BoardSummary, 
  CreateBoardInput, 
  UpdateBoardInput 
} from '../domain/types';

// ============================================
// LIST BOARDS
// ============================================

export async function listBoardsAction(): Promise<{
  success: boolean;
  data?: BoardSummary[];
  error?: string;
}> {
  try {
    const sessionId = await getSessionId();
    const boards = await boardsRepository.listBoards(sessionId);
    return { success: true, data: boards };
  } catch (error) {
    console.error('listBoardsAction error:', error);
    return { success: false, error: 'Failed to load boards' };
  }
}

// ============================================
// GET BOARD
// ============================================

export async function getBoardAction(boardId: string): Promise<{
  success: boolean;
  data?: Board;
  error?: string;
}> {
  try {
    const sessionId = await getSessionId();
    const board = await boardsRepository.getBoard(boardId, sessionId);
    if (!board) {
      return { success: false, error: 'Board not found' };
    }
    return { success: true, data: board };
  } catch (error) {
    console.error('getBoardAction error:', error);
    return { success: false, error: 'Failed to load board' };
  }
}

// ============================================
// CREATE BOARD
// ============================================

export async function createBoardAction(input: CreateBoardInput = {}): Promise<{
  success: boolean;
  data?: Board;
  error?: string;
}> {
  try {
    const sessionId = await getSessionId();
    const board = await boardsRepository.createBoard(input, sessionId);
    revalidatePath('/boards');
    return { success: true, data: board };
  } catch (error) {
    console.error('createBoardAction error:', error);
    return { success: false, error: 'Failed to create board' };
  }
}

// ============================================
// UPDATE BOARD
// ============================================

export async function updateBoardAction(
  boardId: string, 
  input: UpdateBoardInput
): Promise<{
  success: boolean;
  data?: Board;
  error?: string;
}> {
  try {
    const sessionId = await getSessionId();
    const board = await boardsRepository.updateBoard(boardId, input, sessionId);
    if (!board) {
      return { success: false, error: 'Board not found' };
    }
    revalidatePath('/boards');
    revalidatePath(`/boards/${boardId}`);
    return { success: true, data: board };
  } catch (error) {
    console.error('updateBoardAction error:', error);
    return { success: false, error: 'Failed to update board' };
  }
}

// ============================================
// DELETE BOARD
// ============================================

export async function deleteBoardAction(boardId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const sessionId = await getSessionId();
    await boardsRepository.deleteBoard(boardId, sessionId);
    revalidatePath('/boards');
    return { success: true };
  } catch (error) {
    console.error('deleteBoardAction error:', error);
    return { success: false, error: 'Failed to delete board' };
  }
}

// ============================================
// ARCHIVE BOARD
// ============================================

export async function archiveBoardAction(boardId: string): Promise<{
  success: boolean;
  data?: Board;
  error?: string;
}> {
  return updateBoardAction(boardId, { status: 'archived' });
}
```

### 4.2 Actions Elements

```typescript
// src/features/boards/actions/elementActions.ts

'use server';

import { revalidatePath } from 'next/cache';
import { elementsRepository } from '../infrastructure/elementsRepository';
import { getSessionId } from '@/lib/session';
import type { 
  BoardElement, 
  AddElementInput, 
  UpdateElementInput,
  MoveElementInput
} from '../domain/types';

// ============================================
// ADD ELEMENT
// ============================================

export async function addElementAction(input: AddElementInput): Promise<{
  success: boolean;
  data?: BoardElement;
  error?: string;
}> {
  try {
    const sessionId = await getSessionId();
    const element = await elementsRepository.addElement(input, sessionId);
    revalidatePath(`/boards/${input.boardId}`);
    return { success: true, data: element };
  } catch (error) {
    console.error('addElementAction error:', error);
    return { success: false, error: 'Failed to add element' };
  }
}

// ============================================
// UPDATE ELEMENT
// ============================================

export async function updateElementAction(
  elementId: string,
  input: UpdateElementInput
): Promise<{
  success: boolean;
  data?: BoardElement;
  error?: string;
}> {
  try {
    const sessionId = await getSessionId();
    const element = await elementsRepository.updateElement(elementId, input, sessionId);
    if (!element) {
      return { success: false, error: 'Element not found' };
    }
    revalidatePath(`/boards/${element.boardId}`);
    return { success: true, data: element };
  } catch (error) {
    console.error('updateElementAction error:', error);
    return { success: false, error: 'Failed to update element' };
  }
}

// ============================================
// MOVE ELEMENT
// ============================================

export async function moveElementAction(
  elementId: string,
  input: MoveElementInput
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const sessionId = await getSessionId();
    await elementsRepository.moveElement(elementId, input, sessionId);
    return { success: true };
  } catch (error) {
    console.error('moveElementAction error:', error);
    return { success: false, error: 'Failed to move element' };
  }
}

// ============================================
// REMOVE ELEMENT
// ============================================

export async function removeElementAction(elementId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const sessionId = await getSessionId();
    const boardId = await elementsRepository.removeElement(elementId, sessionId);
    if (boardId) {
      revalidatePath(`/boards/${boardId}`);
    }
    return { success: true };
  } catch (error) {
    console.error('removeElementAction error:', error);
    return { success: false, error: 'Failed to remove element' };
  }
}

// ============================================
// BULK MOVE (pour drag & drop multiple)
// ============================================

export async function bulkMoveElementsAction(
  moves: Array<{ elementId: string; positionX: number; positionY: number }>
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const sessionId = await getSessionId();
    await elementsRepository.bulkMoveElements(moves, sessionId);
    return { success: true };
  } catch (error) {
    console.error('bulkMoveElementsAction error:', error);
    return { success: false, error: 'Failed to move elements' };
  }
}
```

### 4.3 Actions Zones

```typescript
// src/features/boards/actions/zoneActions.ts

'use server';

import { revalidatePath } from 'next/cache';
import { zonesRepository } from '../infrastructure/zonesRepository';
import { getSessionId } from '@/lib/session';
import type { BoardZone, CreateZoneInput, UpdateZoneInput } from '../domain/types';

// ============================================
// CREATE ZONE
// ============================================

export async function createZoneAction(input: CreateZoneInput): Promise<{
  success: boolean;
  data?: BoardZone;
  error?: string;
}> {
  try {
    const sessionId = await getSessionId();
    const zone = await zonesRepository.createZone(input, sessionId);
    revalidatePath(`/boards/${input.boardId}`);
    return { success: true, data: zone };
  } catch (error) {
    console.error('createZoneAction error:', error);
    return { success: false, error: 'Failed to create zone' };
  }
}

// ============================================
// UPDATE ZONE
// ============================================

export async function updateZoneAction(
  zoneId: string,
  input: UpdateZoneInput
): Promise<{
  success: boolean;
  data?: BoardZone;
  error?: string;
}> {
  try {
    const sessionId = await getSessionId();
    const zone = await zonesRepository.updateZone(zoneId, input, sessionId);
    if (!zone) {
      return { success: false, error: 'Zone not found' };
    }
    revalidatePath(`/boards/${zone.boardId}`);
    return { success: true, data: zone };
  } catch (error) {
    console.error('updateZoneAction error:', error);
    return { success: false, error: 'Failed to update zone' };
  }
}

// ============================================
// DELETE ZONE
// ============================================

export async function deleteZoneAction(zoneId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const sessionId = await getSessionId();
    const boardId = await zonesRepository.deleteZone(zoneId, sessionId);
    if (boardId) {
      revalidatePath(`/boards/${boardId}`);
    }
    return { success: true };
  } catch (error) {
    console.error('deleteZoneAction error:', error);
    return { success: false, error: 'Failed to delete zone' };
  }
}
```

---

## 5. Composants React

### 5.1 Structure des fichiers

```
src/features/boards/
├── domain/
│   └── types.ts
├── infrastructure/
│   ├── boardsRepository.ts
│   ├── elementsRepository.ts
│   └── zonesRepository.ts
├── actions/
│   ├── boardActions.ts
│   ├── elementActions.ts
│   └── zoneActions.ts
├── context/
│   └── BoardContext.tsx
├── hooks/
│   ├── useBoard.ts
│   ├── useBoardElements.ts
│   ├── useDragAndDrop.ts
│   └── useCanvasViewport.ts
└── components/
    ├── BoardList/
    │   ├── BoardList.tsx
    │   └── BoardCard.tsx
    ├── BoardCanvas/
    │   ├── BoardCanvas.tsx
    │   ├── CanvasControls.tsx
    │   └── CanvasGrid.tsx
    ├── BoardElement/
    │   ├── BoardElement.tsx        (wrapper polymorphe)
    │   ├── TextileCard.tsx
    │   ├── PaletteCard.tsx
    │   ├── InspirationCard.tsx
    │   ├── CalculationCard.tsx
    │   └── NoteCard.tsx
    ├── BoardZone/
    │   ├── BoardZone.tsx
    │   └── ZoneHeader.tsx
    ├── ToolPanel/
    │   ├── ToolPanel.tsx
    │   ├── SearchTool.tsx
    │   ├── PaletteTool.tsx
    │   ├── CalculatorTool.tsx
    │   └── NoteTool.tsx
    └── AddToBoard/
        └── AddToBoardButton.tsx
```

### 5.2 Composant BoardCanvas

```tsx
// src/features/boards/components/BoardCanvas/BoardCanvas.tsx

'use client';

import { useRef, useState, useCallback } from 'react';
import { useBoard } from '../../hooks/useBoard';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useCanvasViewport } from '../../hooks/useCanvasViewport';
import { BoardElement } from '../BoardElement/BoardElement';
import { BoardZone } from '../BoardZone/BoardZone';
import { CanvasControls } from './CanvasControls';
import { cn } from '@/lib/utils';

interface BoardCanvasProps {
  boardId: string;
}

export function BoardCanvas({ boardId }: BoardCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { board, elements, zones, isLoading } = useBoard(boardId);
  const { viewport, pan, zoom, resetViewport } = useCanvasViewport();
  const { 
    dragState, 
    handleDragStart, 
    handleDrag, 
    handleDragEnd 
  } = useDragAndDrop();

  if (isLoading || !board) {
    return <CanvasLoading />;
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted/30">
      {/* Canvas avec pan & zoom */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Grille de fond */}
        <CanvasGrid />

        {/* Zones */}
        {zones.map((zone) => (
          <BoardZone
            key={zone.id}
            zone={zone}
            elements={elements.filter((el) => el.zoneId === zone.id)}
          />
        ))}

        {/* Éléments hors zone */}
        {elements
          .filter((el) => !el.zoneId)
          .map((element) => (
            <BoardElement
              key={element.id}
              element={element}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              isDragging={dragState.elementId === element.id}
            />
          ))}
      </div>

      {/* Contrôles (zoom, reset, etc.) */}
      <CanvasControls
        viewport={viewport}
        onZoomIn={() => zoom(0.1)}
        onZoomOut={() => zoom(-0.1)}
        onReset={resetViewport}
      />
    </div>
  );
}
```

### 5.3 Composant BoardElement (polymorphe)

```tsx
// src/features/boards/components/BoardElement/BoardElement.tsx

'use client';

import { memo } from 'react';
import { TextileCard } from './TextileCard';
import { PaletteCard } from './PaletteCard';
import { InspirationCard } from './InspirationCard';
import { CalculationCard } from './CalculationCard';
import { NoteCard } from './NoteCard';
import type { BoardElement as BoardElementType } from '../../domain/types';
import { cn } from '@/lib/utils';

interface BoardElementProps {
  element: BoardElementType;
  onDragStart: (elementId: string, e: React.MouseEvent) => void;
  onDrag: (e: React.MouseEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export const BoardElement = memo(function BoardElement({
  element,
  onDragStart,
  onDrag,
  onDragEnd,
  isDragging,
}: BoardElementProps) {
  const ElementComponent = {
    textile: TextileCard,
    palette: PaletteCard,
    inspiration: InspirationCard,
    calculation: CalculationCard,
    note: NoteCard,
  }[element.elementType];

  if (!ElementComponent) {
    console.warn(`Unknown element type: ${element.elementType}`);
    return null;
  }

  return (
    <div
      className={cn(
        "absolute cursor-move select-none",
        "transition-shadow duration-150",
        isDragging && "shadow-lg opacity-90 z-50"
      )}
      style={{
        left: element.positionX,
        top: element.positionY,
        width: element.width ?? 'auto',
        height: element.height ?? 'auto',
        zIndex: isDragging ? 9999 : element.zIndex,
      }}
      onMouseDown={(e) => onDragStart(element.id, e)}
      onMouseMove={isDragging ? onDrag : undefined}
      onMouseUp={isDragging ? onDragEnd : undefined}
      onMouseLeave={isDragging ? onDragEnd : undefined}
    >
      <ElementComponent data={element.elementData} />
    </div>
  );
});
```

### 5.4 Exemple : TextileCard

```tsx
// src/features/boards/components/BoardElement/TextileCard.tsx

import Image from 'next/image';
import { MoreHorizontal, ExternalLink, Trash2 } from 'lucide-react';
import type { TextileElementData } from '../../domain/types';
import { cn } from '@/lib/utils';

interface TextileCardProps {
  data: TextileElementData;
}

export function TextileCard({ data }: TextileCardProps) {
  const { snapshot, note } = data;

  return (
    <div className={cn(
      "w-48 bg-card border border-border rounded-lg overflow-hidden",
      "shadow-sm hover:shadow-md transition-shadow"
    )}>
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        {snapshot.imageUrl ? (
          <Image
            src={snapshot.imageUrl}
            alt={snapshot.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="p-3">
        <h4 className="font-medium text-sm text-foreground truncate">
          {snapshot.name}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {snapshot.source}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-medium text-foreground">
            {snapshot.price}€/m
          </span>
          {snapshot.availableQuantity && (
            <span className="text-xs text-muted-foreground">
              {snapshot.availableQuantity}m dispo
            </span>
          )}
        </div>
        {note && (
          <p className="text-xs text-muted-foreground mt-2 italic">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## 6. Context & Hooks

### 6.1 BoardContext

```tsx
// src/features/boards/context/BoardContext.tsx

'use client';

import { 
  createContext, 
  useContext, 
  useReducer, 
  useCallback,
  useEffect,
  type ReactNode 
} from 'react';
import { 
  getBoardAction,
  updateBoardAction,
} from '../actions/boardActions';
import {
  addElementAction,
  updateElementAction,
  moveElementAction,
  removeElementAction,
} from '../actions/elementActions';
import {
  createZoneAction,
  updateZoneAction,
  deleteZoneAction,
} from '../actions/zoneActions';
import type { 
  Board, 
  BoardElement, 
  BoardZone,
  AddElementInput,
  UpdateElementInput,
  CreateZoneInput,
} from '../domain/types';

// ============================================
// STATE
// ============================================

interface BoardState {
  board: Board | null;
  elements: BoardElement[];
  zones: BoardZone[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  selectedElementIds: string[];
}

const initialState: BoardState = {
  board: null,
  elements: [],
  zones: [],
  isLoading: true,
  isSaving: false,
  error: null,
  selectedElementIds: [],
};

// ============================================
// ACTIONS
// ============================================

type BoardAction =
  | { type: 'SET_BOARD'; payload: Board }
  | { type: 'SET_ELEMENTS'; payload: BoardElement[] }
  | { type: 'SET_ZONES'; payload: BoardZone[] }
  | { type: 'ADD_ELEMENT'; payload: BoardElement }
  | { type: 'UPDATE_ELEMENT'; payload: BoardElement }
  | { type: 'REMOVE_ELEMENT'; payload: string }
  | { type: 'ADD_ZONE'; payload: BoardZone }
  | { type: 'UPDATE_ZONE'; payload: BoardZone }
  | { type: 'REMOVE_ZONE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SELECT_ELEMENTS'; payload: string[] }
  | { type: 'MOVE_ELEMENT'; payload: { id: string; x: number; y: number } };

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'SET_BOARD':
      return { ...state, board: action.payload, isLoading: false };
    case 'SET_ELEMENTS':
      return { ...state, elements: action.payload };
    case 'SET_ZONES':
      return { ...state, zones: action.payload };
    case 'ADD_ELEMENT':
      return { ...state, elements: [...state.elements, action.payload] };
    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.payload.id ? action.payload : el
        ),
      };
    case 'REMOVE_ELEMENT':
      return {
        ...state,
        elements: state.elements.filter((el) => el.id !== action.payload),
      };
    case 'ADD_ZONE':
      return { ...state, zones: [...state.zones, action.payload] };
    case 'UPDATE_ZONE':
      return {
        ...state,
        zones: state.zones.map((z) =>
          z.id === action.payload.id ? action.payload : z
        ),
      };
    case 'REMOVE_ZONE':
      return {
        ...state,
        zones: state.zones.filter((z) => z.id !== action.payload),
        elements: state.elements.map((el) =>
          el.zoneId === action.payload ? { ...el, zoneId: null } : el
        ),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SELECT_ELEMENTS':
      return { ...state, selectedElementIds: action.payload };
    case 'MOVE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.payload.id
            ? { ...el, positionX: action.payload.x, positionY: action.payload.y }
            : el
        ),
      };
    default:
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================

interface BoardContextValue extends BoardState {
  // Board actions
  refreshBoard: () => Promise<void>;
  updateBoard: (input: Partial<Board>) => Promise<void>;
  
  // Element actions
  addElement: (input: Omit<AddElementInput, 'boardId'>) => Promise<void>;
  updateElement: (id: string, input: UpdateElementInput) => Promise<void>;
  moveElement: (id: string, x: number, y: number) => Promise<void>;
  removeElement: (id: string) => Promise<void>;
  
  // Zone actions
  createZone: (input?: Partial<CreateZoneInput>) => Promise<void>;
  updateZone: (id: string, input: Partial<BoardZone>) => Promise<void>;
  deleteZone: (id: string) => Promise<void>;
  
  // Selection
  selectElements: (ids: string[]) => void;
  clearSelection: () => void;
}

const BoardContext = createContext<BoardContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

interface BoardProviderProps {
  boardId: string;
  initialBoard?: Board;
  children: ReactNode;
}

export function BoardProvider({ 
  boardId, 
  initialBoard, 
  children 
}: BoardProviderProps) {
  const [state, dispatch] = useReducer(boardReducer, {
    ...initialState,
    board: initialBoard ?? null,
    elements: initialBoard?.elements ?? [],
    zones: initialBoard?.zones ?? [],
    isLoading: !initialBoard,
  });

  // Load board if not provided
  useEffect(() => {
    if (!initialBoard) {
      refreshBoard();
    }
  }, [boardId]);

  const refreshBoard = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const result = await getBoardAction(boardId);
    if (result.success && result.data) {
      dispatch({ type: 'SET_BOARD', payload: result.data });
      dispatch({ type: 'SET_ELEMENTS', payload: result.data.elements ?? [] });
      dispatch({ type: 'SET_ZONES', payload: result.data.zones ?? [] });
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error ?? 'Failed to load board' });
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, [boardId]);

  const updateBoard = useCallback(async (input: Partial<Board>) => {
    dispatch({ type: 'SET_SAVING', payload: true });
    const result = await updateBoardAction(boardId, input);
    if (result.success && result.data) {
      dispatch({ type: 'SET_BOARD', payload: result.data });
    }
    dispatch({ type: 'SET_SAVING', payload: false });
  }, [boardId]);

  const addElement = useCallback(async (input: Omit<AddElementInput, 'boardId'>) => {
    const result = await addElementAction({ ...input, boardId });
    if (result.success && result.data) {
      dispatch({ type: 'ADD_ELEMENT', payload: result.data });
    }
  }, [boardId]);

  const updateElement = useCallback(async (id: string, input: UpdateElementInput) => {
    const result = await updateElementAction(id, input);
    if (result.success && result.data) {
      dispatch({ type: 'UPDATE_ELEMENT', payload: result.data });
    }
  }, []);

  const moveElement = useCallback(async (id: string, x: number, y: number) => {
    // Optimistic update
    dispatch({ type: 'MOVE_ELEMENT', payload: { id, x, y } });
    // Persist
    await moveElementAction(id, { positionX: x, positionY: y });
  }, []);

  const removeElement = useCallback(async (id: string) => {
    dispatch({ type: 'REMOVE_ELEMENT', payload: id });
    await removeElementAction(id);
  }, []);

  const createZone = useCallback(async (input?: Partial<CreateZoneInput>) => {
    const result = await createZoneAction({ boardId, ...input });
    if (result.success && result.data) {
      dispatch({ type: 'ADD_ZONE', payload: result.data });
    }
  }, [boardId]);

  const updateZone = useCallback(async (id: string, input: Partial<BoardZone>) => {
    const result = await updateZoneAction(id, input);
    if (result.success && result.data) {
      dispatch({ type: 'UPDATE_ZONE', payload: result.data });
    }
  }, []);

  const deleteZone = useCallback(async (id: string) => {
    dispatch({ type: 'REMOVE_ZONE', payload: id });
    await deleteZoneAction(id);
  }, []);

  const selectElements = useCallback((ids: string[]) => {
    dispatch({ type: 'SELECT_ELEMENTS', payload: ids });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'SELECT_ELEMENTS', payload: [] });
  }, []);

  const value: BoardContextValue = {
    ...state,
    refreshBoard,
    updateBoard,
    addElement,
    updateElement,
    moveElement,
    removeElement,
    createZone,
    updateZone,
    deleteZone,
    selectElements,
    clearSelection,
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
}
```

---

## 7. Routes & Pages

### 7.1 Structure des routes

```
src/app/boards/
├── page.tsx                    # Liste des boards
├── new/
│   └── page.tsx               # Créer un board (optionnel, peut être modal)
└── [boardId]/
    ├── layout.tsx             # BoardProvider
    └── page.tsx               # Canvas du board
```

### 7.2 Page liste des boards

```tsx
// src/app/boards/page.tsx

import { listBoardsAction } from '@/features/boards/actions/boardActions';
import { BoardList } from '@/features/boards/components/BoardList/BoardList';

export default async function BoardsPage() {
  const result = await listBoardsAction();
  const boards = result.data ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Mes Boards</h1>
        <CreateBoardButton />
      </div>
      
      <BoardList boards={boards} />
    </div>
  );
}
```

### 7.3 Page canvas du board

```tsx
// src/app/boards/[boardId]/page.tsx

import { getBoardAction } from '@/features/boards/actions/boardActions';
import { BoardCanvas } from '@/features/boards/components/BoardCanvas/BoardCanvas';
import { ToolPanel } from '@/features/boards/components/ToolPanel/ToolPanel';
import { notFound } from 'next/navigation';

interface BoardPageProps {
  params: { boardId: string };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = params;
  const result = await getBoardAction(boardId);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Canvas principal */}
      <div className="flex-1 relative">
        <BoardCanvas boardId={boardId} />
      </div>

      {/* Panel outils (collapsible) */}
      <ToolPanel boardId={boardId} />
    </div>
  );
}
```

### 7.4 Layout avec Provider

```tsx
// src/app/boards/[boardId]/layout.tsx

import { getBoardAction } from '@/features/boards/actions/boardActions';
import { BoardProvider } from '@/features/boards/context/BoardContext';
import { notFound } from 'next/navigation';

interface BoardLayoutProps {
  params: { boardId: string };
  children: React.ReactNode;
}

export default async function BoardLayout({ params, children }: BoardLayoutProps) {
  const { boardId } = params;
  const result = await getBoardAction(boardId);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <BoardProvider boardId={boardId} initialBoard={result.data}>
      {children}
    </BoardProvider>
  );
}
```

---

## 8. Intégrations

### 8.1 Ajout depuis la recherche

```tsx
// Dans la page de recherche ou composant TextileCard

import { addElementAction } from '@/features/boards/actions/elementActions';

async function handleAddToBoard(textile: Textile, boardId: string) {
  await addElementAction({
    boardId,
    elementType: 'textile',
    elementData: {
      textileId: textile.id,
      snapshot: {
        name: textile.name,
        source: textile.source,
        price: textile.price,
        currency: 'EUR',
        imageUrl: textile.imageUrl,
        availableQuantity: textile.availableQuantity,
        material: textile.material,
        color: textile.color,
      },
    },
  });
}
```

### 8.2 Ajout depuis le calculateur

```tsx
// Après un calcul de métrage

async function handleSaveCalculation(calculation: CalculationResult, boardId: string) {
  await addElementAction({
    boardId,
    elementType: 'calculation',
    elementData: {
      summary: `${calculation.garmentLabel} ${calculation.size} = ${calculation.recommended}m`,
      garmentType: calculation.garmentType,
      size: calculation.size,
      variations: calculation.variations,
      result: {
        baseYardage: calculation.baseYardage,
        totalYardage: calculation.totalYardage,
        recommended: calculation.recommended,
      },
    },
  });
}
```

---

## 9. Checklist d'implémentation

### Phase 1 : Foundation
- [ ] Migration SQL (tables boards, board_zones, board_elements)
- [ ] Types TypeScript
- [ ] Repository boards
- [ ] Repository elements
- [ ] Repository zones
- [ ] Server Actions

### Phase 2 : UI de base
- [ ] Page liste boards
- [ ] Page canvas board (sans drag & drop)
- [ ] BoardProvider & Context
- [ ] Composants éléments (TextileCard, NoteCard, etc.)

### Phase 3 : Interactions
- [ ] Drag & drop éléments
- [ ] Création/édition zones
- [ ] Pan & zoom canvas
- [ ] Sélection multiple

### Phase 4 : Intégrations
- [ ] "Ajouter au board" depuis recherche
- [ ] "Ajouter au board" depuis calculateur
- [ ] "Ajouter au board" depuis favoris
- [ ] Création palette

### Phase 5 : Cristallisation
- [ ] Wizard cristallisation (4 étapes)
- [ ] Création projet depuis board
- [ ] Archivage board

---

**Document maintenu par :** Équipe Développement  
**Dernière mise à jour :** 04/01/2026
