/**
 * Discovery Repository
 * 
 * Purpose: Persist and retrieve site discovery profiles from database
 * Cache Strategy: 6 months validity, profiles rarely expire
 */

import { createClient } from '@supabase/supabase-js';
import type { SiteProfile, CollectionData, QualityMetrics, DataStructure, Recommendation } from '../services/discoveryService';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Normalize URL to avoid duplicates
 * Removes protocol (https://) and trailing slash
 */
function normalizeUrl(url: string): string {
  let normalized = url.trim();
  
  // Remove protocol
  normalized = normalized.replace(/^https?:\/\//, '');
  
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');
  
  return normalized;
}

// ============================================================================
// TYPES
// ============================================================================

interface DbSiteProfile {
  id: string;
  site_id: string;
  discovered_at: string;
  valid_until: string;
  profile_version: number;
  collections: any;
  sample_products: any;
  data_structure: any;
  quality_metrics: any;
  recommendations: any;
  is_shopify: boolean;
  total_collections: number;
  relevant_collections: number;
  estimated_products: number;
  needs_rediscovery: boolean;
  rediscovery_reason: string | null;
  created_at: string;
  sites?: {
    url: string;
  };
  // NOUVEAU - Champs ajoutés
  estimated_available?: number;
  global_analysis?: any;
  extraction_patterns?: any;
   sale_type_detection?: any;
}

interface DbSite {
  id: string;
  url: string;
  name: string;
  platform_type: string;
  status: string;
  priority: string;
  discovery_completed_at: string | null;
  last_scraped_at: string | null;
  quality_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
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
      schema: 'deadstock', // Use deadstock schema instead of public
    },
  });
}

// ============================================================================
// REPOSITORY
// ============================================================================

export const discoveryRepo = {
  
  /**
   * Save a discovery profile to database
   * Creates or updates site, then saves profile
   */
async saveProfile(profile: SiteProfile): Promise<void> {
  const supabase = createScraperClient();
  
  try {
    const normalizedUrl = normalizeUrl(profile.siteUrl);
    console.log(`[saveProfile] Normalized URL: ${normalizedUrl}`);
    
    // Step 1: Upsert site
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .upsert({
        url: normalizedUrl,
        name: normalizedUrl.split('.')[0],
        platform_type: 'shopify',
        status: 'discovered',
        discovery_completed_at: profile.discoveredAt.toISOString(),
        quality_score: profile.qualityMetrics.overallScore,
      }, { 
        onConflict: 'url',
        ignoreDuplicates: false 
      })
      .select()
      .single();
    
    if (siteError) {
      console.error('[saveProfile] Site upsert error:', siteError);
      throw new Error(`Failed to upsert site: ${siteError.message}`);
    }
    
    console.log(`[saveProfile] Site upserted, ID: ${site.id}`);
    
    // Step 2: Insert profile
    console.log('[saveProfile] Inserting profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('site_profiles')
      .insert({
        site_id: site.id,
        discovered_at: profile.discoveredAt.toISOString(),
        valid_until: profile.validUntil.toISOString(),
        profile_version: 1,
        collections: profile.collections,
        sample_products: profile.sampleProducts,
        data_structure: profile.dataStructure,
        quality_metrics: profile.qualityMetrics,
        recommendations: profile.recommendations,
        is_shopify: profile.isShopify,
        total_collections: profile.totalCollections,
        relevant_collections: profile.relevantCollections,
        estimated_products: profile.estimatedProducts,
        needs_rediscovery: false,
      })
      .select(); // ← AJOUT .select() pour voir si ça marche
    
    if (profileError) {
      console.error('[saveProfile] Profile insert error:', profileError);
      throw new Error(`Failed to insert profile: ${profileError.message}`);
    }
    
    console.log(`[saveProfile] Profile inserted:`, profileData);
    console.log(`✅ Profile saved for ${normalizedUrl}`);
  } catch (error: any) {
    console.error('[saveProfile] Error:', error.message);
    throw error;
  }
},
  
  /**
   * Get latest valid profile for a site
   * Returns null if no valid profile exists
   */
  async getProfile(siteUrl: string): Promise<SiteProfile | null> {
    const supabase = createScraperClient();
    
    try {
      const normalizedUrl = normalizeUrl(siteUrl);
      
      const { data, error } = await supabase
        .from('site_profiles')
        .select(`
          *,
          sites!inner (url)
        `)
        .eq('sites.url', normalizedUrl)
        .gte('valid_until', new Date().toISOString())
        .order('discovered_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }
      
      if (!data) {
        return null;
      }
      
      return this.toDomain(data);
    } catch (error: any) {
      console.error('[getProfile] Error:', error.message);
      return null;
    }
  },
  
  /**
   * Get all valid profiles (not expired)
   * Sorted by quality score descending
   */
  async getValidProfiles(): Promise<SiteProfile[]> {
    const supabase = createScraperClient();
    
    try {
      const { data, error } = await supabase
        .from('site_profiles')
        .select(`
          *,
          sites!inner (url)
        `)
        .gte('valid_until', new Date().toISOString())
        .order('quality_metrics->overallScore', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        return [];
      }
      
      return data.map(d => this.toDomain(d));
    } catch (error: any) {
      console.error('[getValidProfiles] Error:', error.message);
      return [];
    }
  },
  
  /**
   * Get expired profiles (need re-discovery)
   */
  async getExpiredProfiles(): Promise<SiteProfile[]> {
    const supabase = createScraperClient();
    
    try {
      const { data, error } = await supabase
        .from('site_profiles')
        .select(`
          *,
          sites!inner (url)
        `)
        .or(`valid_until.lt.${new Date().toISOString()},needs_rediscovery.eq.true`)
        .order('valid_until', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        return [];
      }
      
      return data.map(d => this.toDomain(d));
    } catch (error: any) {
      console.error('[getExpiredProfiles] Error:', error.message);
      return [];
    }
  },
  
  /**
   * Mark a profile as needing re-discovery
   */
  async markNeedsRediscovery(
    siteUrl: string, 
    reason: 'manual' | 'errors' | 'scheduled' | 'structure_changed'
  ): Promise<void> {
    const supabase = createScraperClient();
    
    try {
      const normalizedUrl = normalizeUrl(siteUrl);
      
      // Get site ID
      const { data: site, error: siteError } = await supabase
        .from('sites')
        .select('id')
        .eq('url', normalizedUrl)
        .single();
      
      if (siteError || !site) {
        throw new Error(`Site not found: ${normalizedUrl}`);
      }
      
      // Update latest profile
      const { error: updateError } = await supabase
        .from('site_profiles')
        .update({
          needs_rediscovery: true,
          rediscovery_reason: reason,
        })
        .eq('site_id', site.id)
        .order('discovered_at', { ascending: false })
        .limit(1);
      
      if (updateError) {
        throw updateError;
      }
      
      console.log(`✅ Marked ${normalizedUrl} for re-discovery (reason: ${reason})`);
    } catch (error: any) {
      console.error('[markNeedsRediscovery] Error:', error.message);
      throw error;
    }
  },
  
  /**
   * Get site by URL
   */
  async getSite(siteUrl: string): Promise<DbSite | null> {
    const supabase = createScraperClient();
    
    try {
      const normalizedUrl = normalizeUrl(siteUrl);
      
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('url', normalizedUrl)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error('[getSite] Error:', error.message);
      return null;
    }
  },
  
  /**
   * List all sites
   */
  async listSites(): Promise<DbSite[]> {
    const supabase = createScraperClient();
    
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error: any) {
      console.error('[listSites] Error:', error.message);
      return [];
    }
  },
  
  // ============================================================================
  // MAPPERS
  // ============================================================================
  
  /**
   * Convert database row to domain model
   */
toDomain(data: DbSiteProfile): SiteProfile {
    return {
      siteUrl: data.sites?.url || '',
      platform: data.is_shopify ? 'shopify' : 'unknown',
      isShopify: data.is_shopify,
      discoveredAt: new Date(data.discovered_at),
      validUntil: new Date(data.valid_until),
      collections: data.collections as CollectionData[],
      sampleProducts: data.sample_products,
      dataStructure: data.data_structure as DataStructure,
      qualityMetrics: data.quality_metrics as QualityMetrics,
      recommendations: data.recommendations as Recommendation[],
      totalCollections: data.total_collections,
      relevantCollections: data.relevant_collections,
      estimatedProducts: data.estimated_products,
      estimatedAvailable: data.estimated_available || 0,
      globalAnalysis: data.global_analysis || {
        allProductTypes: [],
        allTags: [],
        allVendors: [],
        priceDistribution: { under10: 0, from10to30: 0, from30to50: 0, from50to100: 0, over100: 0 },
        priceStats: null,
        weightStats: null,
        availabilityRate: 0,
        deadstockScore: { score: 0, grade: 'F', factors: {}, recommendations: [] },
      },
      extractionPatterns: data.extraction_patterns || {
        patterns: [],
        analyzedAt: new Date().toISOString(),
        productsAnalyzed: 0,
      },
       saleTypeDetection: data.sale_type_detection || {
        dominantType: 'unknown',
        confidence: 0,
        evidence: {
          hasMultipleVariants: false,
          hasLengthInOptions: false,
          hasCuttingOption: false,
          priceVariation: 0,
          sampleSize: 0,
        },
        detectedAt: new Date().toISOString(),
      },
    };
  },
};
