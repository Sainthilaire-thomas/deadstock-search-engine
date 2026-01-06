-- Migration 017: Create imported_patterns table
-- Pattern Import feature - Session 16

-- ============================================
-- TABLE: imported_patterns
-- ============================================

CREATE TABLE IF NOT EXISTS deadstock.imported_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ownership (même pattern que favorites/boards)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  
  -- Metadata
  name TEXT NOT NULL,
  brand TEXT,
  garment_type TEXT,
  
  -- File
  file_url TEXT,
  file_type TEXT CHECK (file_type IN ('pdf', 'image')),
  file_size_bytes INTEGER,
  page_count INTEGER,
  
  -- Analysis result (JSONB for flexibility)
  analysis_result JSONB,
  precision_level INTEGER CHECK (precision_level IN (1, 2, 3)),
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraint: must have owner
  CONSTRAINT imported_patterns_owner CHECK (
    user_id IS NOT NULL OR session_id IS NOT NULL
  )
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_imported_patterns_user_id 
  ON deadstock.imported_patterns(user_id);
  
CREATE INDEX IF NOT EXISTS idx_imported_patterns_session_id 
  ON deadstock.imported_patterns(session_id);
  
CREATE INDEX IF NOT EXISTS idx_imported_patterns_created_at 
  ON deadstock.imported_patterns(created_at DESC);

-- ============================================
-- TRIGGER: updated_at
-- ============================================

CREATE TRIGGER set_imported_patterns_updated_at
  BEFORE UPDATE ON deadstock.imported_patterns
  FOR EACH ROW
  EXECUTE FUNCTION deadstock.set_updated_at();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE deadstock.imported_patterns ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own patterns (by user_id or session_id)
CREATE POLICY "imported_patterns_access" ON deadstock.imported_patterns
  FOR ALL USING (
    user_id = auth.uid() 
    OR session_id = current_setting('app.session_id', true)
  );

-- ============================================
-- GRANTS
-- ============================================

GRANT ALL ON deadstock.imported_patterns TO authenticated;
GRANT ALL ON deadstock.imported_patterns TO anon;
