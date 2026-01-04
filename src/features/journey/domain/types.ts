// src/features/journey/domain/types.ts
// Types for the Designer Journey module
// Session 10 - 2026-01-03

import { LucideIcon } from 'lucide-react';

// ============================================
// ENUMS & BASIC TYPES
// ============================================

export type ProjectType = 'single_piece' | 'collection' | 'prototype';

export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export type JourneyStep = 
  | 'idea' 
  | 'inspiration' 
  | 'design' 
  | 'calculate' 
  | 'sourcing' 
  | 'validation' 
  | 'purchase' 
  | 'production' 
  | 'impact';

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type GarmentType = 
  // Tops
  | 'shirt' 
  | 'blouse' 
  | 'tshirt' 
  | 'top' 
  | 'sweater' 
  | 'vest'
  // Bottoms
  | 'pants' 
  | 'shorts' 
  | 'skirt'
  // Dresses & Jumpsuits
  | 'dress' 
  | 'jumpsuit' 
  | 'romper'
  // Outerwear
  | 'blazer' 
  | 'jacket' 
  | 'coat' 
  | 'trench'
  // Accessories
  | 'scarf' 
  | 'bag' 
  | 'belt' 
  | 'bowtie';

export type GarmentCategory = 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'accessories';

// ============================================
// MOOD BOARD TYPES
// ============================================

export type MoodBoardItemType = 'image' | 'color' | 'textile' | 'note';

export interface MoodBoardItemPosition {
  x: number;
  y: number;
}

export interface MoodBoardItemSize {
  width: number;
  height: number;
}

export interface MoodBoardItemData {
  url?: string;           // For images
  color?: string;         // For color swatches (#hex format)
  textileId?: string;     // For textile references
  text?: string;          // For notes
  caption?: string;       // Optional caption for any item
}

export interface MoodBoardItem {
  id: string;
  type: MoodBoardItemType;
  position: MoodBoardItemPosition;
  size: MoodBoardItemSize;
  zIndex: number;
  data: MoodBoardItemData;
  createdAt?: string;
}

export interface ColorPalette {
  primary: string;          // Main color (#hex)
  secondary: string[];      // Secondary colors
  accent?: string;          // Accent color
  neutral?: string;         // Neutral/base color
}

export interface ReferenceImage {
  id: string;
  url: string;
  caption?: string;
  extractedColors?: string[];  // Colors extracted from image
}

// ============================================
// GARMENT TYPES
// ============================================

export type GarmentLength = 'mini' | 'midi' | 'maxi' | 'standard';
export type SleeveType = 'none' | 'short' | 'three_quarter' | 'long';
export type NecklineType = 'round' | 'v' | 'square' | 'boat' | 'collar';

export interface GarmentVariations {
  length?: GarmentLength;
  sleeves?: SleeveType;
  neckline?: NecklineType;
  lining?: boolean;
  patternMatching?: boolean;  // For stripes/checks that need matching
}

export interface GarmentConfig {
  id: string;
  type: GarmentType;
  name?: string;              // Custom name (e.g., "Robe pour Sophie")
  size: Size;
  quantity: number;
  variations?: GarmentVariations;
  calculatedYardage?: number; // Calculated yardage for this garment
  notes?: string;
}

// ============================================
// CALCULATION TYPES
// ============================================

export interface FabricModifiers {
  directional: boolean;     // +10% for directional prints
  patternMatch: boolean;    // +20% for stripes/checks matching
  velvet: boolean;          // +10% for nap direction
  stretch: boolean;         // -10% for stretch fabrics
}

export interface GarmentBreakdown {
  garmentId: string;
  garmentType: GarmentType;
  garmentName?: string;
  size: Size;
  quantity: number;
  baseYardage: number;
  variationModifiers: number;
  totalPerPiece: number;
  totalForQuantity: number;
}

export interface YardageDetails {
  breakdown: GarmentBreakdown[];
  subtotal: number;
  fabricWidthAdjustment: number;
  modifiersAmount: number;
  marginAmount: number;
  total: number;
  recommended: number;  // Rounded up to nearest 0.5m
}

export interface CalculationParams {
  garments: GarmentConfig[];
  fabricWidth: number;
  marginPercent: number;
  fabricModifiers: FabricModifiers;
}

export interface CalculationResult {
  totalYardage: number;
  recommendedYardage: number;
  breakdown: GarmentBreakdown[];
  subtotal: number;
  fabricWidthAdjustment: number;
  modifiersAmount: number;
  marginAmount: number;
}

// ============================================
// SOURCING TYPES
// ============================================

export interface SelectedTextile {
  textileId: string;
  quantity: number;
  notes?: string;
  addedAt?: string;
}

// ============================================
// CLIENT & CONSTRAINTS
// ============================================

export interface ClientInfo {
  name?: string;
  email?: string;
}

export interface ProjectConstraints {
  localProduction?: boolean;
  organic?: boolean;
  deadstockOnly?: boolean;
  shortDeadline?: boolean;
  tightBudget?: boolean;
}

export interface BudgetRange {
  min?: number;
  max?: number;
  currency: string;
}

// ============================================
// MAIN PROJECT TYPE
// ============================================

export interface Project {
  id: string;
  
  // Ownership
  userId?: string;
  sessionId?: string;
  
  // Basic Info
  name: string;
  nameI18n?: Record<string, string>;
  description?: string;
  descriptionI18n?: Record<string, string>;
  projectType: ProjectType;
  
  // Status
  status: ProjectStatus;
  currentStep: JourneyStep;
  
  // Step 2: Inspiration
  moodBoard: MoodBoardItem[];
  colorPalette?: ColorPalette;
  styleKeywords: string[];
  referenceImages: ReferenceImage[];
  
  // Step 3: Design
  garments: GarmentConfig[];
  
  // Step 4: Calculation
  fabricWidth: number;
  marginPercent: number;
  fabricModifiers: FabricModifiers;
  totalYardage?: number;
  yardageDetails?: YardageDetails;
  
  // Step 5-6: Sourcing
  selectedTextiles: SelectedTextile[];
  
  // Client Info
  clientName?: string;
  clientEmail?: string;
  deadline?: Date | string;
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  
  // Constraints
  constraints: ProjectConstraints;
  
  // Metadata
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============================================
// FORM TYPES (for React Hook Form)
// ============================================

export interface ProjectIdeaFormData {
  name: string;
  description?: string;
  projectType: ProjectType;
  clientName?: string;
  clientEmail?: string;
  deadline?: string;  // ISO date string
  budgetMin?: number;
  budgetMax?: number;
  constraints?: ProjectConstraints;
}

export interface ProjectDesignFormData {
  garments: GarmentConfig[];
}

export interface ProjectCalculateFormData {
  fabricWidth: number;
  marginPercent: number;
  fabricModifiers: FabricModifiers;
}

// ============================================
// JOURNEY STEP CONFIGURATION
// ============================================

export type StepPhase = 'mvp' | 'phase-2' | 'phase-3' | 'phase-4' | 'phase-5';
export type StepStatus = 'completed' | 'current' | 'available' | 'locked' | 'upcoming';

export interface JourneyStepConfig {
  id: JourneyStep;
  path: string;
  icon: LucideIcon;
  labelKey: string;          // i18n key
  descriptionKey?: string;   // i18n key for description
  phase: StepPhase;
  order: number;
  
  // Variations that this step supports
  supportedGarmentOptions?: (keyof GarmentVariations)[];
}

export interface JourneyStepState {
  id: JourneyStep;
  status: StepStatus;
  completedAt?: string;
  data?: Record<string, unknown>;
}

// ============================================
// GARMENT TYPE CONFIGURATION
// ============================================

export interface GarmentYardageBySize {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

export interface GarmentModifier {
  [key: string]: number;  // e.g., { mini: -0.5, midi: 0, maxi: 0.8 }
}

export interface GarmentTypeConfig {
  type: GarmentType;
  category: GarmentCategory;
  labelKey: string;         // i18n key
  icon: string;             // Emoji or icon name
  baseYardage: GarmentYardageBySize;
  availableVariations: (keyof GarmentVariations)[];
  modifiers: {
    length?: GarmentModifier;
    sleeves?: GarmentModifier;
    neckline?: GarmentModifier;
    lining?: GarmentModifier;
    patternMatching?: GarmentModifier;
  };
  estimatedRange: string;   // e.g., "2.5-3.8m" for display
}

export interface GarmentCategoryConfig {
  id: GarmentCategory;
  labelKey: string;
  items: GarmentType[];
}

// ============================================
// CONTEXT & HOOKS TYPES
// ============================================

export interface ProjectContextValue {
  // State
  project: Project | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  hasUnsavedChanges: boolean;
  
  // Project Actions
  createProject: (data: ProjectIdeaFormData) => Promise<Project>;
  updateProject: (updates: Partial<Project>) => Promise<void>;
  deleteProject: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  
  // Step Navigation
  currentStep: JourneyStep;
  goToStep: (step: JourneyStep) => void;
  completeStep: (step: JourneyStep) => void;
  
  // Garments
  addGarment: (garment: Omit<GarmentConfig, 'id'>) => void;
  updateGarment: (id: string, updates: Partial<GarmentConfig>) => void;
  removeGarment: (id: string) => void;
  duplicateGarment: (id: string) => void;
  
  // Mood Board
  addMoodBoardItem: (item: Omit<MoodBoardItem, 'id'>) => void;
  updateMoodBoardItem: (id: string, updates: Partial<MoodBoardItem>) => void;
  removeMoodBoardItem: (id: string) => void;
  reorderMoodBoardItems: (items: MoodBoardItem[]) => void;
  
  // Colors
  updateColorPalette: (palette: ColorPalette) => void;
  addStyleKeyword: (keyword: string) => void;
  removeStyleKeyword: (keyword: string) => void;
  
  // Calculation
  updateCalculationParams: (params: Partial<ProjectCalculateFormData>) => void;
  calculateYardage: () => CalculationResult;
  
  // Textiles
  addSelectedTextile: (textile: SelectedTextile) => void;
  removeSelectedTextile: (textileId: string) => void;
  updateSelectedTextile: (textileId: string, updates: Partial<SelectedTextile>) => void;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ProjectListItem {
  id: string;
  name: string;
  projectType: ProjectType;
  status: ProjectStatus;
  currentStep: JourneyStep;
  garmentsCount: number;
  totalYardage?: number;
  updatedAt: string;
  createdAt: string;
}

export interface ProjectsListResponse {
  projects: ProjectListItem[];
  total: number;
}

// ============================================
// LEGACY TYPES (pour composants Sidebar existants)
// ============================================

/**
 * Phase du projet (pour regroupement visuel)
 */
export type ProjectPhase = 
  | "conception"    // Idée, Inspiration, Design
  | "preparation"   // Calcul, Sourcing, Validation
  | "execution"     // Achat, Production, Impact
  | "future";       // Étapes Phase 2+

// Ajouter 'upcoming' au StepStatus existant
// Note: StepStatus est déjà défini plus haut, on étend ici
export type StepStatusExtended = StepStatus | 'upcoming';

/**
 * Configuration d'une étape du parcours designer (legacy)
 */
export interface DesignJourneyStep {
  /** Identifiant unique de l'étape */
  id: string;
  
  /** Numéro de l'étape (1-9) */
  order: number;
  
  /** Titre de l'étape */
  title: string;
  
  /** Description courte pour tooltip */
  description: string;
  
  /** Icône Lucide React */
  icon: LucideIcon;
  
  /** Route associée (ex: /tools/yardage-calculator) */
  path: string;
  
  /** Phase du projet */
  phase: ProjectPhase;
  
  /** Disponible dans le MVP ? */
  availableInMVP: boolean;
  
  /** Emoji pour mobile/quick view */
  emoji: string;
}

/**
 * Props pour le composant Sidebar
 */
export interface SidebarProps {
  /** Étape courante (détectée depuis pathname) */
  currentStep?: string;
  
  /** Sidebar collapsée ? */
  isCollapsed?: boolean;
  
  /** Callback toggle collapse */
  onToggleCollapse?: () => void;
  
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Props pour un step individuel
 */
export interface SidebarStepProps {
  /** Configuration de l'étape */
  step: DesignJourneyStep;
  
  /** Statut de l'étape */
  status: StepStatus | 'upcoming';
  
  /** Sidebar collapsée ? */
  isCollapsed: boolean;
  
  /** Callback au click */
  onClick?: () => void;
}

/**
 * Props pour la navigation mobile
 */
export interface MobileJourneyNavProps {
  /** Étape courante */
  currentStep?: string;
  
  /** Classes CSS additionnelles */
  className?: string;
}
