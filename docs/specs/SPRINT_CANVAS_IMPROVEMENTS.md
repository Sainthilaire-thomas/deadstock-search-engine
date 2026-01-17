# SPRINT PLAN - Canvas Improvements (Zoom, Pan, Auto-arrange, Performance)

**Version** : 1.0  
**Date** : 17 Janvier 2026  
**Contexte** : Post-MVP Phase 1, amélioration UX BoardCanvas  
**Auteur** : Thomas / Claude

---

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Diagnostic Performance Actuel](#diagnostic-performance-actuel)
3. [Sprint P0 : Performance Fondations](#sprint-p0--performance-fondations)
4. [Sprint P1+ : Zoom & Pan](#sprint-p1--zoom--pan)
5. [Sprint P2+ : Auto-Arrange](#sprint-p2--auto-arrange)
6. [Sprint P3+ : Outils de Visualisation](#sprint-p3--outils-de-visualisation)
7. [Récapitulatif et Priorisation](#récapitulatif-et-priorisation)

---

## Vue d'Ensemble

### Objectifs

Améliorer l'expérience utilisateur du BoardCanvas pour :
1. **Performance** : Garantir 60fps avec 50-100 éléments
2. **Navigation** : Zoom infini et pan fluide
3. **Organisation** : Auto-arrangement par phase Journey
4. **Visualisation** : Outils d'aide à la navigation et l'organisation

### Architecture Actuelle

```
BoardCanvas.tsx
├── BoardToolbar.tsx          # Outils création (gauche)
├── ZoneCard.tsx              # Zones (cristallisées ou non)
├── ElementCard.tsx           # Éléments (tous types)
│   └── elements/
│       ├── PaletteElement.tsx
│       ├── ImageElement.tsx
│       ├── VideoElement.tsx
│       ├── LinkElement.tsx
│       ├── PdfElement.tsx
│       ├── PatternElement.tsx
│       └── SilhouetteElement.tsx
├── canvas/
│   └── hooks/
│       ├── useElementDrag.ts
│       ├── useZoneDrag.ts
│       ├── useZoneResize.ts
│       └── useKeyboardShortcuts.ts
└── ContextualSearchPanel.tsx
```

### État Actuel du Canvas

| Aspect | Implémentation actuelle |
|--------|------------------------|
| **Zoom** | Aucun |
| **Pan** | Scroll natif (`overflow-auto`) |
| **Organisation** | Manuelle uniquement (drag & drop) |
| **Limites canvas** | Dynamiques (max positions + 100px) |
| **Performance** | Non optimisée (pas de memo) |

---

## Diagnostic Performance Actuel

### Analyse des Composants

| Composant | Lignes | React.memo | Hook contexte | Risque perf |
|-----------|--------|------------|---------------|-------------|
| `ElementCard` | ~350 | ❌ Non | ✅ `useContextualSearchPanel` | 🔴 Élevé |
| `ZoneCard` | ~230 | ❌ Non | ❌ Non | 🟡 Moyen |
| `PaletteElement` | ~60 | ❌ Non | ❌ Non | 🟢 Faible |
| `ImageElement` | ~40 | ❌ Non | ❌ Non | 🟢 Faible |
| Autres elements/ | ~40-80 | ❌ Non | ❌ Non | 🟢 Faible |

### Problèmes Identifiés

#### 1. Absence de mémoïsation

Chaque changement de state dans `BoardCanvas` déclenche le re-render de TOUS les composants enfants, même ceux dont les props n'ont pas changé.

#### 2. Hook contexte dans ElementCard

```typescript
// Chaque ElementCard souscrit au contexte
const { toggleConstraint } = useContextualSearchPanel();
```

Même les éléments qui n'utilisent pas les contraintes (textile, note, video...) souscrivent au contexte.

#### 3. Drag de zone avec éléments

```typescript
// useZoneDrag.ts - À chaque mousemove :
setZoneDragElementPositions(newPositions); // Re-render de TOUS les éléments de la zone
```

**Impact** : Zone avec 20 éléments = 20 re-renders × 60fps = **1200 re-renders/seconde**

### Scénarios de Performance

| Scénario | Éléments re-rendus/mousemove | Risque lag |
|----------|------------------------------|------------|
| Drag élément isolé | 1 | ✅ Aucun |
| Drag zone vide | 1 | ✅ Aucun |
| Drag zone 5 éléments | 6 | ✅ Aucun |
| Drag zone 20 éléments | 21 | ⚠️ Possible |
| Drag zone 50 éléments | 51 | 🔴 Probable |

---

## Sprint P0 : Performance Fondations

**Durée estimée** : 2-3h  
**Prérequis** : Aucun  
**Priorité** : P0 (Bloquant pour sprints suivants)  
**Objectif** : Garantir fluidité 60fps pour boards avec 50-100 éléments

---

### P0.1 - React.memo sur ElementCard

**Durée** : 15min  
**Fichier** : `src/features/boards/components/ElementCard.tsx`

#### Problème

ElementCard (~350 lignes) se re-render à chaque changement de position d'un autre élément, même si ses propres props n'ont pas changé.

#### Solution

```typescript
// Avant (ligne ~47)
export function ElementCard({
  element,
  isSelected,
  isEditing,
  onMouseDown,
  onDoubleClick,
  onSaveNote,
  onCancelEdit,
  onDelete,
  onSavePalette,
}: ElementCardProps) {
  // ...
}

// Après
export const ElementCard = React.memo(function ElementCard({
  element,
  isSelected,
  isEditing,
  onMouseDown,
  onDoubleClick,
  onSaveNote,
  onCancelEdit,
  onDelete,
  onSavePalette,
}: ElementCardProps) {
  // ... code existant inchangé
});
```

#### Critères de validation

- [ ] Le composant ne re-render que si ses props changent
- [ ] Double-clic pour éditer fonctionne toujours
- [ ] Boutons hover (supprimer, contrainte) fonctionnent
- [ ] Drag & drop fonctionne

---

### P0.2 - React.memo sur ZoneCard

**Durée** : 10min  
**Fichier** : `src/features/boards/components/ZoneCard.tsx`

#### Solution

```typescript
// Avant (ligne ~25)
export function ZoneCard({
  zone,
  isSelected,
  isEditing,
  isVisible = true,
  onMouseDown,
  onDoubleClick,
  onResizeStart,
  onSaveName,
  onCancelEdit,
  onCrystallize,
  onDelete,
}: ZoneCardProps) {
  // ...
}

// Après
export const ZoneCard = React.memo(function ZoneCard({
  zone,
  isSelected,
  isEditing,
  isVisible = true,
  onMouseDown,
  onDoubleClick,
  onResizeStart,
  onSaveName,
  onCancelEdit,
  onCrystallize,
  onDelete,
}: ZoneCardProps) {
  // ... code existant inchangé
});
```

#### Critères de validation

- [ ] Le composant ne re-render que si ses props changent
- [ ] Double-clic pour éditer le nom fonctionne
- [ ] Resize handles fonctionnent
- [ ] Bouton cristalliser fonctionne

---

### P0.3 - React.memo sur éléments enfants

**Durée** : 20min  
**Fichiers** :
- `src/features/boards/components/elements/PaletteElement.tsx`
- `src/features/boards/components/elements/ImageElement.tsx`
- `src/features/boards/components/elements/VideoElement.tsx`
- `src/features/boards/components/elements/LinkElement.tsx`
- `src/features/boards/components/elements/PdfElement.tsx`
- `src/features/boards/components/elements/PatternElement.tsx`
- `src/features/boards/components/elements/SilhouetteElement.tsx`

#### Solution (pour chaque fichier)

```typescript
// Avant
export function XxxElement({ data, width, height }: XxxElementProps) {
  // ...
}

// Après
export const XxxElement = React.memo(function XxxElement({ 
  data, 
  width, 
  height 
}: XxxElementProps) {
  // ... code existant inchangé
});
```

#### Critères de validation

- [ ] Chaque composant mémoïsé
- [ ] Aucune régression visuelle
- [ ] Interactions préservées

---

### P0.4 - Ghost Mode pour drag de zone

**Durée** : 1h30  
**Fichiers** :
- `src/features/boards/components/canvas/hooks/useZoneDrag.ts`
- `src/features/boards/components/BoardCanvas.tsx`
- `src/features/boards/components/ZoneCard.tsx`

#### Concept

Au lieu de recalculer et re-rendre 20+ éléments pendant le drag d'une zone, les éléments disparaissent temporairement et réapparaissent à la nouvelle position au relâchement.

```
AVANT (actuel) :                      APRÈS (ghost mode) :
┌─────────────────┐                   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│ Zone            │                     Zone (ghost)      ← Bordure pointillée
│ ┌───┐ ┌───┐    │   drag →         │                 │   semi-transparente
│ │ A │ │ B │    │                     (15 éléments)    
│ └───┘ └───┘    │                   └ ─ ─ ─ ─ ─ ─ ─ ─ ┘
│ ┌───┐          │                   
│ │ C │          │                   Éléments A, B, C masqués
│ └───┘          │                   pendant le drag
└─────────────────┘                   
                                      Au mouseUp → réapparaissent
                                      aux nouvelles positions
```

#### P0.4.1 - Modifier useZoneDrag

**Fichier** : `src/features/boards/components/canvas/hooks/useZoneDrag.ts`

```typescript
// Ajouter au state
const [draggingZoneId, setDraggingZoneId] = useState<string | null>(null);
const [draggingElementCount, setDraggingElementCount] = useState<number>(0);

// Modifier l'interface de retour
interface UseZoneDragReturn {
  dragPosition: DragPosition | null;
  zoneDragElementPositions: Record<string, { x: number; y: number }>;
  draggingZoneId: string | null;           // ← NOUVEAU
  draggingElementCount: number;            // ← NOUVEAU
  handleZoneMouseDown: (e: React.MouseEvent, zone: BoardZone) => void;
}

// Dans handleZoneMouseDown - capturer l'info mais NE PAS mettre à jour pendant drag
const handleZoneMouseDown = useCallback((e: React.MouseEvent, zone: BoardZone) => {
  // ... code existant ...
  
  if (zone.crystallizedAt && zone.linkedProjectId) {
    const elementsInZone = getElementsInZone(elements, zone);
    containedElements = elementsInZone.map(el => ({
      id: el.id,
      startX: el.positionX,
      startY: el.positionY,
    }));
    setDraggingElementCount(elementsInZone.length);  // ← NOUVEAU
  }
  
  setDraggingZoneId(zone.id);  // ← NOUVEAU
  
  // ... reste du code ...
}, [...]);

// Dans handleZoneMouseMove - SUPPRIMER la mise à jour des positions éléments
const handleZoneMouseMove = useCallback((e: MouseEvent) => {
  if (!zoneDragRef.current) return;

  const dx = e.clientX - zoneDragRef.current.startX;
  const dy = e.clientY - zoneDragRef.current.startY;
  const newX = Math.max(0, zoneDragRef.current.zoneStartX + dx);
  const newY = Math.max(0, zoneDragRef.current.zoneStartY + dy);

  setDragPosition({ type: 'zone', id: zoneDragRef.current.zoneId, x: newX, y: newY });
  
  // ❌ SUPPRIMER ce bloc :
  // if (zoneDragRef.current.containedElements && ...) {
  //   const newPositions = ...
  //   setZoneDragElementPositions(newPositions);
  // }
}, []);

// Dans handleZoneMouseUp - appliquer les positions finales
const handleZoneMouseUp = useCallback(() => {
  document.removeEventListener('mousemove', handleZoneMouseMove);
  document.removeEventListener('mouseup', handleZoneMouseUp);

  const pos = dragPositionRef.current;
  const dragData = zoneDragRef.current;

  // Reset states
  setDragPosition(null);
  setZoneDragElementPositions({});
  setDraggingZoneId(null);           // ← NOUVEAU
  setDraggingElementCount(0);        // ← NOUVEAU
  zoneDragRef.current = null;
  setDragging(false);

  if (pos && pos.type === 'zone') {
    moveZoneLocal(pos.id, pos.x, pos.y);
    saveZonePosition(pos.id, pos.x, pos.y);

    // Mettre à jour les éléments SEULEMENT au mouseUp
    if (dragData?.containedElements && dragData.containedElements.length > 0) {
      const dx = pos.x - dragData.zoneStartX;
      const dy = pos.y - dragData.zoneStartY;

      const elementMoves = dragData.containedElements.map(el => ({
        elementId: el.id,
        positionX: el.startX + dx,
        positionY: el.startY + dy,
      }));

      // Mise à jour locale immédiate
      elementMoves.forEach(move => {
        moveElementLocal(move.elementId, move.positionX, move.positionY);
      });

      // Sauvegarde async
      bulkMoveElementsAction(elementMoves).catch(console.error);
    }
  }
}, [...]);
```

#### P0.4.2 - Modifier BoardCanvas pour masquer les éléments

**Fichier** : `src/features/boards/components/BoardCanvas.tsx`

```typescript
// Récupérer les nouvelles valeurs du hook
const { 
  dragPosition: zoneDragPosition, 
  zoneDragElementPositions, 
  draggingZoneId,              // ← NOUVEAU
  draggingElementCount,        // ← NOUVEAU
  handleZoneMouseDown 
} = useZoneDrag({...});

// Dans le rendu des éléments
{elements.map((element) => {
  // Ghost mode : masquer les éléments dans la zone en cours de drag
  if (draggingZoneId) {
    const draggingZone = zones.find(z => z.id === draggingZoneId);
    if (draggingZone && isElementInZone(element, draggingZone)) {
      return null; // Ne pas rendre pendant le drag
    }
  }
  
  // ... reste du code de rendu existant ...
})}
```

#### P0.4.3 - Style ghost sur ZoneCard

**Fichier** : `src/features/boards/components/ZoneCard.tsx`

```typescript
// Ajouter les props
interface ZoneCardProps {
  // ... existant ...
  isDragging?: boolean;          // ← NOUVEAU
  draggingElementCount?: number; // ← NOUVEAU
}

export const ZoneCard = React.memo(function ZoneCard({
  // ... existant ...
  isDragging = false,
  draggingElementCount = 0,
}: ZoneCardProps) {
  // ...
  
  return (
    <div
      className={`
        group
        absolute transition-all duration-300 ease-in-out
        ${shouldShow ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
        ${isDragging 
          ? 'opacity-60 border-2 border-dashed border-gray-400 bg-gray-100/50 dark:bg-gray-800/50' 
          : isCrystallized
            ? 'border border-solid border-gray-400 bg-gray-50/50 dark:bg-gray-800/30'
            : 'border-2 border-dashed border-gray-300 dark:border-gray-600 bg-transparent'
        }
        // ... reste des classes
      `}
      // ...
    >
      {/* Indicateur du nombre d'éléments pendant le drag */}
      {isDragging && draggingElementCount > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-900/80 px-3 py-1 rounded-full">
            {draggingElementCount} élément{draggingElementCount > 1 ? 's' : ''}
          </span>
        </div>
      )}
      
      {/* ... reste du contenu ... */}
    </div>
  );
});
```

#### P0.4.4 - Passer les props dans BoardCanvas

```typescript
// Dans BoardCanvas.tsx, rendu des zones
{zones.map((zone) => {
  const isDragging = zoneDragPosition?.id === zone.id;
  // ...
  
  return (
    <ZoneCard
      key={zone.id}
      zone={{...}}
      isDragging={isDragging}                           // ← NOUVEAU
      draggingElementCount={isDragging ? draggingElementCount : 0}  // ← NOUVEAU
      // ... autres props ...
    />
  );
})}
```

#### Critères de validation

- [ ] Pendant le drag d'une zone, les éléments dedans disparaissent
- [ ] La zone affiche un style "ghost" (semi-transparent, bordure pointillée)
- [ ] Le compteur d'éléments s'affiche au centre de la zone ghost
- [ ] Au relâchement, les éléments réapparaissent aux bonnes positions
- [ ] Aucun lag perceptible même avec 30 éléments dans la zone
- [ ] Zones non-cristallisées fonctionnent de la même manière

---

### P0.5 - Throttle mousemove (Optionnel/Fallback)

**Durée** : 15min  
**Fichiers** :
- `src/features/boards/components/canvas/hooks/useElementDrag.ts`
- `src/features/boards/components/canvas/hooks/useZoneDrag.ts`

**Note** : À implémenter seulement si lag persiste après P0.1-P0.4

#### Solution

```typescript
import { throttle } from 'lodash';

// Dans useElementDrag.ts
const handleElementMouseMove = useMemo(
  () => throttle((e: MouseEvent) => {
    if (!elementDragRef.current) return;
    
    const dx = e.clientX - elementDragRef.current.startX;
    const dy = e.clientY - elementDragRef.current.startY;
    const newX = Math.max(0, elementDragRef.current.elementStartX + dx);
    const newY = Math.max(0, elementDragRef.current.elementStartY + dy);

    setDragPosition({
      type: 'element',
      id: elementDragRef.current.elementId,
      x: newX,
      y: newY
    });
  }, 16), // ~60fps max
  []
);

// Attention : penser à cancel le throttle au unmount
useEffect(() => {
  return () => {
    handleElementMouseMove.cancel();
  };
}, [handleElementMouseMove]);
```

---

### Ordre d'exécution P0

```
P0.1 (memo ElementCard)     ──┐
P0.2 (memo ZoneCard)        ──┼── Phase 1 : 30min total (parallélisables)
P0.3 (memo elements/*)      ──┘
                              │
                              ▼
                           TESTER
                              │
                              ▼
P0.4 (Ghost mode)           ──── Phase 2 : 1h30
                              │
                              ▼
                           TESTER
                              │
                              ▼
P0.5 (Throttle)             ──── Phase 3 : 15min (si nécessaire)
```

---

### Tests de validation Sprint P0

#### Préparation

1. Créer un board de test avec :
   - 50 éléments variés (textiles, palettes, notes, images, etc.)
   - 3 zones
   - ~15-20 éléments dans chaque zone
   - 1 zone cristallisée avec 20 éléments

#### Scénarios de test

| Test | Action | Résultat attendu |
|------|--------|------------------|
| T1 | Drag élément isolé | Fluide 60fps |
| T2 | Drag zone vide | Fluide 60fps |
| T3 | Drag zone cristallisée 20 éléments | Fluide, éléments disparaissent pendant drag |
| T4 | Relâcher zone après drag | Éléments réapparaissent aux bonnes positions |
| T5 | Double-clic note pour éditer | Ouvre l'éditeur |
| T6 | Supprimer élément | Suppression immédiate |
| T7 | Resize zone | Fluide, handles fonctionnent |

#### Métriques cibles

| Scénario | FPS cible | Acceptable |
|----------|-----------|------------|
| Drag élément isolé | 60 | >50 |
| Drag zone 15 éléments (ghost) | 60 | >55 |
| Drag zone 30 éléments (ghost) | 60 | >55 |

---

## Sprint P1+ : Zoom & Pan

**Durée estimée** : 6-8h  
**Prérequis** : Sprint P0 complété  
**Priorité** : P1

---

### Vue d'ensemble Zoom/Pan

#### Approche technique recommandée

**CSS Transform sur conteneur** pour performance optimale :

```typescript
<div className="canvas-viewport" style={{ overflow: 'hidden' }}>
  <div 
    className="canvas-world"
    style={{
      transform: `scale(${zoom}) translate(${-panX}px, ${-panY}px)`,
      transformOrigin: '0 0',
      willChange: 'transform',
    }}
  >
    {zones.map(...)}
    {elements.map(...)}
  </div>
</div>
```

#### État du viewport

```typescript
interface CanvasViewport {
  zoom: number;    // 0.25 à 4.0 (25% à 400%)
  panX: number;    // offset X en pixels "world"
  panY: number;    // offset Y en pixels "world"
}

// Conversion coordonnées
function screenToWorld(screenX: number, screenY: number, viewport: CanvasViewport) {
  return {
    x: screenX / viewport.zoom + viewport.panX,
    y: screenY / viewport.zoom + viewport.panY,
  };
}

function worldToScreen(worldX: number, worldY: number, viewport: CanvasViewport) {
  return {
    x: (worldX - viewport.panX) * viewport.zoom,
    y: (worldY - viewport.panY) * viewport.zoom,
  };
}
```

---

### P1.1 - Hook useCanvasViewport

**Durée** : 1h30  
**Fichier** : `src/features/boards/components/canvas/hooks/useCanvasViewport.ts`

```typescript
interface UseCanvasViewportProps {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  onViewportChange?: (viewport: CanvasViewport) => void;
}

interface UseCanvasViewportReturn {
  viewport: CanvasViewport;
  containerRef: RefObject<HTMLDivElement>;
  // Zoom
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (level: number) => void;
  zoomToFit: (bounds: { minX: number; minY: number; maxX: number; maxY: number }) => void;
  // Pan
  panTo: (x: number, y: number) => void;
  panBy: (dx: number, dy: number) => void;
  // Conversion
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number };
  worldToScreen: (worldX: number, worldY: number) => { x: number; y: number };
  // État
  isPanning: boolean;
}
```

#### Fonctionnalités à implémenter

- [ ] Zoom molette (Ctrl+scroll) centré sur curseur
- [ ] Pan avec Space+drag
- [ ] Zoom presets (25%, 50%, 75%, 100%, 150%, 200%)
- [ ] Zoom to fit (calculer bounds de tous les éléments)
- [ ] Limites zoom (25% min, 400% max)
- [ ] Persistence du viewport dans localStorage (optionnel)

---

### P1.2 - Intégration dans BoardCanvas

**Durée** : 1h  
**Fichier** : `src/features/boards/components/BoardCanvas.tsx`

#### Modifications

- [ ] Remplacer `overflow-auto` par `overflow-hidden`
- [ ] Ajouter div wrapper avec transform
- [ ] Adapter les handlers de drag pour conversion coordonnées
- [ ] Mettre à jour le calcul de position des nouveaux éléments

---

### P1.3 - UI Contrôles Zoom

**Durée** : 1h30  
**Fichier** : `src/features/boards/components/ZoomControls.tsx`

```
┌──────────────────────────────────────────────────┐
│                                          [100%]  │ ← Indicateur zoom actuel
│                                                  │
│                                                  │
│                                                  │
│                                                  │
│                                                  │
│  [−] ────●──── [+]  [⊡]                         │ ← Barre zoom + Fit
└──────────────────────────────────────────────────┘
```

#### Composants

- [ ] Slider zoom (25% → 400%)
- [ ] Boutons +/- (incréments de 25%)
- [ ] Bouton "Fit" (zoom to fit all)
- [ ] Affichage pourcentage actuel
- [ ] Raccourcis clavier (Ctrl+0 = 100%, Ctrl+1 = fit)

---

### P1.4 - Adaptation des hooks de drag

**Durée** : 2h  
**Fichiers** :
- `src/features/boards/components/canvas/hooks/useElementDrag.ts`
- `src/features/boards/components/canvas/hooks/useZoneDrag.ts`
- `src/features/boards/components/canvas/hooks/useZoneResize.ts`

#### Modifications

Tous les calculs de position doivent utiliser `screenToWorld` :

```typescript
// Avant
const newX = Math.max(0, elementStartX + dx);

// Après  
const worldDelta = screenToWorld(dx, dy, viewport);
const newX = Math.max(0, elementStartX + worldDelta.x / viewport.zoom);
```

---

### Critères de validation P1

- [ ] Ctrl+scroll zoome centré sur curseur
- [ ] Space+drag permet de naviguer (pan)
- [ ] Slider zoom fonctionne
- [ ] Bouton "Fit" ajuste la vue à tous les éléments
- [ ] Drag & drop fonctionne à tous les niveaux de zoom
- [ ] Resize zone fonctionne à tous les niveaux de zoom
- [ ] Double-clic pour éditer fonctionne à tous les niveaux de zoom
- [ ] Performance maintenue (60fps)

---

## Sprint P2+ : Auto-Arrange

**Durée estimée** : 4-6h  
**Prérequis** : Sprint P0 complété  
**Priorité** : P2

---

### Concept Auto-Arrange

Réorganiser automatiquement les éléments du board par phase Journey :

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              BOARD                                       │
├───────────────────┬─────────────────────┬───────────────────────────────┤
│       MOOD        │     CONCEPTION      │          EXÉCUTION            │
│     (gauche)      │      (centre)       │          (droite)             │
├───────────────────┼─────────────────────┼───────────────────────────────┤
│ Éléments isolés : │ Éléments isolés :   │ Zones triées par maturité :   │
│ • inspiration     │ • pattern           │  1. Non cristallisées         │
│ • palette         │ • calculation       │  2. Cristallisées draft       │
│ • silhouette      │ • textile           │  3. ordered                   │
│ • video           │                     │  4. shipped                   │
│ • link            │                     │  5. received                  │
│ • pdf             │                     │  6. in_production             │
│ • note            │                     │  7. completed                 │
└───────────────────┴─────────────────────┴───────────────────────────────┘
```

### Règles de placement

| Règle | Description |
|-------|-------------|
| **Éléments dans zone** | Restent dans leur zone, ne sont pas réarrangés individuellement |
| **Éléments isolés** | Triés par phase (Mood → gauche, Conception → centre) |
| **Zones** | Placées dans Exécution (droite), triées par statut |
| **Note** | Les notes peuvent appartenir à Mood (isolées) ou rester avec leur zone |

### Ordre de tri des zones (Exécution)

```typescript
const ZONE_STATUS_ORDER: Record<ProjectStatus | 'not_crystallized', number> = {
  'not_crystallized': 0,  // Zones non cristallisées en premier
  'draft': 1,
  'in_progress': 2,
  'ordered': 3,
  'shipped': 4,
  'received': 5,
  'in_production': 6,
  'completed': 7,
  'archived': 8,
};
```

---

### P2.1 - Algorithme de layout

**Durée** : 2h  
**Fichier** : `src/features/boards/utils/autoArrange.ts`

```typescript
interface ArrangeOptions {
  gap: number;              // Espacement entre éléments (défaut: 24px)
  sectionGap: number;       // Espacement entre sections (défaut: 80px)
  startX: number;           // Position X de départ (défaut: 40px)
  startY: number;           // Position Y de départ (défaut: 40px)
  maxWidth: number;         // Largeur max par section (défaut: viewport width / 3)
}

interface ArrangeResult {
  elements: Array<{ id: string; x: number; y: number }>;
  zones: Array<{ id: string; x: number; y: number }>;
  bounds: { width: number; height: number };
}

function autoArrange(
  elements: BoardElement[],
  zones: BoardZone[],
  options?: Partial<ArrangeOptions>
): ArrangeResult;
```

#### Sous-fonctions

```typescript
// Grouper les éléments par phase
function groupElementsByPhase(elements: BoardElement[], zones: BoardZone[]): {
  mood: BoardElement[];
  conception: BoardElement[];
  inZones: Map<string, BoardElement[]>;
};

// Layout type "masonry" pour une liste d'éléments
function layoutMasonry(
  items: Array<{ id: string; width: number; height: number }>,
  containerWidth: number,
  gap: number
): Array<{ id: string; x: number; y: number }>;

// Trier les zones par statut
function sortZonesByStatus(zones: BoardZone[]): BoardZone[];
```

---

### P2.2 - UI Bouton Auto-Arrange

**Durée** : 1h  
**Fichiers** :
- `src/features/boards/components/BoardToolbar.tsx`
- `src/features/boards/components/AutoArrangeDialog.tsx` (nouveau)

#### Bouton dans toolbar

```typescript
<ToolButton
  icon={<LayoutGrid className="w-5 h-5" />}
  tooltip="Ranger automatiquement"
  onClick={() => setShowArrangeDialog(true)}
/>
```

#### Dialog de confirmation

```
┌─────────────────────────────────────────┐
│  Ranger le board                        │
├─────────────────────────────────────────┤
│                                         │
│  Les éléments seront organisés par      │
│  phase : Mood → Conception → Exécution  │
│                                         │
│  ⚠️ Cette action peut être annulée      │
│     avec Ctrl+Z                         │
│                                         │
│  Espacement : [────●────] 24px          │
│                                         │
│           [Annuler]  [Ranger]           │
└─────────────────────────────────────────┘
```

---

### P2.3 - Animation de transition

**Durée** : 1h  
**Fichier** : `src/features/boards/components/BoardCanvas.tsx`

```typescript
// État pour animation
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

---

### P2.4 - Undo/Redo (optionnel)

**Durée** : 2h  
**Fichiers** :
- `src/features/boards/context/BoardHistoryContext.tsx` (nouveau)
- `src/features/boards/hooks/useUndoRedo.ts` (nouveau)

#### Concept

Sauvegarder l'état avant auto-arrange pour permettre Ctrl+Z.

```typescript
interface HistoryState {
  elements: Array<{ id: string; x: number; y: number }>;
  zones: Array<{ id: string; x: number; y: number }>;
}

interface BoardHistoryContext {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  saveState: (state: HistoryState) => void;
}
```

---

### Critères de validation P2

- [ ] Bouton "Ranger" dans la toolbar
- [ ] Dialog de confirmation avec option espacement
- [ ] Éléments Mood groupés à gauche
- [ ] Éléments Conception groupés au centre
- [ ] Zones dans Exécution, triées par statut
- [ ] Éléments dans une zone restent dans la zone
- [ ] Animation fluide de transition
- [ ] Positions sauvegardées en DB après arrangement
- [ ] (Optionnel) Ctrl+Z pour annuler

---

## Sprint P3+ : Outils de Visualisation

**Durée estimée** : 4-6h  
**Prérequis** : Sprint P1 (Zoom/Pan)  
**Priorité** : P3

---

### P3.1 - Minimap

**Durée** : 2h  
**Fichier** : `src/features/boards/components/Minimap.tsx`

```
┌──────────────────────────────────────────────────┐
│                                                  │
│                                                  │
│                                    ┌────────┐   │
│                                    │ □ □    │   │
│                                    │   □ □  │   │
│                                    │ [██]   │   │ ← Viewport actuel
│                                    │   □    │   │
│                                    └────────┘   │
└──────────────────────────────────────────────────┘
```

#### Fonctionnalités

- [ ] Vue miniature de tout le canvas
- [ ] Rectangle indiquant le viewport actuel
- [ ] Clic pour naviguer
- [ ] Drag du rectangle pour pan
- [ ] Toggle affichage (optionnel)

---

### P3.2 - Navigation rapide vers zone

**Durée** : 1h  
**Fichier** : `src/features/boards/components/ZoneNavigator.tsx`

#### Dropdown dans la toolbar ou le header

```
┌─────────────────────┐
│ Aller à...       ▼  │
├─────────────────────┤
│ 📍 Zone Projet A    │
│ 📍 Zone Projet B    │
│ 📍 Zone Brouillon   │
├─────────────────────┤
│ ── Phases ──────    │
│ ✨ Mood             │
│ ✏️ Conception       │
│ 🚀 Exécution        │
└─────────────────────┘
```

#### Comportement

Clic sur un item → Zoom to fit sur la zone ou la section concernée.

---

### P3.3 - Guides d'alignement

**Durée** : 2h  
**Fichier** : `src/features/boards/components/AlignmentGuides.tsx`

#### Fonctionnalités

- [ ] Lignes verticales quand aligné avec un autre élément
- [ ] Lignes horizontales quand aligné avec un autre élément
- [ ] Snap optionnel (magnétisme)
- [ ] Affichage de la distance lors du drag

```
     │
     │  ← Guide vertical (aligné avec élément au-dessus)
┌────┼────┐
│    │    │ ← Élément en cours de drag
└────┼────┘
     │
─────┼─────────────────── ← Guide horizontal
     │
```

---

### P3.4 - Recherche sur board

**Durée** : 1h  
**Fichier** : `src/features/boards/components/BoardSearch.tsx`

#### Raccourci : Ctrl+F

```
┌─────────────────────────────────────────┐
│ 🔍 Rechercher sur le board...           │
│                                         │
│ "soie"                                  │
│                                         │
│ Résultats (3) :                         │
│ • [Tissu] Soie sauvage beige            │
│ • [Note] Idées soie pour été            │
│ • [Palette] Couleurs soie               │
└─────────────────────────────────────────┘
```

#### Comportement

Clic sur résultat → Pan + zoom vers l'élément, highlight temporaire.

---

### Critères de validation P3

- [ ] Minimap affichée en bas à droite
- [ ] Clic sur minimap navigue vers la position
- [ ] Dropdown "Aller à" avec zones et phases
- [ ] Guides d'alignement pendant le drag
- [ ] Ctrl+F ouvre la recherche
- [ ] Recherche filtre par nom/contenu

---

## Récapitulatif et Priorisation

### Vue d'ensemble des sprints

| Sprint | Durée | Priorité | Dépendances |
|--------|-------|----------|-------------|
| **P0 : Performance** | 2-3h | P0 (Bloquant) | Aucune |
| **P1 : Zoom & Pan** | 6-8h | P1 | P0 |
| **P2 : Auto-Arrange** | 4-6h | P2 | P0 |
| **P3 : Visualisation** | 4-6h | P3 | P1 |

### Ordre d'exécution recommandé

```
Semaine 1 :
├── P0 : Performance (2-3h)        ← PRIORITAIRE
│   ├── P0.1-P0.3 : memo (45min)
│   ├── P0.4 : Ghost mode (1h30)
│   └── Tests validation
│
└── P1.1-P1.2 : Zoom/Pan base (2h30)

Semaine 2 :
├── P1.3-P1.4 : Zoom UI + Drag adapt (3h30)
└── P2 : Auto-Arrange (4-6h)

Semaine 3 :
└── P3 : Visualisation (4-6h)
```

### Dépendances visuelles

```
P0 Performance ──────┬──────────────────────────────────────┐
                     │                                      │
                     ▼                                      ▼
              P1 Zoom/Pan                           P2 Auto-Arrange
                     │
                     ▼
              P3 Visualisation
```

---

## Annexes

### A. Mapping ElementType → Phase Journey

```typescript
// Depuis src/features/journey/config/steps.ts

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

### B. Statuts de zone/projet

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

### C. Raccourcis clavier prévus

| Raccourci | Action | Sprint |
|-----------|--------|--------|
| `Suppr` / `Backspace` | Supprimer sélection | Existant |
| `Escape` | Fermer modal / Déselectionner | Existant |
| `Ctrl+Scroll` | Zoom | P1 |
| `Space+Drag` | Pan | P1 |
| `Ctrl+0` | Zoom 100% | P1 |
| `Ctrl+1` | Zoom to fit | P1 |
| `Ctrl+F` | Recherche | P3 |
| `Ctrl+Z` | Undo | P2 (optionnel) |
| `Ctrl+Y` | Redo | P2 (optionnel) |

---

## Changelog

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0 | 17/01/2026 | Création initiale |
