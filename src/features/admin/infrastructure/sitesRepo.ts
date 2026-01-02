// src/features/admin/infrastructure/sitesRepo.ts
import { createClient } from '@/lib/supabase/client';
import type { Site, SiteWithProfile } from '../domain/types';

/**
 * IMPORTANT: Ce repo peut être appelé côté client OU serveur
 * Pour les Server Components, utilisez directement les queries dans application/queries.ts
 */

export const sitesRepo = {
  /**
   * Get all sites with optional filters
   */
  async getAllSites(): Promise<Site[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sites:', error);
      throw new Error(`Failed to fetch sites: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get site by ID with profile (CLIENT-SIDE ONLY)
   * For server-side, use getSiteByIdServer from queries.ts
   */
  async getSiteById(siteId: string): Promise<SiteWithProfile | null> {
    const supabase = createClient();
    
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .maybeSingle();

    if (siteError || !site) {
      console.error('Error fetching site:', siteError);
      return null;
    }

    // Get profile if exists
    const { data: profile } = await supabase
      .from('site_profiles')
      .select('*')
      .eq('site_id', siteId)
      .order('discovered_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get jobs count
    const { count: jobsCount } = await supabase
      .from('scraping_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId);

    // Get textiles count
    const { count: textilesCount } = await supabase
      .from('textiles')
      .select('*', { count: 'exact', head: true })
      .eq('source_platform', site.url);

    return {
      ...site,
      profile: profile || undefined,
      jobsCount: jobsCount || 0,
      textilesCount: textilesCount || 0,
    };
  },

  /**
   * Create new site
   */
  async createSite(siteData: Omit<Site, 'id' | 'created_at' | 'updated_at'>): Promise<Site> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('sites')
      .insert([siteData])
      .select()
      .single();

    if (error) {
      console.error('Error creating site:', error);
      throw new Error(`Failed to create site: ${error.message}`);
    }

    return data;
  },

  /**
   * Update site
   */
  async updateSite(siteId: string, updates: Partial<Site>): Promise<Site> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('sites')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', siteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating site:', error);
      throw new Error(`Failed to update site: ${error.message}`);
    }

    return data;
  },

  /**
   * Delete site
   */
  async deleteSite(siteId: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', siteId);

    if (error) {
      console.error('Error deleting site:', error);
      throw new Error(`Failed to delete site: ${error.message}`);
    }
  },

  /**
   * Get sites by status
   */
  async getSitesByStatus(status: Site['status']): Promise<Site[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sites by status:', error);
      throw new Error(`Failed to fetch sites: ${error.message}`);
    }

    return data || [];
  },
};
