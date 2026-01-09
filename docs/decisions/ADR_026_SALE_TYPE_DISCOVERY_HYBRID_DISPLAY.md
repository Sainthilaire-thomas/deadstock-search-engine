# ADR-026 : Détection Sale Type au Discovery et Affichage Produits Hybrid

**Date** : 9 Janvier 2026  
**Statut** : Proposé  
**Contexte** : Amélioration UX Admin et Search  
**Impact** : Discovery Service, Search UI

---

## Résumé Exécutif

Actuellement, le `sale_type` (fixed_length, hybrid, cut_to_order) n'est détecté qu'au moment du scraping. Cette ADR propose de :
1. **Détecter le sale_type dès le Discovery** pour informer l'admin avant le scraping
2. **Afficher les deux options de prix pour les produits hybrid** côté recherche

---

## 1. Contexte

### 1.1 Situation Actuelle

```
DISCOVERY                          SCRAPING
─────────────────────────         ─────────────────────────
✅ Analyse collections             ✅ Détecte sale_type
✅ Détecte patterns extraction     ✅ Calcule price_per_meter
✅ Calcule Deadstock Score         ✅ Extrait quantity_value
❌ Ne détecte PAS sale_type        
```

**Problème** : L'admin ne sait pas quel modèle de vente utilise un site avant de scraper. Il découvre après coup que Nona Source vend en "hybrid" (coupons + coupe).

### 1.2 Affichage Actuel des Produits Hybrid

Les produits hybrid ont deux modes d'achat :
- **Coupon fixe** : Prix pour une longueur donnée (ex: 45€ pour 2.5m)
- **Coupe à la demande** : Prix au mètre (ex: 18€/m)

Actuellement, on n'affiche qu'un seul prix (`price_per_meter`), perdant l'information sur les coupons disponibles.

---

## 2. Décision

### 2.1 Détection Sale Type au Discovery

**Principe** : Analyser un échantillon de variants lors du Discovery pour déduire le modèle de vente dominant.

**Algorithme de détection** :

```typescript
interface SaleTypeDetection {
  dominantType: 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece' | 'unknown';
  confidence: number; // 0-100
  evidence: {
    hasMultipleVariants: boolean;
    hasLengthInOptions: boolean;
    hasCuttingOption: boolean;
    hasPricePerUnit: boolean;
    sampleSize: number;
  };
}

function detectSaleType(sampleProducts: ShopifyProduct[]): SaleTypeDetection {
  const evidence = {
    hasMultipleVariants: false,
    hasLengthInOptions: false,
    hasCuttingOption: false,
    hasPricePerUnit: false,
    sampleSize: sampleProducts.length
  };
  
  for (const product of sampleProducts) {
    if (product.variants.length > 1) {
      evidence.hasMultipleVariants = true;
    }
    
    for (const variant of product.variants) {
      // Détecte longueur dans options (ex: "2m", "3.5m")
      const lengthPattern = /^\d+(\.\d+)?m?$/i;
      if (variant.option2?.match(lengthPattern)) {
        evidence.hasLengthInOptions = true;
      }
      
      // Détecte option "Cutting" (spécifique Nona Source)
      if (variant.option3?.toLowerCase() === 'cutting') {
        evidence.hasCuttingOption = true;
      }
      
      // Détecte prix à l'unité dans le titre (ex: "per meter", "au mètre")
      if (product.title.match(/per meter|au mètre|\/m\b/i)) {
        evidence.hasPricePerUnit = true;
      }
    }
  }
  
  // Décision basée sur les preuves
  if (evidence.hasCuttingOption) {
    return { dominantType: 'hybrid', confidence: 95, evidence };
  }
  if (evidence.hasPricePerUnit && !evidence.hasLengthInOptions) {
    return { dominantType: 'cut_to_order', confidence: 85, evidence };
  }
  if (evidence.hasLengthInOptions && !evidence.hasCuttingOption) {
    return { dominantType: 'fixed_length', confidence: 80, evidence };
  }
  if (!evidence.hasMultipleVariants) {
    return { dominantType: 'by_piece', confidence: 70, evidence };
  }
  
  return { dominantType: 'unknown', confidence: 0, evidence };
}
```

### 2.2 Stockage dans site_profiles

Ajouter au JSON `extraction_patterns` dans `site_profiles` :

```typescript
interface SiteProfile {
  // Existant
  extraction_patterns: ExtractionPatterns;
  
  // Nouveau
  sale_type_detection: {
    dominantType: SaleType;
    confidence: number;
    detectedAt: string; // ISO date
    sampleSize: number;
    evidence: SaleTypeEvidence;
  };
}
```

### 2.3 Affichage Discovery UI

Dans `/admin/sites/[id]/configure`, afficher :

```
┌─────────────────────────────────────────────────────────────┐
│  MODÈLE DE VENTE DÉTECTÉ                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🏷️  HYBRID (95% confiance)                                │
│                                                             │
│  Ce site vend en deux modes :                               │
│  • Coupons fixes : longueurs prédéfinies (2m, 3m, 5m...)    │
│  • Coupe à la demande : prix au mètre                       │
│                                                             │
│  Preuves détectées :                                        │
│  ✓ Option "Cutting" trouvée dans les variants               │
│  ✓ Longueurs en option2 (2m, 3.5m, 10m)                     │
│  ✓ 20 produits analysés                                     │
│                                                             │
│  [Override: Fixed Length ▼]  [Re-analyser]                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Affichage Produits Hybrid côté Search

### 3.1 Données Requises

Pour les produits `sale_type = 'hybrid'`, stocker les deux prix :

```typescript
// Dans textiles
interface TextileHybrid {
  sale_type: 'hybrid';
  price_value: number;        // Prix du coupon (ex: 45€)
  quantity_value: number;     // Longueur du coupon (ex: 2.5m)
  price_per_meter: number;    // Prix à la coupe (ex: 18€/m)
  
  // Nouveau champ optionnel
  coupon_details?: {
    lengths: number[];        // Longueurs disponibles [2, 3, 5, 10]
    minPrice: number;         // Prix du plus petit coupon
    maxPrice: number;         // Prix du plus grand coupon
  };
}
```

### 3.2 UI Card Textile

**Design proposé pour produits hybrid** :

```
┌─────────────────────────────────────────┐
│  [Image]                                │
│                                         │
│  Crêpe de Soie Noir                     │
│  Nona Source                            │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  💰 DEUX OPTIONS D'ACHAT        │    │
│  ├─────────────────────────────────┤    │
│  │  Coupon 2.5m     45€            │    │
│  │  À la coupe      18€/m          │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Largeur: 140cm | Soie 100%             │
│                                         │
│  [♡ Favoris]  [Voir →]                  │
└─────────────────────────────────────────┘
```

**Comparaison avec autres sale_types** :

```
FIXED_LENGTH               CUT_TO_ORDER              BY_PIECE
─────────────────────     ─────────────────────     ─────────────────────
Coupon 3m : 89€           18€/m                     25€ la pièce
(29.67€/m)                Stock: 45m disponibles    12 pièces disponibles
```

### 3.3 Composant React

```tsx
// src/features/search/components/PriceDisplay.tsx

interface PriceDisplayProps {
  textile: Textile;
}

export function PriceDisplay({ textile }: PriceDisplayProps) {
  if (textile.sale_type === 'hybrid') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="text-xs font-medium text-amber-700 mb-2">
          Deux options d'achat
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Coupon {textile.quantity_value}m</span>
            <span className="font-semibold">{textile.price_value}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>À la coupe</span>
            <span className="font-semibold">{textile.price_per_meter}€/m</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (textile.sale_type === 'fixed_length') {
    return (
      <div>
        <div className="font-semibold">{textile.price_value}€</div>
        <div className="text-xs text-gray-500">
          Coupon {textile.quantity_value}m ({textile.price_per_meter?.toFixed(2)}€/m)
        </div>
      </div>
    );
  }
  
  if (textile.sale_type === 'cut_to_order') {
    return (
      <div>
        <div className="font-semibold">{textile.price_per_meter}€/m</div>
        {textile.quantity_value && (
          <div className="text-xs text-gray-500">
            {textile.quantity_value}m disponibles
          </div>
        )}
      </div>
    );
  }
  
  // by_piece ou fallback
  return (
    <div className="font-semibold">{textile.price_value}€</div>
  );
}
```

---

## 4. Implémentation

### Phase 1 : Détection au Discovery (Session 21)

**Fichiers à modifier** :

1. `src/features/admin/services/discoveryService.ts`
   - Ajouter `detectSaleType()` après analyse des collections
   - Stocker résultat dans `site_profiles.extraction_patterns`

2. `src/features/admin/components/DiscoveryResults.tsx`
   - Afficher le sale_type détecté avec niveau de confiance

**Migration SQL** :
```sql
-- Pas de nouvelle colonne nécessaire
-- On utilise le JSONB existant site_profiles.extraction_patterns
```

### Phase 2 : Affichage Hybrid (Session 22)

**Fichiers à modifier** :

1. `src/features/search/components/TextileCard.tsx`
   - Utiliser nouveau composant `PriceDisplay`

2. `src/features/search/components/PriceDisplay.tsx`
   - Créer le composant avec logique par sale_type

3. Optionnel : `src/features/admin/infrastructure/scrapingRepo.ts`
   - Enrichir `coupon_details` si plusieurs longueurs disponibles

---

## 5. Conséquences

### Positives

1. ✅ Admin informé du modèle de vente avant scraping
2. ✅ Meilleure UX pour produits hybrid (2 prix visibles)
3. ✅ Comparaison de prix facilitée pour les designers
4. ✅ Cohérence entre Discovery et Scraping

### Négatives

1. ⚠️ Légère augmentation temps Discovery (analyse échantillon)
2. ⚠️ UI cards plus complexe pour hybrid
3. ⚠️ Logique conditionnelle selon sale_type

### Risques

1. 🟡 Détection incorrecte si échantillon non représentatif
2. 🟡 Nouveaux sites peuvent avoir des patterns non reconnus
3. 🟢 Atténué par le fallback "unknown" et option override

---

## 6. Métriques de Succès

| Métrique | Avant | Après |
|----------|-------|-------|
| Sale type connu au Discovery | 0% | 100% |
| Confiance détection | N/A | >80% moyenne |
| Affichage 2 prix hybrid | Non | Oui |
| Temps moyen Discovery | ~3s | ~4s (+1s acceptable) |

---

## 7. Références

- ADR-025 : Admin Architecture Clarification (Variant Analysis)
- ADR-024 : Textile Standard System
- SESSION_20_VARIANT_ANALYSIS.md

---

**Status** : Proposé → En attente validation  
**Prochaine action** : Implémenter Phase 1 (détection Discovery)  
**Auteur** : Thomas  
**Date** : 9 Janvier 2026
