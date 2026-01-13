/**
 * Database Colors Reference
 * 
 * These are the 16 normalized colors used in the textile database.
 * LAB values are pre-calculated for efficient color matching.
 * 
 * The colors match the values stored in dictionary_mappings table
 * under category 'color'.
 */

import type { LAB } from './colorConversion';

// ============================================================================
// Types
// ============================================================================

/**
 * Color names as stored in the database
 */
export type ColorName = 
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'brown'
  | 'beige'
  | 'grey'
  | 'black'
  | 'white'
  | 'burgundy'
  | 'navy'
  | 'teal'
  | 'gold';

/**
 * Database color with hex and pre-calculated LAB values
 */
export interface DatabaseColor {
  name: ColorName;
  hex: string;
  lab: LAB;
  /** French translation for display */
  labelFr: string;
}

// ============================================================================
// Color Definitions
// ============================================================================

/**
 * Reference colors with pre-calculated LAB values
 * 
 * LAB values calculated using the colorConversion utilities.
 * These are canonical reference points for color matching.
 */
export const DATABASE_COLORS: Record<ColorName, DatabaseColor> = {
  red: {
    name: 'red',
    hex: '#FF0000',
    lab: { L: 53.23, a: 80.11, b: 67.22 },
    labelFr: 'Rouge',
  },
  blue: {
    name: 'blue',
    hex: '#0000FF',
    lab: { L: 32.30, a: 79.20, b: -107.86 },
    labelFr: 'Bleu',
  },
  green: {
    name: 'green',
    hex: '#008000',
    lab: { L: 46.23, a: -51.70, b: 49.90 },
    labelFr: 'Vert',
  },
  yellow: {
    name: 'yellow',
    hex: '#FFFF00',
    lab: { L: 97.14, a: -21.56, b: 94.48 },
    labelFr: 'Jaune',
  },
  orange: {
    name: 'orange',
    hex: '#FFA500',
    lab: { L: 74.94, a: 23.93, b: 78.95 },
    labelFr: 'Orange',
  },
  pink: {
    name: 'pink',
    hex: '#FFC0CB',
    lab: { L: 83.59, a: 24.14, b: 3.33 },
    labelFr: 'Rose',
  },
  purple: {
    name: 'purple',
    hex: '#800080',
    lab: { L: 29.78, a: 58.94, b: -36.50 },
    labelFr: 'Violet',
  },
  brown: {
    name: 'brown',
    hex: '#8B4513',
    lab: { L: 37.65, a: 27.03, b: 40.95 },
    labelFr: 'Marron',
  },
  beige: {
    name: 'beige',
    hex: '#F5F5DC',
    lab: { L: 95.95, a: -1.85, b: 11.42 },
    labelFr: 'Beige',
  },
  grey: {
    name: 'grey',
    hex: '#808080',
    lab: { L: 53.59, a: 0, b: 0 },
    labelFr: 'Gris',
  },
  black: {
    name: 'black',
    hex: '#000000',
    lab: { L: 0, a: 0, b: 0 },
    labelFr: 'Noir',
  },
  white: {
    name: 'white',
    hex: '#FFFFFF',
    lab: { L: 100, a: 0, b: 0 },
    labelFr: 'Blanc',
  },
  burgundy: {
    name: 'burgundy',
    hex: '#800020',
    lab: { L: 25.85, a: 42.79, b: 21.56 },
    labelFr: 'Bordeaux',
  },
  navy: {
    name: 'navy',
    hex: '#000080',
    lab: { L: 12.97, a: 47.51, b: -64.70 },
    labelFr: 'Marine',
  },
  teal: {
    name: 'teal',
    hex: '#008080',
    lab: { L: 48.25, a: -28.84, b: -8.48 },
    labelFr: 'Sarcelle',
  },
  gold: {
    name: 'gold',
    hex: '#FFD700',
    lab: { L: 86.93, a: -1.92, b: 87.14 },
    labelFr: 'Or',
  },
};

/**
 * Array version for iteration
 */
export const DATABASE_COLORS_LIST: DatabaseColor[] = Object.values(DATABASE_COLORS);

/**
 * Get color by name (case-insensitive)
 */
export function getColorByName(name: string): DatabaseColor | undefined {
  const normalized = name.toLowerCase() as ColorName;
  return DATABASE_COLORS[normalized];
}

/**
 * Get all color names
 */
export function getAllColorNames(): ColorName[] {
  return Object.keys(DATABASE_COLORS) as ColorName[];
}

/**
 * Get French label for a color name
 */
export function getColorLabelFr(name: ColorName): string {
  return DATABASE_COLORS[name]?.labelFr || name;
}
