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
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database.types';
import { scrapingRepo } from '../infrastructure/scrapingRepo';
import type { Locale } from '@/features/tuning/domain/types';

// Type for textiles insert
type TextileInsert = Database['deadstock']['Tables']['textiles']['Insert'];

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ScrapingConfig {
  collections?: string[];
  maxProductsPerCollection?: number;
  delayBetweenRequests?: number;
  previewMode?: boolean;
  sourceLocale?: Locale;  // ← NOUVEAU
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    requiresImage?: boolean;
    requiresTags?: boolean;
    onlyAvailable?: boolean;
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
  productsSaved: number;
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
  sourceLocale: 'fr',  // ← NOUVEAU - Default to French
  filters: {
    requiresImage: true,
    requiresTags: false,
    onlyAvailable: true,
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
      : profile.collections.find(c => c.suggestedPriority === 'high') || profile.collections[0];

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

   // =========================================================================
// SAVE PRODUCTS TO DATABASE WITH NORMALIZATION
// =========================================================================
console.log(`\n💾 Saving ${allProducts.length} products with normalization...`);

const saveResult = await scrapingRepo.saveProducts(
  allProducts,
  profile.siteUrl,
  'direct-scrape',  // jobId placeholder
  finalConfig.sourceLocale
);

const savedCount = saveResult.saved + saveResult.updated;
    
    console.log(`   ✅ Saved: ${savedCount} products`);

    const endedAt = new Date();
    const duration = endedAt.getTime() - startedAt.getTime();

    // Calculate quality
    const qualityScore = this.analyzeProductsQuality(allProducts);

    console.log(`\n✅ Scraping Complete!`);
    console.log(`   Duration: ${Math.round(duration / 1000)}s`);
    console.log(`   Products: ${allProducts.length} valid, ${productsSkipped} skipped, ${savedCount} saved`);
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
      productsSaved: savedCount,
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
  // DATABASE METHODS
  // ==========================================================================

  /**
   * Save products to deadstock.textiles table
   */
  private async saveProductsToDatabase(
    products: ShopifyProduct[],
    siteUrl: string,
    platformName: string
  ): Promise<number> {
    const supabase = createAdminClient();
    let savedCount = 0;

    // Process in batches of 50
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < products.length; i += batchSize) {
      batches.push(products.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const textilesToInsert = batch.map(product => this.mapProductToTextile(product, siteUrl, platformName));

      try {
        // Use upsert to handle duplicates (update if exists)
        const { data, error } = await supabase
          .from('textiles')
          .upsert(textilesToInsert, {
            onConflict: 'source_url',
            ignoreDuplicates: false,
          })
          .select('id');

        if (error) {
          console.error(`   ⚠️ Batch insert error:`, error.message);
          // Continue with next batch
        } else {
          savedCount += data?.length || 0;
        }
      } catch (err: any) {
        console.error(`   ⚠️ Batch error:`, err.message);
      }
    }

    return savedCount;
  }

  /**
   * Map Shopify product to textiles table schema
   */
  private mapProductToTextile(
    product: ShopifyProduct,
    siteUrl: string,
    platformName: string
  ): TextileInsert {
    const variant = product.variants?.[0];
    const image = product.images?.[0];
    const additionalImages = product.images?.slice(1).map(img => img.src) || [];
    
    // Parse tags
    const tags = this.parseTags(product.tags);
    
    // Get weight in grams
    const weightGrams = variant ? this.getWeightInGrams(variant) : null;
    
    // Calculate price
    const price = variant ? parseFloat(variant.price) : null;
    
    // Check availability
    const available = product.variants?.some(v => v.available) ?? false;
    
    // Calculate quality score
    const qualityScore = this.calculateProductQualityScore(product);

    // Build source URL
    const normalizedSiteUrl = this.normalizeUrl(siteUrl);
    const productUrl = `${normalizedSiteUrl}/products/${product.handle}`;

    return {
      // Required fields
      name: product.title,
      source_platform: platformName,
      source_url: productUrl,
      quantity_value: 1,
      quantity_unit: 'piece',
      
      // Source info
      source_product_id: String(product.id),
      
      // Description
      description: this.cleanHtml(product.body_html),
      
      // Pricing
      price_value: price,
      price_currency: 'EUR',
      
      // Availability
      available: available,
      
      // Weight
      weight_value: weightGrams,
      weight_unit: weightGrams ? 'g' : null,
      
      // Images
      image_url: image?.src || null,
      additional_images: additionalImages.length > 0 ? additionalImages : null,
      
      // Tags & Categories
      tags_original: tags.length > 0 ? tags : null,
      
      // Raw original values (before normalization)
      material_original: product.product_type || null,
      
      // Vendor/Supplier
      supplier_name: product.vendor || null,
      
      // Quality
      data_quality_score: Math.round(qualityScore * 100),
      
      // Raw data for reference
      raw_data: {
        shopify_id: product.id,
        handle: product.handle,
        vendor: product.vendor,
        product_type: product.product_type,
        tags: tags,
        variants_count: product.variants?.length || 0,
        images_count: product.images?.length || 0,
      },
      
      // Timestamps
      scraped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Extract platform name from URL
   */
  private extractPlatformName(url: string): string {
    try {
      const hostname = new URL(this.normalizeUrl(url)).hostname;
      // Remove www. and get domain
      const domain = hostname.replace(/^www\./, '');
      // Convert to snake_case identifier
      return domain.replace(/\./g, '_').replace(/-/g, '_');
    } catch {
      return 'unknown';
    }
  }

  /**
   * Parse tags from string or array
   */
  private parseTags(tags: string | string[]): string[] {
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
  private getWeightInGrams(variant: ShopifyVariant): number | null {
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
   * Clean HTML from description
   */
  private cleanHtml(html: string | null): string | null {
    if (!html) return null;
    // Basic HTML stripping
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculate quality score for a single product
   */
  private calculateProductQualityScore(product: ShopifyProduct): number {
    let score = 0;
    let factors = 0;

    // Has images (35%)
    if (product.images && product.images.length > 0) {
      score += 0.35;
    }
    factors += 0.35;

    // Has price (35%)
    const price = parseFloat(product.variants?.[0]?.price || '0');
    if (price > 0) {
      score += 0.35;
    }
    factors += 0.35;

    // Has tags (15%)
    const tags = this.parseTags(product.tags);
    if (tags.length > 0) {
      score += 0.15;
    }
    factors += 0.15;

    // Has description (15%)
    if (product.body_html && product.body_html.length > 50) {
      score += 0.15;
    }
    factors += 0.15;

    return factors > 0 ? score / factors * factors : 0;
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
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const aPriority = a.suggestedPriority || 'low';
      const bPriority = b.suggestedPriority || 'low';
      return (priorityOrder[aPriority] || 2) - (priorityOrder[bPriority] || 2);
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

      // Only available (in stock)
      if (filters.onlyAvailable) {
        const isAvailable = product.variants?.some(v => v.available) ?? false;
        if (!isAvailable) return false;
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
