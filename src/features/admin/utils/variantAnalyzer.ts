/**
 * Variant Analyzer Utility
 * 
 * Analyzes Shopify product variants to determine:
 * - Availability (any variant available)
 * - Sale type (fixed_length, hybrid, cut_to_order)
 * - Price per meter calculation
 * - Quantity extraction
 * 
 * @see ADR-025 for architecture decisions
 */

import type { ShopifyProduct, ShopifyVariant } from '../services/scrapingService';

// ============================================================================
// TYPES
// ============================================================================

export type SaleType = 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece';

export interface VariantAnalysis {
  // Availability
  available: boolean;
  availableVariantCount: number;
  totalVariantCount: number;
  
  // Sale type
  saleType: SaleType;
  hasCuttingOption: boolean;
  
  // Pricing
  minPrice: number | null;
  maxPrice: number | null;
  cuttingPrice: number | null;  // Price per meter for cutting option
  pricePerMeter: number | null; // Calculated or from cutting
  
  // Quantity (length)
  maxLength: number | null;     // Max available length in meters
  totalLength: number | null;   // Sum of all available lengths
  
  // Best variant for display
  bestVariant: ShopifyVariant | null;
  
  // Debugging
  variantStructure: {
    option1Role: 'color' | 'size' | 'length' | 'unknown';
    option2Role: 'color' | 'size' | 'length' | 'lot' | 'unknown';
    option3Role: 'cutting' | 'lot' | 'unknown' | null;
  };
}

// ============================================================================
// DETECTION HELPERS
// ============================================================================

/**
 * Check if a variant is a "Cutting" option (sold by meter)
 */
function isCuttingVariant(variant: ShopifyVariant): boolean {
  const option3 = variant.option3?.toLowerCase().trim();
  return option3 === 'cutting' || option3 === 'coupe' || option3 === 'au mètre';
}

/**
 * Check if option3 looks like a lot reference (e.g., "T24A11321.00130")
 */
function isLotReference(option3: string | null): boolean {
  if (!option3) return false;
  // Lot references typically have format like "T24A11321.00130" or similar codes
  return /^[A-Z0-9]+[\.\-][A-Z0-9]+$/i.test(option3.trim());
}

/**
 * Try to parse length from option value
 * Handles: "10", "10m", "3.5", "3,5"
 */
function parseLength(optionValue: string | null | undefined): number | null {
  if (!optionValue) return null;
  
  // Clean the value
  const cleaned = optionValue
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(',', '.')
    .replace(/m(eter|ètres?|eters?)?$/i, '')
    .trim();
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Detect the role of each option field based on values
 */
function detectOptionRoles(variants: ShopifyVariant[]): VariantAnalysis['variantStructure'] {
  const option1Values = new Set(variants.map(v => v.option1).filter(Boolean));
  const option2Values = new Set(variants.map(v => v.option2).filter(Boolean));
  const option3Values = new Set(variants.map(v => v.option3).filter(Boolean));
  
  // Detect option3 role
  let option3Role: 'cutting' | 'lot' | 'unknown' | null = null;
  if (option3Values.size > 0) {
    const hasC = Array.from(option3Values).some(v => 
      v?.toLowerCase() === 'cutting' || v?.toLowerCase() === 'coupe'
    );
    const hasLots = Array.from(option3Values).some(v => isLotReference(v ?? null));
    
    if (hasC) {
      option3Role = 'cutting';
    } else if (hasLots) {
      option3Role = 'lot';
    } else {
      option3Role = 'unknown';
    }
  }
  
  // Detect option2 role (often length for textile sites)
  let option2Role: 'color' | 'size' | 'length' | 'lot' | 'unknown' = 'unknown';
  const option2Numeric = Array.from(option2Values).filter(v => parseLength(v) !== null);
  if (option2Numeric.length > option2Values.size * 0.5) {
    // More than 50% are numeric - likely length
    option2Role = 'length';
  }
  
  // Detect option1 role (usually color)
  let option1Role: 'color' | 'size' | 'length' | 'unknown' = 'unknown';
  const colorKeywords = ['black', 'white', 'red', 'blue', 'green', 'noir', 'blanc', 'rouge', 'bleu', 'vert', 'rose', 'pink', 'grey', 'gray', 'gris'];
  const hasColors = Array.from(option1Values).some(v => 
    colorKeywords.some(c => v?.toLowerCase().includes(c))
  );
  if (hasColors || option1Values.size <= 20) {
    option1Role = 'color';
  }
  
  return { option1Role, option2Role, option3Role };
}

// ============================================================================
// MAIN ANALYZER
// ============================================================================

/**
 * Analyze all variants of a Shopify product
 * 
 * Returns comprehensive analysis for:
 * - Determining product availability
 * - Calculating price per meter
 * - Extracting quantity (length)
 * - Identifying sale type
 */
export function analyzeVariants(product: ShopifyProduct): VariantAnalysis {
  const variants = product.variants || [];
  
  if (variants.length === 0) {
    return {
      available: false,
      availableVariantCount: 0,
      totalVariantCount: 0,
      saleType: 'by_piece',
      hasCuttingOption: false,
      minPrice: null,
      maxPrice: null,
      cuttingPrice: null,
      pricePerMeter: null,
      maxLength: null,
      totalLength: null,
      bestVariant: null,
      variantStructure: {
        option1Role: 'unknown',
        option2Role: 'unknown',
        option3Role: null,
      },
    };
  }
  
  // Detect variant structure
  const variantStructure = detectOptionRoles(variants);
  
  // Separate cutting variants from regular variants
  const cuttingVariants = variants.filter(isCuttingVariant);
  const regularVariants = variants.filter(v => !isCuttingVariant(v));
  
  // Check for cutting option
  const hasCuttingOption = cuttingVariants.length > 0;
  
  // Available variants (excluding cutting which is always "available" if enabled)
  const availableRegular = regularVariants.filter(v => v.available);
  const availableCutting = cuttingVariants.filter(v => v.available);
  
  // Determine availability: product is available if ANY variant is available
  const available = availableRegular.length > 0 || availableCutting.length > 0;
  
  // Calculate prices
  const regularPrices = availableRegular
    .map(v => parseFloat(v.price))
    .filter(p => !isNaN(p) && p > 0);
  
  const minPrice = regularPrices.length > 0 ? Math.min(...regularPrices) : null;
  const maxPrice = regularPrices.length > 0 ? Math.max(...regularPrices) : null;
  
  // Cutting price (already price per meter)
  const cuttingPrice = availableCutting.length > 0 
    ? parseFloat(availableCutting[0].price) 
    : null;
  
  // Extract lengths from option2 (if role is length)
  let maxLength: number | null = null;
  let totalLength: number | null = null;
  
  if (variantStructure.option2Role === 'length') {
    const lengths = availableRegular
      .map(v => parseLength(v.option2))
      .filter((l): l is number => l !== null && l > 0);
    
    if (lengths.length > 0) {
      maxLength = Math.max(...lengths);
      totalLength = lengths.reduce((sum, l) => sum + l, 0);
    }
  }
  
  // Calculate price per meter
  let pricePerMeter: number | null = null;
  
  if (hasCuttingOption && cuttingPrice !== null && cuttingPrice > 0) {
    // Hybrid: use cutting price (already per meter)
    pricePerMeter = cuttingPrice;
  } else if (maxLength !== null && maxLength > 0 && minPrice !== null) {
    // Fixed length: calculate from price / length
    // Use the variant with max length for calculation
    const maxLengthVariant = availableRegular.find(v => parseLength(v.option2) === maxLength);
    if (maxLengthVariant) {
      const variantPrice = parseFloat(maxLengthVariant.price);
      if (!isNaN(variantPrice) && variantPrice > 0) {
        pricePerMeter = Math.round((variantPrice / maxLength) * 100) / 100;
      }
    }
  }
  
  // Determine sale type
  let saleType: SaleType = 'by_piece';
  
  if (hasCuttingOption && availableRegular.length > 0) {
    saleType = 'hybrid';
  } else if (hasCuttingOption && availableRegular.length === 0) {
    saleType = 'cut_to_order';
  } else if (variantStructure.option2Role === 'length' && maxLength !== null) {
    saleType = 'fixed_length';
  }
  
  // Find best variant for display (prefer available, then highest length)
  let bestVariant: ShopifyVariant | null = null;
  
  if (availableRegular.length > 0) {
    if (variantStructure.option2Role === 'length') {
      // Sort by length descending
      bestVariant = [...availableRegular].sort((a, b) => {
        const lenA = parseLength(a.option2) || 0;
        const lenB = parseLength(b.option2) || 0;
        return lenB - lenA;
      })[0];
    } else {
      bestVariant = availableRegular[0];
    }
  } else if (availableCutting.length > 0) {
    bestVariant = availableCutting[0];
  } else {
    bestVariant = variants[0];
  }
  
  return {
    available,
    availableVariantCount: availableRegular.length + availableCutting.length,
    totalVariantCount: variants.length,
    saleType,
    hasCuttingOption,
    minPrice,
    maxPrice,
    cuttingPrice,
    pricePerMeter,
    maxLength,
    totalLength,
    bestVariant,
    variantStructure,
  };
}

/**
 * Quick check if product has any available variant
 * Lightweight alternative to full analysis
 */
export function hasAvailableVariant(product: ShopifyProduct): boolean {
  return product.variants?.some(v => v.available) ?? false;
}

/**
 * Detect sale type from variants
 */
export function detectSaleType(product: ShopifyProduct): SaleType {
  const analysis = analyzeVariants(product);
  return analysis.saleType;
}
