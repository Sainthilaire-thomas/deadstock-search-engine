-- Migration: 032_add_board_cover_image.sql
-- Description: Ajoute le support des images de couverture pour les boards
-- Date: 2026-01-18

-- =============================================================================
-- AJOUT COLONNE COVER_IMAGE
-- =============================================================================

-- Ajouter la colonne pour l'image de couverture
ALTER TABLE deadstock.boards 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT DEFAULT NULL;

-- Commentaire explicatif
COMMENT ON COLUMN deadstock.boards.cover_image_url IS 
  'URL de l''image de couverture du board. NULL = auto-extraction depuis les éléments du board.';

-- =============================================================================
-- VÉRIFICATION
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'deadstock' 
    AND table_name = 'boards' 
    AND column_name = 'cover_image_url'
  ) THEN
    RAISE EXCEPTION 'La colonne cover_image_url n''a pas été créée';
  END IF;
  
  RAISE NOTICE 'Migration 032: cover_image_url ajoutée avec succès';
END $$;
