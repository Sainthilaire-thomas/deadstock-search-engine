-- ============================================================================
-- Seed: Enrich Dictionary Mappings
-- ============================================================================
-- Description: Ajoute ~100 termes aux dictionnaires pour améliorer la couverture
-- Date: 31 Décembre 2025
-- 
-- Current coverage:
--   Fiber: 9 → Target: 30
--   Color: 15 → Target: 50
--   Pattern: 3 → Target: 20
--   Weave: 0 → Target: 15
-- ============================================================================

-- ============================================================================
-- 1. FIBER (Materials) - Ajouter 21 termes
-- ============================================================================

-- Get fiber category ID
DO $$
DECLARE
  fiber_id UUID;
  color_id UUID;
  pattern_id UUID;
  weave_id UUID;
BEGIN
  -- Récupérer les IDs des catégories
  SELECT id INTO fiber_id FROM deadstock.attribute_categories WHERE slug = 'fiber';
  SELECT id INTO color_id FROM deadstock.attribute_categories WHERE slug = 'color';
  SELECT id INTO pattern_id FROM deadstock.attribute_categories WHERE slug = 'pattern';
  SELECT id INTO weave_id FROM deadstock.attribute_categories WHERE slug = 'weave';

  -- ============================================================================
  -- FIBER - Fibres naturelles
  -- ============================================================================
  
  INSERT INTO deadstock.dictionary_mappings (category_id, source_term, source_locale, translations, usage_count)
  VALUES
  -- Fibres naturelles
  (fiber_id, 'soie', 'fr', '{"en": "silk", "fr": "soie", "es": "seda"}', 0),
  (fiber_id, 'silk', 'en', '{"en": "silk", "fr": "soie", "es": "seda"}', 0),
  (fiber_id, 'viscose', 'fr', '{"en": "viscose", "fr": "viscose", "es": "viscosa"}', 0),
  (fiber_id, 'viscose', 'en', '{"en": "viscose", "fr": "viscose", "es": "viscosa"}', 0),
  (fiber_id, 'modal', 'fr', '{"en": "modal", "fr": "modal", "es": "modal"}', 0),
  (fiber_id, 'modal', 'en', '{"en": "modal", "fr": "modal", "es": "modal"}', 0),
  (fiber_id, 'lyocell', 'fr', '{"en": "lyocell", "fr": "lyocell", "es": "lyocell"}', 0),
  (fiber_id, 'lyocell', 'en', '{"en": "lyocell", "fr": "lyocell", "es": "lyocell"}', 0),
  (fiber_id, 'tencel', 'fr', '{"en": "tencel", "fr": "tencel", "es": "tencel"}', 0),
  (fiber_id, 'tencel', 'en', '{"en": "tencel", "fr": "tencel", "es": "tencel"}', 0),
  
  -- Fibres synthétiques
  (fiber_id, 'nylon', 'fr', '{"en": "nylon", "fr": "nylon", "es": "nylon"}', 0),
  (fiber_id, 'nylon', 'en', '{"en": "nylon", "fr": "nylon", "es": "nylon"}', 0),
  (fiber_id, 'acrylique', 'fr', '{"en": "acrylic", "fr": "acrylique", "es": "acrílico"}', 0),
  (fiber_id, 'acrylic', 'en', '{"en": "acrylic", "fr": "acrylique", "es": "acrílico"}', 0),
  (fiber_id, 'spandex', 'fr', '{"en": "spandex", "fr": "spandex", "es": "spandex"}', 0),
  (fiber_id, 'spandex', 'en', '{"en": "spandex", "fr": "spandex", "es": "spandex"}', 0),
  (fiber_id, 'lycra', 'fr', '{"en": "lycra", "fr": "lycra", "es": "lycra"}', 0),
  (fiber_id, 'lycra', 'en', '{"en": "lycra", "fr": "lycra", "es": "lycra"}', 0),
  
  -- Fibres spécialisées
  (fiber_id, 'mohair', 'fr', '{"en": "mohair", "fr": "mohair", "es": "mohair"}', 0),
  (fiber_id, 'mohair', 'en', '{"en": "mohair", "fr": "mohair", "es": "mohair"}', 0),
  (fiber_id, 'alpaga', 'fr', '{"en": "alpaca", "fr": "alpaga", "es": "alpaca"}', 0),
  (fiber_id, 'alpaca', 'en', '{"en": "alpaca", "fr": "alpaga", "es": "alpaca"}', 0),
  (fiber_id, 'chanvre', 'fr', '{"en": "hemp", "fr": "chanvre", "es": "cáñamo"}', 0),
  (fiber_id, 'hemp', 'en', '{"en": "hemp", "fr": "chanvre", "es": "cáñamo"}', 0),
  (fiber_id, 'ramie', 'fr', '{"en": "ramie", "fr": "ramie", "es": "ramio"}', 0),
  (fiber_id, 'ramie', 'en', '{"en": "ramie", "fr": "ramie", "es": "ramio"}', 0)
  
  ON CONFLICT (source_term, source_locale, category_id) DO NOTHING;

  -- ============================================================================
  -- COLOR - Couleurs de base et nuances
  -- ============================================================================
  
  INSERT INTO deadstock.dictionary_mappings (category_id, source_term, source_locale, translations, usage_count)
  VALUES
  -- Couleurs de base manquantes
  (color_id, 'rouge', 'fr', '{"en": "red", "fr": "rouge", "es": "rojo"}', 0),
  (color_id, 'red', 'en', '{"en": "red", "fr": "rouge", "es": "rojo"}', 0),
  (color_id, 'vert', 'fr', '{"en": "green", "fr": "vert", "es": "verde"}', 0),
  (color_id, 'green', 'en', '{"en": "green", "fr": "vert", "es": "verde"}', 0),
  (color_id, 'jaune', 'fr', '{"en": "yellow", "fr": "jaune", "es": "amarillo"}', 0),
  (color_id, 'yellow', 'en', '{"en": "yellow", "fr": "jaune", "es": "amarillo"}', 0),
  (color_id, 'orange', 'fr', '{"en": "orange", "fr": "orange", "es": "naranja"}', 0),
  (color_id, 'orange', 'en', '{"en": "orange", "fr": "orange", "es": "naranja"}', 0),
  (color_id, 'rose', 'fr', '{"en": "pink", "fr": "rose", "es": "rosa"}', 0),
  (color_id, 'pink', 'en', '{"en": "pink", "fr": "rose", "es": "rosa"}', 0),
  (color_id, 'violet', 'fr', '{"en": "purple", "fr": "violet", "es": "púrpura"}', 0),
  (color_id, 'purple', 'en', '{"en": "purple", "fr": "violet", "es": "púrpura"}', 0),
  (color_id, 'gris', 'fr', '{"en": "gray", "fr": "gris", "es": "gris"}', 0),
  (color_id, 'gray', 'en', '{"en": "gray", "fr": "gris", "es": "gris"}', 0),
  (color_id, 'marron', 'fr', '{"en": "brown", "fr": "marron", "es": "marrón"}', 0),
  (color_id, 'brown', 'en', '{"en": "brown", "fr": "marron", "es": "marrón"}', 0),
  
  -- Nuances de bleu
  (color_id, 'turquoise', 'fr', '{"en": "turquoise", "fr": "turquoise", "es": "turquesa"}', 0),
  (color_id, 'turquoise', 'en', '{"en": "turquoise", "fr": "turquoise", "es": "turquesa"}', 0),
  (color_id, 'indigo', 'fr', '{"en": "indigo", "fr": "indigo", "es": "índigo"}', 0),
  (color_id, 'indigo', 'en', '{"en": "indigo", "fr": "indigo", "es": "índigo"}', 0),
  (color_id, 'cobalt', 'fr', '{"en": "cobalt", "fr": "cobalt", "es": "cobalto"}', 0),
  (color_id, 'cobalt', 'en', '{"en": "cobalt", "fr": "cobalt", "es": "cobalto"}', 0),
  
  -- Nuances de rouge
  (color_id, 'bordeaux', 'fr', '{"en": "burgundy", "fr": "bordeaux", "es": "burdeos"}', 0),
  (color_id, 'burgundy', 'en', '{"en": "burgundy", "fr": "bordeaux", "es": "burdeos"}', 0),
  (color_id, 'corail', 'fr', '{"en": "coral", "fr": "corail", "es": "coral"}', 0),
  (color_id, 'coral', 'en', '{"en": "coral", "fr": "corail", "es": "coral"}', 0),
  (color_id, 'framboise', 'fr', '{"en": "raspberry", "fr": "framboise", "es": "frambuesa"}', 0),
  (color_id, 'raspberry', 'en', '{"en": "raspberry", "fr": "framboise", "es": "frambuesa"}', 0),
  
  -- Nuances de vert
  (color_id, 'olive', 'fr', '{"en": "olive", "fr": "olive", "es": "oliva"}', 0),
  (color_id, 'olive', 'en', '{"en": "olive", "fr": "olive", "es": "oliva"}', 0),
  (color_id, 'émeraude', 'fr', '{"en": "emerald", "fr": "émeraude", "es": "esmeralda"}', 0),
  (color_id, 'emerald', 'en', '{"en": "emerald", "fr": "émeraude", "es": "esmeralda"}', 0),
  (color_id, 'kaki', 'fr', '{"en": "khaki", "fr": "kaki", "es": "caqui"}', 0),
  (color_id, 'khaki', 'en', '{"en": "khaki", "fr": "kaki", "es": "caqui"}', 0),
  
  -- Nuances neutres
  (color_id, 'crème', 'fr', '{"en": "cream", "fr": "crème", "es": "crema"}', 0),
  (color_id, 'cream', 'en', '{"en": "cream", "fr": "crème", "es": "crema"}', 0),
  (color_id, 'ivoire', 'fr', '{"en": "ivory", "fr": "ivoire", "es": "marfil"}', 0),
  (color_id, 'ivory', 'en', '{"en": "ivory", "fr": "ivoire", "es": "marfil"}', 0),
  (color_id, 'taupe', 'fr', '{"en": "taupe", "fr": "taupe", "es": "taupe"}', 0),
  (color_id, 'taupe', 'en', '{"en": "taupe", "fr": "taupe", "es": "taupe"}', 0),
  (color_id, 'anthracite', 'fr', '{"en": "charcoal", "fr": "anthracite", "es": "antracita"}', 0),
  (color_id, 'charcoal', 'en', '{"en": "charcoal", "fr": "anthracite", "es": "antracita"}', 0),
  
  -- Couleurs métalliques
  (color_id, 'or', 'fr', '{"en": "gold", "fr": "or", "es": "oro"}', 0),
  (color_id, 'gold', 'en', '{"en": "gold", "fr": "or", "es": "oro"}', 0),
  (color_id, 'argent', 'fr', '{"en": "silver", "fr": "argent", "es": "plata"}', 0),
  (color_id, 'silver', 'en', '{"en": "silver", "fr": "argent", "es": "plata"}', 0)
  
  ON CONFLICT (source_term, source_locale, category_id) DO NOTHING;

  -- ============================================================================
  -- PATTERN - Motifs et imprimés
  -- ============================================================================
  
  INSERT INTO deadstock.dictionary_mappings (category_id, source_term, source_locale, translations, usage_count)
  VALUES
  -- Motifs géométriques
  (pattern_id, 'uni', 'fr', '{"en": "solid", "fr": "uni", "es": "liso"}', 0),
  (pattern_id, 'solid', 'en', '{"en": "solid", "fr": "uni", "es": "liso"}', 0),
  (pattern_id, 'carreaux', 'fr', '{"en": "checkered", "fr": "carreaux", "es": "cuadros"}', 0),
  (pattern_id, 'checkered', 'en', '{"en": "checkered", "fr": "carreaux", "es": "cuadros"}', 0),
  (pattern_id, 'vichy', 'fr', '{"en": "gingham", "fr": "vichy", "es": "vichy"}', 0),
  (pattern_id, 'gingham', 'en', '{"en": "gingham", "fr": "vichy", "es": "vichy"}', 0),
  (pattern_id, 'pois', 'fr', '{"en": "polka dot", "fr": "pois", "es": "lunares"}', 0),
  (pattern_id, 'polka dot', 'en', '{"en": "polka dot", "fr": "pois", "es": "lunares"}', 0),
  (pattern_id, 'chevron', 'fr', '{"en": "chevron", "fr": "chevron", "es": "chevron"}', 0),
  (pattern_id, 'chevron', 'en', '{"en": "chevron", "fr": "chevron", "es": "chevron"}', 0),
  (pattern_id, 'zigzag', 'fr', '{"en": "zigzag", "fr": "zigzag", "es": "zigzag"}', 0),
  (pattern_id, 'zigzag', 'en', '{"en": "zigzag", "fr": "zigzag", "es": "zigzag"}', 0),
  
  -- Motifs naturels
  (pattern_id, 'fleuri', 'fr', '{"en": "floral", "fr": "fleuri", "es": "floral"}', 0),
  (pattern_id, 'floral', 'en', '{"en": "floral", "fr": "fleuri", "es": "floral"}', 0),
  (pattern_id, 'paisley', 'fr', '{"en": "paisley", "fr": "paisley", "es": "cachemir"}', 0),
  (pattern_id, 'paisley', 'en', '{"en": "paisley", "fr": "paisley", "es": "cachemir"}', 0),
  (pattern_id, 'animal', 'fr', '{"en": "animal print", "fr": "animal", "es": "animal"}', 0),
  (pattern_id, 'animal print', 'en', '{"en": "animal print", "fr": "animal", "es": "animal"}', 0),
  
  -- Imprimés
  (pattern_id, 'imprimé', 'fr', '{"en": "printed", "fr": "imprimé", "es": "estampado"}', 0),
  (pattern_id, 'printed', 'en', '{"en": "printed", "fr": "imprimé", "es": "estampado"}', 0),
  (pattern_id, 'abstrait', 'fr', '{"en": "abstract", "fr": "abstrait", "es": "abstracto"}', 0),
  (pattern_id, 'abstract', 'en', '{"en": "abstract", "fr": "abstrait", "es": "abstracto"}', 0)
  
  ON CONFLICT (source_term, source_locale, category_id) DO NOTHING;

  -- ============================================================================
  -- WEAVE - Types de tissage
  -- ============================================================================
  
  INSERT INTO deadstock.dictionary_mappings (category_id, source_term, source_locale, translations, usage_count)
  VALUES
  -- Tissages de base
  (weave_id, 'toile', 'fr', '{"en": "plain weave", "fr": "toile", "es": "tela"}', 0),
  (weave_id, 'plain weave', 'en', '{"en": "plain weave", "fr": "toile", "es": "tela"}', 0),
  (weave_id, 'satin', 'fr', '{"en": "satin", "fr": "satin", "es": "satén"}', 0),
  (weave_id, 'satin', 'en', '{"en": "satin", "fr": "satin", "es": "satén"}', 0),
  (weave_id, 'sergé', 'fr', '{"en": "twill", "fr": "sergé", "es": "sarga"}', 0),
  (weave_id, 'twill', 'en', '{"en": "twill", "fr": "sergé", "es": "sarga"}', 0),
  
  -- Tissages spécialisés
  (weave_id, 'jacquard', 'fr', '{"en": "jacquard", "fr": "jacquard", "es": "jacquard"}', 0),
  (weave_id, 'jacquard', 'en', '{"en": "jacquard", "fr": "jacquard", "es": "jacquard"}', 0),
  (weave_id, 'damassé', 'fr', '{"en": "damask", "fr": "damassé", "es": "damasco"}', 0),
  (weave_id, 'damask', 'en', '{"en": "damask", "fr": "damassé", "es": "damasco"}', 0),
  (weave_id, 'brocart', 'fr', '{"en": "brocade", "fr": "brocart", "es": "brocado"}', 0),
  (weave_id, 'brocade', 'en', '{"en": "brocade", "fr": "brocart", "es": "brocado"}', 0),
  (weave_id, 'velours', 'fr', '{"en": "velvet", "fr": "velours", "es": "terciopelo"}', 0),
  (weave_id, 'velvet', 'en', '{"en": "velvet", "fr": "velours", "es": "terciopelo"}', 0),
  
  -- Mailles et tricots
  (weave_id, 'jersey', 'fr', '{"en": "jersey", "fr": "jersey", "es": "jersey"}', 0),
  (weave_id, 'jersey', 'en', '{"en": "jersey", "fr": "jersey", "es": "jersey"}', 0),
  (weave_id, 'interlock', 'fr', '{"en": "interlock", "fr": "interlock", "es": "interlock"}', 0),
  (weave_id, 'interlock', 'en', '{"en": "interlock", "fr": "interlock", "es": "interlock"}', 0),
  (weave_id, 'bouclé', 'fr', '{"en": "boucle", "fr": "bouclé", "es": "rizo"}', 0),
  (weave_id, 'boucle', 'en', '{"en": "boucle", "fr": "bouclé", "es": "rizo"}', 0),
  (weave_id, 'maille', 'fr', '{"en": "knit", "fr": "maille", "es": "punto"}', 0),
  (weave_id, 'knit', 'en', '{"en": "knit", "fr": "maille", "es": "punto"}', 0)
  
  ON CONFLICT (source_term, source_locale, category_id) DO NOTHING;

  -- Afficher résumé
  RAISE NOTICE '✅ Dictionary enrichment completed!';
  RAISE NOTICE 'Fiber: % mappings', (SELECT COUNT(*) FROM deadstock.dictionary_mappings WHERE category_id = fiber_id);
  RAISE NOTICE 'Color: % mappings', (SELECT COUNT(*) FROM deadstock.dictionary_mappings WHERE category_id = color_id);
  RAISE NOTICE 'Pattern: % mappings', (SELECT COUNT(*) FROM deadstock.dictionary_mappings WHERE category_id = pattern_id);
  RAISE NOTICE 'Weave: % mappings', (SELECT COUNT(*) FROM deadstock.dictionary_mappings WHERE category_id = weave_id);
END $$;

-- ============================================================================
-- Vérification finale
-- ============================================================================

SELECT 
  ac.slug,
  ac.name as category_name,
  COUNT(dm.id) as mapping_count
FROM deadstock.attribute_categories ac
LEFT JOIN deadstock.dictionary_mappings dm ON dm.category_id = ac.id
GROUP BY ac.id, ac.slug, ac.name
ORDER BY ac.slug;
