-- Migration: 001_initial_deadstock_schema
-- Created: 2025-12-27
-- Description: Création initiale du schéma deadstock avec table textiles et infrastructure de base

-- ============================================================================
-- CRÉATION DU SCHÉMA
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS deadstock;

-- ============================================================================
-- TABLE: deadstock.textiles
-- ============================================================================

CREATE TABLE deadstock.textiles (
  -- Identifiants
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  available BOOLEAN NOT NULL DEFAULT true,
  
  -- Informations produit
  name TEXT NOT NULL,
  description TEXT,
  material_type TEXT NOT NULL,
  composition JSONB,
  color TEXT,
  pattern TEXT,
  
  -- Quantité
  quantity_value NUMERIC NOT NULL,
  quantity_unit TEXT NOT NULL,
  minimum_order_value NUMERIC,
  minimum_order_unit TEXT,
  
  -- Prix
  price_value NUMERIC,
  price_currency TEXT DEFAULT 'EUR',
  price_per_unit NUMERIC,
  price_per_unit_label TEXT,
  
  -- Source
  source_platform TEXT NOT NULL,
  source_url TEXT NOT NULL UNIQUE,
  source_product_id TEXT,
  supplier_name TEXT,
  supplier_location TEXT,
  supplier_url TEXT,
  
  -- Images
  image_url TEXT,
  additional_images TEXT[],
  
  -- Caractéristiques techniques
  width_value NUMERIC,
  width_unit TEXT,
  weight_value NUMERIC,
  weight_unit TEXT,
  certifications TEXT[],
  
  -- Métadonnées scraping
  raw_data JSONB,
  data_quality_score INTEGER DEFAULT 50 CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
  missing_fields TEXT[],
  
  -- Champs futurs (normalisation)
  material_id UUID,
  supplier_id UUID,
  
  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('french', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(material_type, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(color, '')), 'C')
  ) STORED
);

-- ============================================================================
-- INDEX
-- ============================================================================

CREATE INDEX idx_textiles_search ON deadstock.textiles USING GIN (search_vector);
CREATE INDEX idx_textiles_material_type ON deadstock.textiles(material_type) WHERE available = true;
CREATE INDEX idx_textiles_color ON deadstock.textiles(color) WHERE available = true;
CREATE INDEX idx_textiles_source_platform ON deadstock.textiles(source_platform);
CREATE INDEX idx_textiles_available ON deadstock.textiles(available);
CREATE INDEX idx_textiles_scraped_at ON deadstock.textiles(scraped_at DESC) WHERE available = true;
CREATE INDEX idx_textiles_price ON deadstock.textiles(price_value) WHERE available = true AND price_value IS NOT NULL;
CREATE INDEX idx_textiles_supplier ON deadstock.textiles(supplier_name) WHERE available = true;
CREATE INDEX idx_textiles_type_color_available ON deadstock.textiles(material_type, color) WHERE available = true;
CREATE INDEX idx_textiles_source_url ON deadstock.textiles(source_url);
CREATE INDEX idx_textiles_composition ON deadstock.textiles USING GIN (composition);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION deadstock.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_textiles_updated_at
  BEFORE UPDATE ON deadstock.textiles
  FOR EACH ROW
  EXECUTE FUNCTION deadstock.update_updated_at_column();

-- ============================================================================
-- TABLE: deadstock.scraping_logs
-- ============================================================================

CREATE TABLE deadstock.scraping_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_platform TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'partial')),
  items_found INTEGER DEFAULT 0,
  items_new INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  error_message TEXT,
  error_details JSONB,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scraping_logs_platform_date ON deadstock.scraping_logs(source_platform, started_at DESC);
CREATE INDEX idx_scraping_logs_status ON deadstock.scraping_logs(status);

-- ============================================================================
-- TABLE: deadstock.users
-- ============================================================================

CREATE TABLE deadstock.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free', 'premium', 'pro', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON deadstock.users
  FOR EACH ROW
  EXECUTE FUNCTION deadstock.update_updated_at_column();

-- ============================================================================
-- TABLE: deadstock.user_favorites
-- ============================================================================

CREATE TABLE deadstock.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  textile_id UUID NOT NULL REFERENCES deadstock.textiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, textile_id)
);

CREATE INDEX idx_favorites_user ON deadstock.user_favorites(user_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE deadstock.textiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadstock.scraping_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadstock.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadstock.user_favorites ENABLE ROW LEVEL SECURITY;

-- Policies: Textiles
CREATE POLICY "Textiles are viewable by everyone"
  ON deadstock.textiles FOR SELECT USING (true);

CREATE POLICY "Textiles are insertable by service role only"
  ON deadstock.textiles FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Textiles are updatable by service role only"
  ON deadstock.textiles FOR UPDATE USING (auth.role() = 'service_role');

-- Policies: Scraping logs
CREATE POLICY "Scraping logs accessible by service role only"
  ON deadstock.scraping_logs FOR ALL USING (auth.role() = 'service_role');

-- Policies: Users
CREATE POLICY "Users can view own data"
  ON deadstock.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON deadstock.users FOR UPDATE USING (auth.uid() = id);

-- Policies: Favorites
CREATE POLICY "Users can view own favorites"
  ON deadstock.user_favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON deadstock.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON deadstock.user_favorites FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- FONCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION deadstock.search_textiles(
  search_query TEXT,
  material_filter TEXT DEFAULT NULL,
  color_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  material_type TEXT,
  color TEXT,
  price_value NUMERIC,
  price_currency TEXT,
  quantity_value NUMERIC,
  quantity_unit TEXT,
  supplier_name TEXT,
  source_platform TEXT,
  source_url TEXT,
  image_url TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id, t.name, t.material_type, t.color, t.price_value, t.price_currency,
    t.quantity_value, t.quantity_unit, t.supplier_name, t.source_platform,
    t.source_url, t.image_url,
    ts_rank(t.search_vector, websearch_to_tsquery('french', search_query)) AS rank
  FROM deadstock.textiles t
  WHERE 
    t.available = true
    AND t.search_vector @@ websearch_to_tsquery('french', search_query)
    AND (material_filter IS NULL OR t.material_type = material_filter)
    AND (color_filter IS NULL OR t.color = color_filter)
  ORDER BY rank DESC, t.scraped_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VUES
-- ============================================================================

CREATE OR REPLACE VIEW deadstock.active_textiles AS
SELECT 
  id, name, material_type, color, quantity_value, quantity_unit,
  price_value, price_currency, supplier_name, supplier_location,
  source_platform, source_url, image_url, scraped_at, created_at
FROM deadstock.textiles
WHERE available = true
ORDER BY scraped_at DESC;

CREATE OR REPLACE VIEW deadstock.platform_stats AS
SELECT 
  source_platform,
  COUNT(*) as total_textiles,
  COUNT(*) FILTER (WHERE available = true) as available_textiles,
  COUNT(DISTINCT material_type) as unique_materials,
  COUNT(DISTINCT supplier_name) as unique_suppliers,
  AVG(price_value) FILTER (WHERE price_currency = 'EUR' AND price_value > 0) as avg_price_eur,
  MAX(scraped_at) as last_scraped
FROM deadstock.textiles
GROUP BY source_platform;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA deadstock TO authenticated;
GRANT SELECT ON deadstock.active_textiles TO authenticated;
GRANT SELECT ON deadstock.platform_stats TO authenticated;
GRANT EXECUTE ON FUNCTION deadstock.search_textiles TO authenticated;

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================

COMMENT ON SCHEMA deadstock IS 'Schéma dédié au moteur de recherche de textiles deadstock';
COMMENT ON TABLE deadstock.textiles IS 'Table principale contenant tous les textiles deadstock (approche hybride MVP)';
COMMENT ON TABLE deadstock.scraping_logs IS 'Historique des runs de scraping pour monitoring';
