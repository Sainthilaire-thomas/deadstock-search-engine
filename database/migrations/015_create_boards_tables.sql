-- Migration 015: Create boards tables
-- Date: 2026-01-04
-- Description: Tables pour le module Board (pivot central UX)

-- ============================================
-- TABLE: boards
-- ============================================

CREATE TABLE deadstock.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ownership (même pattern que favorites/projects)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  
  -- Métadonnées
  name TEXT,  -- NULL = "Sans titre"
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',  -- draft, active, archived
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Contraintes
  CONSTRAINT boards_owner_check CHECK (
    user_id IS NOT NULL OR session_id IS NOT NULL
  ),
  CONSTRAINT boards_status_check CHECK (
    status IN ('draft', 'active', 'archived')
  )
);

-- Index
CREATE INDEX idx_boards_user_id ON deadstock.boards(user_id);
CREATE INDEX idx_boards_session_id ON deadstock.boards(session_id);
CREATE INDEX idx_boards_status ON deadstock.boards(status);
CREATE INDEX idx_boards_updated_at ON deadstock.boards(updated_at DESC);

-- Trigger pour updated_at
CREATE TRIGGER set_boards_updated_at
  BEFORE UPDATE ON deadstock.boards
  FOR EACH ROW
  EXECUTE FUNCTION deadstock.set_updated_at();

-- ============================================
-- TABLE: board_zones
-- ============================================

CREATE TABLE deadstock.board_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES deadstock.boards(id) ON DELETE CASCADE,
  
  -- Métadonnées
  name TEXT NOT NULL DEFAULT 'Nouvelle zone',
  color TEXT DEFAULT '#E5E7EB',  -- Couleur de fond/bordure
  
  -- Position et taille sur le canvas
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  width FLOAT NOT NULL DEFAULT 400,
  height FLOAT NOT NULL DEFAULT 300,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_board_zones_board_id ON deadstock.board_zones(board_id);

-- ============================================
-- TABLE: board_elements
-- ============================================

CREATE TABLE deadstock.board_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES deadstock.boards(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES deadstock.board_zones(id) ON DELETE SET NULL,
  
  -- Type d'élément
  element_type TEXT NOT NULL,  -- textile, palette, inspiration, calculation, note
  
  -- Données spécifiques au type (JSONB polymorphe)
  element_data JSONB NOT NULL DEFAULT '{}',
  
  -- Position et taille sur le canvas
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  width FLOAT,   -- NULL = taille auto
  height FLOAT,  -- NULL = taille auto
  z_index INT NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Contraintes
  CONSTRAINT board_elements_type_check CHECK (
    element_type IN ('textile', 'palette', 'inspiration', 'calculation', 'note')
  )
);

-- Index
CREATE INDEX idx_board_elements_board_id ON deadstock.board_elements(board_id);
CREATE INDEX idx_board_elements_zone_id ON deadstock.board_elements(zone_id);
CREATE INDEX idx_board_elements_type ON deadstock.board_elements(element_type);

-- Trigger pour updated_at
CREATE TRIGGER set_board_elements_updated_at
  BEFORE UPDATE ON deadstock.board_elements
  FOR EACH ROW
  EXECUTE FUNCTION deadstock.set_updated_at();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE deadstock.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadstock.board_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadstock.board_elements ENABLE ROW LEVEL SECURITY;

-- Boards: accès par user_id ou session_id
CREATE POLICY "boards_select_own" ON deadstock.boards
  FOR SELECT USING (
    user_id = auth.uid() OR 
    session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "boards_insert_own" ON deadstock.boards
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "boards_update_own" ON deadstock.boards
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "boards_delete_own" ON deadstock.boards
  FOR DELETE USING (
    user_id = auth.uid() OR 
    session_id = current_setting('app.session_id', true)
  );

-- Board zones: accès hérité du board parent
CREATE POLICY "board_zones_all" ON deadstock.board_zones
  FOR ALL USING (
    board_id IN (
      SELECT id FROM deadstock.boards 
      WHERE user_id = auth.uid() 
      OR session_id = current_setting('app.session_id', true)
    )
  );

-- Board elements: accès hérité du board parent
CREATE POLICY "board_elements_all" ON deadstock.board_elements
  FOR ALL USING (
    board_id IN (
      SELECT id FROM deadstock.boards 
      WHERE user_id = auth.uid() 
      OR session_id = current_setting('app.session_id', true)
    )
  );

-- ============================================
-- GRANTS (même pattern que favorites)
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON deadstock.boards TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON deadstock.board_zones TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON deadstock.board_elements TO anon, authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE deadstock.boards IS 'Espaces de travail créatifs - pivot central de l''expérience utilisateur';
COMMENT ON TABLE deadstock.board_zones IS 'Zones de regroupement visuel sur un board';
COMMENT ON TABLE deadstock.board_elements IS 'Éléments polymorphes (textile, palette, note, calcul, inspiration)';

COMMENT ON COLUMN deadstock.boards.status IS 'draft=brouillon, active=en cours, archived=cristallisé en projet';
COMMENT ON COLUMN deadstock.board_elements.element_type IS 'Type: textile, palette, inspiration, calculation, note';
COMMENT ON COLUMN deadstock.board_elements.element_data IS 'Données JSONB spécifiques au type d''élément';
