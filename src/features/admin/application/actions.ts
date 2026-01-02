// src/features/admin/application/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { discoveryService } from '@/features/admin/services/discoveryService';
import { scrapingService } from '@/features/admin/services/scrapingService';
import { sitesRepo } from '../infrastructure/sitesRepo';
import { createClient } from '@/lib/supabase/client';
import type { Site } from '../domain/types';

/**
 * Trigger discovery for a site
 */
export async function triggerDiscovery(siteUrl: string) {
  try {
    console.log(`[Action] Triggering discovery for ${siteUrl}...`);
    
    const profile = await discoveryService.discoverSite(siteUrl);
    
    revalidatePath('/admin');
    revalidatePath('/admin/sites');
    
    return {
      success: true,
      profile,
      message: `Discovery completed: ${profile.collections.length} collections found`,
    };
  } catch (error: any) {
    console.error('[Action] Discovery error:', error);
    return {
      success: false,
      error: error.message || 'Discovery failed',
    };
  }
}

/**
 * Trigger scraping for a site (preview mode)
 */
export async function triggerPreviewScraping(
  siteId: string,
  collectionHandle: string
) {
  try {
    console.log(`[Action] Triggering preview scraping for site ${siteId}...`);
    
    // Get site and profile
    const supabase = createClient();
    const { data: site } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single();
    
    if (!site) {
      throw new Error('Site not found');
    }

    // Get profile
    const { data: profile } = await supabase
      .from('site_profiles')
      .select('*')
      .eq('site_id', siteId)
      .order('discovered_at', { ascending: false })
      .limit(1)
      .single();

    if (!profile) {
      throw new Error('Site profile not found. Run discovery first.');
    }
    
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
    
    // Get site and profile
    const supabase = createClient();
    const { data: site } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single();
    
    if (!site) {
      throw new Error('Site not found');
    }

    // Get profile
    const { data: profile } = await supabase
      .from('site_profiles')
      .select('*')
      .eq('site_id', siteId)
      .order('discovered_at', { ascending: false })
      .limit(1)
      .single();

    if (!profile) {
      throw new Error('Site profile not found. Run discovery first.');
    }
    
    const result = await scrapingService.scrapeSite(profile, config);
    
    revalidatePath('/admin');
    revalidatePath('/admin/sites');
    revalidatePath('/admin/jobs');
    
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
