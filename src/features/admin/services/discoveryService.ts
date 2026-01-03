/**
 * Discovery Service - REFACTORED
 *
 * Purpose: Analyze site structure WITHOUT scraping all products
 * Strategy: Cache structure for 6 months, use for intelligent scraping
 *
 * KEY CHANGES from previous version:
 * 1. Returns ALL collections (not just sampled ones)
 * 2. Suggests relevance but admin decides
 * 3. Adapter pattern ready for multi-platform (Shopify, WooCommerce, Custom)
 *
 * Philosophy:
 * - Discovery = Rare & Slow (structure changes rarely)
 * - Scraping = Frequent & Fast (products change daily)
 */

import { addMonths } from 'date-fns';

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

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string | string[];
  variants: Array<{
    id: number;
    price: string;
    available: boolean;
  }>;
  images: Array<{
    id: number;
    src: string;
  }>;
}

/**
 * Collection data stored in profile
 * ALL collections are stored, with suggestion flags
 */
export interface CollectionData {
  handle: string;
  title: string;
  productsCount: number;
  // Suggestions (admin can override)
  suggestedRelevant: boolean;  // Auto-detected as textile-related
  suggestedPriority: 'high' | 'medium' | 'low';
  relevanceReason?: string;    // Why we think it's relevant/not
  // Sampling info (only for sampled collections)
  wasSampled: boolean;
  sampleProductsCount?: number;
}

export interface QualityMetrics {
  hasImages: number;      // 0-1 ratio
  hasPrice: number;       // 0-1 ratio
  hasTags: number;        // 0-1 ratio
  hasDescription: number; // 0-1 ratio
  overallScore: number;   // 0-1 weighted average
}

export interface DataStructure {
  fieldsAvailable: string[];
  tagsFormat: 'string' | 'array';
  averageTagsCount: number;
  hasVendor: boolean;
  hasProductType: boolean;
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  type: 'collection' | 'config' | 'quality' | 'warning';
  message: string;
}

export interface SiteProfile {
  siteUrl: string;
  platform: 'shopify' | 'woocommerce' | 'custom' | 'unknown';
  isShopify: boolean; // Keep for backward compatibility
  discoveredAt: Date;
  validUntil: Date; // +6 months

  // Discovery results - ALL collections
  collections: CollectionData[];
  sampleProducts: ShopifyProduct[];
  dataStructure: DataStructure;
  qualityMetrics: QualityMetrics;
  recommendations: Recommendation[];

  // Metadata
  totalCollections: number;
  relevantCollections: number; // Count of suggestedRelevant=true
  estimatedProducts: number;   // Sum of all collections' productsCount
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

// Keywords to identify textile-related collections (suggestions)
const TEXTILE_KEYWORDS = [
  // French
  'tissu', 'tissus', 'textile', 'textiles', 'chute', 'chutes',
  'coton', 'soie', 'laine', 'lin', 'denim', 'jersey', 'velours',
  'metre', 'coupon', 'rouleau', 'popeline', 'gabardine', 'satin',
  'viscose', 'polyester', 'crepe', 'crêpe', 'dentelle', 'broderie',
  'jacquard', 'sergé', 'tweed', 'flanelle', 'mousseline', 'organza',
  'taffetas', 'doublure', 'batiste', 'chambray', 'oxford', 'liberty',
  'imprimé', 'uni', 'rayé', 'carreaux', 'vichy', 'pied-de-poule',
  'fleuri', 'floral', 'géométrique', 'abstrait',

  // English
  'fabric', 'fabrics', 'textile', 'textiles', 'deadstock', 'remnant',
  'cotton', 'silk', 'wool', 'linen', 'denim', 'jersey', 'velvet',
  'yard', 'meter', 'roll', 'poplin', 'gabardine', 'satin',
  'viscose', 'polyester', 'crepe', 'lace', 'embroidery',
  'jacquard', 'twill', 'tweed', 'flannel', 'chiffon', 'organza',
  'taffeta', 'lining', 'batiste', 'chambray', 'oxford',
  'print', 'printed', 'solid', 'stripe', 'check', 'plaid',
  'floral', 'geometric', 'abstract',

  // Spanish
  'tela', 'telas', 'textil', 'textiles',
  'algodón', 'seda', 'lana', 'lino',
];

// Keywords that suggest NON-textile (mercerie, accessories)
const EXCLUDE_KEYWORDS = [
  // French
  'mercerie', 'bouton', 'boutons', 'fermeture', 'fermetures',
  'fil', 'fils', 'aiguille', 'aiguilles', 'épingle', 'épingles',
  'patron', 'patrons', 'livre', 'livres', 'magazine',
  'ciseaux', 'machine', 'accessoire', 'accessoires',
  'carte', 'cadeau', 'gift', 'kit', 'cours', 'atelier',
  'bobine', // bobine de fil, pas de tissu

  // English
  'mercery', 'button', 'buttons', 'zipper', 'zippers',
  'thread', 'threads', 'needle', 'needles', 'pin', 'pins',
  'pattern', 'patterns', 'book', 'books', 'magazine',
  'scissors', 'machine', 'accessory', 'accessories',
  'card', 'gift', 'kit', 'class', 'workshop',
];

// High priority keywords (deadstock, coupons, etc.)
const HIGH_PRIORITY_KEYWORDS = [
  'deadstock', 'dead stock', 'fin de série', 'fin de stock',
  'chute', 'chutes', 'coupon', 'coupons', 'remnant', 'remnants',
  'destockage', 'déstockage', 'surplus', 'lot', 'lots',
  '3 metres', '3 mètres', '3m',
];

// ============================================================================
// PLATFORM DETECTION
// ============================================================================

type Platform = 'shopify' | 'woocommerce' | 'custom' | 'unknown';

async function detectPlatform(url: string): Promise<Platform> {
  const normalizedUrl = normalizeUrl(url);

  // Test Shopify first (most common for textile sites)
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
    // Not Shopify, continue
  }

  // TODO: Test WooCommerce
  // WooCommerce uses /wp-json/wc/v3/products (needs auth) or has specific HTML patterns

  // TODO: Test other platforms

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

  /**
   * Get ALL collections from Shopify site
   */
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

  /**
   * Sample products from a specific collection
   */
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
// COLLECTION ANALYSIS
// ============================================================================

/**
 * Analyze a collection and suggest relevance/priority
 */
function analyzeCollection(collection: ShopifyCollection): {
  suggestedRelevant: boolean;
  suggestedPriority: 'high' | 'medium' | 'low';
  relevanceReason: string;
} {
  const title = collection.title.toLowerCase();
  const handle = collection.handle.toLowerCase();
  const description = (collection.body_html || '').toLowerCase();
  const searchText = `${title} ${handle} ${description}`;

  // Check for exclude keywords first
  const hasExcludeKeyword = EXCLUDE_KEYWORDS.some(kw => {
    // More precise matching - check word boundaries
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(searchText);
  });

  // Check for textile keywords
  const matchedTextileKeywords = TEXTILE_KEYWORDS.filter(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(searchText);
  });

  const hasTextileKeyword = matchedTextileKeywords.length > 0;

  // Check for high priority keywords
  const hasHighPriorityKeyword = HIGH_PRIORITY_KEYWORDS.some(kw => 
    searchText.includes(kw.toLowerCase())
  );

  // Determine relevance
  let suggestedRelevant = false;
  let relevanceReason = '';

  if (hasExcludeKeyword && !hasTextileKeyword) {
    suggestedRelevant = false;
    relevanceReason = 'Contains mercerie/accessory keywords';
  } else if (hasTextileKeyword) {
    suggestedRelevant = true;
    relevanceReason = `Matches: ${matchedTextileKeywords.slice(0, 3).join(', ')}`;
  } else {
    // No clear signal - mark as maybe relevant, let admin decide
    suggestedRelevant = false;
    relevanceReason = 'No textile keywords detected';
  }

  // Determine priority
  let suggestedPriority: 'high' | 'medium' | 'low' = 'medium';

  if (hasHighPriorityKeyword) {
    suggestedPriority = 'high';
  } else if ((collection.products_count || 0) < 10) {
    suggestedPriority = 'low';
  } else if ((collection.products_count || 0) > 100) {
    suggestedPriority = 'high';
  }

  return {
    suggestedRelevant,
    suggestedPriority,
    relevanceReason,
  };
}

/**
 * Analyze quality of product data
 */
function analyzeQuality(products: ShopifyProduct[]): QualityMetrics {
  if (products.length === 0) {
    return {
      hasImages: 0,
      hasPrice: 0,
      hasTags: 0,
      hasDescription: 0,
      overallScore: 0,
    };
  }

  const hasImages = products.filter(p => p.images && p.images.length > 0).length / products.length;
  const hasPrice = products.filter(p => {
    return p.variants && p.variants.length > 0 && parseFloat(p.variants[0].price) > 0;
  }).length / products.length;

  const hasTags = products.filter(p => {
    if (typeof p.tags === 'string') {
      return p.tags.trim().length > 0;
    }
    return Array.isArray(p.tags) && p.tags.length > 0;
  }).length / products.length;

  const hasDescription = products.filter(p => {
    return p.body_html && p.body_html.length > 50;
  }).length / products.length;

  // Weighted average (images and price are critical)
  const overallScore = (
    hasImages * 0.35 +
    hasPrice * 0.35 +
    hasTags * 0.20 +
    hasDescription * 0.10
  );

  return {
    hasImages,
    hasPrice,
    hasTags,
    hasDescription,
    overallScore,
  };
}

/**
 * Analyze data structure from sample products
 */
function analyzeDataStructure(products: ShopifyProduct[]): DataStructure {
  if (products.length === 0) {
    return {
      fieldsAvailable: [],
      tagsFormat: 'string',
      averageTagsCount: 0,
      hasVendor: false,
      hasProductType: false,
    };
  }

  const firstProduct = products[0];
  const tagsFormat = Array.isArray(firstProduct.tags) ? 'array' : 'string';

  const totalTags = products.reduce((sum, p) => {
    if (typeof p.tags === 'string') {
      return sum + (p.tags.split(',').length || 0);
    }
    return sum + (p.tags?.length || 0);
  }, 0);
  const averageTagsCount = totalTags / products.length;

  const hasVendor = products.some(p => p.vendor && p.vendor.trim().length > 0);
  const hasProductType = products.some(p => p.product_type && p.product_type.trim().length > 0);

  const fieldsAvailable = ['id', 'title', 'body_html', 'tags', 'variants', 'images'];
  if (hasVendor) fieldsAvailable.push('vendor');
  if (hasProductType) fieldsAvailable.push('product_type');

  return {
    fieldsAvailable,
    tagsFormat,
    averageTagsCount,
    hasVendor,
    hasProductType,
  };
}

/**
 * Generate recommendations based on discovery results
 */
function generateRecommendations(
  qualityMetrics: QualityMetrics,
  collections: CollectionData[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Quality warnings
  if (qualityMetrics.overallScore < 0.5) {
    recommendations.push({
      priority: 'high',
      type: 'warning',
      message: `Low quality score (${Math.round(qualityMetrics.overallScore * 100)}%). Consider reviewing filters.`,
    });
  }

  if (qualityMetrics.hasImages < 0.7) {
    recommendations.push({
      priority: 'medium',
      type: 'quality',
      message: `Only ${Math.round(qualityMetrics.hasImages * 100)}% products have images. Consider image requirement filter.`,
    });
  }

  // Collection recommendations
  const relevantCollections = collections.filter(c => c.suggestedRelevant);
  const highPriorityCollections = relevantCollections.filter(c => c.suggestedPriority === 'high');

  if (highPriorityCollections.length > 0) {
    recommendations.push({
      priority: 'high',
      type: 'collection',
      message: `${highPriorityCollections.length} high-priority collections detected: ${highPriorityCollections.slice(0, 3).map(c => c.title).join(', ')}`,
    });
  }

  if (relevantCollections.length === 0) {
    recommendations.push({
      priority: 'high',
      type: 'warning',
      message: 'No textile-related collections auto-detected. Review all collections manually.',
    });
  }

  // Good quality site
  if (qualityMetrics.overallScore >= 0.8) {
    recommendations.push({
      priority: 'high',
      type: 'quality',
      message: `Excellent quality score (${Math.round(qualityMetrics.overallScore * 100)}%). High-value source!`,
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
   * MAIN FUNCTION: Discover a site completely
   * Returns ALL collections with suggestions
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

    if (platform !== 'shopify') {
      throw new Error(`Platform "${platform}" is not yet implemented.`);
    }

    // Step 2: Use appropriate adapter
    const adapter = new ShopifyDiscoveryAdapter(finalConfig);

    // Step 3: Get ALL collections
    console.log('📦 Fetching ALL collections...');
    const allCollections = await adapter.getAllCollections(normalizedUrl);
    console.log(`   Found ${allCollections.length} total collections\n`);

    // Step 4: Analyze ALL collections (not just filter)
    console.log('🔬 Analyzing collections...');
    const collectionsData: CollectionData[] = allCollections.map(collection => {
      const analysis = analyzeCollection(collection);
      
      return {
        handle: collection.handle,
        title: collection.title,
        productsCount: collection.products_count || 0,
        suggestedRelevant: analysis.suggestedRelevant,
        suggestedPriority: analysis.suggestedPriority,
        relevanceReason: analysis.relevanceReason,
        wasSampled: false,
        sampleProductsCount: undefined,
      };
    });

    const relevantCount = collectionsData.filter(c => c.suggestedRelevant).length;
    console.log(`   ${relevantCount} suggested as relevant (textile-related)`);
    console.log(`   ${allCollections.length - relevantCount} suggested as non-relevant\n`);

    // Step 5: Sample some collections for quality analysis
    console.log('🧪 Sampling products for quality analysis...');
    const samples: ShopifyProduct[] = [];

    // Prioritize sampling from suggested-relevant collections
    const collectionsToSample = [...collectionsData]
      .filter(c => c.suggestedRelevant)
      .sort((a, b) => {
        // High priority first, then by products count
        if (a.suggestedPriority === 'high' && b.suggestedPriority !== 'high') return -1;
        if (b.suggestedPriority === 'high' && a.suggestedPriority !== 'high') return 1;
        return b.productsCount - a.productsCount;
      })
      .slice(0, finalConfig.maxSampleCollections);

    // If no relevant collections, sample from largest ones
    if (collectionsToSample.length === 0) {
      console.log('   No relevant collections found, sampling from largest...');
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

      samples.push(...products);

      // Update the collection data with sampling info
      const idx = collectionsData.findIndex(c => c.handle === collectionData.handle);
      if (idx !== -1) {
        collectionsData[idx].wasSampled = true;
        collectionsData[idx].sampleProductsCount = products.length;
      }

      console.log(`   ✓ ${products.length} products sampled`);
    }

    console.log(`\n✅ Total samples: ${samples.length} products\n`);

    // Step 6: Analyze quality from samples
    console.log('📊 Analyzing quality...');
    const qualityMetrics = analyzeQuality(samples);
    console.log(`   Overall score: ${Math.round(qualityMetrics.overallScore * 100)}%`);
    console.log(`   - Images: ${Math.round(qualityMetrics.hasImages * 100)}%`);
    console.log(`   - Price: ${Math.round(qualityMetrics.hasPrice * 100)}%`);
    console.log(`   - Tags: ${Math.round(qualityMetrics.hasTags * 100)}%`);
    console.log(`   - Description: ${Math.round(qualityMetrics.hasDescription * 100)}%\n`);

    // Step 7: Analyze data structure
    const dataStructure = analyzeDataStructure(samples);

    // Step 8: Generate recommendations
    const recommendations = generateRecommendations(qualityMetrics, collectionsData);

    // Step 9: Calculate totals
    const totalProducts = collectionsData.reduce((sum, c) => sum + c.productsCount, 0);

    // Step 10: Create profile
    const profile: SiteProfile = {
      siteUrl: normalizedUrl,
      platform,
      isShopify: platform === 'shopify',
      discoveredAt: new Date(),
      validUntil: addMonths(new Date(), 6),

      collections: collectionsData,
      sampleProducts: samples.slice(0, 10),
      dataStructure,
      qualityMetrics,
      recommendations,

      totalCollections: allCollections.length,
      relevantCollections: relevantCount,
      estimatedProducts: totalProducts,
    };

    console.log('✅ Discovery complete!');
    console.log(`   📦 ${profile.totalCollections} collections (${profile.relevantCollections} suggested relevant)`);
    console.log(`   📊 ~${profile.estimatedProducts} estimated products`);
    console.log(`   ⭐ ${Math.round(qualityMetrics.overallScore * 100)}% quality score\n`);

    return profile;
  }

  /**
   * Test if a site is supported (quick check)
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
