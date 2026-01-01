-- ============================================================================
-- Migration 010: Add Normalization Metadata to Textiles
-- ============================================================================
-- Date: 31 Décembre 2025
-- Description: 
--   Ajoute colonnes pour stocker les résultats de la normalisation :
--   - Valeurs originales (avant normalisation)
--   - Scores de confiance
--   - Flags de supervision (needs_review)
--   - Métadonnées de review
--
-- Cette migration complète le système de normalisation intelligent
-- en permettant de tracer l'origine et la qualité des données normalisées.
-- ============================================================================

-- ============================================================================
-- Add original values columns (for reference)
-- ============================================================================

ALTER TABLE deadstock.textiles
ADD COLUMN IF NOT EXISTS material_original TEXT,
ADD COLUMN IF NOT EXISTS color_original TEXT,
ADD COLUMN IF NOT EXISTS pattern_original TEXT,
ADD COLUMN IF NOT EXISTS tags_original TEXT[];

COMMENT ON COLUMN deadstock.textiles.material_original IS 'Original material term before normalization';
COMMENT ON COLUMN deadstock.textiles.color_original IS 'Original color term before normalization';
COMMENT ON COLUMN deadstock.textiles.pattern_original IS 'Original pattern term before normalization';
COMMENT ON COLUMN deadstock.textiles.tags_original IS 'Original tags from source platform';

-- ============================================================================
-- Add confidence scores
-- ============================================================================

ALTER TABLE deadstock.textiles
ADD COLUMN IF NOT EXISTS material_confidence DECIMAL(3,2) CHECK (material_confidence BETWEEN 0 AND 1),
ADD COLUMN IF NOT EXISTS color_confidence DECIMAL(3,2) CHECK (color_confidence BETWEEN 0 AND 1),
ADD COLUMN IF NOT EXISTS pattern_confidence DECIMAL(3,2) CHECK (pattern_confidence BETWEEN 0 AND 1);

COMMENT ON COLUMN deadstock.textiles.material_confidence IS 'Confidence score for material normalization (0-1)';
COMMENT ON COLUMN deadstock.textiles.color_confidence IS 'Confidence score for color normalization (0-1)';
COMMENT ON COLUMN deadstock.textiles.pattern_confidence IS 'Confidence score for pattern normalization (0-1)';

-- ============================================================================
-- Add supervision flags
-- ============================================================================

ALTER TABLE deadstock.textiles
ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS review_reasons JSONB;

COMMENT ON COLUMN deadstock.textiles.needs_review IS 'Flag indicating product needs manual review';
COMMENT ON COLUMN deadstock.textiles.review_reasons IS 'JSON array of reasons why review is needed';

-- Example review_reasons format:
-- [
--   {
--     "field": "material_type",
--     "reason": "unknown_term",
--     "original_value": "viscose-like-fabric",
--     "suggestions": ["viscose", "polyester"]
--   },
--   {
--     "field": "pattern",
--     "reason": "low_confidence",
--     "confidence": 0.45
--   }
-- ]

-- ============================================================================
-- Add review metadata
-- ============================================================================

ALTER TABLE deadstock.textiles
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID;

COMMENT ON COLUMN deadstock.textiles.reviewed_at IS 'Timestamp when product was reviewed';
COMMENT ON COLUMN deadstock.textiles.reviewed_by IS 'UUID of user who reviewed the product';

-- ============================================================================
-- Create indexes for performance
-- ============================================================================

-- Index for filtering products needing review
CREATE INDEX IF NOT EXISTS idx_textiles_needs_review 
ON deadstock.textiles(needs_review) 
WHERE needs_review = TRUE;

-- Index for filtering by confidence scores
CREATE INDEX IF NOT EXISTS idx_textiles_material_confidence 
ON deadstock.textiles(material_confidence) 
WHERE material_confidence < 0.8;

CREATE INDEX IF NOT EXISTS idx_textiles_color_confidence 
ON deadstock.textiles(color_confidence) 
WHERE color_confidence < 0.8;

CREATE INDEX IF NOT EXISTS idx_textiles_pattern_confidence 
ON deadstock.textiles(pattern_confidence) 
WHERE pattern_confidence < 0.8;

-- Index for review workflow
CREATE INDEX IF NOT EXISTS idx_textiles_reviewed_at 
ON deadstock.textiles(reviewed_at);

-- ============================================================================
-- Update data_quality_score calculation
-- ============================================================================

-- Note: data_quality_score already exists in textiles table
-- It should now factor in normalization confidence scores

COMMENT ON COLUMN deadstock.textiles.data_quality_score IS 'Overall quality score (0-100) factoring in completeness, availability, and normalization confidence';

-- ============================================================================
-- Create view for products needing review
-- ============================================================================

CREATE OR REPLACE VIEW deadstock.textiles_needing_review AS
SELECT 
  t.id,
  t.name,
  t.source_platform,
  t.source_url,
  t.image_url,
  
  -- Normalized values
  t.material_type,
  t.color,
  t.pattern,
  
  -- Original values
  t.material_original,
  t.color_original,
  t.pattern_original,
  
  -- Confidence scores
  t.material_confidence,
  t.color_confidence,
  t.pattern_confidence,
  
  -- Review info
  t.needs_review,
  t.review_reasons,
  t.data_quality_score,
  
  -- Timestamps
  t.scraped_at,
  t.created_at
  
FROM deadstock.textiles t
WHERE t.needs_review = TRUE
ORDER BY t.scraped_at DESC;

COMMENT ON VIEW deadstock.textiles_needing_review IS 'Products flagged for manual review due to normalization issues';

-- ============================================================================
-- Create view for low confidence products
-- ============================================================================

CREATE OR REPLACE VIEW deadstock.textiles_low_confidence AS
SELECT 
  t.id,
  t.name,
  t.source_platform,
  t.image_url,
  
  -- Normalized values
  t.material_type,
  t.color,
  t.pattern,
  
  -- Confidence scores
  t.material_confidence,
  t.color_confidence,
  t.pattern_confidence,
  
  -- Calculate average confidence
  (
    COALESCE(t.material_confidence, 0) + 
    COALESCE(t.color_confidence, 0) + 
    COALESCE(t.pattern_confidence, 0)
  ) / 3.0 as avg_confidence,
  
  t.data_quality_score,
  t.scraped_at
  
FROM deadstock.textiles t
WHERE 
  t.material_confidence < 0.8 OR
  t.color_confidence < 0.8 OR
  t.pattern_confidence < 0.8
ORDER BY avg_confidence ASC, t.scraped_at DESC;

COMMENT ON VIEW deadstock.textiles_low_confidence IS 'Products with low normalization confidence scores (<0.8)';

-- ============================================================================
-- Statistics query
-- ============================================================================

DO $$
DECLARE
  total_products INTEGER;
  needs_review_count INTEGER;
  low_confidence_count INTEGER;
  avg_material_conf DECIMAL(3,2);
  avg_color_conf DECIMAL(3,2);
  avg_pattern_conf DECIMAL(3,2);
BEGIN
  -- Get statistics
  SELECT COUNT(*) INTO total_products FROM deadstock.textiles;
  SELECT COUNT(*) INTO needs_review_count FROM deadstock.textiles WHERE needs_review = TRUE;
  SELECT COUNT(*) INTO low_confidence_count FROM deadstock.textiles_low_confidence;
  
  SELECT 
    AVG(material_confidence),
    AVG(color_confidence),
    AVG(pattern_confidence)
  INTO avg_material_conf, avg_color_conf, avg_pattern_conf
  FROM deadstock.textiles;
  
  -- Display summary
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '  Migration 010: Normalization Metadata - COMPLETED ✅';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Columns added:';
  RAISE NOTICE '  ✅ material_original, color_original, pattern_original';
  RAISE NOTICE '  ✅ tags_original';
  RAISE NOTICE '  ✅ material_confidence, color_confidence, pattern_confidence';
  RAISE NOTICE '  ✅ needs_review, review_reasons';
  RAISE NOTICE '  ✅ reviewed_at, reviewed_by';
  RAISE NOTICE '';
  RAISE NOTICE 'Indexes created:';
  RAISE NOTICE '  ✅ idx_textiles_needs_review';
  RAISE NOTICE '  ✅ idx_textiles_*_confidence (3 indexes)';
  RAISE NOTICE '  ✅ idx_textiles_reviewed_at';
  RAISE NOTICE '';
  RAISE NOTICE 'Views created:';
  RAISE NOTICE '  ✅ textiles_needing_review';
  RAISE NOTICE '  ✅ textiles_low_confidence';
  RAISE NOTICE '';
  RAISE NOTICE 'Current Database Status:';
  RAISE NOTICE '  📊 Total products: %', total_products;
  RAISE NOTICE '  ⚠️  Needs review: %', needs_review_count;
  RAISE NOTICE '  📉 Low confidence: %', low_confidence_count;
  RAISE NOTICE '';
  
  IF total_products > 0 THEN
    RAISE NOTICE 'Average Confidence Scores:';
    RAISE NOTICE '  Material: %', COALESCE(avg_material_conf, 0);
    RAISE NOTICE '  Color: %', COALESCE(avg_color_conf, 0);
    RAISE NOTICE '  Pattern: %', COALESCE(avg_pattern_conf, 0);
  ELSE
    RAISE NOTICE 'No products in database yet.';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '  Ready for Session 3: Integration with Scraping System';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
