-- Migration 026: Fix Nona Source Variants and Add sale_type
-- Date: 2026-01-09
-- Context: Bug fix - scraper was taking first variant only, marking 79% products unavailable
-- Related: ADR-025 (to be created)

-- ============================================================================
-- PART 1: Add sale_type column to textiles
-- ============================================================================

-- Add sale_type to clarify how quantity_value should be interpreted
ALTER TABLE deadstock.textiles 
ADD COLUMN IF NOT EXISTS sale_type TEXT DEFAULT 'fixed_length'
CHECK (sale_type IN ('fixed_length', 'hybrid', 'cut_to_order', 'by_piece'));

COMMENT ON COLUMN deadstock.textiles.sale_type IS 
'Sale model: fixed_length (coupons with specific length), hybrid (coupons + cutting option), cut_to_order (sold by meter), by_piece (sold per item)';

-- ============================================================================
-- PART 2: Create helper function to analyze Nona Source variants
-- ============================================================================

CREATE OR REPLACE FUNCTION deadstock.analyze_nona_variants(raw_data JSONB)
RETURNS JSONB AS $$
DECLARE
  variants JSONB;
  variant JSONB;
  available_variants JSONB := '[]'::JSONB;
  has_cutting BOOLEAN := FALSE;
  min_price NUMERIC := NULL;
  max_length NUMERIC := NULL;
  cutting_price NUMERIC := NULL;
BEGIN
  variants := raw_data->'variants';
  
  IF variants IS NULL THEN
    RETURN jsonb_build_object(
      'available', FALSE,
      'sale_type', 'fixed_length',
      'available_count', 0
    );
  END IF;
  
  -- Iterate through variants
  FOR variant IN SELECT * FROM jsonb_array_elements(variants)
  LOOP
    -- Check if this is a "Cutting" variant
    IF variant->>'option3' = 'Cutting' THEN
      has_cutting := TRUE;
      IF (variant->>'available')::BOOLEAN THEN
        cutting_price := (variant->>'price')::NUMERIC;
      END IF;
    ELSE
      -- Regular coupon variant
      IF (variant->>'available')::BOOLEAN THEN
        available_variants := available_variants || jsonb_build_array(variant);
        
        -- Track min price
        IF min_price IS NULL OR (variant->>'price')::NUMERIC < min_price THEN
          min_price := (variant->>'price')::NUMERIC;
        END IF;
        
        -- Track max length (from option2)
        IF variant->>'option2' IS NOT NULL AND variant->>'option2' ~ '^\d+\.?\d*$' THEN
          IF max_length IS NULL OR (variant->>'option2')::NUMERIC > max_length THEN
            max_length := (variant->>'option2')::NUMERIC;
          END IF;
        END IF;
      END IF;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'available', (jsonb_array_length(available_variants) > 0 OR (has_cutting AND cutting_price IS NOT NULL)),
    'sale_type', CASE WHEN has_cutting THEN 'hybrid' ELSE 'fixed_length' END,
    'available_count', jsonb_array_length(available_variants),
    'has_cutting', has_cutting,
    'cutting_price', cutting_price,
    'min_price', min_price,
    'max_length', max_length
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- PART 3: Analyze current state (for verification)
-- ============================================================================

-- Check current state before fix
DO $$
DECLARE
  total_count INT;
  unavailable_count INT;
  available_count INT;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM deadstock.textiles t
  JOIN deadstock.sites s ON t.site_id = s.id
  WHERE s.name = 'Nona Source';
  
  SELECT COUNT(*) INTO unavailable_count
  FROM deadstock.textiles t
  JOIN deadstock.sites s ON t.site_id = s.id
  WHERE s.name = 'Nona Source' AND t.available = FALSE;
  
  available_count := total_count - unavailable_count;
  
  RAISE NOTICE 'BEFORE FIX - Nona Source: % total, % unavailable (%), % available',
    total_count, unavailable_count, 
    ROUND(unavailable_count::NUMERIC / NULLIF(total_count, 0) * 100, 1),
    available_count;
END $$;

-- ============================================================================
-- PART 4: Fix Nona Source textiles using variant analysis
-- ============================================================================

-- Update textiles based on variant analysis
UPDATE deadstock.textiles t
SET 
  available = (analysis->>'available')::BOOLEAN,
  sale_type = analysis->>'sale_type',
  -- For hybrid products with cutting, use cutting price as price_per_meter
  price_per_meter = CASE 
    WHEN analysis->>'sale_type' = 'hybrid' AND (analysis->>'cutting_price') IS NOT NULL 
    THEN (analysis->>'cutting_price')::NUMERIC
    -- For fixed_length, calculate from min_price / max_length if both exist
    WHEN analysis->>'sale_type' = 'fixed_length' 
      AND (analysis->>'min_price') IS NOT NULL 
      AND (analysis->>'max_length') IS NOT NULL 
      AND (analysis->>'max_length')::NUMERIC > 0
    THEN ROUND((analysis->>'min_price')::NUMERIC / (analysis->>'max_length')::NUMERIC, 2)
    ELSE price_per_meter
  END,
  -- Update quantity_value to max available length
  quantity_value = CASE 
    WHEN (analysis->>'max_length') IS NOT NULL 
    THEN (analysis->>'max_length')::NUMERIC
    ELSE quantity_value
  END,
  quantity_unit = 'm',
  updated_at = NOW()
FROM (
  SELECT 
    t2.id,
    deadstock.analyze_nona_variants(t2.raw_data) as analysis
  FROM deadstock.textiles t2
  JOIN deadstock.sites s ON t2.site_id = s.id
  WHERE s.name = 'Nona Source'
) AS analyzed
WHERE t.id = analyzed.id;

-- ============================================================================
-- PART 5: Verify fix results
-- ============================================================================

DO $$
DECLARE
  total_count INT;
  unavailable_count INT;
  available_count INT;
  hybrid_count INT;
  fixed_count INT;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM deadstock.textiles t
  JOIN deadstock.sites s ON t.site_id = s.id
  WHERE s.name = 'Nona Source';
  
  SELECT COUNT(*) INTO unavailable_count
  FROM deadstock.textiles t
  JOIN deadstock.sites s ON t.site_id = s.id
  WHERE s.name = 'Nona Source' AND t.available = FALSE;
  
  SELECT COUNT(*) INTO hybrid_count
  FROM deadstock.textiles t
  JOIN deadstock.sites s ON t.site_id = s.id
  WHERE s.name = 'Nona Source' AND t.sale_type = 'hybrid';
  
  SELECT COUNT(*) INTO fixed_count
  FROM deadstock.textiles t
  JOIN deadstock.sites s ON t.site_id = s.id
  WHERE s.name = 'Nona Source' AND t.sale_type = 'fixed_length';
  
  available_count := total_count - unavailable_count;
  
  RAISE NOTICE 'AFTER FIX - Nona Source: % total, % unavailable (%), % available',
    total_count, unavailable_count, 
    ROUND(unavailable_count::NUMERIC / NULLIF(total_count, 0) * 100, 1),
    available_count;
  RAISE NOTICE 'Sale types: % hybrid, % fixed_length', hybrid_count, fixed_count;
END $$;

-- ============================================================================
-- PART 6: Set default sale_type for other sources
-- ============================================================================

-- My Little Coupon = fixed_length (coupons)
UPDATE deadstock.textiles t
SET sale_type = 'fixed_length'
FROM deadstock.sites s
WHERE t.site_id = s.id 
  AND s.name LIKE '%Little Coupon%'
  AND t.sale_type IS NULL;

-- The Fabric Sales = cut_to_order (sold by meter)
UPDATE deadstock.textiles t
SET sale_type = 'cut_to_order'
FROM deadstock.sites s
WHERE t.site_id = s.id 
  AND s.name LIKE '%Fabric Sales%'
  AND t.sale_type IS NULL;

-- ============================================================================
-- PART 7: Update textiles_search materialized view if it exists
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_matviews 
    WHERE schemaname = 'deadstock' AND matviewname = 'textiles_search'
  ) THEN
    REFRESH MATERIALIZED VIEW deadstock.textiles_search;
    RAISE NOTICE 'Materialized view textiles_search refreshed';
  END IF;
END $$;

-- ============================================================================
-- PART 8: Summary query for verification
-- ============================================================================

-- Run this query after migration to verify results:
/*
SELECT 
  s.name as site,
  t.sale_type,
  COUNT(*) as total,
  SUM(CASE WHEN t.available THEN 1 ELSE 0 END) as available,
  ROUND(AVG(t.price_per_meter), 2) as avg_price_per_meter,
  ROUND(AVG(t.quantity_value), 2) as avg_quantity
FROM deadstock.textiles t
JOIN deadstock.sites s ON t.site_id = s.id
GROUP BY s.name, t.sale_type
ORDER BY s.name, t.sale_type;
*/
