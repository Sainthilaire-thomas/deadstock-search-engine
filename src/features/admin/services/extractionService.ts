// src/features/admin/services/extractionService.ts
/**
 * Extraction Service
 * 
 * Purpose: Apply extraction patterns to extract dimensions from products
 * Uses patterns detected during discovery and stored in site_profiles
 */

import type { ExtractionPattern, ExtractionPatterns } from '../domain/types';
import type { ShopifyProduct } from './scrapingService';

// ============================================================================
// TYPES
// ============================================================================

export interface ExtractedDimensions {
  length?: {
    value: number;
    unit: string;
    source: string;
    pattern: string;
  };
  width?: {
    value: number;
    unit: string;
    source: string;
    pattern: string;
  };
  weight?: {
    value: number;
    unit: string;
    source: string;
    pattern: string;
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Clean HTML tags from text
 */
function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse tags to array
 */
function parseTags(tags: string | string[]): string[] {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Parse numeric value handling both comma and dot decimals
 */
function parseNumericValue(str: string): number | null {
  // Replace comma with dot for decimal parsing
  const normalized = str.replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

/**
 * Get source text from product based on pattern source
 */
function getSourceText(product: ShopifyProduct, source: string): string[] {
  switch (source) {
    case 'tags':
      return parseTags(product.tags);
    case 'title':
      return [product.title || ''];
    case 'body_html':
      return [cleanHtml(product.body_html || '')];
    case 'variant':
      // Special case: return variant grams as string if available
      const grams = product.variants?.[0]?.grams;
      if (grams && grams > 0) {
        return [`${grams}g (variant)`];
      }
      return [];
    default:
      return [];
  }
}

/**
 * Apply a single pattern to extract a value
 */
function applyPattern(
  product: ShopifyProduct, 
  pattern: ExtractionPattern
): { value: number; raw: string } | null {
  // Special case for variant.grams
  if (pattern.source === 'variant' && pattern.pattern === 'variant.grams') {
    const grams = product.variants?.[0]?.grams;
    if (grams && grams > 0) {
      return { value: grams, raw: `${grams}g (variant)` };
    }
    return null;
  }

  // Get source texts
  const sourceTexts = getSourceText(product, pattern.source);
  
  try {
    const regex = new RegExp(pattern.pattern, 'i');
    
    for (const text of sourceTexts) {
      const match = text.match(regex);
      if (match && match[pattern.captureGroup]) {
        const value = parseNumericValue(match[pattern.captureGroup]);
        if (value !== null && value > 0) {
          // Handle unit conversion for width (some sources use meters, need cm)
          let finalValue = value;
          if (pattern.field === 'width' && pattern.unit === 'cm') {
            // If extracted value is small (like 1.40), it's probably in meters
            if (value < 10) {
              finalValue = value * 100; // Convert to cm
            }
          }
          return { value: finalValue, raw: match[0] };
        }
      }
    }
  } catch (e) {
    console.error(`Invalid regex pattern: ${pattern.pattern}`, e);
  }
  
  return null;
}

// ============================================================================
// MAIN EXTRACTION FUNCTION
// ============================================================================

/**
 * Extract dimensions from a product using enabled patterns
 * 
 * @param product - Shopify product to extract from
 * @param patterns - Extraction patterns (from site profile)
 * @returns Extracted dimensions for length, width, weight
 */
export function extractDimensions(
  product: ShopifyProduct,
  patterns: ExtractionPatterns | null
): ExtractedDimensions {
  const result: ExtractedDimensions = {};
  
  if (!patterns || !patterns.patterns || patterns.patterns.length === 0) {
    return result;
  }

  // Filter only enabled patterns
  const enabledPatterns = patterns.patterns.filter(p => p.enabled);
  
  // Group patterns by field
  const patternsByField: Record<string, ExtractionPattern[]> = {};
  for (const pattern of enabledPatterns) {
    if (!patternsByField[pattern.field]) {
      patternsByField[pattern.field] = [];
    }
    patternsByField[pattern.field].push(pattern);
  }

  // Extract length
  if (patternsByField['length']) {
    for (const pattern of patternsByField['length']) {
      const extracted = applyPattern(product, pattern);
      if (extracted) {
        result.length = {
          value: extracted.value,
          unit: pattern.unit,
          source: pattern.source,
          pattern: pattern.pattern,
        };
        break; // Use first successful match
      }
    }
  }

  // Extract width
  if (patternsByField['width']) {
    for (const pattern of patternsByField['width']) {
      const extracted = applyPattern(product, pattern);
      if (extracted) {
        result.width = {
          value: extracted.value,
          unit: pattern.unit,
          source: pattern.source,
          pattern: pattern.pattern,
        };
        break;
      }
    }
  }

  // Extract weight
  if (patternsByField['weight']) {
    for (const pattern of patternsByField['weight']) {
      const extracted = applyPattern(product, pattern);
      if (extracted) {
        result.weight = {
          value: extracted.value,
          unit: pattern.unit,
          source: pattern.source,
          pattern: pattern.pattern,
        };
        break;
      }
    }
  }

  return result;
}

/**
 * Get extraction patterns for a site from its profile
 */
export async function getExtractionPatternsForSite(
  siteId: string,
  supabase: any
): Promise<ExtractionPatterns | null> {
  const { data: profile, error } = await supabase
    .from('site_profiles')
    .select('extraction_patterns')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !profile) {
    console.log(`   ⚠️ No extraction patterns found for site ${siteId}`);
    return null;
  }

  return profile.extraction_patterns as ExtractionPatterns | null;
}
