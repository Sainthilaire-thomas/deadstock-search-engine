-- Migration: 016_add_crystallization_columns.sql
-- Description: Add crystallization support for zones and projects
-- Date: 2026-01-05
-- Session: 14
-- ADR: ADR_018_CRYSTALLIZATION_RULES.md

-- ============================================
-- TABLE: board_zones
-- Add crystallization tracking columns
-- ============================================

ALTER TABLE deadstock.board_zones 
ADD COLUMN IF NOT EXISTS crystallized_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS linked_project_id UUID REFERENCES deadstock.projects(id) ON DELETE SET NULL;

-- Index for filtering crystallized/active zones
CREATE INDEX IF NOT EXISTS idx_board_zones_crystallized 
ON deadstock.board_zones(board_id, crystallized_at);

-- Index for finding zones linked to a project
CREATE INDEX IF NOT EXISTS idx_board_zones_linked_project 
ON deadstock.board_zones(linked_project_id) 
WHERE linked_project_id IS NOT NULL;

-- ============================================
-- TABLE: projects
-- Add source board/zone tracking columns
-- ============================================

ALTER TABLE deadstock.projects
ADD COLUMN IF NOT EXISTS source_board_id UUID REFERENCES deadstock.boards(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS source_zone_id UUID REFERENCES deadstock.board_zones(id) ON DELETE SET NULL;

-- Index for finding projects created from a board
CREATE INDEX IF NOT EXISTS idx_projects_source_board 
ON deadstock.projects(source_board_id) 
WHERE source_board_id IS NOT NULL;

-- Index for finding project created from a specific zone
CREATE INDEX IF NOT EXISTS idx_projects_source_zone 
ON deadstock.projects(source_zone_id) 
WHERE source_zone_id IS NOT NULL;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN deadstock.board_zones.crystallized_at IS 'Timestamp when the zone was crystallized into a project. NULL means zone is still active.';
COMMENT ON COLUMN deadstock.board_zones.linked_project_id IS 'Reference to the project created from this zone via crystallization.';
COMMENT ON COLUMN deadstock.projects.source_board_id IS 'Reference to the board from which this project was crystallized.';
COMMENT ON COLUMN deadstock.projects.source_zone_id IS 'Reference to the specific zone from which this project was crystallized.';
