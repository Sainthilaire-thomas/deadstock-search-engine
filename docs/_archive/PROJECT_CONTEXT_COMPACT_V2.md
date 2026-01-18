# Deadstock Search Engine - Context Complet

**Version** : 2.0 | **Date** : 9 Janvier 2026 | **Dernière Session** : 20

---

## 🎯 Le Projet en Bref

**Plateforme B2B SaaS** agrégant les inventaires de tissus deadstock de multiples fournisseurs dans une interface de recherche unifiée pour créateurs de mode indépendants.

| Métrique | Valeur |
|----------|--------|
| MVP Phase 1 | ~92% complet |
| Textiles en base | 268 |
| Sources actives | 4 (MLC, Nona Source, TFS, Recovo) |
| Performance recherche | 2.8ms |

---

## 🏗️ Stack Technique

```
Frontend: Next.js 16.1.1, React 19, TypeScript, Tailwind CSS
Backend:  Supabase PostgreSQL (schema: deadstock)
Pattern:  Light DDD avec feature modules
Auth:     Anonymous sessions (HTTP-only cookies) + future Supabase Auth
```

---

## 📁 Structure Projet (Essentiel)

```
src/
├── app/
│   ├── (main)/                    # Routes designer
│   │   ├── search/page.tsx        # Page recherche
│   │   ├── favorites/page.tsx     # Page favoris
│   │   └── boards/[boardId]/      # Page board canvas
│   └── admin/                     # Routes admin
│       ├── discovery/[siteSlug]/  # Détail site découvert
│       ├── sites/[id]/configure/  # Config scraping
│       └── tuning/page.tsx        # Interface unknowns
│
├── components/
│   └── search/
│       ├── TextileGrid.tsx        # Affichage grille textiles
│       ├── Filters.tsx            # Filtres dynamiques
│       └── SearchInterface.tsx    # Container recherche
│
├── features/
│   ├── admin/
│   │   ├── services/
│   │   │   ├── scrapingService.ts      # Orchestration scraping
│   │   │   └── discoveryService.ts     # Analyse sites Shopify
│   │   ├── infrastructure/
│   │   │   └── scrapingRepo.ts         # Persistence + normalisation
│   │   └── utils/
│   │       ├── variantAnalyzer.ts      # ⭐ NEW: Analyse variants Shopify
│   │       └── extractTerms.ts         # Extraction termes depuis tags
│   │
│   ├── search/
│   │   ├── domain/types.ts             # Type Textile, SearchFilters
│   │   └── infrastructure/
│   │       └── textileRepository.ts    # Queries sur textiles_search
│   │
│   ├── favorites/
│   │   ├── context/FavoritesContext.tsx # État global favoris
│   │   └── infrastructure/
│   │       └── favoritesRepository.ts
│   │
│   ├── boards/
│   │   ├── components/BoardCanvas.tsx  # Canvas drag-drop
│   │   └── actions/crystallizationActions.ts
│   │
│   └── normalization/
│       ├── application/normalizeTextile.ts    # Entry point
│       └── infrastructure/normalizationService.ts  # Dictionary lookup
│
└── lib/supabase/
    ├── client.ts    # Client browser (anon key)
    ├── server.ts    # Client server components
    └── admin.ts     # Client service role (scraping)
```

---

## 🗄️ Base de Données - Schema `deadstock`

### Tables Principales

#### `textiles` - Produits scrapés
```sql
-- Identité
id UUID PRIMARY KEY
name TEXT
description TEXT
image_url TEXT
source_url TEXT UNIQUE  -- Clé pour UPSERT
source_platform TEXT    -- "www.nona-source.com"
source_product_id TEXT

-- Dimensions
width_value NUMERIC     -- Largeur cm
weight_value NUMERIC    -- Grammage g/m²
quantity_value NUMERIC  -- Longueur disponible (mètres) ou stock
quantity_unit TEXT      -- 'm', 'unit'

-- Commercial
price_value NUMERIC     -- Prix total ou prix/m selon sale_type
price_currency TEXT     -- 'EUR'
price_per_meter NUMERIC -- ⭐ NEW: Prix calculé au mètre
sale_type TEXT          -- ⭐ NEW: 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece'
available BOOLEAN

-- Classification (legacy, migrer vers textile_attributes)
material_type TEXT      -- 'silk', 'cotton'
color TEXT              -- 'red', 'blue'
pattern TEXT            -- 'solid', 'striped'

-- Métadonnées
raw_data JSONB          -- Données Shopify brutes
data_quality_score INTEGER
site_id UUID REFERENCES sites(id)
```

#### `textile_attributes` - Attributs EAV
```sql
id UUID PRIMARY KEY
textile_id UUID REFERENCES textiles(id)
category_id UUID REFERENCES attribute_categories(id)
category_slug TEXT      -- 'fiber', 'color', 'pattern', 'weave'
value TEXT              -- Valeur normalisée EN ('silk', 'red')
source_term TEXT        -- Terme original ('soie', 'rouge')
source_locale TEXT      -- 'fr', 'en'
confidence NUMERIC

UNIQUE(textile_id, category_id)
```

#### `dictionary_mappings` - Normalisation
```sql
id UUID PRIMARY KEY
source_term TEXT        -- 'soie', 'seda', 'silk'
source_locale TEXT      -- 'fr', 'es', 'en'
category_id UUID        -- FK vers attribute_categories
translations JSONB      -- {"en": "silk", "fr": "soie"}
is_active BOOLEAN
```

#### `sites` - Sources configurées
```sql
id UUID PRIMARY KEY
name TEXT               -- 'Nona Source'
url TEXT UNIQUE         -- 'www.nona-source.com'
domain TEXT
source_locale TEXT      -- 'fr', 'en'
```

#### `site_profiles` - Résultats Discovery
```sql
id UUID PRIMARY KEY
site_id UUID REFERENCES sites(id)
collections JSONB       -- Liste collections Shopify
extraction_patterns JSONB  -- Patterns détectés (longueur, largeur, poids)
global_analysis JSONB   -- Stats tags, product_types
quality_metrics JSONB   -- Deadstock Score
```

### Vue Matérialisée `textiles_search`
```sql
-- Vue optimisée pour recherche (refresh après scraping)
-- Contient: textiles + attributs pivotés (fiber, color, pattern, weave)
-- Performance: ~3ms même avec 10K+ textiles

REFRESH MATERIALIZED VIEW CONCURRENTLY deadstock.textiles_search;
```

---

## 🔄 Pipeline de Données

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  DISCOVERY  │────▶│  CONFIGURE  │────▶│  SCRAPING   │────▶│   SEARCH    │
│             │     │             │     │             │     │             │
│ Analyse     │     │ Admin       │     │ Fetch +     │     │ Materialized│
│ structure   │     │ sélectionne │     │ Normalize + │     │ view +      │
│ Shopify     │     │ collections │     │ Save        │     │ Filters     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Scraping Pipeline Détaillé

```typescript
// scrapingRepo.ts - saveProducts()

// STEP 1: Extract terms from Shopify tags
const extractedTerms = extractTermsFromShopify(product, sourceLocale);

// STEP 2: Normalize using dictionary
const normalized = await normalizeTextile({ extractedTerms, ... });

// STEP 3: Calculate quality score
const qualityScore = calculateQualityScore(product, normalized);

// STEP 4: Analyze variants (NEW - ADR-025)
const variantAnalysis = analyzeVariants(product);
// Returns: { available, saleType, pricePerMeter, maxLength, bestVariant }

// STEP 5: Map to database
const textileData = {
  available: variantAnalysis.available,      // ← From ALL variants
  sale_type: variantAnalysis.saleType,       // ← Detected
  price_per_meter: variantAnalysis.pricePerMeter,
  quantity_value: variantAnalysis.maxLength, // ← From option2
  // ...
};

// STEP 6: UPSERT to textiles
await supabase.from('textiles').upsert(textileData, { onConflict: 'source_url' });

// STEP 7: Dual-write to textile_attributes
await saveTextileAttributes(textileId, normalized, extractedTerms);
```

---

## 📊 Modèles de Vente (Sale Types)

| Type | Description | quantity_value | price_per_meter |
|------|-------------|----------------|-----------------|
| `fixed_length` | Coupons fixes (MLC, Nona) | Longueur en mètres | price / quantity |
| `hybrid` | Coupons + coupe (Nona) | Longueur max | cutting variant price |
| `cut_to_order` | Vente au mètre (TFS) | Stock ou NULL | price_value |
| `by_piece` | Vente à la pièce | Nombre pièces | NULL |

### Variant Analysis (Nona Source)
```
option1 = Color ("Black", "Porcelain Rose")
option2 = Length in meters ("1", "5", "10")
option3 = Lot reference ("T24A.001") OR "Cutting"

Si "Cutting" présent → sale_type = 'hybrid'
```

---

## 🎨 Types TypeScript Clés

### Textile (Search)
```typescript
// src/features/search/domain/types.ts
interface Textile {
  id: string;
  name: string;
  image_url: string | null;
  source_url: string;
  source_platform: string;
  
  price_value: number | null;
  price_currency: string;
  price_per_meter: number | null;  // NEW
  sale_type: 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece' | null;  // NEW
  
  quantity_value: number | null;
  quantity_unit: string | null;
  width_value: number | null;
  
  available: boolean;
  
  // Attributs normalisés (depuis vue)
  fiber: string | null;
  color: string | null;
  pattern: string | null;
  weave: string | null;
  
  // Alias legacy
  material_type?: string | null;
}
```

### ShopifyProduct (Scraping)
```typescript
// src/features/admin/services/scrapingService.ts
interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  handle: string;
  tags: string;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
}

interface ShopifyVariant {
  id: number;
  title: string;
  price: string;
  available: boolean;
  option1?: string | null;  // Color
  option2?: string | null;  // Length
  option3?: string | null;  // Lot or "Cutting"
  grams?: number;
}
```

### VariantAnalysis
```typescript
// src/features/admin/utils/variantAnalyzer.ts
interface VariantAnalysis {
  available: boolean;
  saleType: 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece';
  pricePerMeter: number | null;
  maxLength: number | null;
  minPrice: number | null;
  bestVariant: ShopifyVariant | null;
  hasCuttingOption: boolean;
  totalVariantCount: number;
  availableVariantCount: number;
}
```

---

## ✅ État des Modules

| Module | Status | Notes |
|--------|--------|-------|
| Search | ✅ 100% | Filtres dynamiques, materialized view |
| Favorites | ✅ 100% | Sync instantanée, optimistic updates |
| Boards | ✅ 95% | Canvas + cristallisation |
| Admin Discovery | ✅ 95% | Deadstock Score, patterns |
| Admin Scraping | ✅ 95% | Variant analysis (ADR-025) |
| Admin Tuning | ✅ 90% | Multi-locale FR/EN |

---

## 🐛 Bug Récent Corrigé (Session 20)

### Nona Source 79% Unavailable
- **Cause**: Scraper prenait `variants[0]` seulement
- **Fix**: `variantAnalyzer.ts` analyse TOUS les variants
- **Résultat**: 100% available, sale_type détecté, price_per_meter calculé

---

## 📝 Fichiers Clés à Modifier Fréquemment

| Tâche | Fichier |
|-------|---------|
| Ajouter type Textile | `src/features/search/domain/types.ts` |
| Modifier affichage cards | `src/components/search/TextileGrid.tsx` |
| Modifier scraping | `src/features/admin/infrastructure/scrapingRepo.ts` |
| Modifier normalisation | `src/features/normalization/application/normalizeTextile.ts` |
| Ajouter migration | `database/migrations/XXX_description.sql` |

---

## 🔧 Commandes Utiles

```powershell
# Dev server
npm run dev

# TypeScript check
npx tsc --noEmit

# Voir fichier
Get-Content -Path "src/path/to/file.ts"

# Chercher fichier
Get-ChildItem -Path "src" -Recurse -Filter "*pattern*" -Name

# Générer file tree
npm run docs:tree
```

---

## 🚀 Roadmap

### Immédiat (Session 21)
- [ ] **Fix affichage prix** - Ajouter `price_per_meter` au type Textile + TextileGrid.tsx
- [ ] **Détecter sale_type au Discovery** (pas seulement Scraping)
- [ ] **Affichage produits hybrid** (2 options de prix)

### Court Terme (Sessions 22-25)
- [ ] **Scraping scale** - Plus de produits Nona Source, MLC
- [ ] **Interface Discovery avancée** - Toggle patterns, coverage dashboard
- [ ] **Admin Quality Dashboard** - Métriques qualité par source
- [ ] **Filtres dynamiques complets** - sale_type, price range

### MVP Phase 2 (Moyen Terme)
| Feature | Status | Notes |
|---------|--------|-------|
| Calculateur métrage intégré | 🔲 À faire | YardageSearchFilter existe, UI à intégrer |
| Boards collaboratifs | 🔲 À faire | Canvas solo fonctionne, partage à ajouter |
| Authentification utilisateurs | 🔲 À faire | Sessions anonymes actuellement, Supabase Auth prévu |
| Import patron PDF | 🔲 À faire | Killer feature planifiée |
| Marketplace inversée | 🔲 À faire | Designers postent besoins |

### Vision Long Terme (Phase 3+)
- Certificats durabilité (impact CO2/eau)
- API publique
- Intégrations tierces (Shopify apps)
- Communauté designers

---

## 📚 ADRs Actifs (Résumés)

### ADR-024: Textile Standard System
- Architecture EAV (`textile_attributes`) + Vue matérialisée (`textiles_search`)
- Dual-write: colonnes legacy + nouvelle table attributs
- Refresh vue après scraping

### ADR-025: Admin Architecture Clarification
- Bug variants Nona Source identifié et corrigé
- `variantAnalyzer.ts` créé
- `sale_type` et `price_per_meter` ajoutés

---

## 💡 Patterns de Code

### Query textiles avec filtres
```typescript
const { data } = await supabase
  .from('textiles_search')
  .select('*')
  .eq('fiber', 'silk')
  .eq('available', true)
  .order('created_at', { ascending: false })
  .limit(20);
```

### Upsert textile
```typescript
await supabase
  .from('textiles')
  .upsert(textileData, { onConflict: 'source_url' });
```

### Refresh materialized view
```typescript
await supabase.rpc('refresh_textiles_search');
```

---

*Ce document contient tout le contexte nécessaire pour travailler sur le projet. Ne pas charger les ADRs/SPECS volumineuses sauf besoin spécifique.*
