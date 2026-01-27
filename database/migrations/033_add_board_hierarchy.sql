-- Migration: 033_add_board_hierarchy.sql
-- Sprint 5: Boards Imbriqués - Hiérarchie des boards
-- Date: 27 Janvier 2026

-- Ajouter parent_board_id pour la hiérarchie
ALTER TABLE deadstock.boards
ADD COLUMN IF NOT EXISTS parent_board_id UUID REFERENCES deadstock.boards(id) ON DELETE SET NULL;

-- Ajouter board_type pour distinguer les types
-- 'free' = board libre (défaut)
-- 'piece' = pièce/vêtement
-- 'category' = catégorie (.tops, .bottoms...)
-- 'collection' = collection de vêtements
ALTER TABLE deadstock.boards
ADD COLUMN IF NOT EXISTS board_type TEXT DEFAULT 'free' 
CHECK (board_type IN ('free', 'piece', 'category', 'collection'));

-- Index pour les requêtes par parent
CREATE INDEX IF NOT EXISTS idx_boards_parent_id ON deadstock.boards(parent_board_id);

-- Index pour les requêtes par type
CREATE INDEX IF NOT EXISTS idx_boards_type ON deadstock.boards(board_type);

-- Index composite pour les boards racines d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_boards_user_root ON deadstock.boards(user_id, parent_board_id) 
WHERE parent_board_id IS NULL;

COMMENT ON COLUMN deadstock.boards.parent_board_id IS 'ID du board parent (null = board racine)';
COMMENT ON COLUMN deadstock.boards.board_type IS 'Type de board: free, piece, category, collection';
