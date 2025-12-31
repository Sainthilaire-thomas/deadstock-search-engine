-- ============================================================================
-- DEADSTOCK TEXTILE SEARCH ENGINE - DATABASE SCHEMA
-- ============================================================================
-- Version: 1.0 (Approche Hybride MVP)
-- Date: 27 décembre 2025
-- Description: Schéma simplifié pour MVP avec évolutivité vers normalisation
-- Intégration: Projet Blanche (schéma 'deadstock' séparé du schéma 'public')
-- ============================================================================

-- ============================================================================
-- CRÉATION DU SCHÉMA DEADSTOCK
-- ============================================================================
-- Ce schéma est séparé du schéma 'public' qui contient les tables Blanche
CREATE SCHEMA IF NOT EXISTS deadstock;

-- Note: Pour utiliser ce schéma facilement dans vos requêtes:
-- SET search_path TO deadstock, public;
-- Ou préfixer explicitement: SELECT * FROM deadstock.textiles;

-- ============================================================================
-- TABLE PRINCIPALE: deadstock.textiles
-- ============================================================================
-- Cette table contient toutes les informations sur les textiles deadstock
-- Approche dénormalisée pour simplicité MVP, mais structure préparée pour
-- future normalisation (ajout material_id, supplier_id si nécessaire)
-- ============================================================================

CREATE TABLE IF NOT EXISTS deadstock.textiles (
  -- ============================================================================
  -- IDENTIFIANTS & MÉTADONNÉES
  -- ============================================================================
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dates de tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Statut disponibilité
  available BOOLEAN NOT NULL DEFAULT true,
  
  -- ============================================================================
  -- INFORMATIONS PRODUIT
  -- ============================================================================
  -- Nom et description
  name TEXT NOT NULL,
  description TEXT,
  
  -- Type de matériau (coton, laine, soie, polyester, etc.)
  material_type TEXT NOT NULL,
  
  -- Composition détaillée en JSONB pour flexibilité
  -- Exemple: {"cotton": 80, "polyester": 20}
  -- Permet de gérer compositions variées sans contraintes rigides
  composition JSONB,
  
  -- Couleur(s) principale(s)
  -- Pour MVP: texte simple (ex: "rouge", "bleu marine")
  -- Future: normalisation avec table colors si nécessaire
  color TEXT,
  
  -- Patterns/motifs (si applicable)
  pattern TEXT,
  
  -- ============================================================================
  -- QUANTITÉ
  -- ============================================================================
  -- Quantité disponible (valeur numérique)
  quantity_value NUMERIC NOT NULL,
  
  -- Unité de mesure (m, m², kg, yards, etc.)
  -- Note: système de normalisation convertira tout en unités standard
  quantity_unit TEXT NOT NULL,
  
  -- Quantité minimale de commande (si applicable)
  minimum_order_value NUMERIC,
  minimum_order_unit TEXT,
  
  -- ============================================================================
  -- PRIX
  -- ============================================================================
  -- Prix (valeur numérique)
  price_value NUMERIC,
  
  -- Devise (EUR, USD, GBP, etc.)
  price_currency TEXT DEFAULT 'EUR',
  
  -- Prix par unité (ex: €/m, €/kg) - calculé ou fourni
  price_per_unit NUMERIC,
  price_per_unit_label TEXT,
  
  -- ============================================================================
  -- SOURCE & SUPPLIER
  -- ============================================================================
  -- Plateforme source (recovo, my_little_coupon, etc.)
  source_platform TEXT NOT NULL,
  
  -- URL de la page produit source (lien direct)
  source_url TEXT NOT NULL UNIQUE, -- UNIQUE pour éviter doublons
  
  -- ID produit chez la source (si disponible)
  source_product_id TEXT,
  
  -- Informations fournisseur
  supplier_name TEXT,
  supplier_location TEXT, -- Pays/ville du fournisseur
  supplier_url TEXT, -- URL page fournisseur si disponible
  
  -- ============================================================================
  -- IMAGES & MÉDIAS
  -- ============================================================================
  -- URL de l'image principale
  image_url TEXT,
  
  -- URLs images supplémentaires (array)
  additional_images TEXT[],
  
  -- ============================================================================
  -- CARACTÉRISTIQUES TECHNIQUES (optionnelles)
  -- ============================================================================
  -- Largeur du tissu (en cm ou inches selon source)
  width_value NUMERIC,
  width_unit TEXT,
  
  -- Poids/grammage (g/m²)
  weight_value NUMERIC,
  weight_unit TEXT,
  
  -- Certifications (bio, GOTS, Oeko-Tex, etc.) - array pour flexibilité
  certifications TEXT[],
  
  -- ============================================================================
  -- DONNÉES BRUTES & MÉTADONNÉES SCRAPING
  -- ============================================================================
  -- Données brutes JSON de la source (backup complet)
  -- Utile pour debugging et re-processing si besoin
  raw_data JSONB,
  
  -- Statut de la qualité des données (score 0-100)
  data_quality_score INTEGER DEFAULT 50 CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
  
  -- Champs manquants identifiés (pour tracking qualité)
  missing_fields TEXT[],
  
  -- ============================================================================
  -- CHAMPS FUTURS (préparation normalisation)
  -- ============================================================================
  -- Ces champs sont NULL pour MVP, mais prêts pour migration future
  -- vers modèle normalisé
  
  -- Référence future vers table materials (quand créée)
  material_id UUID, -- NULL pour MVP
  
  -- Référence future vers table suppliers (quand créée)  
  supplier_id UUID, -- NULL pour MVP
  
  -- ============================================================================
  -- SEARCH & INDEXING
  -- ============================================================================
  -- Champ tsvector pour full-text search (généré automatiquement)
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('french', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(material_type, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(color, '')), 'C')
  ) STORED
);

-- ============================================================================
-- INDEX DE PERFORMANCE
-- ============================================================================

-- Index principal pour full-text search
CREATE INDEX IF NOT EXISTS idx_textiles_search 
ON deadstock.textiles USING GIN (search_vector);

-- Index pour filtres fréquents
CREATE INDEX IF NOT EXISTS idx_textiles_material_type 
ON deadstock.textiles(material_type) WHERE available = true;

CREATE INDEX IF NOT EXISTS idx_textiles_color 
ON deadstock.textiles(color) WHERE available = true;

CREATE INDEX IF NOT EXISTS idx_textiles_source_platform 
ON deadstock.textiles(source_platform);

CREATE INDEX IF NOT EXISTS idx_textiles_available 
ON deadstock.textiles(available);

-- Index pour tri par date (nouveautés)
CREATE INDEX IF NOT EXISTS idx_textiles_scraped_at 
ON deadstock.textiles(scraped_at DESC) WHERE available = true;

-- Index pour tri par prix
CREATE INDEX IF NOT EXISTS idx_textiles_price 
ON deadstock.textiles(price_value) WHERE available = true AND price_value IS NOT NULL;

-- Index pour recherche par fournisseur
CREATE INDEX IF NOT EXISTS idx_textiles_supplier 
ON deadstock.textiles(supplier_name) WHERE available = true;

-- Index composite pour requêtes complexes fréquentes
CREATE INDEX IF NOT EXISTS idx_textiles_type_color_available 
ON deadstock.textiles(material_type, color) WHERE available = true;

-- Index pour éviter doublons (source_url déjà UNIQUE mais ajout index pour performance)
CREATE INDEX IF NOT EXISTS idx_textiles_source_url 
ON deadstock.textiles(source_url);

-- Index GIN pour composition JSONB (recherche dans compositions)
CREATE INDEX IF NOT EXISTS idx_textiles_composition 
ON deadstock.textiles USING GIN (composition);

-- ============================================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION deadstock.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_textiles_updated_at
  BEFORE UPDATE ON deadstock.textiles
  FOR EACH ROW
  EXECUTE FUNCTION deadstock.update_updated_at_column();

-- ============================================================================
-- TABLE: deadstock.scraping_logs (tracking des scraping runs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS deadstock.scraping_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source scrapée
  source_platform TEXT NOT NULL,
  
  -- Dates
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Statut
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'partial')),
  
  -- Statistiques
  items_found INTEGER DEFAULT 0,
  items_new INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  
  -- Erreurs
  error_message TEXT,
  error_details JSONB,
  
  -- Métadonnées
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour consulter historique scraping
CREATE INDEX IF NOT EXISTS idx_scraping_logs_platform_date 
ON deadstock.scraping_logs(source_platform, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_scraping_logs_status 
ON deadstock.scraping_logs(status);

-- ============================================================================
-- TABLE: deadstock.users (pour Phase 3+, préparation)
-- ============================================================================
-- Table minimale pour lier avec auth.users de Supabase
-- Sera étendue lors de Phase 3 (features utilisateur)
-- Note: Peut potentiellement réutiliser public.profiles si synergies avec Blanche

CREATE TABLE IF NOT EXISTS deadstock.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations de base
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  
  -- Rôle spécifique deadstock (indépendant du rôle Blanche dans public.profiles)
  role TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free', 'premium', 'pro', 'admin')),
  
  -- Dates
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger auto-update
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON deadstock.users
  FOR EACH ROW
  EXECUTE FUNCTION deadstock.update_updated_at_column();

-- ============================================================================
-- TABLE: deadstock.user_favorites (pour Phase 3+, préparation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS deadstock.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  textile_id UUID NOT NULL REFERENCES deadstock.textiles(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Contrainte unicité (un user ne peut pas favoriser 2x le même textile)
  UNIQUE(user_id, textile_id)
);

-- Index pour requêtes favorites par user
CREATE INDEX IF NOT EXISTS idx_favorites_user 
ON deadstock.user_favorites(user_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Supabase
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE deadstock.textiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadstock.scraping_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadstock.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadstock.user_favorites ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES RLS
-- ============================================================================

-- Textiles: lecture publique (tous), écriture service_role uniquement
CREATE POLICY "Textiles are viewable by everyone"
  ON deadstock.textiles FOR SELECT
  USING (true);

CREATE POLICY "Textiles are insertable by service role only"
  ON deadstock.textiles FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Textiles are updatable by service role only"
  ON deadstock.textiles FOR UPDATE
  USING (auth.role() = 'service_role');

-- Scraping logs: service_role uniquement
CREATE POLICY "Scraping logs accessible by service role only"
  ON deadstock.scraping_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Users: users voient leurs propres données
CREATE POLICY "Users can view own data"
  ON deadstock.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON deadstock.users FOR UPDATE
  USING (auth.uid() = id);

-- Favorites: users gèrent leurs propres favoris
CREATE POLICY "Users can view own favorites"
  ON deadstock.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON deadstock.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON deadstock.user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction de recherche textiles (exemple d'utilisation search_vector)
CREATE OR REPLACE FUNCTION deadstock.search_textiles(
  search_query TEXT,
  material_filter TEXT DEFAULT NULL,
  color_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  material_type TEXT,
  color TEXT,
  price_value NUMERIC,
  price_currency TEXT,
  quantity_value NUMERIC,
  quantity_unit TEXT,
  supplier_name TEXT,
  source_platform TEXT,
  source_url TEXT,
  image_url TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.material_type,
    t.color,
    t.price_value,
    t.price_currency,
    t.quantity_value,
    t.quantity_unit,
    t.supplier_name,
    t.source_platform,
    t.source_url,
    t.image_url,
    ts_rank(t.search_vector, websearch_to_tsquery('french', search_query)) AS rank
  FROM deadstock.textiles t
  WHERE 
    t.available = true
    AND t.search_vector @@ websearch_to_tsquery('french', search_query)
    AND (material_filter IS NULL OR t.material_type = material_filter)
    AND (color_filter IS NULL OR t.color = color_filter)
  ORDER BY rank DESC, t.scraped_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VUES UTILES
-- ============================================================================

-- Vue des textiles actifs avec infos essentielles (pour API)
CREATE OR REPLACE VIEW deadstock.active_textiles AS
SELECT 
  id,
  name,
  material_type,
  color,
  quantity_value,
  quantity_unit,
  price_value,
  price_currency,
  supplier_name,
  supplier_location,
  source_platform,
  source_url,
  image_url,
  scraped_at,
  created_at
FROM deadstock.textiles
WHERE available = true
ORDER BY scraped_at DESC;

-- Vue statistiques par plateforme
CREATE OR REPLACE VIEW deadstock.platform_stats AS
SELECT 
  source_platform,
  COUNT(*) as total_textiles,
  COUNT(*) FILTER (WHERE available = true) as available_textiles,
  COUNT(DISTINCT material_type) as unique_materials,
  COUNT(DISTINCT supplier_name) as unique_suppliers,
  AVG(price_value) FILTER (WHERE price_currency = 'EUR' AND price_value > 0) as avg_price_eur,
  MAX(scraped_at) as last_scraped
FROM deadstock.textiles
GROUP BY source_platform;

-- ============================================================================
-- COMMENTAIRES SUR LES TABLES (documentation)
-- ============================================================================

COMMENT ON SCHEMA deadstock IS 
'Schéma dédié au moteur de recherche de textiles deadstock. 
Séparé du schéma public (Blanche e-commerce) pour organisation logique.';

COMMENT ON TABLE deadstock.textiles IS 
'Table principale contenant tous les textiles deadstock. 
Approche hybride MVP: dénormalisée pour simplicité, mais structure préparée pour future normalisation.
Champs material_id et supplier_id NULL pour MVP, prêts pour migration Phase 2+.';

COMMENT ON COLUMN deadstock.textiles.search_vector IS 
'Champ tsvector généré automatiquement pour full-text search performant. 
Utilise pondération: nom (A), type matériau (A), description (B), couleur (C).';

COMMENT ON COLUMN deadstock.textiles.composition IS 
'Composition du textile en JSONB. Format: {"material": percentage}.
Exemple: {"cotton": 80, "polyester": 20}';

COMMENT ON COLUMN deadstock.textiles.raw_data IS 
'Données brutes complètes du scraping en JSON. 
Utilisé pour debugging et reprocessing si besoin.';

COMMENT ON COLUMN deadstock.textiles.data_quality_score IS 
'Score de qualité des données (0-100). 
Calculé basé sur champs complétés, cohérence, etc.
Utilisé pour filtrer/prioriser textiles de qualité.';

COMMENT ON TABLE deadstock.scraping_logs IS 
'Historique des runs de scraping pour monitoring et debugging.
Permet de tracker performance, erreurs, et évolution du volume de données.';

COMMENT ON FUNCTION deadstock.search_textiles IS 
'Fonction de recherche principale utilisant full-text search PostgreSQL.
Supporte filtres par type matériau et couleur, avec pagination.
Retourne résultats triés par pertinence puis date.';

-- ============================================================================
-- SYNERGIES POTENTIELLES AVEC BLANCHE (pour futur)
-- ============================================================================

-- Vue potentielle pour lier textiles deadstock avec produits Blanche
-- (à créer plus tard si synergies identifiées)
/*
CREATE OR REPLACE VIEW deadstock.textiles_for_blanche AS
SELECT 
  t.id as textile_id,
  t.name,
  t.material_type,
  t.composition,
  t.price_value,
  t.supplier_name,
  -- Peut être lié à public.products si Blanche commence à utiliser deadstock
  NULL::UUID as blanche_product_id
FROM deadstock.textiles t
WHERE t.available = true;
*/

-- ============================================================================
-- PERMISSIONS (à ajuster selon besoins)
-- ============================================================================

-- Grant SELECT sur vues aux utilisateurs authentifiés
GRANT USAGE ON SCHEMA deadstock TO authenticated;
GRANT SELECT ON deadstock.active_textiles TO authenticated;
GRANT SELECT ON deadstock.platform_stats TO authenticated;

-- Grant exécution fonction de recherche
GRANT EXECUTE ON FUNCTION deadstock.search_textiles TO authenticated;

-- ============================================================================
-- FIN DU SCHEMA
-- ============================================================================
-- Note: Pour lancer ce schema sur Supabase:
-- 1. Via Supabase Dashboard > SQL Editor
-- 2. Copier-coller l'intégralité de ce fichier
-- 3. Exécuter
-- ============================================================================
