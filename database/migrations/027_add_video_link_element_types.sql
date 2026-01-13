-- Migration 027: Add video and link element types
-- Date: 2026-01-11
-- Description: Sprint 5 - Ajout des types video et link pour board_elements

-- Supprimer l'ancienne contrainte
ALTER TABLE deadstock.board_elements 
DROP CONSTRAINT IF EXISTS board_elements_type_check;

-- Ajouter la nouvelle contrainte avec video et link
ALTER TABLE deadstock.board_elements 
ADD CONSTRAINT board_elements_type_check CHECK (
  element_type IN ('textile', 'palette', 'inspiration', 'calculation', 'note', 'video', 'link')
);

-- Mettre à jour le commentaire
COMMENT ON COLUMN deadstock.board_elements.element_type IS 
  'Type: textile, palette, inspiration, calculation, note, video, link';
