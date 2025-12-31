-- Migration 004: Dictionary Mappings Table
-- Date: 2025-12-28
-- Description: Table pour stocker les mappings validés (remplace fichiers TS)

-- =====================================================
-- 1. TABLE DICTIONARY_MAPPINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS deadstock.dictionary_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Mapping
  term TEXT NOT NULL,
  value TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('material', 'color', 'pattern')),
  
  -- Metadata
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'llm_suggested', 'user_feedback')),
  confidence FLOAT DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  validated_at TIMESTAMP DEFAULT NOW(),
  validated_by TEXT,
  notes TEXT,
  
  -- Stats
  usage_count INT DEFAULT 0 CHECK (usage_count >= 0),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Contrainte unicité
  UNIQUE(term, category)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dict_category 
  ON deadstock.dictionary_mappings(category);

CREATE INDEX IF NOT EXISTS idx_dict_term 
  ON deadstock.dictionary_mappings(term);

CREATE INDEX IF NOT EXISTS idx_dict_usage 
  ON deadstock.dictionary_mappings(usage_count DESC);

-- Commentaires
COMMENT ON TABLE deadstock.dictionary_mappings IS 
  'Mappings validés pour normalisation FR→EN (remplace dictionnaires TS)';

-- =====================================================
-- 2. FUNCTION AUTO-UPDATE TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION deadstock.update_dictionary_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS dictionary_mappings_updated_at ON deadstock.dictionary_mappings;

CREATE TRIGGER dictionary_mappings_updated_at
  BEFORE UPDATE ON deadstock.dictionary_mappings
  FOR EACH ROW
  EXECUTE FUNCTION deadstock.update_dictionary_timestamp();

-- =====================================================
-- 3. FUNCTION INCREMENT USAGE
-- =====================================================

CREATE OR REPLACE FUNCTION deadstock.increment_mapping_usage(
  p_mapping_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE deadstock.dictionary_mappings
  SET usage_count = usage_count + 1
  WHERE id = p_mapping_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. PERMISSIONS
-- =====================================================

GRANT ALL ON deadstock.dictionary_mappings TO service_role;
GRANT SELECT ON deadstock.dictionary_mappings TO anon, authenticated;

-- =====================================================
-- 5. SEED DATA
-- =====================================================

INSERT INTO deadstock.dictionary_mappings (term, value, category, source, confidence, validated_by)
VALUES
  -- Materials
  ('coton', 'cotton', 'material', 'manual', 1.0, 'thomas'),
  ('soie', 'silk', 'material', 'manual', 1.0, 'thomas'),
  ('laine', 'wool', 'material', 'manual', 1.0, 'thomas'),
  ('cachemire', 'cashmere', 'material', 'manual', 1.0, 'thomas'),
  ('viscose', 'viscose', 'material', 'manual', 1.0, 'thomas'),
  ('polyester', 'polyester', 'material', 'manual', 1.0, 'thomas'),
  ('élasthanne', 'elastane', 'material', 'manual', 1.0, 'thomas'),
  ('lin', 'linen', 'material', 'manual', 1.0, 'thomas'),
  ('crêpe', 'crepe', 'material', 'manual', 1.0, 'thomas'),
  
  -- Colors
  ('blanc', 'white', 'color', 'manual', 1.0, 'thomas'),
  ('noir', 'black', 'color', 'manual', 1.0, 'thomas'),
  ('bleu', 'blue', 'color', 'manual', 1.0, 'thomas'),
  ('bleu marine', 'navy blue', 'color', 'manual', 1.0, 'thomas'),
  ('rouge', 'red', 'color', 'manual', 1.0, 'thomas'),
  ('rose', 'pink', 'color', 'manual', 1.0, 'thomas'),
  ('vert', 'green', 'color', 'manual', 1.0, 'thomas'),
  ('beige', 'beige', 'color', 'manual', 1.0, 'thomas'),
  ('lilas', 'lilac', 'color', 'manual', 1.0, 'thomas'),
  ('écru', 'ecru', 'color', 'manual', 1.0, 'thomas'),
  ('ciel', 'sky blue', 'color', 'manual', 1.0, 'thomas'),
  
  -- Patterns
  ('rayures', 'stripes', 'pattern', 'manual', 1.0, 'thomas'),
  ('fleurs', 'floral', 'pattern', 'manual', 1.0, 'thomas'),
  ('uni', 'solid', 'pattern', 'manual', 1.0, 'thomas')
ON CONFLICT (term, category) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE 'Migration 004 complete!';
  RAISE NOTICE 'Table created: deadstock.dictionary_mappings';
END $$;
