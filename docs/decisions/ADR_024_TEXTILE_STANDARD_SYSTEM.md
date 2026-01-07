# ADR-024: Deadstock Textile Standard System

**Date**: 7 Janvier 2026  
**Status**: Draft  
**Context**: Phase 2 - Data Quality & Standardization  
**Authors**: Thomas

---

## Contexte

### Architecture Existante (déjà implémentée ✅)

Le projet dispose déjà d'une architecture solide :

#### 1. Table `attribute_categories` ✅
Définit le **standard Deadstock** des attributs de classification textile :
- `fiber`, `color`, `pattern`, `weave` (4 catégories actives)
- Champs `is_searchable`, `is_required`, `display_order`
- Support hiérarchie via `parent_id`, `level`, `path`

#### 2. Table `textile_attributes` ✅
Table pivot pour stocker les attributs dynamiques par textile :
- `textile_id` → `category_id` → `value`
- `source_term`, `source_locale`, `confidence`
- `category_slug` dénormalisé pour performance

#### 3. Vue `textiles_with_attributes` ✅
Vue dénormalisée pour requêtes simplifiées :
- `material_type_v2`, `color_v2`, `pattern_v2`, `weave_v2`
- Jointure automatique textile ↔ attributes

#### 4. Fonction `get_searchable_categories()` ✅
Retourne les catégories pour filtres de recherche.

#### 5. Table `dictionary_mappings` ✅
Mappings de normalisation avec FK vers `attribute_categories`.

#### 6. Table `textiles` - Données fixes ✅
Colonnes universelles (dénominateur commun) :
- Identité : `name`, `description`, `image_url`, `source_url`
- Dimensions : `width_value`, `weight_value`
- Commercial : `price_value`, `minimum_order_value`, `quantity_value`
- Legacy : `material_type`, `color`, `pattern` (à migrer vers `textile_attributes`)

### Ce qui manque

1. **Interface Discovery** : Ne montre pas le mapping standard ↔ extraction
2. **Filtres recherche** : Utilisent les colonnes legacy au lieu de `textile_attributes`
3. **Workflow propositions** : Pas de système pour proposer de nouveaux attributs
4. **Clarification `quantity_value`** : Ambigu entre longueur fixe et vente au mètre
5. **Versioning standard** : Pas de traçabilité des évolutions

### Opportunité

Deadstock peut devenir **la référence de normalisation textile** en proposant :
- Un standard ouvert et documenté
- Une taxonomie hiérarchique complète
- Un système d'enrichissement collaboratif
- Une API de normalisation pour l'industrie

---

## Décision

### Architecture Conceptuelle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     DEADSTOCK TEXTILE STANDARD                          │
│                        (attribute_categories)                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ DIMENSIONS PHYSIQUES                                             │   │
│  │ ├── length (longueur disponible)                                 │   │
│  │ ├── width (largeur du tissu)                                     │   │
│  │ └── weight (grammage g/m²)                                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ATTRIBUTS MATIÈRE                                                │   │
│  │ ├── fiber ⭐ (composition)                                       │   │
│  │ │   ├── natural                                                  │   │
│  │ │   │   ├── silk, cotton, wool, linen, hemp...                   │   │
│  │ │   └── synthetic                                                │   │
│  │ │       ├── polyester, nylon, elastane, viscose...               │   │
│  │ │                                                                │   │
│  │ ├── weave (tissage/construction)                                 │   │
│  │ │   ├── woven: plain, twill, satin, jacquard...                  │   │
│  │ │   ├── knit: jersey, rib, interlock...                          │   │
│  │ │   └── non-woven: felt, interfacing...                          │   │
│  │ │                                                                │   │
│  │ └── finish (finition/traitement)                                 │   │
│  │     ├── surface: brushed, mercerized, calendered...              │   │
│  │     └── functional: waterproof, fire-retardant...                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ATTRIBUTS VISUELS                                                │   │
│  │ ├── color ⭐ (couleur dominante)                                 │   │
│  │ │   ├── primary: red, blue, green, yellow...                     │   │
│  │ │   ├── neutral: black, white, grey, beige...                    │   │
│  │ │   └── metallic: gold, silver, bronze...                        │   │
│  │ │                                                                │   │
│  │ └── pattern (motif visuel)                                       │   │
│  │     ├── solid: plain, heathered...                               │   │
│  │     ├── geometric: stripes, checks, dots...                      │   │
│  │     └── organic: floral, paisley, animal...                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ INFORMATIONS COMMERCIALES                                        │   │
│  │ ├── price (prix)                                                 │   │
│  │ ├── stock (disponibilité)                                        │   │
│  │ ├── min_order (commande minimum)                                 │   │
│  │ ├── sale_unit (unité de vente: mètre, pièce, 10cm)               │   │
│  │ └── certifications (GOTS, OEKO-TEX, GRS...)                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ⭐ = Required for search filters                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ MAPPING
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXTRACTION PAR SOURCE                               │
│                      (site_profiles.extraction_patterns)                │
│                                                                         │
│  Pour chaque site, on découvre COMMENT extraire chaque critère :        │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ mylittlecoupon.fr                                                │   │
│  │ ┌─────────────┬──────────┬──────────┬─────────────────────────┐ │   │
│  │ │ Critère     │ Source   │ Coverage │ Pattern                 │ │   │
│  │ ├─────────────┼──────────┼──────────┼─────────────────────────┤ │   │
│  │ │ fiber       │ tags     │ 85%      │ dict lookup             │ │   │
│  │ │ color       │ tags     │ 80%      │ dict lookup             │ │   │
│  │ │ pattern     │ tags     │ 75%      │ dict lookup             │ │   │
│  │ │ length      │ tags     │ 100%     │ /(\d+[.,]?\d*)\s*m/     │ │   │
│  │ │ width       │ body     │ 82%      │ /Largeur\s*:\s*(\d+)/   │ │   │
│  │ │ weight      │ body     │ 86%      │ /(\d+)\s*gr?\/m/        │ │   │
│  │ │ min_order   │ —        │ 0%       │ Non détecté             │ │   │
│  │ │ composition │ body     │ 90%      │ /(\d+%\s*\w+)/          │ │   │
│  │ └─────────────┴──────────┴──────────┴─────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ thefabricsales.com                                               │   │
│  │ ┌─────────────┬──────────┬──────────┬─────────────────────────┐ │   │
│  │ │ fiber       │ tags     │ 80%      │ dict lookup             │ │   │
│  │ │ color       │ tags     │ 75%      │ dict lookup             │ │   │
│  │ │ pattern     │ body     │ 90%      │ /Pattern:\s*(\w+)/      │ │   │
│  │ │ length      │ —        │ 0%       │ Vente au mètre          │ │   │
│  │ │ width       │ body     │ 100%     │ /Width:\s*(\d+)\s*cm/   │ │   │
│  │ │ weight      │ body     │ 100%     │ /Weight:\s*(\d+)gr/     │ │   │
│  │ │ min_order   │ body     │ 100%     │ /Minimum order.*(\d+)/  │ │   │
│  │ │ sale_unit   │ body     │ 100%     │ /sold per (\d+cm)/      │ │   │
│  │ │ composition │ body     │ 95%      │ /Composition:\s*(.+)/   │ │   │
│  │ └─────────────┴──────────┴──────────┴─────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Modèle de Données

### Tables Existantes ✅

#### `attribute_categories` (existe, à enrichir)

```sql
-- Structure actuelle
attribute_categories (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE,           -- 'fiber', 'color', 'pattern', 'weave'
  name TEXT,                  -- 'Fiber', 'Color'
  parent_id UUID,             -- Support hiérarchie
  level INTEGER,              -- 0=root, 1=child, 2=grandchild
  path TEXT,                  -- Materialized path
  display_order INTEGER,
  icon TEXT,
  color TEXT,
  description TEXT,
  is_active BOOLEAN,
  is_searchable BOOLEAN,      -- ✅ Pour filtres recherche
  is_required BOOLEAN,        -- ✅ Pour score qualité
  translations JSONB
)

-- Données actuelles (4 catégories)
-- fiber (is_required: true, is_searchable: true)
-- color (is_required: true, is_searchable: true)
-- weave (is_required: false, is_searchable: true)
-- pattern (is_required: false, is_searchable: true)
```

**Évolutions suggérées** :
```sql
-- Nouvelles colonnes optionnelles pour ADR-022
ALTER TABLE attribute_categories ADD COLUMN IF NOT EXISTS
  category_type TEXT DEFAULT 'attribute',     -- 'group', 'attribute', 'value'
  extraction_type TEXT,                       -- 'dictionary', 'pattern', 'shopify_standard'
  introduced_in_version TEXT DEFAULT '1.0.0';
```

#### `textile_attributes` (existe ✅)

```sql
-- Structure actuelle - PARFAITE
textile_attributes (
  id UUID PRIMARY KEY,
  textile_id UUID REFERENCES textiles(id),
  category_id UUID REFERENCES attribute_categories(id),
  category_slug TEXT,         -- Dénormalisé pour perf
  value TEXT,                 -- Valeur normalisée EN ('silk', 'red')
  source_term TEXT,           -- Terme original ('soie', 'rouge')
  source_locale TEXT,         -- 'fr', 'en'
  confidence NUMERIC
)
```

#### `textiles` - Données fixes (existe ✅)

```sql
-- Colonnes "dénominateur commun" - RESTENT sur textiles
textiles (
  -- Identité
  id, name, description, image_url, additional_images,
  source_url, source_platform, source_product_id, site_id,
  
  -- Dimensions physiques (universel)
  width_value, width_unit,      -- Largeur cm
  weight_value, weight_unit,    -- Grammage gsm
  
  -- Disponibilité (⚠️ à clarifier)
  quantity_value, quantity_unit,  -- Ambigu : longueur ou stock ?
  available,                      -- Boolean dispo
  
  -- Commercial (universel)
  price_value, price_currency,
  price_per_unit, price_per_unit_label,
  minimum_order_value, minimum_order_unit,  -- ✅ Déjà là !
  
  -- Legacy (à migrer progressivement vers textile_attributes)
  material_type, color, pattern,
  material_original, color_original, pattern_original,
  material_confidence, color_confidence, pattern_confidence,
  
  -- Métadonnées
  raw_data, data_quality_score, certifications,
  created_at, updated_at, scraped_at
)
```

### Tables à Créer (optionnel, Phase 2+)

#### `standard_versions` (nouvelle, optionnelle)

```sql
CREATE TABLE deadstock.standard_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,           -- '1.0.0', '1.1.0'
  name TEXT,                              -- 'Initial Release'
  description TEXT,
  changelog JSONB,
  categories_snapshot JSONB,
  status TEXT DEFAULT 'draft',            -- 'draft', 'published', 'deprecated'
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `standard_proposals` (nouvelle, optionnelle)

```sql
CREATE TABLE deadstock.standard_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_type TEXT NOT NULL,            -- 'add_category', 'add_value', 'modify'
  title TEXT NOT NULL,
  description TEXT,
  target_category_id UUID REFERENCES attribute_categories(id),
  proposed_changes JSONB NOT NULL,
  source_type TEXT,                       -- 'discovery', 'manual'
  source_site_id UUID REFERENCES sites(id),
  evidence JSONB,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Clarification `quantity_value` (migration suggérée)

Le champ `quantity_value` est actuellement ambigu :

| Source | Signification actuelle | Problème |
|--------|------------------------|----------|
| MLC | Longueur coupon (ex: 3.5m) | ✅ Clair |
| TFS | Stock infini (vente au mètre) | ❌ Que mettre ? |

**Solution proposée** :
```sql
-- Option A : Ajouter un champ de clarification
ALTER TABLE textiles ADD COLUMN sale_type TEXT 
  CHECK (sale_type IN ('fixed_length', 'cut_to_order', 'by_piece'));

-- Mapping :
-- fixed_length  : quantity_value = longueur disponible (MLC)
-- cut_to_order  : quantity_value = NULL ou stock max (TFS)
-- by_piece      : quantity_value = nombre de pièces

-- Option B : Renommer pour clarifier (breaking change)
-- quantity_value → length_available
-- Ajouter stock_type pour le mode de vente
```

---

## Système de Tuning Dual-Level (Architecture prévisionnelle)

### Deux méthodes d'extraction

L'extraction des attributs textiles repose sur deux méthodes complémentaires :

```
┌─────────────────────────────────────────────────────────────────┐
│                     EXTRACTION DES ATTRIBUTS                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MÉTHODE 1 : DICTIONNAIRE (classification)                      │
│  ──────────────────────────────────────────                     │
│  Scope    : Global (tous les sites)                             │
│  Pour     : fiber, color, pattern, weave                        │
│  Process  : Terme source → Lookup → Valeur normalisée EN        │
│  Stockage : dictionary_mappings                                 │
│  Tuning   : /admin/tuning (existe ✅)                           │
│  Tracking : unknown_terms (existe ✅)                           │
│                                                                 │
│  Exemple : "soie" (fr) → dictionary → "silk"                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MÉTHODE 2 : PATTERNS REGEX (mesures)                           │
│  ────────────────────────────────────                           │
│  Scope    : Par site (regex spécifiques)                        │
│  Pour     : width, weight, length, min_order, sale_unit         │
│  Process  : Regex sur body_html/tags → Valeur + unité           │
│  Stockage : site_profiles.extraction_patterns                   │
│  Tuning   : À créer 🔲                                          │
│  Tracking : À créer 🔲                                          │
│                                                                 │
│  Exemple : "Width: 140cm" → /Width:\s*(\d+)/ → 140              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Comparaison des deux méthodes

| Aspect | Dictionnaire | Patterns |
|--------|--------------|----------|
| **Type de données** | Classification (texte) | Mesures (numérique) |
| **Scope** | Global (tous les sites) | Par site |
| **Tuning** | Ajouter des termes | Modifier des regex |
| **Interface** | ✅ `/admin/tuning` | 🔲 À créer |
| **Tracking échecs** | ✅ `unknown_terms` | 🔲 À créer |

### Table prévisionnelle : `extraction_failures`

```sql
-- Table pour tracker les échecs d'extraction par pattern (non implémentée)
CREATE TABLE deadstock.extraction_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contexte
  site_id UUID REFERENCES sites(id),
  textile_id UUID REFERENCES textiles(id),
  attribute_slug TEXT NOT NULL,           -- 'width', 'weight', 'length'
  
  -- Données source
  source_field TEXT,                      -- 'body_html', 'tags'
  source_content TEXT,                    -- Extrait du contenu analysé
  
  -- Pattern tenté
  pattern_used TEXT,                      -- Regex utilisée
  
  -- Tracking
  first_seen_at TIMESTAMP DEFAULT NOW(),
  occurrences INTEGER DEFAULT 1,
  
  -- Résolution
  status TEXT DEFAULT 'pending',          -- 'pending', 'resolved', 'ignored'
  resolved_pattern TEXT,                  -- Nouveau pattern qui fonctionne
  resolved_at TIMESTAMP,
  
  UNIQUE(site_id, textile_id, attribute_slug)
);
```

### Extension `attribute_categories`

```sql
-- Colonne pour distinguer méthode d'extraction (optionnel)
ALTER TABLE attribute_categories 
ADD COLUMN extraction_type TEXT DEFAULT 'dictionary'
CHECK (extraction_type IN ('dictionary', 'pattern', 'shopify_standard', 'computed'));

-- Données :
-- fiber, color, pattern, weave → 'dictionary'
-- width, weight, length → 'pattern'
-- price, available → 'shopify_standard'
```

### Interface unifiée prévisionnelle

```
┌─────────────────────────────────────────────────────────────────┐
│                     /admin/tuning                               │
│                    (interface unifiée)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Dictionnaire ✅]  [Patterns 🔲]  [Standard 🔲]                │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  DICTIONNAIRE (global)                                          │
│  Unknowns : 23 termes à traiter                                 │
│  ┌──────────┬──────────┬───────┬─────────┬─────────────┐       │
│  │ Terme    │ Catégorie│ Occur.│ Suggest.│ Action      │       │
│  ├──────────┼──────────┼───────┼─────────┼─────────────┤       │
│  │ "seda"   │ fiber    │ 12    │ silk    │ [✓] [✗]    │       │
│  │ "azul"   │ color    │ 8     │ blue    │ [✓] [✗]    │       │
│  └──────────┴──────────┴───────┴─────────┴─────────────┘       │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  PATTERNS (par site) - À implémenter                            │
│  Site: [The Fabric Sales ▼]                                     │
│  ┌──────────┬────────────────┬──────────┬──────────┬────────┐  │
│  │ Attribut │ Pattern        │ Coverage │ Échecs   │ Action │  │
│  ├──────────┼────────────────┼──────────┼──────────┼────────┤  │
│  │ width    │ /Width:(\d+)/  │ 100%     │ 0        │ [✏️]   │  │
│  │ weight   │ /(\d+)gsm/     │ 95%      │ 12       │ [✏️]   │  │
│  │ length   │ —              │ N/A      │ —        │ [➕]   │  │
│  └──────────┴────────────────┴──────────┴──────────┴────────┘  │
│                                                                 │
│  [Voir 12 échecs weight] → Modal avec produits ratés            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Priorité d'implémentation

| Composant | Priorité | Effort | Status |
|-----------|----------|--------|--------|
| Migration `textile_attributes` | P1 | 1h | 🔲 À faire |
| Vue matérialisée `textiles_search` | P1 | 2h | 🔲 À faire |
| Dual-write scraping | P2 | 3h | 🔲 À faire |
| Table `extraction_failures` | P3 | 1h | 📋 Prévu |
| UI tuning patterns | P3 | 4h | 📋 Prévu |
| Colonne `extraction_type` | P3 | 30min | 📋 Prévu |

---

### Structure `extraction_patterns` dans `site_profiles` (existe ✅)

```jsonc
// Structure actuelle dans site_profiles.extraction_patterns
{
  "patterns": [
    {
      "field": "length",
      "source": "tags",           // où extraire
      "regex": "/(\\d+)\\s*m/i",  // comment extraire
      "coverage": 1.0,            // taux de succès
      "enabled": true
    },
    {
      "field": "width",
      "source": "body_html",
      "regex": "/Largeur\\s*:\\s*(\\d+)/i",
      "coverage": 0.82,
      "enabled": true
    }
  ],
  "analyzedAt": "2026-01-07T...",
  "productsAnalyzed": 50
}
```

**Évolution suggérée** : Ajouter le mapping vers le standard
```jsonc
{
  "standardMapping": {
    "fiber": {
      "status": "mapped",           // mapped, partial, missing
      "method": "dictionary",       // dictionary, pattern, shopify
      "sources": ["tags"],
      "coverage": 0.85
    },
    "length": {
      "status": "mapped",
      "method": "pattern",
      "sources": ["tags"],
      "pattern": "/(\\d+)\\s*m/i",
      "coverage": 1.0
    },
    "min_order": {
      "status": "missing",          // Non détecté sur ce site
      "coverage": 0
    }
  },
  "discoveredAttributes": [
    {
      "name": "brand",
      "source": "vendor",
      "coverage": 1.0,
      "inStandard": false
    }
  ]
}
```

---

## Workflow d'Évolution du Standard

### 1. Découverte (Discovery)

```
┌─────────────────────────────────────────────────────────────────┐
│ Discovery d'un nouveau site                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Analyse des produits                                        │
│     ↓                                                           │
│  2. Pour chaque critère du STANDARD :                           │
│     - Chercher dans tags, body, title, variants                 │
│     - Calculer coverage                                         │
│     - Stocker pattern si trouvé                                 │
│     ↓                                                           │
│  3. Détecter attributs NON STANDARD :                           │
│     - Champs structurés non mappés                              │
│     - Patterns récurrents dans body_html                        │
│     ↓                                                           │
│  4. Générer rapport :                                           │
│     - Standard coverage: 85%                                    │
│     - Attributs manquants: [min_order]                          │
│     - Attributs découverts: [brand, season]                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Proposition d'Enrichissement

```
┌─────────────────────────────────────────────────────────────────┐
│ Workflow de proposition                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TRIGGER: Attribut découvert avec coverage > 50% sur 2+ sites   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PROPOSITION AUTOMATIQUE                                  │   │
│  │                                                          │   │
│  │ Nouvel attribut détecté: "composition"                   │   │
│  │                                                          │   │
│  │ Evidence:                                                │   │
│  │ - MLC: 90% coverage, pattern /(\d+%\s*\w+)/              │   │
│  │ - TFS: 95% coverage, pattern /Composition:\s*(.+)/       │   │
│  │                                                          │   │
│  │ Proposition:                                             │   │
│  │ - Parent: fiber (attributs matière)                      │   │
│  │ - Type: attribute                                        │   │
│  │ - Format: "80% viscose, 20% elastane"                    │   │
│  │                                                          │   │
│  │ [✓ Approuver]  [✗ Rejeter]  [✏️ Modifier]               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Publication d'une Version

```
┌─────────────────────────────────────────────────────────────────┐
│ Release du Standard v1.1.0                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Changelog:                                                     │
│  + Added: composition (fiber group)                             │
│  + Added: min_order (commercial group)                          │
│  + Added: sale_unit (commercial group)                          │
│  ~ Modified: color hierarchy (added metallic subgroup)          │
│  - Deprecated: none                                             │
│                                                                 │
│  Migration:                                                     │
│  - Re-analyze tous les sites avec nouveau standard              │
│  - Mettre à jour extraction_patterns                            │
│  - Re-normaliser textiles impactés                              │
│                                                                 │
│  [Publish v1.1.0]                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Interface Admin

### Page: `/admin/standard`

```
┌─────────────────────────────────────────────────────────────────┐
│ 📐 Deadstock Textile Standard                     v1.0.0 [Edit] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Catégories]  [Propositions (3)]  [Versions]  [Export]          │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ 📦 DIMENSIONS PHYSIQUES                                         │
│ │                                                               │
│ ├── 📏 length        Longueur disponible         [extractable]  │
│ │   Coverage: MLC 100% ✅ | TFS 0% ❌ (vente au mètre)          │
│ │                                                               │
│ ├── 📐 width         Largeur du tissu       ⭐   [extractable]  │
│ │   Coverage: MLC 82% ✅ | TFS 100% ✅                           │
│ │                                                               │
│ └── ⚖️ weight        Grammage (g/m²)             [extractable]  │
│     Coverage: MLC 86% ✅ | TFS 100% ✅                           │
│                                                                 │
│ 🧵 ATTRIBUTS MATIÈRE                                            │
│ │                                                               │
│ ├── 🧶 fiber         Composition           ⭐   [dictionary]    │
│ │   │ Coverage: MLC 85% ✅ | TFS 80% ✅                          │
│ │   │                                                           │
│ │   ├── 🌿 natural                                              │
│ │   │   ├── silk, cotton, wool, linen, hemp...                  │
│ │   │                                                           │
│ │   └── ⚗️ synthetic                                            │
│ │       ├── polyester, nylon, viscose, elastane...              │
│ │                                                               │
│ ├── 🪡 weave         Tissage/Construction        [dictionary]   │
│ │   Coverage: MLC 45% ⚠️ | TFS 60% ⚠️                           │
│ │                                                               │
│ └── ✨ finish        Finition              [NEW] [dictionary]   │
│     Coverage: Non mesuré                                        │
│                                                                 │
│ 🎨 ATTRIBUTS VISUELS                                            │
│ │                                                               │
│ ├── 🎨 color         Couleur               ⭐   [dictionary]    │
│ │   Coverage: MLC 80% ✅ | TFS 75% ✅                            │
│ │                                                               │
│ └── 🔲 pattern       Motif                      [dictionary]    │
│     Coverage: MLC 75% ✅ | TFS 90% ✅                            │
│                                                                 │
│ 💰 INFORMATIONS COMMERCIALES                                    │
│ │                                                               │
│ ├── 💵 price         Prix                       [shopify]       │
│ │   Coverage: MLC 100% ✅ | TFS 100% ✅                          │
│ │                                                               │
│ ├── 📦 stock         Disponibilité              [shopify]       │
│ │   Coverage: MLC 100% ✅ | TFS ⚠️ (bool only)                  │
│ │                                                               │
│ ├── 🔢 min_order     Commande minimum     [NEW] [extractable]   │
│ │   Coverage: MLC 0% ❌ | TFS 100% ✅                            │
│ │                                                               │
│ └── 📐 sale_unit     Unité de vente       [NEW] [extractable]   │
│     Coverage: MLC ❌ | TFS 100% ✅                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Page: `/admin/standard/proposals`

```
┌─────────────────────────────────────────────────────────────────┐
│ 📝 Propositions d'évolution                           3 pending │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ✨ ADD: composition                              [PENDING]  │ │
│ │                                                             │ │
│ │ Détail composition des fibres (ex: "80% viscose, 20% ela") │ │
│ │                                                             │ │
│ │ Source: Discovery automatique                               │ │
│ │ Evidence:                                                   │ │
│ │ - MLC: 90% coverage via body_html                           │ │
│ │ - TFS: 95% coverage via body_html                           │ │
│ │                                                             │ │
│ │ Placement suggéré: fiber (sous-attribut)                    │ │
│ │                                                             │ │
│ │ [✓ Approuver]  [✗ Rejeter]  [💬 Commenter]                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ✨ ADD: brand                                    [PENDING]  │ │
│ │                                                             │ │
│ │ Marque/Designer d'origine du tissu                          │ │
│ │                                                             │ │
│ │ Source: Discovery TFS                                       │ │
│ │ Evidence: TFS 100% coverage via vendor field                │ │
│ │                                                             │ │
│ │ [✓ Approuver]  [✗ Rejeter]  [💬 Commenter]                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Vision Long-Terme: Standard Ouvert

### Phase 1: Standard Interne (Current)
- Utilisé uniquement par Deadstock
- Évolution pilotée par les sources scrapées
- Documentation interne

### Phase 2: Standard Documenté (M6-M9)
- Publication de la taxonomie complète
- Documentation publique des catégories
- API de consultation du standard

### Phase 3: Standard Collaboratif (M12+)
- Contributions externes (suggestions)
- Comité de validation
- Versioning sémantique strict
- Certification "Deadstock Compliant" pour sources

### Phase 4: Standard Industrie (M18+)
- Proposition aux organismes (ASTM, ISO)
- Adoption par autres plateformes
- Licence open-source

---

## Bénéfices

### Court-terme
1. **Clarté** : Séparation nette entre standard et extraction
2. **Visibilité** : Interface montrant coverage par critère par site
3. **Qualité** : Identification des gaps de données

### Moyen-terme
1. **Évolutivité** : Ajout de critères sans refactor
2. **Traçabilité** : Historique des changements
3. **Automatisation** : Propositions basées sur discovery

### Long-terme
1. **Différenciation** : Deadstock = référence normalisation textile
2. **Écosystème** : API de normalisation pour l'industrie
3. **Communauté** : Standard ouvert et collaboratif

---

## Implémentation

### Ce qui existe déjà ✅

| Composant | Status | Localisation |
|-----------|--------|--------------|
| `attribute_categories` | ✅ Table existe | DB + 4 catégories seedées |
| `textile_attributes` | ✅ Table existe | DB + structure complète |
| `textiles_with_attributes` | ✅ Vue existe | DB (jointure auto) |
| `get_searchable_categories()` | ✅ Fonction existe | DB |
| `dictionary_mappings` → `category_id` | ✅ FK existe | DB |
| `minimum_order_value/unit` | ✅ Colonnes existent | `textiles` |
| Dual-write legacy + attributes | ⚠️ Partiel | À vérifier |

### Phase 1 : Connecter les filtres au standard (2-3h)

**Objectif** : Utiliser `textile_attributes` + `get_searchable_categories()` pour les filtres.

**Fichiers à modifier** :

```typescript
// src/features/search/infrastructure/textileRepository.ts

// AVANT (actuel)
async getAvailableFilters(): Promise<AvailableFilters> {
  const { data: materials } = await supabase
    .from('textiles')
    .select('material_type')  // ← Colonne legacy
    // ...
}

// APRÈS (cible)
async getAvailableFilters(): Promise<DynamicFilters> {
  // 1. Récupérer catégories searchable
  const { data: categories } = await supabase
    .rpc('get_searchable_categories');
  
  // 2. Pour chaque catégorie, récupérer valeurs distinctes
  const filters = await Promise.all(
    categories.map(async (cat) => {
      const { data } = await supabase
        .from('textile_attributes')
        .select('value')
        .eq('category_slug', cat.slug);
      
      return {
        slug: cat.slug,
        name: cat.name,
        values: [...new Set(data?.map(d => d.value))].sort()
      };
    })
  );
  
  return { categories: filters };
}
```

```typescript
// src/features/search/domain/types.ts

// AVANT
interface AvailableFilters {
  materials: string[];
  colors: string[];
  patterns: string[];
}

// APRÈS
interface DynamicFilters {
  categories: Array<{
    slug: string;        // 'fiber', 'color', 'pattern', 'weave'
    name: string;        // 'Fiber', 'Color'
    values: string[];    // ['silk', 'cotton', ...]
  }>;
}
```

```typescript
// src/components/search/Filters.tsx
// Refactorer pour itérer sur categories dynamiques
```

### Phase 2 : Interface Discovery enrichie (3-4h)

**Objectif** : Afficher le mapping standard ↔ extraction dans `/admin/discovery/[siteSlug]`

**Maquette** :
```
┌─────────────────────────────────────────────────────────────────┐
│ Mapping Standard Deadstock                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ATTRIBUTS CLASSIFICATION (via dictionnaire)                     │
│ ┌───────────┬───────────┬──────────┬────────────────┐          │
│ │ Standard  │ Status    │ Source   │ Coverage       │          │
│ ├───────────┼───────────┼──────────┼────────────────┤          │
│ │ fiber ⭐  │ ✅ Mappé  │ tags     │ 85%            │          │
│ │ color ⭐  │ ✅ Mappé  │ tags     │ 80%            │          │
│ │ pattern   │ ✅ Mappé  │ body     │ 90%            │          │
│ │ weave     │ ⚠️ Partiel│ body     │ 45%            │          │
│ └───────────┴───────────┴──────────┴────────────────┘          │
│                                                                 │
│ DIMENSIONS PHYSIQUES (via patterns)                             │
│ ┌───────────┬───────────┬──────────┬────────────────┐          │
│ │ length    │ ❌ N/A    │ —        │ Vente au mètre │          │
│ │ width     │ ✅ Mappé  │ body     │ 100%           │          │
│ │ weight    │ ✅ Mappé  │ body     │ 100%           │          │
│ └───────────┴───────────┴──────────┴────────────────┘          │
│                                                                 │
│ ATTRIBUTS DÉCOUVERTS (hors standard)                            │
│ ┌───────────┬───────────┬──────────┬────────────────┐          │
│ │ brand     │ ✨ Nouveau│ vendor   │ 100%           │          │
│ │ season    │ ✨ Nouveau│ tags     │ 30%            │          │
│ └───────────┴───────────┴──────────┴────────────────┘          │
│                                                                 │
│ [Proposer "brand" au standard]                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 3 : Clarifier quantity_value (1h)

**Option recommandée** : Ajouter `sale_type` sans breaking change

```sql
-- Migration
ALTER TABLE deadstock.textiles 
ADD COLUMN sale_type TEXT DEFAULT 'fixed_length'
CHECK (sale_type IN ('fixed_length', 'cut_to_order', 'by_piece'));

-- Mise à jour données existantes
UPDATE deadstock.textiles 
SET sale_type = 'fixed_length' 
WHERE source_platform LIKE '%mylittlecoupon%';

UPDATE deadstock.textiles 
SET sale_type = 'cut_to_order' 
WHERE source_platform LIKE '%thefabricsales%';
```

### Phase 4 : Standard versionné (optionnel, Phase 2+)

Créer les tables `standard_versions` et `standard_proposals` si besoin de traçabilité.

---

## Architecture Cible (Recommandée)

### Principe : EAV + Vue Matérialisée

```
┌─────────────────────────────────────────────────────────────────┐
│                     SOURCE DE VÉRITÉ                            │
│                   (textile_attributes)                          │
│                                                                 │
│  Stockage flexible, extensible, arborescent                     │
│  ├── fiber: silk (category: fiber)                              │
│  ├── color: red (category: color)                               │
│  ├── pattern: solid (category: pattern)                         │
│  ├── width: 140 (category: dimension, unit: cm)                 │
│  ├── weight: 85 (category: dimension, unit: gsm)                │
│  ├── length: 3.5 (category: availability, unit: m)              │
│  └── [extensible sans migration...]                             │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REFRESH (nuit, après scraping)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     VUE MATÉRIALISÉE                            │
│                    (textiles_search)                            │
│                                                                 │
│  Vue pré-calculée, optimisée pour requêtes                      │
│  ├── id, name, image_url, source_url                            │
│  ├── price_value, available                                     │
│  ├── fiber (pivoté depuis attributes)                           │
│  ├── color (pivoté depuis attributes)                           │
│  ├── pattern (pivoté depuis attributes)                         │
│  ├── width (pivoté depuis attributes)                           │
│  └── [colonnes indexées pour filtres rapides]                   │
│                                                                 │
│  Index B-tree sur chaque colonne filtrée                        │
│  Performance: 5-50ms même avec 1M+ textiles                     │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ SELECT (jour, utilisateurs)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API RECHERCHE                               │
│               (textileRepository.search)                        │
│                                                                 │
│  Requêtes simples sur colonnes directes                         │
│  SELECT * FROM textiles_search                                  │
│  WHERE fiber = 'silk' AND color = 'red'                         │
│  AND width >= 140                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Pourquoi cette architecture ?

| Critère | EAV pur | Colonnes directes | **EAV + Vue mat.** |
|---------|---------|-------------------|-------------------|
| Flexibilité | ✅ Max | ❌ Rigide | ✅ Max |
| Performance 1M+ | ❌ Lent | ✅ Rapide | ✅ Rapide |
| Arborescence | ✅ Oui | ❌ Non | ✅ Oui |
| Nouveaux attributs | ✅ Sans migration | ❌ Migration | ✅ Sans migration |
| Complexité requêtes | ❌ JOINs multiples | ✅ Simple | ✅ Simple |

### Cycle de vie des données

```
NUIT (aucun utilisateur)              JOUR (utilisateurs actifs)
────────────────────────              ─────────────────────────

1. Scraping (1-2h)                    Recherches (5-50ms)
   └── INSERT textile_attributes      └── SELECT textiles_search
                                          WHERE fiber = 'silk'
2. Normalisation (5min)                   
   └── UPDATE textile_attributes      Favoris, Boards
                                      └── SELECT textiles (direct)
3. Refresh vue (10-30 sec)            
   └── REFRESH MATERIALIZED VIEW      ✅ Aucun impact du refresh
       CONCURRENTLY textiles_search   
```

### Implémentation Vue Matérialisée

```sql
-- Création de la vue matérialisée
CREATE MATERIALIZED VIEW deadstock.textiles_search AS
SELECT 
  t.id,
  t.name,
  t.description,
  t.image_url,
  t.source_url,
  t.source_platform,
  t.price_value,
  t.price_currency,
  t.available,
  t.created_at,
  t.site_id,
  -- Attributs pivotés depuis textile_attributes
  MAX(CASE WHEN ta.category_slug = 'fiber' THEN ta.value END) as fiber,
  MAX(CASE WHEN ta.category_slug = 'color' THEN ta.value END) as color,
  MAX(CASE WHEN ta.category_slug = 'pattern' THEN ta.value END) as pattern,
  MAX(CASE WHEN ta.category_slug = 'weave' THEN ta.value END) as weave,
  MAX(CASE WHEN ta.category_slug = 'width' THEN ta.value::numeric END) as width,
  MAX(CASE WHEN ta.category_slug = 'weight' THEN ta.value::numeric END) as weight,
  MAX(CASE WHEN ta.category_slug = 'length' THEN ta.value::numeric END) as length
FROM deadstock.textiles t
LEFT JOIN deadstock.textile_attributes ta ON t.id = ta.textile_id
WHERE t.available = true
GROUP BY t.id;

-- Index pour performance
CREATE UNIQUE INDEX idx_search_id ON deadstock.textiles_search(id);
CREATE INDEX idx_search_fiber ON deadstock.textiles_search(fiber);
CREATE INDEX idx_search_color ON deadstock.textiles_search(color);
CREATE INDEX idx_search_pattern ON deadstock.textiles_search(pattern);
CREATE INDEX idx_search_width ON deadstock.textiles_search(width);
CREATE INDEX idx_search_weight ON deadstock.textiles_search(weight);
CREATE INDEX idx_search_price ON deadstock.textiles_search(price_value);
CREATE INDEX idx_search_created ON deadstock.textiles_search(created_at DESC);

-- Refresh (à appeler après scraping)
REFRESH MATERIALIZED VIEW CONCURRENTLY deadstock.textiles_search;
```

### Migration Progressive

```
Phase 1 (actuel)     Phase 2 (transition)     Phase 3 (cible)
────────────────     ───────────────────      ──────────────────

textiles             textiles                 textiles (minimal)
├── material_type    ├── material_type        ├── id, name, price
├── color            ├── color                ├── source_url
├── pattern          ├── pattern              └── available
├── width_value      ├── width_value          
└── ...              └── ...                  textile_attributes
                                              ├── fiber, color
                     textile_attributes       ├── pattern, weave
                     ├── fiber (dual-write)   ├── width, weight
                     ├── color (dual-write)   └── length, min_order
                     └── pattern              
                                              textiles_search (vue)
                     textiles_search (vue)    └── Requêtes optimisées
                     └── Test en parallèle    
```

---

## Résumé Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     STANDARD DEADSTOCK                          │
│                   (attribute_categories)                        │
│                                                                 │
│  Catégories searchable :                                        │
│  fiber ⭐ │ color ⭐ │ pattern │ weave │ [extensible...]        │
│                                                                 │
│  get_searchable_categories() → Alimente filtres recherche       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ normalise via
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DICTIONNAIRE                                  │
│                (dictionary_mappings)                            │
│                                                                 │
│  source_term + source_locale + category_id → translations       │
│  "soie" (fr) + fiber → {"en": "silk"}                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ stocke dans
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              TEXTILES + ATTRIBUTES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  textiles (données fixes)     │  textile_attributes (classif.) │
│  ─────────────────────────    │  ───────────────────────────── │
│  • name, description          │  • fiber: silk                 │
│  • price_value, currency      │  • color: red                  │
│  • width_value, weight_value  │  • pattern: solid              │
│  • quantity_value, sale_type  │  • weave: crepe                │
│  • minimum_order_value        │  • [extensible...]             │
│  • available                  │                                │
│                               │                                │
│  Legacy (à migrer) :          │  Vue dénormalisée :            │
│  • material_type → fiber      │  textiles_with_attributes      │
│  • color → color              │  (material_type_v2, color_v2)  │
│  • pattern → pattern          │                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ détecte via
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTRACTION PAR SITE                           │
│              (site_profiles.extraction_patterns)                │
│                                                                 │
│  Mapping standard ↔ source :                                    │
│  • fiber: tags (dictionnaire, 85%)                              │
│  • width: body_html (pattern, 100%)                             │
│  • min_order: body_html (pattern, 100%) - TFS only              │
│                                                                 │
│  Attributs découverts :                                         │
│  • brand: vendor (100%) - pas dans standard                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Métriques de Succès

| Métrique | Actuel | Cible Phase 2 | Cible Phase 3 |
|----------|--------|---------------|---------------|
| `textile_attributes` peuplé | ❌ Vide | ✅ ~300 rows | ✅ Dual-write |
| Vue matérialisée | ❌ N/A | ✅ `textiles_search` | ✅ Refresh auto |
| Filtres dynamiques | ❌ Legacy | ✅ Via standard | ✅ |
| Performance recherche 100K | ~20ms | ~10ms | ~10ms |
| `sale_type` clarifié | ❌ Ambigu | ✅ | ✅ |
| Arborescence catégories | ❌ Plate | ⚠️ Préparée | ✅ Utilisée |

---

## Prochaines Actions

### Phase 1 : Quick wins (Session 18)
1. [x] Migrer données legacy → `textile_attributes` (migration SQL one-shot)
2. [ ] Ajouter colonne `sale_type` à `textiles`
3. [ ] Tester la vue existante `textiles_with_attributes`

### Phase 2 : Vue matérialisée (Session 19)
4. [ ] Créer `textiles_search` (vue matérialisée optimisée)
5. [ ] Ajouter index sur la vue
6. [ ] Modifier `textileRepository.search()` pour utiliser la vue
7. [ ] Modifier `textileRepository.getAvailableFilters()` pour utiliser `textile_attributes`

### Phase 3 : Dual-write scraping (Session 20)
8. [ ] Modifier `scrapingService` pour écrire dans `textile_attributes`
9. [ ] Ajouter refresh de la vue après scraping
10. [ ] Tester le cycle complet (scraping → refresh → recherche)

### Phase 4 : Interface & Standard (Session 21+)
11. [ ] Refactorer `Filters.tsx` pour filtres dynamiques
12. [ ] Enrichir interface Discovery avec mapping standard
13. [ ] Ajouter hiérarchie aux catégories (fiber > natural > silk)

### Phase 5 : Cleanup (futur)
14. [ ] Supprimer colonnes legacy (`material_type`, `color`, `pattern`)
15. [ ] Migrer `width_value`, `weight_value` vers `textile_attributes`
16. [ ] Documentation standard Deadstock

---

## Références

- ADR-010: Dynamic Attribute System (implémenté ✅)
- ADR-008: Intelligent Data Extraction
- ADR-020: Source Locale Configuration
- ADR-021: Extraction Patterns System

---

## Décision Summary

### Architecture retenue : EAV + Vue Matérialisée

**Source de vérité** : `textile_attributes` (flexible, extensible, arborescent)
**Requêtes optimisées** : `textiles_search` (vue matérialisée, indexée)
**Refresh** : Après scraping (nuit), aucun impact utilisateur

### Ce qui existe déjà ✅
- Table `attribute_categories` avec 4 catégories
- Table `textile_attributes` (structure prête, à peupler)
- Vue `textiles_with_attributes` (à remplacer par `textiles_search`)
- Fonction `get_searchable_categories()`
- Colonnes `minimum_order_value/unit` sur `textiles`

### Ce qui reste à faire
1. **Peupler `textile_attributes`** depuis colonnes legacy
2. **Créer vue matérialisée `textiles_search`** optimisée pour recherche
3. **Modifier le scraping** pour dual-write puis écriture unique
4. **Refactorer les filtres** pour utiliser le standard
5. **Clarifier `quantity_value`** avec `sale_type`

### Bénéfices long-terme
- ✅ Performance constante même à 1M+ textiles
- ✅ Flexibilité totale (nouveaux attributs sans migration)
- ✅ Arborescence possible (fiber > natural > silk)
- ✅ Standard propre et extensible
- ✅ Zéro impact utilisateur lors des mises à jour

---

**Status**: Draft → Validé  
**Prochaine étape**: Peupler `textile_attributes` + créer vue matérialisée  
**Auteur**: Thomas  
**Date**: 7 Janvier 2026
