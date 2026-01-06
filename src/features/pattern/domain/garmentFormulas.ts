// src/features/pattern/domain/garmentFormulas.ts

/**
 * Formules de métrage par type de vêtement
 * 
 * Ces formules sont des estimations basées sur des moyennes professionnelles.
 * Le métrage de référence est calculé pour une largeur de tissu de 140cm.
 */

import type { GarmentType } from './types';

// ============================================
// BASE YARDAGE (référence 140cm)
// ============================================

/**
 * Métrage de base pour tissu 140cm (en mètres)
 * Format: { garmentType: { size: meters } }
 */
export const BASE_YARDAGE_140CM: Record<GarmentType, Record<string, number>> = {
  // ─────────────────────────────────────────
  // TOPS
  // ─────────────────────────────────────────
  tshirt: {
    XS: 1.20, S: 1.30, M: 1.40, L: 1.50, XL: 1.60, XXL: 1.70,
    '34': 1.20, '36': 1.25, '38': 1.30, '40': 1.40, '42': 1.50, '44': 1.55, '46': 1.60, '48': 1.70,
  },
  blouse: {
    XS: 1.40, S: 1.50, M: 1.60, L: 1.70, XL: 1.80, XXL: 1.90,
    '34': 1.40, '36': 1.45, '38': 1.50, '40': 1.60, '42': 1.70, '44': 1.75, '46': 1.80, '48': 1.90,
  },
  shirt: {
    XS: 1.50, S: 1.60, M: 1.70, L: 1.80, XL: 1.90, XXL: 2.00,
    '34': 1.50, '36': 1.55, '38': 1.60, '40': 1.70, '42': 1.80, '44': 1.85, '46': 1.90, '48': 2.00,
  },
  tank_top: {
    XS: 0.80, S: 0.90, M: 1.00, L: 1.10, XL: 1.20, XXL: 1.30,
    '34': 0.80, '36': 0.85, '38': 0.90, '40': 1.00, '42': 1.10, '44': 1.15, '46': 1.20, '48': 1.30,
  },
  crop_top: {
    XS: 0.70, S: 0.80, M: 0.90, L: 1.00, XL: 1.10, XXL: 1.20,
    '34': 0.70, '36': 0.75, '38': 0.80, '40': 0.90, '42': 1.00, '44': 1.05, '46': 1.10, '48': 1.20,
  },
  sweater: {
    XS: 1.50, S: 1.60, M: 1.70, L: 1.80, XL: 2.00, XXL: 2.20,
    '34': 1.50, '36': 1.55, '38': 1.60, '40': 1.70, '42': 1.85, '44': 1.95, '46': 2.10, '48': 2.20,
  },
  
  // ─────────────────────────────────────────
  // BOTTOMS
  // ─────────────────────────────────────────
  pants_straight: {
    XS: 1.40, S: 1.50, M: 1.60, L: 1.70, XL: 1.80, XXL: 1.90,
    '34': 1.40, '36': 1.45, '38': 1.50, '40': 1.60, '42': 1.70, '44': 1.75, '46': 1.80, '48': 1.90,
  },
  pants_wide: {
    XS: 1.80, S: 1.90, M: 2.00, L: 2.10, XL: 2.30, XXL: 2.50,
    '34': 1.80, '36': 1.85, '38': 1.90, '40': 2.00, '42': 2.15, '44': 2.30, '46': 2.40, '48': 2.50,
  },
  shorts: {
    XS: 0.80, S: 0.90, M: 1.00, L: 1.10, XL: 1.20, XXL: 1.30,
    '34': 0.80, '36': 0.85, '38': 0.90, '40': 1.00, '42': 1.10, '44': 1.15, '46': 1.20, '48': 1.30,
  },
  skirt_straight: {
    XS: 0.80, S: 0.90, M: 1.00, L: 1.10, XL: 1.20, XXL: 1.30,
    '34': 0.80, '36': 0.85, '38': 0.90, '40': 1.00, '42': 1.10, '44': 1.15, '46': 1.20, '48': 1.30,
  },
  skirt_circle: {
    XS: 2.00, S: 2.20, M: 2.40, L: 2.60, XL: 2.80, XXL: 3.00,
    '34': 2.00, '36': 2.10, '38': 2.20, '40': 2.40, '42': 2.60, '44': 2.70, '46': 2.80, '48': 3.00,
  },
  skirt_midi: {
    XS: 1.20, S: 1.30, M: 1.40, L: 1.50, XL: 1.60, XXL: 1.70,
    '34': 1.20, '36': 1.25, '38': 1.30, '40': 1.40, '42': 1.50, '44': 1.55, '46': 1.60, '48': 1.70,
  },
  
  // ─────────────────────────────────────────
  // DRESSES
  // ─────────────────────────────────────────
  dress_short: {
    XS: 1.60, S: 1.70, M: 1.80, L: 1.90, XL: 2.00, XXL: 2.20,
    '34': 1.60, '36': 1.65, '38': 1.70, '40': 1.80, '42': 1.90, '44': 2.00, '46': 2.10, '48': 2.20,
  },
  dress_midi: {
    XS: 2.00, S: 2.20, M: 2.40, L: 2.60, XL: 2.80, XXL: 3.00,
    '34': 2.00, '36': 2.10, '38': 2.20, '40': 2.40, '42': 2.60, '44': 2.70, '46': 2.80, '48': 3.00,
  },
  dress_long: {
    XS: 2.50, S: 2.70, M: 2.90, L: 3.10, XL: 3.30, XXL: 3.50,
    '34': 2.50, '36': 2.60, '38': 2.70, '40': 2.90, '42': 3.10, '44': 3.20, '46': 3.30, '48': 3.50,
  },
  jumpsuit: {
    XS: 2.50, S: 2.70, M: 2.90, L: 3.10, XL: 3.30, XXL: 3.50,
    '34': 2.50, '36': 2.60, '38': 2.70, '40': 2.90, '42': 3.10, '44': 3.20, '46': 3.30, '48': 3.50,
  },
  
  // ─────────────────────────────────────────
  // OUTERWEAR
  // ─────────────────────────────────────────
  jacket: {
    XS: 1.80, S: 1.90, M: 2.00, L: 2.20, XL: 2.40, XXL: 2.60,
    '34': 1.80, '36': 1.85, '38': 1.90, '40': 2.00, '42': 2.20, '44': 2.35, '46': 2.50, '48': 2.60,
  },
  vest: {
    XS: 1.20, S: 1.30, M: 1.40, L: 1.50, XL: 1.60, XXL: 1.80,
    '34': 1.20, '36': 1.25, '38': 1.30, '40': 1.40, '42': 1.50, '44': 1.60, '46': 1.70, '48': 1.80,
  },
  blazer: {
    XS: 1.80, S: 1.90, M: 2.00, L: 2.20, XL: 2.40, XXL: 2.60,
    '34': 1.80, '36': 1.85, '38': 1.90, '40': 2.00, '42': 2.20, '44': 2.35, '46': 2.50, '48': 2.60,
  },
  coat_short: {
    XS: 2.20, S: 2.40, M: 2.60, L: 2.80, XL: 3.00, XXL: 3.20,
    '34': 2.20, '36': 2.30, '38': 2.40, '40': 2.60, '42': 2.80, '44': 2.90, '46': 3.00, '48': 3.20,
  },
  coat_long: {
    XS: 2.80, S: 3.00, M: 3.20, L: 3.40, XL: 3.60, XXL: 3.80,
    '34': 2.80, '36': 2.90, '38': 3.00, '40': 3.20, '42': 3.40, '44': 3.50, '46': 3.60, '48': 3.80,
  },
  bomber: {
    XS: 1.60, S: 1.70, M: 1.80, L: 2.00, XL: 2.20, XXL: 2.40,
    '34': 1.60, '36': 1.65, '38': 1.70, '40': 1.80, '42': 2.00, '44': 2.15, '46': 2.30, '48': 2.40,
  },
  
  // ─────────────────────────────────────────
  // OTHER
  // ─────────────────────────────────────────
  accessory: {
    XS: 0.30, S: 0.40, M: 0.50, L: 0.60, XL: 0.70, XXL: 0.80,
    '34': 0.30, '36': 0.35, '38': 0.40, '40': 0.50, '42': 0.60, '44': 0.65, '46': 0.70, '48': 0.80,
  },
  other: {
    XS: 1.50, S: 1.60, M: 1.70, L: 1.80, XL: 2.00, XXL: 2.20,
    '34': 1.50, '36': 1.55, '38': 1.60, '40': 1.70, '42': 1.85, '44': 1.95, '46': 2.10, '48': 2.20,
  },
};

// ============================================
// WIDTH COEFFICIENTS
// ============================================

/**
 * Coefficients pour adapter le métrage selon la largeur du tissu
 * Base = 140cm (coefficient 1.0)
 * 
 * Plus le tissu est étroit, plus il faut de longueur.
 */
export const WIDTH_COEFFICIENTS: Record<number, number> = {
  90: 1.55,   // Très étroit (dentelle, broderie anglaise)
  110: 1.25,  // Étroit (certains cotons, liberty)
  115: 1.20,  // Standard US (45")
  120: 1.15,  // 
  140: 1.00,  // Standard EU (référence)
  150: 0.92,  // Large (150cm)
  160: 0.88,  // Très large
};

/**
 * Largeurs de tissu standard pour le calcul multi-largeurs
 */
export const STANDARD_FABRIC_WIDTHS = [110, 140, 150] as const;

// ============================================
// MODIFIER COEFFICIENTS
// ============================================

/**
 * Coefficients multiplicateurs pour les options
 */
export const MODIFIER_COEFFICIENTS = {
  directional: 1.10,      // +10% pour tissu sens unique (velours, motif directionnel)
  patternMatching: 1.20,  // +20% pour raccord motif (rayures, carreaux, gros motifs)
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Récupère le métrage de base pour un type de vêtement et une taille
 * Fallback sur taille M si taille non trouvée
 */
export function getBaseYardage(garmentType: GarmentType, size: string): number {
  const sizeData = BASE_YARDAGE_140CM[garmentType];
  if (!sizeData) {
    console.warn(`Unknown garment type: ${garmentType}, using 'other'`);
    return BASE_YARDAGE_140CM.other[size] ?? BASE_YARDAGE_140CM.other['M'];
  }
  return sizeData[size] ?? sizeData['M'] ?? 1.5;
}

/**
 * Récupère le coefficient pour une largeur donnée
 * Interpole si la largeur exacte n'existe pas
 */
export function getWidthCoefficient(widthCm: number): number {
  // Si largeur exacte existe
  if (WIDTH_COEFFICIENTS[widthCm] !== undefined) {
    return WIDTH_COEFFICIENTS[widthCm];
  }
  
  // Interpolation linéaire
  const widths = Object.keys(WIDTH_COEFFICIENTS).map(Number).sort((a, b) => a - b);
  
  // Bornes
  if (widthCm <= widths[0]) return WIDTH_COEFFICIENTS[widths[0]];
  if (widthCm >= widths[widths.length - 1]) return WIDTH_COEFFICIENTS[widths[widths.length - 1]];
  
  // Trouver les deux largeurs encadrantes
  const lowerIdx = widths.findIndex(w => w > widthCm) - 1;
  const lower = widths[lowerIdx];
  const upper = widths[lowerIdx + 1];
  
  // Interpolation
  const ratio = (widthCm - lower) / (upper - lower);
  return WIDTH_COEFFICIENTS[lower] + ratio * (WIDTH_COEFFICIENTS[upper] - WIDTH_COEFFICIENTS[lower]);
}
