-- Migration: 031_add_project_order_fields.sql
-- Description: Add order tracking fields and snapshot for project crystallization
-- Date: 2026-01-16
-- Sprint: C3 - Passer Commande + Snapshot

-- ============================================
-- TABLE: projects
-- Add order tracking and snapshot columns
-- ============================================

-- Dates de suivi commande
ALTER TABLE deadstock.projects
ADD COLUMN IF NOT EXISTS ordered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Snapshot des données figées à la commande
ALTER TABLE deadstock.projects
ADD COLUMN IF NOT EXISTS snapshot JSONB;

-- ============================================
-- UPDATE STATUS CONSTRAINT
-- Extend valid statuses to include order workflow
-- ============================================

-- Drop existing constraint
ALTER TABLE deadstock.projects
DROP CONSTRAINT IF EXISTS valid_status;

-- Add new constraint with extended statuses
ALTER TABLE deadstock.projects
ADD CONSTRAINT valid_status CHECK (status IN (
  'draft',
  'in_progress',
  'ordered',
  'shipped',
  'received',
  'in_production',
  'completed',
  'archived'
));

-- ============================================
-- INDEXES
-- ============================================

-- Index for filtering by order status
CREATE INDEX IF NOT EXISTS idx_projects_ordered_at
ON deadstock.projects(ordered_at DESC)
WHERE ordered_at IS NOT NULL;

-- Composite index for session + status queries
CREATE INDEX IF NOT EXISTS idx_projects_session_status
ON deadstock.projects(session_id, status)
WHERE session_id IS NOT NULL;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN deadstock.projects.ordered_at IS 'Timestamp when the order was placed';
COMMENT ON COLUMN deadstock.projects.shipped_at IS 'Timestamp when the order was shipped';
COMMENT ON COLUMN deadstock.projects.received_at IS 'Timestamp when the order was received';
COMMENT ON COLUMN deadstock.projects.completed_at IS 'Timestamp when the project was completed';
COMMENT ON COLUMN deadstock.projects.snapshot IS 'Frozen copy of project data at order time (textiles, calculations, palettes, order details, totals)';
