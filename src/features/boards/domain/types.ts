// src/features/boards/domain/types.ts

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type BoardStatus = 'draft' | 'active' | 'archived';

export type ElementType = 'textile' | 'palette' | 'inspiration' | 'calculation' | 'note';

export const ELEMENT_TYPE_LABELS: Record<ElementType, string> = {
  textile: 'Tissu',
  palette: 'Palette',
  inspiration: 'Inspiration',
  calculation: 'Calcul',
  note: 'Note',
};

export const BOARD_STATUS_LABELS: Record<BoardStatus, string> = {
  draft: 'Brouillon',
  active: 'Actif',
  archived: 'Archivé',
};

// ============================================
// BOARD
// ============================================

export interface Board {
  id: string;
  userId: string | null;
  sessionId: string | null;
  name: string | null;
  description: string | null;
  status: BoardStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardWithDetails extends Board {
  elements: BoardElement[];
  zones: BoardZone[];
  elementCount: number;
}

// ============================================
// BOARD ZONE
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

// ============================================
// BOARD ELEMENT
// ============================================

export interface BoardElement {
  id: string;
  boardId: string;
  zoneId: string | null;
  elementType: ElementType;
  elementData: ElementData;
  positionX: number;
  positionY: number;
  width: number | null;
  height: number | null;
  zIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ELEMENT DATA (polymorphe)
// ============================================

export type ElementData =
  | TextileElementData
  | PaletteElementData
  | InspirationElementData
  | CalculationElementData
  | NoteElementData;

// Type: textile
export interface TextileElementData {
  textileId: string;
  snapshot: {
    name: string;
    source: string;
    price: number;
    currency: string;
    imageUrl: string | null;
    availableQuantity: number | null;
    material: string | null;
    color: string | null;
  };
  note?: string;
}

// Type: palette
export interface PaletteElementData {
  name: string;
  colors: string[]; // hex codes
  source?: 'manual' | 'extracted';
  sourceImageUrl?: string;
}

// Type: inspiration
export interface InspirationElementData {
  imageUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  sourceUrl?: string;
  extractedColors?: string[];
}

// Type: calculation
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

// Type: note
export interface NoteElementData {
  content: string;
  format?: 'plain' | 'markdown';
  color?: string; // background color
}

// ============================================
// TYPE GUARDS
// ============================================

export function isTextileElement(data: ElementData): data is TextileElementData {
  return 'textileId' in data && 'snapshot' in data;
}

export function isPaletteElement(data: ElementData): data is PaletteElementData {
  return 'colors' in data && Array.isArray((data as PaletteElementData).colors);
}

export function isInspirationElement(data: ElementData): data is InspirationElementData {
  return 'imageUrl' in data && !('textileId' in data);
}

export function isCalculationElement(data: ElementData): data is CalculationElementData {
  return 'garmentType' in data && 'result' in data;
}

export function isNoteElement(data: ElementData): data is NoteElementData {
  return 'content' in data && !('garmentType' in data);
}

// ============================================
// INPUT TYPES (création/mise à jour)
// ============================================

export interface CreateBoardInput {
  name?: string;
  description?: string;
  status?: BoardStatus;
}

export interface UpdateBoardInput {
  name?: string;
  description?: string;
  status?: BoardStatus;
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

export interface CreateElementInput {
  boardId: string;
  zoneId?: string;
  elementType: ElementType;
  elementData: ElementData;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  zIndex?: number;
}

export interface UpdateElementInput {
  zoneId?: string | null;
  elementData?: ElementData;
  positionX?: number;
  positionY?: number;
  width?: number | null;
  height?: number | null;
  zIndex?: number;
}

export interface MoveElementInput {
  positionX: number;
  positionY: number;
}

// ============================================
// DATABASE ROW TYPES (snake_case)
// ============================================

export interface BoardRow {
  id: string;
  user_id: string | null;
  session_id: string | null;
  name: string | null;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BoardZoneRow {
  id: string;
  board_id: string;
  name: string;
  color: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  created_at: string;
}

export interface BoardElementRow {
  id: string;
  board_id: string;
  zone_id: string | null;
  element_type: string;
  element_data: Record<string, unknown>;
  position_x: number;
  position_y: number;
  width: number | null;
  height: number | null;
  z_index: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// MAPPERS
// ============================================

export function mapBoardFromRow(row: BoardRow): Board {
  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id,
    name: row.name,
    description: row.description,
    status: row.status as BoardStatus,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function mapZoneFromRow(row: BoardZoneRow): BoardZone {
  return {
    id: row.id,
    boardId: row.board_id,
    name: row.name,
    color: row.color,
    positionX: row.position_x,
    positionY: row.position_y,
    width: row.width,
    height: row.height,
    createdAt: new Date(row.created_at),
  };
}

export function mapElementFromRow(row: BoardElementRow): BoardElement {
  return {
    id: row.id,
    boardId: row.board_id,
    zoneId: row.zone_id,
    elementType: row.element_type as ElementType,
    elementData: row.element_data as unknown as ElementData,
    positionX: row.position_x,
    positionY: row.position_y,
    width: row.width,
    height: row.height,
    zIndex: row.z_index,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ============================================
// ACTION RESULT TYPE
// ============================================

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
