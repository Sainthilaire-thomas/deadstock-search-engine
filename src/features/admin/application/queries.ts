// src/features/admin/application/queries.ts
import { createAdminClient } from '@/lib/supabase/admin';
import type { AdminMetrics } from '../domain/types';

/**
 * Get admin dashboard metrics
 * Server-side only
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  const supabase = createAdminClient(); // ← Utilise admin client

  // Total sites
  const { count: totalSites } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true });

  // Active sites
  const { count: activeSites } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })
    .in('status', ['discovered', 'active']);

  // Total textiles
  const { count: totalTextiles } = await supabase
    .from('textiles')
    .select('*', { count: 'exact', head: true });

  // Total jobs
  const { count: totalJobs } = await supabase
    .from('scraping_jobs')
    .select('*', { count: 'exact', head: true });

  // Recent jobs (last 24h)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentJobs } = await supabase
    .from('scraping_jobs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday);

  // Average quality score
  const { data: qualityData } = await supabase
    .from('textiles')
    .select('data_quality_score');
  
  const avgQualityScore = qualityData && qualityData.length > 0
    ? Math.round(
        qualityData.reduce((sum: number, t: any) => sum + (t.data_quality_score || 0), 0) / qualityData.length
      )
    : 0;

  // Pending unknowns
  const { count: pendingUnknowns } = await supabase
    .from('unknown_terms')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Last scraping
  const { data: lastJob } = await supabase
    .from('scraping_jobs')
    .select('ended_at')
    .eq('status', 'completed')
    .order('ended_at', { ascending: false })
    .limit(1)
    .single();

  return {
    totalSites: totalSites || 0,
    activeSites: activeSites || 0,
    totalTextiles: totalTextiles || 0,
    totalJobs: totalJobs || 0,
    recentJobs: recentJobs || 0,
    avgQualityScore,
    pendingUnknowns: pendingUnknowns || 0,
    lastScrapingAt: lastJob?.ended_at || null,
  };
}

/**
 * Get all sites (server-side)
 */
export async function getAllSites() {
  const supabase = createAdminClient(); // ← Utilise admin client
  
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sites:', error);
    throw new Error(`Failed to fetch sites: ${error.message}`);
  }

  return data || [];
}

/**
 * Get recent jobs (server-side)
 */
export async function getRecentJobsWithSites(limit = 10) {
  const supabase = createAdminClient(); // ← Utilise admin client
  
  const { data: jobs, error } = await supabase
    .from('scraping_jobs')
    .select(`
      *,
      site:sites(id, name, url, platform_type)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent jobs:', error);
    throw new Error(`Failed to fetch recent jobs: ${error.message}`);
  }

  return jobs || [];
}

/**
 * Get site by ID with profile (server-side)
 */
export async function getSiteByIdServer(siteId: string) {
  const supabase = createAdminClient(); // ← Utilise admin client
  
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
  const { data: profiles, error: profileError } = await supabase
    .from('site_profiles')
    .select('*')
    .eq('site_id', siteId)
    .order('discovered_at', { ascending: false })
    .limit(1);

  console.log('Profile query result:', { profiles, profileError, siteId });

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
    profile: profiles && profiles.length > 0 ? profiles[0] : undefined,
    jobsCount: jobsCount || 0,
    textilesCount: textilesCount || 0,
  };
}
