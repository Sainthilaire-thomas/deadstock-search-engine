# Deadstock Search Engine - Contexte Technique V4.3

**Dernière MAJ** : 18 Janvier 2026  
**Version** : 4.3

---

## 🎯 Résumé Projet

Plateforme B2B SaaS agrégeant les inventaires de tissus deadstock de multiples fournisseurs dans une interface de recherche unifiée pour créateurs de mode indépendants.

| Métrique | Valeur |
|----------|--------|
| MVP Phase 1 | ~100% ✅ |
| Textiles indexés | 268 |
| Sources actives | 4 (MLC, Nona Source, TFS, Recovo) |

---

## 🛠️ Stack Technique

```
Frontend : Next.js 16.1.1, React 19, TypeScript, Tailwind CSS
Backend  : Supabase PostgreSQL (schema: deadstock)
Auth     : Supabase Auth (user-based)
Pattern  : Light DDD avec feature modules
Icons    : Lucide React (outline style)
```

---

## 📁 Structure Projet

### Côté Utilisateur (Designer)

```
src/
├── app/(main)/
│   ├── home/                # Page hub de choix ⭐ NOUVEAU
│   │   └── page.tsx         # Recherche vs Projets
│   ├── search/              # Recherche textiles ⭐ NOUVEAU
│   │   └── page.tsx         # Page dédiée recherche
│   ├── favorites/           # Favoris ⭐ NOUVEAU
│   │   └── page.tsx         # Page dédiée favoris
│   ├── textiles/[id]/       # Détail textile
│   ├── boards/              # Liste des projets
│   │   └── page.tsx
│   └── boards/[boardId]/    # Board canvas
│       ├── layout.tsx       # Layout avec BoardLayoutClient
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
│   ├── SearchInterface.tsx  # Interface recherche complète
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
│   ├── navigation/          # ⭐ NOUVEAU - Navigation globale
│   │   ├── components/
│   │   │   └── MainHeader.tsx    # Header avec nav contextuelle
│   │   └── context/
│   │       └── NavigationContext.tsx  # Retour au board actif
│   │
│   ├── search/              # Recherche & filtres
│   │   ├── domain/types.ts
│   │   ├── application/searchTextiles.ts
│   │   └── infrastructure/textileRepository.ts
│   │
│   ├── favorites/           # Gestion favoris
│   │   ├── context/FavoritesContext.tsx
│   │   ├── components/
│   │   │   ├── FavoriteButton.tsx
│   │   │   ├── FavoritesGrid.tsx
│   │   │   └── FavoritesCountBadge.tsx
│   │   └── actions/favoriteActions.ts
│   │
│   ├── boards/              # Module boards complet
│   │   ├── components/
│   │   │   ├── BoardCanvas.tsx           # Canvas principal
│   │   │   ├── BoardToolbar.tsx          # Barre outils gauche
│   │   │   ├── BoardLayoutClient.tsx     # Wrapper + enregistre board actif
│   │   │   ├── SharedBoardHeader.tsx     # Header partagé Board/Journey
│   │   │   ├── ViewToggle.tsx            # Toggle Board/Journey
│   │   │   ├── ContextualSearchPanel.tsx # Panneau recherche contextuelle
│   │   │   └── elements/                 # Composants d'affichage
│   │   │
│   │   ├── context/
│   │   │   ├── BoardContext.tsx
│   │   │   └── ContextualSearchContext.tsx
│   │   │
│   │   └── hooks/
│   │       └── useContextualSearch.ts
│   │
│   ├── journey/             # Module Journey (vue par type)
│   │   └── components/
│   │       └── JourneyNavigation.tsx
│   │
│   └── auth/                # Authentification
│       ├── components/
│       │   ├── UserMenu.tsx      # Menu avatar avec Admin
│       │   └── LandingHeader.tsx
│       └── context/
│           └── AuthContext.tsx
```

### Côté Admin

```
src/
├── app/admin/
│   ├── discovery/[slug]/      # Analyse site Shopify
│   ├── sites/[id]/configure/  # Config scraping
│   ├── tuning/                # Gestion unknowns
│   ├── dictionary/            # Dictionnaire normalisation
│   └── jobs/                  # Jobs scraping
│
├── features/admin/
│   ├── services/
│   │   ├── scrapingService.ts    # Orchestration scraping
│   │   └── discoveryService.ts   # Analyse sites Shopify
│   └── infrastructure/
│       └── scrapingRepo.ts       # Persistence + normalisation
```

---

## 🗺️ Navigation Globale

### Architecture

```
APRÈS LOGIN → /home (page de choix)
                │
    ┌───────────┴───────────┐
    ▼                       ▼
/search                  /boards
(Recherche directe)      (Mes Projets)
    │                       │
    │                       ▼
    │                  /boards/[id]
    │                  (avec bouton Search header)
    │                       │
    └───────────────────────┘
         ↑ Retour au projet (si actif)
```

### Header Global (MainHeader)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]  [← Retour "Projet X"]?  [Chercher]  [Projets]  [♡7] [👤]│
└─────────────────────────────────────────────────────────────────┘
    │           │                    │           │        │    │
    │           │                    │           │        │    └─ UserMenu (Admin caché)
    │           │                    │           │        └─ FavoritesCountBadge
    │           │                    │           └─ Caché si sur /boards
    │           │                    └─ Caché si sur /search
    │           └─ Visible si activeBoard et hors board
    └─ → /home
```

### Routes Principales

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Landing marketing | Public |
| `/home` | Hub de choix (Recherche vs Projets) | ✅ |
| `/search` | Recherche de tissus | ✅ |
| `/favorites` | Mes favoris | ✅ |
| `/boards` | Liste des projets | ✅ |
| `/boards/[id]` | Canvas d'un projet | ✅ |
| `/boards/[id]/journey` | Vue Journey | ✅ |
| `/textiles/[id]` | Détail textile | ✅ |
| `/settings` | Paramètres | ✅ |
| `/admin/*` | Administration | Admin |

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

## ✅ État des Modules

| Module | Status | Notes |
|--------|--------|-------|
| **UTILISATEUR** |
| Navigation Globale | ✅ 100% | Header, pages hub/search/favorites |
| Search | ✅ 100% | Filtres dynamiques, page dédiée |
| Favorites | ✅ 100% | Page dédiée, badge compteur |
| Textile Detail | ✅ 100% | Page /textiles/[id] |
| Boards Core | ✅ 100% | Canvas, zones, drag & drop |
| Boards Médias | ✅ 100% | Image, Video, Link, PDF, Pattern |
| Recherche Contextuelle | ✅ 100% | Sprint B1-B3 complet |
| Navigation Board/Journey | ✅ 100% | Header partagé, toggle unifié |
| **ADMIN** |
| Discovery | ✅ 98% | Analyse sites Shopify |
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
Get-ChildItem -Path "src/features/navigation" -Recurse -Name
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

**Pattern Navigation Context** :
```typescript
// Enregistrer le board actif
const { setActiveBoard } = useNavigation();
useEffect(() => {
  if (board) {
    setActiveBoard({
      id: board.id,
      name: board.name || 'Sans titre',
      returnPath: pathname,
    });
  }
}, [board, pathname]);
```

**Pattern Modal d'Édition** :
```typescript
const [editingXxxId, setEditingXxxId] = useState<string | null>(null);

case 'xxx':
  setEditingXxxId(element.id);
  setIsXxxModalOpen(true);
  break;
```

**Pattern Ouverture Fichier Base64** :
```typescript
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

### Navigation Globale

- **NavigationProvider** : Stocke le board actif en sessionStorage
- **MainHeader** : Affiche liens contextuels selon la page
- **BoardLayoutClient** : Enregistre le board actif au montage
- Le bouton "Retour au projet" apparaît quand on quitte un board

### Admin Access

L'admin est caché dans le menu utilisateur (avatar) :
- Visible uniquement si `user.role === 'admin'`
- Pas de lien dans la navigation principale

### Toolbar Boards

Outils de création uniquement :
- StickyNote, Palette, Shirt, Ruler
- Image, Video, Link
- FileText, Scissors, User (documents)
- Search (recherche contextuelle)
- Maximize2/Minimize2 (mode immersif)
- Square (zone)

### Journey Phases

| Phase | Types d'éléments |
|-------|------------------|
| Mood | inspiration, palette, silhouette, video, link, pdf, note |
| Conception | pattern, calculation, textile |
| Exécution | zones (projets cristallisés) |

### Couleurs Database (18 couleurs)

```typescript
type ColorName =
  | 'red' | 'blue' | 'green' | 'yellow' | 'orange' | 'pink'
  | 'purple' | 'brown' | 'beige' | 'gray' | 'black' | 'white'
  | 'burgundy' | 'navy' | 'teal' | 'gold' | 'lilac' | 'dark gray';
```
