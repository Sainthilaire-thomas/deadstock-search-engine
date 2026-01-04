// src/features/journey/services/yardageCalculator.ts
// Yardage calculation service with detailed breakdown
// Session 10 - 2026-01-03

import {
  GARMENT_TYPES,
  getVariationModifier,
} from '../config/garments';

import type {
  GarmentConfig,
  FabricModifiers,
  CalculationParams,
  CalculationResult,
  GarmentBreakdown,
  Size,
} from '../domain/types';

// ============================================
// CONSTANTS
// ============================================

const STANDARD_FABRIC_WIDTH = 140; // cm

// Fabric width adjustment factors
const WIDTH_ADJUSTMENTS: Record<string, number> = {
  narrow: 0.15,    // +15% for fabrics < 120cm
  standard: 0,     // No adjustment for 120-145cm
  wide: -0.05,     // -5% for fabrics > 145cm
};

// Fabric modifier percentages
const FABRIC_MODIFIER_VALUES = {
  directional: 0.10,    // +10% for directional prints
  patternMatch: 0.20,   // +20% for stripes/checks matching
  velvet: 0.10,         // +10% for nap direction
  stretch: -0.10,       // -10% for stretch fabrics
};

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================

/**
 * Calculate total yardage needed for a project
 */
export function calculateYardage(params: CalculationParams): CalculationResult {
  const { garments, fabricWidth, marginPercent, fabricModifiers } = params;

  // Calculate breakdown for each garment
  const breakdown: GarmentBreakdown[] = garments.map(garment => 
    calculateGarmentYardage(garment, fabricWidth)
  );

  // Calculate subtotal (sum of all garments)
  const subtotal = breakdown.reduce((sum, item) => sum + item.totalForQuantity, 0);

  // Calculate fabric width adjustment
  const fabricWidthAdjustment = calculateWidthAdjustment(subtotal, fabricWidth);
  const afterWidthAdjustment = subtotal + fabricWidthAdjustment;

  // Calculate fabric modifiers (directional, pattern match, etc.)
  const modifiersAmount = calculateModifiersAmount(afterWidthAdjustment, fabricModifiers);
  const afterModifiers = afterWidthAdjustment + modifiersAmount;

  // Calculate safety margin
  const marginAmount = afterModifiers * (marginPercent / 100);
  const totalYardage = afterModifiers + marginAmount;

  // Round up to nearest 0.5m for recommended yardage
  const recommendedYardage = roundToHalf(totalYardage);

  return {
    totalYardage: round2(totalYardage),
    recommendedYardage,
    breakdown,
    subtotal: round2(subtotal),
    fabricWidthAdjustment: round2(fabricWidthAdjustment),
    modifiersAmount: round2(modifiersAmount),
    marginAmount: round2(marginAmount),
  };
}

// ============================================
// GARMENT CALCULATION
// ============================================

/**
 * Calculate yardage for a single garment
 */
function calculateGarmentYardage(
  garment: GarmentConfig,
  fabricWidth: number
): GarmentBreakdown {
  const config = GARMENT_TYPES[garment.type];
  
  if (!config) {
    console.warn(`Unknown garment type: ${garment.type}`);
    return createEmptyBreakdown(garment);
  }

  // Get base yardage for size
  const baseYardage = config.baseYardage[garment.size as Size] || config.baseYardage.M;

  // Calculate variation modifiers
  let variationModifiers = 0;
  
  if (garment.variations) {
    // Length modifier
    if (garment.variations.length) {
      variationModifiers += getVariationModifier(garment.type, 'length', garment.variations.length);
    }
    
    // Sleeves modifier
    if (garment.variations.sleeves) {
      variationModifiers += getVariationModifier(garment.type, 'sleeves', garment.variations.sleeves);
    }
    
    // Neckline modifier
    if (garment.variations.neckline) {
      variationModifiers += getVariationModifier(garment.type, 'neckline', garment.variations.neckline);
    }
    
    // Lining modifier
    if (garment.variations.lining !== undefined) {
      variationModifiers += getVariationModifier(garment.type, 'lining', garment.variations.lining);
    }
    
    // Pattern matching modifier (at garment level, separate from fabric modifiers)
    if (garment.variations.patternMatching) {
      variationModifiers += getVariationModifier(garment.type, 'patternMatching', true);
    }
  }

  // Total per piece
  const totalPerPiece = baseYardage + variationModifiers;
  
  // Total for quantity
  const totalForQuantity = totalPerPiece * garment.quantity;

  return {
    garmentId: garment.id,
    garmentType: garment.type,
    garmentName: garment.name,
    size: garment.size,
    quantity: garment.quantity,
    baseYardage: round2(baseYardage),
    variationModifiers: round2(variationModifiers),
    totalPerPiece: round2(totalPerPiece),
    totalForQuantity: round2(totalForQuantity),
  };
}

/**
 * Create empty breakdown for unknown garment types
 */
function createEmptyBreakdown(garment: GarmentConfig): GarmentBreakdown {
  return {
    garmentId: garment.id,
    garmentType: garment.type,
    garmentName: garment.name,
    size: garment.size,
    quantity: garment.quantity,
    baseYardage: 0,
    variationModifiers: 0,
    totalPerPiece: 0,
    totalForQuantity: 0,
  };
}

// ============================================
// ADJUSTMENT CALCULATIONS
// ============================================

/**
 * Calculate adjustment based on fabric width
 */
function calculateWidthAdjustment(subtotal: number, fabricWidth: number): number {
  if (fabricWidth < 120) {
    // Narrow fabric: add 15%
    return subtotal * WIDTH_ADJUSTMENTS.narrow;
  } else if (fabricWidth > 145) {
    // Wide fabric: subtract 5%
    return subtotal * WIDTH_ADJUSTMENTS.wide;
  }
  // Standard width: no adjustment
  return 0;
}

/**
 * Calculate modifiers amount based on fabric characteristics
 */
function calculateModifiersAmount(
  baseAmount: number,
  modifiers: FabricModifiers
): number {
  let totalModifier = 0;

  if (modifiers.directional) {
    totalModifier += FABRIC_MODIFIER_VALUES.directional;
  }
  
  if (modifiers.patternMatch) {
    totalModifier += FABRIC_MODIFIER_VALUES.patternMatch;
  }
  
  if (modifiers.velvet) {
    totalModifier += FABRIC_MODIFIER_VALUES.velvet;
  }
  
  if (modifiers.stretch) {
    totalModifier += FABRIC_MODIFIER_VALUES.stretch;
  }

  return baseAmount * totalModifier;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Round to 2 decimal places
 */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Round up to nearest 0.5
 */
function roundToHalf(value: number): number {
  return Math.ceil(value * 2) / 2;
}

// ============================================
// QUICK CALCULATION (Standalone Calculator)
// ============================================

export interface QuickCalculationParams {
  garmentType: string;
  size: Size;
  quantity: number;
  fabricWidth?: number;
  marginPercent?: number;
}

/**
 * Quick calculation for standalone calculator (single garment)
 */
export function quickCalculateYardage(params: QuickCalculationParams): {
  base: number;
  withMargin: number;
  recommended: number;
} {
  const {
    garmentType,
    size,
    quantity,
    fabricWidth = STANDARD_FABRIC_WIDTH,
    marginPercent = 10,
  } = params;

  const config = GARMENT_TYPES[garmentType as keyof typeof GARMENT_TYPES];
  
  if (!config) {
    return { base: 0, withMargin: 0, recommended: 0 };
  }

  const basePerPiece = config.baseYardage[size] || config.baseYardage.M;
  const base = basePerPiece * quantity;

  // Apply width adjustment
  let adjusted = base;
  if (fabricWidth < 120) {
    adjusted *= 1.15;
  } else if (fabricWidth > 145) {
    adjusted *= 0.95;
  }

  // Apply margin
  const withMargin = adjusted * (1 + marginPercent / 100);
  
  // Round up to nearest 0.5
  const recommended = roundToHalf(withMargin);

  return {
    base: round2(base),
    withMargin: round2(withMargin),
    recommended,
  };
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate calculation params
 */
export function validateCalculationParams(params: CalculationParams): string[] {
  const errors: string[] = [];

  if (!params.garments || params.garments.length === 0) {
    errors.push('At least one garment is required');
  }

  if (params.fabricWidth < 50 || params.fabricWidth > 300) {
    errors.push('Fabric width must be between 50 and 300 cm');
  }

  if (params.marginPercent < 0 || params.marginPercent > 50) {
    errors.push('Margin must be between 0 and 50%');
  }

  params.garments?.forEach((garment, index) => {
    if (!GARMENT_TYPES[garment.type]) {
      errors.push(`Unknown garment type at index ${index}: ${garment.type}`);
    }
    if (garment.quantity < 1) {
      errors.push(`Quantity must be at least 1 for garment at index ${index}`);
    }
  });

  return errors;
}

// ============================================
// EXPORT HELPERS
// ============================================

/**
 * Format yardage for display
 */
export function formatYardage(meters: number, locale: string = 'fr'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(meters) + ' m';
}

/**
 * Get yardage status (sufficient/insufficient) compared to available stock
 */
export function checkYardageSufficiency(
  required: number,
  available: number
): 'sufficient' | 'tight' | 'insufficient' {
  if (available >= required * 1.1) {
    return 'sufficient'; // 10% buffer
  } else if (available >= required) {
    return 'tight'; // Just enough
  }
  return 'insufficient';
}
