# Deadstock Search Engine - Contexte Technique V4

**Dernière MAJ** : 11 Janvier 2026  
**Version** : 4.0

---

## 🎯 Résumé Projet

Plateforme B2B SaaS agrégant les inventaires de tissus deadstock de multiples fournisseurs dans une interface de recherche unifiée pour créateurs de mode indépendants.

| Métrique | Valeur |
|----------|--------|
| MVP Phase 1 | ~95% |
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
│
├── components/search/
│   ├── TextileGrid.tsx      # Grille résultats
│   ├── PriceDisplay.tsx     # Affichage prix selon sale_type
│   └── Filters.tsx          # Filtres dynamiques
│
├── features/
│   ├── search/              # Recherche & filtres
│   │   ├── domain/types.ts
│   │   └── infrastructure/textileRepository.ts
│   │
│   ├── favorites/           # Gestion favoris
│   │   ├── context/FavoritesContext.tsx
│   │   └── components/FavoriteButton.tsx
│   │
│   └── boards/              # Module boards complet
│       ├── components/
│       │   ├── BoardCanvas.tsx       # Canvas principal (~1200 lignes)
│       │   ├── BoardToolbar.tsx      # Barre outils gauche (48px)
│       │   ├── ElementCard.tsx       # Carte élément générique
│       │   ├── ZoneCard.tsx          # Carte zone
│       │   ├── PaletteEditor.tsx     # Modal édition palette
│       │   ├── ImageUploadModal.tsx  # Modal image (upload/URL)
│       │   ├── VideoModal.tsx        # Modal vidéo YouTube/Vimeo
│       │   ├── LinkModal.tsx         # Modal lien web
│       │   ├── PdfModal.tsx          # Modal PDF
│       │   ├── PatternModal.tsx      # Modal patron
│       │   ├── SilhouetteModal.tsx   # Modal silhouette
│       │   └── elements/             # Composants d'affichage
│       │       ├── PaletteElement.tsx
│       │       ├── ImageElement.tsx
│       │       ├── VideoElement.tsx
│       │       └── LinkElement.tsx
│       ├── context/BoardContext.tsx
│       └── domain/types.ts
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

---

## 🎨 Types TypeScript Clés

### ElementType (Boards)

```typescript
type ElementType = 
  | 'textile' | 'palette' | 'inspiration' | 'calculation' | 'note'  // Core
  | 'video' | 'link'                    // Sprint 5
  | 'pdf' | 'pattern' | 'silhouette';   // Sprint 6
```

### ElementData par Type

```typescript
// Sprint 5
interface VideoElementData {
  url: string;
  platform: 'youtube' | 'vimeo' | 'other';
  videoId?: string;
  title?: string;
  thumbnailUrl?: string;
}

interface LinkElementData {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  favicon?: string;
}

// Sprint 6
interface PdfElementData {
  url: string;        // base64 data URL
  filename: string;
  pageCount?: number;
}

interface PatternElementData {
  url: string;        // base64 data URL
  name?: string;
  brand?: string;
  fileType: 'pdf' | 'image';
  garmentType?: string;
  sizes?: string[];
}

interface SilhouetteElementData {
  url: string;        // base64 data URL
  name?: string;
  source: 'upload' | 'library';
  category?: string;
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
| Search | ✅ 100% | Filtres dynamiques, PriceDisplay |
| Favorites | ✅ 100% | Sync instantanée |
| Textile Detail | ✅ 100% | Page /textiles/[id] |
| Boards Core | ✅ 100% | Canvas, zones, drag & drop |
| Boards Sprint 5 | ✅ 100% | Image, Video, Link |
| Boards Sprint 6 | ✅ 100% | PDF, Pattern, Silhouette |
| **ADMIN** |
| Discovery | ✅ 98% | Analyse sites Shopify, SaleTypeCard |
| Scraping | ✅ 95% | Variant analysis |
| Tuning | ✅ 90% | Multi-locale FR/EN |

---

## 🔧 Commandes Utiles

```powershell
# Dev server
npm run dev

# TypeScript check
npx tsc --noEmit

# Voir un fichier
Get-Content -Path "src/path/to/file.ts"

# Chercher un fichier par nom
Get-ChildItem -Path "src" -Recurse -Filter "*pattern*" -Name

# Chercher dans le contenu des fichiers
Select-String -Path "src/**/*.ts" -Pattern "searchTerm"

# Voir structure d'un dossier
Get-ChildItem -Path "src/features/boards" -Recurse -Name
```

---

## ⚠️ Instructions pour Claude

### Avant de Modifier du Code

1. **Vérifie le code existant** si tu ne le connais pas :
   ```powershell
   Get-Content -Path "src/path/to/file.ts"
   ```
2. **Ne suppose jamais** la structure d'un fichier - demande ou vérifie
3. **Procède par petites étapes** - une modification à la fois

### Pendant les Modifications

1. Donne le code **complet du bloc** à modifier (pas juste le diff)
2. Indique clairement **où** dans le fichier (ligne approximative)
3. Format préféré : "Cherche `[code existant]`... Remplace par `[nouveau code]`"
4. Attends confirmation avant l'étape suivante

### Patterns Établis (Boards)

**Pattern Modal d'Édition** :
```typescript
// État: toujours ID (string | null), pas Data
const [editingXxxId, setEditingXxxId] = useState<string | null>(null);

// Double-clic: set ID + open modal
case 'xxx':
  setEditingXxxId(element.id);
  setIsXxxModalOpen(true);
  break;

// Modal: initialData via elements.find()
initialData={editingXxxId 
  ? elements.find(e => e.id === editingXxxId)?.elementData 
  : undefined}
```

**Pattern Ouverture Fichier Base64** :
```typescript
// Les navigateurs bloquent window.open() sur data URLs
// Convertir en Blob URL avant ouverture
const blob = new Blob([byteArray], { type: mimeType });
const blobUrl = URL.createObjectURL(blob);
window.open(blobUrl, '_blank');
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

### Toolbar Boards (48px)

Icônes disponibles dans l'ordre :
- MousePointer2 (sélection)
- Square (zone)
- Type (note)
- Palette (couleurs)
- Image (image)
- Video (vidéo)
- Link (lien)
- FileText (PDF)
- Scissors (patron)
- User (silhouette)
- Calculator (calcul) - désactivé
