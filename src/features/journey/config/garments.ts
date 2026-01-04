// src/features/journey/config/garments.ts
// Garment types configuration with yardage formulas
// Session 10 - 2026-01-03

import type {
  GarmentType,
  GarmentCategory,
  GarmentTypeConfig,
  GarmentCategoryConfig,
  GarmentVariations,
} from '../domain/types';

// ============================================
// GARMENT CATEGORIES
// ============================================

export const GARMENT_CATEGORIES: GarmentCategoryConfig[] = [
  {
    id: 'tops',
    labelKey: 'garments.categories.tops',
    items: ['shirt', 'blouse', 'tshirt', 'top', 'sweater', 'vest'],
  },
  {
    id: 'bottoms',
    labelKey: 'garments.categories.bottoms',
    items: ['pants', 'shorts', 'skirt'],
  },
  {
    id: 'dresses',
    labelKey: 'garments.categories.dresses',
    items: ['dress', 'jumpsuit', 'romper'],
  },
  {
    id: 'outerwear',
    labelKey: 'garments.categories.outerwear',
    items: ['blazer', 'jacket', 'coat', 'trench'],
  },
  {
    id: 'accessories',
    labelKey: 'garments.categories.accessories',
    items: ['scarf', 'bag', 'belt', 'bowtie'],
  },
];

// ============================================
// GARMENT TYPE CONFIGURATIONS
// Complete with yardage formulas and modifiers
// ============================================

export const GARMENT_TYPES: Record<GarmentType, GarmentTypeConfig> = {
  // ============================================
  // TOPS
  // ============================================
  shirt: {
    type: 'shirt',
    category: 'tops',
    labelKey: 'garments.types.shirt',
    icon: '👔',
    baseYardage: { XS: 1.5, S: 1.6, M: 1.7, L: 1.8, XL: 1.9, XXL: 2.0 },
    availableVariations: ['sleeves', 'neckline'],
    modifiers: {
      sleeves: { none: -0.3, short: -0.15, three_quarter: 0, long: 0.2 },
      neckline: { round: 0, v: 0, square: 0, boat: 0, collar: 0.1 },
    },
    estimatedRange: '1.5-2.2m',
  },

  blouse: {
    type: 'blouse',
    category: 'tops',
    labelKey: 'garments.types.blouse',
    icon: '👚',
    baseYardage: { XS: 1.4, S: 1.5, M: 1.6, L: 1.7, XL: 1.8, XXL: 1.9 },
    availableVariations: ['sleeves', 'neckline', 'length'],
    modifiers: {
      sleeves: { none: -0.25, short: -0.1, three_quarter: 0, long: 0.15 },
      neckline: { round: 0, v: 0, square: 0, boat: 0.05, collar: 0.1 },
      length: { mini: -0.2, standard: 0, midi: 0.3, maxi: 0.5 },
    },
    estimatedRange: '1.4-2.4m',
  },

  tshirt: {
    type: 'tshirt',
    category: 'tops',
    labelKey: 'garments.types.tshirt',
    icon: '👕',
    baseYardage: { XS: 1.2, S: 1.3, M: 1.4, L: 1.5, XL: 1.6, XXL: 1.7 },
    availableVariations: ['sleeves', 'neckline'],
    modifiers: {
      sleeves: { none: -0.2, short: 0, three_quarter: 0.1, long: 0.2 },
      neckline: { round: 0, v: 0, square: 0, boat: 0, collar: 0 },
    },
    estimatedRange: '1.2-1.9m',
  },

  top: {
    type: 'top',
    category: 'tops',
    labelKey: 'garments.types.top',
    icon: '🎽',
    baseYardage: { XS: 0.8, S: 0.9, M: 1.0, L: 1.1, XL: 1.2, XXL: 1.3 },
    availableVariations: ['sleeves', 'neckline'],
    modifiers: {
      sleeves: { none: 0, short: 0.1, three_quarter: 0.2, long: 0.3 },
      neckline: { round: 0, v: 0, square: 0, boat: 0, collar: 0 },
    },
    estimatedRange: '0.8-1.6m',
  },

  sweater: {
    type: 'sweater',
    category: 'tops',
    labelKey: 'garments.types.sweater',
    icon: '🧥',
    baseYardage: { XS: 1.8, S: 1.9, M: 2.0, L: 2.2, XL: 2.4, XXL: 2.6 },
    availableVariations: ['sleeves', 'neckline'],
    modifiers: {
      sleeves: { none: -0.4, short: -0.2, three_quarter: 0, long: 0 },
      neckline: { round: 0, v: 0, square: 0, boat: 0, collar: 0.2 },
    },
    estimatedRange: '1.8-2.8m',
  },

  vest: {
    type: 'vest',
    category: 'tops',
    labelKey: 'garments.types.vest',
    icon: '🦺',
    baseYardage: { XS: 1.0, S: 1.1, M: 1.2, L: 1.3, XL: 1.4, XXL: 1.5 },
    availableVariations: ['neckline', 'lining'],
    modifiers: {
      neckline: { round: 0, v: 0, square: 0, boat: 0, collar: 0.1 },
      lining: { true: 0.8, false: 0 },
    },
    estimatedRange: '1.0-2.3m',
  },

  // ============================================
  // BOTTOMS
  // ============================================
  pants: {
    type: 'pants',
    category: 'bottoms',
    labelKey: 'garments.types.pants',
    icon: '👖',
    baseYardage: { XS: 1.8, S: 2.0, M: 2.2, L: 2.4, XL: 2.6, XXL: 2.8 },
    availableVariations: ['length', 'lining'],
    modifiers: {
      length: { mini: -0.6, standard: 0, midi: 0, maxi: 0.3 },
      lining: { true: 1.0, false: 0 },
    },
    estimatedRange: '1.8-3.8m',
  },

  shorts: {
    type: 'shorts',
    category: 'bottoms',
    labelKey: 'garments.types.shorts',
    icon: '🩳',
    baseYardage: { XS: 1.0, S: 1.1, M: 1.2, L: 1.3, XL: 1.4, XXL: 1.5 },
    availableVariations: ['lining'],
    modifiers: {
      lining: { true: 0.6, false: 0 },
    },
    estimatedRange: '1.0-2.1m',
  },

  skirt: {
    type: 'skirt',
    category: 'bottoms',
    labelKey: 'garments.types.skirt',
    icon: '👗',
    baseYardage: { XS: 1.2, S: 1.3, M: 1.4, L: 1.5, XL: 1.6, XXL: 1.7 },
    availableVariations: ['length', 'lining'],
    modifiers: {
      length: { mini: -0.4, standard: 0, midi: 0.4, maxi: 0.8 },
      lining: { true: 0.8, false: 0 },
    },
    estimatedRange: '1.2-3.3m',
  },

  // ============================================
  // DRESSES & JUMPSUITS
  // ============================================
  dress: {
    type: 'dress',
    category: 'dresses',
    labelKey: 'garments.types.dress',
    icon: '👗',
    baseYardage: { XS: 2.5, S: 2.8, M: 3.0, L: 3.2, XL: 3.5, XXL: 3.8 },
    availableVariations: ['length', 'sleeves', 'neckline', 'lining', 'patternMatching'],
    modifiers: {
      length: { mini: -0.5, standard: 0, midi: 0, maxi: 0.8 },
      sleeves: { none: -0.2, short: 0, three_quarter: 0.2, long: 0.3 },
      neckline: { round: 0, v: 0, square: 0, boat: 0, collar: 0.1 },
      lining: { true: 1.2, false: 0 },
      patternMatching: { true: 0.5, false: 0 },
    },
    estimatedRange: '2.5-5.5m',
  },

  jumpsuit: {
    type: 'jumpsuit',
    category: 'dresses',
    labelKey: 'garments.types.jumpsuit',
    icon: '🥻',
    baseYardage: { XS: 2.8, S: 3.0, M: 3.2, L: 3.5, XL: 3.8, XXL: 4.0 },
    availableVariations: ['length', 'sleeves', 'neckline', 'lining'],
    modifiers: {
      length: { mini: -0.5, standard: 0, midi: 0, maxi: 0.5 },
      sleeves: { none: -0.2, short: 0, three_quarter: 0.2, long: 0.3 },
      neckline: { round: 0, v: 0, square: 0, boat: 0, collar: 0.1 },
      lining: { true: 1.5, false: 0 },
    },
    estimatedRange: '2.8-5.5m',
  },

  romper: {
    type: 'romper',
    category: 'dresses',
    labelKey: 'garments.types.romper',
    icon: '🩱',
    baseYardage: { XS: 1.8, S: 2.0, M: 2.2, L: 2.4, XL: 2.6, XXL: 2.8 },
    availableVariations: ['sleeves', 'neckline', 'lining'],
    modifiers: {
      sleeves: { none: -0.2, short: 0, three_quarter: 0.15, long: 0.25 },
      neckline: { round: 0, v: 0, square: 0, boat: 0, collar: 0.1 },
      lining: { true: 1.0, false: 0 },
    },
    estimatedRange: '1.8-3.8m',
  },

  // ============================================
  // OUTERWEAR
  // ============================================
  blazer: {
    type: 'blazer',
    category: 'outerwear',
    labelKey: 'garments.types.blazer',
    icon: '🧥',
    baseYardage: { XS: 2.2, S: 2.4, M: 2.6, L: 2.8, XL: 3.0, XXL: 3.2 },
    availableVariations: ['sleeves', 'lining'],
    modifiers: {
      sleeves: { none: -0.4, short: -0.2, three_quarter: 0, long: 0 },
      lining: { true: 1.5, false: 0 },
    },
    estimatedRange: '2.2-4.7m',
  },

  jacket: {
    type: 'jacket',
    category: 'outerwear',
    labelKey: 'garments.types.jacket',
    icon: '🧥',
    baseYardage: { XS: 2.0, S: 2.2, M: 2.4, L: 2.6, XL: 2.8, XXL: 3.0 },
    availableVariations: ['sleeves', 'length', 'lining'],
    modifiers: {
      sleeves: { none: -0.4, short: -0.2, three_quarter: 0, long: 0 },
      length: { mini: -0.3, standard: 0, midi: 0.4, maxi: 0.8 },
      lining: { true: 1.2, false: 0 },
    },
    estimatedRange: '2.0-5.0m',
  },

  coat: {
    type: 'coat',
    category: 'outerwear',
    labelKey: 'garments.types.coat',
    icon: '🧥',
    baseYardage: { XS: 2.8, S: 3.0, M: 3.2, L: 3.5, XL: 3.8, XXL: 4.0 },
    availableVariations: ['length', 'lining'],
    modifiers: {
      length: { mini: -0.5, standard: 0, midi: 0.5, maxi: 1.0 },
      lining: { true: 2.0, false: 0 },
    },
    estimatedRange: '2.8-7.0m',
  },

  trench: {
    type: 'trench',
    category: 'outerwear',
    labelKey: 'garments.types.trench',
    icon: '🧥',
    baseYardage: { XS: 3.0, S: 3.2, M: 3.5, L: 3.8, XL: 4.0, XXL: 4.2 },
    availableVariations: ['length', 'lining'],
    modifiers: {
      length: { mini: -0.5, standard: 0, midi: 0.5, maxi: 1.0 },
      lining: { true: 2.2, false: 0 },
    },
    estimatedRange: '3.0-7.4m',
  },

  // ============================================
  // ACCESSORIES
  // ============================================
  scarf: {
    type: 'scarf',
    category: 'accessories',
    labelKey: 'garments.types.scarf',
    icon: '🧣',
    baseYardage: { XS: 0.5, S: 0.6, M: 0.8, L: 1.0, XL: 1.2, XXL: 1.5 },
    availableVariations: [],
    modifiers: {},
    estimatedRange: '0.5-1.5m',
  },

  bag: {
    type: 'bag',
    category: 'accessories',
    labelKey: 'garments.types.bag',
    icon: '👜',
    baseYardage: { XS: 0.3, S: 0.4, M: 0.5, L: 0.6, XL: 0.7, XXL: 0.8 },
    availableVariations: ['lining'],
    modifiers: {
      lining: { true: 0.4, false: 0 },
    },
    estimatedRange: '0.3-1.2m',
  },

  belt: {
    type: 'belt',
    category: 'accessories',
    labelKey: 'garments.types.belt',
    icon: '🎀',
    baseYardage: { XS: 0.15, S: 0.18, M: 0.2, L: 0.22, XL: 0.25, XXL: 0.3 },
    availableVariations: [],
    modifiers: {},
    estimatedRange: '0.15-0.3m',
  },

  bowtie: {
    type: 'bowtie',
    category: 'accessories',
    labelKey: 'garments.types.bowtie',
    icon: '🎀',
    baseYardage: { XS: 0.1, S: 0.12, M: 0.15, L: 0.15, XL: 0.18, XXL: 0.2 },
    availableVariations: [],
    modifiers: {},
    estimatedRange: '0.1-0.2m',
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all garment types for a category
 */
export function getGarmentsByCategory(category: GarmentCategory): GarmentTypeConfig[] {
  return GARMENT_CATEGORIES
    .find(c => c.id === category)
    ?.items.map(type => GARMENT_TYPES[type])
    .filter(Boolean) || [];
}

/**
 * Get garment config by type
 */
export function getGarmentConfig(type: GarmentType): GarmentTypeConfig | undefined {
  return GARMENT_TYPES[type];
}

/**
 * Check if a variation is available for a garment type
 */
export function isVariationAvailable(
  type: GarmentType,
  variation: keyof GarmentVariations
): boolean {
  const config = GARMENT_TYPES[type];
  return config?.availableVariations.includes(variation) ?? false;
}

/**
 * Get modifier value for a variation
 */
export function getVariationModifier(
  type: GarmentType,
  variation: keyof GarmentVariations,
  value: string | boolean
): number {
  const config = GARMENT_TYPES[type];
  if (!config?.modifiers[variation]) return 0;
  
  const stringValue = typeof value === 'boolean' ? String(value) : value;
  return config.modifiers[variation]?.[stringValue] ?? 0;
}

/**
 * Get all available sizes
 */
export const SIZES: Array<{ value: string; label: string }> = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
];

/**
 * Default fabric widths (in cm)
 */
export const FABRIC_WIDTHS = [
  { value: 90, label: '90 cm' },
  { value: 110, label: '110 cm' },
  { value: 140, label: '140 cm (standard)' },
  { value: 150, label: '150 cm' },
  { value: 160, label: '160 cm' },
];

/**
 * Margin percentages
 */
export const MARGIN_PERCENTAGES = [
  { value: 5, label: '5%' },
  { value: 10, label: '10% (recommandé)' },
  { value: 15, label: '15%' },
  { value: 20, label: '20%' },
];
