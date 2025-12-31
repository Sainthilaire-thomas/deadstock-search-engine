-- Migration 007: Admin Scraping System
-- Created: 30 December 2024
-- Purpose: Add admin tables for intelligent discovery & scraping management

-- ============================================================================
-- 1. SITES TABLE
-- ============================================================================
-- Purpose: Manage external sites to scrape
-- Strategy: Admin controls which sites, priorities, and configurations

CREATE TABLE IF NOT EXISTS deadstock.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Site identification
  url TEXT UNIQUE NOT NULL,
  name TEXT,
  platform_type TEXT DEFAULT 'shopify', -- 'shopify', 'woocommerce', 'custom'
  
  -- Status management
  status TEXT DEFAULT 'new', -- 'new', 'discovered', 'active', 'paused', 'archived'
  priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  
  -- Discovery tracking
  discovery_completed_at TIMESTAMPTZ,
  
  -- Scraping tracking
  last_scraped_at TIMESTAMPTZ,
  scraping_config JSONB, -- Default scraping configuration for this site
  
  -- Quality metrics
  quality_score DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Admin notes
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sites
CREATE INDEX IF NOT EXISTS idx_sites_status ON deadstock.sites(status);
CREATE INDEX IF NOT EXISTS idx_sites_priority ON deadstock.sites(priority);
CREATE INDEX IF NOT EXISTS idx_sites_quality ON deadstock.sites(quality_score DESC) WHERE quality_score IS NOT NULL;

-- Comments
COMMENT ON TABLE deadstock.sites IS 'External sites to scrape - admin managed';
COMMENT ON COLUMN deadstock.sites.scraping_config IS 'Default config: {refreshFrequency, maxRequestsPerHour, delayBetweenRequests, filters}';

-- ============================================================================
-- 2. SITE_PROFILES TABLE
-- ============================================================================
-- Purpose: Cache site structure discovery results (6 months TTL)
-- Philosophy: Structure changes rarely, cache long-term

CREATE TABLE IF NOT EXISTS deadstock.site_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES deadstock.sites(id) ON DELETE CASCADE,
  
  -- Cache metadata
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL, -- NOW() + 6 months
  profile_version INTEGER DEFAULT 1,
  
  -- Discovery results (STABLE DATA - structure doesn't change often)
  collections JSONB, -- Collections found on site
  sample_products JSONB, -- Sample products for quality reference
  data_structure JSONB, -- Available fields analysis
  quality_metrics JSONB, -- Quality assessment scores
  recommendations JSONB, -- Auto-generated recommendations
  
  -- Technical metadata
  is_shopify BOOLEAN DEFAULT true,
  total_collections INTEGER,
  relevant_collections INTEGER, -- Textile-related collections
  estimated_products INTEGER,
  
  -- Re-discovery triggers
  needs_rediscovery BOOLEAN DEFAULT false,
  rediscovery_reason TEXT, -- 'manual', 'errors', 'scheduled', 'structure_changed'
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for site_profiles
CREATE INDEX IF NOT EXISTS idx_profiles_site ON deadstock.site_profiles(site_id);
CREATE INDEX IF NOT EXISTS idx_profiles_valid ON deadstock.site_profiles(valid_until);
CREATE INDEX IF NOT EXISTS idx_profiles_rediscovery ON deadstock.site_profiles(needs_rediscovery) 
  WHERE needs_rediscovery = true;
CREATE INDEX IF NOT EXISTS idx_profiles_latest ON deadstock.site_profiles(site_id, discovered_at DESC);

-- Comments
COMMENT ON TABLE deadstock.site_profiles IS 'Cached site structure discovery (6 months TTL) - structure changes rarely';
COMMENT ON COLUMN deadstock.site_profiles.valid_until IS 'Profile expires after 6 months, re-discovery needed';
COMMENT ON COLUMN deadstock.site_profiles.collections IS 'Format: [{handle, title, productsCount, relevant, priority, filters}]';

-- ============================================================================
-- 3. DISCOVERY_JOBS TABLE
-- ============================================================================
-- Purpose: Track batch discovery operations
-- Use case: Discover 20-50 sites overnight

CREATE TABLE IF NOT EXISTS deadstock.discovery_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Job status
  status TEXT DEFAULT 'queued', -- 'queued', 'running', 'completed', 'failed'
  mode TEXT DEFAULT 'batch', -- 'batch', 'single'
  
  -- Progress tracking
  sites_total INTEGER DEFAULT 0,
  sites_completed INTEGER DEFAULT 0,
  sites_failed INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Configuration
  config JSONB, -- {delayBetweenSites: 300000, sampleSize: 10, timeout: 60000}
  
  -- Error tracking
  error_summary JSONB, -- {'site1.com': 'timeout', 'site2.com': 'not shopify'}
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for discovery_jobs
CREATE INDEX IF NOT EXISTS idx_discovery_jobs_status ON deadstock.discovery_jobs(status);
CREATE INDEX IF NOT EXISTS idx_discovery_jobs_created ON deadstock.discovery_jobs(created_at DESC);

-- Comments
COMMENT ON TABLE deadstock.discovery_jobs IS 'Batch discovery operations tracking';
COMMENT ON COLUMN deadstock.discovery_jobs.config IS 'Discovery config: delay between sites, sample size, timeout';

-- ============================================================================
-- 4. SCRAPING_JOBS TABLE
-- ============================================================================
-- Purpose: Track scraping operations (uses cached profiles)
-- Philosophy: Fast scraping based on pre-discovered structure

CREATE TABLE IF NOT EXISTS deadstock.scraping_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES deadstock.sites(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES deadstock.site_profiles(id) ON DELETE SET NULL,
  
  -- Job status
  status TEXT DEFAULT 'queued', -- 'queued', 'running', 'completed', 'failed', 'partial'
  
  -- Timing
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Configuration (job-specific, overrides site defaults)
  config JSONB, -- Collections to scrape, filters, limits
  
  -- Statistics
  products_fetched INTEGER DEFAULT 0,
  products_saved INTEGER DEFAULT 0,
  products_skipped INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  
  -- Quality tracking
  quality_score DECIMAL(3,2), -- Average quality of saved products
  
  -- Detailed tracking
  logs JSONB, -- Detailed operation logs
  error_details JSONB, -- Error breakdown by collection/product
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for scraping_jobs
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_site ON deadstock.scraping_jobs(site_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_profile ON deadstock.scraping_jobs(profile_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON deadstock.scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_created ON deadstock.scraping_jobs(created_at DESC);

-- Comments
COMMENT ON TABLE deadstock.scraping_jobs IS 'Scraping operations based on cached profiles';
COMMENT ON COLUMN deadstock.scraping_jobs.profile_id IS 'Which profile version was used for this scraping job';
COMMENT ON COLUMN deadstock.scraping_jobs.config IS 'Job config: collections, filters, maxProducts per collection';

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Insert test site
INSERT INTO deadstock.sites (url, name, status, priority, notes)
VALUES 
  ('mylittlecoupon.fr', 'My Little Coupon', 'new', 'high', 'FR deadstock platform - Priority source'),
  ('thefabricsales.com', 'The Fabric Sales', 'new', 'medium', 'UK deadstock platform'),
  ('recovo.co', 'Recovo', 'new', 'medium', 'ES/EU deadstock marketplace')
ON CONFLICT (url) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check tables created
DO $$
BEGIN
  RAISE NOTICE 'Verifying migration 007...';
  
  -- Check sites table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'deadstock' AND table_name = 'sites') THEN
    RAISE NOTICE '✅ sites table created';
  ELSE
    RAISE EXCEPTION '❌ sites table not found';
  END IF;
  
  -- Check site_profiles table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'deadstock' AND table_name = 'site_profiles') THEN
    RAISE NOTICE '✅ site_profiles table created';
  ELSE
    RAISE EXCEPTION '❌ site_profiles table not found';
  END IF;
  
  -- Check discovery_jobs table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'deadstock' AND table_name = 'discovery_jobs') THEN
    RAISE NOTICE '✅ discovery_jobs table created';
  ELSE
    RAISE EXCEPTION '❌ discovery_jobs table not found';
  END IF;
  
  -- Check scraping_jobs table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'deadstock' AND table_name = 'scraping_jobs') THEN
    RAISE NOTICE '✅ scraping_jobs table created';
  ELSE
    RAISE EXCEPTION '❌ scraping_jobs table not found';
  END IF;
  
  RAISE NOTICE '✅ Migration 007 completed successfully';
END $$;

-- Display sample sites
SELECT 
  url,
  name,
  status,
  priority,
  created_at
FROM deadstock.sites
ORDER BY priority DESC, created_at DESC;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all admin tables
ALTER TABLE deadstock.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadstock.site_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadstock.discovery_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadstock.scraping_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access to sites
CREATE POLICY "Service role can manage sites"
ON deadstock.sites
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users read access to sites
CREATE POLICY "Authenticated users can read sites"
ON deadstock.sites
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow service role full access to site_profiles
CREATE POLICY "Service role can manage site_profiles"
ON deadstock.site_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users read access to site_profiles
CREATE POLICY "Authenticated users can read site_profiles"
ON deadstock.site_profiles
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow service role full access to discovery_jobs
CREATE POLICY "Service role can manage discovery_jobs"
ON deadstock.discovery_jobs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users read access to discovery_jobs
CREATE POLICY "Authenticated users can read discovery_jobs"
ON deadstock.discovery_jobs
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow service role full access to scraping_jobs
CREATE POLICY "Service role can manage scraping_jobs"
ON deadstock.scraping_jobs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users read access to scraping_jobs
CREATE POLICY "Authenticated users can read scraping_jobs"
ON deadstock.scraping_jobs
FOR SELECT
TO authenticated
USING (true);

-- Verify policies created
DO $$
BEGIN
  RAISE NOTICE '✅ RLS Policies created for admin tables';
END $$;
