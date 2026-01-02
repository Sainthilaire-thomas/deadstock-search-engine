// src/features/admin/domain/types.ts

export interface Site {
  id: string;
  name: string;
  url: string;
  platform_type: 'shopify' | 'woocommerce' | 'custom';
  status: 'new' | 'discovered' | 'active' | 'paused' | 'archived';
  priority: 'high' | 'medium' | 'low';
  discovery_completed_at: string | null;
  last_scraped_at: string | null;
  scraping_config: ScrapingConfig | null;
  quality_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScrapingConfig {
  collections?: string[];
  maxProductsPerCollection?: number;
  refreshFrequency?: 'daily' | 'weekly' | 'monthly';
  maxRequestsPerHour?: number;
  delayBetweenRequests?: number;
  filters?: {
    onlyAvailable?: boolean;
    requireImages?: boolean;
    requirePrice?: boolean;
    priceRange?: {
      min: number;
      max: number;
    };
  };
}

export interface ScrapingJob {
  id: string;
  site_id: string;
  profile_id: string | null;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string | null;
  ended_at: string | null;
  config: ScrapingConfig | null;
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

export interface SiteProfile {
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
}

export interface AdminMetrics {
  totalSites: number;
  activeSites: number;
  totalTextiles: number;
  totalJobs: number;
  recentJobs: number;
  avgQualityScore: number;
  pendingUnknowns: number;
  lastScrapingAt: string | null;
}

export interface SiteWithProfile extends Site {
  profile?: SiteProfile;
  jobsCount?: number;
  textilesCount?: number;
}

export interface JobWithSite extends ScrapingJob {
  site?: Pick<Site, 'id' | 'name' | 'url' | 'platform_type'>;
}
