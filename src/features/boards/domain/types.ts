// src/features/boards/domain/types.ts
// UPDATED: UB-2 - Unified Boards Architecture (ADR-032)

// ============================================
// ENUMS & CONSTANTS
// ============================================

// UPDATED UB-2 - Nouveau cycle de vie des boards
export type BoardStatus = 'draft' | 'ordered' | 'in_progress' | 'completed' | 'cancelled' | 'archived';

// Board type (unchanged)
export type BoardType = 'free' | 'piece' | 'category' | 'collection';

// REMOVED UB-2 - ZoneType n'existe plus (fusionné dans BoardType)
// export type ZoneType = 'piece' | 'category';

// Project status (pour compatibilité avec projets existants)
export type ProjectStatus =
  | 'draft'
  | 'in_progress'
  | 'ordered'
  | 'shipped'
  | 'received'
  | 'in_production'
  | 'completed'
  | 'archived';

export type ElementType = 'textile' | 'palette' | 'inspiration' | 'calculation' | 'note' | 'video' | 'link' | 'pdf' | 'pattern' | 'silhouette';

export const ELEMENT_TYPE_LABELS: Record<ElementType, string> = {
  textile: 'Tissu',
  palette: 'Palette',
  inspiration: 'Inspiration',
  calculation: 'Calcul',
  note: 'Note',
  video: 'Vidéo',
  link: 'Lien',
  pdf: 'PDF',
  pattern: 'Patron',
  silhouette: 'Silhouette',
};

// UPDATED UB-2 - Labels du cycle de vie
export const BOARD_STATUS_LABELS: Record<BoardStatus, string> = {
  draft: 'Brouillon',
  ordered: 'Commandé',
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
  archived: 'Archivé',
};

// UPDATED UB-2 - Icônes et couleurs du cycle de vie
export const BOARD_STATUS_CONFIG: Record<BoardStatus, { label: string; icon: string; color: string }> = {
  draft: { label: 'Brouillon', icon: '📝', color: 'gray' },
  ordered: { label: 'Commandé', icon: '📦', color: 'orange' },
  in_progress: { label: 'En cours', icon: '🔨', color: 'blue' },
  completed: { label: 'Terminé', icon: '🎉', color: 'green' },
  cancelled: { label: 'Annulé', icon: '❌', color: 'red' },
  archived: { label: 'Archivé', icon: '📁', color: 'purple' },
};

// UPDATED UB-2 - Transitions autorisées du cycle de vie
export const BOARD_STATUS_TRANSITIONS: Record<BoardStatus, { next: BoardStatus[]; prev: BoardStatus[] }> = {
  draft: { next: ['ordered', 'cancelled'], prev: [] },
  ordered: { next: ['in_progress', 'cancelled'], prev: ['draft'] },
  in_progress: { next: ['completed', 'cancelled'], prev: ['ordered'] },
  completed: { next: ['archived'], prev: [] },
  cancelled: { next: [], prev: [] },
  archived: { next: [], prev: [] },
};

export const BOARD_TYPE_LABELS: Record<BoardType, string> = {
  free: 'Libre',
  piece: 'Pièce',
  category: 'Catégorie',
  collection: 'Collection',
};

// REMOVED UB-2 - Zone type labels n'existe plus
// export const ZONE_TYPE_LABELS: Record<ZoneType, string> = { ... };

// ============================================
// BOARD (UPDATED UB-2 - Inclut les champs des ex-zones)
// ============================================

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
  // NEW UB-2 - Champs de positionnement (depuis zones)
  positionX: number | null;      // null si board racine
  positionY: number | null;      // null si board racine
  width: number;
  height: number;
  color: string;
  // NEW UB-2 - Champs de cristallisation (depuis zones)
  crystallizedAt: Date | null;
  linkedProjectId: string | null;
  linkedProjectStatus?: ProjectStatus;
  // Timestamps
    
  // UB-5: Optional fields for child boards (populated in getBoard)
  elementCount?: number;
  previewElements?: BoardElement[];
  createdAt: Date;
  updatedAt: Date;
}

// UPDATED UB-2 - BoardWithDetails utilise childBoards au lieu de zones
export interface BoardWithDetails extends Board {
  elements: BoardElement[];
  childBoards: Board[];          // CHANGED: zones → childBoards
  elementCount: number;
  childBoardCount: number;       // CHANGED: zoneCount → childBoardCount
}

// ============================================
// BOARD WITH PREVIEW (pour liste boards)
// ============================================

export interface BoardWithPreview extends Board {
  previewUrl: string | null;
  elementCount: number;
  childBoardCount: number;       // CHANGED: zoneCount → childBoardCount
}

// Board with ancestors for breadcrumb (unchanged)
export interface BoardWithAncestors extends Board {
  ancestors: Board[];
}

// ============================================
// REMOVED UB-2 - BoardZone n'existe plus
// ============================================

// export interface BoardZone { ... }

// ============================================
// BOARD ELEMENT (UPDATED UB-2 - zoneId supprimé)
// ============================================

export interface BoardElement {
  id: string;
  boardId: string;
  // REMOVED UB-2: zoneId: string | null;
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
// ELEMENT DATA (polymorphe) - UNCHANGED
// ============================================

export type ElementData =
  | TextileElementData
  | PaletteElementData
  | InspirationElementData
  | CalculationElementData
  | NoteElementData
  | VideoElementData
  | LinkElementData
  | PdfElementData
  | PatternElementData
  | SilhouetteElementData;

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
  colors: string[];
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
  size?: string;
  variations?: Record<string, string>;
  result?: {
    baseYardage: number;
    totalYardage: number;
    recommended: number;
  };
  source?: 'journey' | 'pattern_import' | 'manual';
  patternId?: string;
  patternName?: string;
  patternBrand?: string;
  selectedSize?: string;
  quantity?: number;
  modifiers?: {
    directional: boolean;
    patternMatching: boolean;
    safetyMarginPercent: number;
  };
  precisionLevel?: 1 | 2 | 3;
  yardageByWidth?: Record<number, number>;
  linkedTextileId?: string;
}

// Type: note
export interface NoteElementData {
  content: string;
  format?: 'plain' | 'markdown';
  color?: string;
}

// Type: video
export interface VideoElementData {
  url: string;
  title?: string;
  thumbnailUrl?: string;
  platform: 'youtube' | 'vimeo' | 'unknown';
  videoId?: string;
}

// Type: link
export interface LinkElementData {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  favicon?: string;
  siteName?: string;
}

// Type: pdf
export interface PdfElementData {
  url: string;
  filename: string;
  pageCount?: number;
  thumbnailUrl?: string;
  fileSize?: number;
}

// Type: pattern
export interface PatternElementData {
  url: string;
  name?: string;
  brand?: string;
  fileType: 'pdf' | 'image';
  pageCount?: number;
  thumbnailUrl?: string;
  garmentType?: string;
  sizes?: string[];
}

// Type: silhouette
export interface SilhouetteElementData {
  url: string;
  name?: string;
  source: 'upload' | 'library';
  category?: string;
}

// ============================================
// TYPE GUARDS - UNCHANGED
// ============================================

export function isTextileElement(data: ElementData): data is TextileElementData {
  return 'textileId' in data && 'snapshot' in data;
}

export function isPaletteElement(data: ElementData): data is PaletteElementData {
  return 'colors' in data && Array.isArray((data as PaletteElementData).colors);
}

export function isInspirationElement(data: ElementData): data is InspirationElementData {
  return 'imageUrl' in data && !('textileId' in data) && !('platform' in data);
}

export function isCalculationElement(data: ElementData): data is CalculationElementData {
  return 'garmentType' in data && ('result' in data || 'yardageByWidth' in data);
}

export function isNoteElement(data: ElementData): data is NoteElementData {
  return 'content' in data && !('garmentType' in data);
}

export function isVideoElement(data: ElementData): data is VideoElementData {
  return 'platform' in data && 'url' in data;
}

export function isLinkElement(data: ElementData): data is LinkElementData {
  return 'url' in data && !('platform' in data) && !('imageUrl' in data && 'textileId' in data);
}

export function isPdfElement(data: ElementData): data is PdfElementData {
  return 'filename' in data && 'url' in data && !('platform' in data) && !('fileType' in data);
}

export function isPatternElement(data: ElementData): data is PatternElementData {
  return 'fileType' in data && 'url' in data;
}

export function isSilhouetteElement(data: ElementData): data is SilhouetteElementData {
  return 'source' in data && (data as SilhouetteElementData).source !== undefined;
}

// ============================================
// INPUT TYPES (UPDATED UB-2)
// ============================================

// UPDATED UB-2 - CreateBoardInput inclut les champs de positionnement
export interface CreateBoardInput {
  name?: string;
  description?: string;
  status?: BoardStatus;
  parentBoardId?: string | null;
  boardType?: BoardType;
  // NEW UB-2 - Champs pour boards enfants (affichage sur canvas parent)
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  color?: string;
}

// UPDATED UB-2 - UpdateBoardInput inclut tous les champs modifiables
export interface UpdateBoardInput {
  name?: string;
  description?: string;
  status?: BoardStatus;
  boardType?: BoardType;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  color?: string;
}

// REMOVED UB-2 - CreateZoneInput et UpdateZoneInput n'existent plus
// export interface CreateZoneInput { ... }
// export interface UpdateZoneInput { ... }

// UPDATED UB-2 - CreateElementInput sans zoneId
export interface CreateElementInput {
  boardId: string;
  // REMOVED UB-2: zoneId?: string;
  elementType: ElementType;
  elementData: ElementData;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  zIndex?: number;
}

// UPDATED UB-2 - UpdateElementInput sans zoneId
export interface UpdateElementInput {
  // REMOVED UB-2: zoneId?: string | null;
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
// DATABASE ROW TYPES (UPDATED UB-2)
// ============================================

// UPDATED UB-2 - BoardRow inclut les nouveaux champs
export interface BoardRow {
  id: string;
  user_id: string | null;
  session_id: string | null;
  parent_board_id: string | null;
  name: string | null;
  description: string | null;
  status: string;
  board_type: string;
  cover_image_url: string | null;
  // NEW UB-2 - Champs depuis zones
  position_x: number | null;
  position_y: number | null;
  width: number;
  height: number;
  color: string;
  crystallized_at: string | null;
  linked_project_id: string | null;
  linked_project_status?: string;
  // Timestamps
  created_at: string;
  updated_at: string;
}

// REMOVED UB-2 - BoardZoneRow n'existe plus
// export interface BoardZoneRow { ... }

// UPDATED UB-2 - BoardElementRow sans zone_id
export interface BoardElementRow {
  id: string;
  board_id: string;
  // REMOVED UB-2: zone_id: string | null;
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
// MAPPERS (UPDATED UB-2)
// ============================================

// UPDATED UB-2 - mapBoardFromRow inclut les nouveaux champs
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
    // NEW UB-2 - Champs de positionnement
    positionX: row.position_x,
    positionY: row.position_y,
    width: row.width ?? 280,
    height: row.height ?? 140,
    color: row.color ?? '#6366F1',
    // NEW UB-2 - Champs de cristallisation
    crystallizedAt: row.crystallized_at ? new Date(row.crystallized_at) : null,
    linkedProjectId: row.linked_project_id,
    linkedProjectStatus: row.linked_project_status as ProjectStatus | undefined,
    // Timestamps
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// REMOVED UB-2 - mapZoneFromRow n'existe plus
// export function mapZoneFromRow(row: BoardZoneRow): BoardZone { ... }

// UPDATED UB-2 - mapElementFromRow sans zoneId
export function mapElementFromRow(row: BoardElementRow): BoardElement {
  return {
    id: row.id,
    boardId: row.board_id,
    // REMOVED UB-2: zoneId: row.zone_id,
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
// ACTION RESULT TYPE - UNCHANGED
// ============================================

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// BOARD HELPERS (UPDATED UB-2)
// ============================================

// UPDATED UB-2 - Helpers pour boards (remplacent les helpers zones)

export function isBoardRoot(board: Board): boolean {
  return board.parentBoardId === null;
}

export function isBoardChildBoard(board: Board): boolean {
  return board.parentBoardId !== null;
}

export function isBoardCrystallized(board: Board): boolean {
  return board.crystallizedAt !== null;
}

export function isBoardOrdered(board: Board): boolean {
  return board.status === 'ordered' || board.status === 'in_progress' || board.status === 'completed';
}

export function isBoardCollection(board: Board): boolean {
  return board.boardType === 'collection';
}

export function isBoardPiece(board: Board): boolean {
  return board.boardType === 'piece';
}

export function isBoardCategory(board: Board): boolean {
  return board.boardType === 'category';
}

// UPDATED UB-2 - Vérifier si une transition de status est autorisée
export function canTransitionTo(board: Board, newStatus: BoardStatus): boolean {
  const transitions = BOARD_STATUS_TRANSITIONS[board.status];
  return transitions.next.includes(newStatus);
}

export function canRollbackTo(board: Board, previousStatus: BoardStatus): boolean {
  const transitions = BOARD_STATUS_TRANSITIONS[board.status];
  return transitions.prev.includes(previousStatus);
}

// ============================================
// REMOVED UB-2 - Anciens helpers zones
// ============================================

// export function isZoneCrystallized(zone: BoardZone): boolean { ... }
// export function isZoneOrdered(zone: BoardZone): boolean { ... }
// export function isZoneLinked(zone: BoardZone): boolean { ... }
