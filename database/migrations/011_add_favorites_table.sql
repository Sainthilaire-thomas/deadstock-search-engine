-- Migration: Add favorites table
-- Date: 2026-01-02
-- Description: Table pour stocker les favoris utilisateur avec session_id temporaire

CREATE TABLE IF NOT EXISTS deadstock.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  textile_id UUID NOT NULL REFERENCES deadstock.textiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_session_textile UNIQUE(session_id, textile_id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_favorites_session ON deadstock.favorites(session_id);
CREATE INDEX IF NOT EXISTS idx_favorites_textile ON deadstock.favorites(textile_id);

-- Commentaires
COMMENT ON TABLE deadstock.favorites IS 'Favoris utilisateur avec session temporaire';
COMMENT ON COLUMN deadstock.favorites.session_id IS 'ID de session navigateur (cookie), sera remplacé par user_id en Phase 2';
COMMENT ON COLUMN deadstock.favorites.textile_id IS 'Référence au textile favori';
