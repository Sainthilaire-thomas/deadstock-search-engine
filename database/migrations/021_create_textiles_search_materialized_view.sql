-- ============================================
-- Migration 021: Créer vue matérialisée textiles_search
-- Date: 7 Janvier 2026
-- ADR-024: Textile Standard System
-- ============================================
--
-- Description:
-- Crée une vue matérialisée optimisée pour les requêtes de recherche.
-- Les attributs sont pivotés depuis textile_attributes pour permettre
-- des requêtes avec filtres multiples performantes (index B-tree).
--
-- Performance attendue:
-- - 100K textiles: ~5-10ms
-- - 500K textiles: ~20-50ms  
-- - 1M+ textiles: ~50-100ms
--
-- Refresh:
-- À exécuter après chaque scraping (nuit):
-- REFRESH MATERIALIZED VIEW CONCURRENTLY deadstock.textiles_search;
--
-- ============================================

-- 1. Supprimer si existe (pour pouvoir recréer)
DROP MATERIALIZED VIEW IF EXISTS deadstock.textiles_search;

-- 2. Créer la vue matérialisée
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
  t.site_id,
  
  -- Prix
  t.price_value,
  t.price_currency,
  t.price_per_unit,
  t.price_per_unit_label,
  
  -- Dimensions physiques
  t.width_value,
  t.width_unit,
  t.weight_value,
  t.weight_unit,
  
  -- Disponibilité
  t.quantity_value,
  t.quantity_unit,
  t.minimum_order_value,
  t.minimum_order_unit,
  t.available,
  
  -- Fournisseur
  t.supplier_name,
  t.supplier_location,
  
  -- Métadonnées
  t.created_at,
  t.updated_at,
  t.scraped_at,
  t.data_quality_score,
  
  -- Attributs pivotés depuis textile_attributes
  MAX(CASE WHEN ta.category_slug = 'fiber' THEN ta.value END) as fiber,
  MAX(CASE WHEN ta.category_slug = 'color' THEN ta.value END) as color,
  MAX(CASE WHEN ta.category_slug = 'pattern' THEN ta.value END) as pattern,
  MAX(CASE WHEN ta.category_slug = 'weave' THEN ta.value END) as weave,
  
  -- Confidence scores (pour affichage qualité)
  MAX(CASE WHEN ta.category_slug = 'fiber' THEN ta.confidence END) as fiber_confidence,
  MAX(CASE WHEN ta.category_slug = 'color' THEN ta.confidence END) as color_confidence,
  MAX(CASE WHEN ta.category_slug = 'pattern' THEN ta.confidence END) as pattern_confidence,
  MAX(CASE WHEN ta.category_slug = 'weave' THEN ta.confidence END) as weave_confidence

FROM deadstock.textiles t
LEFT JOIN deadstock.textile_attributes ta ON t.id = ta.textile_id
WHERE t.available = true
GROUP BY t.id;

-- 3. Index unique requis pour REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_textiles_search_id ON deadstock.textiles_search(id);

-- 4. Index pour filtres de recherche
CREATE INDEX idx_textiles_search_fiber ON deadstock.textiles_search(fiber);
CREATE INDEX idx_textiles_search_color ON deadstock.textiles_search(color);
CREATE INDEX idx_textiles_search_pattern ON deadstock.textiles_search(pattern);
CREATE INDEX idx_textiles_search_weave ON deadstock.textiles_search(weave);

-- 5. Index pour filtres numériques
CREATE INDEX idx_textiles_search_price ON deadstock.textiles_search(price_value);
CREATE INDEX idx_textiles_search_width ON deadstock.textiles_search(width_value);
CREATE INDEX idx_textiles_search_weight ON deadstock.textiles_search(weight_value);
CREATE INDEX idx_textiles_search_quantity ON deadstock.textiles_search(quantity_value);

-- 6. Index pour tri et pagination
CREATE INDEX idx_textiles_search_created ON deadstock.textiles_search(created_at DESC);
CREATE INDEX idx_textiles_search_site ON deadstock.textiles_search(site_id);

-- 7. Index composite pour requêtes fréquentes
CREATE INDEX idx_textiles_search_fiber_color ON deadstock.textiles_search(fiber, color);

-- 8. Commentaire sur la vue
COMMENT ON MATERIALIZED VIEW deadstock.textiles_search IS 
'Vue matérialisée optimisée pour recherche. Refresh après scraping avec: REFRESH MATERIALIZED VIEW CONCURRENTLY deadstock.textiles_search;';

-- 9. Vérification
DO $$
DECLARE
  total_count INTEGER;
  with_fiber INTEGER;
  with_color INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM deadstock.textiles_search;
  SELECT COUNT(*) INTO with_fiber FROM deadstock.textiles_search WHERE fiber IS NOT NULL;
  SELECT COUNT(*) INTO with_color FROM deadstock.textiles_search WHERE color IS NOT NULL;
  
  RAISE NOTICE 'Vue textiles_search créée:';
  RAISE NOTICE '  - Total: % textiles', total_count;
  RAISE NOTICE '  - Avec fiber: %', with_fiber;
  RAISE NOTICE '  - Avec color: %', with_color;
END $$;
