/**
 * Discovery Service - V2 ENRICHED
 *
 * Purpose: Deep analysis of site structure and data quality
 * Strategy: Provide comprehensive insights for admin decision-making
 *
 * KEY FEATURES:
 * 1. Returns ALL collections with analysis
 * 2. Analyzes product_types, tags, weights, prices
 * 3. Calculates availability rates (real vs API count)
 * 4. Computes Deadstock Score for site potential
 * 5. Adapter pattern ready for multi-platform
 */

import { addMonths } from 'date-fns';
import { detectExtractionPatterns } from './extractionPatternDetector';
import type { ExtractionPatterns } from '../domain/types';
import { detectSaleType, type SaleTypeDetection } from './saleTypeDetector';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DiscoveryConfig {
  sampleSize: number;           // Products per collection for sampling (default: 10)
  maxSampleCollections: number; // Max collections to sample for quality (default: 5)
  timeout: number;              // Timeout in ms (default: 60000)
  delayBetweenRequests: number; // Delay in ms (default: 3000)
}

export interface ShopifyCollection {
  id: number;
  handle: string;
  title: string;
  published_at: string;
  updated_at: string;
  body_html?: string;
  products_count?: number;
  image?: {
    src: string;
    alt?: string;
  };
}

export interface ShopifyVariant {
  id: number;
  title: string;
  price: string;
  compare_at_price?: string | null;
  available: boolean;
  inventory_quantity?: number;
  sku?: string;
  weight?: number;
  weight_unit?: string;
  grams?: number;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string | string[];
  variants: ShopifyVariant[];
  images: Array<{
    id: number;
    src: string;
    alt?: string;
  }>;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
}

/**
 * Statistics from sampled products
 */
export interface SampledStats {
  total: number;
  available: number;
  availablePercent: number;
  withImages: number;
  withPrice: number;
  withWeight: number;
}

/**
 * Price statistics
 */
export interface PriceStats {
  min: number;
  max: number;
  avg: number;
  median: number;
  currency: string;
}

/**
 * Weight/grammage statistics
 */
export interface WeightStats {
  hasWeight: number;
  hasWeightPercent: number;
  minGrams: number;
  maxGrams: number;
  avgGrams: number;
}

/**
 * Tag frequency
 */
export interface TagFrequency {
  tag: string;
  count: number;
  percent: number;
}

/**
 * Product type frequency
 */
export interface ProductTypeFrequency {
  type: string;
  count: number;
  percent: number;
}

/**
 * Data analysis results for a collection
 */
export interface CollectionDataAnalysis {
  productTypes: ProductTypeFrequency[];
  topTags: TagFrequency[];
  vendors: { vendor: string; count: number }[];
  priceStats: PriceStats | null;
  weightStats: WeightStats | null;
}

/**
 * Collection data stored in profile - ENRICHED
 */
export interface CollectionData {
  handle: string;
  title: string;
  productsCount: number;          // From API (may include unavailable)
  
  // Suggestions (admin can override)
  suggestedRelevant: boolean;
  suggestedPriority: 'high' | 'medium' | 'low';
  relevanceReason?: string;
  
  // Sampling info
  wasSampled: boolean;
  sampledStats?: SampledStats;
  dataAnalysis?: CollectionDataAnalysis;
}

/**
 * Price distribution buckets
 */
export interface PriceDistribution {
  under10: number;
  from10to30: number;
  from30to50: number;
  from50to100: number;
  over100: number;
}

/**
 * Deadstock potential score
 */
export interface DeadstockScore {
  score: number;  // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    hasDeadstockKeywords: boolean;
    hasFabricTypes: boolean;
    priceRangeOk: boolean;
    availabilityGood: boolean;
    dataQualityGood: boolean;
    hasWeightData: boolean;
  };
  recommendations: string[];
}

/**
 * Global site analysis
 */
export interface GlobalAnalysis {
  allProductTypes: ProductTypeFrequency[];
  allTags: TagFrequency[];
  allVendors: { vendor: string; count: number; percent: number }[];
  priceDistribution: PriceDistribution;
  priceStats: PriceStats | null;
  weightStats: WeightStats | null;
  availabilityRate: number;
  deadstockScore: DeadstockScore;
}

export interface QualityMetrics {
  hasImages: number;
  hasPrice: number;
  hasTags: number;
  hasDescription: number;
  hasWeight: number;
  hasProductType: number;
  overallScore: number;
}

export interface DataStructure {
  fieldsAvailable: string[];
  tagsFormat: 'string' | 'array';
  averageTagsCount: number;
  hasVendor: boolean;
  hasProductType: boolean;
  hasWeight: boolean;
  hasSKU: boolean;
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  type: 'collection' | 'config' | 'quality' | 'warning' | 'insight';
  message: string;
}

export interface SiteProfile {
  siteUrl: string;
  platform: 'shopify' | 'woocommerce' | 'custom' | 'unknown';
  isShopify: boolean;
  discoveredAt: Date;
  validUntil: Date;

  // Collections - ALL with analysis
  collections: CollectionData[];
  sampleProducts: ShopifyProduct[];

  // Data structure analysis
  dataStructure: DataStructure;
  qualityMetrics: QualityMetrics;
  recommendations: Recommendation[];

  // NOUVEAU - Global analysis
  globalAnalysis: GlobalAnalysis;

  // NOUVEAU - Extraction patterns détectés
  extractionPatterns: ExtractionPatterns;

  // NOUVEAU - Sale type detection (ADR-026)
  saleTypeDetection: SaleTypeDetection;

  // Metadata
  totalCollections: number;
  relevantCollections: number;
  estimatedProducts: number;
  estimatedAvailable: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: DiscoveryConfig = {
  sampleSize: 10,
  maxSampleCollections: 5,
  timeout: 60000,
  delayBetweenRequests: 3000,
};

// Keywords for textile detection
const TEXTILE_KEYWORDS = [
  'tissu', 'tissus', 'textile', 'textiles', 'chute', 'chutes',
  'coton', 'soie', 'laine', 'lin', 'denim', 'jersey', 'velours',
  'metre', 'coupon', 'rouleau', 'popeline', 'gabardine', 'satin',
  'viscose', 'polyester', 'crepe', 'crêpe', 'dentelle', 'broderie',
  'jacquard', 'sergé', 'tweed', 'flanelle', 'mousseline', 'organza',
  'taffetas', 'doublure', 'batiste', 'chambray', 'oxford', 'liberty',
  'imprimé', 'uni', 'rayé', 'carreaux', 'vichy', 'pied-de-poule',
  'fleuri', 'floral', 'géométrique', 'abstrait',
  'fabric', 'fabrics', 'deadstock', 'remnant',
  'cotton', 'silk', 'wool', 'linen', 'velvet',
  'yard', 'meter', 'roll', 'poplin',
  'viscose', 'polyester', 'crepe', 'lace', 'embroidery',
  'jacquard', 'twill', 'tweed', 'flannel', 'chiffon',
  'taffeta', 'lining', 'batiste', 'chambray',
  'print', 'printed', 'solid', 'stripe', 'check', 'plaid',
  'floral', 'geometric', 'abstract',
];

const EXCLUDE_KEYWORDS = [
  'mercerie', 'bouton', 'boutons', 'fermeture', 'fermetures',
  'fil', 'fils', 'aiguille', 'aiguilles', 'épingle', 'épingles',
  'patron', 'patrons', 'livre', 'livres', 'magazine',
  'ciseaux', 'machine', 'accessoire', 'accessoires',
  'carte', 'cadeau', 'gift', 'kit', 'cours', 'atelier',
  'bobine',
];

const HIGH_PRIORITY_KEYWORDS = [
  'deadstock', 'dead stock', 'fin de série', 'fin de stock',
  'chute', 'chutes', 'coupon', 'coupons', 'remnant', 'remnants',
  'destockage', 'déstockage', 'surplus', 'lot', 'lots',
  '3 metres', '3 mètres', '3m',
];

const DEADSTOCK_KEYWORDS = [
  'deadstock', 'dead stock', 'fin de série', 'surplus',
  'chute', 'coupon', 'remnant', 'destockage', 'déstockage',
  'end of roll', 'fin de rouleau', 'lot', 'stock limité',
];

const FABRIC_TYPES = [
  'soie', 'silk', 'coton', 'cotton', 'laine', 'wool',
  'lin', 'linen', 'viscose', 'polyester', 'velours', 'velvet',
  'denim', 'jersey', 'satin', 'crepe', 'crêpe', 'dentelle', 'lace',
  'tweed', 'gabardine', 'popeline', 'poplin', 'organza', 'mousseline',
  'chiffon', 'taffetas', 'taffeta', 'jacquard', 'broderie', 'embroidery',
];

// ============================================================================
// PLATFORM DETECTION
// ============================================================================

type Platform = 'shopify' | 'woocommerce' | 'custom' | 'unknown';

async function detectPlatform(url: string): Promise<Platform> {
  const normalizedUrl = normalizeUrl(url);

  try {
    const response = await fetch(`${normalizedUrl}/products.json?limit=1`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.products && Array.isArray(data.products)) {
        return 'shopify';
      }
    }
  } catch (error) {
    // Not Shopify
  }

  return 'unknown';
}

// ============================================================================
// SHOPIFY DISCOVERY ADAPTER
// ============================================================================

class ShopifyDiscoveryAdapter {
  private delayBetweenRequests: number;

  constructor(config: DiscoveryConfig) {
    this.delayBetweenRequests = config.delayBetweenRequests;
  }

  async getAllCollections(url: string): Promise<ShopifyCollection[]> {
    const normalizedUrl = normalizeUrl(url);

    try {
      const response = await fetch(`${normalizedUrl}/collections.json`, {
        method: 'GET',
        headers: {
          'User-Agent': 'DeadstockSearchEngine/1.0 Discovery',
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.collections || [];
    } catch (error: any) {
      console.error(`[ShopifyAdapter] Error fetching collections:`, error.message);
      throw error;
    }
  }

  async sampleCollection(
    url: string,
    collectionHandle: string,
    limit: number = 10
  ): Promise<ShopifyProduct[]> {
    const normalizedUrl = normalizeUrl(url);

    try {
      const response = await fetch(
        `${normalizedUrl}/collections/${collectionHandle}/products.json?limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'DeadstockSearchEngine/1.0 Discovery',
          },
          signal: AbortSignal.timeout(30000),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.products || [];
    } catch (error: any) {
      console.error(`[ShopifyAdapter] Error sampling ${collectionHandle}:`, error.message);
      return [];
    }
  }

  async delay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.delayBetweenRequests));
  }
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Parse tags from product (handles string or array format)
 */
function parseTags(tags: string | string[]): string[] {
  if (Array.isArray(tags)) {
    return tags.map(t => t.trim()).filter(t => t.length > 0);
  }
  if (typeof tags === 'string' && tags.trim()) {
    return tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }
  return [];
}

/**
 * Get weight in grams from variant
 */
function getWeightInGrams(variant: ShopifyVariant): number | null {
  if (variant.grams && variant.grams > 0) {
    return variant.grams;
  }
  if (variant.weight && variant.weight > 0) {
    const unit = (variant.weight_unit || 'g').toLowerCase();
    switch (unit) {
      case 'kg': return variant.weight * 1000;
      case 'lb': return variant.weight * 453.592;
      case 'oz': return variant.weight * 28.3495;
      default: return variant.weight;
    }
  }
  return null;
}

/**
 * Analyze a collection for relevance
 */
function analyzeCollectionRelevance(collection: ShopifyCollection): {
  suggestedRelevant: boolean;
  suggestedPriority: 'high' | 'medium' | 'low';
  relevanceReason: string;
} {
  const title = collection.title.toLowerCase();
  const handle = collection.handle.toLowerCase();
  const description = (collection.body_html || '').toLowerCase();
  const searchText = `${title} ${handle} ${description}`;

  const hasExcludeKeyword = EXCLUDE_KEYWORDS.some(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(searchText);
  });

  const matchedTextileKeywords = TEXTILE_KEYWORDS.filter(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(searchText);
  });

  // Remove duplicates
  const uniqueMatches = [...new Set(matchedTextileKeywords)];
  const hasTextileKeyword = uniqueMatches.length > 0;

  const hasHighPriorityKeyword = HIGH_PRIORITY_KEYWORDS.some(kw => 
    searchText.includes(kw.toLowerCase())
  );

  let suggestedRelevant = false;
  let relevanceReason = '';

  if (hasExcludeKeyword && !hasTextileKeyword) {
    suggestedRelevant = false;
    relevanceReason = 'Contains mercerie/accessory keywords';
  } else if (hasTextileKeyword) {
    suggestedRelevant = true;
    relevanceReason = `Matches: ${uniqueMatches.slice(0, 3).join(', ')}`;
  } else {
    suggestedRelevant = false;
    relevanceReason = 'No textile keywords detected';
  }

  let suggestedPriority: 'high' | 'medium' | 'low' = 'medium';

  if (hasHighPriorityKeyword) {
    suggestedPriority = 'high';
  } else if ((collection.products_count || 0) < 10) {
    suggestedPriority = 'low';
  } else if ((collection.products_count || 0) > 100) {
    suggestedPriority = 'high';
  }

  return { suggestedRelevant, suggestedPriority, relevanceReason };
}

/**
 * Analyze sampled products for a collection
 */
function analyzeProducts(products: ShopifyProduct[]): {
  stats: SampledStats;
  analysis: CollectionDataAnalysis;
} {
  if (products.length === 0) {
    return {
      stats: {
        total: 0,
        available: 0,
        availablePercent: 0,
        withImages: 0,
        withPrice: 0,
        withWeight: 0,
      },
      analysis: {
        productTypes: [],
        topTags: [],
        vendors: [],
        priceStats: null,
        weightStats: null,
      },
    };
  }

  // Count stats
  let available = 0;
  let withImages = 0;
  let withPrice = 0;
  let withWeight = 0;

  const prices: number[] = [];
  const weights: number[] = [];
  const productTypeCounts: Map<string, number> = new Map();
  const tagCounts: Map<string, number> = new Map();
  const vendorCounts: Map<string, number> = new Map();

  for (const product of products) {
    // Check availability (any variant available)
    const isAvailable = product.variants?.some(v => v.available) ?? false;
    if (isAvailable) available++;

    // Check images
    if (product.images && product.images.length > 0) withImages++;

    // Get first variant for price/weight
    const variant = product.variants?.[0];
    if (variant) {
      const price = parseFloat(variant.price);
      if (price > 0) {
        withPrice++;
        prices.push(price);
      }

      const weightGrams = getWeightInGrams(variant);
      if (weightGrams !== null && weightGrams > 0) {
        withWeight++;
        weights.push(weightGrams);
      }
    }

    // Count product types
    if (product.product_type && product.product_type.trim()) {
      const type = product.product_type.trim();
      productTypeCounts.set(type, (productTypeCounts.get(type) || 0) + 1);
    }

    // Count tags
    const tags = parseTags(product.tags);
    for (const tag of tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }

    // Count vendors
    if (product.vendor && product.vendor.trim()) {
      const vendor = product.vendor.trim();
      vendorCounts.set(vendor, (vendorCounts.get(vendor) || 0) + 1);
    }
  }

  const total = products.length;

  // Build stats
  const stats: SampledStats = {
    total,
    available,
    availablePercent: Math.round((available / total) * 100),
    withImages,
    withPrice,
    withWeight,
  };

  // Build product types array
  const productTypes: ProductTypeFrequency[] = Array.from(productTypeCounts.entries())
    .map(([type, count]) => ({
      type,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Build top tags array (top 20)
  const topTags: TagFrequency[] = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({
      tag,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Build vendors array
  const vendors = Array.from(vendorCounts.entries())
    .map(([vendor, count]) => ({ vendor, count }))
    .sort((a, b) => b.count - a.count);

  // Calculate price stats
  let priceStats: PriceStats | null = null;
  if (prices.length > 0) {
    prices.sort((a, b) => a - b);
    priceStats = {
      min: prices[0],
      max: prices[prices.length - 1],
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length * 100) / 100,
      median: prices[Math.floor(prices.length / 2)],
      currency: 'EUR', // Default, could be detected
    };
  }

  // Calculate weight stats
  let weightStats: WeightStats | null = null;
  if (weights.length > 0) {
    weights.sort((a, b) => a - b);
    weightStats = {
      hasWeight: withWeight,
      hasWeightPercent: Math.round((withWeight / total) * 100),
      minGrams: Math.round(weights[0]),
      maxGrams: Math.round(weights[weights.length - 1]),
      avgGrams: Math.round(weights.reduce((a, b) => a + b, 0) / weights.length),
    };
  }

  const analysis: CollectionDataAnalysis = {
    productTypes,
    topTags,
    vendors,
    priceStats,
    weightStats,
  };

  return { stats, analysis };
}

/**
 * Aggregate global analysis from all sampled products
 */
function buildGlobalAnalysis(
  allProducts: ShopifyProduct[],
  collections: CollectionData[]
): GlobalAnalysis {
  const { stats, analysis } = analyzeProducts(allProducts);

  // Price distribution
  const priceDistribution: PriceDistribution = {
    under10: 0,
    from10to30: 0,
    from30to50: 0,
    from50to100: 0,
    over100: 0,
  };

  for (const product of allProducts) {
    const price = parseFloat(product.variants?.[0]?.price || '0');
    if (price > 0) {
      if (price < 10) priceDistribution.under10++;
      else if (price < 30) priceDistribution.from10to30++;
      else if (price < 50) priceDistribution.from30to50++;
      else if (price < 100) priceDistribution.from50to100++;
      else priceDistribution.over100++;
    }
  }

  // Add percentages to vendors
  const allVendors = analysis.vendors.map(v => ({
    ...v,
    percent: Math.round((v.count / allProducts.length) * 100),
  }));

  // Calculate Deadstock Score
  const deadstockScore = calculateDeadstockScore(
    allProducts,
    collections,
    analysis,
    stats
  );

  return {
    allProductTypes: analysis.productTypes,
    allTags: analysis.topTags,
    allVendors,
    priceDistribution,
    priceStats: analysis.priceStats,
    weightStats: analysis.weightStats,
    availabilityRate: stats.availablePercent,
    deadstockScore,
  };
}

/**
 * Calculate Deadstock Score (0-100)
 */
function calculateDeadstockScore(
  products: ShopifyProduct[],
  collections: CollectionData[],
  analysis: CollectionDataAnalysis,
  stats: SampledStats
): DeadstockScore {
  const factors = {
    hasDeadstockKeywords: false,
    hasFabricTypes: false,
    priceRangeOk: false,
    availabilityGood: false,
    dataQualityGood: false,
    hasWeightData: false,
  };

  const recommendations: string[] = [];
  let score = 0;

  // Check for deadstock keywords in collections
  const allText = collections.map(c => `${c.title} ${c.handle}`).join(' ').toLowerCase();
  factors.hasDeadstockKeywords = DEADSTOCK_KEYWORDS.some(kw => allText.includes(kw));
  if (factors.hasDeadstockKeywords) {
    score += 20;
  } else {
    recommendations.push('No deadstock-specific keywords found in collections');
  }

  // Check for fabric types
  const allTags = analysis.topTags.map(t => t.tag.toLowerCase());
  const allTypes = analysis.productTypes.map(t => t.type.toLowerCase());
  const allTerms = [...allTags, ...allTypes, allText];
  factors.hasFabricTypes = FABRIC_TYPES.some(fabric => 
    allTerms.some(term => term.includes(fabric))
  );
  if (factors.hasFabricTypes) {
    score += 25;
  } else {
    recommendations.push('No common fabric types detected (silk, cotton, wool, etc.)');
  }

  // Check price range (5€ - 150€ is typical for fabric remnants)
  if (analysis.priceStats) {
    factors.priceRangeOk = analysis.priceStats.min >= 1 && 
                          analysis.priceStats.max <= 200 &&
                          analysis.priceStats.avg >= 10 &&
                          analysis.priceStats.avg <= 80;
    if (factors.priceRangeOk) {
      score += 15;
    } else {
      recommendations.push(`Price range (${analysis.priceStats.min}€ - ${analysis.priceStats.max}€) may not be typical for fabric remnants`);
    }
  }

  // Check availability
  factors.availabilityGood = stats.availablePercent >= 50;
  if (factors.availabilityGood) {
    score += 15;
  } else {
    recommendations.push(`Low availability rate (${stats.availablePercent}%) - many products out of stock`);
  }

  // Check data quality
  const dataQuality = (stats.withImages / stats.total + stats.withPrice / stats.total) / 2;
  factors.dataQualityGood = dataQuality >= 0.8;
  if (factors.dataQualityGood) {
    score += 15;
  } else {
    recommendations.push('Data quality could be improved (missing images or prices)');
  }

  // Check weight data
  factors.hasWeightData = stats.withWeight >= stats.total * 0.5;
  if (factors.hasWeightData) {
    score += 10;
  } else {
    recommendations.push('Limited weight/grammage data available');
  }

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 85) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 55) grade = 'C';
  else if (score >= 40) grade = 'D';
  else grade = 'F';

  return { score, grade, factors, recommendations };
}

/**
 * Analyze quality metrics
 */
function analyzeQuality(products: ShopifyProduct[]): QualityMetrics {
  if (products.length === 0) {
    return {
      hasImages: 0,
      hasPrice: 0,
      hasTags: 0,
      hasDescription: 0,
      hasWeight: 0,
      hasProductType: 0,
      overallScore: 0,
    };
  }

  const total = products.length;
  
  const hasImages = products.filter(p => p.images && p.images.length > 0).length / total;
  const hasPrice = products.filter(p => {
    return p.variants && p.variants.length > 0 && parseFloat(p.variants[0].price) > 0;
  }).length / total;

  const hasTags = products.filter(p => {
    const tags = parseTags(p.tags);
    return tags.length > 0;
  }).length / total;

  const hasDescription = products.filter(p => {
    return p.body_html && p.body_html.length > 50;
  }).length / total;

  const hasWeight = products.filter(p => {
    const variant = p.variants?.[0];
    return variant && getWeightInGrams(variant) !== null;
  }).length / total;

  const hasProductType = products.filter(p => {
    return p.product_type && p.product_type.trim().length > 0;
  }).length / total;

  // Weighted average
  const overallScore = (
    hasImages * 0.25 +
    hasPrice * 0.25 +
    hasTags * 0.20 +
    hasDescription * 0.10 +
    hasWeight * 0.10 +
    hasProductType * 0.10
  );

  return {
    hasImages,
    hasPrice,
    hasTags,
    hasDescription,
    hasWeight,
    hasProductType,
    overallScore,
  };
}

/**
 * Analyze data structure
 */
function analyzeDataStructure(products: ShopifyProduct[]): DataStructure {
  if (products.length === 0) {
    return {
      fieldsAvailable: [],
      tagsFormat: 'string',
      averageTagsCount: 0,
      hasVendor: false,
      hasProductType: false,
      hasWeight: false,
      hasSKU: false,
    };
  }

  const firstProduct = products[0];
  const tagsFormat = Array.isArray(firstProduct.tags) ? 'array' : 'string';

  const totalTags = products.reduce((sum, p) => {
    return sum + parseTags(p.tags).length;
  }, 0);
  const averageTagsCount = Math.round(totalTags / products.length * 10) / 10;

  const hasVendor = products.some(p => p.vendor && p.vendor.trim().length > 0);
  const hasProductType = products.some(p => p.product_type && p.product_type.trim().length > 0);
  const hasWeight = products.some(p => {
    const variant = p.variants?.[0];
    return variant && getWeightInGrams(variant) !== null;
  });
  const hasSKU = products.some(p => {
    const variant = p.variants?.[0];
    return variant && variant.sku && variant.sku.trim().length > 0;
  });

  const fieldsAvailable = ['id', 'title', 'body_html', 'tags', 'variants', 'images'];
  if (hasVendor) fieldsAvailable.push('vendor');
  if (hasProductType) fieldsAvailable.push('product_type');
  if (hasWeight) fieldsAvailable.push('weight');
  if (hasSKU) fieldsAvailable.push('sku');

  return {
    fieldsAvailable,
    tagsFormat,
    averageTagsCount,
    hasVendor,
    hasProductType,
    hasWeight,
    hasSKU,
  };
}

/**
 * Generate recommendations
 */
function generateRecommendations(
  qualityMetrics: QualityMetrics,
  collections: CollectionData[],
  globalAnalysis: GlobalAnalysis
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Quality warnings
  if (qualityMetrics.overallScore < 0.5) {
    recommendations.push({
      priority: 'high',
      type: 'warning',
      message: `Low quality score (${Math.round(qualityMetrics.overallScore * 100)}%). Data may be incomplete.`,
    });
  }

  if (qualityMetrics.hasImages < 0.7) {
    recommendations.push({
      priority: 'medium',
      type: 'quality',
      message: `Only ${Math.round(qualityMetrics.hasImages * 100)}% products have images.`,
    });
  }

  if (qualityMetrics.hasWeight < 0.3) {
    recommendations.push({
      priority: 'low',
      type: 'insight',
      message: `Limited weight data (${Math.round(qualityMetrics.hasWeight * 100)}%). Grammage filtering may not be effective.`,
    });
  }

  // Collection recommendations
  const relevantCollections = collections.filter(c => c.suggestedRelevant);
  const highPriorityCollections = relevantCollections.filter(c => c.suggestedPriority === 'high');

  if (highPriorityCollections.length > 0) {
    recommendations.push({
      priority: 'high',
      type: 'collection',
      message: `${highPriorityCollections.length} high-priority deadstock collections: ${highPriorityCollections.slice(0, 3).map(c => c.title).join(', ')}`,
    });
  }

  if (relevantCollections.length === 0) {
    recommendations.push({
      priority: 'high',
      type: 'warning',
      message: 'No textile-related collections auto-detected. Review all collections manually.',
    });
  }

  // Deadstock score insights
  if (globalAnalysis.deadstockScore.score >= 80) {
    recommendations.push({
      priority: 'high',
      type: 'insight',
      message: `Excellent deadstock potential (Score: ${globalAnalysis.deadstockScore.score}/100, Grade: ${globalAnalysis.deadstockScore.grade})`,
    });
  } else if (globalAnalysis.deadstockScore.score < 50) {
    recommendations.push({
      priority: 'medium',
      type: 'warning',
      message: `Low deadstock score (${globalAnalysis.deadstockScore.score}/100). May not be a good source.`,
    });
  }

  // Availability insight
  if (globalAnalysis.availabilityRate < 50) {
    recommendations.push({
      priority: 'medium',
      type: 'insight',
      message: `Low availability rate (${globalAnalysis.availabilityRate}%). Many products may be out of stock.`,
    });
  }

  return recommendations;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function normalizeUrl(url: string): string {
  let normalized = url.trim();

  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }

  normalized = normalized.replace(/\/$/, '');

  return normalized;
}

// ============================================================================
// MAIN DISCOVERY SERVICE
// ============================================================================

class DiscoveryService {
  /**
   * MAIN FUNCTION: Discover and analyze a site
   */
  async discoverSite(
    url: string,
    config: Partial<DiscoveryConfig> = {}
  ): Promise<SiteProfile> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const normalizedUrl = normalizeUrl(url);

    console.log(`\n🔍 Discovering: ${normalizedUrl}`);
    console.log(`⚙️  Config: ${finalConfig.sampleSize} products/collection, ${finalConfig.maxSampleCollections} collections to sample\n`);

    // Step 1: Detect platform
    console.log('📡 Detecting platform...');
    const platform = await detectPlatform(normalizedUrl);
    console.log(`✅ Platform: ${platform}\n`);

    if (platform === 'unknown') {
      throw new Error('Platform not supported. Currently only Shopify is supported.');
    }

    const adapter = new ShopifyDiscoveryAdapter(finalConfig);

    // Step 2: Get ALL collections
    console.log('📦 Fetching ALL collections...');
    const allCollections = await adapter.getAllCollections(normalizedUrl);
    console.log(`   Found ${allCollections.length} total collections\n`);

    // Step 3: Analyze ALL collections
    console.log('🔬 Analyzing collections...');
    const collectionsData: CollectionData[] = allCollections.map(collection => {
      const analysis = analyzeCollectionRelevance(collection);
      
      return {
        handle: collection.handle,
        title: collection.title,
        productsCount: collection.products_count || 0,
        suggestedRelevant: analysis.suggestedRelevant,
        suggestedPriority: analysis.suggestedPriority,
        relevanceReason: analysis.relevanceReason,
        wasSampled: false,
      };
    });

    const relevantCount = collectionsData.filter(c => c.suggestedRelevant).length;
    console.log(`   ${relevantCount} suggested as relevant (textile-related)`);
    console.log(`   ${allCollections.length - relevantCount} suggested as non-relevant\n`);

    // Step 4: Sample collections for deep analysis
    console.log('🧪 Sampling products for deep analysis...');
    const allSampledProducts: ShopifyProduct[] = [];

    // Prioritize relevant collections
    const collectionsToSample = [...collectionsData]
      .filter(c => c.suggestedRelevant)
      .sort((a, b) => {
        if (a.suggestedPriority === 'high' && b.suggestedPriority !== 'high') return -1;
        if (b.suggestedPriority === 'high' && a.suggestedPriority !== 'high') return 1;
        return b.productsCount - a.productsCount;
      })
      .slice(0, finalConfig.maxSampleCollections);

    if (collectionsToSample.length === 0) {
      console.log('   No relevant collections, sampling from largest...');
      collectionsToSample.push(
        ...collectionsData
          .sort((a, b) => b.productsCount - a.productsCount)
          .slice(0, finalConfig.maxSampleCollections)
      );
    }

    for (const collectionData of collectionsToSample) {
      await adapter.delay();

      console.log(`   Sampling "${collectionData.title}"...`);
      const products = await adapter.sampleCollection(
        normalizedUrl,
        collectionData.handle,
        finalConfig.sampleSize
      );

      allSampledProducts.push(...products);

      // Analyze this collection's products
      const { stats, analysis } = analyzeProducts(products);

      // Update collection data
      const idx = collectionsData.findIndex(c => c.handle === collectionData.handle);
      if (idx !== -1) {
        collectionsData[idx].wasSampled = true;
        collectionsData[idx].sampledStats = stats;
        collectionsData[idx].dataAnalysis = analysis;
      }

      console.log(`   ✓ ${products.length} products (${stats.available} available, ${stats.availablePercent}%)`);
    }

    console.log(`\n✅ Total samples: ${allSampledProducts.length} products\n`);

    // Step 5: Build global analysis
    console.log('📊 Building global analysis...');
    const globalAnalysis = buildGlobalAnalysis(allSampledProducts, collectionsData);
    console.log(`   Deadstock Score: ${globalAnalysis.deadstockScore.score}/100 (Grade: ${globalAnalysis.deadstockScore.grade})`);
    console.log(`   Availability Rate: ${globalAnalysis.availabilityRate}%`);
    console.log(`   Product Types: ${globalAnalysis.allProductTypes.slice(0, 5).map(t => t.type).join(', ')}`);
    console.log(`   Top Tags: ${globalAnalysis.allTags.slice(0, 5).map(t => t.tag).join(', ')}\n`);

    // Step 6: Analyze quality
    console.log('📈 Analyzing quality...');
    const qualityMetrics = analyzeQuality(allSampledProducts);
    console.log(`   Overall score: ${Math.round(qualityMetrics.overallScore * 100)}%`);
    console.log(`   - Images: ${Math.round(qualityMetrics.hasImages * 100)}%`);
    console.log(`   - Price: ${Math.round(qualityMetrics.hasPrice * 100)}%`);
    console.log(`   - Tags: ${Math.round(qualityMetrics.hasTags * 100)}%`);
    console.log(`   - Weight: ${Math.round(qualityMetrics.hasWeight * 100)}%`);
    console.log(`   - Product Type: ${Math.round(qualityMetrics.hasProductType * 100)}%\n`);

    // Step 7: Detect extraction patterns (NOUVEAU)
    console.log('🔍 Detecting extraction patterns...');
    const extractionResult = detectExtractionPatterns(allSampledProducts);
    const extractionPatterns: ExtractionPatterns = {
      patterns: extractionResult.patterns,
      analyzedAt: extractionResult.analyzedAt,
      productsAnalyzed: extractionResult.productsAnalyzed,
    };
    
    if (extractionPatterns.patterns.length > 0) {
      console.log(`   Found ${extractionPatterns.patterns.length} patterns:`);
      for (const p of extractionPatterns.patterns) {
        const status = p.enabled ? '✅' : '⚪';
        console.log(`   ${status} ${p.field} (${p.source}): ${Math.round(p.coverage * 100)}% coverage`);
      }
    } else {
      console.log(`   ⚠️ No extraction patterns detected`);
    }
    console.log('');

       // Step 8: Detect sale type (ADR-026)
    console.log('🏷️  Detecting sale type...');
    const saleTypeDetection = detectSaleType(allSampledProducts);
    console.log(`   Type: ${saleTypeDetection.dominantType.toUpperCase()} (${saleTypeDetection.confidence}% confidence)`);
    console.log(`   ${saleTypeDetection.description}`);
    if (saleTypeDetection.recommendations.length > 0) {
      console.log(`   Recommendations:`);
      for (const rec of saleTypeDetection.recommendations) {
        console.log(`   - ${rec}`);
      }
    }
    console.log('');

    // Step 9: Analyze data structure (était Step 7)
    const dataStructure = analyzeDataStructure(allSampledProducts);

    // Step 10: Generate recommendations (était Step 8)
    const recommendations = generateRecommendations(qualityMetrics, collectionsData, globalAnalysis);

    // Step 11: Calculate totals (était Step 9)
    const totalProducts = collectionsData.reduce((sum, c) => sum + c.productsCount, 0);
    const estimatedAvailable = Math.round(totalProducts * (globalAnalysis.availabilityRate / 100));

  
   
    // Step 12: Create profile
    const profile: SiteProfile = {
      siteUrl: normalizedUrl,
      platform,
      isShopify: platform === 'shopify',
      discoveredAt: new Date(),
      validUntil: addMonths(new Date(), 6),

      collections: collectionsData,
      sampleProducts: allSampledProducts.slice(0, 10),
      dataStructure,
      qualityMetrics,
      recommendations,
      globalAnalysis,
      extractionPatterns,  // ← NOUVEAU
saleTypeDetection,  
      totalCollections: allCollections.length,
      relevantCollections: relevantCount,
      estimatedProducts: totalProducts,
      estimatedAvailable,
    };

    console.log('✅ Discovery complete!');
    console.log(`   📦 ${profile.totalCollections} collections (${profile.relevantCollections} relevant)`);
    console.log(`   📊 ~${profile.estimatedProducts.toLocaleString()} total products`);
    console.log(`   ✅ ~${profile.estimatedAvailable.toLocaleString()} estimated available`);
    console.log(`   🎯 Deadstock Score: ${globalAnalysis.deadstockScore.score}/100\n`);

    return profile;
  }

  /**
   * Test if a site is supported
   */
  async testSite(url: string): Promise<{ supported: boolean; platform: Platform }> {
    const platform = await detectPlatform(url);
    return {
      supported: platform !== 'unknown',
      platform,
    };
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const discoveryService = new DiscoveryService();
