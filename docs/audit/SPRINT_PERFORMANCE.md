# SPRINT PERFORMANCE - Plan Complet

**Version** : 1.0
**Date création** : 26 Janvier 2026
**Dernière MAJ** : 26 Janvier 2026

---

## 📊 Tableau de Bord

### Temps de Navigation Actuels

| Navigation | Avant | Maintenant | Objectif | Status |
|------------|-------|------------|----------|--------|
| → /boards (liste) | **13s** | **~250ms** | <500ms | ✅ RÉSOLU |
| → /search | **1.8s** | **~750ms** (serveur) / **6s** (perçu) | <800ms | 🟡 EN COURS |
| → /boards/[id]/journey | **1.9s** | **~1.9s** | <500ms | 🔴 À FAIRE |
| Journey → Board | 184ms | 184ms | <200ms | ✅ OK |

### Résumé des Phases

| Phase | Sprints | Effort Total | Status |
|-------|---------|--------------|--------|
| **Phase 0** | IMG-1, IMG-2, IMG-3 | 6h | ✅ 100% |
| **Phase 1** | PERF-1 à PERF-3 | 2h15 | 🟡 33% |
| **Phase 2** | REACT-1 à REACT-3 | 3h | 🔴 0% |
| **Phase 3** | SCALE-1 à SCALE-3 | 5h | 🔴 0% |
| **Phase 4** | CACHE-1 à CACHE-2 | 2h | 🔴 0% |

---

## ✅ PHASE 0 - Migration Images Storage (TERMINÉE)

> **Objectif** : Éliminer le stockage base64 qui causait 13 MB de transfert

### IMG-1 : Infrastructure Storage ✅
**Durée** : 1h30 | **Terminé** : 26 Jan 2026

- [x] Créer bucket `deadstock-boards` sur Supabase Storage
- [x] Configurer policies RLS (public read, authenticated write/delete)
- [x] Créer `src/lib/storage/imageUpload.ts` avec fonctions :
  - `uploadImage()` - Upload + optimisation WebP + resize 1200px
  - `uploadFromUrl()` - Télécharge URL externe puis upload
  - `uploadPdf()` - Upload PDF sans optimisation
  - `deleteFile()` - Suppression

### IMG-2 : Migration Composants Upload ✅
**Durée** : 3h | **Terminé** : 26 Jan 2026

- [x] `ImageUploadModal.tsx` - Upload vers Storage au lieu de base64
- [x] `UnsplashImagePicker` - Garde URL Unsplash directe (hotlinking autorisé)
- [x] `PdfModal.tsx` - Upload PDF vers Storage
- [x] `PatternModal.tsx` - Upload image/PDF vers Storage
- [x] `SilhouetteModal.tsx` - Upload image vers Storage

### IMG-3 : Optimisation Listing ✅
**Durée** : 1h30 | **Terminé** : 26 Jan 2026

- [x] Reset des boards existants (données de test avec base64)
- [x] Optimiser `listBoardsWithPreview()` - Ne plus charger `element_data`
- [x] Requête optimisée : `board_elements (count)` au lieu de `element_data`

**Résultat** : `/boards` passe de **13s à ~250ms** (-98%)

---

## 🟡 PHASE 1 - Optimisations Serveur (EN COURS)

> **Objectif** : Réduire les temps serveur sur /search et /journey

### PERF-1 : Journey Lazy Load Textiles 🔴
**Durée estimée** : 45min | **Priorité** : P1

**Problème** : Journey charge 268 textiles au mount même si l'utilisateur ne va jamais dans l'onglet textile.

**Fichier** : `src/app/(main)/boards/[boardId]/journey/page.tsx`

```typescript
// ❌ ACTUEL
const initialSearchData = await searchTextiles();  // 268 textiles chargés !

// ✅ SOLUTION
// Charger les textiles seulement quand l'utilisateur clique sur l'onglet
```

**Tâches** :
- [ ] Supprimer `searchTextiles()` du Server Component
- [ ] Ajouter lazy load dans `JourneyClientWrapper` quand onglet textile activé
- [ ] Afficher skeleton pendant le chargement

**Gain attendu** : -1.5s sur /journey

---

### PERF-2 : getAvailableFilters N+1 ✅
**Durée** : 30min | **Terminé** : 26 Jan 2026

**Problème** : N requêtes séquentielles (1 par catégorie de filtre)

**Fichier** : `src/features/search/infrastructure/textileRepository.ts`

```typescript
// ❌ AVANT - N requêtes
for (const cat of categoriesData || []) {
  const { data } = await supabase.from('textile_attributes')...
}

// ✅ APRÈS - 1 seule requête + agrégation client
const { data: allAttributesData } = await supabase
  .from('textile_attributes')
  .select('category_slug, value');
// Puis Map/Set côté client
```

**Résultat** : -300ms sur temps serveur /search

---

### PERF-3 : Pagination Search 🔴
**Durée estimée** : 2h | **Priorité** : P0 CRITIQUE

**Problème** : Charge 268 textiles (bientôt 20k+) → 6s perçu côté client

**Fichiers à modifier** :

1. **Repository** : `src/features/search/infrastructure/textileRepository.ts`
```typescript
// Nouvelle méthode
async searchPaginated(filters: SearchFilters, page: number, limit: number): Promise<{
  textiles: Textile[];
  total: number;
  page: number;
  totalPages: number;
}>
```

2. **Application** : `src/features/search/application/searchTextiles.ts`
```typescript
// Ajouter pagination
export async function searchTextiles(filters: SearchFilters, page = 1, limit = 24)
```

3. **API** : `src/app/api/search/route.ts`
```typescript
// Ajouter query params page/limit
```

4. **UI** : `src/components/search/SearchInterface.tsx`
```typescript
// Ajouter composant pagination
// Infinite scroll OU pagination classique
```

**Tâches** :
- [ ] Modifier `textileRepository.search()` avec limit/offset
- [ ] Ajouter `count: 'exact'` à la requête Supabase
- [ ] Mettre à jour `searchTextiles()` pour retourner metadata pagination
- [ ] Modifier API `/api/search` avec params page/limit
- [ ] Créer composant `Pagination.tsx`
- [ ] Modifier `SearchInterface` pour gérer la pagination
- [ ] Ajouter index SQL pour performance

**Index SQL recommandés** :
```sql
CREATE INDEX idx_textiles_search_fiber ON textiles_search(fiber);
CREATE INDEX idx_textiles_search_color ON textiles_search(color);
CREATE INDEX idx_textiles_search_created ON textiles_search(created_at DESC);
CREATE INDEX idx_textiles_search_fiber_color ON textiles_search(fiber, color);
```

**Gain attendu** : Temps CONSTANT ~500ms quelle que soit la taille DB

| Textiles | Sans pagination | Avec pagination (24/page) |
|----------|-----------------|---------------------------|
| 268 | 1.8s | ~500ms |
| 20,000 | 120s+ (crash) | ~500ms |

---

## 🔴 PHASE 2 - Optimisations React (À FAIRE)

> **Objectif** : Réduire les re-renders inutiles

### REACT-1 : Lazy Mount Modals 🔴
**Durée estimée** : 30min | **Priorité** : P2

**Problème** : Modals toujours montés même quand fermés → re-renders inutiles

**Fichiers** :
- `src/features/boards/components/BoardCanvas.tsx`
- `src/features/boards/components/canvas/CanvasModals.tsx`

```typescript
// ❌ ACTUEL - Toujours monté
<AutoArrangeDialog isOpen={showAutoArrangeDialog} ... />
<VideoModal isOpen={showVideoModal} ... />

// ✅ SOLUTION - Lazy mount
{showAutoArrangeDialog && <AutoArrangeDialog ... />}
{showVideoModal && <VideoModal ... />}
```

**Tâches** :
- [ ] Lazy mount `AutoArrangeDialog`
- [ ] Lazy mount `VideoModal`
- [ ] Lazy mount `LinkModal`
- [ ] Lazy mount `PdfModal`
- [ ] Lazy mount `PatternModal`
- [ ] Lazy mount `SilhouetteModal`

**Gain attendu** : -50ms de renders par commit

---

### REACT-2 : Props Stables React.memo 🔴
**Durée estimée** : 1h30 | **Priorité** : P2

**Problème** : `React.memo` contourné par nouvelles références d'objets/fonctions

**Fichiers** :
- `src/features/boards/components/ElementCard.tsx`
- `src/features/boards/components/ZoneCard.tsx`
- `src/features/boards/components/BoardCanvas.tsx`

```typescript
// ❌ ACTUEL - Nouvel objet à chaque render
<ZoneCard zone={{ ...zone, positionX: position.x }} ... />

// ✅ SOLUTION - Mémoriser avec useMemo
const memoizedZone = useMemo(() => ({
  ...zone, positionX: position.x, positionY: position.y
}), [zone.id, position.x, position.y]);
```

**Tâches** :
- [ ] Mémoriser objets zone/element positions avec `useMemo`
- [ ] Mémoriser handlers avec `useCallback`
- [ ] Ajouter comparateur custom à `React.memo` si nécessaire

**Gain attendu** : -60% de re-renders

---

### REACT-3 : ContextualSearchPanel Callback 🔴
**Durée estimée** : 15min | **Priorité** : P2

**Problème** : Callback `onAddToBoard` recréé à chaque render

**Fichier** : `src/features/boards/components/BoardCanvas.tsx`

```typescript
// ❌ ACTUEL - Fonction inline recréée
<ContextualSearchPanel
  onAddToBoard={async (textile) => { ... }}
/>

// ✅ SOLUTION - useCallback
const handleAddToBoard = useCallback(async (textile) => {
  ...
}, [dependencies]);
```

**Gain attendu** : Moins de re-renders en cascade

---

## 🔴 PHASE 3 - Scalabilité (À FAIRE)

> **Objectif** : Préparer l'application pour 20k+ textiles

### SCALE-1 : Index Base de Données 🔴
**Durée estimée** : 30min | **Priorité** : P1

**Tâches** :
- [ ] Créer index sur `textiles_search(fiber)`
- [ ] Créer index sur `textiles_search(color)`
- [ ] Créer index sur `textiles_search(created_at DESC)`
- [ ] Créer index composite `textiles_search(fiber, color)`
- [ ] Analyser les requêtes lentes avec `EXPLAIN ANALYZE`

---

### SCALE-2 : Optimisation Drag Canvas 🔴
**Durée estimée** : 2h | **Priorité** : P2

**Problème** : 61 commits React pendant un drag, 185ms/frame au lieu de 16ms

**Fichiers** :
- `src/features/boards/components/BoardCanvas.tsx`
- `src/features/boards/context/BoardContext.tsx`

**Tâches** :
- [ ] Ajouter `requestAnimationFrame` aux hooks de drag
- [ ] Isoler `isDragging` du BoardContext (éviter propagation)
- [ ] Mémoriser `allPositions` avec `useMemo`
- [ ] Optionnel : Créer `DragContext` séparé

**Gain attendu** : <20 commits pendant drag, <16ms/frame (60fps)

---

### SCALE-3 : Architecture Layout 🔴
**Durée estimée** : 2h | **Priorité** : P3

**Problème** : `'use client'` au niveau layout racine force re-render complet

**Fichier** : `src/app/(main)/layout.tsx`

**Tâches** :
- [ ] Créer `Providers.tsx` séparé avec 'use client'
- [ ] Retirer 'use client' du layout principal
- [ ] Vérifier que la navigation reste fonctionnelle

**Gain attendu** : -200ms par navigation

---

## 🔴 PHASE 4 - Cache (À FAIRE)

> **Objectif** : Réduire les appels serveur répétés

### CACHE-1 : Cache API Routes 🔴
**Durée estimée** : 1h | **Priorité** : P3

**Tâches** :
- [ ] Ajouter `revalidate: 30` sur `/api/boards`
- [ ] Utiliser `React.cache()` pour `getBoards` dans Server Components
- [ ] Stratégie par type de données :
  - Textiles : 5 minutes
  - Boards liste : 30 secondes
  - Board détail : 10 secondes

---

### CACHE-2 : Supprimer force-dynamic 🔴
**Durée estimée** : 1h | **Priorité** : P3

**Fichiers concernés** :
- `src/app/(main)/boards/page.tsx`
- `src/app/(main)/favorites/page.tsx`
- `src/app/(main)/home/page.tsx`
- `src/app/(main)/search/page.tsx`

**Tâches** :
- [ ] Implémenter Static Shell pattern
- [ ] Retirer `export const dynamic = 'force-dynamic'`
- [ ] Vérifier que le prefetch Next.js fonctionne

**Gain attendu** : Prefetch actif, navigation instantanée

---

## 📋 Ordre d'Implémentation Recommandé

### Priorité 1 - Gains Maximaux (3h)
1. **PERF-3** : Pagination /search (2h) → Temps constant
2. **PERF-1** : Journey lazy load (45min) → -1.5s
3. **SCALE-1** : Index DB (30min) → Requêtes rapides

### Priorité 2 - Quick Wins (1h15)
4. **REACT-1** : Lazy mount modals (30min)
5. **REACT-3** : Callback mémorisé (15min)
6. **REACT-2** : Props stables (30min partiel)

### Priorité 3 - Optimisations Profondes (4h)
7. **SCALE-2** : Drag canvas (2h)
8. **SCALE-3** : Architecture layout (2h)

### Priorité 4 - Cache (2h)
9. **CACHE-1** : Cache API (1h)
10. **CACHE-2** : Supprimer force-dynamic (1h)

---

## 🎯 Objectifs Finaux

| Métrique | Actuel | Objectif | Phase |
|----------|--------|----------|-------|
| /boards | 250ms | <300ms | ✅ Phase 0 |
| /search | 6s perçu | <800ms | Phase 1 (PERF-3) |
| /journey | 1.9s | <500ms | Phase 1 (PERF-1) |
| Drag 60fps | 185ms/frame | <16ms/frame | Phase 3 (SCALE-2) |
| 20k textiles | crash | <800ms | Phase 1+3 |

---

## 📝 Notes de Session

### 26 Janvier 2026
- ✅ Terminé Phase 0 complète (IMG-1, IMG-2, IMG-3)
- ✅ Terminé PERF-2 (getAvailableFilters)
- 🔍 Identifié que le problème /search est côté client (rendu 268 textiles)
- 📋 Créé ce document de suivi complet
- 🔜 Prochaine étape : PERF-3 (Pagination)

---

**Dernière mise à jour** : 26 Janvier 2026 - 12:30
