-- Migration: Grant permissions on favorites table to anon role
-- Date: 2026-01-02
-- Description: Permet à l'anon key d'accéder à la table favorites

-- Donner les permissions de base à anon
GRANT SELECT, INSERT, DELETE ON deadstock.favorites TO anon;

-- Permettre à anon d'utiliser le schema deadstock
GRANT USAGE ON SCHEMA deadstock TO anon;

-- Vérification (optionnel, décommenter pour voir les permissions)
-- SELECT grantee, privilege_type 
-- FROM information_schema.table_privileges 
-- WHERE table_schema = 'deadstock' AND table_name = 'favorites';
