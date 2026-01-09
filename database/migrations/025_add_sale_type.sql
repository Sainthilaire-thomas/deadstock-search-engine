-- Migration 025: Add sale_type and price_per_meter to textiles
-- Date: 2026-01-09
-- Description: Clarify quantity_value ambiguity with sale_type column
-- Reference: ADR-024 Update (Session 21)

-- ============================================================================
-- 1. ADD COLUMNS TO TEXTILES TABLE
-- ============================================================================

-- Sale type column
ALTER TABLE deadstock.textiles 
ADD COLUMN IF NOT EXISTS sale_type VARCHAR(20) DEFAULT 'unknown';

COMMENT ON COLUMN deadstock.textiles.sale_type IS 
'Type de vente: fixed_length (coupon fixe), cut_to_order (au mètre), hybrid (les deux), by_piece, unknown';

-- Price per meter (normalized for comparison)
ALTER TABLE deadstock.textiles 
ADD COLUMN IF NOT EXISTS price_per_meter DECIMAL(10,2);

COMMENT ON COLUMN deadstock.textiles.price_per_meter IS 
'Prix au mètre normalisé (calculé ou extrait) pour comparaison entre sites';

-- ============================================================================
-- 2. ADD CONSTRAINT
-- ============================================================================

-- Check constraint for valid sale_type values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_sale_type'
  ) THEN
    ALTER TABLE deadstock.textiles 
    ADD CONSTRAINT chk_sale_type 
    CHECK (sale_type IN ('fixed_length', 'cut_to_order', 'hybrid', 'by_piece', 'unknown'));
  END IF;
END $$;

-- ============================================================================
-- 3. ADD INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_textiles_sale_type 
ON deadstock.textiles(sale_type);

CREATE INDEX IF NOT EXISTS idx_textiles_price_per_meter 
ON deadstock.textiles(price_per_meter);

-- ============================================================================
-- 4. UPDATE EXISTING DATA BY SITE
-- ============================================================================

-- The Fabric Sales = cut_to_order (prix affiché = prix/mètre)
UPDATE deadstock.textiles t
SET 
  sale_type = 'cut_to_order',
  price_per_meter = t.price_value
FROM deadstock.sites s
WHERE t.site_id = s.id 
  AND s.domain = 'thefabricsales.com'
  AND t.sale_type = 'unknown';

-- My Little Coupon = fixed_length (prix affiché = prix total coupon)
UPDATE deadstock.textiles t
SET 
  sale_type = 'fixed_length',
  price_per_meter = CASE 
    WHEN t.quantity_value > 0 THEN ROUND(t.price_value / t.quantity_value, 2) 
    ELSE NULL 
  END
FROM deadstock.sites s
WHERE t.site_id = s.id 
  AND s.domain = 'mylittlecoupon.fr'
  AND t.sale_type = 'unknown';

-- Nona Source = hybrid (rouleaux + coupe sur mesure)
UPDATE deadstock.textiles t
SET 
  sale_type = 'hybrid'
  -- price_per_meter sera calculé au prochain scraping selon le variant
FROM deadstock.sites s
WHERE t.site_id = s.id 
  AND s.domain = 'www.nona-source.com'
  AND t.sale_type = 'unknown';

-- ============================================================================
-- 5. UPDATE MATERIALIZED VIEW
-- ============================================================================

-- Drop and recreate with new columns
DROP MATERIALIZED VIEW IF EXISTS deadstock.textiles_search;

CREATE MATERIALIZED VIEW deadstock.textiles_search AS
SELECT 
  t.id,
  t.name,
  t.description,
  t.image_url,
  t.additional_images,
  t.source_url,
  t.source_platform,
  t.source_product_id,
  t.price_value AS price,
  t.price_currency,
  t.quantity_value,
  t.quantity_unit,
  t.width_value,
  t.width_unit,
  t.weight_value,
  t.weight_unit,
  t.available,
  t.site_id,
  t.created_at,
  t.updated_at,
  -- NEW: Sale type columns
  t.sale_type,
  t.price_per_meter,
  -- Pivoted attributes from textile_attributes
  MAX(CASE WHEN ta.category_slug = 'fiber' THEN ta.value END) as fiber,
  MAX(CASE WHEN ta.category_slug = 'color' THEN ta.value END) as color,
  MAX(CASE WHEN ta.category_slug = 'pattern' THEN ta.value END) as pattern,
  MAX(CASE WHEN ta.category_slug = 'weave' THEN ta.value END) as weave,
  -- Site info for display
  s.name as site_name,
  s.domain as site_domain
FROM deadstock.textiles t
LEFT JOIN deadstock.textile_attributes ta ON t.id = ta.textile_id
LEFT JOIN deadstock.sites s ON t.site_id = s.id
WHERE t.available = true
GROUP BY 
  t.id, t.name, t.description, t.image_url, t.additional_images,
  t.source_url, t.source_platform, t.source_product_id,
  t.price_value, t.price_currency, t.quantity_value, t.quantity_unit,
  t.width_value, t.width_unit, t.weight_value, t.weight_unit,
  t.available, t.site_id, t.created_at, t.updated_at,
  t.sale_type, t.price_per_meter,
  s.name, s.domain;

-- ============================================================================
-- 6. RECREATE INDEXES ON VIEW
-- ============================================================================

-- Required for REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_textiles_search_id 
ON deadstock.textiles_search(id);

-- Attribute indexes
CREATE INDEX idx_textiles_search_fiber 
ON deadstock.textiles_search(fiber);

CREATE INDEX idx_textiles_search_color 
ON deadstock.textiles_search(color);

CREATE INDEX idx_textiles_search_pattern 
ON deadstock.textiles_search(pattern);

CREATE INDEX idx_textiles_search_weave 
ON deadstock.textiles_search(weave);

-- Commercial indexes
CREATE INDEX idx_textiles_search_price 
ON deadstock.textiles_search(price);

CREATE INDEX idx_textiles_search_price_per_meter 
ON deadstock.textiles_search(price_per_meter);

CREATE INDEX idx_textiles_search_sale_type 
ON deadstock.textiles_search(sale_type);

-- Dimension indexes
CREATE INDEX idx_textiles_search_width 
ON deadstock.textiles_search(width_value);

CREATE INDEX idx_textiles_search_weight 
ON deadstock.textiles_search(weight_value);

-- Quantity for yardage filter
CREATE INDEX idx_textiles_search_quantity 
ON deadstock.textiles_search(quantity_value);

-- Composite indexes
CREATE INDEX idx_textiles_search_fiber_color 
ON deadstock.textiles_search(fiber, color);

CREATE INDEX idx_textiles_search_site 
ON deadstock.textiles_search(site_id);

CREATE INDEX idx_textiles_search_created 
ON deadstock.textiles_search(created_at DESC);

-- ============================================================================
-- 7. VERIFY MIGRATION
-- ============================================================================

-- Check sale_type distribution
SELECT 
  s.domain,
  t.sale_type,
  COUNT(*) as count,
  ROUND(AVG(t.price_per_meter), 2) as avg_price_per_meter
FROM deadstock.textiles t
JOIN deadstock.sites s ON t.site_id = s.id
GROUP BY s.domain, t.sale_type
ORDER BY s.domain, t.sale_type;

-- Check view row count
SELECT COUNT(*) as textiles_search_count FROM deadstock.textiles_search;

-- Sample data check
SELECT 
  name,
  sale_type,
  price,
  quantity_value,
  price_per_meter,
  fiber,
  site_domain
FROM deadstock.textiles_search
LIMIT 10;
