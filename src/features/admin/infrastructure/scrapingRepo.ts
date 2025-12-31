/**
 * Scraping Repository
 * 
 * Purpose: Persist scraping jobs and products to database
 * Tables: scraping_jobs, textiles
 */

import { createClient } from '@supabase/supabase-js';
import type { ShopifyProduct, ScrapingConfig, ScrapingResult } from '../services/scrapingService';

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
      // Get site ID
      const { data: site, error: siteError } = await supabase
        .from('sites')
        .select('id')
        .eq('url', normalizedUrl)
        .single();
      
      if (siteError || !site) {
        throw new Error(`Site not found: ${normalizedUrl}`);
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
      
      if (jobError || !job) {
        throw new Error(`Failed to create job: ${jobError?.message}`);
      }
      
      console.log(`✅ Scraping job created: ${job.id}`);
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
    
    try {
      const { error } = await supabase
        .from('scraping_jobs')
        .update({
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .eq('id', jobId);
      
      if (error) {
        throw new Error(`Failed to start job: ${error.message}`);
      }
      
      console.log(`▶️  Job started: ${jobId}`);
      
    } catch (error: any) {
      console.error('[startJob] Error:', error.message);
      throw error;
    }
  },
  
  /**
   * Update job progress
   */
  async updateJobProgress(params: UpdateJobProgressParams): Promise<void> {
    const supabase = createScraperClient();
    
    try {
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
        console.error('[updateJobProgress] Error:', error.message);
      }
      
    } catch (error: any) {
      console.error('[updateJobProgress] Error:', error.message);
    }
  },
  
  /**
   * Complete a job
   */
  async completeJob(params: CompleteJobParams): Promise<void> {
    const supabase = createScraperClient();
    
    try {
      const { error } = await supabase
        .from('scraping_jobs')
        .update({
          status: params.status,
          ended_at: new Date().toISOString(),
          products_fetched: params.result.productsFetched,
          products_saved: params.result.productsValid,
          products_skipped: params.result.productsSkipped,
          errors_count: params.result.errorsCount,
          quality_score: params.result.qualityScore,
          error_details: params.result.errors.length > 0 ? params.result.errors : null,
        })
        .eq('id', params.jobId);
      
      if (error) {
        throw new Error(`Failed to complete job: ${error.message}`);
      }
      
      const statusEmoji = params.status === 'completed' ? '✅' : params.status === 'partial' ? '⚠️' : '❌';
      console.log(`${statusEmoji} Job ${params.status}: ${params.jobId}`);
      
    } catch (error: any) {
      console.error('[completeJob] Error:', error.message);
      throw error;
    }
  },
  
  /**
   * Get a job by ID
   */
  async getJob(jobId: string): Promise<DbScrapingJob | null> {
    const supabase = createScraperClient();
    
    try {
      const { data, error } = await supabase
        .from('scraping_jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      return data;
      
    } catch (error: any) {
      console.error('[getJob] Error:', error.message);
      return null;
    }
  },
  
  /**
   * List jobs for a site
   */
  async listJobs(siteUrl: string, limit: number = 10): Promise<DbScrapingJob[]> {
    const supabase = createScraperClient();
    const normalizedUrl = normalizeUrl(siteUrl);
    
    try {
      const { data, error } = await supabase
        .from('scraping_jobs')
        .select(`
          *,
          sites!inner (url)
        `)
        .eq('sites.url', normalizedUrl)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        throw error;
      }
      
      return data || [];
      
    } catch (error: any) {
      console.error('[listJobs] Error:', error.message);
      return [];
    }
  },
  
  /**
   * Save products to textiles table
   * 
   * Uses UPSERT to handle both new products and updates
   * Maps Shopify product structure to textiles schema
   */
  async saveProducts(
    products: ShopifyProduct[],
    siteUrl: string,
    jobId: string
  ): Promise<{ saved: number; updated: number; skipped: number }> {
    const supabase = createScraperClient();
    const normalizedUrl = normalizeUrl(siteUrl);
    
    let saved = 0;
    let updated = 0;
    let skipped = 0;
    
    console.log(`\n💾 Saving ${products.length} products to database...`);
    
    for (const product of products) {
      try {
        // Extract first variant price
        const price = parseFloat(product.variants[0]?.price || '0');
        
        // Map Shopify product to textiles schema
        const textileData = {
          name: product.title,
          description: product.body_html || '',
          price_value: price,
          price_currency: 'EUR', // TODO: detect from site
          available: product.variants[0]?.available || false,
          image_url: product.images[0]?.src || null,
          additional_images: product.images.slice(1).map(img => img.src),
          source_url: `https://${normalizedUrl}/products/${product.handle}`,
          source_platform: normalizedUrl,
          source_product_id: product.id.toString(),
          raw_data: product,
          scraped_at: new Date().toISOString(),
          quantity_value: product.variants[0]?.inventory_quantity || 1,
          quantity_unit: 'unit',
          updated_at: new Date().toISOString(),
        };
        
        // UPSERT: Insert or update if source_url already exists
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
          
          // Determine if INSERT or UPDATE
          // If created_at === updated_at → new INSERT
          // Otherwise → UPDATE
          const createdAt = new Date(record.created_at).getTime();
          const updatedAt = new Date(record.updated_at).getTime();
          
          if (Math.abs(createdAt - updatedAt) < 1000) {
            // Less than 1 second difference → INSERT
            saved++;
          } else {
            // UPDATE
            updated++;
          }
        } else {
          // Edge case: no error but no data
          skipped++;
        }
        
        // Progress indicator
        if ((saved + updated + skipped) % 10 === 0) {
          console.log(`   Progress: ${saved + updated + skipped}/${products.length}`);
        }
        
      } catch (error: any) {
        console.error(`   ⚠️  Error saving product ${product.id}:`, error.message);
        skipped++;
      }
    }
    
    console.log(`\n✅ Save complete:`);
    console.log(`   New: ${saved}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}\n`);
    
    return { saved, updated, skipped };
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
      // Get site
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
      
      // Get jobs stats
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
