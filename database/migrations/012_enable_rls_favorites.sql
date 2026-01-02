-- Migration: Enable RLS on favorites table
-- Date: 2026-01-02
-- Description: Configure Row Level Security pour permettre aux utilisateurs de gérer leurs favoris

-- Activer RLS
ALTER TABLE deadstock.favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les favoris
CREATE POLICY anyone_can_read_favorites
  ON deadstock.favorites
  FOR SELECT
  USING (true);

-- Policy: Tout le monde peut insérer ses propres favoris
CREATE POLICY anyone_can_insert_favorites
  ON deadstock.favorites
  FOR INSERT
  WITH CHECK (true);

-- Policy: Tout le monde peut supprimer ses propres favoris
CREATE POLICY anyone_can_delete_favorites
  ON deadstock.favorites
  FOR DELETE
  USING (true);

-- Note: Pour le MVP, on autorise tout le monde car on utilise session_id temporaire
-- En Phase 2 avec auth, on remplacera 'true' par 'auth.uid() = user_id'
