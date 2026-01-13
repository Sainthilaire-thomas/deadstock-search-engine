// src/features/boards/domain/types.ts

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type BoardStatus = 'draft' | 'active' | 'archived';

// UPDATED Sprint 5 - Ajout video et link
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
  // Crystallization fields
  crystallizedAt: Date | null;
  linkedProjectId: string | null;
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

// UPDATED Sprint 5 - Ajout VideoElementData et LinkElementData
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
// Type: calculation (supporte Journey ET Pattern Import)
export interface CalculationElementData {
  calculationId?: string;
  summary: string;
  garmentType: string;
  
  // Format Journey (legacy)
  size?: string;
  variations?: Record<string, string>;
  result?: {
    baseYardage: number;
    totalYardage: number;
    recommended: number;
  };
  
  // Format Pattern Import (nouveau)
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
  color?: string; // background color
}

// ============================================
// NEW Sprint 5 - Video & Link Element Data
// ============================================

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

// ============================================
// NEW Sprint 6 - PDF, Pattern, Silhouette Element Data
// ============================================

// Type: pdf
export interface PdfElementData {
  url: string;              // URL du fichier (Supabase Storage ou base64)
  filename: string;         // Nom original du fichier
  pageCount?: number;       // Nombre de pages (si détecté)
  thumbnailUrl?: string;    // Image de la première page
  fileSize?: number;        // Taille en bytes
}

// Type: pattern (patron de couture)
export interface PatternElementData {
  url: string;              // URL du fichier (PDF ou image)
  name?: string;            // Nom du patron
  brand?: string;           // Marque (Vogue, Burda, etc.)
  fileType: 'pdf' | 'image';
  pageCount?: number;       // Si PDF
  thumbnailUrl?: string;    // Preview
  garmentType?: string;     // Type de vêtement détecté
  sizes?: string[];         // Tailles disponibles
}

// Type: silhouette (croquis de mode)
export interface SilhouetteElementData {
  url: string;              // URL de l'image
  name?: string;            // Nom/description
  source: 'upload' | 'library';
  category?: string;        // Catégorie (femme, homme, enfant, etc.)
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
  return 'imageUrl' in data && !('textileId' in data) && !('platform' in data);
}

export function isCalculationElement(data: ElementData): data is CalculationElementData {
  return 'garmentType' in data && ('result' in data || 'yardageByWidth' in data);
}

export function isNoteElement(data: ElementData): data is NoteElementData {
  return 'content' in data && !('garmentType' in data);
}

// NEW Sprint 5
export function isVideoElement(data: ElementData): data is VideoElementData {
  return 'platform' in data && 'url' in data;
}

// NEW Sprint 5
export function isLinkElement(data: ElementData): data is LinkElementData {
  return 'url' in data && !('platform' in data) && !('imageUrl' in data && 'textileId' in data);
}

// NEW Sprint 6
export function isPdfElement(data: ElementData): data is PdfElementData {
  return 'filename' in data && 'url' in data && !('platform' in data) && !('fileType' in data);
}

// NEW Sprint 6
export function isPatternElement(data: ElementData): data is PatternElementData {
  return 'fileType' in data && 'url' in data;
}

// NEW Sprint 6
export function isSilhouetteElement(data: ElementData): data is SilhouetteElementData {
  return 'source' in data && (data as SilhouetteElementData).source !== undefined;
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
  // Crystallization columns
  crystallized_at: string | null;
  linked_project_id: string | null;
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
    // Crystallization mapping
    crystallizedAt: row.crystallized_at ? new Date(row.crystallized_at) : null,
    linkedProjectId: row.linked_project_id,
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
// ============================================
// CRYSTALLIZATION HELPERS
// ============================================

export function isZoneCrystallized(zone: BoardZone): boolean {
  return zone.crystallizedAt !== null;
}
