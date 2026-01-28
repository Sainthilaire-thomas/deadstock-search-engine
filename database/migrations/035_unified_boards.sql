-- Migration: 035_unified_boards.sql
-- Description: Unification Board + Zone - Fusion de board_zones dans boards
-- Date: 28 Janvier 2026
-- Référence: ADR-032

-- ============================================
-- ÉTAPE 1: Ajouter colonnes de positionnement à boards
-- (pour affichage sur canvas parent)
-- ============================================

ALTER TABLE deadstock.boards
ADD COLUMN IF NOT EXISTS position_x FLOAT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS position_y FLOAT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS width FLOAT DEFAULT 280,
ADD COLUMN IF NOT EXISTS height FLOAT DEFAULT 140;

-- ============================================
-- ÉTAPE 2: Ajouter couleur (pour la carte visuelle)
-- ============================================

ALTER TABLE deadstock.boards
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6366F1';

-- ============================================
-- ÉTAPE 3: Ajouter colonnes de cristallisation (depuis zones)
-- ============================================

ALTER TABLE deadstock.boards
ADD COLUMN IF NOT EXISTS crystallized_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS linked_project_id UUID REFERENCES deadstock.projects(id) ON DELETE SET NULL;

-- ============================================
-- ÉTAPE 4: Index pour les boards enfants
-- ============================================

CREATE INDEX IF NOT EXISTS idx_boards_parent_children 
ON deadstock.boards(parent_board_id) 
WHERE parent_board_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_boards_crystallized
ON deadstock.boards(crystallized_at)
WHERE crystallized_at IS NOT NULL;

-- ============================================
-- ÉTAPE 5: Migrer données board_zones → boards
-- Les zones deviennent des boards enfants
-- ============================================

INSERT INTO deadstock.boards (
  id,
  user_id,
  session_id,
  parent_board_id,
  name,
  description,
  status,
  board_type,
  position_x,
  position_y,
  width,
  height,
  color,
  crystallized_at,
  linked_project_id,
  created_at,
  updated_at
)
SELECT 
  bz.id,                                    -- Garder le même ID
  b.user_id,
  b.session_id,
  bz.board_id AS parent_board_id,           -- Le board_id de la zone devient parent
  bz.name,
  NULL AS description,
  CASE 
    WHEN bz.crystallized_at IS NOT NULL THEN 'crystallized' 
    ELSE 'active' 
  END AS status,
  COALESCE(bz.zone_type, 'piece') AS board_type,
  bz.position_x,
  bz.position_y,
  bz.width,
  bz.height,
  bz.color,
  bz.crystallized_at,
  bz.linked_project_id,
  bz.created_at,
  NOW() AS updated_at
FROM deadstock.board_zones bz
JOIN deadstock.boards b ON bz.board_id = b.id
WHERE NOT EXISTS (
  SELECT 1 FROM deadstock.boards WHERE id = bz.id
);

-- ============================================
-- ÉTAPE 6: Migrer les éléments avec zone_id
-- Les éléments appartenant à une zone doivent pointer vers le nouveau board (ex-zone)
-- ============================================

UPDATE deadstock.board_elements
SET board_id = zone_id
WHERE zone_id IS NOT NULL;

-- ============================================
-- ÉTAPE 7: Supprimer la colonne zone_id de board_elements
-- ============================================

ALTER TABLE deadstock.board_elements
DROP COLUMN IF EXISTS zone_id;

-- ============================================
-- ÉTAPE 8: Mettre à jour la contrainte element_type
-- (pas de changement nécessaire, les types restent les mêmes)
-- ============================================

-- Vérifier que la contrainte existe et est correcte
-- Les types existants: textile, palette, inspiration, calculation, note, video, link, pdf, pattern, silhouette

-- ============================================
-- ÉTAPE 9: Commentaires
-- ============================================

COMMENT ON COLUMN deadstock.boards.position_x IS 'Position X sur le canvas du board parent (null si board racine)';
COMMENT ON COLUMN deadstock.boards.position_y IS 'Position Y sur le canvas du board parent (null si board racine)';
COMMENT ON COLUMN deadstock.boards.width IS 'Largeur de la carte sur le canvas parent (défaut: 280)';
COMMENT ON COLUMN deadstock.boards.height IS 'Hauteur de la carte sur le canvas parent (défaut: 140)';
COMMENT ON COLUMN deadstock.boards.color IS 'Couleur de la carte visuelle (bordure gauche)';
COMMENT ON COLUMN deadstock.boards.crystallized_at IS 'Date de cristallisation (passage en projet)';
COMMENT ON COLUMN deadstock.boards.linked_project_id IS 'ID du projet lié après cristallisation';

-- ============================================
-- ÉTAPE 10: Supprimer la table board_zones
-- ATTENTION: À exécuter seulement après validation complète !
-- ============================================

-- Désactiver temporairement les contraintes pour le drop
-- DROP TABLE IF EXISTS deadstock.board_zones CASCADE;

-- NOTE: Garder commenté jusqu'à validation complète de la migration
-- Décommenter et exécuter manuellement après tests

-- ============================================
-- ROLLBACK (en cas de problème)
-- ============================================

/*
-- Pour annuler cette migration:

-- 1. Recréer la colonne zone_id
ALTER TABLE deadstock.board_elements
ADD COLUMN zone_id UUID;

-- 2. Restaurer les zone_id depuis les boards enfants
UPDATE deadstock.board_elements be
SET zone_id = be.board_id
FROM deadstock.boards b
WHERE be.board_id = b.id 
AND b.parent_board_id IS NOT NULL;

-- 3. Remettre le board_id original
UPDATE deadstock.board_elements be
SET board_id = b.parent_board_id
FROM deadstock.boards b
WHERE be.board_id = b.id 
AND b.parent_board_id IS NOT NULL;

-- 4. Supprimer les colonnes ajoutées à boards
ALTER TABLE deadstock.boards
DROP COLUMN IF EXISTS position_x,
DROP COLUMN IF EXISTS position_y,
DROP COLUMN IF EXISTS width,
DROP COLUMN IF EXISTS height,
DROP COLUMN IF EXISTS color,
DROP COLUMN IF EXISTS crystallized_at,
DROP COLUMN IF EXISTS linked_project_id;

-- 5. Supprimer les boards créés depuis les zones
DELETE FROM deadstock.boards 
WHERE id IN (SELECT id FROM deadstock.board_zones);
*/
