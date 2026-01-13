-- Migration 028: Add PDF, Pattern, Silhouette element types
-- Sprint 6 - Board Moodboard V2
-- Date: 2026-01-11

-- ============================================
-- UPDATE CHECK CONSTRAINT ON board_elements
-- ============================================

-- Drop existing constraint
ALTER TABLE deadstock.board_elements 
DROP CONSTRAINT IF EXISTS board_elements_type_check;

-- Add updated constraint with new types
ALTER TABLE deadstock.board_elements 
ADD CONSTRAINT board_elements_type_check CHECK (
  element_type IN (
    'textile', 
    'palette', 
    'inspiration', 
    'calculation', 
    'note', 
    'video', 
    'link',
    'pdf',        -- NEW Sprint 6
    'pattern',    -- NEW Sprint 6
    'silhouette'  -- NEW Sprint 6
  )
);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check constraint was added correctly
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'deadstock.board_elements'::regclass 
  AND contype = 'c';
