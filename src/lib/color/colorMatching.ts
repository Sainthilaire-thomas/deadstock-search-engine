/**
 * Color Matching Algorithm
 * 
 * Uses CIE LAB color space for perceptually accurate color matching.
 * Maps arbitrary HEX colors to the 16 database colors.
 */

import { hexToLab, type LAB } from './colorConversion';
import { DATABASE_COLORS_LIST, type ColorName, type DatabaseColor } from './databaseColors';

// ============================================================================
// Types
// ============================================================================

/**
 * Result of color matching
 */
export interface ColorMatch {
  /** Database color name (e.g., 'burgundy') */
  color: ColorName;
  /** Reference hex of the database color */
  referenceHex: string;
  /** French label */
  labelFr: string;
  /** Euclidean distance in LAB space (0 = exact match) */
  distance: number;
  /** Confidence percentage (100% = exact match, 0% = no match) */
  confidence: number;
}

/**
 * Options for color matching
 */
export interface ColorMatchingOptions {
  /** Maximum LAB distance to consider (default: 50) */
  maxDistance?: number;
  /** Maximum number of results (default: 3) */
  maxResults?: number;
  /** Minimum confidence to include (default: 0) */
  minConfidence?: number;
}

// ============================================================================
// Distance Calculation
// ============================================================================

/**
 * Calculate Euclidean distance between two LAB colors
 * 
 * This is the simplest form of color difference calculation.
 * For more accuracy, CIE94 or CIEDE2000 could be used,
 * but Euclidean is sufficient for our use case.
 */
export function labDistance(lab1: LAB, lab2: LAB): number {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Calculate distance between two HEX colors
 */
export function hexDistance(hex1: string, hex2: string): number {
  const lab1 = hexToLab(hex1);
  const lab2 = hexToLab(hex2);
  return labDistance(lab1, lab2);
}

// ============================================================================
// Confidence Calculation
// ============================================================================

/**
 * Convert LAB distance to confidence percentage
 * 
 * Uses a linear scale where:
 * - Distance 0 = 100% confidence
 * - Distance >= 50 = 0% confidence
 * 
 * @param distance - LAB distance
 * @param maxDistance - Distance at which confidence becomes 0
 */
export function distanceToConfidence(distance: number, maxDistance: number = 50): number {
  if (distance <= 0) return 100;
  if (distance >= maxDistance) return 0;
  
  // Linear interpolation
  return Math.round(100 * (1 - distance / maxDistance));
}

// ============================================================================
// Color Matching Functions
// ============================================================================

/**
 * Find database colors that match an input HEX color
 * 
 * @param inputHex - The color to match (e.g., '#8B0000')
 * @param options - Matching options
 * @returns Array of matches sorted by distance (closest first)
 * 
 * @example
 * findMatchingColors('#8B0000')
 * // → [
 * //   { color: 'burgundy', distance: 8.2, confidence: 84, ... },
 * //   { color: 'red', distance: 32.1, confidence: 36, ... },
 * //   { color: 'brown', distance: 41.5, confidence: 17, ... }
 * // ]
 */
export function findMatchingColors(
  inputHex: string,
  options: ColorMatchingOptions = {}
): ColorMatch[] {
  const {
    maxDistance = 50,
    maxResults = 3,
    minConfidence = 0,
  } = options;
  
  // Convert input to LAB
  const inputLab = hexToLab(inputHex);
  
  // Calculate distance to all database colors
  const matches: ColorMatch[] = DATABASE_COLORS_LIST
    .map((dbColor: DatabaseColor) => {
      const distance = labDistance(inputLab, dbColor.lab);
      const confidence = distanceToConfidence(distance, maxDistance);
      
      return {
        color: dbColor.name,
        referenceHex: dbColor.hex,
        labelFr: dbColor.labelFr,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimals
        confidence,
      };
    })
    // Filter by max distance and min confidence
    .filter(match => match.distance <= maxDistance && match.confidence >= minConfidence)
    // Sort by distance (closest first)
    .sort((a, b) => a.distance - b.distance)
    // Limit results
    .slice(0, maxResults);
  
  return matches;
}

/**
 * Find the single best matching color
 * 
 * @param inputHex - The color to match
 * @returns The best match, or null if no match within threshold
 */
export function findBestMatch(inputHex: string): ColorMatch | null {
  const matches = findMatchingColors(inputHex, { maxResults: 1 });
  return matches.length > 0 ? matches[0] : null;
}

/**
 * Check if a HEX color is close to a specific database color
 * 
 * @param inputHex - The color to check
 * @param colorName - The database color name
 * @param threshold - Maximum distance to consider as matching (default: 30)
 */
export function isColorSimilar(
  inputHex: string,
  colorName: ColorName,
  threshold: number = 30
): boolean {
  const dbColor = DATABASE_COLORS_LIST.find(c => c.name === colorName);
  if (!dbColor) return false;
  
  const inputLab = hexToLab(inputHex);
  const distance = labDistance(inputLab, dbColor.lab);
  
  return distance <= threshold;
}

/**
 * Get database colors that would match a given color
 * Returns just the color names (useful for database queries)
 * 
 * @param inputHex - The color to match
 * @param minConfidence - Minimum confidence to include (default: 20)
 */
export function getMatchingColorNames(
  inputHex: string,
  minConfidence: number = 20
): ColorName[] {
  const matches = findMatchingColors(inputHex, {
    maxResults: 5,
    minConfidence,
  });
  
  return matches.map(m => m.color);
}

// ============================================================================
// Confidence Thresholds (for UI)
// ============================================================================

export type ConfidenceLevel = 'excellent' | 'good' | 'acceptable' | 'poor';

/**
 * Get confidence level from percentage
 */
export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 80) return 'excellent';
  if (confidence >= 50) return 'good';
  if (confidence >= 20) return 'acceptable';
  return 'poor';
}

/**
 * Get Tailwind color class for confidence level
 */
export function getConfidenceColorClass(confidence: number): string {
  const level = getConfidenceLevel(confidence);
  switch (level) {
    case 'excellent':
      return 'bg-green-500';
    case 'good':
      return 'bg-emerald-400';
    case 'acceptable':
      return 'bg-amber-400';
    case 'poor':
      return 'bg-red-400';
  }
}

/**
 * Get text color class for confidence level
 */
export function getConfidenceTextClass(confidence: number): string {
  const level = getConfidenceLevel(confidence);
  switch (level) {
    case 'excellent':
      return 'text-green-600';
    case 'good':
      return 'text-emerald-600';
    case 'acceptable':
      return 'text-amber-600';
    case 'poor':
      return 'text-red-600';
  }
}
