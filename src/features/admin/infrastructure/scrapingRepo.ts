/**
 * Scraping Repository - WITH NORMALIZATION
 * 
 * Purpose: Persist scraping jobs and products with intelligent normalization
 * Tables: scraping_jobs, textiles
 * 
 * Session 3: Integrated normalization system
 */

import { createClient } from '@supabase/supabase-js';
import type { ShopifyProduct, ScrapingConfig, ScrapingResult } from '../services/scrapingService';
import { extractTermsFromShopify } from '../utils/extractTerms';
import { normalizeTextile, type NormalizeTextileOutput } from '@/features/normalization/application/normalizeTextile';
import type { Locale } from '@/features/tuning/domain/types';
import { extractDimensions, type ExtractedDimensions } from '../services/extractionService';
import type { ExtractionPatterns } from '../domain/types';
import { analyzeVariants } from '../utils/variantAnalyzer';

// ============================================================================
// CATEGORY IDs (for textile_attributes dual-write)
// ============================================================================

const CATEGORY_IDS = {
  fiber: 'd68146d7-46a0-4dc4-8283-388e5d83e979',
  color: '4c5841b1-430a-4501-9f0e-1d978869a77d',
  pattern: 'be7768ee-cad6-48fc-adb9-30000296642a',
  weave: '1d191a33-6d64-4399-9d28-8e84f33a1bcb',
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface DbScrapingJob {
  id: string;
  site_id: string;
  profile_id: string | null;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'partial';
  started_at: string | null;
  ended_at: string | null;
  config: any;
  products_fetched: number;
  products_saved: number;
  products_skipped: number;
  products_updated: number;
  errors_count: number;
  quality_score: number | null;
  logs: any;
  error_details: any;
  created_at: string;
}

interface CreateJobParams {
  siteUrl: string;
  profileId?: string;
  config: ScrapingConfig;
}

interface UpdateJobProgressParams {
  jobId: string;
  productsFetched: number;
  productsSaved: number;
  productsSkipped: number;
  errorsCount: number;
}

interface CompleteJobParams {
  jobId: string;
  status: 'completed' | 'failed' | 'partial';
  result: ScrapingResult;
}

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

function createScraperClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'deadstock',
    },
  });
}

// ============================================================================
// HELPER: URL NORMALIZATION
// ============================================================================

function normalizeUrl(url: string): string {
  let normalized = url.trim();
  normalized = normalized.replace(/^https?:\/\//, '');
  normalized = normalized.replace(/\/$/, '');
  return normalized;
}

// ============================================================================
// HELPER: QUALITY SCORE CALCULATION
// ============================================================================

function calculateQualityScore(
  product: ShopifyProduct,
  normalized: NormalizeTextileOutput
): number {
  let score = 0;
  
  // Core attributes (40 points total)
  if (normalized.material) score += 15;
  if (normalized.color) score += 15;
  if (normalized.pattern) score += 10;
  
  // Product completeness (30 points)
  if (product.title) score += 10;
  if (product.body_html) score += 5;
  if (product.images && product.images.length > 0) score += 10;
  if (product.images && product.images.length > 1) score += 5;
  
  // Availability (15 points)
  if (product.variants && product.variants.length > 0) score += 10;
  if (product.variants && product.variants[0]?.available) score += 5;
  
  // Price (15 points)
  if (product.variants && product.variants[0]?.price) score += 15;
  
  return Math.min(100, score);
}

// ============================================================================
// HELPER: BUILD REVIEW REASONS
// ============================================================================

function buildReviewReasons(unknowns: Record<string, string>): any[] | null {
  const reasons = [];
  
  for (const [field, originalValue] of Object.entries(unknowns)) {
    reasons.push({
      field: `${field}_type`,
      reason: 'unknown_term',
      original_value: originalValue,
      timestamp: new Date().toISOString()
    });
  }
  
  return reasons.length > 0 ? reasons : null;
}

// ============================================================================
// HELPER: SAVE TEXTILE ATTRIBUTES (dual-write)
// ============================================================================

async function saveTextileAttributes(
  supabase: ReturnType<typeof createScraperClient>,
  textileId: string,
  normalized: NormalizeTextileOutput,
  extractedTerms: ReturnType<typeof extractTermsFromShopify>,
  sourceLocale?: Locale
): Promise<number> {
  const attributes: Array<{
    textile_id: string;
    category_id: string;
    category_slug: string;
    value: string;
    source_term: string | null;
    source_locale: string;
    confidence: number;
  }> = [];

  // Fiber (material)
  if (normalized.material?.value) {
    attributes.push({
      textile_id: textileId,
      category_id: CATEGORY_IDS.fiber,
      category_slug: 'fiber',
      value: normalized.material.value,
      source_term: extractedTerms.materials[0] || null,
      source_locale: sourceLocale || 'fr',
      confidence: 1.0,
    });
  }

  // Color
  if (normalized.color?.value) {
    attributes.push({
      textile_id: textileId,
      category_id: CATEGORY_IDS.color,
      category_slug: 'color',
      value: normalized.color.value,
      source_term: extractedTerms.colors[0] || null,
      source_locale: sourceLocale || 'fr',
      confidence: 1.0,
    });
  }

  // Pattern
  if (normalized.pattern?.value) {
    attributes.push({
      textile_id: textileId,
      category_id: CATEGORY_IDS.pattern,
      category_slug: 'pattern',
      value: normalized.pattern.value,
      source_term: extractedTerms.patterns[0] || null,
      source_locale: sourceLocale || 'fr',
      confidence: 1.0,
    });
  }

  if (attributes.length === 0) {
    return 0;
  }

  // Upsert with conflict on (textile_id, category_id)
  const { error } = await supabase
    .from('textile_attributes')
    .upsert(attributes, {
      onConflict: 'textile_id,category_id',
      ignoreDuplicates: false,
    });

  if (error) {
    console.error(`      ⚠️  Failed to save attributes:`, error.message);
    return 0;
  }

  return attributes.length;
}

// ============================================================================
// REPOSITORY
// ============================================================================

export const scrapingRepo = {
  
  /**
   * Create a new scraping job
   */
  async createJob(params: CreateJobParams): Promise<string> {
    const supabase = createScraperClient();
    const normalizedUrl = normalizeUrl(params.siteUrl);
    
    try {
      // Get or create site
      let { data: site } = await supabase
        .from('sites')
        .select('id')
        .eq('url', normalizedUrl)
        .single();
      
      if (!site) {
        const { data: newSite, error: siteError } = await supabase
          .from('sites')
          .insert({ url: normalizedUrl, name: normalizedUrl })
          .select('id')
          .single();
        
        if (siteError) throw siteError;
        site = newSite;
      }
      
      // Create job
      const { data: job, error: jobError } = await supabase
        .from('scraping_jobs')
        .insert({
          site_id: site.id,
          profile_id: params.profileId || null,
          status: 'queued',
          config: params.config,
          products_fetched: 0,
          products_saved: 0,
          products_skipped: 0,
          products_updated: 0,
          errors_count: 0,
        })
        .select('id')
        .single();
      
      if (jobError) throw jobError;
      
      console.log(`✅ Job created: ${job.id}`);
      return job.id;
      
    } catch (error: any) {
      console.error('[createJob] Error:', error.message);
      throw error;
    }
  },
  
  /**
   * Start a job (mark as running)
   */
  async startJob(jobId: string): Promise<void> {
    const supabase = createScraperClient();
    
    const { error } = await supabase
      .from('scraping_jobs')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .eq('id', jobId);
    
    if (error) {
      console.error('[startJob] Error:', error.message);
      throw error;
    }
  },
  
  /**
   * Update job progress
   */
  async updateProgress(params: UpdateJobProgressParams): Promise<void> {
    const supabase = createScraperClient();
    
    const { error } = await supabase
      .from('scraping_jobs')
      .update({
        products_fetched: params.productsFetched,
        products_saved: params.productsSaved,
        products_skipped: params.productsSkipped,
        errors_count: params.errorsCount,
      })
      .eq('id', params.jobId);
    
    if (error) {
      console.error('[updateProgress] Error:', error.message);
    }
  },
  
  /**
   * Complete a job
   */
  async completeJob(params: CompleteJobParams): Promise<void> {
    const supabase = createScraperClient();
    
    const { error } = await supabase
      .from('scraping_jobs')
      .update({
        status: params.status,
        ended_at: new Date().toISOString(),
        products_fetched: params.result.productsFetched,
        products_saved: params.result.productsValid,
        products_skipped: params.result.productsSkipped,
        products_updated: 0, // Not tracked in ScrapingResult
        errors_count: params.result.errorsCount,
        quality_score: params.result.qualityScore,
        logs: [], // Not tracked in ScrapingResult
      })
      .eq('id', params.jobId);
    
    if (error) {
      console.error('[completeJob] Error:', error.message);
      throw error;
    }
  },
  
  /**
   * Save products to database WITH NORMALIZATION
   * 
   * Session 3: Integrated intelligent normalization
   */
async saveProducts(
  products: ShopifyProduct[],
  siteUrl: string,
  jobId: string,
  sourceLocale?: Locale,
  extractionPatterns?: ExtractionPatterns | null
): Promise<{ saved: number; updated: number; skipped: number; attributes: number }> {
    const supabase = createScraperClient();
    const normalizedUrl = normalizeUrl(siteUrl);
    
    let saved = 0;
    let updated = 0;
    let skipped = 0;
    let attributesTotal = 0;
    
    console.log(`\n💾 Saving ${products.length} products with normalization...`);
    
    for (const product of products) {
      try {
        // ========================================================================
        // STEP 1: Extract terms from Shopify tags
        // ========================================================================
        const extractedTerms = extractTermsFromShopify(product, sourceLocale);
        
        console.log(`   📝 Product: ${product.title}`);
        console.log(`      Extracted: materials=${extractedTerms.materials.length}, colors=${extractedTerms.colors.length}, patterns=${extractedTerms.patterns.length}`);
        
        // ========================================================================
        // STEP 2: Normalize using dictionary
        // ========================================================================
        const normalized = await normalizeTextile({
          name: product.title,
          description: product.body_html,
          extractedTerms,
          sourcePlatform: normalizedUrl,
          productId: product.id.toString(),
          imageUrl: product.images[0]?.src,
          productUrl: `https://${normalizedUrl}/products/${product.handle}`
        });
        
        console.log(`      Normalized: material=${normalized.material?.value || 'null'}, color=${normalized.color?.value || 'null'}, pattern=${normalized.pattern?.value || 'null'}`);
        
        if (Object.keys(normalized.unknowns).length > 0) {
          console.log(`      ⚠️  Unknowns: ${JSON.stringify(normalized.unknowns)}`);
        }
        
        // ========================================================================
        // STEP 3: Calculate quality score
        // ========================================================================
        const qualityScore = calculateQualityScore(product, normalized);
        
        // ========================================================================
        // STEP 3.5: Extract dimensions using patterns
        // ========================================================================
        const dimensions = extractDimensions(product, extractionPatterns ?? null);
        
        if (dimensions.length || dimensions.width || dimensions.weight) {
          console.log(`      📏 Dimensions: length=${dimensions.length?.value || '-'}${dimensions.length?.unit || ''}, width=${dimensions.width?.value || '-'}${dimensions.width?.unit || ''}, weight=${dimensions.weight?.value || '-'}${dimensions.weight?.unit || ''}`);
        }

       // ========================================================================
        // STEP 4: Analyze variants (NEW - ADR-025)
        // ========================================================================
        const variantAnalysis = analyzeVariants(product);
        
        if (variantAnalysis.saleType !== 'by_piece') {
          console.log(`      🔍 Variants: ${variantAnalysis.availableVariantCount}/${variantAnalysis.totalVariantCount} available, type=${variantAnalysis.saleType}`);
          if (variantAnalysis.pricePerMeter) {
            console.log(`      💰 Price/m: ${variantAnalysis.pricePerMeter}€`);
          }
          if (variantAnalysis.maxLength) {
            console.log(`      📏 Max length: ${variantAnalysis.maxLength}m`);
          }
        }

        // ========================================================================
        // STEP 5: Map to database schema
        // ========================================================================
        // Use variant analysis for availability and pricing
        const bestVariant = variantAnalysis.bestVariant || product.variants[0];
        const price = variantAnalysis.minPrice ?? parseFloat(bestVariant?.price || '0');

        // Determine quantity: prefer variant analysis, then extraction patterns, then default
        let quantityValue: number = 1;
        let quantityUnit: string = 'unit';
        
        if (variantAnalysis.maxLength !== null && variantAnalysis.maxLength > 0) {
          // From variant analysis (e.g., Nona Source option2)
          quantityValue = variantAnalysis.maxLength;
          quantityUnit = 'm';
        } else if (dimensions.length?.value) {
          // From extraction patterns (e.g., tags "3M")
          quantityValue = dimensions.length.value;
          quantityUnit = dimensions.length.unit || 'm';
        } else if (bestVariant?.inventory_quantity && bestVariant.inventory_quantity > 0) {
          // From inventory
          quantityValue = bestVariant.inventory_quantity;
          quantityUnit = 'unit';
        }

        const textileData = {
          // Basic product info
          name: product.title,
          description: product.body_html || '',
          price_value: price,
          price_currency: 'EUR',
          available: variantAnalysis.available,  // ← FIXED: uses variant analysis
          image_url: product.images[0]?.src || null,
          additional_images: product.images.length > 1 ? product.images.slice(1).map(img => img.src) : [],

          // Source tracking
          source_url: `https://${normalizedUrl}/products/${product.handle}`,
          source_platform: normalizedUrl,
          source_product_id: product.id.toString(),
          raw_data: product,
          scraped_at: new Date().toISOString(),

          // Normalized attributes
          material_type: normalized.material?.value || null,
          color: normalized.color?.value || null,
          pattern: normalized.pattern?.value || null,

          // Original values (for traceability)
          material_original: extractedTerms.materials[0] || null,
          color_original: extractedTerms.colors[0] || null,
          pattern_original: extractedTerms.patterns[0] || null,
          tags_original: product.tags,

          // Confidence scores (1.0 if found in dictionary, 0.0 if not)
          material_confidence: normalized.material ? 1.0 : 0.0,
          color_confidence: normalized.color ? 1.0 : 0.0,
          pattern_confidence: normalized.pattern ? 1.0 : 0.0,

          // Supervision flags
          needs_review: Object.keys(normalized.unknowns).length > 0,
          review_reasons: buildReviewReasons(normalized.unknowns),

          // Quality
          data_quality_score: qualityScore,

          // Sale type (NEW - ADR-025)
          sale_type: variantAnalysis.saleType,
          
          // Price per meter (NEW - ADR-025)
          price_per_meter: variantAnalysis.pricePerMeter,

          // Quantity (length) - FIXED: uses variant analysis
          quantity_value: quantityValue,
          quantity_unit: quantityUnit,
          
          // Dimensions from extraction patterns
          width_value: dimensions.width?.value || null,
          width_unit: dimensions.width?.unit || null,
          weight_value: dimensions.weight?.value || bestVariant?.grams || null,
          weight_unit: dimensions.weight?.unit || (bestVariant?.grams ? 'g' : null),
          
          updated_at: new Date().toISOString(),
        };
        
        // ========================================================================
        // STEP 6: UPSERT to database
        // ========================================================================
        const { data, error } = await supabase
          .from('textiles')
          .upsert(textileData, {
            onConflict: 'source_url',
            ignoreDuplicates: false
          })
          .select('id, created_at, updated_at');
        
        if (error) {
          console.error(`   ⚠️  Failed to save product ${product.id}:`, error.message);
          skipped++;
        } else if (data && data.length > 0) {
          const record = data[0];
          const textileId = record.id;
          
          // Determine if INSERT or UPDATE
          const createdAt = new Date(record.created_at).getTime();
          const updatedAt = new Date(record.updated_at).getTime();
          
          if (Math.abs(createdAt - updatedAt) < 1000) {
            saved++;
            console.log(`      ✅ Saved (new)`);
          } else {
            updated++;
            console.log(`      ♻️  Updated (existing)`);
          }

          // ================================================================
          // STEP 7: DUAL-WRITE to textile_attributes
          // ================================================================
          const attrCount = await saveTextileAttributes(
            supabase,
            textileId,
            normalized,
            extractedTerms,
            sourceLocale
          );
          if (attrCount > 0) {
            attributesTotal += attrCount;
            console.log(`      📊 Attributes: ${attrCount} saved`);
          }

        } else {
          skipped++;
        }
        
        // Progress indicator
        if ((saved + updated + skipped) % 10 === 0) {
          console.log(`\n   📊 Progress: ${saved + updated + skipped}/${products.length}`);
        }
        
      } catch (error: any) {
        console.error(`   ⚠️  Error processing product ${product.id}:`, error.message);
        console.error(error.stack);
        skipped++;
      }
    }
    
    console.log(`\n✅ Save complete:`);
    console.log(`   New: ${saved}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Attributes: ${attributesTotal}`);
    console.log(`   Normalization coverage: ${Math.round((saved + updated) / (saved + updated + skipped) * 100)}%\n`);
    
    return { saved, updated, skipped, attributes: attributesTotal };
  },
  
  /**
   * Get scraping statistics for a site
   */
  async getSiteStats(siteUrl: string): Promise<{
    totalJobs: number;
    completedJobs: number;
    totalProductsScraped: number;
    lastScrapedAt: string | null;
  }> {
    const supabase = createScraperClient();
    const normalizedUrl = normalizeUrl(siteUrl);
    
    try {
      const { data: site } = await supabase
        .from('sites')
        .select('id')
        .eq('url', normalizedUrl)
        .single();
      
      if (!site) {
        return {
          totalJobs: 0,
          completedJobs: 0,
          totalProductsScraped: 0,
          lastScrapedAt: null,
        };
      }
      
      const { data: jobs } = await supabase
        .from('scraping_jobs')
        .select('status, products_saved, ended_at')
        .eq('site_id', site.id);
      
      const totalJobs = jobs?.length || 0;
      const completedJobs = jobs?.filter(j => j.status === 'completed').length || 0;
      const totalProductsScraped = jobs?.reduce((sum, j) => sum + (j.products_saved || 0), 0) || 0;
      const lastScrapedAt = jobs && jobs.length > 0
        ? jobs.sort((a, b) => new Date(b.ended_at || 0).getTime() - new Date(a.ended_at || 0).getTime())[0].ended_at
        : null;
      
      return {
        totalJobs,
        completedJobs,
        totalProductsScraped,
        lastScrapedAt,
      };
      
    } catch (error: any) {
      console.error('[getSiteStats] Error:', error.message);
      return {
        totalJobs: 0,
        completedJobs: 0,
        totalProductsScraped: 0,
        lastScrapedAt: null,
      };
    }
  },
};
