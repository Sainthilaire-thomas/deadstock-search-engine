/**
 * Discovery Service
 * 
 * Purpose: Analyze Shopify site structure WITHOUT scraping all products
 * Strategy: Cache structure for 6 months, use for intelligent scraping
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
  sampleSize: number;           // Products per collection (default: 10)
  maxCollections: number;       // Max collections to sample (default: 5)
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
}

export interface ShopifyProduct {
  id: number;
  title: string;
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

export interface CollectionData {
  handle: string;
  title: string;
  productsCount: number;
  relevant: boolean;
  priority: 'high' | 'medium' | 'low';
  reason?: string;
  sampleProducts?: number;
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
  isShopify: boolean;
  discoveredAt: Date;
  validUntil: Date; // +6 months
  
  // Discovery results
  collections: CollectionData[];
  sampleProducts: ShopifyProduct[];
  dataStructure: DataStructure;
  qualityMetrics: QualityMetrics;
  recommendations: Recommendation[];
  
  // Metadata
  totalCollections: number;
  relevantCollections: number;
  estimatedProducts: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: DiscoveryConfig = {
  sampleSize: 10,
  maxCollections: 5,
  timeout: 60000,
  delayBetweenRequests: 3000,
};

// Keywords to identify textile-related collections
const TEXTILE_KEYWORDS = [
  // French
  'tissu', 'tissus', 'textile', 'textiles', 'chute', 'chutes',
  'coton', 'soie', 'laine', 'lin', 'denim', 'jersey',
  'metre', 'coupon', 'rouleau',
  
  // English
  'fabric', 'fabrics', 'textile', 'textiles', 'deadstock',
  'cotton', 'silk', 'wool', 'linen', 'denim', 'jersey',
  'yard', 'meter', 'roll',
  
  // Spanish
  'tela', 'telas', 'textil', 'textiles',
  'algodón', 'seda', 'lana', 'lino',
];

// Keywords to EXCLUDE (not textile products)
const EXCLUDE_KEYWORDS = [
  'mercerie', 'mercery', 'button', 'bouton', 'zipper', 'fermeture',
  'thread', 'fil', 'needle', 'aiguille', 'patron', 'pattern',
  'livre', 'book', 'magazine', 'accessoire', 'accessory',
];

// ============================================================================
// DISCOVERY SERVICE
// ============================================================================

class DiscoveryService {
  
  /**
   * Test if site is Shopify
   * Fast check: try to fetch /products.json with retry
   */
  async testShopify(url: string, retries: number = 2): Promise<boolean> {
    const normalizedUrl = this.normalizeUrl(url);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`   Attempt ${attempt}/${retries}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        const response = await fetch(`${normalizedUrl}/products.json?limit=1`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          if (attempt < retries) {
            console.log(`   HTTP ${response.status}, retrying...`);
            await this.delay(2000);
            continue;
          }
          return false;
        }
        
        const data = await response.json();
        return !!(data.products && Array.isArray(data.products));
        
      } catch (error: any) {
        console.error(`[testShopify] Attempt ${attempt} failed:`, error.message);
        
        if (attempt < retries) {
          console.log(`   Waiting 3s before retry...`);
          await this.delay(3000);
        } else {
          return false;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Get all collections from site
   */
  async getCollections(url: string): Promise<ShopifyCollection[]> {
    const normalizedUrl = this.normalizeUrl(url);
    
    try {
      const response = await fetch(`${normalizedUrl}/collections.json`, {
        method: 'GET',
        headers: {
          'User-Agent': 'DeadstockSearchEngine/1.0 Discovery',
        },
        signal: AbortSignal.timeout(30000), // 30s timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.collections || [];
    } catch (error: any) {
      console.error(`[getCollections] Error fetching collections from ${url}:`, error.message);
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
    const normalizedUrl = this.normalizeUrl(url);
    
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
      console.error(`[sampleCollection] Error sampling ${collectionHandle}:`, error.message);
      return []; // Return empty array instead of throwing
    }
  }
  
  /**
   * Analyze quality of product data
   */
  analyzeQuality(products: ShopifyProduct[]): QualityMetrics {
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
  analyzeDataStructure(products: ShopifyProduct[]): DataStructure {
    if (products.length === 0) {
      return {
        fieldsAvailable: [],
        tagsFormat: 'string',
        averageTagsCount: 0,
        hasVendor: false,
        hasProductType: false,
      };
    }
    
    // Detect tags format
    const firstProduct = products[0];
    const tagsFormat = Array.isArray(firstProduct.tags) ? 'array' : 'string';
    
    // Calculate average tags count
    const totalTags = products.reduce((sum, p) => {
      if (typeof p.tags === 'string') {
        return sum + (p.tags.split(',').length || 0);
      }
      return sum + (p.tags?.length || 0);
    }, 0);
    const averageTagsCount = totalTags / products.length;
    
    // Check vendor and product_type presence
    const hasVendor = products.some(p => p.vendor && p.vendor.trim().length > 0);
    const hasProductType = products.some(p => p.product_type && p.product_type.trim().length > 0);
    
    // List available fields
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
   * Filter collections to find textile-related ones
   */
  filterRelevantCollections(collections: ShopifyCollection[]): ShopifyCollection[] {
    return collections.filter(collection => {
      const title = collection.title.toLowerCase();
      const handle = collection.handle.toLowerCase();
      const searchText = `${title} ${handle}`;
      
      // Check for exclude keywords first
      const hasExcludeKeyword = EXCLUDE_KEYWORDS.some(kw => searchText.includes(kw));
      if (hasExcludeKeyword) {
        return false;
      }
      
      // Check for textile keywords
      const hasTextileKeyword = TEXTILE_KEYWORDS.some(kw => searchText.includes(kw));
      return hasTextileKeyword;
    });
  }
  
  /**
   * Generate recommendations based on discovery results
   */
  generateRecommendations(
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
    const highPriorityCollections = collections.filter(c => c.priority === 'high');
    if (highPriorityCollections.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'collection',
        message: `Start scraping with ${highPriorityCollections.length} high-priority collections: ${highPriorityCollections.map(c => c.title).join(', ')}`,
      });
    }
    
    // No relevant collections
    if (collections.length === 0) {
      recommendations.push({
        priority: 'high',
        type: 'warning',
        message: 'No textile-related collections found. Site may not be relevant.',
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
  
  /**
   * Estimate total products from collections
   */
  estimateTotal(collections: CollectionData[]): number {
    return collections.reduce((sum, c) => sum + c.productsCount, 0);
  }
  
  /**
   * Determine collection priority based on title and sample
   */
  determineCollectionPriority(
    collection: ShopifyCollection,
    sampleSize: number
  ): 'high' | 'medium' | 'low' {
    const title = collection.title.toLowerCase();
    
    // High priority keywords
    const highPriorityKeywords = ['deadstock', 'chute', 'coupon', 'tissu'];
    if (highPriorityKeywords.some(kw => title.includes(kw))) {
      return 'high';
    }
    
    // Low priority if very small
    if ((collection.products_count || 0) < 10) {
      return 'low';
    }
    
    return 'medium';
  }
  
  /**
   * MAIN FUNCTION: Discover a site completely
   */
  async discoverSite(
    url: string,
    config: Partial<DiscoveryConfig> = {}
  ): Promise<SiteProfile> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const normalizedUrl = this.normalizeUrl(url);
    
    console.log(`\n🔍 Discovering: ${normalizedUrl}`);
    console.log(`⚙️  Config: ${finalConfig.sampleSize} products/collection, ${finalConfig.maxCollections} collections max\n`);
    
    // Step 1: Test Shopify
    console.log('📡 Testing Shopify API...');
    const isShopify = await this.testShopify(normalizedUrl);
    
    if (!isShopify) {
      throw new Error('Not a Shopify site or API not accessible');
    }
    console.log('✅ Shopify detected\n');
    
    await this.delay(finalConfig.delayBetweenRequests);
    
    // Step 2: Get all collections
    console.log('📦 Fetching collections...');
    const allCollections = await this.getCollections(normalizedUrl);
    const relevantCollections = this.filterRelevantCollections(allCollections);
    
    console.log(`   Found ${allCollections.length} total collections`);
    console.log(`   ${relevantCollections.length} textile-related\n`);
    
    // Step 3: Sample products from relevant collections
    console.log('🔬 Sampling products...');
    const samples: ShopifyProduct[] = [];
    const collectionsData: CollectionData[] = [];
    
    const collectionsToSample = relevantCollections.slice(0, finalConfig.maxCollections);
    
    for (const collection of collectionsToSample) {
      await this.delay(finalConfig.delayBetweenRequests);
      
      console.log(`   Sampling "${collection.title}"...`);
      const products = await this.sampleCollection(
        normalizedUrl,
        collection.handle,
        finalConfig.sampleSize
      );
      
      samples.push(...products);
      
      collectionsData.push({
        handle: collection.handle,
        title: collection.title,
        productsCount: collection.products_count || 0,
        relevant: true,
        priority: this.determineCollectionPriority(collection, products.length),
        sampleProducts: products.length,
      });
      
      console.log(`   ✓ ${products.length} products sampled`);
    }
    
    console.log(`\n✅ Total samples: ${samples.length} products\n`);
    
    // Step 4: Analyze quality
    console.log('📊 Analyzing quality...');
    const qualityMetrics = this.analyzeQuality(samples);
    console.log(`   Overall score: ${Math.round(qualityMetrics.overallScore * 100)}%`);
    console.log(`   - Images: ${Math.round(qualityMetrics.hasImages * 100)}%`);
    console.log(`   - Price: ${Math.round(qualityMetrics.hasPrice * 100)}%`);
    console.log(`   - Tags: ${Math.round(qualityMetrics.hasTags * 100)}%`);
    console.log(`   - Description: ${Math.round(qualityMetrics.hasDescription * 100)}%\n`);
    
    // Step 5: Analyze data structure
    const dataStructure = this.analyzeDataStructure(samples);
    
    // Step 6: Generate recommendations
    const recommendations = this.generateRecommendations(qualityMetrics, collectionsData);
    
    // Step 7: Create profile
    const profile: SiteProfile = {
      siteUrl: normalizedUrl,
      isShopify: true,
      discoveredAt: new Date(),
      validUntil: addMonths(new Date(), 6),
      
      collections: collectionsData,
      sampleProducts: samples.slice(0, 10), // Keep only 10 for reference
      dataStructure,
      qualityMetrics,
      recommendations,
      
      totalCollections: allCollections.length,
      relevantCollections: relevantCollections.length,
      estimatedProducts: this.estimateTotal(collectionsData),
    };
    
    console.log('✅ Discovery complete!\n');
    
    return profile;
  }
  
  /**
   * Normalize URL (remove trailing slash, add https)
   */
  private normalizeUrl(url: string): string {
    let normalized = url.trim();
    
    // Add https:// if missing
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }
    
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');
    
    return normalized;
  }
  
  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const discoveryService = new DiscoveryService();
