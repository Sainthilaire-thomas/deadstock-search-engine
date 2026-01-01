# Synthèse : Données Textiles pour Designers

**Date** : 1 Janvier 2026  
**Contexte** : MVP Demo - Définition des informations essentielles

---

## 📋 Ce qui a été documenté

### ADR-009 : Stratégie d'Internationalisation
**Décisions clés** :
- ✅ **Normalisation multilingue** : FR/EN/ES → EN (stockage)
- ✅ **Affichage par pays** : JSONB translations {"fr": "...", "en": "...", "es": "..."}
- ✅ **Schema DB i18n-ready** : `source_locale`, `translations`
- ⏸️ Phase 0 complète (architecture), Phase 1-2 en attente

**Impact pour Designer** :
- Les noms/descriptions peuvent être dans leur langue
- Attributs normalisés toujours en anglais (fiber: "silk", color: "blue")
- Affichage UI dans la langue choisie

### ADR-010 : Système d'Attributs Dynamiques
**Décisions clés** :
- ✅ **4 catégories MVP** : Fiber, Color, Weave, Pattern
- ✅ **Système extensible** : Catégories en DB, pas en code
- ✅ **Hiérarchie** : Weave > Twill > Herringbone Twill
- ⏸️ **Future catégories** : Finish, Properties, Weight, Use (Phase 3-4)

**Impact pour Designer** :
- Recherche par 4 critères essentiels
- Distinction claire : Twill = Weave (pas Pattern)
- Extensible sans changer le code

### ADR-006 : Enrichissement Contexte Produit
**Décisions clés** :
- ✅ **Métadonnées produit** : image_url, source_url, product_id
- ✅ **Format JSON** : Contexte enrichi dans unknowns

**Impact pour Designer** :
- Voir l'image du produit
- Lien vers la source originale
- Vérification visuelle

---

## 🎯 Données Actuellement Disponibles (En Base)

### ✅ Disponible et Normalisé
| Donnée | Colonne DB | Type | Exemple | Essentiel |
|--------|-----------|------|---------|-----------|
| **Prix** | `price` | DECIMAL | 24.50 EUR | ✅ Critique |
| **Quantité** | `quantity` | DECIMAL | 5.0 | ✅ Critique |
| **Unité** | `unit` | TEXT | "m", "yard", "unit" | ✅ Critique |
| **Matière** | `material_type` | TEXT | "silk", "cotton" | ✅ Critique |
| **Couleur** | `color` | TEXT | "blue", "red" | ✅ Critique |
| **Pattern** | `pattern` | TEXT | "solid", "striped" | ✅ Important |
| **Weave** | `weave` | TEXT | "twill", "satin" | ✅ Important |
| **Titre** | `title` | TEXT | "Crepe de Chine 100% Soie" | ✅ Important |
| **Description** | `description` | TEXT | "Découvrez..." | 🟡 Utile |
| **Image** | `image_url` | TEXT | https://... | 🟡 Utile |
| **Source** | `source_url` | TEXT | https://... | 🟡 Utile |
| **Tags** | `tags` | TEXT[] | ["vintage", "luxury"] | 🟢 Contexte |

### ❌ Manquant et CRITIQUE
| Donnée | Pourquoi critique | Impact |
|--------|------------------|--------|
| **Largeur tissu** | Calcul métrage impossible | ⛔ BLOQUANT calculateur |
| **Composition %** | Ex: "80% cotton 20% elastane" | 🔴 Qualité du choix |
| **Poids/Grammage** | Ex: 150g/m² | 🔴 Type de vêtement |
| **Min. commande** | Ex: 1m minimum | 🟡 Contraintes achat |

### 🔄 Dans extracted JSONB (Non exploité)
```json
{
  "materials": ["soie"],
  "colors": ["rouge", "bordeaux"],
  "patterns": ["uni"],
  "raw_title": "Crepe de Chine 100% Soie - Rouge Bordeaux",
  "composition": "100% Soie"  // ← EXISTE mais pas normalisé
}
```

**Action** : Parser `extracted.composition` pour avoir la composition détaillée

---

## 💡 Proposition : Données Designer View

### Niveau 1 : Décision d'Achat (MUST HAVE)
```typescript
interface DesignerCriticalInfo {
  // Prix
  price: number;
  currency: string;
  
  // Disponibilité
  quantity: number;
  unit: string;           // "m", "yard"
  minOrder?: number;      // ❌ MANQUANT
  
  // Matière
  fiber: string;          // "silk", "cotton"
  composition?: string;   // ❌ MANQUANT (existe dans extracted)
  
  // Couleur
  color: string;
  
  // Image
  imageUrl: string;
}
```

### Niveau 2 : Validation du Choix (SHOULD HAVE)
```typescript
interface DesignerValidationInfo {
  // Construction
  weave?: string;         // ✅ EXISTE
  pattern?: string;       // ✅ EXISTE
  
  // Dimensions
  width?: number;         // ❌ MANQUANT CRITIQUE
  
  // Caractéristiques
  weight?: number;        // ❌ MANQUANT
  weightUnit?: string;    // "g/m²"
  
  // Propriétés
  stretch?: boolean;      // ❌ MANQUANT
  opacity?: string;       // ❌ MANQUANT
}
```

### Niveau 3 : Contexte (NICE TO HAVE)
```typescript
interface DesignerContextInfo {
  description: string;
  tags: string[];
  sourceUrl: string;
  sourcePlatform: string;
  suggestedUse?: string[];  // ["shirting", "dress"]
}
```

---

## 🔧 Actions Requises

### Court Terme (MVP Demo - Maintenant)

#### 1. Affichage Propre des Données Existantes ✅
**Priorité** : HAUTE  
**Temps** : 2h

**Actions** :
- Masquer "unit" quand valeur = "unit" (afficher juste le nombre)
- Traduire unités : "m" → "mètre(s)", "yard" → "yard(s)"
- Formater prix : 24.50 EUR → "24,50 €"
- Afficher composition depuis `extracted` si disponible

**Fichiers** :
- `src/components/textile/TextileCard.tsx` (nouveau)
- `src/components/search/TextileGrid.tsx` (update)

#### 2. Extraire Composition du JSONB `extracted` ✅
**Priorité** : HAUTE  
**Temps** : 1h

**Query exemple** :
```sql
SELECT 
  id,
  title,
  extracted->>'composition' as composition
FROM textiles
WHERE extracted->>'composition' IS NOT NULL;
```

#### 3. Créer Disclaimer Métrage ⚠️
**Priorité** : MOYENNE  
**Temps** : 30min

```tsx
<Alert variant="warning">
  ⚠️ Calcul basé sur une largeur standard de 140cm.
  Vérifiez la largeur réelle avant de commander.
</Alert>
```

### Moyen Terme (Phase 2 - Post MVP)

#### 4. Migration DB : Ajouter Colonnes Manquantes
**Priorité** : HAUTE  
**Temps** : 1 jour

```sql
ALTER TABLE textiles
  ADD COLUMN width_cm INT,
  ADD COLUMN weight_gsm INT,
  ADD COLUMN min_order_quantity DECIMAL(10,2),
  ADD COLUMN composition TEXT,
  ADD COLUMN stretch BOOLEAN DEFAULT false;
```

#### 5. Enrichir Scraping
**Priorité** : HAUTE  
**Temps** : 2-3 jours

Mettre à jour adapters pour extraire :
- Largeur (regex: "140cm", "150cm wide")
- Poids (regex: "200g/m²", "150gsm")
- Composition (déjà dans extracted, juste normaliser)

---

## 📊 Mapping Unités (Pour Affichage)

### Quantités
```typescript
const UNIT_DISPLAY = {
  'm': 'mètre(s)',
  'meter': 'mètre(s)',
  'yard': 'yard(s)',
  'kg': 'kg',
  'unit': '', // Masquer
} as const;
```

### Poids
```typescript
const WEIGHT_DISPLAY = {
  'gsm': 'g/m²',
  'g/m2': 'g/m²',
  'oz/yd2': 'oz/yd²',
} as const;
```

---

## 🎨 Affichage Designer (Wireframe)

### Card Produit (Liste)
```
┌─────────────────────────────────┐
│  [IMAGE]                        │
│                                 │
│  Crepe de Chine 100% Soie      │
│  🧵 Silk  🎨 Red  🔷 Solid     │
│                                 │
│  5m disponibles                 │
│  24,50 €/m                      │
│                                 │
│  Source: thefabricsales.com    │
└─────────────────────────────────┘
```

### Page Détail (Full)
```
┌────────────────────────────────────────┐
│  [IMAGES CAROUSEL]                     │
│                                        │
│  Crepe de Chine 100% Soie - Rouge     │
│  24,50 €/mètre                         │
│                                        │
│  📦 Stock: 5 mètres disponibles        │
│                                        │
│  📏 Caractéristiques:                  │
│  • Composition: 100% Soie              │
│  • Couleur: Rouge (normalisé)          │
│  • Tissage: Crepe                      │
│  • Motif: Uni                          │
│  • Largeur: 140cm ⚠️ (estimation)     │
│                                        │
│  📖 Description:                       │
│  Découvrez ce magnifique...            │
│                                        │
│  🔗 Voir sur thefabricsales.com       │
│  [AJOUTER AU PANIER]                   │
└────────────────────────────────────────┘
```

---

## ✅ Décisions pour MVP Demo

### Ce qu'on AFFICHE (données disponibles)
1. ✅ Prix (formaté avec devise)
2. ✅ Quantité + Unité (intelligemment formatée)
3. ✅ Matière (fiber)
4. ✅ Couleur (color)
5. ✅ Tissage (weave) - si disponible
6. ✅ Motif (pattern) - si disponible
7. ✅ Image
8. ✅ Lien source
9. ✅ Composition (extraite du JSONB si dispo)

### Ce qu'on MASQUE (données manquantes)
1. ❌ Largeur tissu (pas en DB)
2. ❌ Poids/grammage (pas en DB)
3. ❌ Minimum commande (pas en DB)

### Ce qu'on INDIQUE (disclaimers)
1. ⚠️ Calculateur métrage : "Basé sur largeur standard 140cm"
2. ⚠️ Vérifier les détails sur le site source

---

## 🚀 Next Steps

**Immédiat (aujourd'hui)** :
1. Créer composant `TextileCard` avec formatage propre
2. Ajouter utils `formatPrice()`, `formatQuantity()`, `formatUnit()`
3. Extraire composition du JSONB `extracted`

**Cette semaine (MVP Demo)** :
1. Page détail textile avec toutes les infos disponibles
2. Calculateur métrage avec disclaimer largeur
3. Affichage composition quand disponible

**Post-MVP (Phase 2)** :
1. Migration DB : colonnes width, weight, composition
2. Enrichissement scraping
3. Normalisation composition

---

**Status** : 📝 Spécification complète  
**Prochaine action** : Créer composant TextileCard avec bon formatage
