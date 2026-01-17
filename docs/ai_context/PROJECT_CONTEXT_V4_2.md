# Deadstock Search Engine - Contexte Technique V4.2

**Dernière MAJ** : 17 Janvier 2026  
**Version** : 4.2

---

## 🎯 Résumé Projet

Plateforme B2B SaaS agrégeant les inventaires de tissus deadstock de multiples fournisseurs dans une interface de recherche unifiée pour créateurs de mode indépendants.

| Métrique | Valeur |
|----------|--------|
| MVP Phase 1 | ~98% |
| Textiles indexés | 268 |
| Sources actives | 4 (MLC, Nona Source, TFS, Recovo) |

---

## 🛠️ Stack Technique

```
Frontend : Next.js 16.1.1, React 19, TypeScript, Tailwind CSS
Backend  : Supabase PostgreSQL (schema: deadstock)
Auth     : Sessions anonymes (cookies HTTP-only)
Pattern  : Light DDD avec feature modules
Icons    : Lucide React (outline style)
```

---

## 📁 Structure Projet

### Côté Utilisateur (Designer)

```
src/
├── app/(main)/
│   ├── search/              # Recherche textiles
│   ├── favorites/           # Favoris
│   ├── textiles/[id]/       # Détail textile
│   └── boards/[boardId]/    # Board canvas
│       ├── layout.tsx       # Layout partagé avec BoardLayoutClient
│       ├── page.tsx         # Vue Board (canvas)
│       └── journey/
│           └── page.tsx     # Vue Journey (liste par type)
│
├── app/api/
│   ├── search/
│   │   ├── route.ts              # Recherche principale
│   │   └── contextual/route.ts   # Recherche contextuelle (B2)
│   └── colors/
│       └── available/route.ts    # Couleurs disponibles (B3.5)
│
├── components/search/
│   ├── TextileGrid.tsx      # Grille résultats
│   ├── PriceDisplay.tsx     # Affichage prix selon sale_type
│   ├── Filters.tsx          # Filtres dynamiques
│   └── YardageFilterBadge.tsx
│
├── lib/color/               # Module couleur (B1)
│   ├── colorConversion.ts   # Conversions HEX/RGB/LAB
│   ├── colorMatching.ts     # Algorithme matching LAB
│   ├── databaseColors.ts    # 18 couleurs de référence
│   └── index.ts             # Exports
│
├── features/
│   ├── search/              # Recherche & filtres
│   │   ├── domain/types.ts
│   │   ├── application/searchTextiles.ts
│   │   └── infrastructure/textileRepository.ts
│   │
│   ├── favorites/           # Gestion favoris
│   │   ├── context/FavoritesContext.tsx
│   │   └── components/FavoriteButton.tsx
│   │
│   ├── boards/              # Module boards complet
│   │   ├── components/
│   │   │   ├── BoardCanvas.tsx           # Canvas principal
│   │   │   ├── BoardToolbar.tsx          # Barre outils gauche (création)
│   │   │   ├── BoardLayoutClient.tsx     # Wrapper layout détection vue
│   │   │   ├── SharedBoardHeader.tsx     # Header partagé Board/Journey
│   │   │   ├── ViewToggle.tsx            # Toggle Board/Journey + dropdown
│   │   │   ├── ElementCard.tsx           # Carte élément générique
│   │   │   ├── ZoneCard.tsx              # Carte zone
│   │   │   ├── PaletteEditor.tsx         # Modal édition palette
│   │   │   ├── ImageUploadModal.tsx      # Modal image
│   │   │   ├── VideoModal.tsx            # Modal vidéo
│   │   │   ├── LinkModal.tsx             # Modal lien
│   │   │   ├── PdfModal.tsx              # Modal PDF
│   │   │   ├── PatternModal.tsx          # Modal patron
│   │   │   ├── SilhouetteModal.tsx       # Modal silhouette
│   │   │   │
│   │   │   │── # Sprint B3 - Recherche contextuelle
│   │   │   ├── ContextualSearchPanel.tsx     # Panneau latéral recherche
│   │   │   ├── ConstraintToggleButton.tsx    # Bouton 🔍 sur éléments
│   │   │   ├── ColorPickerPopover.tsx        # Sélection couleur catalogue
│   │   │   ├── SearchFiltersCompact.tsx      # Filtres avancés accordéon
│   │   │   │
│   │   │   └── elements/             # Composants d'affichage
│   │   │       ├── PaletteElement.tsx
│   │   │       ├── ImageElement.tsx
│   │   │       ├── VideoElement.tsx
│   │   │       └── LinkElement.tsx
│   │   │
│   │   ├── context/
│   │   │   ├── BoardContext.tsx
│   │   │   └── ContextualSearchContext.tsx   # État contraintes (B3)
│   │   │
│   │   ├── hooks/
│   │   │   └── useContextualSearch.ts        # Hook recherche (B2)
│   │   │
│   │   └── domain/types.ts
│   │
│   └── journey/             # Module Journey (vue par type)
│       ├── components/
│       │   ├── JourneyClientWrapper.tsx  # Wrapper client principal
│       │   ├── JourneyNavigation.tsx     # Sidebar navigation phases/types
│       │   ├── OrderForm.tsx             # Formulaire commande
│       │   └── views/
│       │       └── TextileJourneyView.tsx
│       │
│       └── config/
│           └── steps.ts      # Configuration phases et types
```

### Côté Admin

```
src/
├── app/admin/
│   ├── discovery/[slug]/      # Analyse site Shopify
│   ├── sites/[id]/configure/  # Config scraping
│   ├── tuning/                # Gestion unknowns
│   └── jobs/                  # Jobs scraping
│
├── features/admin/
│   ├── services/
│   │   ├── scrapingService.ts    # Orchestration scraping
│   │   └── discoveryService.ts   # Analyse sites Shopify
│   ├── infrastructure/
│   │   └── scrapingRepo.ts       # Persistence + normalisation
│   └── utils/
│       ├── variantAnalyzer.ts    # Analyse variants Shopify
│       ├── saleTypeDetector.ts   # Détection sale_type
│       └── extractTerms.ts       # Extraction depuis tags
```

---

## 🗄️ Base de Données (Schema: deadstock)

### Tables Principales

| Table | Description | Rows |
|-------|-------------|------|
| `textiles` | Produits scrapés | 268 |
| `textile_attributes` | Attributs EAV (fiber, color, pattern, weave) | ~800 |
| `dictionary_mappings` | Normalisation termes | 256 |
| `sites` | Sources configurées | 4 |
| `site_profiles` | Résultats Discovery | 4 |
| `boards` | Boards utilisateur | - |
| `board_elements` | Éléments sur boards | - |
| `board_zones` | Zones sur boards | - |

### Vue Matérialisée

```sql
textiles_search  -- Vue optimisée pour recherche (~3ms)
-- Colonnes: id, name, price, fiber, color, pattern, weave, 
--           available, site_name, price_per_meter, sale_type...
```

### Couleurs Disponibles (via API)

```
blue (46), beige (38), black (17), white (15), pink (11), 
gray (11), brown (8), green (8), gold (7), red (7), 
yellow (5), burgundy (3), purple (3), lilac (2), 
orange (2), dark gray (1)
```

---

## 🎨 Types TypeScript Clés

### ElementType (Boards)

```typescript
type ElementType = 
  | 'textile' | 'palette' | 'inspiration' | 'calculation' | 'note'
  | 'video' | 'link'
  | 'pdf' | 'pattern' | 'silhouette';
```

### Contraintes Recherche Contextuelle (B3)

```typescript
interface ColorConstraint {
  type: 'color';
  sourceElementId: string;
  sourceElementName: string;
  hex: string;
  colorNames: string[];
}

interface QuantityConstraint {
  type: 'quantity';
  sourceElementId: string;
  sourceElementName: string;
  meters: number;
  width?: number;
}

interface MaterialConstraint {
  type: 'material';
  sourceElementId: string;
  sourceElementName: string;
  fiber?: string;
  weave?: string;
}

type Constraint = ColorConstraint | QuantityConstraint | MaterialConstraint;
```

### SearchConstraints (API)

```typescript
interface SearchConstraints {
  hex?: string;
  colorNames?: string[];
  minConfidence?: number;
  fiber?: string;
  weave?: string;
  pattern?: string;
  minQuantity?: number;
  includeCutToOrder?: boolean;
}
```

### Sale Types (Textiles)

```typescript
type SaleType = 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece';
```

---

## ✅ État des Modules

| Module | Status | Notes |
|--------|--------|-------|
| **UTILISATEUR** |
| Search | ✅ 100% | Filtres dynamiques, PriceDisplay unifié |
| Favorites | ✅ 100% | Sync instantanée |
| Textile Detail | ✅ 100% | Page /textiles/[id] |
| Boards Core | ✅ 100% | Canvas, zones, drag & drop |
| Boards Sprint 5 | ✅ 100% | Image, Video, Link |
| Boards Sprint 6 | ✅ 100% | PDF, Pattern, Silhouette |
| Boards Sprint B1-B3 | ✅ 100% | Recherche contextuelle complète |
| Navigation Board/Journey | ✅ 100% | Header partagé, toggle unifié |
| **ADMIN** |
| Discovery | ✅ 98% | Analyse sites Shopify, SaleTypeCard |
| Scraping | ✅ 95% | Variant analysis |
| Tuning | ✅ 90% | Multi-locale FR/EN |

---

## 🔧 APIs Disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/search` | POST | Recherche textiles avec filtres |
| `/api/search/contextual` | POST | Recherche contextuelle (B2) |
| `/api/colors/available` | GET | Couleurs avec count tissus (B3.5) |

---

## 🔧 Commandes Utiles

```powershell
# Dev server
npm run dev

# TypeScript check
npx tsc --noEmit

# Voir un fichier (attention aux crochets)
Get-Content -LiteralPath "src/app/(main)/boards/[boardId]/page.tsx"

# Chercher un fichier par nom
Get-ChildItem -Path "src" -Recurse -Filter "*pattern*" -Name

# Chercher dans le contenu des fichiers
Get-ChildItem -Path "src" -Recurse -Filter "*.tsx" | Select-String -Pattern "searchTerm"

# Voir structure d'un dossier
Get-ChildItem -Path "src/features/boards" -Recurse -Name
```

---

## ⚠️ Instructions pour Claude

### Avant de Modifier du Code

1. **Vérifie le code existant** si tu ne le connais pas :
   ```powershell
   Get-Content -LiteralPath "src/path/to/file.ts"
   ```
2. **Ne suppose jamais** la structure d'un fichier - demande ou vérifie
3. **Procède par petites étapes** - une modification à la fois

### Pendant les Modifications

1. Donne le code **complet du bloc** à modifier (pas juste le diff)
2. Indique clairement **où** dans le fichier (ligne approximative)
3. Format préféré : "Cherche `[code existant]`... Remplace par `[nouveau code]`"
4. Attends confirmation avant l'étape suivante

### Patterns Établis

**Pattern Modal d'Édition** :
```typescript
const [editingXxxId, setEditingXxxId] = useState<string | null>(null);

case 'xxx':
  setEditingXxxId(element.id);
  setIsXxxModalOpen(true);
  break;

initialData={editingXxxId 
  ? elements.find(e => e.id === editingXxxId)?.elementData 
  : undefined}
```

**Pattern Ouverture Fichier Base64** :
```typescript
const blob = new Blob([byteArray], { type: mimeType });
const blobUrl = URL.createObjectURL(blob);
window.open(blobUrl, '_blank');
```

**Pattern Filtres qui étendent (B3.6)** :
```typescript
// Union des couleurs contraintes + filtres additionnels
const combinedColors = [...new Set([...baseColors, ...additionalColors])];
```

---

## 📝 Notes Techniques

### Supabase Schema

Le client server doit spécifier le schema :
```typescript
const { data } = await supabase
  .schema('deadstock')  // ← Obligatoire côté serveur !
  .from('textiles_search')
```

### Navigation Board/Journey

Architecture de navigation unifiée :
- `BoardLayoutClient` : Détecte la vue courante via pathname
- `SharedBoardHeader` : Header identique pour Board et Journey
- `ViewToggle` : Toggle avec dropdown phases/types

```
Vue Board:   [■ Board] [Journey ▾] → dropdown avec phases et types d'éléments
Vue Journey: [Board] [■ Journey]   → pas de dropdown (sidebar suffit)
```

Le dropdown en vue Board permet un accès direct aux types d'éléments :
- Hover sur une phase → sous-menu avec types et compteurs
- Clic sur un type → navigation vers `/journey?type=xxx`

### Toolbar Boards

Outils de création uniquement (navigation Journey retirée vers header) :
- StickyNote (note)
- Palette (couleurs)
- Shirt (tissu depuis favoris)
- Ruler (calcul métrage)
- Image, Video, Link (médias)
- FileText, Scissors, User (documents)
- Search (recherche contextuelle)
- Maximize2/Minimize2 (mode immersif)
- Eye/LayoutGrid (mode vue)
- Square (zone)

### Journey Phases

Configuration dans `src/features/journey/config/steps.ts` :

| Phase | Types d'éléments |
|-------|------------------|
| Mood | inspiration, palette, silhouette, video, link, pdf, note |
| Conception | pattern, calculation, textile |
| Exécution | zones (projets cristallisés) |

### PriceDisplay Format (B3.5)

```
Cut-to-order: "2.38€/m • Coupe à la demande"
Fixed-length: "13.00€/m • Coupon 3m (39€)"
Hybrid: "9.67€/m • Coupon 3m ou coupe"
```

### Couleurs Database (18 couleurs)

```typescript
type ColorName =
  | 'red' | 'blue' | 'green' | 'yellow' | 'orange' | 'pink'
  | 'purple' | 'brown' | 'beige' | 'gray' | 'black' | 'white'
  | 'burgundy' | 'navy' | 'teal' | 'gold' | 'lilac' | 'dark gray';
```
