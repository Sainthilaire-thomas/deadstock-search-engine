// src/features/admin/application/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { discoveryService } from '@/features/admin/services/discoveryService';
import type { SiteProfile } from '@/features/admin/services/discoveryService';
import { scrapingService } from '@/features/admin/services/scrapingService';
import { sitesRepo } from '../infrastructure/sitesRepo';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Site } from '../domain/types';
import type { Locale } from '@/features/tuning/domain/types';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Map database profile to SiteProfile format expected by scrapingService
 */
function mapDbProfileToSiteProfile(dbProfile: any, siteUrl: string): SiteProfile {
  return {
    siteUrl: siteUrl,
    platform: dbProfile.is_shopify ? 'shopify' : 'unknown',
    isShopify: dbProfile.is_shopify ?? true,
    discoveredAt: new Date(dbProfile.discovered_at),
    validUntil: new Date(dbProfile.valid_until),
    collections: dbProfile.collections || [],
    sampleProducts: dbProfile.sample_products || [],
    dataStructure: dbProfile.data_structure || {},
    qualityMetrics: dbProfile.quality_metrics || {},
    recommendations: dbProfile.recommendations || [],
    totalCollections: dbProfile.total_collections || 0,
    relevantCollections: dbProfile.relevant_collections || 0,
    estimatedProducts: dbProfile.estimated_products || 0,
    estimatedAvailable: dbProfile.estimated_available || 0,
    globalAnalysis: dbProfile.global_analysis || {
      allProductTypes: [],
      allTags: [],
      allVendors: [],
      priceDistribution: { under10: 0, from10to30: 0, from30to50: 0, from50to100: 0, over100: 0 },
      priceStats: null,
      weightStats: null,
      availabilityRate: 0,
      deadstockScore: { score: 0, grade: 'F', factors: {}, recommendations: [] },
    },
    // NOUVEAU - Extraction patterns
    extractionPatterns: dbProfile.extraction_patterns || {
      patterns: [],
      analyzedAt: new Date().toISOString(),
      productsAnalyzed: 0,
    },
  };
}

// ============================================================================
// DISCOVERY
// ============================================================================

/**
 * Trigger discovery for a site
 */
export async function triggerDiscovery(siteUrl: string) {
  try {
    console.log(`[Action] Triggering discovery for ${siteUrl}...`);

    const supabase = createAdminClient();

    // 1. Find the site by URL
    const cleanUrl = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    const { data: sites, error: siteError } = await supabase
      .from('sites')
      .select('id, url')
      .or(`url.ilike.%${cleanUrl}%,url.eq.${siteUrl}`);

    if (siteError) {
      console.error('[Action] Error finding site:', siteError);
      throw new Error(`Database error: ${siteError.message}`);
    }

    if (!sites || sites.length === 0) {
      throw new Error(`Site not found for URL: ${siteUrl}`);
    }

    const site = sites[0];
    console.log(`[Action] Found site: ${site.id}`);

    return await performDiscovery(site.id, siteUrl, supabase);
  } catch (error: any) {
    console.error('[Action] Discovery error:', error);
    return {
      success: false,
      error: error.message || 'Discovery failed',
    };
  }
}

/**
 * Perform the actual discovery and save profile
 */
async function performDiscovery(siteId: string, siteUrl: string, supabase: any) {
  // 1. Run discovery service
  const profile = await discoveryService.discoverSite(siteUrl);

  console.log(`[Action] Discovery returned ${profile.collections.length} collections`);

  // 2. Delete old profile if exists
  const { error: deleteError } = await supabase
    .from('site_profiles')
    .delete()
    .eq('site_id', siteId);

  if (deleteError) {
    console.warn('[Action] Error deleting old profile (may not exist):', deleteError.message);
  }

  // 3. Save new profile to database
const profileData = {
  site_id: siteId,
  discovered_at: profile.discoveredAt.toISOString(),
  valid_until: profile.validUntil.toISOString(),
  profile_version: 1,
  collections: profile.collections,
  sample_products: profile.sampleProducts.slice(0, 10),
  data_structure: profile.dataStructure,
  quality_metrics: profile.qualityMetrics,
  recommendations: profile.recommendations,
  is_shopify: profile.isShopify,
  total_collections: profile.totalCollections,
  relevant_collections: profile.relevantCollections,
  estimated_products: profile.estimatedProducts,
  estimated_available: profile.estimatedAvailable,
  global_analysis: profile.globalAnalysis,
  extraction_patterns: profile.extractionPatterns,  // ← AJOUTER CETTE LIGNE
  needs_rediscovery: false,
  rediscovery_reason: null,
};
  console.log('[Action] Saving profile:', {
    site_id: profileData.site_id,
    collections_count: profileData.collections.length,
    total_collections: profileData.total_collections,
  });

  const { data: insertedProfile, error: insertError } = await supabase
    .from('site_profiles')
    .insert(profileData)
    .select()
    .single();

  if (insertError) {
    console.error('[Action] Failed to save profile:', insertError);
    throw new Error(`Failed to save profile: ${insertError.message}`);
  }

  console.log('[Action] Profile saved successfully:', insertedProfile.id);

  // 4. Update site status
  const { error: updateError } = await supabase
    .from('sites')
    .update({
      status: 'discovered',
      discovery_completed_at: new Date().toISOString(),
    })
    .eq('id', siteId);

  if (updateError) {
    console.warn('[Action] Error updating site status:', updateError.message);
  }

  // 5. Revalidate paths
  revalidatePath('/admin');
  revalidatePath('/admin/sites');
  revalidatePath(`/admin/sites/${siteId}`);
  revalidatePath(`/admin/sites/${siteId}/configure`);

  return {
    success: true,
    profile,
    message: `Discovery completed: ${profile.collections.length} collections found`,
  };
}

// ============================================================================
// SCRAPING
// ============================================================================

/**
 * Trigger scraping for a site (preview mode)
 */
export async function triggerPreviewScraping(
  siteId: string,
  collectionHandle: string
) {
  try {
    console.log(`[Action] Triggering preview scraping for site ${siteId}...`);

    const supabase = createAdminClient();

    // Get site
    const { data: site } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single();

    if (!site) {
      throw new Error('Site not found');
    }

    // Get profile (most recent)
    const { data: dbProfile } = await supabase
      .from('site_profiles')
      .select('*')
      .eq('site_id', siteId)
      .order('discovered_at', { ascending: false })
      .limit(1)
      .single();

    if (!dbProfile) {
      throw new Error('Site profile not found. Run discovery first.');
    }

    // Map DB profile to SiteProfile format
    const profile = mapDbProfileToSiteProfile(dbProfile, site.url);

    const results = await scrapingService.previewScraping(profile, collectionHandle);

    return {
      success: true,
      results,
      message: `Preview completed: ${results.productsFetched} products found`,
    };
  } catch (error: any) {
    console.error('[Action] Preview scraping error:', error);
    return {
      success: false,
      error: error.message || 'Preview scraping failed',
    };
  }
}

/**
 * Trigger full scraping for a site
 */
export async function triggerFullScraping(
  siteId: string,
  config?: {
    collections?: string[];
    maxProductsPerCollection?: number;
  }
) {
  try {
    console.log(`[Action] Triggering full scraping for site ${siteId}...`);

    const supabase = createAdminClient();

    // Get site
    const { data: site } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single();

    if (!site) {
      throw new Error('Site not found');
    }

    // Get profile (most recent)
    const { data: dbProfile } = await supabase
      .from('site_profiles')
      .select('*')
      .eq('site_id', siteId)
      .order('discovered_at', { ascending: false })
      .limit(1)
      .single();

    if (!dbProfile) {
      throw new Error('Site profile not found. Run discovery first.');
    }

    // Map DB profile to SiteProfile format
    const profile = mapDbProfileToSiteProfile(dbProfile, site.url);

    const result = await scrapingService.scrapeSite(profile, {
  ...config,
  sourceLocale: site.source_locale as Locale,
});

    revalidatePath('/admin');
    revalidatePath('/admin/sites');
    revalidatePath('/admin/jobs');
    revalidatePath(`/admin/sites/${siteId}`);

    return {
      success: true,
      result,
      message: `Scraping completed: ${result.productsValid} products saved`,
    };
  } catch (error: any) {
    console.error('[Action] Scraping error:', error);
    return {
      success: false,
      error: error.message || 'Scraping failed',
    };
  }
}

// ============================================================================
// SITE MANAGEMENT
// ============================================================================

/**
 * Create a new site
 */
export async function createSite(siteData: {
  name: string;
  url: string;
  platform_type: 'shopify' | 'woocommerce' | 'custom';
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
}) {
  try {
   const site = await sitesRepo.createSite({
  ...siteData,
  status: 'new',
  priority: siteData.priority || 'medium',
  discovery_completed_at: null,
  last_scraped_at: null,
  scraping_config: null,
  quality_score: null,
  notes: siteData.notes || null,
  source_locale: 'fr',  // ← NOUVEAU - Default to French
});

    revalidatePath('/admin/sites');

    return {
      success: true,
      site,
      message: 'Site created successfully',
    };
  } catch (error: any) {
    console.error('[Action] Create site error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create site',
    };
  }
}

/**
 * Update a site
 */
export async function updateSite(siteId: string, updates: Partial<Site>) {
  try {
    const site = await sitesRepo.updateSite(siteId, updates);

    revalidatePath('/admin/sites');
    revalidatePath(`/admin/sites/${siteId}`);

    return {
      success: true,
      site,
      message: 'Site updated successfully',
    };
  } catch (error: any) {
    console.error('[Action] Update site error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update site',
    };
  }
}

/**
 * Delete a site
 */
export async function deleteSite(siteId: string) {
  try {
    await sitesRepo.deleteSite(siteId);

    revalidatePath('/admin/sites');

    return {
      success: true,
      message: 'Site deleted successfully',
    };
  } catch (error: any) {
    console.error('[Action] Delete site error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete site',
    };
  }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Save scraping configuration for a site
 */
export async function saveScrapingConfig(
  siteId: string,
  config: {
    selectedCollections: string[];
    maxProductsPerCollection: number;
    filters: {
      minPrice?: number;
      maxPrice?: number;
      requireImages?: boolean;
      onlyAvailable?: boolean;
      requirePrice?: boolean;
    };
  }
) {
  try {
    console.log(`[Action] Saving scraping config for site ${siteId}...`);

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('sites')
      .update({
        scraping_config: config,
      })
      .eq('id', siteId);

    if (error) {
      throw new Error(`Failed to save config: ${error.message}`);
    }

    revalidatePath(`/admin/sites/${siteId}`);
    revalidatePath(`/admin/sites/${siteId}/configure`);

    return {
      success: true,
      message: 'Configuration saved successfully',
    };
  } catch (error: any) {
    console.error('[Action] Save config error:', error);
    return {
      success: false,
      error: error.message || 'Failed to save configuration',
    };
  }
}
