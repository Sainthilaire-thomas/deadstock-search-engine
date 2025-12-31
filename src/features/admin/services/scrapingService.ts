/**
 * Scraping Service
 * 
 * Purpose: Intelligent scraping based on cached site profiles
 * Strategy: Use discovery profiles to scrape efficiently
 * 
 * Philosophy:
 * - Discovery = Structure (cached 6 months)
 * - Scraping = Products (based on cached structure)
 */

import type { SiteProfile } from './discoveryService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ScrapingConfig {
  collections?: string[];          // Collection handles to scrape (empty = all relevant)
  maxProductsPerCollection?: number; // Max products per collection
  delayBetweenRequests?: number;   // Delay in ms (default: 2000)
  previewMode?: boolean;           // Preview mode (10 products only)
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    requiresImage?: boolean;
    requiresTags?: boolean;
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
    title: string;
    price: string;
    available: boolean;
    inventory_quantity?: number;
  }>;
  images: Array<{
    id: number;
    src: string;
    alt?: string;
  }>;
}

export interface ScrapingResult {
  siteUrl: string;
  startedAt: Date;
  endedAt: Date;
  duration: number; // milliseconds
  
  // Statistics
  collectionsScraped: number;
  productsFetched: number;
  productsValid: number;
  productsSkipped: number;
  errorsCount: number;
  
  // Details
  products: ShopifyProduct[];
  errors: Array<{ collection: string; error: string }>;
  
  // Quality
  qualityScore: number;
}

export interface PreviewResult {
  siteUrl: string;
  collectionHandle: string;
  collectionTitle: string;
  productsFetched: number;
  products: ShopifyProduct[];
  qualityScore: number;
  estimatedTotal: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: Required<ScrapingConfig> = {
  collections: [],
  maxProductsPerCollection: 1000,
  delayBetweenRequests: 2000,
  previewMode: false,
  filters: {
    requiresImage: true,
    requiresTags: false,
  },
};

// ============================================================================
// SCRAPING SERVICE
// ============================================================================

class ScrapingService {
  
  /**
   * Preview scraping - Test with first 10 products
   * Use case: Validate scraping before full run
   */
  async previewScraping(
    profile: SiteProfile,
    collectionHandle?: string
  ): Promise<PreviewResult> {
    console.log(`\n🔬 Preview Scraping: ${profile.siteUrl}`);
    
    // Select collection to preview
    const collection = collectionHandle
      ? profile.collections.find(c => c.handle === collectionHandle)
      : profile.collections.find(c => c.priority === 'high') || profile.collections[0];
    
    if (!collection) {
      throw new Error('No collection available for preview');
    }
    
    console.log(`   Collection: ${collection.title}`);
    console.log(`   Sampling: 10 products\n`);
    
    // Fetch 10 products
    const products = await this.fetchCollectionProducts(
      profile.siteUrl,
      collection.handle,
      10
    );
    
    // Analyze quality
    const qualityScore = this.analyzeProductsQuality(products);
    
    console.log(`✅ Preview complete: ${products.length} products`);
    console.log(`   Quality: ${Math.round(qualityScore * 100)}%\n`);
    
    return {
      siteUrl: profile.siteUrl,
      collectionHandle: collection.handle,
      collectionTitle: collection.title,
      productsFetched: products.length,
      products,
      qualityScore,
      estimatedTotal: collection.productsCount,
    };
  }
  
  /**
   * Scrape entire site based on profile and config
   */
  async scrapeSite(
    profile: SiteProfile,
    config: Partial<ScrapingConfig> = {}
  ): Promise<ScrapingResult> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const startedAt = new Date();
    
    console.log(`\n📦 Scraping Site: ${profile.siteUrl}`);
    console.log(`⚙️  Config:`, {
      collections: finalConfig.collections.length || 'all relevant',
      maxPerCollection: finalConfig.maxProductsPerCollection,
      delay: `${finalConfig.delayBetweenRequests}ms`,
    });
    console.log('');
    
    // Filter collections to scrape
    const collectionsToScrape = this.filterCollections(profile, finalConfig);
    
    console.log(`🎯 Collections to scrape: ${collectionsToScrape.length}`);
    collectionsToScrape.forEach(c => {
      console.log(`   • ${c.title} (${c.productsCount} products)`);
    });
    console.log('');
    
    // Scrape each collection
    const allProducts: ShopifyProduct[] = [];
    const errors: Array<{ collection: string; error: string }> = [];
    let productsSkipped = 0;
    
    for (const collection of collectionsToScrape) {
      try {
        console.log(`📦 Scraping: ${collection.title}...`);
        
        const products = await this.fetchCollectionProducts(
          profile.siteUrl,
          collection.handle,
          finalConfig.maxProductsPerCollection
        );
        
        // Apply filters
        const validProducts = this.applyFilters(products, finalConfig.filters);
        const skipped = products.length - validProducts.length;
        
        allProducts.push(...validProducts);
        productsSkipped += skipped;
        
        console.log(`   ✓ Fetched: ${products.length}, Valid: ${validProducts.length}, Skipped: ${skipped}`);
        
        // Delay between collections
        if (collectionsToScrape.indexOf(collection) < collectionsToScrape.length - 1) {
          await this.delay(finalConfig.delayBetweenRequests);
        }
        
      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}`);
        errors.push({
          collection: collection.handle,
          error: error.message,
        });
      }
    }
    
    const endedAt = new Date();
    const duration = endedAt.getTime() - startedAt.getTime();
    
    // Calculate quality
    const qualityScore = this.analyzeProductsQuality(allProducts);
    
    console.log(`\n✅ Scraping Complete!`);
    console.log(`   Duration: ${Math.round(duration / 1000)}s`);
    console.log(`   Products: ${allProducts.length} valid, ${productsSkipped} skipped`);
    console.log(`   Quality: ${Math.round(qualityScore * 100)}%`);
    console.log(`   Errors: ${errors.length}\n`);
    
    return {
      siteUrl: profile.siteUrl,
      startedAt,
      endedAt,
      duration,
      collectionsScraped: collectionsToScrape.length,
      productsFetched: allProducts.length + productsSkipped,
      productsValid: allProducts.length,
      productsSkipped,
      errorsCount: errors.length,
      products: allProducts,
      errors,
      qualityScore,
    };
  }
  
  /**
   * Scrape a specific collection
   */
  async scrapeCollection(
    siteUrl: string,
    collectionHandle: string,
    limit?: number
  ): Promise<ShopifyProduct[]> {
    console.log(`📦 Scraping collection: ${collectionHandle}`);
    
    const products = await this.fetchCollectionProducts(
      siteUrl,
      collectionHandle,
      limit
    );
    
    console.log(`✅ Fetched ${products.length} products`);
    
    return products;
  }
  
  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================
  
  /**
   * Fetch products from a Shopify collection
   */
  private async fetchCollectionProducts(
    siteUrl: string,
    collectionHandle: string,
    limit?: number
  ): Promise<ShopifyProduct[]> {
    const normalizedUrl = this.normalizeUrl(siteUrl);
    const products: ShopifyProduct[] = [];
    let page = 1;
    const perPage = 250; // Shopify max
    const maxLimit = limit || 10000;
    
    while (products.length < maxLimit) {
      try {
        const url = `${normalizedUrl}/collections/${collectionHandle}/products.json?limit=${perPage}&page=${page}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            // No more products
            break;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.products || data.products.length === 0) {
          break;
        }
        
        products.push(...data.products);
        
        // Check if we have enough
        if (data.products.length < perPage || products.length >= maxLimit) {
          break;
        }
        
        page++;
        
        // Small delay between pages
        await this.delay(1000);
        
      } catch (error: any) {
        console.error(`[fetchCollectionProducts] Error on page ${page}:`, error.message);
        break;
      }
    }
    
    return limit ? products.slice(0, limit) : products;
  }
  
  /**
   * Filter collections based on config
   */
  private filterCollections(
    profile: SiteProfile,
    config: Required<ScrapingConfig>
  ): typeof profile.collections {
    let collections = profile.collections;
    
    // Filter by handles if specified
    if (config.collections.length > 0) {
      collections = collections.filter(c => 
        config.collections.includes(c.handle)
      );
    }
    
    // Sort by priority (high first)
    collections.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    return collections;
  }
  
  /**
   * Apply filters to products
   */
  private applyFilters(
    products: ShopifyProduct[],
    filters: Required<ScrapingConfig>['filters']
  ): ShopifyProduct[] {
    return products.filter(product => {
      // Require image
      if (filters.requiresImage && (!product.images || product.images.length === 0)) {
        return false;
      }
      
      // Require tags
      if (filters.requiresTags) {
        const hasTags = typeof product.tags === 'string' 
          ? product.tags.trim().length > 0
          : product.tags && product.tags.length > 0;
        if (!hasTags) return false;
      }
      
      // Price filters
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        const price = parseFloat(product.variants[0]?.price || '0');
        if (filters.minPrice !== undefined && price < filters.minPrice) return false;
        if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
      }
      
      return true;
    });
  }
  
  /**
   * Analyze quality of scraped products
   */
  private analyzeProductsQuality(products: ShopifyProduct[]): number {
    if (products.length === 0) return 0;
    
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
    
    // Weighted average
    return (
      hasImages * 0.35 +
      hasPrice * 0.35 +
      hasTags * 0.20 +
      hasDescription * 0.10
    );
  }
  
  /**
   * Normalize URL
   */
  private normalizeUrl(url: string): string {
    let normalized = url.trim();
    
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }
    
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

export const scrapingService = new ScrapingService();
