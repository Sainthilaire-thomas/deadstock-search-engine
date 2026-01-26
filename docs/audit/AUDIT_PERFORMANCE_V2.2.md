# Audit de Performance - Deadstock Search Engine

**Date** : 18 Janvier 2026  
**Version** : 2.2  
**Statut** : Complet - Prêt pour implémentation

---

## 📊 Résumé Exécutif

### Core Web Vitals

| Métrique | Valeur Actuelle | Objectif | Statut |
|----------|-----------------|----------|--------|
| LCP (Largest Contentful Paint) | 1.09-1.19s | <2.5s | ✅ Bon |
| CLS (Cumulative Layout Shift) | 0 | <0.1 | ✅ Excellent |
| INP (Interaction to Next Paint) | 8-48ms | <200ms | ✅ Excellent |

### Temps de Navigation (Mesurés)

| Navigation | Temps | Objectif | Statut |
|------------|-------|----------|--------|
| → /boards (liste) | **13.13s** | <1s | 🔴 CRITIQUE |
| → /boards/[id] (Board) | **1.33s** | <500ms | 🔴 Lent |
| → /boards/[id]/journey | **1.92s** | <400ms | 🔴 Lent |
| → /search | **1.77s** | <800ms | 🟡 Lent |
| Journey → Board | **184ms** | <200ms | ✅ Bon |

### Autres Métriques

| Métrique | Valeur Actuelle | Objectif | Statut |
|----------|-----------------|----------|--------|
| React Renders (16 commits) | **~1,200ms** | <300ms | 🔴 Critique |
| Images non optimisées | **2.6 MB** | <500 KB | 🔴 Critique |

**Verdict global** : Core Web Vitals corrects, mais **navigation lente** due à des re-renders React excessifs et des images non optimisées.

---

## 📊 Récapitulatif des Mesures Network

| Navigation | Temps Total | TTFB | Content Download | Taille | Verdict |
|------------|-------------|------|------------------|--------|---------|
| → /boards (liste) | **13.13s** | 91ms | 13.03s | 16.9 kB | 🔴 CRITIQUE |
| → /boards/[id] (Board) | **1.33s** | 194ms | 1.13s | 8.8 kB | 🟡 Lent |
| → /boards/[id]/journey | **1.92s** | 129ms | 1.79s | 89.9 kB | 🔴 Lent |
| → /search | **1.77s** | 91ms | 1.67s | 87.8 kB | 🟡 Lent |
| Journey → Board | **184ms** | 143ms | 37ms | 4.0 kB | ✅ Bon |

### Observations Clés

1. **TTFB toujours bon** (90-200ms) → Le serveur répond vite
2. **Content Download = le problème** → Le streaming RSC calcule pendant l'envoi
3. **Journey → Board rapide** car le layout est partagé et déjà en mémoire
4. **Tailles RSC élevées** quand on charge des données (textiles, boards)

---

## 🔍 Analyse Détaillée par Zone

### 1. Network Timing (Navigation vers Board)

| Phase | Durée | % Total | Analyse |
|-------|-------|---------|---------|
| Queueing | 1.64 ms | 0.1% | ✅ OK |
| TTFB (Waiting) | 193.66 ms | 14.5% | ✅ Serveur réactif |
| **Content Download** | **1.13 s** | **85%** | 🔴 Streaming lent |

**Diagnostic** : Le serveur répond vite (194ms) mais le streaming RSC prend 1.1s → React travaille pendant le download.

---

### 2. React Profiler - 16 Commits Analysés

| Commit | Render Time | Composants Principaux | Cause |
|--------|-------------|----------------------|-------|
| 14/16 | **390.2 ms** | AutoArrangeDialog (58.5ms), ZoneCard | Router |
| 15/16 | **305.8 ms** | AutoArrangeDialog, BoardToolbar, BoardCanvas | Presence, ContextualSearchPanel |
| 6/16 | 186.2 ms | Router, PaletteElement, BoardCanvas | Router |
| 7/16 | 175.4 ms | BoardToolbar, BoardCanvas, MainHeader | Presence, ContextualSearchPanel |
| 10/16 | 87.4 ms | DropdownMenu, Anonymous (ForwardRef) | Router |

**Total cumulé : ~1,200+ ms de renders React**

---

### 3. JavaScript Performance

| Catégorie | Durée | % | Verdict |
|-----------|-------|---|---------|
| Scripting | 1,345 ms | 15% | 🟡 Élevé |
| `performWorkUntilDeadline` (React) | 816 ms | 78% du scripting | 🔴 Critique |
| System | 455 ms | 5% | ✅ OK |
| Rendering | 178 ms | 2% | ✅ OK |

---

## 🔴 Problèmes Identifiés

### P1 - CRITIQUE : Composants toujours montés (re-renders inutiles)

#### P1.1 - AutoArrangeDialog
**Fichier** : `src/features/boards/components/BoardCanvas.tsx` (ligne ~677)

```typescript
// ❌ ACTUEL - Toujours monté, se re-rend à chaque update
<AutoArrangeDialog
  isOpen={showAutoArrangeDialog}
  onClose={() => setShowAutoArrangeDialog(false)}
  onConfirm={handleAutoArrange}
  elements={elements}
  zones={zones}
  initialShowPhaseColumns={showPhaseColumns}
/>
```

**Impact** : 17-58ms de render à chaque commit même quand fermé

#### P1.2 - ContextualSearchPanel
**Fichier** : `src/features/boards/components/BoardCanvas.tsx` (ligne ~690)

```typescript
// ❌ ACTUEL - Callback recréé à chaque render
<ContextualSearchPanel
  boardId={boardId}
  onAddToBoard={async (textile) => {
    // ... fonction inline recréée à chaque render
  }}
/>
```

**Impact** : Trigger de re-renders en cascade via "Presence key" updates

#### P1.3 - Modals dans CanvasModals
**Fichier** : `src/features/boards/components/canvas/CanvasModals.tsx`

```typescript
// ❌ ACTUEL - VideoModal, LinkModal, PdfModal, etc. toujours montés
<VideoModal isOpen={showVideoModal} ... />
<LinkModal isOpen={showLinkModal} ... />
<PdfModal isOpen={isPdfModalOpen} ... />
<PatternModal isOpen={isPatternModalOpen} ... />
<SilhouetteModal isOpen={isSilhouetteModalOpen} ... />
```

**Impact** : ~5-10ms chacun × 5 modals = 25-50ms de renders inutiles

---

### P2 - CRITIQUE : Middleware avec getUser() bloquant

**Fichier** : `middleware.ts` (ligne 64)

```typescript
// ❌ ACTUEL - Appel réseau à CHAQUE navigation
const { data: { user } } = await supabase.auth.getUser();
```

**Impact** : +150-300ms par navigation (appel API Supabase)

---

### P3 - ÉLEVÉ : Double appel getUser()

**Fichiers** : 
- `middleware.ts` (ligne 64)
- `src/features/auth/context/AuthContext.tsx` (ligne 70)

```typescript
// AuthContext.tsx - SECOND appel après le middleware
const { data: { user: currentUser }, error } = await supabase.auth.getUser();
```

**Impact** : +150-200ms (appel redondant)

---

### P4 - ÉLEVÉ : Layout 'use client' au niveau racine

**Fichier** : `src/app/(main)/layout.tsx` (ligne 3)

```typescript
'use client';  // ❌ Désactive SSR pour tout le layout
```

**Impact** : 
- Force un re-render complet à chaque navigation
- Tous les providers se réinitialisent
- Estimation : +200-400ms par navigation

---

### P5 - MOYEN : Pages avec force-dynamic

**Fichiers concernés** :
- `src/app/(main)/boards/page.tsx:19`
- `src/app/(main)/favorites/page.tsx:15`
- `src/app/(main)/home/page.tsx:14`
- `src/app/(main)/search/page.tsx:11`

```typescript
export const dynamic = 'force-dynamic';
```

**Impact** :
- Désactive le prefetch automatique de Next.js
- Force SSR complet à chaque visite
- Log confirmant : `navigateDynamicallyWithNoPrefetch`

---

### P6 - MOYEN : React.memo inefficace (props instables)

**Fichiers** : 
- `src/features/boards/components/ElementCard.tsx`
- `src/features/boards/components/ZoneCard.tsx`

```typescript
// ❌ ACTUEL - Nouvelles références d'objets à chaque render
<ZoneCard
  zone={{ ...zone, positionX: position.x, positionY: position.y, ... }}  // Nouvel objet!
  onMouseDown={(e) => handleZoneMouseDown(e, zone)}  // Nouvelle fonction!
  ...
/>

<ElementCard
  element={{ ...element, positionX: position.x, positionY: position.y }}  // Nouvel objet!
  onMouseDown={(e) => handleElementMouseDown(e, element)}  // Nouvelle fonction!
  ...
/>
```

**Impact** : Les `React.memo` sont contournés → re-renders de tous les cards à chaque update

---

### P7 - MOYEN : Images non optimisées

**Observation** : "Improve image delivery: Est savings: 2.6 MB"

**Sources** :
- `cdn.shopify.com` (images textiles)
- `unsplash.com` (793 kB pour une seule image!)
- `rabanne.com`

**Impact** : +1-2s de temps de chargement sur les boards avec beaucoup d'images

#### P7.1 - Optimisation à l'affichage (next/image)
Voir Phase 5 du plan d'action.

#### P7.2 - Optimisation à l'import (recommandé)

**Principe** : Optimiser l'image **une seule fois** au moment de l'upload/import plutôt qu'à chaque affichage.

**Fichiers concernés** :
- `src/features/boards/components/ImageUploadModal.tsx` (upload direct)
- `src/features/boards/components/canvas/UnsplashImagePicker.tsx` (import Unsplash)
- Tout endpoint qui sauvegarde une image dans `board_elements`

**Options d'implémentation** :

| Approche | Avantage | Inconvénient | Recommandé |
|----------|----------|--------------|------------|
| **Supabase Transform** | Intégré, simple, CDN | Options limitées | ✅ Court terme |
| **Resize côté client** (Canvas API) | Rapide, pas de serveur | Qualité moyenne | ✅ Fallback |
| **Route API + Sharp** | Meilleure qualité | Complexité serveur | 🟡 Moyen terme |
| **Cloudinary/imgix** | Optimal, CDN global | Coût mensuel | 🟡 Si scale |

**Implémentation recommandée (Supabase Transform)** :

```typescript
// src/lib/images/optimizeImage.ts

const MAX_BOARD_IMAGE_WIDTH = 800;
const IMAGE_QUALITY = 80;

/**
 * Optimise une URL d'image pour le stockage dans un board
 * Utilise Supabase Transform si c'est une image Supabase,
 * sinon télécharge et re-upload en version optimisée
 */
export async function optimizeImageForBoard(
  imageUrl: string,
  options?: { maxWidth?: number; quality?: number }
): Promise<{ url: string; width: number; height: number }> {
  const maxWidth = options?.maxWidth ?? MAX_BOARD_IMAGE_WIDTH;
  const quality = options?.quality ?? IMAGE_QUALITY;

  // Si c'est déjà une image Supabase Storage
  if (imageUrl.includes('supabase.co/storage')) {
    // Utiliser Supabase Transform (ajout de query params)
    const transformedUrl = `${imageUrl}?width=${maxWidth}&quality=${quality}`;
    return { url: transformedUrl, width: maxWidth, height: 0 };
  }

  // Sinon, télécharger et re-upload en version optimisée
  return await downloadAndOptimize(imageUrl, maxWidth, quality);
}

/**
 * Télécharge une image externe, la redimensionne côté client,
 * et l'upload vers Supabase Storage
 */
async function downloadAndOptimize(
  url: string, 
  maxWidth: number, 
  quality: number
): Promise<{ url: string; width: number; height: number }> {
  // 1. Charger l'image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });

  // 2. Calculer les dimensions
  const ratio = img.height / img.width;
  const newWidth = Math.min(img.width, maxWidth);
  const newHeight = Math.round(newWidth * ratio);

  // 3. Redimensionner via Canvas
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  // 4. Convertir en blob
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/webp', quality / 100);
  });

  // 5. Upload vers Supabase Storage
  const filename = `optimized_${Date.now()}.webp`;
  const { data, error } = await supabase.storage
    .from('board-images')
    .upload(filename, blob, { contentType: 'image/webp' });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('board-images')
    .getPublicUrl(filename);

  return { url: publicUrl, width: newWidth, height: newHeight };
}
```

**Intégration dans ImageUploadModal** :

```typescript
// ImageUploadModal.tsx - onSave handler
const handleSave = async (imageData: InspirationElementData) => {
  // Optimiser avant de sauvegarder
  const { url: optimizedUrl } = await optimizeImageForBoard(imageData.imageUrl);
  
  onSave({
    ...imageData,
    imageUrl: optimizedUrl,
  });
};
```

**Intégration dans UnsplashImagePicker** :

```typescript
// UnsplashImagePicker.tsx - onSelect handler
const handleSelectImage = async (photo: UnsplashPhoto) => {
  // Utiliser la version "regular" (1080px) au lieu de "full"
  const regularUrl = photo.urls.regular; // Déjà ~1080px
  
  // Optionnel: optimiser davantage
  const { url } = await optimizeImageForBoard(regularUrl, { maxWidth: 800 });
  
  onSelect({ imageUrl: url, ... });
};
```

**Gains estimés** :
- Image Unsplash : 793 KB → ~80 KB (-90%)
- Image uploadée HD : 2+ MB → ~100 KB (-95%)
- Temps de chargement board : -1 à -2 secondes

---

### P8 - CRITIQUE : Page Journey charge searchTextiles() inutilement

**Fichier** : `src/app/(main)/boards/[boardId]/journey/page.tsx`

```typescript
// ❌ ACTUEL - Charge TOUS les textiles (268+) à chaque navigation vers Journey
export default async function JourneyPage() {
  const initialSearchData = await searchTextiles();  // 🔴 Inutile dans 90% des cas !
  const user = await getAuthUser();
  const initialFavorites = await getFavoritesBySession(user.id);
  // ...
}
```

**Impact observé** : 
- Navigation Board → Journey : **1.9 secondes**
- TTFB : 129ms (serveur OK)
- Content Download : **1.79s** (streaming RSC lent car calcul serveur)
- Taille RSC : 89.9 kB (données textiles sérialisées)

**Cause** : Les données de recherche sont passées à `TextileJourneyView` pour l'onglet "Search", mais cet onglet n'est utilisé que rarement.

**Solution** : Lazy load des données de recherche uniquement quand l'utilisateur clique sur l'onglet "Search".

---

### P9 - CRITIQUE : Page /boards avec BoardCard async

**Fichier** : `src/app/(main)/boards/page.tsx`

```typescript
// ❌ ACTUEL - Chaque BoardCard appelle getTranslations() !
async function BoardCard({ board, locale }: { board: BoardWithPreview; locale: string }) {
  const t = await getTranslations();  // 🔴 Appelé N fois (une par board) !
  // ...
}
```

**Impact observé** :
- Navigation vers /boards : **5 à 13 secondes** (!!)
- TTFB : 90ms (serveur OK)
- Content Download : **13s** (streaming RSC très lent)
- Logs serveur : `render: 5.1s - 13.1s`

**Causes multiples** :
1. `BoardCard` est un Server Component async qui appelle `getTranslations()` pour **chaque board**
2. Avec 5 boards → 5 appels `getTranslations()` supplémentaires
3. `force-dynamic` empêche tout caching
4. Le streaming RSC sérialise toutes les données pendant le calcul

**Solution** : 
1. Passer `t` et `locale` en props à `BoardCard` (calculés une seule fois dans la page parent)
2. Ou convertir `BoardCard` en Client Component simple

---

### P10 - ÉLEVÉ : Temps de rendu /search

**Observation logs serveur** : `render: 1.5s - 2.4s`

**Fichier** : `src/app/(main)/search/page.tsx`

```typescript
export default async function SearchPage() {
  const initialData = await searchTextiles({});  // Appelle 2 fonctions
  return <SearchInterface initialData={initialData} />;
}
```

**Cause** : `searchTextiles()` appelle `search()` + `getAvailableFilters()`, et `getAvailableFilters` fait N+1 requêtes (voir P11).

---

### P11 - ÉLEVÉ : getAvailableFilters() fait N+1 requêtes

**Fichier** : `src/features/search/infrastructure/textileRepository.ts`

```typescript
// ❌ ACTUEL - N+1 requêtes !
async getAvailableFilters(): Promise<AvailableFilters> {
  // 1. Récupérer les catégories
  const { data: categoriesData } = await supabase
    .from('attribute_categories')
    .select('slug, name, display_order')
    .eq('is_searchable', true);

  // 2. Pour CHAQUE catégorie, faire une requête ! 🔴
  for (const cat of categoriesData || []) {
    const { data: valuesData } = await supabase
      .from('textile_attributes')
      .select('value')
      .eq('category_slug', cat.slug);  // ← Requête par catégorie !
    // ...
  }
}
```

**Impact** : Avec 4 catégories → **5 requêtes séquentielles** au lieu d'1.

**Solution** : Une seule requête avec GROUP BY ou agrégation côté client.

```typescript
// ✅ CORRECTION - Une seule requête
async getAvailableFilters(): Promise<AvailableFilters> {
  const supabase = createClient();

  // 1. Catégories
  const { data: categoriesData } = await supabase
    .from('attribute_categories')
    .select('slug, name, display_order')
    .eq('is_searchable', true)
    .order('display_order');

  // 2. TOUTES les valeurs en une seule requête
  const { data: allValues } = await supabase
    .from('textile_attributes')
    .select('category_slug, value');

  // 3. Grouper côté client
  const valuesByCategory = (allValues || []).reduce((acc, item) => {
    if (!acc[item.category_slug]) acc[item.category_slug] = new Set();
    if (item.value) acc[item.category_slug].add(item.value);
    return acc;
  }, {} as Record<string, Set<string>>);

  // 4. Construire le résultat
  const categories = (categoriesData || [])
    .filter(cat => valuesByCategory[cat.slug]?.size > 0)
    .map(cat => ({
      slug: cat.slug,
      name: cat.name,
      displayOrder: cat.display_order ?? 0,
      values: [...valuesByCategory[cat.slug]].sort(),
    }));

  return { categories, /* legacy fields */ };
}
```

---

### P12 - MOYEN : Page /home charge listBoardsAction

**Fichier** : `src/app/(main)/home/page.tsx`

```typescript
export default async function HomePage() {
  const result = await listBoardsAction();  // Charge TOUS les boards
  const boards = result.data ?? [];
  const activeBoardsCount = boards.filter((b) => b.status !== 'archived').length;
  // ...
}
```

**Impact** : Charge tous les boards juste pour compter les actifs.

**Solution** : Utiliser `getBoardsCount()` au lieu de `listBoardsAction()`.

```typescript
// ✅ CORRECTION
export default async function HomePage() {
  const countResult = await getBoardsCountAction();
  const activeBoardsCount = countResult.data ?? 0;
  // ...
}
```

---

### P13 - MOYEN : getBoard fait 3 requêtes séquentielles

**Fichier** : `src/features/boards/infrastructure/boardsRepository.ts`

```typescript
// ❌ ACTUEL - 3 requêtes séquentielles
export async function getBoard(boardId, userId) {
  // 1. Board
  const { data: boardData } = await supabase.from('boards').select('*')...;
  
  // 2. Elements
  const { data: elementsData } = await supabase.from('board_elements').select('*')...;
  
  // 3. Zones
  const { data: zonesData } = await supabase.from('board_zones').select('*')...;
}
```

**Impact** : ~100-200ms de latence cumulée.

**Solution** : Utiliser une seule requête avec relations Supabase ou `Promise.all`.

```typescript
// ✅ CORRECTION - Promise.all pour paralléliser
export async function getBoard(boardId: string, userId: string) {
  const supabase = createAdminClient();

  // Exécuter les 3 requêtes en parallèle
  const [boardResult, elementsResult, zonesResult] = await Promise.all([
    supabase.from('boards').select('*').eq('id', boardId).eq('user_id', userId).single(),
    supabase.from('board_elements').select('*').eq('board_id', boardId).order('z_index'),
    supabase.from('board_zones').select('*').eq('board_id', boardId).order('created_at'),
  ]);

  if (boardResult.error || !boardResult.data) {
    return null;
  }

  return {
    ...mapBoardFromRow(boardResult.data),
    elements: (elementsResult.data || []).map(mapElementFromRow),
    zones: (zonesResult.data || []).map(mapZoneFromRow),
  };
}
```

---

### P14 - INFO : FavoritesContext charge au montage

**Fichier** : `src/features/favorites/context/FavoritesContext.tsx`

```typescript
// Charger le count au montage
useEffect(() => {
  refreshCount();  // Appel API à chaque montage
}, [refreshCount]);
```

**Impact** : Mineur, mais ajoute une requête à chaque navigation.

**Note** : Acceptable car c'est une petite requête COUNT. À surveiller si le nombre de navigations augmente.

---

### P15 - CRITIQUE : Lag pendant le drag des éléments (185ms/frame)

**Fichiers** : 
- `src/features/boards/components/canvas/hooks/useElementDrag.ts`
- `src/features/boards/components/canvas/hooks/useZoneDrag.ts`
- `src/features/boards/context/BoardContext.tsx`
- `src/features/boards/components/BoardCanvas.tsx`

**Observation React Profiler** :
- **61 commits** pour un drag de 2-3 secondes
- **185.6ms par frame** (objectif : <16ms pour 60fps)
- **Cause identifiée** : "BoardProvider" → tout l'arbre re-render

**Problèmes identifiés** :

#### P15.1 - Pas de `requestAnimationFrame`
```typescript
// ❌ ACTUEL - useElementDrag.ts
const handleElementMouseMove = useCallback((e: MouseEvent) => {
  // ...calculs...
  setDragPosition({  // 🔴 setState à CHAQUE mousemove (60x/sec) !
    type: 'element',
    id: elementDragRef.current.elementId,
    x: newX,
    y: newY
  });
}, [scale]);
```

#### P15.2 - `setDragging` dans BoardContext propage le re-render
```typescript
// ❌ ACTUEL - BoardContext.tsx
case 'SET_DRAGGING':
  return { ...state, isDragging: action.payload };  // 🔴 Tout l'arbre re-render !
```

#### P15.3 - Props instables dans BoardCanvas
```typescript
// ❌ ACTUEL - BoardCanvas.tsx
<ElementCard
  element={{ ...element, positionX: position.x, positionY: position.y }}  // 🔴 Nouvel objet !
  onMouseDown={(e) => handleElementMouseDown(e, element)}  // 🔴 Nouvelle fonction !
/>
```

#### P15.4 - Calculs dans le render
```typescript
// ❌ ACTUEL - BoardCanvas.tsx
const allPositions = [
  ...elements.map((e) => ({ x: e.positionX + (e.width || 200), y: e.positionY + (e.height || 150) })),
  ...zones.map((z) => ({ x: z.positionX + z.width, y: z.positionY + z.height })),
];  // 🔴 Recalculé à CHAQUE frame de drag !
```

**Impact** : 
- Drag saccadé, lag visible
- 185ms/frame au lieu de <16ms (11x trop lent)
- UX dégradée sur le canvas

---

## 📊 Résumé Complet des Problèmes

| # | Problème | Impact | Priorité | Effort |
|---|----------|--------|----------|--------|
| **P9** | /boards : BoardCard × N getTranslations | **5-13s** | 🔴 CRITIQUE | 30min |
| **P8** | Journey : searchTextiles inutile | **1.9s** | 🔴 CRITIQUE | 45min |
| **P15** | Drag : 185ms/frame (lag canvas) | **UX dégradée** | 🔴 CRITIQUE | 2h |
| **P11** | getAvailableFilters N+1 requêtes | **~500ms** | 🔴 ÉLEVÉ | 30min |
| P1 | Composants toujours montés | ~100ms | 🟡 MOYEN | 30min |
| P2 | Middleware getUser() | ~200ms | 🟡 MOYEN | 10min |
| P3 | Double getUser() | ~150ms | 🟡 MOYEN | 30min |
| P4 | Layout 'use client' | ~300ms | 🟡 MOYEN | 1h |
| P5 | force-dynamic | Prefetch | 🟡 MOYEN | 1h |
| P6 | React.memo inefficace | ~200ms | 🟡 MOYEN | 1h30 |
| P7 | Images non optimisées | ~1000ms | 🟡 MOYEN | 1h30 |
| **P12** | /home : listBoards au lieu de count | ~200ms | 🟢 FACILE | 10min |
| **P13** | getBoard 3 requêtes séquentielles | ~150ms | 🟢 FACILE | 15min |
| P10 | /search render lent | Lié à P11 | - | - |
| P14 | FavoritesContext count au mount | Mineur | 🔵 INFO | - |

---

## 🛠️ Plan d'Action

### Phase 1 : Quick Wins (1h) - Gain estimé : -400ms

| # | Action | Fichier | Effort | Gain |
|---|--------|---------|--------|------|
| 1.1 | Lazy mount AutoArrangeDialog | BoardCanvas.tsx | 5min | -50ms |
| 1.2 | Mémoriser callback onAddToBoard | BoardCanvas.tsx | 10min | -30ms |
| 1.3 | Lazy mount modals dans CanvasModals | CanvasModals.tsx | 15min | -50ms |
| 1.4 | Remplacer getUser() par getSession() | middleware.ts | 10min | -200ms |
| 1.5 | Skip auth pour routes publiques | middleware.ts | 10min | -50ms |

#### 1.1 - Lazy mount AutoArrangeDialog

```typescript
// ✅ CORRECTION
{showAutoArrangeDialog && (
  <AutoArrangeDialog
    isOpen={showAutoArrangeDialog}
    onClose={() => setShowAutoArrangeDialog(false)}
    onConfirm={handleAutoArrange}
    elements={elements}
    zones={zones}
    initialShowPhaseColumns={showPhaseColumns}
  />
)}
```

#### 1.2 - Mémoriser callback onAddToBoard

```typescript
// ✅ CORRECTION - Ajouter près des autres useCallback (~ligne 480)
const handleAddTextileToBoard = useCallback(async (textile: any) => {
  const position = { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 };
  const elementData: TextileElementData = {
    textileId: textile.id,
    snapshot: {
      name: textile.name,
      source: textile.supplier_name || '',
      price: textile.price_value || 0,
      currency: textile.price_currency || 'EUR',
      imageUrl: textile.image_url ?? null,
      availableQuantity: textile.quantity_value || null,
      material: textile.fiber || null,
      color: textile.color || null,
    },
  };
  await addElement({ elementType: 'textile', elementData, positionX: position.x, positionY: position.y });
  toast.success(`"${textile.name}" ajouté au board`);
}, [addElement]);

// Puis dans le JSX :
<ContextualSearchPanel
  boardId={boardId}
  onAddToBoard={handleAddTextileToBoard}
/>
```

#### 1.3 - Lazy mount modals dans CanvasModals

```typescript
// ✅ CORRECTION - CanvasModals.tsx
// Remplacer chaque modal par un lazy mount

// VideoModal
{showVideoModal && (
  <VideoModal
    isOpen={showVideoModal}
    onClose={onCloseVideoModal}
    onSave={onSaveVideo}
    initialData={getElementData<VideoElementData>(editingVideoId)}
  />
)}

// LinkModal
{showLinkModal && (
  <LinkModal
    isOpen={showLinkModal}
    onClose={onCloseLinkModal}
    onSave={onSaveLink}
    initialData={getElementData<LinkElementData>(editingLinkId)}
  />
)}

// Idem pour PdfModal, PatternModal, SilhouetteModal
```

#### 1.4 - Optimiser le Middleware

```typescript
// ✅ CORRECTION - middleware.ts (ligne 64)

// AVANT
const { data: { user } } = await supabase.auth.getUser();

// APRÈS - Lecture JWT locale, appel réseau seulement si refresh nécessaire
const { data: { session } } = await supabase.auth.getSession();
const user = session?.user ?? null;
```

#### 1.5 - Skip auth pour routes publiques

```typescript
// ✅ CORRECTION - middleware.ts (ajouter au début, après la gestion locale)

const pathname = request.nextUrl.pathname;

// Routes publiques sans auth check - skip Supabase entièrement
const publicRoutesNoAuth = ["/", "/pricing"];
if (publicRoutesNoAuth.includes(pathname)) {
  return response;
}

// ... puis continuer avec la création du client Supabase
```

---

### Phase 2 : Stabiliser les props (1h30) - Gain estimé : -200ms

| # | Action | Fichier | Effort | Gain |
|---|--------|---------|--------|------|
| 2.1 | Mémoriser objets zone/element | BoardCanvas.tsx | 30min | -100ms |
| 2.2 | Mémoriser handlers avec useCallback | BoardCanvas.tsx | 30min | -100ms |
| 2.3 | Ajouter comparateur custom à memo | ElementCard.tsx, ZoneCard.tsx | 30min | - |

#### 2.1 & 2.2 - Pattern de mémorisation des props

```typescript
// ✅ CORRECTION - Créer des objets stables pour chaque zone/element

// Option A : Mémoriser les positions avec useMemo
const zonePositions = useMemo(() => {
  return zones.reduce((acc, zone) => {
    const isDragging = zoneDragPosition?.id === zone.id;
    const isResizing = resizeState?.id === zone.id;
    const arrangeTarget = isArranging ? arrangeTargets?.get(`zone-${zone.id}`) : null;
    
    acc[zone.id] = {
      x: arrangeTarget?.x ?? (isDragging ? zoneDragPosition.x : isResizing ? resizeState.x : zone.positionX),
      y: arrangeTarget?.y ?? (isDragging ? zoneDragPosition.y : isResizing ? resizeState.y : zone.positionY),
      width: isResizing ? resizeState.width : zone.width,
      height: isResizing ? resizeState.height : zone.height,
    };
    return acc;
  }, {} as Record<string, { x: number; y: number; width: number; height: number }>);
}, [zones, zoneDragPosition, resizeState, isArranging, arrangeTargets]);

// Option B : Utiliser des callbacks stables avec useCallback + Map
const handlersRef = useRef(new Map<string, { onMouseDown: (e: React.MouseEvent) => void }>());

// Puis passer zonePositions[zone.id] au lieu de créer un nouvel objet
```

#### 2.3 - Comparateur custom pour memo

```typescript
// ✅ CORRECTION - ElementCard.tsx
export const ElementCard = React.memo(function ElementCard({ ... }) {
  // ...
}, (prevProps, nextProps) => {
  // Comparaison shallow sur les props importantes
  return (
    prevProps.element.id === nextProps.element.id &&
    prevProps.element.positionX === nextProps.element.positionX &&
    prevProps.element.positionY === nextProps.element.positionY &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isEditing === nextProps.isEditing
    // Ne pas comparer les fonctions (elles sont stables via useCallback)
  );
});
```

---

### Phase 3 : Architecture Layout (2h) - Gain estimé : -300ms

| # | Action | Fichier | Effort | Gain |
|---|--------|---------|--------|------|
| 3.1 | Séparer Server/Client dans layout | layout.tsx | 1h | -200ms |
| 3.2 | Éviter double getUser | AuthContext.tsx | 30min | -150ms |
| 3.3 | Créer Providers.tsx wrapper | Nouveau fichier | 30min | - |

#### 3.1 - Séparer Server/Client

```typescript
// ✅ CORRECTION - src/app/(main)/layout.tsx

// Retirer 'use client' du layout principal
// Créer un nouveau fichier Providers.tsx

// layout.tsx (Server Component)
import { Providers } from './Providers';
import { MainHeader } from '@/features/navigation/components/MainHeader';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Providers>
        <MainHeader />
        <main className="pb-16 md:pb-0">{children}</main>
      </Providers>
    </div>
  );
}

// Providers.tsx ('use client')
'use client';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { FavoritesProvider } from '@/features/favorites/context/FavoritesContext';
import { NavigationProvider } from '@/features/navigation/context/NavigationContext';
import { ImmersiveModeProvider } from '@/features/boards/context/ImmersiveModeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NavigationProvider>
        <FavoritesProvider>
          <ImmersiveModeProvider>
            {children}
          </ImmersiveModeProvider>
        </FavoritesProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}
```

#### 3.2 - Éviter double getUser

```typescript
// ✅ CORRECTION - AuthContext.tsx

// Option A : Utiliser getSession() au lieu de getUser()
const initAuth = async () => {
  setIsLoading(true);
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    setUser(session.user);
    const userProfile = await fetchProfile(session.user.id);
    setProfile(userProfile);
  }
  setIsLoading(false);
};

// Option B : Passer l'info user du middleware via cookie/header (plus complexe)
```

---

### Phase 4 : Supprimer force-dynamic (1h) - Gain estimé : Prefetch activé

| # | Action | Fichier | Effort | Gain |
|---|--------|---------|--------|------|
| 4.1 | Pattern Static Shell + Dynamic Data | boards/page.tsx | 15min | Prefetch |
| 4.2 | Idem | home/page.tsx | 15min | Prefetch |
| 4.3 | Idem | search/page.tsx | 15min | Prefetch |
| 4.4 | Idem | favorites/page.tsx | 15min | Prefetch |

```typescript
// ✅ CORRECTION - Pattern "Static Shell + Dynamic Data"

// AVANT
export const dynamic = 'force-dynamic';
export default async function BoardsPage() { ... }

// APRÈS
import { Suspense } from 'react';
import { BoardsSkeleton } from './BoardsSkeleton';

export default function BoardsPage() {
  return (
    <Suspense fallback={<BoardsSkeleton />}>
      <BoardsContent />
    </Suspense>
  );
}

async function BoardsContent() {
  const boards = await getBoards();
  return <BoardsGrid boards={boards} />;
}
```

---

### Phase 5 : Optimisation Images (1h) - Gain estimé : -1s sur boards riches

| # | Action | Fichier | Effort | Gain |
|---|--------|---------|--------|------|
| 5.1 | Utiliser next/image avec sizes | ImageElement.tsx | 30min | -500ms |
| 5.2 | Ajouter lazy loading | Tous les éléments image | 15min | -300ms |
| 5.3 | Ajouter placeholder blur | ImageElement.tsx | 15min | UX |
| 5.4 | Optimiser images à l'import | ImageUploadModal.tsx, UnsplashPicker | 30min | -90% taille |

```typescript
// ✅ CORRECTION - ImageElement.tsx
import Image from 'next/image';

<Image
  src={url}
  fill
  sizes="(max-width: 300px) 100vw, 300px"
  loading="lazy"
  placeholder="blur"
  blurDataURL={thumbnailUrl || '/placeholder.png'}
  alt={alt}
/>
```

---

### Phase 6 : Corrections Server Components (2h) - Gain estimé : -10s sur /boards, -1.5s sur Journey

| # | Action | Fichier | Effort | Gain |
|---|--------|---------|--------|------|
| 6.1 | BoardCard : passer t et locale en props | boards/page.tsx | 30min | **-10s** |
| 6.2 | Journey : lazy load searchTextiles | journey/page.tsx | 45min | **-1.5s** |
| 6.3 | Supprimer force-dynamic après optimisations | Toutes les pages | 15min | Prefetch |

#### 6.1 - BoardCard : éviter getTranslations() répétés

```typescript
// ✅ CORRECTION - src/app/(main)/boards/page.tsx

export default async function BoardsPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const result = await listBoardsWithPreviewAction();
  const boards = result.data ?? [];
  
  // ... reste du code ...
  
  {activeBoards.map((board) => (
    // Passer t et locale en props au lieu de les recalculer
    <BoardCard key={board.id} board={board} locale={locale} t={t} />
  ))}
}

// Convertir BoardCard en composant synchrone (pas async)
function BoardCard({ 
  board, 
  locale, 
  t 
}: { 
  board: BoardWithPreview; 
  locale: string;
  t: ReturnType<typeof getTranslations> extends Promise<infer T> ? T : never;
}) {
  // Plus besoin de await getTranslations() !
  const displayName = board.name || t('common.untitled');
  // ... reste du composant
}
```

#### 6.2 - Journey : lazy load des données de recherche

```typescript
// ✅ CORRECTION - src/app/(main)/boards/[boardId]/journey/page.tsx

// AVANT : Charge tout au rendu initial
export default async function JourneyPage() {
  const initialSearchData = await searchTextiles();  // ❌ Toujours chargé
  // ...
}

// APRÈS : Ne charge que les favoris, searchTextiles sera lazy loaded
export default async function JourneyPage() {
  // Ne PAS charger searchTextiles ici !
  let initialFavorites: FavoriteWithTextile[] = [];
  try {
    const user = await getAuthUser();
    if (user) {
      initialFavorites = await getFavoritesBySession(user.id);
    }
  } catch (error) {
    console.error("Could not load favorites:", error);
  }

  return (
    <JourneyClientWrapper
      initialFavorites={initialFavorites}
      // Pas de initialSearchData - sera chargé à la demande
    />
  );
}
```

```typescript
// ✅ CORRECTION - src/features/journey/components/JourneyClientWrapper.tsx

interface JourneyClientWrapperProps {
  initialFavorites: FavoriteWithTextile[];
  // initialSearchData retiré !
}

export function JourneyClientWrapper({ initialFavorites }: JourneyClientWrapperProps) {
  // État pour les données de recherche (chargées à la demande)
  const [searchData, setSearchData] = useState<SearchResult | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // Charger les données de recherche quand on clique sur l'onglet "textile"
  const loadSearchDataIfNeeded = async () => {
    if (searchData || isLoadingSearch) return;
    setIsLoadingSearch(true);
    try {
      const response = await fetch('/api/search', { method: 'POST' });
      const data = await response.json();
      setSearchData(data);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  // Dans renderContent(), quand selectedType === "textile"
  if (selectedType === "textile") {
    // Déclencher le chargement si pas encore fait
    if (!searchData) {
      loadSearchDataIfNeeded();
      return <div>Chargement...</div>;
    }
    return (
      <TextileJourneyView
        initialSearchData={searchData}
        initialFavorites={initialFavorites}
      />
    );
  }
  // ...
}
```

#### 6.3 - Vérification finale

Après les optimisations 6.1 et 6.2, les pages devraient être assez rapides pour retirer `force-dynamic` et bénéficier du prefetch Next.js.

---

### Phase 7 : Optimisations Base de Données (1h) - Gain estimé : -700ms

| # | Action | Fichier | Effort | Gain |
|---|--------|---------|--------|------|
| 7.1 | getAvailableFilters : éliminer N+1 | textileRepository.ts | 30min | -500ms |
| 7.2 | /home : count au lieu de list | home/page.tsx | 10min | -200ms |
| 7.3 | getBoard : Promise.all | boardsRepository.ts | 15min | -150ms |

#### 7.1 - Éliminer N+1 dans getAvailableFilters

```typescript
// ✅ CORRECTION - src/features/search/infrastructure/textileRepository.ts

async getAvailableFilters(): Promise<AvailableFilters> {
  const supabase = createClient();

  // Exécuter les 2 requêtes en parallèle
  const [categoriesResult, valuesResult] = await Promise.all([
    supabase
      .from('attribute_categories')
      .select('slug, name, display_order')
      .eq('is_searchable', true)
      .order('display_order'),
    supabase
      .from('textile_attributes')
      .select('category_slug, value'),
  ]);

  const categoriesData = categoriesResult.data || [];
  const allValues = valuesResult.data || [];

  // Grouper côté client (O(n), très rapide)
  const valuesByCategory = allValues.reduce((acc, item) => {
    if (!acc[item.category_slug]) acc[item.category_slug] = new Set();
    if (item.value) acc[item.category_slug].add(item.value);
    return acc;
  }, {} as Record<string, Set<string>>);

  // Construire les catégories avec leurs valeurs
  const categories: FilterCategory[] = categoriesData
    .filter(cat => valuesByCategory[cat.slug]?.size > 0)
    .map(cat => ({
      slug: cat.slug,
      name: cat.name,
      displayOrder: cat.display_order ?? 0,
      values: [...valuesByCategory[cat.slug]].sort(),
    }));

  // Legacy format
  const fiberCategory = categories.find(c => c.slug === 'fiber');
  const colorCategory = categories.find(c => c.slug === 'color');
  const patternCategory = categories.find(c => c.slug === 'pattern');

  return {
    categories,
    materials: fiberCategory?.values || [],
    colors: colorCategory?.values || [],
    patterns: patternCategory?.values || [],
  };
}
```

#### 7.2 - /home : utiliser count au lieu de list

```typescript
// ✅ CORRECTION - src/app/(main)/home/page.tsx

import { getBoardsCountAction } from '@/features/boards/actions/boardActions';

export default async function HomePage() {
  // Juste compter, pas charger tous les boards
  const countResult = await getBoardsCountAction();
  const activeBoardsCount = countResult.data ?? 0;

  return (
    // ... reste inchangé, utiliser activeBoardsCount
  );
}
```

Note : Créer `getBoardsCountAction` si elle n'existe pas :

```typescript
// boardActions.ts
export async function getBoardsCountAction(): Promise<ActionResult<number>> {
  try {
    const userId = await requireUserId();
    const count = await boardsRepository.getBoardsCount(userId);
    return { success: true, data: count };
  } catch (error) {
    return { success: false, error: 'Erreur', data: 0 };
  }
}
```

#### 7.3 - getBoard : paralléliser les requêtes

```typescript
// ✅ CORRECTION - src/features/boards/infrastructure/boardsRepository.ts

export async function getBoard(boardId: string, userId: string): Promise<BoardWithDetails | null> {
  const supabase = createAdminClient();

  // Requête board d'abord (pour vérifier l'accès)
  const { data: boardData, error: boardError } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .eq('user_id', userId)
    .single();

  if (boardError || !boardData) {
    return null;
  }

  // Puis elements et zones en parallèle
  const [elementsResult, zonesResult] = await Promise.all([
    supabase
      .from('board_elements')
      .select('*')
      .eq('board_id', boardId)
      .order('z_index', { ascending: true }),
    supabase
      .from('board_zones')
      .select('*')
      .eq('board_id', boardId)
      .order('created_at', { ascending: true }),
  ]);

  const board = mapBoardFromRow(boardData as BoardRow);

  return {
    ...board,
    elements: (elementsResult.data || []).map(row => mapElementFromRow(row as unknown as BoardElementRow)),
    zones: (zonesResult.data || []).map(row => mapZoneFromRow(row as unknown as BoardZoneRow)),
  };
}

---

### Phase 10 : Optimisation Drag Canvas (2h) - Gain estimé : Drag fluide 60fps

| # | Action | Fichier | Effort | Gain |
|---|--------|---------|--------|------|
| 10.1 | Ajouter `requestAnimationFrame` | useElementDrag.ts, useZoneDrag.ts | 30min | -70% frames |
| 10.2 | Isoler `isDragging` du BoardContext | BoardContext.tsx | 20min | -50% re-renders |
| 10.3 | Mémoriser `allPositions` | BoardCanvas.tsx | 10min | -10ms/frame |
| 10.4 | Créer DragContext séparé (optionnel) | Nouveau fichier | 1h | Isolation totale |

#### 10.1 - Ajouter `requestAnimationFrame` aux hooks de drag

```typescript
// ✅ CORRECTION - useElementDrag.ts

export function useElementDrag({ ... }): UseElementDragReturn {
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);
  const dragPositionRef = useRef(dragPosition);
  dragPositionRef.current = dragPosition;

  const elementDragRef = useRef<ElementDragRef | null>(null);
  
  // NOUVEAU: RAF pour throttle les updates
  const rafRef = useRef<number | null>(null);
  const pendingPosition = useRef<{ x: number; y: number } | null>(null);

  const handleElementMouseMove = useCallback((e: MouseEvent) => {
    if (!elementDragRef.current) return;
    
    const dx = (e.clientX - elementDragRef.current.startX) / scale;
    const dy = (e.clientY - elementDragRef.current.startY) / scale;
    const newX = Math.max(0, elementDragRef.current.elementStartX + dx);
    const newY = Math.max(0, elementDragRef.current.elementStartY + dy);

    // Stocker la position pending
    pendingPosition.current = { x: newX, y: newY };

    // RAF: un seul setState par frame (60fps max)
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        if (pendingPosition.current && elementDragRef.current) {
          setDragPosition({
            type: 'element',
            id: elementDragRef.current.elementId,
            x: pendingPosition.current.x,
            y: pendingPosition.current.y
          });
        }
        rafRef.current = null;
      });
    }
  }, [scale]);

  const handleElementMouseUp = useCallback(() => {
    // Annuler RAF pending si existant
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    // ... reste du code inchangé
  }, [/* deps */]);

  // ... reste inchangé
}
```

#### 10.2 - Isoler `isDragging` du BoardContext

```typescript
// ✅ CORRECTION - Créer un hook local au lieu d'utiliser le contexte

// Option A: State local dans BoardCanvas (recommandé)
// BoardCanvas.tsx
const [localIsDragging, setLocalIsDragging] = useState(false);

// Passer setLocalIsDragging aux hooks au lieu de setDragging du contexte
const { dragPosition, handleElementMouseDown } = useElementDrag({
  // ...
  setDragging: setLocalIsDragging,  // ← Local, pas contexte !
});

// Option B: Retirer complètement isDragging du contexte
// BoardContext.tsx - Supprimer SET_DRAGGING du reducer
// Les composants qui ont besoin de savoir si on drag peuvent
// utiliser dragPosition !== null
```

#### 10.3 - Mémoriser `allPositions`

```typescript
// ✅ CORRECTION - BoardCanvas.tsx

// Mémoriser le calcul des positions pour éviter recalcul à chaque frame
const allPositions = useMemo(() => [
  ...elements.map((e) => ({ 
    x: e.positionX + (e.width || 200), 
    y: e.positionY + (e.height || 150) 
  })),
  ...zones.map((z) => ({ 
    x: z.positionX + z.width, 
    y: z.positionY + z.height 
  })),
], [elements, zones]);  // Recalculer seulement si elements/zones changent

const baseCanvasWidth = useMemo(() => 
  Math.max(1200, ...allPositions.map((p) => p.x + 100)),
  [allPositions]
);

const baseCanvasHeight = useMemo(() => 
  Math.max(800, ...allPositions.map((p) => p.y + 100)),
  [allPositions]
);
```

#### 10.4 - (Optionnel) Créer DragContext séparé

```typescript
// ✅ CORRECTION AVANCÉE - src/features/boards/context/DragContext.tsx

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DragPosition {
  type: 'element' | 'zone';
  id: string;
  x: number;
  y: number;
}

interface DragContextValue {
  dragPosition: DragPosition | null;
  setDragPosition: (pos: DragPosition | null) => void;
}

const DragContext = createContext<DragContextValue | null>(null);

export function DragProvider({ children }: { children: ReactNode }) {
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);
  
  return (
    <DragContext.Provider value={{ dragPosition, setDragPosition }}>
      {children}
    </DragContext.Provider>
  );
}

export function useDragContext() {
  const context = useContext(DragContext);
  if (!context) throw new Error('useDragContext must be used within DragProvider');
  return context;
}

// Usage: Seul BoardCanvas écoute DragContext
// BoardToolbar, AutoArrangeDialog, etc. n'écoutent PAS → pas de re-render
```

---

## 🏗️ Architecture Next.js - Problème de Fond

### Le problème : On utilise Next.js comme un serveur PHP classique

| Ce qu'on fait | Ce que Next.js permet |
|---------------|----------------------|
| Requête → DB → Render → Envoyer | Requête → Cache → Envoyer (instantané) |
| Données fraîches à chaque clic | Données cachées, revalidées intelligemment |
| 13s pour lister 5 boards | <100ms depuis le cache |

### Pourquoi on consulte Supabase "à tout bout de champ"

**1. `force-dynamic` désactive TOUT le cache**
```typescript
// Sur TOUTES nos pages principales !
export const dynamic = 'force-dynamic';
```
Ça dit à Next.js : "Ne cache RIEN, refais tout à chaque requête".

**2. Pas de stratégie de cache sur les fetches**
```typescript
// Notre code actuel - pas de cache
const { data } = await supabase.from('textiles_search').select('*');

// Ce qu'on POURRAIT faire avec Next.js
const data = await fetch('/api/textiles', { 
  next: { revalidate: 60 }  // Cache 60 secondes
});
```

**3. Les Server Actions ne sont pas cachées**
```typescript
// Chaque appel = nouvelle requête Supabase
export async function getBoardAction(boardId) {
  const board = await boardsRepository.getBoard(boardId, userId);
  // ...
}
```

### Comment ça DEVRAIT fonctionner

**Scénario actuel : Page /boards (liste des projets)**
```
Clic → Middleware (getUser 200ms) → Server Component → 
  → listBoardsWithPreview (requête Supabase) →
  → Pour chaque board: getTranslations() (N requêtes) →
  → Génère RSC → Stream au client
  
= 5-13 secondes
```

**Scénario idéal :**
```
Clic → Middleware (getSession 10ms, JWT local) →
  → Vérifie cache → Cache HIT → Sert immédiatement
  
= <200ms
```

Ou si cache miss :
```
Clic → Server Component → 
  → listBoardsWithPreview (1 requête, cachée 30s) →
  → BoardCard (sync, pas async, t passé en prop) →
  → Génère RSC → Cache → Envoie
  
= 300-500ms (puis instantané pendant 30s)
```

---

## ⚠️ Scalabilité : Projection à 20 000 Textiles

### État Actuel (268 textiles)

| Métrique | Valeur |
|----------|--------|
| Taille RSC /search | 87.8 kB |
| Temps Content Download | 1.67s |
| Ratio | ~3 textiles/kB |

### Projection à 20 000 textiles (SANS pagination)

| Métrique | Projection | Verdict |
|----------|------------|---------|
| Taille RSC estimée | **~6.5 MB** | 🔴 Catastrophique |
| Temps Download estimé | **120+ secondes** | 🔴 Inutilisable |
| Mémoire client | Explosion | 🔴 Crash probable |

### 🔴 Problèmes Architecturaux Actuels

**1. On charge TOUS les textiles à chaque fois**
```typescript
// searchTextiles.ts - ACTUEL
export async function searchTextiles(filters = {}) {
  // Charge TOUT, même sans filtre !
  const textiles = await textileRepository.search(filters);
  return { textiles, total: textiles.length, filters };
}
```

**2. Pas de pagination serveur**
```typescript
// textileRepository.ts - ACTUEL
let query = supabase
  .from('textiles_search')
  .select('*')  // Tout !
  .order('created_at', { ascending: false });
  // Pas de .limit() !
```

**3. Les filtres sont appliqués côté client**
On envoie tous les textiles, puis on filtre en JavaScript.

### ✅ Architecture Scalable (ce qu'il faudrait)

#### Phase 8 : Pagination Backend (2h)

```typescript
// searchTextiles.ts - CORRIGÉ
export async function searchTextiles(filters: SearchFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 24;  // 24 textiles par page
  
  const { textiles, totalCount } = await textileRepository.searchPaginated({
    ...filters,
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });
  
  return {
    textiles,        // 24 textiles max
    total: totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
```

```typescript
// textileRepository.ts - CORRIGÉ
async searchPaginated(filters: SearchFilters & { offset: number; limit: number }) {
  const supabase = createClient();
  
  // Requête paginée avec count exact
  let query = supabase
    .from('textiles_search')
    .select('*', { count: 'exact' })  // Compte total sans tout charger
    .order('created_at', { ascending: false })
    .range(filters.offset, filters.offset + filters.limit - 1);
  
  // Appliquer les filtres SQL...
  
  const { data, count, error } = await query;
  
  return {
    textiles: data || [],
    totalCount: count || 0,
  };
}
```

#### Phase 9 : Stratégie de Cache Next.js (3h)

**Option A : Cache Next.js natif (recommandé)**
```typescript
// Route handler avec cache
// app/api/boards/route.ts
export async function GET() {
  const boards = await getBoards();
  return Response.json(boards);
}

// Page qui utilise fetch avec cache
export default async function BoardsPage() {
  const boards = await fetch(`${process.env.URL}/api/boards`, {
    next: { revalidate: 30 }  // Cache 30 secondes
  }).then(r => r.json());
  
  return <BoardsList boards={boards} />;
}
```

**Option B : React Cache (pour Server Components)**
```typescript
import { cache } from 'react';

// Fonction cachée pendant le rendu
const getBoards = cache(async (userId: string) => {
  return await boardsRepository.listBoardsWithPreview(userId);
});
```

**Option C : unstable_cache de Next.js**
```typescript
import { unstable_cache } from 'next/cache';

const getCachedBoards = unstable_cache(
  async (userId: string) => boardsRepository.listBoardsWithPreview(userId),
  ['boards-list'],
  { revalidate: 30, tags: ['boards'] }
);
```

### 📊 Comparaison des Architectures

| Métrique | Actuel (tout charger) | Paginé (24/page) |
|----------|-----------------------|------------------|
| **268 textiles** | | |
| Taille RSC | 87.8 kB | ~8 kB |
| Temps | 1.77s | ~200ms |
| **20 000 textiles** | | |
| Taille RSC | ~6.5 MB | ~8 kB (identique!) |
| Temps estimé | 120s+ | ~200ms (identique!) |

**La pagination rend le temps CONSTANT quelle que soit la taille de la DB.**

### 📈 Index Supabase Recommandés (pour 20k textiles)

```sql
-- Index pour les recherches fréquentes
CREATE INDEX idx_textiles_search_fiber ON textiles_search(fiber);
CREATE INDEX idx_textiles_search_color ON textiles_search(color);
CREATE INDEX idx_textiles_search_price ON textiles_search(price);
CREATE INDEX idx_textiles_search_created ON textiles_search(created_at DESC);

-- Index composite pour filtres combinés
CREATE INDEX idx_textiles_search_fiber_color ON textiles_search(fiber, color);
```

### Résumé Scalabilité

| Question | Réponse |
|----------|---------|
| 20k textiles avec l'architecture actuelle ? | 🔴 Inutilisable (120s+, crash) |
| 20k textiles avec pagination ? | ✅ ~200ms constant |
| Effort de migration | ~5h de développement |
| Priorité | 🟡 Moyen terme (avant d'ajouter plus de sources) |

---

## 📋 Checklist d'Implémentation

### Phase 1 - Quick Wins ⏱️ 1h
- [ ] 1.1 Lazy mount AutoArrangeDialog
- [ ] 1.2 Mémoriser callback onAddToBoard  
- [ ] 1.3 Lazy mount modals (VideoModal, LinkModal, PdfModal, PatternModal, SilhouetteModal)
- [ ] 1.4 Middleware : getUser() → getSession()
- [ ] 1.5 Middleware : Skip auth routes publiques
- [ ] **MESURER** : Navigation Board < 800ms ?

### Phase 2 - Props Stables ⏱️ 1h30
- [ ] 2.1 Mémoriser objets zone/element positions
- [ ] 2.2 Mémoriser handlers avec useCallback
- [ ] 2.3 Ajouter comparateur custom à React.memo
- [ ] **MESURER** : Commits React < 8 ?

### Phase 3 - Architecture Layout ⏱️ 2h
- [ ] 3.1 Créer Providers.tsx, retirer 'use client' du layout
- [ ] 3.2 AuthContext : getUser() → getSession()
- [ ] **MESURER** : Navigation standard < 200ms ?

### Phase 4 - Supprimer force-dynamic ⏱️ 1h
- [ ] 4.1 boards/page.tsx : Static Shell pattern
- [ ] 4.2 home/page.tsx : Static Shell pattern
- [ ] 4.3 search/page.tsx : Static Shell pattern
- [ ] 4.4 favorites/page.tsx : Static Shell pattern
- [ ] **MESURER** : Prefetch actif dans Network ?

### Phase 5 - Images ⏱️ 1h30
- [ ] 5.1 next/image avec sizes
- [ ] 5.2 Lazy loading
- [ ] 5.3 Placeholder blur
- [ ] 5.4 Optimiser images à l'import (Canvas API ou Supabase Transform)
- [ ] **MESURER** : < 500 KB images sur board test

### Phase 6 - Server Components ⏱️ 2h (PRIORITÉ HAUTE)
- [ ] 6.1 BoardCard : passer t et locale en props (éviter N appels getTranslations)
- [ ] 6.2 Journey : lazy load searchTextiles() (charger à la demande)
- [ ] 6.3 Supprimer force-dynamic après optimisations
- [ ] **MESURER** : /boards < 1s, Journey < 500ms ?

### Phase 7 - Base de Données ⏱️ 1h (QUICK WINS DB)
- [ ] 7.1 getAvailableFilters : éliminer N+1 requêtes
- [ ] 7.2 /home : getBoardsCount au lieu de listBoards
- [ ] 7.3 getBoard : Promise.all pour paralléliser
- [ ] **MESURER** : /search < 800ms, /home < 500ms ?

### Phase 8 - Pagination Backend ⏱️ 2h (SCALABILITÉ)
- [ ] 8.1 Modifier textileRepository.searchPaginated avec limit/offset
- [ ] 8.2 Ajouter count: 'exact' à la requête Supabase
- [ ] 8.3 Mettre à jour searchTextiles() pour retourner pagination
- [ ] 8.4 API route /api/textiles avec query params page/limit
- [ ] **MESURER** : /search constant avec 24 textiles/page ?

### Phase 9 - Stratégie de Cache ⏱️ 3h (ARCHITECTURE)
- [ ] 9.1 Implémenter cache sur /api/boards avec revalidate: 30
- [ ] 9.2 Utiliser React cache() pour getBoards dans Server Components
- [ ] 9.3 Stratégie de cache par type de données :
  - Textiles : cache 5 minutes (changent rarement)
  - Boards liste : cache 30 secondes par user
  - Board détail : cache 10 secondes, invalidé sur mutation
- [ ] 9.4 Retirer force-dynamic progressivement
- [ ] **MESURER** : Cache HIT visible dans Network ?

### Phase 10 - Optimisation Drag Canvas ⏱️ 2h (UX CRITIQUE)
- [ ] 10.1 Ajouter `requestAnimationFrame` aux hooks de drag (30min)
- [ ] 10.2 Isoler `isDragging` du BoardContext (20min)
- [ ] 10.3 Mémoriser `allPositions` avec useMemo (10min)
- [ ] 10.4 Créer DragContext séparé (optionnel, 1h)
- [ ] **MESURER** : React Profiler < 20 commits pendant drag, < 20ms/frame ?

---

## 🎯 Objectifs de Performance Post-Optimisation

### Court terme (Phases 1-7)

| Métrique | Actuel | Objectif | Amélioration |
|----------|--------|----------|--------------|
| Navigation standard | ~300ms | <150ms | -50% |
| Navigation Board | 1.33s | <400ms | -70% |
| **Page /boards** | **13.13s** | **<1s** | **-92%** |
| **Board → Journey** | **1.92s** | **<400ms** | **-79%** |
| **Page /search** | **1.77s** | **<800ms** | **-55%** |
| Journey → Board | 184ms | <200ms | ✅ Déjà OK |
| React commits | 16 | <6 | -62% |
| Images Board | 2.6 MB | <500 KB | -81% |

### Canvas - Drag Performance (Phase 10)

| Métrique | Actuel | Objectif | Amélioration |
|----------|--------|----------|--------------|
| Commits pendant drag | 61 | <20 | -67% |
| Temps par frame | 185ms | <16ms | -91% |
| Composants re-rendus | Tous | Seulement l'élément dragué | -90% |

### Moyen terme - Scalabilité (Phases 8-9)

| Métrique | Actuel (268 textiles) | Avec 20k textiles | Objectif |
|----------|----------------------|-------------------|----------|
| /search temps | 1.77s | **120s+ (crash)** | <500ms |
| /search taille RSC | 87.8 kB | ~6.5 MB | ~8 kB |
| Architecture | Tout charger | Pagination 24/page | ✅ |
| Cache Next.js | Désactivé | Actif (30s-5min) | ✅ |

---

## 📈 Ordre d'Implémentation Recommandé

### Priorité 1 - Gains Maximaux (3h) → -12s sur /boards, -1.5s sur Journey
1. **Phase 6.1** : BoardCard (30min) → /boards passe de 13s à <1s
2. **Phase 6.2** : Journey lazy load (45min) → Journey passe de 1.9s à <400ms
3. **Phase 7.1** : getAvailableFilters (30min) → /search gagne 500ms

### Priorité 2 - Quick Wins (1h30) → -500ms globaux
4. **Phase 1.4** : Middleware getSession (10min)
5. **Phase 7.2** : /home count (10min)
6. **Phase 7.3** : getBoard Promise.all (15min)
7. **Phase 1.1-1.3** : Lazy mount components (30min)

### Priorité 3 - Optimisations Profondes (4h)
8. **Phase 2** : Props stables React.memo
9. **Phase 3** : Architecture Layout
10. **Phase 5** : Images

### Priorité 4 - Finalisation (2h)
11. **Phase 4** : Supprimer force-dynamic
12. Tests de non-régression

### Priorité 5 - UX Canvas (2h) → Drag fluide 60fps
13. **Phase 10** : Optimisation drag canvas (2h)

### Priorité 6 - Scalabilité (5h) → Préparation pour 20k textiles
14. **Phase 8** : Pagination backend (2h)
15. **Phase 9** : Stratégie de cache (3h)

---

## 🔧 Script de Mesure

```javascript
// Coller dans la console DevTools pour monitorer les navigations
const originalPushState = history.pushState;
let navStart = 0;

history.pushState = function() {
  navStart = performance.now();
  console.log('🚀 Navigation started');
  originalPushState.apply(this, arguments);
};

new MutationObserver((mutations, obs) => {
  if (navStart > 0) {
    const duration = Math.round(performance.now() - navStart);
    console.log(`✅ Navigation: ${duration}ms`);
    navStart = 0;
  }
}).observe(document.body, { childList: true, subtree: true });

console.log('📊 Navigation monitoring active');
```

---

## 📚 Ressources

- [Next.js App Router Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Supabase Auth Best Practices](https://supabase.com/docs/guides/auth/server-side)
- [React Profiler](https://react.dev/reference/react/Profiler)
- [Why Did You Render](https://github.com/welldone-software/why-did-you-render)

---

**Prochaine étape** : Implémenter Phase 6 (BoardCard + Journey lazy load) pour les gains maximaux immédiats, Phase 10 (Drag canvas) pour l'UX fluide, puis Phase 8 (Pagination) pour préparer la scalabilité.
