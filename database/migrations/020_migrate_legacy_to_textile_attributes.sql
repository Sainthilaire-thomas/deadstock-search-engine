-- ============================================
-- Migration 016: Peupler textile_attributes depuis colonnes legacy
-- Date: 7 Janvier 2026
-- ADR-024: Textile Standard System
-- ============================================
-- 
-- Description:
-- Cette migration peuple la table textile_attributes à partir des 
-- colonnes legacy (material_type, color, pattern) de la table textiles.
-- C'est la première étape vers l'architecture EAV + Vue Matérialisée.
--
-- Colonnes migrées:
-- - material_type → fiber (category_slug)
-- - color → color (category_slug)  
-- - pattern → pattern (category_slug)
--
-- Les colonnes legacy sont conservées pour rétrocompatibilité.
-- Elles seront supprimées dans une migration future (Phase 5).
--
-- ============================================

-- 1. Vérifier l'état avant migration
DO $$
BEGIN
  RAISE NOTICE 'AVANT MIGRATION: % rows dans textile_attributes', 
    (SELECT COUNT(*) FROM deadstock.textile_attributes);
END $$;

-- 2. Migrer FIBER (material_type → fiber)
INSERT INTO deadstock.textile_attributes 
  (textile_id, category_id, category_slug, value, source_term, source_locale, confidence)
SELECT 
  t.id,
  'd68146d7-46a0-4dc4-8283-388e5d83e979',  -- fiber UUID
  'fiber',
  t.material_type,
  t.material_original,
  COALESCE(s.source_locale, 'fr'),
  COALESCE(t.material_confidence, 1.0)
FROM deadstock.textiles t
LEFT JOIN deadstock.sites s ON t.site_id = s.id
WHERE t.material_type IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Migrer COLOR
INSERT INTO deadstock.textile_attributes 
  (textile_id, category_id, category_slug, value, source_term, source_locale, confidence)
SELECT 
  t.id,
  '4c5841b1-430a-4501-9f0e-1d978869a77d',  -- color UUID
  'color',
  t.color,
  t.color_original,
  COALESCE(s.source_locale, 'fr'),
  COALESCE(t.color_confidence, 1.0)
FROM deadstock.textiles t
LEFT JOIN deadstock.sites s ON t.site_id = s.id
WHERE t.color IS NOT NULL
ON CONFLICT DO NOTHING;

-- 4. Migrer PATTERN
INSERT INTO deadstock.textile_attributes 
  (textile_id, category_id, category_slug, value, source_term, source_locale, confidence)
SELECT 
  t.id,
  'be7768ee-cad6-48fc-adb9-30000296642a',  -- pattern UUID
  'pattern',
  t.pattern,
  t.pattern_original,
  COALESCE(s.source_locale, 'fr'),
  COALESCE(t.pattern_confidence, 1.0)
FROM deadstock.textiles t
LEFT JOIN deadstock.sites s ON t.site_id = s.id
WHERE t.pattern IS NOT NULL
ON CONFLICT DO NOTHING;

-- 5. Afficher le résultat
DO $$
DECLARE
  fiber_count INTEGER;
  color_count INTEGER;
  pattern_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fiber_count FROM deadstock.textile_attributes WHERE category_slug = 'fiber';
  SELECT COUNT(*) INTO color_count FROM deadstock.textile_attributes WHERE category_slug = 'color';
  SELECT COUNT(*) INTO pattern_count FROM deadstock.textile_attributes WHERE category_slug = 'pattern';
  SELECT COUNT(*) INTO total_count FROM deadstock.textile_attributes;
  
  RAISE NOTICE 'APRÈS MIGRATION:';
  RAISE NOTICE '  - fiber: % rows', fiber_count;
  RAISE NOTICE '  - color: % rows', color_count;
  RAISE NOTICE '  - pattern: % rows', pattern_count;
  RAISE NOTICE '  - TOTAL: % rows', total_count;
END $$;

-- 6. Requête de vérification (à exécuter manuellement)
-- SELECT 
--   category_slug,
--   COUNT(*) as count,
--   ROUND(AVG(confidence)::numeric, 2) as avg_confidence
-- FROM deadstock.textile_attributes
-- GROUP BY category_slug
-- ORDER BY category_slug;
