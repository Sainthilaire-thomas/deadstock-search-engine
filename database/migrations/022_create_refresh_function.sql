-- ============================================
-- Migration 022: Fonction refresh textiles_search
-- Date: 7 Janvier 2026
-- ADR-024: Textile Standard System
-- ============================================
--
-- Description:
-- Fonction pour rafraîchir la vue matérialisée textiles_search
-- À appeler après chaque scraping.
--
-- Usage:
-- SELECT deadstock.refresh_textiles_search();
--
-- ============================================

-- Fonction de refresh avec logging
CREATE OR REPLACE FUNCTION deadstock.refresh_textiles_search()
RETURNS TABLE(
  status TEXT,
  duration_ms NUMERIC,
  total_rows INTEGER
) 
LANGUAGE plpgsql
AS $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  row_count INTEGER;
BEGIN
  start_time := clock_timestamp();
  
  -- Refresh concurrent (ne bloque pas les lectures)
  REFRESH MATERIALIZED VIEW CONCURRENTLY deadstock.textiles_search;
  
  end_time := clock_timestamp();
  
  -- Compter les lignes
  SELECT COUNT(*) INTO row_count FROM deadstock.textiles_search;
  
  -- Retourner les stats
  RETURN QUERY SELECT 
    'success'::TEXT,
    ROUND(EXTRACT(EPOCH FROM (end_time - start_time)) * 1000, 2),
    row_count;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION deadstock.refresh_textiles_search() IS 
'Rafraîchit la vue matérialisée textiles_search. Retourne status, durée en ms, et nombre de lignes.';

-- Test
-- SELECT * FROM deadstock.refresh_textiles_search();
