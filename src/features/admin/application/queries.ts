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

/**
 * Get coverage statistics by source/site
 * Server-side only
 */
export async function getCoverageBySource() {
  const supabase = createAdminClient();

  // Récupérer tous les textiles avec leur site_id et attributs
  const { data: textiles, error } = await supabase
    .from('textiles_search')
    .select('site_id, fiber, color, pattern, weave, width_value, quantity_value, price_per_meter');

  if (error) {
    console.error('Error fetching coverage data:', error);
    return [];
  }

  // Récupérer les infos des sites
  const { data: sites } = await supabase
    .from('sites')
    .select('id, name');

  const siteNameMap = new Map(sites?.map(s => [s.id, s.name]) || []);

  // Grouper par site_id et calculer les stats
  const bySource = new Map<string, {
    siteId: string;
    siteName: string;
    total: number;
    fiber: number;
    color: number;
    pattern: number;
    weave: number;
    width: number;
    quantity: number;
    price: number;
  }>();

  for (const t of textiles || []) {
    const siteId = t.site_id || 'unknown';
    const existing = bySource.get(siteId) || {
      siteId,
      siteName: siteNameMap.get(siteId) || 'Source inconnue',
      total: 0,
      fiber: 0,
      color: 0,
      pattern: 0,
      weave: 0,
      width: 0,
      quantity: 0,
      price: 0,
    };

    existing.total += 1;
    if (t.fiber) existing.fiber += 1;
    if (t.color) existing.color += 1;
    if (t.pattern) existing.pattern += 1;
    if (t.weave) existing.weave += 1;
    if (t.width_value && t.width_value > 0) existing.width += 1;
    if (t.quantity_value && t.quantity_value > 0) existing.quantity += 1;
    if (t.price_per_meter && t.price_per_meter > 0) existing.price += 1;

    bySource.set(siteId, existing);
  }

  // Convertir en array avec pourcentages
  return Array.from(bySource.values())
    .map(source => ({
      siteId: source.siteId,
      siteName: source.siteName,
      total: source.total,
      coverage: {
        fiber: source.total > 0 ? Math.round((source.fiber / source.total) * 100) : 0,
        color: source.total > 0 ? Math.round((source.color / source.total) * 100) : 0,
        pattern: source.total > 0 ? Math.round((source.pattern / source.total) * 100) : 0,
        weave: source.total > 0 ? Math.round((source.weave / source.total) * 100) : 0,
        width: source.total > 0 ? Math.round((source.width / source.total) * 100) : 0,
        quantity: source.total > 0 ? Math.round((source.quantity / source.total) * 100) : 0,
        price: source.total > 0 ? Math.round((source.price / source.total) * 100) : 0,
      },
    }))
    .sort((a, b) => b.total - a.total); // Tri par nombre de textiles décroissant
}

export type CoverageBySource = Awaited<ReturnType<typeof getCoverageBySource>>[number];
