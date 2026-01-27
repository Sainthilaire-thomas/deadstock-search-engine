-- Migration: 034_add_zone_linked_board.sql
-- Sprint 5: Boards Imbriqués - Lien zone -> sous-board
-- Date: 27 Janvier 2026

-- Ajouter linked_board_id pour pointer vers un sous-board
ALTER TABLE deadstock.board_zones
ADD COLUMN IF NOT EXISTS linked_board_id UUID REFERENCES deadstock.boards(id) ON DELETE SET NULL;

-- Ajouter zone_type pour distinguer pièce vs catégorie
-- 'piece' = zone représentant un vêtement (défaut, compatible avec l'existant)
-- 'category' = zone représentant une catégorie
ALTER TABLE deadstock.board_zones
ADD COLUMN IF NOT EXISTS zone_type TEXT DEFAULT 'piece'
CHECK (zone_type IN ('piece', 'category'));

-- Index pour les requêtes par linked_board
CREATE INDEX IF NOT EXISTS idx_zones_linked_board ON deadstock.board_zones(linked_board_id);

-- Index pour les requêtes par type de zone
CREATE INDEX IF NOT EXISTS idx_zones_type ON deadstock.board_zones(zone_type);

COMMENT ON COLUMN deadstock.board_zones.linked_board_id IS 'ID du sous-board lié (null = zone sans sous-board)';
COMMENT ON COLUMN deadstock.board_zones.zone_type IS 'Type de zone: piece ou category';
