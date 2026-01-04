-- Migration: 014_create_projects_table.sql
-- Description: Create projects table for designer journey with mood board, garments, and calculations
-- Date: 2026-01-03
-- Session: 10

-- ============================================
-- TABLE: projects
-- Designer projects for the journey workflow
-- ============================================

CREATE TABLE IF NOT EXISTS deadstock.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ============================================
  -- OWNERSHIP
  -- Supports both authenticated users and anonymous sessions
  -- ============================================
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,  -- For anonymous users, stored in httpOnly cookie
  
  -- ============================================
  -- BASIC INFO
  -- ============================================
  name TEXT NOT NULL,
  name_i18n JSONB DEFAULT '{}',  -- {"fr": "Ma collection", "en": "My collection"}
  description TEXT,
  description_i18n JSONB DEFAULT '{}',
  project_type TEXT NOT NULL DEFAULT 'single_piece',
  
  -- ============================================
  -- STATUS & PROGRESS
  -- ============================================
  status TEXT NOT NULL DEFAULT 'draft',
  current_step TEXT NOT NULL DEFAULT 'idea',
  
  -- ============================================
  -- STEP 2: INSPIRATION DATA (Mood Board)
  -- ============================================
  mood_board JSONB DEFAULT '[]',
  -- Array of MoodBoardItem:
  -- {
  --   id: string,
  --   type: 'image' | 'color' | 'textile' | 'note',
  --   position: { x: number, y: number },
  --   size: { width: number, height: number },
  --   zIndex: number,
  --   data: {
  --     url?: string,           -- For images
  --     color?: string,         -- For color swatches (#hex)
  --     textileId?: string,     -- For textile references
  --     text?: string,          -- For notes
  --     caption?: string        -- Optional caption
  --   }
  -- }
  
  color_palette JSONB,
  -- {
  --   primary: "#E07A5F",
  --   secondary: ["#3D405B", "#81B29A"],
  --   accent: "#F2CC8F",
  --   neutral: "#F4F1DE"
  -- }
  
  style_keywords TEXT[] DEFAULT '{}',  -- ['elegant', 'minimalist', 'bohemian']
  
  reference_images JSONB DEFAULT '[]',
  -- Array of { url: string, caption?: string, extractedColors?: string[] }
  
  -- ============================================
  -- STEP 3: DESIGN DATA (Garments)
  -- ============================================
  garments JSONB DEFAULT '[]',
  -- Array of GarmentConfig:
  -- {
  --   id: string,
  --   type: 'dress' | 'shirt' | 'pants' | etc.,
  --   name?: string,            -- Custom name for this garment
  --   size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL',
  --   quantity: number,
  --   variations: {
  --     length?: 'mini' | 'midi' | 'maxi' | 'standard',
  --     sleeves?: 'none' | 'short' | 'three_quarter' | 'long',
  --     neckline?: 'round' | 'v' | 'square' | 'boat' | 'collar',
  --     lining?: boolean,
  --     patternMatching?: boolean
  --   },
  --   calculatedYardage?: number,
  --   notes?: string
  -- }
  
  -- ============================================
  -- STEP 4: CALCULATION DATA
  -- ============================================
  fabric_width INTEGER DEFAULT 140,  -- cm (common: 110, 140, 150)
  margin_percent INTEGER DEFAULT 10,  -- Safety margin: 5, 10, 15, 20
  
  fabric_modifiers JSONB DEFAULT '{"directional": false, "patternMatch": false, "velvet": false, "stretch": false}',
  -- {
  --   directional: boolean,    -- +10% for directional prints
  --   patternMatch: boolean,   -- +20% for stripes/checks matching
  --   velvet: boolean,         -- +10% for nap direction
  --   stretch: boolean         -- -10% for stretch fabrics
  -- }
  
  total_yardage DECIMAL(10,2),  -- Calculated total in meters
  
  yardage_details JSONB,
  -- {
  --   breakdown: [{ garmentId, base, modifiers, total }],
  --   subtotal: number,
  --   modifiersAmount: number,
  --   marginAmount: number,
  --   recommended: number  -- Rounded up to 0.5m
  -- }
  
  -- ============================================
  -- STEP 5-6: SOURCING DATA
  -- ============================================
  selected_textiles JSONB DEFAULT '[]',
  -- Array of { textileId: string, quantity: number, notes?: string }
  
  -- ============================================
  -- CLIENT INFO (Optional)
  -- ============================================
  client_name TEXT,
  client_email TEXT,
  deadline DATE,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  
  -- ============================================
  -- CONSTRAINTS/PREFERENCES
  -- ============================================
  constraints JSONB DEFAULT '{}',
  -- {
  --   localProduction: boolean,
  --   organic: boolean,
  --   deadstockOnly: boolean,
  --   shortDeadline: boolean,
  --   tightBudget: boolean
  -- }
  
  -- ============================================
  -- METADATA
  -- ============================================
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- ============================================
  -- CONSTRAINTS
  -- ============================================
  CONSTRAINT valid_project_type CHECK (project_type IN ('single_piece', 'collection', 'prototype')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  CONSTRAINT valid_current_step CHECK (current_step IN (
    'idea', 'inspiration', 'design', 'calculate', 
    'sourcing', 'validation', 'purchase', 
    'production', 'impact'
  )),
  CONSTRAINT valid_margin_percent CHECK (margin_percent BETWEEN 0 AND 50),
  CONSTRAINT valid_fabric_width CHECK (fabric_width BETWEEN 50 AND 300),
  CONSTRAINT has_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON deadstock.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_session_id ON deadstock.projects(session_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON deadstock.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON deadstock.projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON deadstock.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON deadstock.projects(updated_at DESC);

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_projects_owner_status 
ON deadstock.projects(COALESCE(user_id::text, session_id), status);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION deadstock.update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON deadstock.projects;
CREATE TRIGGER trigger_projects_updated_at
  BEFORE UPDATE ON deadstock.projects
  FOR EACH ROW
  EXECUTE FUNCTION deadstock.update_projects_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE deadstock.projects ENABLE ROW LEVEL SECURITY;

-- Users can view their own projects (by user_id or session_id)
CREATE POLICY "Users can view own projects"
  ON deadstock.projects
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR session_id = current_setting('app.session_id', true)
  );

-- Users can insert their own projects
CREATE POLICY "Users can insert own projects"
  ON deadstock.projects
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR (user_id IS NULL AND session_id IS NOT NULL)
  );

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON deadstock.projects
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR session_id = current_setting('app.session_id', true)
  );

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON deadstock.projects
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR session_id = current_setting('app.session_id', true)
  );

-- ============================================
-- PERMISSIONS FOR ANONYMOUS USERS
-- (Same pattern as favorites table)
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON deadstock.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON deadstock.projects TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE deadstock.projects IS 'Designer projects for the journey workflow (Idea → Inspiration → Design → Calculate → Sourcing → Purchase)';
COMMENT ON COLUMN deadstock.projects.mood_board IS 'Array of MoodBoardItem objects for the visual inspiration canvas';
COMMENT ON COLUMN deadstock.projects.garments IS 'Array of GarmentConfig objects defining what to create';
COMMENT ON COLUMN deadstock.projects.fabric_modifiers IS 'Fabric characteristics that affect yardage calculation';
COMMENT ON COLUMN deadstock.projects.yardage_details IS 'Detailed breakdown of yardage calculation';
