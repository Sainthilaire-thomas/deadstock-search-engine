# ADR-024 Update: Sale Type System (Complément)

**Date mise à jour**: 09/01/2026  
**Status**: Validé  
**Contexte**: Clarification `quantity_value` suite à l'analyse de 3 sites

---

## Contexte de la mise à jour

L'ADR-024 original identifiait le problème d'ambiguïté de `quantity_value` et proposait une solution avec `sale_type`. Suite à l'analyse approfondie de 3 sites (Session 21), nous avons :

1. **Découvert un 4ème type** : `hybrid` (Nona Source)
2. **Identifié le besoin de `price_per_meter`** : pour comparer les prix entre sites
3. **Validé l'impact sur le filtre patron** : `YardageSearchFilter` dépend de `quantity_value`

---

## Analyse des 3 sites de référence

### 1. The Fabric Sales (thefabricsales.com)
**Modèle : `cut_to_order`** (coupe à la demande)

```json
{
  "variant": {
    "title": "Default Title",
    "price": "2.77",
    "option1": null
  }
}
```

| Champ | Valeur | Signification |
|-------|--------|---------------|
| `price` | 2.77€ | Prix au mètre |
| `quantity_value` | 1 | Non pertinent (infini) |
| `quantity_unit` | "unit" | - |

### 2. My Little Coupon (mylittlecoupon.fr)
**Modèle : `fixed_length`** (coupon fixe)

```json
{
  "variant": {
    "title": "3m",
    "price": "39.00",
    "option1": "3m"
  }
}
```

| Champ | Valeur | Signification |
|-------|--------|---------------|
| `price` | 39.00€ | Prix total du coupon |
| `quantity_value` | 3 | Longueur en mètres |
| `quantity_unit` | "m" | Mètres |
| `price_per_meter` | 13.00€ | Calculé: 39/3 |

### 3. Nona Source (nona-source.com) - LVMH
**Modèle : `hybrid`** (coupons fixes + coupe sur mesure)

Structure Shopify avec 3 options :
- `option1`: Colour (Brazilian Sand, Clear Sky...)
- `option2`: Length (6, 13, 21... ou 0 pour Cutting)
- `option3`: Lot (référence ou "Cutting")

```json
{
  "variants": [
    {
      "title": "Brazilian Sand / 6 / T25A05.00009",
      "option2": "6",
      "option3": "T25A05.00009",
      "price": "78.00",
      "grams": 848
    },
    {
      "title": "Brazilian Sand / 0 / Cutting",
      "option2": "0",
      "option3": "Cutting",
      "price": "18.00",
      "grams": 1000
    }
  ]
}
```

| Type variant | Length | Price | Prix/m | Signification |
|--------------|--------|-------|--------|---------------|
| Coupon fixe | 6m | 78€ | 13€/m | Rouleau entier |
| Coupon fixe | 13m | 169€ | 13€/m | Rouleau entier |
| Cutting | 0 | 18€ | 18€/m | Coupe sur mesure |

**Découverte clé** : Acheter un rouleau entier est ~28% moins cher que la coupe !

---

## Décision mise à jour

### Colonnes à ajouter sur `textiles`

```sql
-- 1. Type de vente (mise à jour de la proposition originale)
ALTER TABLE deadstock.textiles 
ADD COLUMN IF NOT EXISTS sale_type VARCHAR(20) DEFAULT 'unknown';

-- Valeurs possibles (ajout de 'hybrid')
-- 'fixed_length'  : quantity_value = longueur disponible (MLC, Nona coupons)
-- 'cut_to_order'  : quantity_value = NULL, prix = prix/m (TFS, Nona cutting)
-- 'hybrid'        : les deux options disponibles (Nona Source)
-- 'by_piece'      : quantity_value = nombre de pièces
-- 'unknown'       : non déterminé

-- 2. Prix au mètre normalisé (nouveau)
ALTER TABLE deadstock.textiles 
ADD COLUMN IF NOT EXISTS price_per_meter DECIMAL(10,2);

-- Permet la comparaison entre sites avec modèles différents
```

### Contrainte de validation

```sql
ALTER TABLE deadstock.textiles 
ADD CONSTRAINT chk_sale_type 
CHECK (sale_type IN ('fixed_length', 'cut_to_order', 'hybrid', 'by_piece', 'unknown'));
```

### Index pour filtrage

```sql
CREATE INDEX IF NOT EXISTS idx_textiles_sale_type 
ON deadstock.textiles(sale_type);

CREATE INDEX IF NOT EXISTS idx_textiles_price_per_meter 
ON deadstock.textiles(price_per_meter);
```

---

## Logique de filtrage mise à jour

### Impact sur `YardageSearchFilter`

Le filtre patron (`📐 J'ai un patron`) compare `textile.quantity_value` avec le métrage nécessaire :

```typescript
// Avant (problématique)
function isTextileSufficient(textile, neededMeters) {
  return textile.quantity_value >= neededMeters;
  // ❌ Ne fonctionne pas pour cut_to_order (quantity_value = 1)
}

// Après (corrigé)
function isTextileSufficient(textile, neededMeters) {
  switch (textile.sale_type) {
    case 'cut_to_order':
      return true; // Toujours disponible (coupe à la demande)
    
    case 'fixed_length':
    case 'hybrid':
      return textile.quantity_value >= neededMeters;
    
    case 'by_piece':
      return false; // Non compatible avec filtre métrage
    
    default:
      return textile.quantity_value >= neededMeters; // Fallback
  }
}
```

### Calcul `price_per_meter`

```typescript
function calculatePricePerMeter(textile): number | null {
  switch (textile.sale_type) {
    case 'cut_to_order':
      // Prix affiché = prix au mètre
      return textile.price_value;
    
    case 'fixed_length':
      // Prix affiché = prix total du coupon
      if (textile.quantity_value > 0) {
        return textile.price_value / textile.quantity_value;
      }
      return null;
    
    case 'hybrid':
      // Dépend du variant (à calculer au scraping)
      return textile.price_per_meter; // Pré-calculé
    
    default:
      return null;
  }
}
```

---

## Migration des données existantes

```sql
-- The Fabric Sales = cut_to_order
UPDATE deadstock.textiles t
SET 
  sale_type = 'cut_to_order',
  price_per_meter = t.price_value
FROM deadstock.sites s
WHERE t.site_id = s.id 
  AND s.domain = 'thefabricsales.com';

-- My Little Coupon = fixed_length
UPDATE deadstock.textiles t
SET 
  sale_type = 'fixed_length',
  price_per_meter = CASE 
    WHEN t.quantity_value > 0 THEN t.price_value / t.quantity_value 
    ELSE NULL 
  END
FROM deadstock.sites s
WHERE t.site_id = s.id 
  AND s.domain = 'mylittlecoupon.fr';

-- Nona Source = hybrid
UPDATE deadstock.textiles t
SET 
  sale_type = 'hybrid'
  -- price_per_meter sera calculé au prochain scraping
FROM deadstock.sites s
WHERE t.site_id = s.id 
  AND s.domain = 'www.nona-source.com';
```

---

## Mise à jour de la vue matérialisée

```sql
-- Ajouter les nouvelles colonnes à textiles_search
DROP MATERIALIZED VIEW IF EXISTS deadstock.textiles_search;

CREATE MATERIALIZED VIEW deadstock.textiles_search AS
SELECT 
  t.id,
  t.name,
  t.description,
  t.image_url,
  t.source_url,
  t.price_value AS price,
  t.price_currency,
  t.quantity_value,
  t.quantity_unit,
  t.width_value,
  t.weight_value,
  t.available,
  t.site_id,
  t.created_at,
  -- Nouvelles colonnes
  t.sale_type,
  t.price_per_meter,
  -- Attributs pivotés
  MAX(CASE WHEN ta.category_slug = 'fiber' THEN ta.value END) as fiber,
  MAX(CASE WHEN ta.category_slug = 'color' THEN ta.value END) as color,
  MAX(CASE WHEN ta.category_slug = 'pattern' THEN ta.value END) as pattern,
  MAX(CASE WHEN ta.category_slug = 'weave' THEN ta.value END) as weave,
  -- Site info
  s.name as site_name,
  s.domain as site_domain
FROM deadstock.textiles t
LEFT JOIN deadstock.textile_attributes ta ON t.id = ta.textile_id
LEFT JOIN deadstock.sites s ON t.site_id = s.id
WHERE t.available = true
GROUP BY t.id, s.name, s.domain;

-- Index
CREATE UNIQUE INDEX idx_textiles_search_id ON deadstock.textiles_search(id);
CREATE INDEX idx_textiles_search_sale_type ON deadstock.textiles_search(sale_type);
CREATE INDEX idx_textiles_search_price_per_meter ON deadstock.textiles_search(price_per_meter);
```

---

## Impact UI Designer

### Affichage selon `sale_type`

```
┌─────────────────────────────────────────────────────────┐
│  Silk Georgette - Brazilian Sand          [Nona Source] │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  💰 À partir de 13€/m                                   │
│  📦 Type: Rouleau ou coupe                              │
│                                                         │
│  Disponible en :                                        │
│     • Rouleau 6m - 78€                                  │
│     • Rouleau 13m - 169€                                │
│     • Coupe sur mesure - 18€/m                          │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Wool Jacquard - Black              [The Fabric Sales]  │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  💰 2.77€/m                                             │
│  ✂️  Coupe à la demande                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Coton Liberty - Rose               [My Little Coupon]  │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  💰 13€/m (coupon 3m = 39€)                             │
│  📏 Coupon fixe: 3 mètres                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Checklist mise à jour

### ADR-024 Phase 2 (Session 21) ✅
- [x] Analyser structure Nona Source
- [x] Identifier le modèle `hybrid`
- [x] Documenter les 3 types de vente
- [x] Définir `price_per_meter`

### ADR-024 Phase 3 (À faire)
- [ ] Exécuter migration `sale_type` + `price_per_meter`
- [ ] Mettre à jour `textiles_search` view
- [ ] Adapter le scraper pour calculer `price_per_meter`
- [ ] Mettre à jour `YardageSearchFilter` logic
- [ ] Adapter l'UI pour afficher le type de vente

---

## Références

- Session 20 : Dual-write textile_attributes
- Session 21 : Analyse Nona Source & sale_type
- SPEC_PATTERN_IMPORT.md : YardageSearchFilter

---

**Status**: Draft → Validé  
**Auteur**: Thomas + Claude  
**Date mise à jour**: 09/01/2026
