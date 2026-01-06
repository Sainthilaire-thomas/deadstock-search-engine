-- Migration: Ajouter site_id aux textiles
-- Date: 2026-01-06
-- Description: Lie les textiles aux sites pour une meilleure traçabilité

-- 1. Ajouter la colonne site_id
ALTER TABLE deadstock.textiles
ADD COLUMN site_id uuid REFERENCES deadstock.sites(id);

-- 2. Créer un index pour les performances
CREATE INDEX idx_textiles_site_id ON deadstock.textiles(site_id);

-- 3. Migration des données existantes (à adapter selon vos données)
-- Exemple:
-- UPDATE deadstock.textiles SET site_id = '<uuid>' WHERE source_platform IN ('...');

-- 4. Note: On garde source_platform pour compatibilité mais site_id devient la référence principale
