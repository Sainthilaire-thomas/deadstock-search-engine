// src/features/pattern/domain/types.ts

/**
 * Pattern Import Domain Types
 * 
 * Types pour l'import de patrons et le calcul de métrage.
 * Conforme à l'architecture DDD Light (ADR-005).
 */

// ============================================
// GARMENT TYPES
// ============================================

export type GarmentCategory = 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'other';

export type GarmentType = 
  // Tops
  | 'tshirt' | 'blouse' | 'shirt' | 'tank_top' | 'crop_top' | 'sweater'
  // Bottoms  
  | 'pants_straight' | 'pants_wide' | 'shorts' 
  | 'skirt_straight' | 'skirt_circle' | 'skirt_midi'
  // Dresses
  | 'dress_short' | 'dress_midi' | 'dress_long' | 'jumpsuit'
  // Outerwear
  | 'jacket' | 'vest' | 'blazer' | 'coat_short' | 'coat_long' | 'bomber'
  // Other
  | 'accessory' | 'other';

export const GARMENT_CATEGORIES: Record<GarmentCategory, GarmentType[]> = {
  tops: ['tshirt', 'blouse', 'shirt', 'tank_top', 'crop_top', 'sweater'],
  bottoms: ['pants_straight', 'pants_wide', 'shorts', 'skirt_straight', 'skirt_circle', 'skirt_midi'],
  dresses: ['dress_short', 'dress_midi', 'dress_long', 'jumpsuit'],
  outerwear: ['jacket', 'vest', 'blazer', 'coat_short', 'coat_long', 'bomber'],
  other: ['accessory', 'other'],
};

export const GARMENT_LABELS: Record<GarmentType, string> = {
  tshirt: 'T-shirt',
  blouse: 'Blouse',
  shirt: 'Chemise',
  tank_top: 'Débardeur',
  crop_top: 'Crop top',
  sweater: 'Pull',
  pants_straight: 'Pantalon droit',
  pants_wide: 'Pantalon large',
  shorts: 'Short',
  skirt_straight: 'Jupe droite',
  skirt_circle: 'Jupe cercle',
  skirt_midi: 'Jupe midi',
  dress_short: 'Robe courte',
  dress_midi: 'Robe midi',
  dress_long: 'Robe longue',
  jumpsuit: 'Combinaison',
  jacket: 'Veste',
  vest: 'Gilet / Veste sans manches',
  blazer: 'Blazer',
  coat_short: 'Manteau court',
  coat_long: 'Manteau long',
  bomber: 'Bomber',
  accessory: 'Accessoire',
  other: 'Autre',
};

export const CATEGORY_LABELS: Record<GarmentCategory, string> = {
  tops: 'Hauts',
  bottoms: 'Bas',
  dresses: 'Robes & Combinaisons',
  outerwear: 'Vestes & Manteaux',
  other: 'Autres',
};

// ============================================
// SIZES
// ============================================

export type SizeFormat = 'letters' | 'EU' | 'US';

export const SIZES_BY_FORMAT: Record<SizeFormat, string[]> = {
  letters: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  EU: ['34', '36', '38', '40', '42', '44', '46', '48'],
  US: ['2', '4', '6', '8', '10', '12', '14', '16'],
};

export const DEFAULT_SIZES = SIZES_BY_FORMAT.letters;

// ============================================
// MODIFIERS
// ============================================

export interface YardageModifiers {
  directional: boolean;       // Tissu sens unique (+10%)
  patternMatching: boolean;   // Raccord motif (+20%)
  safetyMarginPercent: number; // Marge sécurité (défaut 10%)
}

export const DEFAULT_MODIFIERS: YardageModifiers = {
  directional: false,
  patternMatching: false,
  safetyMarginPercent: 10,
};

// ============================================
// PATTERN ANALYSIS (from AI extraction)
// ============================================

export interface PatternAnalysisResult {
  // Métadonnées extraites
  detectedBrand: string | null;
  detectedName: string | null;
  detectedGarmentType: GarmentType | null;
  
  // Tailles
  availableSizes: string[] | null;
  isSingleSize: boolean;
  sizeFormat: SizeFormat | 'unknown';
  
  // Pièces (si détectées)
  pieces: ExtractedPiece[];
  
  // Tableau de métrage
  hasYardageTable: boolean;
  yardageTable: YardageTable | null;
  
  // Qualité
  precisionLevel: 1 | 2 | 3;
  confidence: number; // 0-1
  
  // Infos manquantes à demander à l'utilisateur
  missingInfo: MissingInfoType[];
}

export interface ExtractedPiece {
  id: string;
  name: string;
  quantity: number;
  onFold: boolean;
  cutInstruction?: string;
}

export interface YardageTable {
  // Structure : view → size → fabricWidth → yardage (en mètres)
  data: Record<string, Record<string, Record<number, number>>>;
  unit: 'meters' | 'yards';
  notes?: string[];
}

export type MissingInfoType = 'garment_type' | 'size' | 'quantity' | 'view';

// ============================================
// USER CONFIGURATION
// ============================================

export interface PatternConfig {
  garmentType: GarmentType;
  selectedView?: string;
  selectedSize: string;
  quantity: number;
  modifiers: YardageModifiers;
  knownFabricWidthCm?: number; // Si l'utilisateur a déjà repéré un tissu
}

// ============================================
// CALCULATION RESULT
// ============================================

export interface YardageCalculationResult {
  // Input summary
  garmentType: GarmentType;
  size: string;
  quantity: number;
  
  // Quality indicator
  precisionLevel: 1 | 2 | 3;
  source: 'extracted_table' | 'formula_specific' | 'formula_generic';
  
  // Result mode
  mode: 'single_width' | 'multi_width';
  
  // Single width result (if fabric width known)
  singleResult?: {
    fabricWidthCm: number;
    baseYardage: number;
    withModifiers: number;
    recommended: number;
  };
  
  // Multi-width results (default - for search)
  multiResults: YardageForWidth[];
  
  // For search filter - quick lookup
  yardageByWidth: Record<number, number>;
}

export interface YardageForWidth {
  fabricWidthCm: number;
  baseYardage: number;
  withModifiers: number;
  recommended: number;
}

// ============================================
// BOARD ELEMENT DATA
// ============================================

export interface PatternCalculationElementData {
  // Source
  source: 'pattern_import' | 'manual';
  
  // Référence patron (si importé)
  patternId?: string;
  patternName: string;
  patternBrand?: string;
  
  // Configuration
  garmentType: GarmentType;
  selectedSize: string;
  quantity: number;
  modifiers: YardageModifiers;
  
  // Résultat
  precisionLevel: 1 | 2 | 3;
  yardageByWidth: Record<number, number>;
  
  // Lien tissu (optionnel, défini plus tard)
  linkedTextileId?: string;
}

// ============================================
// SEARCH FILTER
// ============================================

export interface YardageSearchFilter {
  active: boolean;
  patternName: string;
  garmentType: GarmentType;
  size: string;
  yardageByWidth: Record<number, number>;
}

// ============================================
// IMPORTED PATTERN (DB entity)
// ============================================

export interface ImportedPattern {
  id: string;
  userId?: string;
  sessionId?: string;
  
  // Metadata
  name: string;
  brand?: string;
  garmentType?: GarmentType;
  
  // File
  fileUrl: string;
  fileType: 'pdf' | 'image';
  fileSizeBytes?: number;
  pageCount?: number;
  
  // Analysis
  analysisResult?: PatternAnalysisResult;
  precisionLevel?: 1 | 2 | 3;
  confidence?: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// INPUT TYPES (for actions/use cases)
// ============================================

export interface AnalyzePatternInput {
  file: File;
  sessionId: string;
}

export interface CalculateYardageInput {
  // From analysis (optional)
  analysis?: PatternAnalysisResult;
  // User config (required)
  config: PatternConfig;
}

export interface SavePatternInput {
  sessionId: string;
  name: string;
  brand?: string;
  fileUrl: string;
  fileType: 'pdf' | 'image';
  analysisResult?: PatternAnalysisResult;
}
