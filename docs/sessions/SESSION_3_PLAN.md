# SESSION 3 : NORMALISATION INTELLIGENTE + SUPERVISION

**Durée estimée** : 4-6 heures  
**Prérequis** : Session 2 complétée (Scraping System opérationnel)  
**Objectif** : Intégrer le système de normalisation avec dictionnaires + LLM fallback

---

## 🎯 Vision Stratégique

### Architecture Multi-Couches

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: RAW DATA (Shopify brut)                      │
│  ├─ raw_data (jsonb) - Données originales conservées   │
│  └─ source_product_id, source_platform                  │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 2: INTELLIGENT NORMALIZATION                     │
│  ├─ Dictionnaires FR→EN, ES→EN (ADR-002)              │
│  ├─ LLM Fallback pour unknowns (ADR-004)              │
│  ├─ Confidence scoring                                  │
│  └─ Flags pour supervision                             │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 3: NORMALIZED DATA (English)                     │
│  ├─ material_type: "cotton" ✅                          │
│  ├─ color: "blue" ✅                                    │
│  ├─ pattern: "striped" ✅                               │
│  └─ composition: {"cotton": 80, "polyester": 20}       │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 4: HUMAN SUPERVISION (ADR-006)                   │
│  ├─ Admin reviews unknowns avec contexte enrichi       │
│  ├─ Approves/corrects mappings                         │
│  └─ System apprend des corrections                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Plan Session 3

### Étape 1 : Dictionnaires de Normalisation (1h30)

#### 1.1 Structure des fichiers

```
src/lib/normalization/
├── dictionaries/
│   ├── materials.ts      # FR→EN, EN→EN, ES→EN
│   ├── colors.ts         # FR→EN, EN→EN, ES→EN
│   ├── patterns.ts       # FR→EN, EN→EN, ES→EN
│   └── types.ts          # Types TypeScript
│
├── normalize.ts          # Fonctions de normalisation
└── types.ts              # Interfaces communes
```

#### 1.2 Contenu des dictionnaires

**materials.ts** :
```typescript
export const materialDictionary = {
  fr: {
    // Fibres naturelles
    'coton': 'cotton',
    'soie': 'silk',
    'laine': 'wool',
    'lin': 'linen',
    'cachemire': 'cashmere',
    
    // Fibres synthétiques
    'polyester': 'polyester',
    'viscose': 'viscose',
    'élasthanne': 'elastane',
    'nylon': 'nylon',
    
    // Blends
    'coton-polyester': 'cotton blend',
    'laine-cachemire': 'wool blend',
    // ... ~30-50 termes
  },
  en: {
    'cotton': 'cotton', // passthrough
    'silk': 'silk',
    // ...
  },
  es: {
    'algodón': 'cotton',
    'seda': 'silk',
    // ...
  }
};
```

**colors.ts** :
```typescript
export const colorDictionary = {
  fr: {
    // Couleurs de base
    'blanc': 'white',
    'noir': 'black',
    'rouge': 'red',
    'bleu': 'blue',
    'vert': 'green',
    'jaune': 'yellow',
    
    // Nuances
    'bleu marine': 'navy blue',
    'bleu ciel': 'sky blue',
    'rouge bordeaux': 'burgundy',
    'rose poudré': 'powder pink',
    'gris anthracite': 'charcoal gray',
    
    // Textile-specific
    'écru': 'ecru',
    'lilas': 'lilac',
    'turquoise': 'turquoise',
    // ... ~50-100 termes
  },
  // ... en, es
};
```

**patterns.ts** :
```typescript
export const patternDictionary = {
  fr: {
    'uni': 'solid',
    'rayé': 'striped',
    'à carreaux': 'checkered',
    'fleuri': 'floral',
    'pois': 'polka dot',
    'imprimé': 'printed',
    'jacquard': 'jacquard',
    // ... ~30 termes
  },
  // ... en, es
};
```

---

### Étape 2 : Fonctions de Normalisation (1h)

#### 2.1 normalize.ts

```typescript
export interface NormalizationResult {
  normalized: string | null;
  original: string;
  confidence: number; // 0-1
  method: 'dictionary_exact' | 'dictionary_synonym' | 'llm_fallback' | 'failed';
  alternatives?: string[];
}

export interface TextileNormalization {
  material: NormalizationResult | null;
  color: NormalizationResult | null;
  pattern: NormalizationResult | null;
  needsReview: boolean;
  reviewReasons: Array<{
    field: string;
    reason: string;
    details?: any;
  }>;
  qualityScore: number;
}

/**
 * Normalize Shopify product tags/title to structured data
 */
export async function normalizeShopifyProduct(
  product: ShopifyProduct,
  sourceLang: 'fr' | 'en' | 'es' = 'en'
): Promise<TextileNormalization> {
  // Extract material from tags/title
  const material = await normalizeMaterial(
    extractMaterialHints(product),
    sourceLang
  );
  
  // Extract color from tags/title
  const color = await normalizeColor(
    extractColorHints(product),
    sourceLang
  );
  
  // Extract pattern from tags/title
  const pattern = await normalizePattern(
    extractPatternHints(product),
    sourceLang
  );
  
  // Determine if needs review
  const needsReview = (
    material?.confidence < 0.7 ||
    color?.confidence < 0.7 ||
    pattern?.confidence < 0.7
  );
  
  // Calculate quality score
  const qualityScore = calculateQualityScore({
    material,
    color,
    pattern
  });
  
  return {
    material,
    color,
    pattern,
    needsReview,
    reviewReasons: buildReviewReasons({ material, color, pattern }),
    qualityScore
  };
}

/**
 * Normalize material with dictionary + LLM fallback
 */
async function normalizeMaterial(
  hints: string[],
  sourceLang: string
): Promise<NormalizationResult | null> {
  // Try dictionary first (fast path)
  for (const hint of hints) {
    const dictResult = tryDictionary(hint, sourceLang, materialDictionary);
    if (dictResult) {
      return {
        normalized: dictResult,
        original: hint,
        confidence: 0.95,
        method: 'dictionary_exact'
      };
    }
  }
  
  // LLM fallback (slow path) - TODO: implement in Phase 2
  // For now, return null and log for supervision
  return null;
}
```

---

### Étape 3 : Migration 009 - Colonnes de Normalisation (30min)

```sql
-- Migration 009: Add normalization metadata to textiles

-- Original values (pour référence)
ALTER TABLE deadstock.textiles
ADD COLUMN material_original TEXT,
ADD COLUMN color_original TEXT,
ADD COLUMN pattern_original TEXT,
ADD COLUMN tags_original TEXT[];

-- Confidence scores
ADD COLUMN material_confidence DECIMAL(3,2),
ADD COLUMN color_confidence DECIMAL(3,2),
ADD COLUMN pattern_confidence DECIMAL(3,2);

-- Supervision flags
ADD COLUMN needs_review BOOLEAN DEFAULT FALSE,
ADD COLUMN review_reasons JSONB,
ADD COLUMN reviewed_at TIMESTAMPTZ,
ADD COLUMN reviewed_by UUID;

-- Indexes
CREATE INDEX idx_textiles_needs_review 
ON deadstock.textiles(needs_review) 
WHERE needs_review = TRUE;

CREATE INDEX idx_textiles_material_type 
ON deadstock.textiles(material_type) 
WHERE material_type IS NOT NULL;

CREATE INDEX idx_textiles_color 
ON deadstock.textiles(color) 
WHERE color IS NOT NULL;
```

---

### Étape 4 : Intégration dans scrapingRepo (45min)

#### 4.1 Modifier saveProducts()

```typescript
async saveProducts(
  products: ShopifyProduct[],
  siteUrl: string,
  jobId: string,
  sourceLang: 'fr' | 'en' | 'es' = 'en'
): Promise<{ saved: number; updated: number; skipped: number }> {
  // ...
  
  for (const product of products) {
    // NOUVEAU : Normalisation avant sauvegarde
    const normalization = await normalizeShopifyProduct(product, sourceLang);
    
    const textileData = {
      // Raw
      raw_data: product,
      source_product_id: product.id.toString(),
      
      // Normalized (Layer 2)
      material_type: normalization.material?.normalized,
      material_original: normalization.material?.original,
      material_confidence: normalization.material?.confidence,
      
      color: normalization.color?.normalized,
      color_original: normalization.color?.original,
      color_confidence: normalization.color?.confidence,
      
      pattern: normalization.pattern?.normalized,
      pattern_original: normalization.pattern?.original,
      pattern_confidence: normalization.pattern?.confidence,
      
      tags_original: Array.isArray(product.tags) 
        ? product.tags 
        : product.tags.split(',').map(t => t.trim()),
      
      // Supervision
      needs_review: normalization.needsReview,
      review_reasons: normalization.reviewReasons,
      
      // Quality
      data_quality_score: Math.round(normalization.qualityScore),
      
      // ... autres champs
    };
    
    // Insert/Update...
  }
}
```

---

### Étape 5 : Tests & Validation (1h)

#### 5.1 Test avec The Fabric Sales

```powershell
# Test normalization sur 20 produits
npm run scrape thefabricsales.com --collection abstract --limit 20

# Vérifier en DB
SELECT 
  name,
  material_type, material_original, material_confidence,
  color, color_original, color_confidence,
  needs_review,
  data_quality_score
FROM deadstock.textiles
WHERE source_platform = 'thefabricsales.com'
ORDER BY scraped_at DESC
LIMIT 20;
```

#### 5.2 Métriques de succès

- ✅ 80%+ des produits ont `material_type` normalisé
- ✅ 70%+ des produits ont `color` normalisé
- ✅ Confidence moyenne > 0.85
- ✅ `needs_review` < 30% des produits

---

## 📊 Structure finale de la donnée

### Exemple : Product bien normalisé

```json
{
  "name": "Manon Burgundy Red Check Wool Blend Fabric",
  
  // Normalized (searchable)
  "material_type": "wool",
  "color": "red",
  "pattern": "check",
  
  // Original (for reference)
  "material_original": "wool-blend",
  "color_original": "burgundy",
  "pattern_original": "checked",
  "tags_original": ["wool-blend", "burgundy", "checked", "designer"],
  
  // Confidence
  "material_confidence": 0.95,
  "color_confidence": 0.80,
  "pattern_confidence": 0.90,
  
  // Supervision
  "needs_review": false,
  "review_reasons": [],
  "data_quality_score": 88,
  
  // Raw (complete data)
  "raw_data": { /* Full Shopify object */ }
}
```

### Exemple : Product à reviewer

```json
{
  "name": "Viscose-Like Mystery Fabric",
  
  // Normalized
  "material_type": null,
  "color": "blue",
  "pattern": null,
  
  // Original
  "material_original": "viscose-like-fabric",
  "color_original": "azure",
  "pattern_original": "floral-striped",
  "tags_original": ["viscose-like-fabric", "azure", "floral-striped"],
  
  // Confidence
  "material_confidence": 0.0,
  "color_confidence": 0.85,
  "pattern_confidence": 0.50,
  
  // Supervision
  "needs_review": true,
  "review_reasons": [
    {
      "field": "material_type",
      "reason": "unknown_term",
      "original_value": "viscose-like-fabric",
      "suggestions": ["viscose", "polyester", "synthetic"]
    },
    {
      "field": "pattern",
      "reason": "multiple_matches",
      "detected": ["floral", "striped"]
    }
  ],
  "data_quality_score": 55
}
```

---

## 🚀 Livrables Session 3

### Fichiers à créer

- [ ] `src/lib/normalization/dictionaries/materials.ts`
- [ ] `src/lib/normalization/dictionaries/colors.ts`
- [ ] `src/lib/normalization/dictionaries/patterns.ts`
- [ ] `src/lib/normalization/normalize.ts`
- [ ] `src/lib/normalization/types.ts`
- [ ] `database/migrations/009_normalization_metadata.sql`

### Fichiers à modifier

- [ ] `src/features/admin/infrastructure/scrapingRepo.ts` (intégrer normalisation)
- [ ] `src/features/admin/services/scrapingService.ts` (passer sourceLang)

### Tests à effectuer

- [ ] Test normalisation TFS (EN) - 20 produits
- [ ] Test normalisation MLC (FR) - 20 produits (si connexion stable)
- [ ] Vérifier données en DB
- [ ] Valider métriques de qualité

---

## 📝 Notes importantes

### Différence avec ancien système

**Ancien** (scripts Phase 0) :
- Normalisation ad-hoc dans chaque scraper
- Dictionnaires inline
- Pas de confidence scoring
- Pas de supervision

**Nouveau** (Session 3) :
- Normalisation centralisée réutilisable
- Dictionnaires structurés par langue
- Confidence scoring systématique
- Flags pour supervision admin
- Raw data toujours préservé

### Phase 2 (Future) : LLM Fallback

Non implémenté en Session 3, sera ajouté plus tard :
- Claude API pour unknowns
- Logging pour review
- Interface admin de supervision

---

## ✅ Critères de validation Session 3

Session 3 est complète si :
- ✅ Dictionnaires FR/EN/ES créés (30+ termes chacun)
- ✅ Fonctions de normalisation opérationnelles
- ✅ Migration 009 exécutée
- ✅ ScrapingRepo intégré avec normalisation
- ✅ Test TFS : 80%+ material_type détecté
- ✅ Test TFS : 70%+ color détecté
- ✅ Données originales préservées (tags_original, *_original)
- ✅ Confidence scores calculés
- ✅ Flags needs_review fonctionnels

---

## 🔗 Références

- **ADR-002** : Normalisation English + i18n
- **ADR-004** : Tuning System (Dictionnaire + LLM)
- **ADR-006** : Product Context Enrichment
- **TUNING_SYSTEM.md** : Documentation système tuning
