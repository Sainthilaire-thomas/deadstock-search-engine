# SPRINT PLAN - Canvas Improvements (Zoom, Pan, Auto-arrange, Performance)

**Version** : 1.2  
**Date** : 17 Janvier 2026  
**Contexte** : Post-MVP Phase 1, amélioration UX BoardCanvas  
**Auteur** : Thomas / Claude

---

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Diagnostic Performance Actuel](#diagnostic-performance-actuel)
3. [Sprint P0 : Performance Fondations](#sprint-p0--performance-fondations) ✅ **TERMINÉ**
4. [Sprint P1 : Zoom & Pan](#sprint-p1--zoom--pan)
5. [Sprint P2 : Auto-Arrange](#sprint-p2--auto-arrange)
6. [Sprint P3 : Outils de Visualisation](#sprint-p3--outils-de-visualisation)
7. [Récapitulatif et Priorisation](#récapitulatif-et-priorisation)
8. [Annexes](#annexes)

---

## Vue d'Ensemble

### Objectifs

Améliorer l'expérience utilisateur du BoardCanvas pour :
1. **Performance** : Garantir 60fps avec 50-100 éléments ✅
2. **Navigation** : Zoom infini et pan fluide
3. **Organisation** : Auto-arrangement par phase Journey
4. **Visualisation** : Outils d'aide à la navigation et l'organisation

### Architecture Actuelle

```
BoardCanvas.tsx
├── BoardToolbar.tsx          # Outils création (gauche)
├── ZoneCard.tsx              # Zones (cristallisées ou non) - React.memo ✅
├── ElementCard.tsx           # Éléments (tous types) - React.memo ✅
│   └── elements/
│       ├── PaletteElement.tsx    - React.memo ✅
│       ├── ImageElement.tsx      - React.memo ✅
│       ├── VideoElement.tsx      - React.memo ✅
│       ├── LinkElement.tsx       - React.memo ✅
│       ├── PdfElement.tsx        - React.memo ✅
│       ├── PatternElement.tsx    - React.memo ✅
│       └── SilhouetteElement.tsx - React.memo ✅
├── canvas/
│   └── hooks/
│       ├── useElementDrag.ts
│       ├── useZoneDrag.ts        # Ghost Mode ✅
│       ├── useZoneResize.ts
│       └── useKeyboardShortcuts.ts
└── ContextualSearchPanel.tsx
```

### État Actuel du Canvas

| Aspect | Implémentation actuelle |
|--------|------------------------|
| **Performance** | ✅ Optimisée (memo + ghost mode) |
| **Zoom** | ❌ Aucun |
| **Pan** | Scroll natif (`overflow-auto`) |
| **Organisation** | Manuelle uniquement (drag & drop) |
| **Limites canvas** | Dynamiques (max positions + 100px) |

---

## Diagnostic Performance Actuel

### Analyse des Composants (Post-P0)

| Composant | Lignes | React.memo | Hook contexte | Risque perf |
|-----------|--------|------------|---------------|-------------|
| `ElementCard` | ~350 | ✅ Oui | ✅ `useContextualSearchPanel` | 🟢 Faible |
| `ZoneCard` | ~230 | ✅ Oui | ❌ Non | 🟢 Faible |
| `PaletteElement` | ~60 | ✅ Oui | ❌ Non | 🟢 Faible |
| `ImageElement` | ~40 | ✅ Oui | ❌ Non | 🟢 Faible |
| Autres elements/ | ~40-80 | ✅ Oui | ❌ Non | 🟢 Faible |

### Problèmes Résolus ✅

#### 1. ~~Absence de mémoïsation~~ → Résolu P0.1-P0.3

Tous les composants sont maintenant wrappés avec `React.memo`.

#### 2. ~~Drag de zone avec éléments~~ → Résolu P0.4 (Ghost Mode)

Les éléments sont masqués pendant le drag, évitant les re-renders massifs.

**Impact** : Zone avec 20 éléments = **1 render** au lieu de 1200 re-renders/seconde

---

## Sprint P0 : Performance Fondations ✅ TERMINÉ

**Durée réelle** : ~2h  
**Date** : 17 Janvier 2026

### P0.1 - React.memo sur ElementCard ✅

### P0.2 - React.memo sur ZoneCard ✅

### P0.3 - React.memo sur éléments enfants ✅

Fichiers modifiés :
- `PaletteElement.tsx`
- `ImageElement.tsx`
- `VideoElement.tsx`
- `LinkElement.tsx`
- `PdfElement.tsx`
- `PatternElement.tsx`
- `SilhouetteElement.tsx`

### P0.4 - Ghost Mode pour drag de zone ✅

**Fichiers modifiés** :
- `useZoneDrag.ts` : Ajout de `draggingZoneId`, `draggingElementIds`, `draggingElementCount`
- `BoardCanvas.tsx` : Masquage des éléments pendant le drag
- `ZoneCard.tsx` : Props `isDragging` et `ghostElementCount`, affichage visuel

**Comportement** :
- Bordure bleue pointillée pendant le drag
- Badge central "X éléments" 
- Éléments réapparaissent au relâchement

---

## Sprint P1 : Zoom & Pan

**Durée estimée** : 6-8h (+ 2h optionnel P1.6)  
**Prérequis** : P0 ✅  
**Priorité** : P1

### Architecture choisie

**Approche** : Scroll natif (`overflow-auto`) conservé + CSS `transform` pour le zoom.

| Aspect | Choix | Justification |
|--------|-------|---------------|
| **Scroll/Pan** | Natif d'abord | Simple, fonctionne bien |
| **Zoom** | CSS transform | Performant, standard |
| **Persistence** | localStorage | Pas de migration DB |
| **Zoom to Fit** | Fit all d'abord | Le plus utile |

---

### P1.1 - Transform Context + Persistence

**Durée** : 1h  
**Fichiers** : 
- `src/features/boards/context/TransformContext.tsx` (nouveau)
- `src/features/boards/hooks/useTransformPersistence.ts` (nouveau)

#### Objectif

Créer un contexte React pour gérer l'état du zoom/pan avec persistence localStorage.

#### Interface

```typescript
interface TransformState {
  scale: number;      // 0.25 à 3 (25% à 300%)
  offsetX: number;    // Pan horizontal (pour future évolution)
  offsetY: number;    // Pan vertical (pour future évolution)
}

interface TransformContextValue {
  transform: TransformState;
  setScale: (scale: number) => void;
  zoomIn: () => void;       // +10%
  zoomOut: () => void;      // -10%
  resetZoom: () => void;    // → 100%
  zoomToFit: (bounds: DOMRect) => void;
}
```

#### Persistence localStorage

```typescript
// Clé: `deadstock_zoom_{boardId}`
// Valeur: { scale: number, offsetX: number, offsetY: number }

// Chargement au mount du board
// Sauvegarde debounced (300ms) à chaque changement
```

#### Tâches

- [ ] Créer `TransformContext.tsx` avec Provider
- [ ] State initial `{ scale: 1, offsetX: 0, offsetY: 0 }`
- [ ] Actions: `zoomIn` (+10%), `zoomOut` (-10%), `resetZoom`, `setScale`
- [ ] Limites: scale min 0.25, max 3
- [ ] Hook `useTransform()` pour accéder au contexte
- [ ] Persistence localStorage avec debounce
- [ ] Chargement initial depuis localStorage

#### Critères de validation

- [ ] `useTransform()` retourne le state et les actions
- [ ] `zoomIn()` augmente de 10% (max 300%)
- [ ] `zoomOut()` diminue de 10% (min 25%)
- [ ] `resetZoom()` remet à 100%
- [ ] State persisté en localStorage
- [ ] State restauré au rechargement de la page

---

### P1.2 - Zoom avec Ctrl+Scroll

**Durée** : 1h30  
**Fichier** : `src/features/boards/components/BoardCanvas.tsx`

#### Objectif

Implémenter le zoom centré sur le curseur avec Ctrl+molette.

#### Comportement attendu

```
Ctrl + Scroll Up   → Zoom in (centré sur curseur)
Ctrl + Scroll Down → Zoom out (centré sur curseur)
```

#### Implémentation

```typescript
// Dans BoardCanvas.tsx

const { transform, setScale } = useTransform();

// Wrapper pour le contenu zoomé
<div 
  className="relative origin-top-left"
  style={{ 
    transform: `scale(${transform.scale})`,
    width: canvasWidth,
    height: canvasHeight,
  }}
>
  {/* Zones et Elements */}
</div>

// Event handler
const handleWheel = useCallback((e: WheelEvent) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.min(3, Math.max(0.25, transform.scale + delta));
    
    // TODO P1.2b: Zoom centré sur curseur (optionnel, plus complexe)
    setScale(newScale);
  }
}, [transform.scale, setScale]);

// Attacher l'event (avec passive: false pour preventDefault)
useEffect(() => {
  const canvas = canvasRef.current;
  if (canvas) {
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }
}, [handleWheel]);
```

#### Tâches

- [ ] Ajouter `TransformProvider` autour de `BoardCanvas`
- [ ] Wrapper le contenu dans un div avec `transform: scale()`
- [ ] Event listener `wheel` avec détection Ctrl/Cmd
- [ ] Empêcher le zoom navigateur (`preventDefault`)
- [ ] Zoom par paliers de 10%

#### Critères de validation

- [ ] Ctrl+Scroll Up zoome
- [ ] Ctrl+Scroll Down dézoome
- [ ] Limites 25%-300% respectées
- [ ] Zoom navigateur désactivé pendant Ctrl+Scroll
- [ ] Scroll normal fonctionne toujours (sans Ctrl)

---

### P1.3a - UI Contrôles Zoom + Zoom to Fit (All)

**Durée** : 1h  
**Fichier** : `src/features/boards/components/ZoomControls.tsx` (nouveau)

#### Objectif

Ajouter des contrôles visuels pour le zoom en bas à droite.

#### Design

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                         ┌─────────────┐ │
│                                         │ [-] 100% [+]│ │
│                                         │ [  Fit  ]   │ │
│                                         └─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Composant

```typescript
interface ZoomControlsProps {
  className?: string;
}

export function ZoomControls({ className }: ZoomControlsProps) {
  const { transform, zoomIn, zoomOut, resetZoom, zoomToFit } = useTransform();
  
  const percentage = Math.round(transform.scale * 100);
  
  return (
    <div className={cn(
      "flex flex-col gap-1 bg-white/90 dark:bg-gray-800/90",
      "backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700",
      "p-2 shadow-lg",
      className
    )}>
      {/* Ligne 1: Zoom controls */}
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={zoomOut}>
          <Minus className="w-4 h-4" />
        </Button>
        <button 
          onClick={resetZoom}
          className="min-w-16 text-sm font-mono text-center hover:bg-gray-100 rounded px-2 py-1"
        >
          {percentage}%
        </button>
        <Button size="sm" variant="ghost" onClick={zoomIn}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Ligne 2: Fit button */}
      <Button size="sm" variant="outline" onClick={handleZoomToFit} className="w-full">
        <Maximize2 className="w-3 h-3 mr-1" />
        Fit
      </Button>
    </div>
  );
}
```

#### Zoom to Fit - Algorithme

```typescript
const handleZoomToFit = useCallback(() => {
  const canvasRect = canvasRef.current?.getBoundingClientRect();
  if (!canvasRect) return;
  
  // Calculer les bounds de tous les éléments
  const allBounds = [
    ...elements.map(e => ({
      left: e.positionX,
      top: e.positionY,
      right: e.positionX + (e.width || 200),
      bottom: e.positionY + (e.height || 150),
    })),
    ...zones.map(z => ({
      left: z.positionX,
      top: z.positionY,
      right: z.positionX + z.width,
      bottom: z.positionY + z.height,
    })),
  ];
  
  if (allBounds.length === 0) {
    resetZoom();
    return;
  }
  
  const contentBounds = {
    left: Math.min(...allBounds.map(b => b.left)),
    top: Math.min(...allBounds.map(b => b.top)),
    right: Math.max(...allBounds.map(b => b.right)),
    bottom: Math.max(...allBounds.map(b => b.bottom)),
  };
  
  const contentWidth = contentBounds.right - contentBounds.left + 100; // +padding
  const contentHeight = contentBounds.bottom - contentBounds.top + 100;
  
  const scaleX = canvasRect.width / contentWidth;
  const scaleY = canvasRect.height / contentHeight;
  const newScale = Math.min(scaleX, scaleY, 1); // Max 100%
  
  setScale(Math.max(0.25, newScale));
}, [elements, zones, setScale, resetZoom]);
```

#### Tâches

- [ ] Créer composant `ZoomControls.tsx`
- [ ] Boutons +/- avec icônes
- [ ] Affichage pourcentage cliquable (reset)
- [ ] Bouton "Fit" 
- [ ] Implémenter `zoomToFit` dans le contexte
- [ ] Positionner en bas à droite du canvas
- [ ] Raccourcis clavier : Ctrl+0 (100%), Ctrl+1 (Fit)

#### Critères de validation

- [ ] Bouton + zoome de 10%
- [ ] Bouton - dézoome de 10%
- [ ] Clic sur pourcentage remet à 100%
- [ ] Bouton Fit ajuste pour voir tous les éléments
- [ ] Ctrl+0 remet à 100%
- [ ] Ctrl+1 fait Fit
- [ ] UI ne gêne pas l'utilisation du canvas

---

### P1.4 - Pan avec Space+Drag (Scroll natif)

**Durée** : 1h  
**Fichier** : `src/features/boards/components/BoardCanvas.tsx`

#### Objectif

Permettre le déplacement rapide du viewport avec Space+drag.

#### Approche (Option A - Scroll natif)

Avec le scroll natif conservé, Space+Drag va simplement modifier `scrollLeft` et `scrollTop` du conteneur.

```typescript
const [isPanning, setIsPanning] = useState(false);
const [panStart, setPanStart] = useState<{ x: number; y: number; scrollX: number; scrollY: number } | null>(null);

// Détecter Space
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat && !isEditing) {
      e.preventDefault();
      setIsPanning(true);
    }
  };
  
  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      setIsPanning(false);
      setPanStart(null);
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, [isEditing]);

// Handlers pour le pan
const handlePanStart = (e: React.MouseEvent) => {
  if (!isPanning) return;
  e.preventDefault();
  
  const container = canvasRef.current;
  if (!container) return;
  
  setPanStart({
    x: e.clientX,
    y: e.clientY,
    scrollX: container.scrollLeft,
    scrollY: container.scrollTop,
  });
};

const handlePanMove = (e: React.MouseEvent) => {
  if (!isPanning || !panStart) return;
  
  const container = canvasRef.current;
  if (!container) return;
  
  const dx = e.clientX - panStart.x;
  const dy = e.clientY - panStart.y;
  
  container.scrollLeft = panStart.scrollX - dx;
  container.scrollTop = panStart.scrollY - dy;
};

const handlePanEnd = () => {
  setPanStart(null);
};
```

#### Curseur

```typescript
// Sur le conteneur canvas
className={cn(
  "flex-1 relative overflow-auto bg-gray-100 dark:bg-gray-700",
  isPanning && "cursor-grab",
  isPanning && panStart && "cursor-grabbing"
)}
```

#### Tâches

- [ ] State `isPanning` basé sur keydown/keyup Space
- [ ] Changer curseur en `grab` / `grabbing`
- [ ] Implémenter le drag pour modifier scroll
- [ ] Empêcher sélection d'éléments pendant pan
- [ ] Empêcher scroll de page avec Space

#### Critères de validation

- [ ] Space maintenu → curseur main
- [ ] Space+Drag déplace le viewport
- [ ] Relâcher Space → comportement normal
- [ ] Pas de conflit avec édition de texte
- [ ] Pas de scroll de page

---

### P1.5 - Adaptation coordonnées drag/resize

**Durée** : 1h30  
**Fichiers** : 
- `src/features/boards/components/canvas/hooks/useElementDrag.ts`
- `src/features/boards/components/canvas/hooks/useZoneDrag.ts`
- `src/features/boards/components/canvas/hooks/useZoneResize.ts`

#### Objectif

Corriger les coordonnées de drag/resize pour tenir compte du zoom.

#### Problème

À un zoom de 50%, un mouvement de 100px à l'écran correspond à 200px dans le canvas. Sans correction, le drag sera "trop lent" quand zoomé out et "trop rapide" quand zoomé in.

#### Solution

```typescript
// Dans chaque hook, récupérer le scale
const { transform } = useTransform();

// Diviser les deltas par scale
const handleMouseMove = useCallback((e: MouseEvent) => {
  const dx = (e.clientX - startRef.current.x) / transform.scale;
  const dy = (e.clientY - startRef.current.y) / transform.scale;
  
  const newX = Math.max(0, startRef.current.elementX + dx);
  const newY = Math.max(0, startRef.current.elementY + dy);
  
  // ...
}, [transform.scale]);
```

#### Fichiers à modifier

**useElementDrag.ts** :
```typescript
// Ajouter
import { useTransform } from '../../context/TransformContext';

// Dans le hook
const { transform } = useTransform();

// Dans handleElementMouseMove
const dx = (e.clientX - elementDragRef.current.startX) / transform.scale;
const dy = (e.clientY - elementDragRef.current.startY) / transform.scale;
```

**useZoneDrag.ts** :
```typescript
// Même pattern
const { transform } = useTransform();

const dx = (e.clientX - zoneDragRef.current.startX) / transform.scale;
const dy = (e.clientY - zoneDragRef.current.startY) / transform.scale;
```

**useZoneResize.ts** :
```typescript
// Même pattern pour les deltas de resize
const dx = (e.clientX - resizeRef.current.startX) / transform.scale;
const dy = (e.clientY - resizeRef.current.startY) / transform.scale;
```

#### Tâches

- [ ] Ajouter `useTransform()` dans `useElementDrag.ts`
- [ ] Diviser deltas par `scale` dans `useElementDrag.ts`
- [ ] Ajouter `useTransform()` dans `useZoneDrag.ts`
- [ ] Diviser deltas par `scale` dans `useZoneDrag.ts`
- [ ] Ajouter `useTransform()` dans `useZoneResize.ts`
- [ ] Diviser deltas par `scale` dans `useZoneResize.ts`
- [ ] Tester drag à 50%, 100%, 200%
- [ ] Tester resize à 50%, 100%, 200%

#### Critères de validation

- [ ] Drag d'élément précis à 50%
- [ ] Drag d'élément précis à 200%
- [ ] Drag de zone précis à tous les zooms
- [ ] Resize de zone précis à tous les zooms
- [ ] Ghost mode fonctionne toujours

---

### P1.6 - Pan Custom avec Inertie (Optionnel)

**Durée** : 2h  
**Prérequis** : P1.1-P1.5 terminés  
**Priorité** : Optionnel (amélioration UX)

#### Objectif

Remplacer le scroll natif par un système de pan custom pour une expérience plus fluide, similaire à Figma/Miro.

#### Pourquoi c'est optionnel

Le scroll natif (P1.4) fonctionne bien pour la plupart des cas. Le pan custom apporte :
- Inertie (le canvas continue de glisser après relâchement)
- Pan avec clic molette (en plus de Space)
- Meilleure intégration avec le zoom
- UX plus "pro"

#### Différences avec P1.4

| Aspect | P1.4 (Scroll natif) | P1.6 (Pan custom) |
|--------|---------------------|-------------------|
| Scroll | `overflow-auto` | `overflow-hidden` |
| Pan | Modifie `scrollLeft/Top` | Modifie `offsetX/Y` dans context |
| Inertie | Non | Oui |
| Clic molette | Non | Oui |
| Complexité | Simple | Moyenne |

#### Implémentation

```typescript
// TransformContext étendu
interface TransformState {
  scale: number;
  offsetX: number;  // Utilisé activement
  offsetY: number;  // Utilisé activement
}

// Nouveau hook
function usePanWithInertia() {
  const { transform, setPan } = useTransform();
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>();
  
  const startPan = (e: MouseEvent) => {
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };
  };
  
  const updatePan = (e: MouseEvent) => {
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    
    // Calculer vélocité pour inertie
    velocityRef.current = { x: dx, y: dy };
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    
    setPan(transform.offsetX + dx, transform.offsetY + dy);
  };
  
  const endPan = () => {
    // Démarrer animation inertie
    const animate = () => {
      const { x, y } = velocityRef.current;
      
      if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) {
        return; // Stop
      }
      
      // Friction
      velocityRef.current = { x: x * 0.95, y: y * 0.95 };
      setPan(transform.offsetX + x, transform.offsetY + y);
      
      rafRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };
  
  return { startPan, updatePan, endPan };
}
```

#### CSS pour pan custom

```typescript
// Le conteneur n'a plus de scroll
<div className="flex-1 relative overflow-hidden">
  
  {/* Le contenu est translaté ET scalé */}
  <div style={{
    transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`,
    transformOrigin: '0 0',
  }}>
    {/* Zones et Elements */}
  </div>
</div>
```

#### Tâches

- [ ] Modifier le conteneur en `overflow-hidden`
- [ ] Utiliser `offsetX/Y` du context pour la translation
- [ ] Implémenter `usePanWithInertia` hook
- [ ] Ajouter support clic molette pour pan
- [ ] Animation inertie avec `requestAnimationFrame`
- [ ] Friction configurable
- [ ] Tester performance avec 50+ éléments

#### Critères de validation

- [ ] Space+Drag avec inertie
- [ ] Clic molette + drag pour pan
- [ ] Inertie fluide (pas saccadé)
- [ ] Pan s'arrête progressivement
- [ ] Fonctionne bien avec zoom
- [ ] Pas de régression performance

---

### Résumé P1

| Tâche | Durée | Priorité | Description |
|-------|-------|----------|-------------|
| P1.1 | 1h | Core | Transform Context + localStorage |
| P1.2 | 1h30 | Core | Zoom Ctrl+Scroll |
| P1.3a | 1h | Core | UI Contrôles + Zoom to Fit (all) |
| P1.4 | 1h | Core | Pan Space+Drag (scroll natif) |
| P1.5 | 1h30 | Core | Adaptation coordonnées |
| P1.6 | 2h | Optionnel | Pan custom avec inertie |

**Total Core** : 6h  
**Total avec optionnel** : 8h

### Critères de validation P1 (Core)

- [ ] Ctrl+Scroll zoome/dézoome
- [ ] Boutons +/- fonctionnels
- [ ] Pourcentage affiché et cliquable
- [ ] Bouton Fit fonctionne
- [ ] Ctrl+0 → 100%, Ctrl+1 → Fit
- [ ] Space+Drag pour pan
- [ ] Curseur change en main pendant pan
- [ ] Drag d'éléments correct à tous les zooms
- [ ] Resize de zone correct à tous les zooms
- [ ] Zoom persisté en localStorage
- [ ] Pas de régression sur Ghost Mode

---

## Sprint P2 : Auto-Arrange

**Durée estimée** : 4-6h  
**Prérequis** : P0 ✅  
**Priorité** : P2

### Objectif

Permettre aux utilisateurs de ranger automatiquement les éléments du board par phase Journey.

### P2.1 - Algorithme de layout par phase

**Durée** : 2h  
**Fichier** : `src/features/boards/utils/autoArrange.ts` (nouveau)

#### Mapping ElementType → Phase

```typescript
const ELEMENT_TO_PHASE: Record<ElementType, PhaseId> = {
  // Mood
  inspiration: 'mood',
  palette: 'mood',
  silhouette: 'mood',
  video: 'mood',
  link: 'mood',
  pdf: 'mood',
  note: 'mood',
  
  // Conception
  pattern: 'conception',
  calculation: 'conception',
  textile: 'conception',
};
```

#### Algorithme

```typescript
interface ArrangeOptions {
  spacing: number;        // Espacement entre éléments (défaut: 24px)
  phaseSpacing: number;   // Espacement entre phases (défaut: 100px)
  startX: number;         // Position X de départ
  startY: number;         // Position Y de départ
}

interface ArrangeResult {
  elementMoves: Array<{ id: string; x: number; y: number }>;
  zoneMoves: Array<{ id: string; x: number; y: number }>;
}

function autoArrangeByPhase(
  elements: BoardElement[],
  zones: BoardZone[],
  options: ArrangeOptions
): ArrangeResult {
  // 1. Grouper les éléments libres par phase
  // 2. Pour chaque phase, layout en grille
  // 3. Les zones vont dans "Exécution"
  // 4. Les éléments DANS une zone ne bougent pas (positions relatives)
}
```

### P2.2 - Dialog de confirmation

**Durée** : 1h  
**Fichier** : `src/features/boards/components/AutoArrangeDialog.tsx` (nouveau)

```
┌─────────────────────────────────────────┐
│ 🗂️ Ranger automatiquement              │
├─────────────────────────────────────────┤
│                                         │
│  Les éléments seront organisés par      │
│  phase : Mood → Conception → Exécution  │
│                                         │
│  📊 Aperçu :                            │
│  • 5 éléments Mood                      │
│  • 3 éléments Conception                │
│  • 2 zones Exécution                    │
│                                         │
│  Espacement : [────●────] 24px          │
│                                         │
│           [Annuler]  [Ranger]           │
└─────────────────────────────────────────┘
```

### P2.3 - Animation de transition

**Durée** : 1h  
**Fichier** : `src/features/boards/components/BoardCanvas.tsx`

```typescript
const [isArranging, setIsArranging] = useState(false);
const [arrangeTargets, setArrangeTargets] = useState<Map<string, {x: number, y: number}>>();

// Pendant l'animation, utiliser les positions cibles avec transition CSS
style={{
  left: isArranging && arrangeTargets?.get(element.id) 
    ? arrangeTargets.get(element.id)!.x 
    : element.positionX,
  top: isArranging && arrangeTargets?.get(element.id)
    ? arrangeTargets.get(element.id)!.y
    : element.positionY,
  transition: isArranging ? 'left 0.5s ease-out, top 0.5s ease-out' : 'none',
}}
```

### P2.4 - Bouton dans toolbar

**Durée** : 30min

Ajouter un bouton "Ranger" dans `BoardToolbar.tsx`.

### Critères de validation P2

- [ ] Bouton "Ranger" dans la toolbar
- [ ] Dialog de confirmation avec aperçu
- [ ] Éléments Mood groupés à gauche
- [ ] Éléments Conception groupés au centre
- [ ] Zones dans Exécution à droite
- [ ] Éléments dans une zone restent dans la zone
- [ ] Animation fluide de transition
- [ ] Positions sauvegardées en DB après arrangement

---

## Sprint P3 : Outils de Visualisation

**Durée estimée** : 4-6h  
**Prérequis** : P1  
**Priorité** : P3

### P3.1 - Minimap

**Durée** : 2h  
**Fichier** : `src/features/boards/components/Minimap.tsx` (nouveau)

Vue miniature du canvas entier avec rectangle viewport.

### P3.2 - Navigation rapide vers zone

**Durée** : 1h  
**Fichier** : `src/features/boards/components/ZoneNavigator.tsx` (nouveau)

Dropdown "Aller à..." avec liste des zones et phases.

### P3.3 - Guides d'alignement

**Durée** : 2h  
**Fichier** : `src/features/boards/components/AlignmentGuides.tsx` (nouveau)

Lignes d'aide à l'alignement pendant le drag.

### P3.4 - Recherche sur board

**Durée** : 1h  
**Fichier** : `src/features/boards/components/BoardSearch.tsx` (nouveau)

Ctrl+F pour chercher un élément par nom/contenu.

---

## Récapitulatif et Priorisation

### Vue d'ensemble des sprints

| Sprint | Durée | Priorité | Status |
|--------|-------|----------|--------|
| **P0 : Performance** | 2h | P0 | ✅ **TERMINÉ** |
| **P1 : Zoom & Pan** | 6-8h | P1 | 🔜 À faire |
| **P2 : Auto-Arrange** | 4-6h | P2 | ⏳ Planifié |
| **P3 : Visualisation** | 4-6h | P3 | ⏳ Planifié |

### Détail P1

| Tâche | Durée | Status |
|-------|-------|--------|
| P1.1 Transform Context | 1h | ⬜ |
| P1.2 Zoom Ctrl+Scroll | 1h30 | ⬜ |
| P1.3a UI + Fit | 1h | ⬜ |
| P1.4 Pan Space+Drag | 1h | ⬜ |
| P1.5 Coordonnées | 1h30 | ⬜ |
| P1.6 Pan custom (opt) | 2h | ⬜ Optionnel |

### Ordre d'exécution

```
✅ Fait :
└── P0 : Performance (2h)

🔜 À faire :
├── P1.1 : Transform Context (1h)
├── P1.2 : Zoom Ctrl+Scroll (1h30)
├── P1.3a : UI + Fit (1h)
├── P1.4 : Pan Space+Drag (1h)
├── P1.5 : Coordonnées (1h30)
└── P1.6 : Pan custom (2h) - optionnel

⏳ Planifié :
├── P2 : Auto-Arrange (4-6h)
└── P3 : Visualisation (4-6h)
```

### Dépendances

```
P0 Performance ✅ ──┬──────────────────────────────────┐
                    │                                  │
                    ▼                                  ▼
             P1 Zoom/Pan                       P2 Auto-Arrange
                    │
                    ├── P1.6 Pan custom (optionnel)
                    │
                    ▼
             P3 Visualisation
```

---

## Annexes

### A. Raccourcis clavier prévus

| Raccourci | Action | Sprint |
|-----------|--------|--------|
| `Suppr` / `Backspace` | Supprimer sélection | ✅ Existant |
| `Escape` | Fermer modal / Déselectionner | ✅ Existant |
| `Ctrl+Scroll` | Zoom | P1.2 |
| `Space+Drag` | Pan | P1.4 |
| `Ctrl+0` | Zoom 100% | P1.3a |
| `Ctrl+1` | Zoom to fit | P1.3a |
| `Ctrl+F` | Recherche | P3.4 |

### B. localStorage keys

| Clé | Valeur | Sprint |
|-----|--------|--------|
| `deadstock_zoom_{boardId}` | `{ scale, offsetX, offsetY }` | P1.1 |

### C. Statuts de zone/projet

```typescript
type ProjectStatus =
  | 'draft'
  | 'in_progress'
  | 'ordered'
  | 'shipped'
  | 'received'
  | 'in_production'
  | 'completed'
  | 'archived';
```

---

## Changelog

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0 | 17/01/2026 | Création initiale |
| 1.1 | 17/01/2026 | P0 terminé |
| 1.2 | 17/01/2026 | P1 révisé : persistence localStorage, P1.6 optionnel documenté, Zoom to Fit simplifié |
