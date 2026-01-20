# SPEC : Recherche Contextuelle avec Contraintes

**Version** : 1.0
**Date** : 12 Janvier 2026
**Status** : Draft
**Contexte** : Sprint 7+ - Boards Module Enhancement

---

## 1. Vue d'Ensemble

### 1.1 Objectif

Permettre aux designers de **rechercher des tissus directement depuis leur board**, en utilisant les éléments existants (palettes, calculs) comme contraintes de recherche.

### 1.2 Cas d'Usage Principal

```
Designer sur son board "Robe Été"
│
├── 🎨 Palette "Provence" avec 4 couleurs
├── 📐 Calcul métrage : 3.5m nécessaires
│
└── Clic sur couleur bordeaux de la palette
    │
    └── "Trouve-moi des tissus bordeaux 
         avec assez de stock pour mon projet"
```

### 1.3 Principes Clés

| Principe | Description |
|----------|-------------|
| **Contextuel** | Recherche enrichie par le contexte du board |
| **Progressif** | Stock réel → Potentiel Discovery → Scraping guidé |
| **Visuel** | Indicateurs clairs de match et suffisance |
| **Non-bloquant** | Résultats immédiats, enrichissement asynchrone |

---

## 2. Architecture Fonctionnelle

### 2.1 Sources de Contraintes

```
BOARD ELEMENTS                         CONTRAINTES GÉNÉRÉES
───────────────                        ────────────────────

🎨 Palette                      ───►   Couleurs cibles (via LAB distance)
   #8B0000 (bordeaux)                  → ['burgundy', 'red', 'brown']

📐 Calcul Métrage               ───►   Quantité minimum
   Robe midi T38 = 2.8m                → quantity_value >= 2.8
   + marge 20% = 3.4m                     OR sale_type = 'cut_to_order'

🧵 Tissu existant               ───►   Matière similaire
   "Crêpe de soie"                     → fiber = 'silk'
                                       → weave = 'crepe'

📝 Note avec tags               ───►   Tags recherche
   "#léger #été"                       → weight < 150gsm
```

### 2.2 Pipeline de Recherche

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PIPELINE DE RECHERCHE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ÉTAPE 1 : Extraction Contraintes                                       │
│  ─────────────────────────────────                                      │
│  Source Element → Constraint Parser → SearchConstraints                  │
│                                                                          │
│  ÉTAPE 2 : Recherche Stock Réel (instantané)                            │
│  ───────────────────────────────────────────                            │
│  SearchConstraints → textiles_search → Résultats immédiats              │
│                                                                          │
│  ÉTAPE 3 : Estimation Potentiel (async)                                 │
│  ─────────────────────────────────────                                  │
│  SearchConstraints → Discovery Data → Potentiel par source              │
│                                                                          │
│  ÉTAPE 4 : Scraping Guidé (on-demand)                                   │
│  ────────────────────────────────────                                   │
│  User Request → Guided Scraping Job → Nouveaux résultats                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Color Picker avec Distance Colorimétrique

### 3.1 Problème à Résoudre

```
Palette HEX              Base de données
────────────             ────────────────
#8B0000                  16 couleurs normalisées :
#F5DEB3                  red, blue, green, yellow, orange,
#2F4F4F                  pink, purple, brown, beige, grey,
#DEB887                  black, white, burgundy, navy, teal, gold
    │
    └── Comment mapper #8B0000 → 'burgundy' ?
```

### 3.2 Solution : Distance LAB

L'espace colorimétrique LAB est perceptuellement uniforme (contrairement à RGB/HSL).

```typescript
// Conversion HEX → LAB
function hexToLab(hex: string): [number, number, number] {
  // HEX → RGB → XYZ → LAB
  const rgb = hexToRgb(hex);
  const xyz = rgbToXyz(rgb);
  return xyzToLab(xyz);
}

// Distance euclidienne dans LAB
function labDistance(lab1: LAB, lab2: LAB): number {
  return Math.sqrt(
    Math.pow(lab1[0] - lab2[0], 2) +  // L (luminosité)
    Math.pow(lab1[1] - lab2[1], 2) +  // a (vert-rouge)
    Math.pow(lab1[2] - lab2[2], 2)    // b (bleu-jaune)
  );
}
```

### 3.3 Table de Référence des 16 Couleurs

```typescript
const DATABASE_COLORS: Record<string, { hex: string; lab: LAB }> = {
  red:      { hex: '#FF0000', lab: [53.23, 80.11, 67.22] },
  blue:     { hex: '#0000FF', lab: [32.30, 79.20, -107.86] },
  green:    { hex: '#008000', lab: [46.23, -51.70, 49.90] },
  yellow:   { hex: '#FFFF00', lab: [97.14, -21.56, 94.48] },
  orange:   { hex: '#FFA500', lab: [74.94, 23.93, 78.95] },
  pink:     { hex: '#FFC0CB', lab: [83.59, 24.14, 3.33] },
  purple:   { hex: '#800080', lab: [29.78, 58.94, -36.50] },
  brown:    { hex: '#8B4513', lab: [37.65, 27.03, 40.95] },
  beige:    { hex: '#F5F5DC', lab: [95.95, -1.85, 11.42] },
  grey:     { hex: '#808080', lab: [53.59, 0, 0] },
  black:    { hex: '#000000', lab: [0, 0, 0] },
  white:    { hex: '#FFFFFF', lab: [100, 0, 0] },
  burgundy: { hex: '#800020', lab: [25.85, 42.79, 21.56] },
  navy:     { hex: '#000080', lab: [12.97, 47.51, -64.70] },
  teal:     { hex: '#008080', lab: [48.25, -28.84, -8.48] },
  gold:     { hex: '#FFD700', lab: [86.93, -1.92, 87.14] },
};
```

### 3.4 Algorithme de Matching

```typescript
interface ColorMatch {
  color: string;        // 'burgundy'
  distance: number;     // 12.5 (0 = exact)
  confidence: number;   // 92% (basé sur distance)
}

function findMatchingColors(
  inputHex: string, 
  maxDistance: number = 50,
  maxResults: number = 3
): ColorMatch[] {
  
  const inputLab = hexToLab(inputHex);
  
  const matches = Object.entries(DATABASE_COLORS)
    .map(([name, { lab }]) => ({
      color: name,
      distance: labDistance(inputLab, lab),
      confidence: Math.max(0, 100 - (labDistance(inputLab, lab) * 2)),
    }))
    .filter(m => m.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults);
  
  return matches;
}

// Exemple
findMatchingColors('#8B0000');
// → [
//   { color: 'burgundy', distance: 8.2, confidence: 84% },
//   { color: 'red', distance: 32.1, confidence: 36% },
//   { color: 'brown', distance: 41.5, confidence: 17% }
// ]
```

### 3.5 Seuils de Confiance

| Distance LAB | Confiance | Interprétation |
|--------------|-----------|----------------|
| 0-10 | 90-100% | Match excellent |
| 10-25 | 50-90% | Match bon |
| 25-50 | 0-50% | Match acceptable |
| >50 | 0% | Pas de match |

### 3.6 UI Color Picker

```
┌─────────────────────────────────────────────────────────────┐
│  🎨 Rechercher des tissus par couleur                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Couleur sélectionnée : ■ #8B0000                          │
│                                                             │
│  Couleurs correspondantes dans notre catalogue :            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ■ Bordeaux    ████████████████████░░░░  84%        │   │
│  │ ■ Rouge       ███████░░░░░░░░░░░░░░░░░  36%        │   │
│  │ ■ Marron      ████░░░░░░░░░░░░░░░░░░░░  17%        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [✓] Bordeaux (84%)   [ ] Rouge   [ ] Marron               │
│                                                             │
│  [Rechercher]                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Filtre Métrage / Suffisance Stock

### 4.1 Logique de Suffisance

```typescript
type SaleType = 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece';

function isStockSufficient(
  textile: Textile, 
  neededMeters: number
): { sufficient: boolean; reason: string } {
  
  switch (textile.sale_type) {
    case 'cut_to_order':
      // Toujours suffisant (coupe à la demande illimitée)
      return { 
        sufficient: true, 
        reason: 'Coupe à la demande' 
      };
    
    case 'fixed_length':
    case 'hybrid':
      // Comparer avec stock disponible
      if (textile.quantity_value >= neededMeters) {
        return { 
          sufficient: true, 
          reason: `${textile.quantity_value}m disponibles` 
        };
      }
      return { 
        sufficient: false, 
        reason: `${textile.quantity_value}m < ${neededMeters}m requis` 
      };
    
    case 'by_piece':
      // Non applicable au métrage
      return { 
        sufficient: false, 
        reason: 'Vente à la pièce (métrage non applicable)' 
      };
    
    default:
      // Fallback : comparer si quantity_value existe
      if (textile.quantity_value && textile.quantity_value >= neededMeters) {
        return { sufficient: true, reason: `${textile.quantity_value}m disponibles` };
      }
      return { sufficient: false, reason: 'Stock inconnu' };
  }
}
```

### 4.2 Requête SQL avec Filtre Métrage

```sql
-- Tissus avec stock suffisant pour 3.5m
SELECT 
  t.*,
  CASE 
    WHEN t.sale_type = 'cut_to_order' THEN true
    WHEN t.quantity_value >= 3.5 THEN true
    ELSE false
  END as is_sufficient,
  CASE 
    WHEN t.sale_type = 'cut_to_order' THEN 'Coupe à la demande'
    WHEN t.quantity_value >= 3.5 THEN t.quantity_value || 'm disponibles'
    ELSE t.quantity_value || 'm < 3.5m requis'
  END as stock_status
FROM deadstock.textiles_search t
WHERE t.available = true
  AND t.color IN ('burgundy', 'red')
  AND (
    t.sale_type = 'cut_to_order'
    OR t.quantity_value >= 3.5
  )
ORDER BY 
  is_sufficient DESC,
  t.quantity_value DESC;
```

### 4.3 UI Indicateurs Stock

```
┌─────────────────────────────────────────┐
│  Crêpe de Soie Bordeaux                 │
│  Nona Source                            │
│                                         │
│  🎨 Match: Bordeaux (84%)               │
│                                         │
│  📦 6m disponibles                      │
│  ✅ Suffisant pour projet (3.5m)        │
│                                         │
│  💰 À partir de 13€/m                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Lin Rouge Coquelicot                   │
│  My Little Coupon                       │
│                                         │
│  🎨 Match: Rouge (36%)                  │
│                                         │
│  📦 Coupon 2m                           │
│  ⚠️ Insuffisant (besoin 3.5m)           │
│                                         │
│  💰 29€ (14.50€/m)                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Velours Bordeaux                       │
│  The Fabric Sales                       │
│                                         │
│  🎨 Match: Bordeaux (84%)               │
│                                         │
│  ✂️ Vente au mètre                      │
│  ✅ Coupe à la demande                  │
│                                         │
│  💰 18€/m                               │
└─────────────────────────────────────────┘
```

---

## 5. Recherche Contextuelle depuis Board

### 5.1 Interface Option B (Recommandée)

Boutons de recherche **par élément** avec badges de résultats.

```
┌─ Board "Robe Été Provence" ─────────────────────────────────┐
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🎨 PALETTE "Provence"                               │    │
│  │                                                     │    │
│  │  ■ #8B0000  ■ #F5DEB3  ■ #2F4F4F  ■ #DEB887       │    │
│  │    │           │          │          │             │    │
│  │  [🔍 12]    [🔍 45]    [🔍 8]     [🔍 38]          │    │
│  │  Bordeaux   Beige      Gris       Camel           │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📐 CALCUL MÉTRAGE                                   │    │
│  │                                                     │    │
│  │  Robe midi T38 × 1                                  │    │
│  │  Métrage : 2.8m + 20% = 3.4m                       │    │
│  │                                                     │    │
│  │  ☑️ Filtrer par stock suffisant                    │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🧵 TISSU "Crêpe de soie ivoire"                    │    │
│  │                                                     │    │
│  │  [🔍 Trouver similaires]  →  23 tissus             │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Panneau de Résultats

```
┌─ Résultats : Bordeaux (#8B0000) ────────────────────────────┐
│                                                              │
│  📊 SYNTHÈSE                                                │
│  ─────────────────────────────────────────────────────────  │
│  Stock actuel : 12 tissus • 78m total • 8-23€/m            │
│  Potentiel : ~150 tissus sur 3 sources non importées       │
│                                                              │
│  Filtre métrage : ☑️ 3.4m minimum                          │
│  → 8 tissus avec stock suffisant                            │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  RÉSULTATS (8 suffisants / 12 total)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [Image] Crêpe Soie Bordeaux          Nona Source    │  │
│  │         Match 84% • 6m dispo • ✅     13€/m         │  │
│  │                                       [+ Board]      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ [Image] Velours Bordeaux             TFS            │  │
│  │         Match 84% • Coupe • ✅        18€/m         │  │
│  │                                       [+ Board]      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ [Image] Satin Rouge Foncé            MLC            │  │
│  │         Match 62% • 2m • ⚠️           14€/m         │  │
│  │                                       [+ Board]      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  💡 POTENTIEL NON IMPORTÉ                                   │
│  ┌────────────┬──────────┬───────────────────────────────┐ │
│  │ Source     │ Estimé   │ Action                        │ │
│  ├────────────┼──────────┼───────────────────────────────┤ │
│  │ Nona Source│ ~68      │ [🔄 Importer]                 │ │
│  │ Recovo     │ ~45      │ [🔄 Importer]                 │ │
│  │ TFS        │ ~37      │ [🔄 Importer]                 │ │
│  └────────────┴──────────┴───────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Contraintes Fusionnées

```typescript
interface ContextualSearchParams {
  // Source de la recherche
  sourceElement: {
    type: 'palette_color' | 'textile' | 'calculation' | 'note';
    elementId: string;
    boardId: string;
  };
  
  // Contraintes extraites
  constraints: {
    // Couleur (depuis palette ou textile)
    colors?: {
      hex?: string;
      matchedColors: string[];  // ['burgundy', 'red']
      minConfidence: number;    // 50%
    };
    
    // Matière (depuis textile)
    fiber?: string;
    weave?: string;
    
    // Métrage (depuis calcul)
    minQuantity?: {
      meters: number;
      includeUnlimited: boolean;  // cut_to_order
    };
    
    // Prix (depuis contexte)
    maxPricePerMeter?: number;
  };
  
  // Options d'affichage
  options: {
    showInsufficient: boolean;    // Montrer les tissus avec stock insuffisant
    sortBy: 'relevance' | 'price' | 'quantity' | 'match';
  };
}
```

---

## 6. Scraping Guidé par l'Utilisateur

### 6.1 Déclencheur

Quand l'utilisateur voit le potentiel non importé et clique "Importer".

### 6.2 Flow Technique

```
UTILISATEUR                    SYSTÈME                         SHOPIFY
───────────                    ───────                         ───────

1. Voit potentiel
   "~68 tissus bordeaux
    sur Nona Source"
        │
        ▼
2. Clique [Importer]
        │
        ▼
3. Mapping couleur         ──► getColorTagsForSite()
                               │
                               ├── dictionary_mappings
                               │   "burgundy" → ['bordeaux', 'burgundy', 'wine']
                               │
                               └── site_profiles.allTags
                                   ['Burgundy', 'Wine', 'Maroon']
                               │
                               ▼
                               Tags cibles : ['Burgundy', 'Wine']
        │
        ▼
4. Job scraping créé       ──► scraping_jobs.insert({
                               type: 'guided',
                               config: { tags: ['Burgundy', 'Wine'] }
                               })
        │
        │                      ┌─────────────────────────────────┐
        │                      │ WORKER ASYNC                    │
        │                      │                                 │
        │                      │ 1. GET /products.json           │──► Shopify
        │                      │    (paginé, tous produits)      │
        │                      │                                 │
        │                      │ 2. Filter: tags.includes(       │
        │                      │    'Burgundy' || 'Wine')        │
        │                      │    → 68 produits                │
        │                      │                                 │
        │                      │ 3. saveProducts()               │
        │                      │    + normalize                  │
        │                      │    + variantAnalyzer            │
        │                      │                                 │
        │                      │ 4. Update job.results           │
        │                      └─────────────────────────────────┘
        │
5. Notification            ←── "✅ 65 tissus bordeaux importés"
        │
        ▼
6. Résultats enrichis          Query actualisée
   "77 tissus bordeaux"        (12 + 65 = 77)
```

### 6.3 Table `scraping_jobs`

```sql
CREATE TABLE deadstock.scraping_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id),
  
  -- Type et statut
  type TEXT NOT NULL,           -- 'full', 'collection', 'guided'
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high'
  
  -- Configuration
  config JSONB NOT NULL,
  -- Pour type 'guided' :
  -- {
  --   "tags": ["Burgundy", "Wine"],
  --   "target_color": "burgundy",
  --   "min_quantity": 3.4,
  --   "filters": { "available": true }
  -- }
  
  -- Contexte (analytics)
  requested_by TEXT,            -- 'admin', 'user', 'scheduler'
  context JSONB,
  -- {
  --   "board_id": "...",
  --   "element_id": "...",
  --   "reason": "color_search"
  -- }
  
  -- Résultats
  results JSONB,
  -- {
  --   "products_fetched": 2340,
  --   "products_matched": 68,
  --   "products_saved": 65,
  --   "products_skipped": 3,
  --   "errors": []
  -- }
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scraping_jobs_status ON deadstock.scraping_jobs(status);
CREATE INDEX idx_scraping_jobs_site ON deadstock.scraping_jobs(site_id);
```

### 6.4 Service de Scraping Guidé

```typescript
// src/features/admin/services/guidedScrapingService.ts

interface GuidedScrapingRequest {
  siteId: string;
  targetColor: string;           // 'burgundy'
  minQuantity?: number;          // 3.4m
  requestedBy: 'user' | 'admin';
  context?: {
    boardId?: string;
    elementId?: string;
  };
}

interface GuidedScrapingResult {
  jobId: string;
  status: 'completed' | 'failed';
  productsSaved: number;
  productsSkipped: number;
  newTotal: number;
  errors: string[];
}

async function requestGuidedScraping(
  request: GuidedScrapingRequest
): Promise<GuidedScrapingResult> {
  
  // 1. Trouver les tags Discovery correspondants
  const colorMapping = await getColorTagsForSite(
    request.siteId, 
    request.targetColor
  );
  
  if (colorMapping.discoveryTags.length === 0) {
    throw new Error(`Aucun tag trouvé pour la couleur ${request.targetColor}`);
  }
  
  // 2. Créer le job
  const job = await createScrapingJob({
    site_id: request.siteId,
    type: 'guided',
    priority: 'high',
    config: {
      tags: colorMapping.discoveryTags,
      target_color: request.targetColor,
      min_quantity: request.minQuantity,
      filters: { available: true },
    },
    requested_by: request.requestedBy,
    context: request.context,
  });
  
  // 3. Exécuter (sync pour MVP, async pour production)
  const result = await executeGuidedScraping(job.id);
  
  // 4. Compter le nouveau total
  const newTotal = await countTextilesByColor(request.targetColor);
  
  return {
    jobId: job.id,
    status: result.status,
    productsSaved: result.products_saved,
    productsSkipped: result.products_skipped,
    newTotal,
    errors: result.errors,
  };
}
```

---

## 7. Agrégation Stock par Couleur

### 7.1 Requête d'Agrégation

```sql
-- Stock réel agrégé par couleur
CREATE OR REPLACE FUNCTION get_stock_by_colors(target_colors TEXT[])
RETURNS TABLE (
  color TEXT,
  product_count INTEGER,
  total_meters NUMERIC,
  avg_price_per_meter NUMERIC,
  min_price_per_meter NUMERIC,
  max_price_per_meter NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.color,
    COUNT(*)::INTEGER as product_count,
    SUM(
      CASE 
        WHEN t.sale_type = 'cut_to_order' THEN 999  -- Représente "illimité"
        ELSE COALESCE(t.quantity_value, 0) 
      END
    ) as total_meters,
    ROUND(AVG(t.price_per_meter)::NUMERIC, 2) as avg_price_per_meter,
    ROUND(MIN(t.price_per_meter)::NUMERIC, 2) as min_price_per_meter,
    ROUND(MAX(t.price_per_meter)::NUMERIC, 2) as max_price_per_meter
  FROM deadstock.textiles_search t
  WHERE t.available = true
    AND t.color = ANY(target_colors)
  GROUP BY t.color;
END;
$$ LANGUAGE plpgsql;

-- Usage
SELECT * FROM get_stock_by_colors(ARRAY['burgundy', 'red', 'brown']);
```

### 7.2 Estimation Potentiel Discovery

```typescript
// Estimer le potentiel non scrappé depuis Discovery

interface PotentialEstimate {
  siteId: string;
  siteName: string;
  estimatedProducts: number;
  discoveryTags: string[];
  lastDiscoveryAt: string;
}

async function estimatePotentialByColor(
  targetColor: string
): Promise<PotentialEstimate[]> {
  
  // 1. Trouver les termes mappés vers cette couleur
  const mappings = await getMappingsForColor(targetColor);
  // → ['bordeaux', 'burgundy', 'wine', 'maroon']
  
  // 2. Pour chaque site avec Discovery
  const sites = await getSitesWithDiscovery();
  
  const estimates: PotentialEstimate[] = [];
  
  for (const site of sites) {
    const profile = site.profile;
    const allTags = profile.global_analysis.allTags;
    
    // Matcher les tags Discovery avec nos termes
    const matchingTags = allTags.filter(tagInfo =>
      mappings.some(term =>
        tagInfo.tag.toLowerCase().includes(term) ||
        term.includes(tagInfo.tag.toLowerCase())
      )
    );
    
    if (matchingTags.length > 0) {
      // Soustraire les produits déjà scrappés
      const alreadyScraped = await countScrapedByColorAndSite(
        targetColor, 
        site.id
      );
      
      const totalPotential = matchingTags.reduce((sum, t) => sum + t.count, 0);
      const remaining = Math.max(0, totalPotential - alreadyScraped);
      
      if (remaining > 0) {
        estimates.push({
          siteId: site.id,
          siteName: site.name,
          estimatedProducts: remaining,
          discoveryTags: matchingTags.map(t => t.tag),
          lastDiscoveryAt: profile.updated_at,
        });
      }
    }
  }
  
  return estimates.sort((a, b) => b.estimatedProducts - a.estimatedProducts);
}
```

---

## 8. Composants UI

### 8.1 Arborescence Composants

```
src/features/boards/components/
├── contextual-search/
│   ├── ContextualSearchPanel.tsx      # Panneau latéral résultats
│   ├── ColorMatchBadge.tsx            # Badge % match couleur
│   ├── StockSufficiencyBadge.tsx      # Badge ✅/⚠️ stock
│   ├── PotentialSourcesCard.tsx       # Card sources non importées
│   └── GuidedScrapingButton.tsx       # Bouton import avec progress
│
├── elements/
│   ├── PaletteElement.tsx             # Élément palette avec boutons recherche
│   ├── CalculationElement.tsx         # Élément calcul avec checkbox filtre
│   └── TextileElement.tsx             # Élément tissu avec "Similaires"
│
└── search-triggers/
    ├── ColorSearchButton.tsx          # Bouton 🔍 sous chaque couleur
    └── SimilarSearchButton.tsx        # Bouton "Trouver similaires"
```

### 8.2 Composant ColorSearchButton

```tsx
interface ColorSearchButtonProps {
  hex: string;
  boardId: string;
  paletteId: string;
  calculationMeters?: number;  // Si calcul lié
}

function ColorSearchButton({ hex, boardId, paletteId, calculationMeters }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [resultCount, setResultCount] = useState<number | null>(null);
  
  // Pré-calculer le nombre de résultats au mount
  useEffect(() => {
    async function fetchCount() {
      const matches = findMatchingColors(hex);
      const colors = matches.map(m => m.color);
      const count = await countTextilesByColors(colors, calculationMeters);
      setResultCount(count);
    }
    fetchCount();
  }, [hex, calculationMeters]);
  
  const handleClick = async () => {
    setIsLoading(true);
    // Ouvrir panneau de recherche contextuelle
    openContextualSearch({
      type: 'palette_color',
      hex,
      boardId,
      paletteId,
      minQuantity: calculationMeters,
    });
    setIsLoading(false);
  };
  
  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 px-2 py-1 text-xs 
                 bg-gray-100 hover:bg-gray-200 rounded"
      disabled={isLoading}
    >
      <Search className="w-3 h-3" />
      {resultCount !== null ? (
        <span className="font-medium">{resultCount}</span>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin" />
      )}
    </button>
  );
}
```

### 8.3 Composant StockSufficiencyBadge

```tsx
interface StockSufficiencyBadgeProps {
  textile: {
    sale_type: string;
    quantity_value: number | null;
  };
  requiredMeters: number | null;
}

function StockSufficiencyBadge({ textile, requiredMeters }: Props) {
  if (!requiredMeters) return null;
  
  const { sufficient, reason } = isStockSufficient(textile, requiredMeters);
  
  if (sufficient) {
    return (
      <div className="flex items-center gap-1 text-green-600 text-xs">
        <Check className="w-3 h-3" />
        <span>{reason}</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1 text-amber-600 text-xs">
      <AlertTriangle className="w-3 h-3" />
      <span>{reason}</span>
    </div>
  );
}
```

---

## 9. API Endpoints

### 9.1 Recherche Contextuelle

```typescript
// POST /api/search/contextual
interface ContextualSearchRequest {
  source: {
    type: 'palette_color' | 'textile' | 'calculation';
    elementId: string;
    boardId: string;
  };
  constraints: {
    colors?: { hex: string; minConfidence?: number };
    fiber?: string;
    minQuantity?: number;
  };
  pagination: {
    limit: number;
    offset: number;
  };
}

interface ContextualSearchResponse {
  results: TextileWithMatch[];
  total: number;
  aggregation: {
    byColor: { color: string; count: number; totalMeters: number }[];
    sufficientCount: number;
    insufficientCount: number;
  };
  potential: PotentialEstimate[];
}
```

### 9.2 Scraping Guidé

```typescript
// POST /api/scraping/guided
interface GuidedScrapingRequest {
  siteId: string;
  targetColor: string;
  minQuantity?: number;
  context?: {
    boardId?: string;
    elementId?: string;
  };
}

interface GuidedScrapingResponse {
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress?: {
    fetched: number;
    matched: number;
    saved: number;
  };
}

// GET /api/scraping/jobs/:jobId
interface ScrapingJobStatusResponse {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: { ... };
  results?: { ... };
  error?: string;
}
```

---

## 10. Plan d'Implémentation

Voir **SPRINT_PLAN.md** pour le découpage détaillé en sprints.

---

## 11. Métriques de Succès

| Métrique | Cible |
|----------|-------|
| Temps réponse recherche contextuelle | < 500ms |
| Précision color matching | > 85% satisfaction utilisateur |
| Taux d'utilisation scraping guidé | > 30% des recherches sans résultats |
| Conversion potentiel → import | > 50% |

---

## 12. Risques et Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Distance LAB imprécise | Moyen | Moyen | Permettre sélection manuelle des couleurs |
| Scraping guidé trop lent | Moyen | Haut | Job async avec notifications |
| Tags Discovery non à jour | Moyen | Moyen | Afficher date dernière Discovery |
| Surcharge API Shopify | Faible | Haut | Rate limiting + cache |

---

## Références

- ADR-024: Textile Standard System
- ADR-025: Admin Architecture Clarification
- ADR-026: Sale Type Discovery & Hybrid Display
- GLOSSAIRE.md: Définitions Board, Palette, Calcul
