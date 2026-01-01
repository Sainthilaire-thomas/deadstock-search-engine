-- ============================================================================
-- Migration 009: Clean Dictionary Schema + Enrich
-- ============================================================================
-- Date: 31 Décembre 2025
-- Description: 
--   1. Drop old dictionary_mappings table (legacy schema)
--   2. Recreate with clean schema (category_id UUID only)
--   3. Populate with 115+ mappings (fiber, color, pattern, weave)
--
-- Breaking changes:
--   - Removes legacy columns: term, value, category (TEXT)
--   - Uses only category_id (UUID) with FK to attribute_categories
--   - Updates normalizationService to use new schema
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop old table
-- ============================================================================

DROP TABLE IF EXISTS deadstock.dictionary_mappings CASCADE;

-- ============================================================================
-- STEP 2: Recreate with clean schema
-- ============================================================================

CREATE TABLE deadstock.dictionary_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Category (FK to attribute_categories)
  category_id UUID NOT NULL REFERENCES deadstock.attribute_categories(id) ON DELETE RESTRICT,
  
  -- Source term (from scraping)
  source_term TEXT NOT NULL,
  source_locale TEXT NOT NULL CHECK (source_locale IN ('fr', 'en', 'es', 'it')),
  
  -- Translations
  translations JSONB NOT NULL,
  -- Format: {"en": "cotton", "fr": "coton", "es": "algodón"}
  
  -- Quality metadata
  confidence DECIMAL(3,2) DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'llm_suggested', 'user_feedback')),
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
  
  -- Validation
  validated_at TIMESTAMPTZ,
  validated_by UUID,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint
  CONSTRAINT dictionary_mappings_unique_term UNIQUE (source_term, source_locale, category_id)
);

-- Indexes
CREATE INDEX idx_mappings_category ON deadstock.dictionary_mappings(category_id);
CREATE INDEX idx_mappings_source_term ON deadstock.dictionary_mappings(source_term);
CREATE INDEX idx_mappings_locale ON deadstock.dictionary_mappings(source_locale);
CREATE INDEX idx_mappings_usage ON deadstock.dictionary_mappings(usage_count DESC);

-- ============================================================================
-- STEP 3: Populate dictionaries
-- ============================================================================

DO $$
DECLARE
  fiber_id UUID;
  color_id UUID;
  pattern_id UUID;
  weave_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO fiber_id FROM deadstock.attribute_categories WHERE slug = 'fiber';
  SELECT id INTO color_id FROM deadstock.attribute_categories WHERE slug = 'color';
  SELECT id INTO pattern_id FROM deadstock.attribute_categories WHERE slug = 'pattern';
  SELECT id INTO weave_id FROM deadstock.attribute_categories WHERE slug = 'weave';

  -- ============================================================================
  -- FIBER / MATERIAL (30 terms)
  -- ============================================================================
  
  INSERT INTO deadstock.dictionary_mappings (category_id, source_term, source_locale, translations)
  VALUES
  -- Natural fibers
  (fiber_id, 'coton', 'fr', '{"en": "cotton", "fr": "coton", "es": "algodón"}'),
  (fiber_id, 'cotton', 'en', '{"en": "cotton", "fr": "coton", "es": "algodón"}'),
  (fiber_id, 'soie', 'fr', '{"en": "silk", "fr": "soie", "es": "seda"}'),
  (fiber_id, 'silk', 'en', '{"en": "silk", "fr": "soie", "es": "seda"}'),
  (fiber_id, 'laine', 'fr', '{"en": "wool", "fr": "laine", "es": "lana"}'),
  (fiber_id, 'wool', 'en', '{"en": "wool", "fr": "laine", "es": "lana"}'),
  (fiber_id, 'lin', 'fr', '{"en": "linen", "fr": "lin", "es": "lino"}'),
  (fiber_id, 'linen', 'en', '{"en": "linen", "fr": "lin", "es": "lino"}'),
  (fiber_id, 'cachemire', 'fr', '{"en": "cashmere", "fr": "cachemire", "es": "cachemira"}'),
  (fiber_id, 'cashmere', 'en', '{"en": "cashmere", "fr": "cachemire", "es": "cachemira"}'),
  (fiber_id, 'mohair', 'fr', '{"en": "mohair", "fr": "mohair", "es": "mohair"}'),
  (fiber_id, 'mohair', 'en', '{"en": "mohair", "fr": "mohair", "es": "mohair"}'),
  (fiber_id, 'alpaga', 'fr', '{"en": "alpaca", "fr": "alpaga", "es": "alpaca"}'),
  (fiber_id, 'alpaca', 'en', '{"en": "alpaca", "fr": "alpaga", "es": "alpaca"}'),
  (fiber_id, 'chanvre', 'fr', '{"en": "hemp", "fr": "chanvre", "es": "cáñamo"}'),
  (fiber_id, 'hemp', 'en', '{"en": "hemp", "fr": "chanvre", "es": "cáñamo"}'),
  (fiber_id, 'ramie', 'fr', '{"en": "ramie", "fr": "ramie", "es": "ramio"}'),
  (fiber_id, 'ramie', 'en', '{"en": "ramie", "fr": "ramie", "es": "ramio"}'),
  
  -- Semi-synthetic fibers
  (fiber_id, 'viscose', 'fr', '{"en": "viscose", "fr": "viscose", "es": "viscosa"}'),
  (fiber_id, 'viscose', 'en', '{"en": "viscose", "fr": "viscose", "es": "viscosa"}'),
  (fiber_id, 'modal', 'fr', '{"en": "modal", "fr": "modal", "es": "modal"}'),
  (fiber_id, 'modal', 'en', '{"en": "modal", "fr": "modal", "es": "modal"}'),
  (fiber_id, 'lyocell', 'fr', '{"en": "lyocell", "fr": "lyocell", "es": "lyocell"}'),
  (fiber_id, 'lyocell', 'en', '{"en": "lyocell", "fr": "lyocell", "es": "lyocell"}'),
  (fiber_id, 'tencel', 'fr', '{"en": "tencel", "fr": "tencel", "es": "tencel"}'),
  (fiber_id, 'tencel', 'en', '{"en": "tencel", "fr": "tencel", "es": "tencel"}'),
  
  -- Synthetic fibers
  (fiber_id, 'polyester', 'fr', '{"en": "polyester", "fr": "polyester", "es": "poliéster"}'),
  (fiber_id, 'polyester', 'en', '{"en": "polyester", "fr": "polyester", "es": "poliéster"}'),
  (fiber_id, 'nylon', 'fr', '{"en": "nylon", "fr": "nylon", "es": "nylon"}'),
  (fiber_id, 'nylon', 'en', '{"en": "nylon", "fr": "nylon", "es": "nylon"}'),
  (fiber_id, 'acrylique', 'fr', '{"en": "acrylic", "fr": "acrylique", "es": "acrílico"}'),
  (fiber_id, 'acrylic', 'en', '{"en": "acrylic", "fr": "acrylique", "es": "acrílico"}'),
  (fiber_id, 'élasthanne', 'fr', '{"en": "elastane", "fr": "élasthanne", "es": "elastano"}'),
  (fiber_id, 'elastane', 'en', '{"en": "elastane", "fr": "élasthanne", "es": "elastano"}'),
  (fiber_id, 'spandex', 'fr', '{"en": "spandex", "fr": "spandex", "es": "spandex"}'),
  (fiber_id, 'spandex', 'en', '{"en": "spandex", "fr": "spandex", "es": "spandex"}'),
  (fiber_id, 'lycra', 'fr', '{"en": "lycra", "fr": "lycra", "es": "lycra"}'),
  (fiber_id, 'lycra', 'en', '{"en": "lycra", "fr": "lycra", "es": "lycra"}');

  -- ============================================================================
  -- COLOR (50 terms)
  -- ============================================================================
  
  INSERT INTO deadstock.dictionary_mappings (category_id, source_term, source_locale, translations)
  VALUES
  -- Basic colors
  (color_id, 'blanc', 'fr', '{"en": "white", "fr": "blanc", "es": "blanco"}'),
  (color_id, 'white', 'en', '{"en": "white", "fr": "blanc", "es": "blanco"}'),
  (color_id, 'noir', 'fr', '{"en": "black", "fr": "noir", "es": "negro"}'),
  (color_id, 'black', 'en', '{"en": "black", "fr": "noir", "es": "negro"}'),
  (color_id, 'rouge', 'fr', '{"en": "red", "fr": "rouge", "es": "rojo"}'),
  (color_id, 'red', 'en', '{"en": "red", "fr": "rouge", "es": "rojo"}'),
  (color_id, 'bleu', 'fr', '{"en": "blue", "fr": "bleu", "es": "azul"}'),
  (color_id, 'blue', 'en', '{"en": "blue", "fr": "bleu", "es": "azul"}'),
  (color_id, 'vert', 'fr', '{"en": "green", "fr": "vert", "es": "verde"}'),
  (color_id, 'green', 'en', '{"en": "green", "fr": "vert", "es": "verde"}'),
  (color_id, 'jaune', 'fr', '{"en": "yellow", "fr": "jaune", "es": "amarillo"}'),
  (color_id, 'yellow', 'en', '{"en": "yellow", "fr": "jaune", "es": "amarillo"}'),
  (color_id, 'orange', 'fr', '{"en": "orange", "fr": "orange", "es": "naranja"}'),
  (color_id, 'orange', 'en', '{"en": "orange", "fr": "orange", "es": "naranja"}'),
  (color_id, 'rose', 'fr', '{"en": "pink", "fr": "rose", "es": "rosa"}'),
  (color_id, 'pink', 'en', '{"en": "pink", "fr": "rose", "es": "rosa"}'),
  (color_id, 'violet', 'fr', '{"en": "purple", "fr": "violet", "es": "púrpura"}'),
  (color_id, 'purple', 'en', '{"en": "purple", "fr": "violet", "es": "púrpura"}'),
  (color_id, 'gris', 'fr', '{"en": "gray", "fr": "gris", "es": "gris"}'),
  (color_id, 'gray', 'en', '{"en": "gray", "fr": "gris", "es": "gris"}'),
  (color_id, 'marron', 'fr', '{"en": "brown", "fr": "marron", "es": "marrón"}'),
  (color_id, 'brown', 'en', '{"en": "brown", "fr": "marron", "es": "marrón"}'),
  (color_id, 'beige', 'fr', '{"en": "beige", "fr": "beige", "es": "beige"}'),
  (color_id, 'beige', 'en', '{"en": "beige", "fr": "beige", "es": "beige"}'),
  
  -- Blue shades
  (color_id, 'bleu marine', 'fr', '{"en": "navy blue", "fr": "bleu marine", "es": "azul marino"}'),
  (color_id, 'navy blue', 'en', '{"en": "navy blue", "fr": "bleu marine", "es": "azul marino"}'),
  (color_id, 'turquoise', 'fr', '{"en": "turquoise", "fr": "turquoise", "es": "turquesa"}'),
  (color_id, 'turquoise', 'en', '{"en": "turquoise", "fr": "turquoise", "es": "turquesa"}'),
  (color_id, 'indigo', 'fr', '{"en": "indigo", "fr": "indigo", "es": "índigo"}'),
  (color_id, 'indigo', 'en', '{"en": "indigo", "fr": "indigo", "es": "índigo"}'),
  (color_id, 'cobalt', 'fr', '{"en": "cobalt", "fr": "cobalt", "es": "cobalto"}'),
  (color_id, 'cobalt', 'en', '{"en": "cobalt", "fr": "cobalt", "es": "cobalto"}'),
  (color_id, 'ciel', 'fr', '{"en": "sky blue", "fr": "ciel", "es": "celeste"}'),
  (color_id, 'sky blue', 'en', '{"en": "sky blue", "fr": "ciel", "es": "celeste"}'),
  
  -- Red shades
  (color_id, 'bordeaux', 'fr', '{"en": "burgundy", "fr": "bordeaux", "es": "burdeos"}'),
  (color_id, 'burgundy', 'en', '{"en": "burgundy", "fr": "bordeaux", "es": "burdeos"}'),
  (color_id, 'corail', 'fr', '{"en": "coral", "fr": "corail", "es": "coral"}'),
  (color_id, 'coral', 'en', '{"en": "coral", "fr": "corail", "es": "coral"}'),
  (color_id, 'framboise', 'fr', '{"en": "raspberry", "fr": "framboise", "es": "frambuesa"}'),
  (color_id, 'raspberry', 'en', '{"en": "raspberry", "fr": "framboise", "es": "frambuesa"}'),
  
  -- Green shades
  (color_id, 'olive', 'fr', '{"en": "olive", "fr": "olive", "es": "oliva"}'),
  (color_id, 'olive', 'en', '{"en": "olive", "fr": "olive", "es": "oliva"}'),
  (color_id, 'émeraude', 'fr', '{"en": "emerald", "fr": "émeraude", "es": "esmeralda"}'),
  (color_id, 'emerald', 'en', '{"en": "emerald", "fr": "émeraude", "es": "esmeralda"}'),
  (color_id, 'kaki', 'fr', '{"en": "khaki", "fr": "kaki", "es": "caqui"}'),
  (color_id, 'khaki', 'en', '{"en": "khaki", "fr": "kaki", "es": "caqui"}'),
  
  -- Neutral shades
  (color_id, 'crème', 'fr', '{"en": "cream", "fr": "crème", "es": "crema"}'),
  (color_id, 'cream', 'en', '{"en": "cream", "fr": "crème", "es": "crema"}'),
  (color_id, 'ivoire', 'fr', '{"en": "ivory", "fr": "ivoire", "es": "marfil"}'),
  (color_id, 'ivory', 'en', '{"en": "ivory", "fr": "ivoire", "es": "marfil"}'),
  (color_id, 'écru', 'fr', '{"en": "ecru", "fr": "écru", "es": "crudo"}'),
  (color_id, 'ecru', 'en', '{"en": "ecru", "fr": "écru", "es": "crudo"}'),
  (color_id, 'taupe', 'fr', '{"en": "taupe", "fr": "taupe", "es": "taupe"}'),
  (color_id, 'taupe', 'en', '{"en": "taupe", "fr": "taupe", "es": "taupe"}'),
  (color_id, 'anthracite', 'fr', '{"en": "charcoal", "fr": "anthracite", "es": "antracita"}'),
  (color_id, 'charcoal', 'en', '{"en": "charcoal", "fr": "anthracite", "es": "antracita"}'),
  
  -- Purple shades
  (color_id, 'lilas', 'fr', '{"en": "lilac", "fr": "lilas", "es": "lila"}'),
  (color_id, 'lilac', 'en', '{"en": "lilac", "fr": "lilas", "es": "lila"}'),
  
  -- Metallic
  (color_id, 'or', 'fr', '{"en": "gold", "fr": "or", "es": "oro"}'),
  (color_id, 'gold', 'en', '{"en": "gold", "fr": "or", "es": "oro"}'),
  (color_id, 'argent', 'fr', '{"en": "silver", "fr": "argent", "es": "plata"}'),
  (color_id, 'silver', 'en', '{"en": "silver", "fr": "argent", "es": "plata"}');

  -- ============================================================================
  -- PATTERN (20 terms)
  -- ============================================================================
  
  INSERT INTO deadstock.dictionary_mappings (category_id, source_term, source_locale, translations)
  VALUES
  -- Geometric patterns
  (pattern_id, 'uni', 'fr', '{"en": "solid", "fr": "uni", "es": "liso"}'),
  (pattern_id, 'solid', 'en', '{"en": "solid", "fr": "uni", "es": "liso"}'),
  (pattern_id, 'rayures', 'fr', '{"en": "stripes", "fr": "rayures", "es": "rayas"}'),
  (pattern_id, 'stripes', 'en', '{"en": "stripes", "fr": "rayures", "es": "rayas"}'),
  (pattern_id, 'carreaux', 'fr', '{"en": "checkered", "fr": "carreaux", "es": "cuadros"}'),
  (pattern_id, 'checkered', 'en', '{"en": "checkered", "fr": "carreaux", "es": "cuadros"}'),
  (pattern_id, 'vichy', 'fr', '{"en": "gingham", "fr": "vichy", "es": "vichy"}'),
  (pattern_id, 'gingham', 'en', '{"en": "gingham", "fr": "vichy", "es": "vichy"}'),
  (pattern_id, 'pois', 'fr', '{"en": "polka dot", "fr": "pois", "es": "lunares"}'),
  (pattern_id, 'polka dot', 'en', '{"en": "polka dot", "fr": "pois", "es": "lunares"}'),
  (pattern_id, 'chevron', 'fr', '{"en": "chevron", "fr": "chevron", "es": "chevron"}'),
  (pattern_id, 'chevron', 'en', '{"en": "chevron", "fr": "chevron", "es": "chevron"}'),
  (pattern_id, 'zigzag', 'fr', '{"en": "zigzag", "fr": "zigzag", "es": "zigzag"}'),
  (pattern_id, 'zigzag', 'en', '{"en": "zigzag", "fr": "zigzag", "es": "zigzag"}'),
  
  -- Natural patterns
  (pattern_id, 'fleurs', 'fr', '{"en": "floral", "fr": "fleurs", "es": "flores"}'),
  (pattern_id, 'fleuri', 'fr', '{"en": "floral", "fr": "fleuri", "es": "floral"}'),
  (pattern_id, 'floral', 'en', '{"en": "floral", "fr": "fleuri", "es": "floral"}'),
  (pattern_id, 'paisley', 'fr', '{"en": "paisley", "fr": "paisley", "es": "cachemir"}'),
  (pattern_id, 'paisley', 'en', '{"en": "paisley", "fr": "paisley", "es": "cachemir"}'),
  (pattern_id, 'animal', 'fr', '{"en": "animal print", "fr": "animal", "es": "animal"}'),
  (pattern_id, 'animal print', 'en', '{"en": "animal print", "fr": "animal", "es": "animal"}'),
  
  -- Print types
  (pattern_id, 'imprimé', 'fr', '{"en": "printed", "fr": "imprimé", "es": "estampado"}'),
  (pattern_id, 'printed', 'en', '{"en": "printed", "fr": "imprimé", "es": "estampado"}'),
  (pattern_id, 'abstrait', 'fr', '{"en": "abstract", "fr": "abstrait", "es": "abstracto"}'),
  (pattern_id, 'abstract', 'en', '{"en": "abstract", "fr": "abstrait", "es": "abstracto"}');

  -- ============================================================================
  -- WEAVE (15 terms)
  -- ============================================================================
  
  INSERT INTO deadstock.dictionary_mappings (category_id, source_term, source_locale, translations)
  VALUES
  -- Basic weaves
  (weave_id, 'toile', 'fr', '{"en": "plain weave", "fr": "toile", "es": "tafetán"}'),
  (weave_id, 'plain weave', 'en', '{"en": "plain weave", "fr": "toile", "es": "tafetán"}'),
  (weave_id, 'satin', 'fr', '{"en": "satin", "fr": "satin", "es": "satén"}'),
  (weave_id, 'satin', 'en', '{"en": "satin", "fr": "satin", "es": "satén"}'),
  (weave_id, 'sergé', 'fr', '{"en": "twill", "fr": "sergé", "es": "sarga"}'),
  (weave_id, 'twill', 'en', '{"en": "twill", "fr": "sergé", "es": "sarga"}'),
  
  -- Specialized weaves
  (weave_id, 'jacquard', 'fr', '{"en": "jacquard", "fr": "jacquard", "es": "jacquard"}'),
  (weave_id, 'jacquard', 'en', '{"en": "jacquard", "fr": "jacquard", "es": "jacquard"}'),
  (weave_id, 'damassé', 'fr', '{"en": "damask", "fr": "damassé", "es": "damasco"}'),
  (weave_id, 'damask', 'en', '{"en": "damask", "fr": "damassé", "es": "damasco"}'),
  (weave_id, 'brocart', 'fr', '{"en": "brocade", "fr": "brocart", "es": "brocado"}'),
  (weave_id, 'brocade', 'en', '{"en": "brocade", "fr": "brocart", "es": "brocado"}'),
  (weave_id, 'velours', 'fr', '{"en": "velvet", "fr": "velours", "es": "terciopelo"}'),
  (weave_id, 'velvet', 'en', '{"en": "velvet", "fr": "velours", "es": "terciopelo"}'),
  (weave_id, 'crêpe', 'fr', '{"en": "crepe", "fr": "crêpe", "es": "crepé"}'),
  (weave_id, 'crepe', 'en', '{"en": "crepe", "fr": "crêpe", "es": "crepé"}'),
  
  -- Knits
  (weave_id, 'jersey', 'fr', '{"en": "jersey", "fr": "jersey", "es": "jersey"}'),
  (weave_id, 'jersey', 'en', '{"en": "jersey", "fr": "jersey", "es": "jersey"}'),
  (weave_id, 'interlock', 'fr', '{"en": "interlock", "fr": "interlock", "es": "interlock"}'),
  (weave_id, 'interlock', 'en', '{"en": "interlock", "fr": "interlock", "es": "interlock"}'),
  (weave_id, 'maille', 'fr', '{"en": "knit", "fr": "maille", "es": "punto"}'),
  (weave_id, 'knit', 'en', '{"en": "knit", "fr": "maille", "es": "punto"}'),
  (weave_id, 'bouclé', 'fr', '{"en": "boucle", "fr": "bouclé", "es": "rizo"}'),
  (weave_id, 'boucle', 'en', '{"en": "boucle", "fr": "bouclé", "es": "rizo"}');

  -- Summary
  RAISE NOTICE '✅ Migration 009 completed!';
  RAISE NOTICE 'Dictionary mappings created:';
  RAISE NOTICE '  - Fiber: % mappings', (SELECT COUNT(*) FROM deadstock.dictionary_mappings WHERE category_id = fiber_id);
  RAISE NOTICE '  - Color: % mappings', (SELECT COUNT(*) FROM deadstock.dictionary_mappings WHERE category_id = color_id);
  RAISE NOTICE '  - Pattern: % mappings', (SELECT COUNT(*) FROM deadstock.dictionary_mappings WHERE category_id = pattern_id);
  RAISE NOTICE '  - Weave: % mappings', (SELECT COUNT(*) FROM deadstock.dictionary_mappings WHERE category_id = weave_id);
  RAISE NOTICE '  - Total: % mappings', (SELECT COUNT(*) FROM deadstock.dictionary_mappings);
END $$;

-- ============================================================================
-- Verification
-- ============================================================================

SELECT 
  ac.slug,
  ac.name as category_name,
  COUNT(dm.id) as mapping_count
FROM deadstock.attribute_categories ac
LEFT JOIN deadstock.dictionary_mappings dm ON dm.category_id = ac.id
GROUP BY ac.id, ac.slug, ac.name
ORDER BY ac.slug;
