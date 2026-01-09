/**
 * Sale Type Detector
 * 
 * Analyzes product variants to determine the dominant sale model:
 * - fixed_length: Fixed coupons (e.g., 3m for 45€)
 * - hybrid: Both fixed coupons AND cut-to-order (e.g., Nona Source)
 * - cut_to_order: Price per meter, any length
 * - by_piece: Sold as individual pieces
 */

import type { ShopifyProduct, ShopifyVariant } from './discoveryService';

// ============================================================================
// TYPES
// ============================================================================

export interface SaleTypeEvidence {
  hasMultipleVariants: boolean;
  hasLengthInOptions: boolean;
  hasCuttingOption: boolean;
  hasPricePerUnit: boolean;
  hasFixedLengthTags: boolean;
  sampleSize: number;
  variantStructure: 'single' | 'color_only' | 'color_length' | 'color_length_lot' | 'unknown';
  optionAnalysis: {
    option1Values: string[];
    option2Values: string[];
    option3Values: string[];
  };
}

export type SaleType = 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece' | 'unknown';

export interface SaleTypeDetection {
  dominantType: SaleType;
  confidence: number; // 0-100
  evidence: SaleTypeEvidence;
  description: string;
  recommendations: string[];
}

// ============================================================================
// DETECTION PATTERNS
// ============================================================================

// Patterns for length in variant options (e.g., "2m", "3.5", "10")
const LENGTH_PATTERNS = [
  /^(\d+(?:[.,]\d+)?)\s*m$/i,        // "2m", "3.5m"
  /^(\d+(?:[.,]\d+)?)\s*(?:mètres?|meters?)$/i,  // "2 metres"
  /^(\d+(?:[.,]\d+)?)$/,              // Just numbers like "2", "3.5" (Nona Source style)
];

// Patterns indicating cut-to-order in title/tags
const CUT_TO_ORDER_PATTERNS = [
  /per\s*met(?:er|re)/i,
  /au\s*mètre/i,
  /à\s*la\s*coupe/i,
  /sold\s*by\s*(?:the\s*)?met(?:er|re)/i,
  /prix\s*au\s*mètre/i,
  /\/m\b/,
];

// Tags indicating fixed length coupons
const FIXED_LENGTH_TAGS = [
  'coupon', 'coupons', 'remnant', 'remnants',
  'fin de rouleau', 'end of roll', 'chute', 'chutes',
  '3m', '2m', '5m', '1m', '10m',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isLengthValue(value: string | null | undefined): boolean {
  if (!value) return false;
  return LENGTH_PATTERNS.some(pattern => pattern.test(value.trim()));
}

function isCuttingOption(value: string | null | undefined): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase().trim();
  return normalized === 'cutting' || normalized === 'coupe' || normalized === 'à la coupe';
}

function hasCutToOrderIndicator(product: ShopifyProduct): boolean {
  const searchText = `${product.title} ${product.tags}`.toLowerCase();
  return CUT_TO_ORDER_PATTERNS.some(pattern => pattern.test(searchText));
}

function hasFixedLengthTag(product: ShopifyProduct): boolean {
  const tags = typeof product.tags === 'string' 
    ? product.tags.toLowerCase() 
    : product.tags.join(' ').toLowerCase();
  return FIXED_LENGTH_TAGS.some(tag => tags.includes(tag.toLowerCase()));
}

function analyzeVariantStructure(variants: ShopifyVariant[]): {
  structure: SaleTypeEvidence['variantStructure'];
  option1Values: string[];
  option2Values: string[];
  option3Values: string[];
} {
  const option1Values = new Set<string>();
  const option2Values = new Set<string>();
  const option3Values = new Set<string>();
  
  for (const variant of variants) {
    if ((variant as any).option1) option1Values.add((variant as any).option1);
    if ((variant as any).option2) option2Values.add((variant as any).option2);
    if ((variant as any).option3) option3Values.add((variant as any).option3);
  }
  
  const opt1Arr = Array.from(option1Values);
  const opt2Arr = Array.from(option2Values);
  const opt3Arr = Array.from(option3Values);
  
  // Determine structure
  let structure: SaleTypeEvidence['variantStructure'] = 'unknown';
  
  if (variants.length === 1) {
    structure = 'single';
  } else if (opt2Arr.length === 0 && opt3Arr.length === 0) {
    structure = 'color_only';
  } else if (opt2Arr.some(v => isLengthValue(v))) {
    if (opt3Arr.length > 0) {
      structure = 'color_length_lot';
    } else {
      structure = 'color_length';
    }
  }
  
  return {
    structure,
    option1Values: opt1Arr,
    option2Values: opt2Arr,
    option3Values: opt3Arr,
  };
}

// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================

export function detectSaleType(products: ShopifyProduct[]): SaleTypeDetection {
  if (products.length === 0) {
    return {
      dominantType: 'unknown',
      confidence: 0,
      evidence: {
        hasMultipleVariants: false,
        hasLengthInOptions: false,
        hasCuttingOption: false,
        hasPricePerUnit: false,
        hasFixedLengthTags: false,
        sampleSize: 0,
        variantStructure: 'unknown',
        optionAnalysis: { option1Values: [], option2Values: [], option3Values: [] },
      },
      description: 'No products to analyze',
      recommendations: ['Add products to analyze sale type'],
    };
  }
  
  // Collect evidence across all products
  let productsWithMultipleVariants = 0;
  let productsWithLengthInOptions = 0;
  let productsWithCuttingOption = 0;
  let productsWithPricePerUnit = 0;
  let productsWithFixedLengthTags = 0;
  
  const allOption1Values = new Set<string>();
  const allOption2Values = new Set<string>();
  const allOption3Values = new Set<string>();
  
  let dominantStructure: SaleTypeEvidence['variantStructure'] = 'unknown';
  const structureCounts: Record<string, number> = {};
  
  for (const product of products) {
    const variants = product.variants || [];
    
    // Multiple variants?
    if (variants.length > 1) {
      productsWithMultipleVariants++;
    }
    
    // Analyze variant structure
    const { structure, option1Values, option2Values, option3Values } = analyzeVariantStructure(variants);
    structureCounts[structure] = (structureCounts[structure] || 0) + 1;
    
    option1Values.forEach(v => allOption1Values.add(v));
    option2Values.forEach(v => allOption2Values.add(v));
    option3Values.forEach(v => allOption3Values.add(v));
    
    // Length in options?
    const hasLength = option2Values.some(v => isLengthValue(v));
    if (hasLength) {
      productsWithLengthInOptions++;
    }
    
    // Cutting option? (Nona Source specific)
    const hasCutting = option3Values.some(v => isCuttingOption(v));
    if (hasCutting) {
      productsWithCuttingOption++;
    }
    
    // Price per unit indicator?
    if (hasCutToOrderIndicator(product)) {
      productsWithPricePerUnit++;
    }
    
    // Fixed length tags?
    if (hasFixedLengthTag(product)) {
      productsWithFixedLengthTags++;
    }
  }
  
  // Find dominant structure
  let maxCount = 0;
  for (const [struct, count] of Object.entries(structureCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantStructure = struct as SaleTypeEvidence['variantStructure'];
    }
  }
  
  const sampleSize = products.length;
  const evidence: SaleTypeEvidence = {
    hasMultipleVariants: productsWithMultipleVariants > sampleSize * 0.5,
    hasLengthInOptions: productsWithLengthInOptions > sampleSize * 0.3,
    hasCuttingOption: productsWithCuttingOption > 0,
    hasPricePerUnit: productsWithPricePerUnit > sampleSize * 0.3,
    hasFixedLengthTags: productsWithFixedLengthTags > sampleSize * 0.2,
    sampleSize,
    variantStructure: dominantStructure,
    optionAnalysis: {
      option1Values: Array.from(allOption1Values).slice(0, 10),
      option2Values: Array.from(allOption2Values).slice(0, 10),
      option3Values: Array.from(allOption3Values).slice(0, 10),
    },
  };
  
  // Decision logic
  let dominantType: SaleType;
  let confidence: number;
  let description: string;
  const recommendations: string[] = [];
  
  // HYBRID: Has both fixed coupons AND cutting option
  if (evidence.hasCuttingOption && evidence.hasLengthInOptions) {
    dominantType = 'hybrid';
    confidence = 95;
    description = 'Site sells both fixed-length coupons AND cut-to-order. Prices differ between options.';
    recommendations.push('Store both coupon price and cutting price for comparison');
    recommendations.push('Display both purchase options to users');
  }
  // CUT_TO_ORDER: Price per unit indicators, no fixed lengths
  else if (evidence.hasPricePerUnit && !evidence.hasLengthInOptions) {
    dominantType = 'cut_to_order';
    confidence = 85;
    description = 'Site sells fabric by the meter. Customers choose their desired length.';
    recommendations.push('price_value represents price per meter');
    recommendations.push('quantity_value may represent available stock');
  }
  // FIXED_LENGTH: Length in options but no cutting
  else if (evidence.hasLengthInOptions && !evidence.hasCuttingOption) {
    dominantType = 'fixed_length';
    confidence = 80;
    description = 'Site sells fixed-length coupons/remnants. Each product has a specific length.';
    recommendations.push('Extract length from variant options');
    recommendations.push('Calculate price_per_meter from price/length');
  }
  // BY_PIECE: Single variants, no length info
  else if (!evidence.hasMultipleVariants && !evidence.hasLengthInOptions) {
    dominantType = 'by_piece';
    confidence = 70;
    description = 'Site sells items by piece, not by length.';
    recommendations.push('quantity_value represents number of pieces');
    recommendations.push('price_per_meter not applicable');
  }
  // UNKNOWN
  else {
    dominantType = 'unknown';
    confidence = 30;
    description = 'Could not determine sale type with confidence. Manual review recommended.';
    recommendations.push('Review product structure manually');
    recommendations.push('Check a few product pages to understand sale model');
  }
  
  return {
    dominantType,
    confidence,
    evidence,
    description,
    recommendations,
  };
}
