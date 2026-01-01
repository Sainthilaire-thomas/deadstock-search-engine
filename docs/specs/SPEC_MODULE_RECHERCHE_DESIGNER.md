# SPEC : Module Recherche Designer

**Date** : 1 Janvier 2026  
**Version** : 1.0  
**Status** : 📝 Draft - À valider  
**Auteur** : Thomas

---

## 🎯 Objectif du Module

Permettre aux **designers textiles** de :
1. **Trouver** des textiles deadstock rapidement
2. **Comparer** les options disponibles
3. **Évaluer** si le textile convient à leur projet
4. **Calculer** le métrage nécessaire
5. **Sauvegarder** et organiser leurs trouvailles

---

## 📱 Pages & Fonctionnalités

### 1. PAGE RECHERCHE (`/search`)

#### 1.1 Barre de Recherche Principale
**Composant** : `SearchBar`

**Fonctionnalités** :
- ✅ **Recherche texte libre** : "soie bleue", "coton bio stretch"
- ✅ **Auto-complétion** : Suggère matières, couleurs pendant la saisie
- ⏳ **Recherche vocale** (Phase 2)
- ⏳ **Recherche visuelle** : Upload image → trouve similaires (Phase 3)

**Champs recherchés** :
```sql
- name (titre produit)
- description
- material_type
- color
- pattern
- tags
```

**Exemples requêtes** :
- "soie rouge" → Material: silk + Color: red
- "coton stretch" → Material: cotton + Properties: stretch
- "tissu robe" → Use: dress

---

#### 1.2 Filtres Latéraux
**Composant** : `Filters`

##### 🧵 Matière (Fiber)
**Type** : Checkboxes multiples  
**Source** : `attribute_categories` WHERE slug='fiber'

**Valeurs disponibles** (exemples) :
- [ ] Silk
- [ ] Cotton  
- [ ] Wool
- [ ] Linen
- [ ] Polyester
- [ ] Viscose
- [ ] Elastane

**Comportement** :
- Multiple sélections = OR logic
- Afficher count produits par option : "Cotton (45)"

---

##### 🎨 Couleur (Color)
**Type** : Checkboxes multiples avec preview couleur  
**Source** : `attribute_categories` WHERE slug='color'

**Valeurs disponibles** (exemples) :
- [ ] 🔴 Red (12)
- [ ] 🔵 Blue (23)
- [ ] ⚫ Black (18)
- [ ] ⚪ White (15)
- [ ] 🟢 Green (8)
- [ ] 🟡 Yellow (6)

**Affichage** :
```tsx
<ColorCheckbox>
  <ColorDot color="#FF0000" />
  <Label>Red</Label>
  <Count>(12)</Count>
</ColorCheckbox>
```

---

##### 🔷 Motif (Pattern)
**Type** : Checkboxes multiples  
**Source** : `attribute_categories` WHERE slug='pattern'

**Valeurs disponibles** (exemples) :
- [ ] Solid / Uni
- [ ] Striped / Rayé
- [ ] Floral
- [ ] Geometric
- [ ] Polka Dots

---

##### 🕸️ Tissage (Weave) - 🆕 MVP
**Type** : Checkboxes multiples  
**Source** : `attribute_categories` WHERE slug='weave'

**Valeurs disponibles** (exemples) :
- [ ] Plain
- [ ] Twill
- [ ] Satin
- [ ] Jersey
- [ ] Crepe

**Pourquoi important** : Différencie structure du tissu (critique pour designers)

---

##### 💰 Prix
**Type** : Slider range  
**Unité** : €/mètre

**Interface** :
```
Prix par mètre
[====●========●====] 
5€              50€
```

**Valeurs** :
- Min : 0€
- Max : 100€ (ou dynamic max)
- Step : 1€

---

##### 📏 Quantité Disponible
**Type** : Input min + Checkbox "Seulement grandes quantités"

**Interface** :
```
Quantité minimum
[____] mètres

[ ] Seulement grandes quantités (>10m)
```

**Logique** :
```sql
WHERE quantity_value >= :min_quantity
AND (NOT :large_only OR quantity_value >= 10)
```

---

##### 🏷️ Propriétés (Future - Phase 2)
**Type** : Checkboxes  
**Source** : `attribute_categories` WHERE slug='properties'

**Exemples** :
- [ ] Stretch
- [ ] Waterproof
- [ ] Breathable
- [ ] Transparent

---

##### 📍 Localisation Fournisseur (Future - Phase 3)
**Type** : Dropdown  
**Source** : `supplier_location`

**Exemples** :
- [ ] France
- [ ] UK
- [ ] Espagne
- [ ] Italie

---

#### 1.3 Affichage Résultats
**Composant** : `TextileGrid`

**Layout** : Grille responsive
- Desktop : 3 colonnes
- Tablet : 2 colonnes  
- Mobile : 1 colonne

**Card Produit** :
```
┌─────────────────────────┐
│  [IMAGE 300x300]        │
│                         │
│  Titre Produit          │
│  🧵 Cotton  🎨 Blue     │
│  🔷 Solid               │
│                         │
│  5m disponibles         │
│  24,50 €/m              │
│                         │
│  📍 thefabricsales.com  │
│                         │
│  [❤️ Favoris] [👁️ Voir]│
└─────────────────────────┘
```

**Informations affichées** :
1. **Image** : `image_url` (fallback placeholder si null)
2. **Titre** : `name`
3. **Badges attributs** :
   - Matière : `material_type`
   - Couleur : `color`
   - Motif : `pattern` (si disponible)
4. **Quantité** : `quantity_value` + `quantity_unit`
5. **Prix** : `price_value` + `price_currency` / `quantity_unit`
6. **Source** : `source_platform`
7. **Actions** :
   - ❤️ Ajouter aux favoris
   - 👁️ Voir détail

**Tri** :
- Par défaut : Plus récent (created_at DESC)
- Options futures : Prix croissant/décroissant, Popularité

**Pagination** :
- Infinite scroll OU
- Pagination classique (20 par page)

---

### 2. PAGE DÉTAIL PRODUIT (`/textiles/[id]`)

#### 2.1 Layout
```
┌────────────────────────────────────────────┐
│  Breadcrumb: Recherche > Cotton > [Produit]│
├────────────────────────────────────────────┤
│                                            │
│  [GALERIE IMAGES]     │  INFORMATIONS     │
│                       │                    │
│  Image principale     │  Titre complet    │
│  [Vignettes...]       │                   │
│                       │  Prix + Quantité  │
│                       │                   │
│                       │  [❤️] [🛒 ACHETER]│
│                       │                   │
├───────────────────────┴───────────────────┤
│                                            │
│  📋 CARACTÉRISTIQUES DÉTAILLÉES           │
│                                            │
│  🧵 Composition      📏 Dimensions        │
│  🎨 Couleur          ⚖️ Poids             │
│  🔷 Motif            📦 Minimum commande  │
│  🕸️ Tissage          ✅ Certifications    │
│                                            │
├────────────────────────────────────────────┤
│                                            │
│  📖 DESCRIPTION COMPLÈTE                  │
│  [Texte description]                       │
│                                            │
├────────────────────────────────────────────┤
│                                            │
│  🔗 SOURCE & FOURNISSEUR                  │
│  Platform: thefabricsales.com             │
│  [Voir sur le site source] 🔗             │
│                                            │
├────────────────────────────────────────────┤
│                                            │
│  💡 PRODUITS SIMILAIRES                   │
│  [Card] [Card] [Card] [Card]              │
│                                            │
└────────────────────────────────────────────┘
```

---

#### 2.2 Sections Détaillées

##### 🖼️ Galerie Images
**Source** : `image_url` + `additional_images[]`

**Fonctionnalités** :
- Image principale (grande taille)
- Vignettes cliquables (si additional_images)
- Zoom au hover/click
- Navigation prev/next

---

##### 📊 Bloc Informations Principales
**Composant** : `ProductInfo`

**Contenu** :
```tsx
<h1>{name}</h1>

<PriceBlock>
  <Price>24,50 €</Price>
  <Unit>/ mètre</Unit>
</PriceBlock>

<StockInfo>
  <Icon>📦</Icon>
  <Text>5 mètres disponibles</Text>
  {minimum_order_value && (
    <MinOrder>Commande minimum : {minimum_order_value}m</MinOrder>
  )}
</StockInfo>

<Actions>
  <Button variant="secondary">❤️ Ajouter aux favoris</Button>
  <Button variant="primary" href={source_url}>
    🛒 Acheter sur {source_platform}
  </Button>
</Actions>
```

---

##### 📋 Caractéristiques Détaillées
**Composant** : `ProductSpecs`

**Tableau avec toutes les données disponibles** :

| Caractéristique | Valeur | Source DB |
|----------------|--------|-----------|
| **Composition** | 100% Silk | `composition` JSONB |
| **Matière principale** | Silk | `material_type` |
| **Couleur** | Blue | `color` |
| **Motif** | Solid | `pattern` |
| **Tissage** | Crepe | `weave` (via textile_attributes) |
| **Largeur** | 140 cm | `width_value` + `width_unit` |
| **Poids** | 150 g/m² | `weight_value` + `weight_unit` |
| **Certifications** | Oeko-Tex | `certifications[]` |

**Affichage conditionnel** :
- Si donnée manquante → Ne pas afficher la ligne OU afficher "Non spécifié"
- Highlight données importantes (composition, dimensions)

**Disclaimer pour données manquantes** :
```tsx
{!width_value && (
  <Alert variant="info">
    ⚠️ Largeur non spécifiée. Vérifiez sur le site source avant commande.
  </Alert>
)}
```

---

##### 📖 Description
**Source** : `description`

**Affichage** :
- Texte formaté (line breaks respectés)
- Truncate si > 500 caractères → "Lire plus"

---

##### 🔗 Source & Fournisseur
**Composant** : `SourceInfo`

**Contenu** :
```tsx
<SourceCard>
  <Platform>{source_platform}</Platform>
  {supplier_name && <Supplier>Fournisseur : {supplier_name}</Supplier>}
  {supplier_location && <Location>📍 {supplier_location}</Location>}
  
  <Link href={source_url} external>
    Voir le produit sur {source_platform} 🔗
  </Link>
</SourceCard>
```

---

##### 💡 Produits Similaires (Future - Phase 2)
**Logique** :
```sql
SELECT * FROM textiles
WHERE 
  id != :current_id
  AND material_type = :current_material
  AND color SIMILAR TO :current_color
  AND available = true
ORDER BY similarity DESC
LIMIT 4
```

**Affichage** : Même cards que grille recherche

---

### 3. CALCULATEUR MÉTRAGE (`/tools/yardage-calculator`)

#### 3.1 Objectif
Calculer le métrage exact nécessaire pour un projet.

#### 3.2 Interface
```
┌────────────────────────────────────────────┐
│  📏 Calculateur de Métrage                 │
├────────────────────────────────────────────┤
│                                            │
│  1️⃣ Type de vêtement                      │
│  [Dropdown : Robe, Jupe, Pantalon...]     │
│                                            │
│  2️⃣ Taille                                │
│  [Dropdown : XS, S, M, L, XL, XXL]        │
│                                            │
│  3️⃣ Quantité à produire                   │
│  [Input number] pièce(s)                   │
│                                            │
│  4️⃣ Largeur du tissu                      │
│  [Input] cm                                │
│  💡 Généralement 140cm ou 150cm           │
│                                            │
│  [CALCULER]                                │
│                                            │
├────────────────────────────────────────────┤
│  ✅ RÉSULTAT                               │
│                                            │
│  Métrage nécessaire : 3,5 mètres          │
│  + Marge sécurité (10%) : 0,35 m          │
│  ─────────────────────────────────         │
│  TOTAL : 3,85 mètres                       │
│                                            │
│  💡 Nous recommandons d'acheter 4 mètres  │
│                                            │
│  [CHERCHER DES TISSUS]                     │
└────────────────────────────────────────────┘
```

---

#### 3.3 Formules de Calcul (Simplifiées MVP)

**Base de données de formules** :
```typescript
const YARDAGE_FORMULAS = {
  dress: {
    XS: 2.5, S: 2.8, M: 3.0, L: 3.2, XL: 3.5, XXL: 3.8
  },
  skirt: {
    XS: 1.2, S: 1.3, M: 1.4, L: 1.5, XL: 1.6, XXL: 1.7
  },
  pants: {
    XS: 1.8, S: 2.0, M: 2.2, L: 2.4, XL: 2.6, XXL: 2.8
  },
  shirt: {
    XS: 1.5, S: 1.6, M: 1.7, L: 1.8, XL: 1.9, XXL: 2.0
  },
  jacket: {
    XS: 2.2, S: 2.4, M: 2.6, L: 2.8, XL: 3.0, XXL: 3.2
  }
};
```

**Calcul** :
```typescript
function calculateYardage(garmentType, size, quantity, fabricWidth = 140) {
  const baseYardage = YARDAGE_FORMULAS[garmentType][size];
  
  // Ajustement selon largeur tissu
  const widthFactor = fabricWidth < 140 ? 1.1 : 1.0;
  
  // Métrage pour une pièce
  const perGarment = baseYardage * widthFactor;
  
  // Total
  const total = perGarment * quantity;
  
  // Marge sécurité 10%
  const margin = total * 0.1;
  
  // Recommandation arrondie
  const recommended = Math.ceil((total + margin) * 2) / 2; // Arrondi 0.5m
  
  return {
    perGarment,
    total,
    margin,
    recommended
  };
}
```

---

#### 3.4 Features Futures (Phase 2-3)
- ⏳ **Import patron PDF** : IA extrait dimensions automatiquement
- ⏳ **Calcul avec chutes** : Optimisation placement pièces
- ⏳ **Multi-tissus** : Doublure + tissu principal
- ⏳ **Historique projets** : Sauvegarder calculs

---

### 4. FAVORIS (`/favorites`)

#### 4.1 Objectif
Sauvegarder textiles pour consultation ultérieure.

#### 4.2 Interface
```
┌────────────────────────────────────────────┐
│  ❤️ Mes Favoris (12)                       │
├────────────────────────────────────────────┤
│                                            │
│  [Tri : Plus récent ▼]  [Vue : Grille ▼] │
│                                            │
│  [Card] [Card] [Card]                     │
│  [Card] [Card] [Card]                     │
│                                            │
│  💡 Créez des collections pour organiser  │
│     vos favoris (Phase 2)                 │
└────────────────────────────────────────────┘
```

#### 4.3 Fonctionnalités
- ✅ **Ajouter/Retirer favoris** : Bouton ❤️ sur cards
- ✅ **Liste favoris** : Tous les textiles sauvegardés
- ⏳ **Collections** : Organiser par projet (Phase 2)
- ⏳ **Notes privées** : Ajouter notes sur textile (Phase 3)

---

## 🎨 Composants UI Réutilisables

### `TextileCard`
**Usage** : Grille recherche, favoris, similaires

**Props** :
```typescript
interface TextileCardProps {
  textile: Textile;
  showFavorite?: boolean;
  onFavoriteClick?: (id: string) => void;
}
```

---

### `SearchBar`
**Props** :
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
}
```

---

### `Filters`
**Props** :
```typescript
interface FiltersProps {
  availableFilters: AvailableFilters;
  currentFilters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}
```

---

## 🔄 Flux Utilisateur Typique

### Scénario : Trouver tissu pour une robe

1. **Arrivée** → `/search`
2. **Recherche** : Tape "soie bleue"
3. **Filtrage** : 
   - Matière : Silk ✓
   - Couleur : Blue ✓
   - Prix : 20-40€
4. **Parcours résultats** : 15 produits trouvés
5. **Consultation détail** : Click sur textile intéressant
6. **Évaluation** :
   - Quantité suffisante ? ✓ 5m
   - Prix acceptable ? ✓ 28€/m
   - Composition correcte ? ✓ 100% Silk
7. **Calcul métrage** : Click "Calculer métrage"
   - Type : Robe
   - Taille : M
   - Quantité : 1
   → Besoin : 3m ✓ (assez de stock)
8. **Décision** :
   - **Option A** : ❤️ Ajouter favoris (réfléchir)
   - **Option B** : 🛒 Acheter maintenant (vers source)

---

## 📊 Métriques de Succès

### KPIs Recherche
- **Taux de conversion recherche** : % users qui trouvent ≥1 résultat
- **Nombre moyen de résultats** : Par recherche
- **Taux d'utilisation filtres** : % searches avec filtres
- **Taux de click-through** : % résultats → détail

### KPIs Engagement
- **Favoris moyens** : Par utilisateur
- **Retour sur site** : Taux utilisateurs revenant
- **Utilisation calculateur** : % users utilisant
- **Click vers source** : % détails → achat externe

---

## 🚀 Priorisation Features

### ✅ MVP Demo (Semaine 1-2)
1. Page recherche avec filtres de base
2. Grille résultats
3. Page détail produit
4. Calculateur métrage simple

### ⏳ Phase 2 (M2-M3)
1. Favoris avancés (collections)
2. Recherche visuelle
3. Import patron PDF
4. Produits similaires

### ⏳ Phase 3 (M4-M6)
1. Alertes nouveautés
2. Historique achats
3. Notes privées
4. Partage collections

---

**Status** : 📝 Draft  
**Prochaine étape** : Validation avec Thomas → Création SPEC Admin
