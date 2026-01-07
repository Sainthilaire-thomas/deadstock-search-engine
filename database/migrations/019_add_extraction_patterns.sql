-- Migration 019: Add extraction_patterns to site_profiles
-- Date: 2026-01-06
-- Purpose: Store detected extraction patterns for dimensions (length, width, weight)

ALTER TABLE deadstock.site_profiles 
ADD COLUMN IF NOT EXISTS extraction_patterns JSONB 
DEFAULT '{"patterns": [], "analyzedAt": null, "productsAnalyzed": 0}'::jsonb;

COMMENT ON COLUMN deadstock.site_profiles.extraction_patterns IS 
'Patterns détectés pour extraction dimensions (longueur, largeur, poids). Format: {patterns: ExtractionPattern[], analyzedAt: string, productsAnalyzed: number}';

-- Index pour rechercher les sites avec patterns activés (optionnel)
-- CREATE INDEX idx_site_profiles_has_patterns ON deadstock.site_profiles ((extraction_patterns->'patterns') IS NOT NULL);
