# Deadstock Search Engine - Context Complet

**Version** : 3.0 | **Date** : 9 Janvier 2026 | **Dernière Session** : 21

---

## 🎯 Le Projet en Bref

**Plateforme B2B SaaS** agrégant les inventaires de tissus deadstock de multiples fournisseurs dans une interface de recherche unifiée pour créateurs de mode indépendants.

| Métrique             | Valeur                            |
| --------------------- | --------------------------------- |
| MVP Phase 1           | ~95% complet                      |
| Textiles en base      | 268                               |
| Sources actives       | 4 (MLC, Nona Source, TFS, Recovo) |
| Performance recherche | 2.8ms                             |

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
│   │   ├── textiles/[id]/page.tsx # ⭐ NEW Session 21: Page détail textile
│   │   └── boards/[boardId]/      # Page board canvas
│   └── admin/                     # Routes admin
│       ├── discovery/[siteSlug]/  # Détail site découvert
│       ├── sites/[id]/configure/  # Config scraping
│       └── tuning/page.tsx        # Interface unknowns
│
├── components/
│   └── search/
│       ├── TextileGrid.tsx        # Affichage grille textiles
│       ├── PriceDisplay.tsx       # ⭐ NEW Session 21: Affichage prix selon sale_type
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
│   │   ├── components/
│   │   │   └── SaleTypeCard.tsx        # ⭐ NEW Session 21: Affichage sale_type détecté
│   │   └── utils/
│   │       ├── variantAnalyzer.ts      # Analyse variants Shopify
│   │       ├── saleTypeDetector.ts     # ⭐ NEW Session 21: Détection sale_type au Discovery
│   │       └── extractTerms.ts         # Extraction termes depuis tags
│   │
│   ├── search/
│   │   ├── domain/types.ts             # Type Textile, SearchFilters
│   │   └── infrastructure/
│   │       └── textileRepository.ts    # Queries sur textiles_search
│   │
│   ├── favorites/
│   │   ├── components/FavoriteButton.tsx  # Bouton favori
│   │   ├── context/FavoritesContext.tsx   # État global favoris
│   │   └── infrastructure/
│   │       └── favoritesRepository.ts
│   │
│   ├── boards/
│   │   ├── components/
│   │   │   ├── BoardCanvas.tsx         # Canvas drag-drop
│   │   │   └── AddToBoardButton.tsx    # Bouton ajout board
│   │   └── actions/crystallizationActions.ts
│   │
│   └── normalization/
│       ├── application/normalizeTextile.ts    # Entry point
│       └── infrastructure/normalizationService.ts  # Dictionary lookup
│
└── lib/supabase/
    ├── client.ts    # Client browser (anon key)
    ├── server.ts    # Client server components (⚠️ nécessite .schema('deadstock'))
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
additional_images JSONB    -- Array d'URLs images supplémentaires
source_url TEXT UNIQUE     -- Clé pour UPSERT
source_platform TEXT       -- "www.nona-source.com"
source_product_id TEXT

-- Dimensions
width_value NUMERIC     -- Largeur cm
weight_value NUMERIC    -- Grammage g/m²
quantity_value NUMERIC  -- Longueur disponible (mètres) ou stock
quantity_unit TEXT      -- 'm', 'unit'

-- Commercial
price_value NUMERIC     -- Prix total ou prix/m selon sale_type
price_currency TEXT     -- 'EUR'
price_per_meter NUMERIC -- Prix calculé au mètre
sale_type TEXT          -- 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece'
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
collections JSONB            -- Liste collections Shopify
extraction_patterns JSONB    -- Patterns détectés (longueur, largeur, poids)
global_analysis JSONB        -- Stats tags, product_types
quality_metrics JSONB        -- Deadstock Score
sale_type_detection JSONB    -- ⭐ NEW Session 21: {dominantType, confidence, evidence}
```

### Vue Matérialisée `textiles_search`

```sql
-- Vue optimisée pour recherche (refresh après scraping)
-- Contient: textiles + attributs pivotés (fiber, color, pattern, weave)
-- Performance: ~3ms même avec 10K+ textiles

REFRESH MATERIALIZED VIEW CONCURRENTLY deadstock.textiles_search;
```

**Colonnes disponibles** :

- `id`, `name`, `description`, `image_url`, `additional_images`
- `price` (numeric) ⚠️ Note: pas `price_value`
- `price_per_meter`, `sale_type`
- `quantity_value`, `quantity_unit`
- `fiber`, `color`, `pattern`, `weave` (attributs pivotés)
- `width_value`, `weight_value`
- `available` (boolean)
- `site_id`, `site_name`, `site_url`
- `source_url`, `source_platform`

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

| Type             | Description               | quantity_value      | price_per_meter       |
| ---------------- | ------------------------- | ------------------- | --------------------- |
| `fixed_length` | Coupons fixes (MLC, Nona) | Longueur en mètres | price / quantity      |
| `hybrid`       | Coupons + coupe (Nona)    | Longueur max        | cutting variant price |
| `cut_to_order` | Vente au mètre (TFS)     | Stock ou NULL       | price_value           |
| `by_piece`     | Vente à la pièce        | Nombre pièces      | NULL                  |

### Variant Analysis (Nona Source)

```
option1 = Color ("Black", "Porcelain Rose")
option2 = Length in meters ("1", "5", "10")
option3 = Lot reference ("T24A.001") OR "Cutting"

Si "Cutting" présent → sale_type = 'hybrid'
```

### Affichage Prix (Session 21)

| Type             | Affichage                                                                           |
| ---------------- | ----------------------------------------------------------------------------------- |
| `hybrid`       | 2 options : "📦 Coupon Xm → Y€ (Z€/m)" + "✂️ À la coupe → W€/m" + économie |
| `fixed_length` | "Prix Y€" + "Coupon Xm (Z€/m)"                                                    |
| `cut_to_order` | "✂️ Prix Z€/m • Vente au mètre"                                                |
| `by_piece`     | "Prix Y€"                                                                          |

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
  price_per_meter: number | null;
  sale_type: 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece' | null;
  
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

### SaleTypeDetection (Discovery) - NEW Session 21

```typescript
// src/features/admin/utils/saleTypeDetector.ts
interface SaleTypeDetection {
  dominantType: 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece' | 'unknown';
  confidence: number;  // 0-100
  evidence: {
    hasMultipleVariants: boolean;
    hasLengthInOptions: boolean;
    hasCuttingOption: boolean;
    priceVariation: number;
    sampleSize: number;
  };
  detectedAt: string;  // ISO date
}
```

### AddToBoardButton Props

```typescript
// Props attendues par AddToBoardButton (attention au camelCase)
textile: {
  id: string;
  name: string;
  imageUrl: string | null;      // ⚠️ camelCase, pas image_url
  price: number | null;
  source: string;
  availableQuantity: number | null;
  material: string | null;
  color: string | null;
}
```

---

## ✅ État des Modules

| Module          | Status  | Notes                                      |
| --------------- | ------- | ------------------------------------------ |
| Search          | ✅ 100% | Filtres dynamiques, PriceDisplay           |
| Textile Detail  | ✅ 100% | ⭐ NEW Session 21: Page /textiles/[id]     |
| Favorites       | ✅ 100% | Sync instantanée, optimistic updates      |
| Boards          | ✅ 95%  | Canvas + cristallisation                   |
| Admin Discovery | ✅ 98%  | ⭐ NEW Session 21: SaleTypeCard, detection |
| Admin Scraping  | ✅ 95%  | Variant analysis (ADR-025)                 |
| Admin Tuning    | ✅ 90%  | Multi-locale FR/EN                         |

---

## 🐛 Bugs Corrigés

### Session 20: Nona Source 79% Unavailable

- **Cause**: Scraper prenait `variants[0]` seulement
- **Fix**: `variantAnalyzer.ts` analyse TOUS les variants
- **Résultat**: 100% available, sale_type détecté, price_per_meter calculé

### Session 21: Page Textile 404

- **Cause**: Client Supabase server ne spécifiait pas le schema `deadstock`
- **Fix**: Ajout `.schema('deadstock')` dans la requête
- **Note**: Fix local, idéalement configurer dans `server.ts`

---

## ⚠️ Points d'Attention Techniques

### 1. Supabase Schema

Le client server (`src/lib/supabase/server.ts`) ne spécifie pas le schema par défaut.

```typescript
// Workaround actuel dans les queries
const { data } = await supabase
  .schema('deadstock')  // ← Obligatoire !
  .from('textiles_search')
  .select('*')
```

### 2. Mapping price vs price_value

- Vue `textiles_search` : colonne `price`
- Type TypeScript : `price_value`
- Workaround : `(textile as any).price ?? textile.price_value`

---

## 📝 Fichiers Clés à Modifier Fréquemment

| Tâche                   | Fichier                                                        |
| ------------------------ | -------------------------------------------------------------- |
| Ajouter type Textile     | `src/features/search/domain/types.ts`                        |
| Modifier affichage cards | `src/components/search/TextileGrid.tsx`                      |
| Modifier affichage prix  | `src/components/search/PriceDisplay.tsx`                     |
| Modifier scraping        | `src/features/admin/infrastructure/scrapingRepo.ts`          |
| Modifier normalisation   | `src/features/normalization/application/normalizeTextile.ts` |
| Ajouter migration        | `database/migrations/XXX_description.sql`                    |

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

# Supprimer cache Next.js (si problèmes routing)
Remove-Item -Recurse -Force .next
```


# Section à ajouter au PROJECT_CONTEXT_COMPACT_V3.md

(Insérer après "## ✅ État des Modules" ou avant "## 🚀 Roadmap")

---

## 🛠️ Admin Module - État Détaillé (Session 21)

### Pages Existantes

| Page             | Route                           | Status | Fonctionnalités                            |
| ---------------- | ------------------------------- | ------ | ------------------------------------------- |
| Dashboard        | `/admin`                      | ✅     | Vue d'ensemble                              |
| Discovery        | `/admin/discovery`            | ✅     | Liste sites                                 |
| Discovery Detail | `/admin/discovery/[slug]`     | ✅     | Tabs: Extraction, Collections, Quality, Raw |
| Sites Config     | `/admin/sites/[id]/configure` | ✅     | Sélection collections, lancement scraping  |
| Jobs             | `/admin/jobs`                 | ✅     | Liste jobs scraping                         |
| Tuning           | `/admin/tuning`               | ✅ 70% | Liste unknowns, approve/reject              |
| Quality          | `/admin/tuning/quality`       | ✅ 80% | Score global, progress bars par dimension   |
| Dictionary       | `/admin/dictionary`           | ✅ 60% | Stats, mappings récents (read-only)        |

### Gaps Identifiés

| Gap                                            | Page                        | Priorité | Effort |
| ---------------------------------------------- | --------------------------- | --------- | ------ |
| Coverage par source                            | `/admin/tuning/quality`   | P1        | 2h     |
| Filtres unknowns (source, catégorie, min occ) | `/admin/tuning`           | P1        | 2h     |
| Edit/Delete dictionary mappings                | `/admin/dictionary`       | P1        | 3h     |
| Toggle patterns Discovery                      | `/admin/discovery/[slug]` | P2        | 3h     |
| Batch actions unknowns                         | `/admin/tuning`           | P2        | 2h     |
| Search dictionary                              | `/admin/dictionary`       | P2        | 1h     |
| Page attributs `/admin/attributes`           | -                           | P2        | 6h     |
| LLM suggestions unknowns                       | `/admin/tuning`           | P3        | 3h     |

### Métriques Actuelles

| Métrique           | Valeur                | Cible |
| ------------------- | --------------------- | ----- |
| Dictionary mappings | 256 (FR: 75, EN: 181) | 400+  |
| Unknowns pending    | 0 ✅                  | <5    |
| Coverage matière   | 73%                   | 95%   |
| Coverage couleur    | 69%                   | 85%   |
| Coverage largeur    | 13% ⚠️              | 50%   |

---

## 📅 Sprints Admin (à partir Session 22)

### Sprint 1 (P1) - 7h

```
1. Coverage par source dans Quality Dashboard (2h)
   → Breakdown TFS vs MLC vs Nona
   
2. Filtres unknowns (2h)
   → Source, catégorie, min occurrences
   
3. Edit dictionary mappings (3h)
   → Modifier/supprimer mappings existants
```

### Sprint 2 (P2) - 11h

```
4. Toggle patterns Discovery UI (3h)
5. Batch actions unknowns (2h)
6. Search dictionary (1h)
7. Page attributs vue liste (3h)
8. Ajouter valeur + synonymes (2h)
```

### Sprint 3 (P2) - 8h

```
9. Progression scraping temps réel (4h)
10. Page détail catégorie /admin/attributes/[slug] (3h)
11. Migration hiérarchie attributs (1h)
```

### Backlog (P3-P4)

* LLM suggestions unknowns
* Re-scraping intelligent
* Alertes qualité automatiques
* Planification scraping récurrent
* Filtres recherche hiérarchiques
* Merge valeurs similaires

---

---

## 🚀 Roadmap

### ✅ Accompli Session 21

- [X] **ADR-026 Part 1** - Détection sale_type au Discovery
- [X] **ADR-026 Part 2** - SaleTypeCard dans Admin UI
- [X] **ADR-026 Part 3** - PriceDisplay avec dual pricing
- [X] **Bonus** - Page détail textile `/textiles/[id]`

### Immédiat (Session 22)

- [ ] **Fix "1unit"** → "Vente au mètre" pour cut_to_order
- [ ] **Investiguer caractéristiques vides** (fiber/color dans page détail)
- [ ] **Fix Supabase schema** dans server.ts

### Court Terme (Sessions 22-25)

- [ ] **Scraping scale** - Plus de produits Nona Source, MLC
- [ ] **Filtre sale_type** dans la recherche
- [ ] **Interface Discovery avancée** - Toggle patterns, coverage dashboard
- [ ] **Admin Quality Dashboard** - Métriques qualité par source

### MVP Phase 2 (Moyen Terme)

| Feature                        | Status      | Notes                                                |
| ------------------------------ | ----------- | ---------------------------------------------------- |
| Calculateur métrage intégré | 🔲 À faire | YardageSearchFilter existe, UI à intégrer          |
| Boards collaboratifs           | 🔲 À faire | Canvas solo fonctionne, partage à ajouter           |
| Authentification utilisateurs  | 🔲 À faire | Sessions anonymes actuellement, Supabase Auth prévu |
| Import patron PDF              | 🔲 À faire | Killer feature planifiée                            |
| Marketplace inversée          | 🔲 À faire | Designers postent besoins                            |

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

### ADR-026: Sale Type Discovery & Hybrid Display (Session 21)

- Détection sale_type au Discovery avec confiance
- `SaleTypeCard` component pour Admin UI
- `PriceDisplay` component pour dual pricing
- Page détail textile `/textiles/[id]`

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

### Query avec schema explicite (Server Components)

```typescript
const { data } = await supabase
  .schema('deadstock')
  .from('textiles_search')
  .select('*')
  .eq('id', id)
  .single();
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

### PriceDisplay component

```tsx
<PriceDisplay
  saleType={textile.sale_type}
  price={(textile as any).price ?? textile.price_value}
  pricePerMeter={textile.price_per_meter}
  quantity={textile.quantity_value}
  currency={textile.price_currency || '€'}
/>
```

### AddToBoardButton props mapping

```tsx
<AddToBoardButton
  textile={{
    id: textile.id,
    name: textile.name,
    imageUrl: textile.image_url,      // snake_case → camelCase
    price: textile.price,
    source: textile.source_url,
    availableQuantity: textile.quantity_value,
    material: textile.fiber,
    color: textile.color,
  }}
/>
```

---

*Ce document contient tout le contexte nécessaire pour travailler sur le projet. Ne pas charger les ADRs/SPECS volumineuses sauf besoin spécifique.*
