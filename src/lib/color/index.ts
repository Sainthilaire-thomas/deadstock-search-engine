/**
 * Color Module
 * 
 * Utilities for color conversion and matching against the database palette.
 * 
 * @example
 * import { findMatchingColors, hexToLab } from '@/lib/color';
 * 
 * const matches = findMatchingColors('#8B0000');
 * // → [{ color: 'burgundy', confidence: 84 }, ...]
 */

// Conversion utilities
export {
  hexToRgb,
  rgbToHex,
  rgbToXyz,
  xyzToLab,
  hexToLab,
  labToXyz,
  xyzToRgb,
  labToHex,
  isValidHex,
  normalizeHex,
  type RGB,
  type XYZ,
  type LAB,
} from './colorConversion';

// Database colors reference
export {
  DATABASE_COLORS,
  DATABASE_COLORS_LIST,
  getColorByName,
  getAllColorNames,
  getColorLabelFr,
  type ColorName,
  type DatabaseColor,
} from './databaseColors';

// Color matching algorithm
export {
  labDistance,
  hexDistance,
  distanceToConfidence,
  findMatchingColors,
  findMatchingColorsFromAvailable,
  findBestMatch,
  isColorSimilar,
  getMatchingColorNames,
  getConfidenceLevel,
  getConfidenceColorClass,
  getConfidenceTextClass,
  type ColorMatch,
  type ColorMatchingOptions,
  type ConfidenceLevel,
} from './colorMatching';
