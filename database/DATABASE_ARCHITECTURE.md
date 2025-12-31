# Database Architecture - Deadstock Search Engine

**Last Updated**: 29 Décembre 2024  
**Schema**: `deadstock` (PostgreSQL via Supabase)  
**Version**: Migration 007 (pending)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Schema Diagram](#schema-diagram)
3. [Tables Reference](#tables-reference)
4. [Relationships](#relationships)
5. [Indexes & Performance](#indexes--performance)
6. [Migration History](#migration-history)
7. [Common Queries](#common-queries)
8. [Best Practices](#best-practices)

---

## Overview

### Architecture Principles

**Multi-Schema Design** :
- `deadstock` schema = Isolated from main Blanche database
- Integration via shared `public` schema si nécessaire
- Clean separation of concerns

**Data Domains** :
1. **Product Data** : Textiles scraped from sources
2. **Normalization System** : Dictionaries, categories, attributes
3. **Admin System** : Sites management, discovery, scraping jobs
4. **Tuning System** : Unknown terms, quality metrics

**Design Patterns** :
- JSONB for flexible metadata
- Soft deletes (logical)
- Audit trails (created_at, updated_at)
- Cache with TTL (valid_until)
- Foreign keys for referential integrity

---

## Schema Diagram

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DEADSTOCK SCHEMA                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                │
│  │   PRODUCT    │         │  ADMIN       │                │
│  │   DOMAIN     │         │  DOMAIN      │                │
│  ├──────────────┤         ├──────────────┤                │
│  │ textiles     │◄────────│ sites        │                │
│  │              │         │ site_profiles│                │
│  │              │         │ discovery_jobs│               │
│  │              │         │ scraping_jobs│                │
│  └──────────────┘         └──────────────┘                │
│         ▲                                                  │
│         │                                                  │
│         │                                                  │
│  ┌──────┴────────┐         ┌──────────────┐               │
│  │ NORMALIZATION │         │  TUNING      │               │
│  │    DOMAIN     │         │  DOMAIN      │               │
│  ├───────────────┤         ├──────────────┤               │
│  │ attribute_    │         │ unknown_terms│               │
│  │   categories  │         │ quality_     │               │
│  │ textile_      │         │   metrics    │               │
│  │   attributes  │         │              │               │
│  │ dictionary_   │         │              │               │
│  │   mappings    │         │              │               │
│  └───────────────┘         └──────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Tables Reference

### 1. Product Domain

#### `textiles`

**Purpose** : Store scraped textile products from various sources

**Schema** :
```sql
CREATE TABLE deadstock.textiles (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_product_id TEXT NOT NULL,
  source_platform TEXT NOT NULL,  -- 'mlc', 'tfs', 'recovo'
  source_url TEXT,
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  
  -- Pricing
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  
  -- Availability
  available BOOLEAN DEFAULT true,
  quantity DECIMAL(10,2),
  unit TEXT,  -- 'meter', 'yard', 'kg'
  
  -- Normalized Attributes (from normalization pipeline)
  material_type TEXT,  -- Normalized fiber (silk, cotton, etc.)
  color TEXT,          -- Normalized color
  pattern TEXT,        -- Normalized pattern
  weave TEXT,          -- Normalized weave (NEW - Migration 006)
  
  -- Raw Extracted Data (before normalization)
  extracted JSONB,  -- { materials: [], colors: [], patterns: [] }
  
  -- Metadata
  tags TEXT[],
  source_locale TEXT,  -- 'fr', 'en', 'es'
  
  -- Quality
  quality_score DECIMAL(3,2),  -- 0.00 to 1.00
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  scraped_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(source_platform, source_product_id)
);
```

**Indexes** :
```sql
CREATE INDEX idx_textiles_platform ON textiles(source_platform);
CREATE INDEX idx_textiles_material ON textiles(material_type) WHERE material_type IS NOT NULL;
CREATE INDEX idx_textiles_color ON textiles(color) WHERE color IS NOT NULL;
CREATE INDEX idx_textiles_available ON textiles(available) WHERE available = true;
CREATE INDEX idx_textiles_locale ON textiles(source_locale);
```

**Key Points** :
- `source_product_id` + `source_platform` = Natural key
- `extracted` JSONB = Raw data before normalization
- `material_type`, `color`, etc. = Normalized values (after dictionary lookup)
- `quality_score` = Completeness metric (0-1)

**Sample Row** :
```json
{
  "id": "uuid-1234",
  "source_product_id": "12345678",
  "source_platform": "mlc",
  "title": "Crepe de Chine 100% Soie - Rouge",
  "price": 24.50,
  "material_type": "silk",
  "color": "red",
  "pattern": "solid",
  "extracted": {
    "materials": ["soie"],
    "colors": ["rouge"],
    "patterns": ["uni"]
  },
  "source_locale": "fr",
  "quality_score": 0.85,
  "scraped_at": "2024-12-29T14:35:00Z"
}
```

---

### 2. Normalization Domain

#### `attribute_categories`

**Purpose** : Define extensible attribute taxonomy (fiber, color, weave, pattern, etc.)

**Schema** :
```sql
CREATE TABLE deadstock.attribute_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,        -- 'fiber', 'color', 'weave'
  name JSONB NOT NULL,               -- {"en": "Fiber", "fr": "Fibre"}
  description JSONB,
  parent_id UUID REFERENCES attribute_categories(id),  -- Hierarchy support
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Current Categories** (Migration 006) :
```
fiber    → Material composition (silk, cotton, wool)
color    → Color attribute (blue, red, black)
weave    → Construction method (twill, satin, jersey)
pattern  → Visual pattern (solid, striped, floral)
```

**Future Categories** :
```
finish      → Surface treatment (glossy, matte, brushed)
properties  → Physical properties (stretch, waterproof, breathable)
weight      → Fabric weight (lightweight, medium, heavy)
use         → Usage category (shirting, dress, upholstery)
```

---

#### `textile_attributes`

**Purpose** : Store individual attribute values within categories

**Schema** :
```sql
CREATE TABLE deadstock.textile_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES attribute_categories(id) NOT NULL,
  slug TEXT NOT NULL,                    -- 'silk', 'blue', 'twill'
  name JSONB NOT NULL,                   -- {"en": "Silk", "fr": "Soie"}
  description JSONB,
  metadata JSONB,                        -- Flexible props
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(category_id, slug)
);
```

**Sample Data** :
```json
{
  "category_id": "fiber-uuid",
  "slug": "silk",
  "name": {"en": "Silk", "fr": "Soie", "es": "Seda"},
  "description": {"en": "Natural protein fiber"},
  "metadata": {
    "properties": ["luxurious", "breathable", "delicate"],
    "care": "Dry clean or hand wash"
  }
}
```

---

#### `dictionary_mappings`

**Purpose** : Map raw extracted terms to normalized values (with i18n support)

**Schema** :
```sql
CREATE TABLE deadstock.dictionary_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- NEW: i18n support (Migration 005)
  source_term TEXT NOT NULL,        -- Original term ('soie', 'silk')
  source_locale TEXT NOT NULL,      -- Source language ('fr', 'en')
  translations JSONB NOT NULL,      -- {"en": "silk", "fr": "soie", "es": "seda"}
  
  -- NEW: Category relationship (Migration 006)
  category_id UUID REFERENCES attribute_categories(id),
  
  -- OLD: Legacy columns (backward compatibility)
  term TEXT NOT NULL,               -- Duplicate of source_term
  value TEXT NOT NULL,              -- English normalized value
  category TEXT NOT NULL,           -- Legacy: 'material', 'color', 'pattern'
  
  -- Metadata
  source TEXT DEFAULT 'manual',     -- 'manual', 'auto', 'import'
  confidence DECIMAL(3,2) DEFAULT 1.0,
  
  -- Validation
  validated_at TIMESTAMP,
  validated_by UUID,                -- Future: user_id reference
  
  -- Usage tracking
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMP,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(source_term, source_locale, category_id)
);
```

**Key Points** :
- **i18n Support** : `source_term` + `source_locale` + `translations`
- **Dynamic Categories** : `category_id` references `attribute_categories`
- **Legacy Columns** : `term`, `value`, `category` maintained for backward compatibility
- **Validation** : Human approval workflow

**Indexes** :
```sql
CREATE INDEX idx_mappings_source ON dictionary_mappings(source_term, source_locale);
CREATE INDEX idx_mappings_category ON dictionary_mappings(category_id);
CREATE INDEX idx_mappings_legacy_category ON dictionary_mappings(category);
```

**Sample Row** :
```json
{
  "source_term": "soie",
  "source_locale": "fr",
  "translations": {"en": "silk", "fr": "soie", "es": "seda"},
  "category_id": "fiber-category-uuid",
  "term": "soie",        // Legacy
  "value": "silk",       // Legacy
  "category": "fiber",   // Legacy (was 'material')
  "source": "manual",
  "confidence": 1.0,
  "usage_count": 42
}
```

---

### 3. Tuning Domain

#### `unknown_terms`

**Purpose** : Track terms that couldn't be normalized (for human review)

**Schema** :
```sql
CREATE TABLE deadstock.unknown_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  source_locale TEXT NOT NULL,         -- 'fr', 'en', 'es'
  category TEXT NOT NULL,              -- 'fiber', 'color', 'pattern', 'weave'
  
  -- Context
  source_platform TEXT,                -- Where found
  occurrences INT DEFAULT 1,
  example_product_id UUID REFERENCES textiles(id),
  
  -- Review
  reviewed BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  reviewed_at TIMESTAMP,
  reviewed_by UUID,
  
  -- Suggested mapping (ML future)
  suggested_value TEXT,
  suggestion_confidence DECIMAL(3,2),
  
  -- Audit
  first_seen_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(term, source_locale, category),
  CHECK(category IN ('fiber', 'color', 'weave', 'pattern', 'finish', 'properties', 'weight', 'use'))
);
```

**Workflow** :
```
1. Scraping extracts term "7a1"
2. normalizationService can't find in dictionary
3. unknown_terms record created
4. Admin reviews in UI
5. Admin approves: "7a1" → "dark gray"
6. dictionary_mappings record created
7. Future scraping auto-normalizes "7a1"
```

---

### 4. Admin Domain

#### `sites`

**Purpose** : Manage external sites to scrape

**Schema** :
```sql
CREATE TABLE deadstock.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  name TEXT,
  platform_type TEXT,  -- 'shopify', 'woocommerce', 'custom'
  
  -- Status
  status TEXT DEFAULT 'new',  -- 'new', 'discovered', 'active', 'paused', 'archived'
  priority TEXT DEFAULT 'medium',  -- 'high', 'medium', 'low'
  
  -- Discovery
  discovery_completed_at TIMESTAMP,
  
  -- Scraping
  last_scraped_at TIMESTAMP,
  scraping_config JSONB,  -- Default config for this site
  
  -- Quality
  quality_score DECIMAL(3,2),
  
  -- Metadata
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Sample scraping_config** :
```json
{
  "refreshFrequency": "weekly",
  "maxRequestsPerHour": 50,
  "delayBetweenRequests": 2000,
  "filters": {
    "onlyAvailable": true,
    "requireImages": true,
    "requirePrice": true,
    "priceRange": {"min": 0, "max": 100}
  }
}
```

---

#### `site_profiles`

**Purpose** : Cache site structure discovery results (6 months TTL)

**Schema** :
```sql
CREATE TABLE deadstock.site_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) NOT NULL,
  
  -- Cache metadata
  discovered_at TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP NOT NULL,  -- NOW() + 6 months
  profile_version INT DEFAULT 1,
  
  -- Discovery results (STABLE DATA)
  collections JSONB,        -- Collections found
  sample_products JSONB,    -- Sample products for reference
  data_structure JSONB,     -- Available fields analysis
  quality_metrics JSONB,    -- Quality assessment
  recommendations JSONB,    -- Auto-generated recommendations
  
  -- Technical metadata
  is_shopify BOOLEAN,
  total_collections INT,
  relevant_collections INT,
  estimated_products INT,
  
  -- Re-discovery triggers
  needs_rediscovery BOOLEAN DEFAULT false,
  rediscovery_reason TEXT,  -- 'manual', 'errors', 'scheduled', 'structure_changed'
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Points** :
- **Long Cache** : `valid_until` = 6 months (structure rarely changes)
- **Version Tracking** : `profile_version` for change detection
- **Flexible Storage** : JSONB for complex nested data

**Sample collections** :
```json
[
  {
    "handle": "chutes-tissus",
    "title": "Chutes Tissus",
    "productsCount": 234,
    "relevant": true,
    "priority": "high",
    "maxProducts": 100,
    "filters": {
      "materials": ["silk", "cotton"],
      "colors": ["all"]
    }
  },
  {
    "handle": "mercerie",
    "title": "Mercerie",
    "productsCount": 567,
    "relevant": false,
    "reason": "Not textile products"
  }
]
```

**Indexes** :
```sql
CREATE INDEX idx_profiles_valid ON site_profiles(valid_until);
CREATE INDEX idx_profiles_site ON site_profiles(site_id);
CREATE INDEX idx_profiles_rediscovery ON site_profiles(needs_rediscovery) WHERE needs_rediscovery = true;
```

---

#### `discovery_jobs`

**Purpose** : Track batch discovery operations

**Schema** :
```sql
CREATE TABLE deadstock.discovery_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  status TEXT DEFAULT 'queued',  -- 'queued', 'running', 'completed', 'failed'
  mode TEXT DEFAULT 'batch',     -- 'batch', 'single'
  
  -- Progress
  sites_total INT DEFAULT 0,
  sites_completed INT DEFAULT 0,
  sites_failed INT DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  
  -- Configuration
  config JSONB,  -- { delayBetweenSites: 300000, sampleSize: 10, ... }
  
  -- Errors
  error_summary JSONB,  -- { "site1.com": "timeout", "site2.com": "not shopify" }
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

#### `scraping_jobs`

**Purpose** : Track scraping operations (uses profiles)

**Schema** :
```sql
CREATE TABLE deadstock.scraping_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) NOT NULL,
  profile_id UUID REFERENCES site_profiles(id),  -- Which profile version used
  
  status TEXT DEFAULT 'queued',  -- 'queued', 'running', 'completed', 'failed', 'partial'
  
  -- Timing
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  
  -- Configuration
  config JSONB,  -- Job-specific config (collections, filters, limits)
  
  -- Statistics
  products_fetched INT DEFAULT 0,
  products_saved INT DEFAULT 0,
  products_skipped INT DEFAULT 0,
  products_updated INT DEFAULT 0,
  errors_count INT DEFAULT 0,
  
  -- Quality
  quality_score DECIMAL(3,2),  -- Average quality of saved products
  
  -- Details
  logs JSONB,           -- Detailed logs
  error_details JSONB,  -- Error breakdown
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Points** :
- **Profile Link** : `profile_id` = Which discovery version was used
- **Detailed Stats** : Track fetched vs saved vs skipped
- **Quality Tracking** : Monitor quality regression

**Indexes** :
```sql
CREATE INDEX idx_jobs_site ON scraping_jobs(site_id);
CREATE INDEX idx_jobs_status ON scraping_jobs(status);
CREATE INDEX idx_jobs_created ON scraping_jobs(created_at DESC);
```

---

## Relationships

### Entity Relationship Diagram

```
sites (1) ──────────< (N) site_profiles
  │                        │
  │                        │ (used by)
  │                        ▼
  │                   scraping_jobs (N)
  │                        │
  │                        │ (creates)
  │                        ▼
  └──────────────────> textiles (N)
                           │
                           │ (normalized by)
                           ▼
                      dictionary_mappings (N)
                           │
                           │ (uses)
                           ▼
                      attribute_categories (1)
                           │
                           │ (contains)
                           ▼
                      textile_attributes (N)

textiles (1) ──────────< (N) unknown_terms
                              (when no mapping found)
```

### Key Relationships

**1. Sites → Profiles** (1:N)
- One site can have multiple profiles (versioning)
- Latest valid profile used for scraping

**2. Profiles → Scraping Jobs** (1:N)
- Each scraping job references specific profile version
- Enables auditing "which structure was used"

**3. Sites → Textiles** (1:N)
- `textiles.source_platform` links to conceptual site
- Direct FK avoided for flexibility

**4. Dictionary → Categories** (N:1)
- Each mapping belongs to one category
- Enables dynamic attribute system

**5. Textiles → Unknown Terms** (1:N)
- When normalization fails, unknown created
- Links back to example product for context

---

## Indexes & Performance

### Current Indexes

**textiles** :
```sql
idx_textiles_platform      → Fast filtering by source
idx_textiles_material      → Search by material (partial)
idx_textiles_color         → Search by color (partial)
idx_textiles_available     → Active products only (partial)
idx_textiles_locale        → Language-specific queries
```

**dictionary_mappings** :
```sql
idx_mappings_source        → Normalization lookup (source_term, source_locale)
idx_mappings_category      → Filter by category
idx_mappings_legacy_category → Backward compatibility
```

**site_profiles** :
```sql
idx_profiles_valid         → Find expired profiles
idx_profiles_site          → Lookup by site
idx_profiles_rediscovery   → Identify sites needing refresh (partial)
```

**scraping_jobs** :
```sql
idx_jobs_site              → Job history per site
idx_jobs_status            → Active jobs monitoring
idx_jobs_created           → Recent jobs (DESC order)
```

### Query Patterns

**1. Search Textiles** :
```sql
-- Optimized with indexes
SELECT * FROM textiles
WHERE available = true
  AND material_type = 'silk'
  AND color = 'blue'
  AND source_locale = 'fr';

-- Uses: idx_textiles_available + idx_textiles_material + idx_textiles_color + idx_textiles_locale
```

**2. Normalize Term** :
```sql
-- Fast dictionary lookup
SELECT translations, category_id
FROM dictionary_mappings
WHERE source_term = 'soie'
  AND source_locale = 'fr'
  AND category_id = (SELECT id FROM attribute_categories WHERE slug = 'fiber');

-- Uses: idx_mappings_source + idx_mappings_category
```

**3. Find Expired Profiles** :
```sql
-- Scheduled re-discovery
SELECT site_id FROM site_profiles
WHERE valid_until < NOW()
  OR needs_rediscovery = true;

-- Uses: idx_profiles_valid + idx_profiles_rediscovery
```

---

## Migration History

### Timeline

**Migration 001** : Initial schema
- Created `textiles` table
- Basic attributes (material, color, pattern)

**Migration 002** : Quality metrics
- Added `quality_score` column
- Added `extracted` JSONB

**Migration 003** : Multi-platform support
- Added `source_platform` enum
- Unique constraint on (source_platform, source_product_id)

**Migration 004** : Unknown terms workflow
- Created `unknown_terms` table
- Review/approval workflow

**Migration 005** : Internationalization (i18n)
- Added `source_locale` to textiles, mappings
- Added `translations` JSONB to mappings
- Migrated 25 FR mappings

**Migration 006** : Dynamic attribute system
- Created `attribute_categories` table
- Created `textile_attributes` table
- Added `category_id` to dictionary_mappings
- Added `weave` column to textiles
- Created 4 MVP categories (fiber, color, weave, pattern)

**Migration 007** : Admin scraping system (PENDING)
- Create `sites` table
- Create `site_profiles` table
- Create `discovery_jobs` table
- Create `scraping_jobs` table
- Indexes for performance

---

## Common Queries

### Product Queries

**1. Search Available Textiles** :
```sql
SELECT 
  id, title, material_type, color, price, image_url
FROM textiles
WHERE available = true
  AND material_type IN ('silk', 'cotton', 'linen')
  AND price BETWEEN 10 AND 50
ORDER BY quality_score DESC, created_at DESC
LIMIT 50;
```

**2. Get Product with Full Details** :
```sql
SELECT 
  t.*,
  m_mat.translations AS material_translations,
  m_col.translations AS color_translations
FROM textiles t
LEFT JOIN dictionary_mappings m_mat ON (
  m_mat.source_term = (t.extracted->>'materials'->>0)
  AND m_mat.source_locale = t.source_locale
  AND m_mat.category_id = (SELECT id FROM attribute_categories WHERE slug = 'fiber')
)
LEFT JOIN dictionary_mappings m_col ON (
  m_col.source_term = (t.extracted->>'colors'->>0)
  AND m_col.source_locale = t.source_locale
  AND m_col.category_id = (SELECT id FROM attribute_categories WHERE slug = 'color')
)
WHERE t.id = $1;
```

---

### Admin Queries

**1. Sites Dashboard** :
```sql
SELECT 
  s.id,
  s.url,
  s.name,
  s.status,
  s.quality_score,
  sp.discovered_at,
  sp.valid_until,
  sp.estimated_products,
  (SELECT COUNT(*) FROM textiles WHERE source_platform = s.url) AS products_count,
  (SELECT MAX(ended_at) FROM scraping_jobs WHERE site_id = s.id) AS last_scraped_at
FROM sites s
LEFT JOIN LATERAL (
  SELECT * FROM site_profiles
  WHERE site_id = s.id
  ORDER BY discovered_at DESC
  LIMIT 1
) sp ON true
WHERE s.status IN ('discovered', 'active')
ORDER BY s.priority DESC, s.quality_score DESC;
```

**2. Discovery Results** :
```sql
SELECT 
  sp.discovered_at,
  sp.valid_until,
  sp.collections,
  sp.quality_metrics,
  sp.recommendations,
  sp.total_collections,
  sp.relevant_collections,
  sp.estimated_products
FROM site_profiles sp
WHERE sp.site_id = $1
ORDER BY sp.discovered_at DESC
LIMIT 1;
```

**3. Scraping Job History** :
```sql
SELECT 
  sj.id,
  s.name AS site_name,
  sj.status,
  sj.started_at,
  sj.ended_at,
  sj.products_fetched,
  sj.products_saved,
  sj.quality_score,
  EXTRACT(EPOCH FROM (sj.ended_at - sj.started_at)) AS duration_seconds
FROM scraping_jobs sj
JOIN sites s ON s.id = sj.site_id
WHERE sj.status IN ('completed', 'partial')
ORDER BY sj.created_at DESC
LIMIT 50;
```

---

### Tuning Queries

**1. Unknown Terms for Review** :
```sql
SELECT 
  ut.term,
  ut.source_locale,
  ut.category,
  ut.occurrences,
  ut.source_platform,
  t.title AS example_title,
  t.image_url AS example_image
FROM unknown_terms ut
LEFT JOIN textiles t ON t.id = ut.example_product_id
WHERE ut.reviewed = false
ORDER BY ut.occurrences DESC, ut.last_seen_at DESC
LIMIT 100;
```

**2. Dictionary Usage Stats** :
```sql
SELECT 
  dm.source_term,
  dm.source_locale,
  dm.translations,
  ac.slug AS category,
  dm.usage_count,
  dm.last_used_at
FROM dictionary_mappings dm
JOIN attribute_categories ac ON ac.id = dm.category_id
WHERE dm.usage_count > 0
ORDER BY dm.usage_count DESC
LIMIT 50;
```

---

## Best Practices

### 1. Data Integrity

**Always use transactions for multi-table operations** :
```sql
BEGIN;
  INSERT INTO sites (...) VALUES (...);
  INSERT INTO site_profiles (...) VALUES (...);
COMMIT;
```

**Use foreign keys** :
- Prevents orphaned records
- Cascading deletes when appropriate

---

### 2. Performance

**Use JSONB operators efficiently** :
```sql
-- Good: Index-friendly
WHERE data_structure->>'hasImages' = 'true'

-- Avoid: Full table scan
WHERE data_structure::text LIKE '%hasImages%'
```

**Partial indexes for filtered queries** :
```sql
-- Only index relevant rows
CREATE INDEX idx_active_products ON textiles(material_type) WHERE available = true;
```

---

### 3. Caching

**Respect valid_until** :
```sql
-- Check cache before re-discovering
SELECT * FROM site_profiles
WHERE site_id = $1
  AND valid_until > NOW()
ORDER BY discovered_at DESC
LIMIT 1;
```

---

### 4. Audit Trails

**Always populate created_at, updated_at** :
```sql
-- Use triggers or application logic
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON textiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

### 5. JSONB Best Practices

**Structure JSONB for query patterns** :
```json
// Good: Flat, queryable
{
  "hasImages": true,
  "imageCount": 3,
  "qualityScore": 0.85
}

// Avoid: Deep nesting hard to query
{
  "images": {
    "available": true,
    "items": [
      {"url": "..."}
    ]
  }
}
```

---

## Future Considerations

### Planned Tables

**1. users** (Multi-user admin)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  role TEXT,  -- 'admin', 'viewer'
  created_at TIMESTAMP
);
```

**2. audit_log** (Change tracking)
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  table_name TEXT,
  record_id UUID,
  action TEXT,  -- 'insert', 'update', 'delete'
  changes JSONB,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP
);
```

**3. quality_snapshots** (Historical tracking)
```sql
CREATE TABLE quality_snapshots (
  id UUID PRIMARY KEY,
  site_id UUID REFERENCES sites(id),
  snapshot_date DATE,
  metrics JSONB,
  created_at TIMESTAMP
);
```

---

### Schema Evolution

**Deprecation Strategy** :
1. Add new columns/tables
2. Dual-write during transition
3. Migrate data
4. Switch reads to new schema
5. Drop old columns after validation period

**Example** : Migration 005 i18n
- Added: `source_term`, `source_locale`, `translations`
- Kept: `term`, `value` (legacy)
- Future: Drop legacy after validation

---

## Troubleshooting

### Common Issues

**1. Slow Queries**
```sql
-- Check query plan
EXPLAIN ANALYZE SELECT ...;

-- Look for Seq Scan → Add index
CREATE INDEX ...;
```

**2. Duplicate Keys**
```sql
-- Find duplicates
SELECT source_platform, source_product_id, COUNT(*)
FROM textiles
GROUP BY source_platform, source_product_id
HAVING COUNT(*) > 1;
```

**3. Orphaned Records**
```sql
-- Find textiles without valid source
SELECT * FROM textiles t
WHERE NOT EXISTS (
  SELECT 1 FROM sites s WHERE s.url = t.source_platform
);
```

---

## Summary

**Total Tables** : 11 (after Migration 007)

**Domains** :
- Product: 1 table (textiles)
- Normalization: 3 tables (categories, attributes, mappings)
- Tuning: 1 table (unknown_terms)
- Admin: 4 tables (sites, profiles, discovery_jobs, scraping_jobs)

**Indexes** : 15+ for performance

**Design Principles** :
- ✅ Separation of concerns
- ✅ Flexible JSONB for evolution
- ✅ Caching for efficiency
- ✅ Audit trails for debugging
- ✅ i18n from ground up

**Maintenance** :
- Weekly: Review unknown terms
- Monthly: Check quality trends
- Quarterly: Analyze unused indexes
- Yearly: Re-discovery batch

---

**Document Version** : 1.0  
**Last Review** : 29 Décembre 2024  
**Next Review** : After Migration 007 execution

---

_For questions or updates, see: docs/SPECS/ADMIN_SCRAPING_MANAGEMENT.md_
