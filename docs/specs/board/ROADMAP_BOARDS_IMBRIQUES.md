# ROADMAP : Boards Imbriqués & Collections

**Version** : 1.0  
**Date de création** : 27 Janvier 2026  
**Dernière mise à jour** : 27 Janvier 2026  
**Statut global** : 0/11 sprints complétés

---

## 📊 Tableau de Suivi

| Sprint | Nom | Durée | Statut | Date Début | Date Fin |
|--------|-----|-------|--------|------------|----------|
| 1 | Appartenance `zoneId` | 2h | ⬜ À faire | - | - |
| 2 | ZoneCard Compacte | 3h | ⬜ À faire | - | - |
| 3 | Focus Mode Overlay | 4h | ⬜ À faire | - | - |
| 4 | Indicateur Visuel | 1h | ⬜ À faire | - | - |
| 5 | Boards Imbriqués DB | 2h | ⬜ À faire | - | - |
| 6 | Navigation Hiérarchique | 3h | ⬜ À faire | - | - |
| 7 | Journey Hiérarchique | 2h | ⬜ À faire | - | - |
| 8 | Page Boards Damier | 3h | ⬜ À faire | - | - |
| 9 | Auto-Arrange Hiérarchique | 2h | ⬜ À faire | - | - |
| 10 | Création Collection | 2h | ⬜ À faire | - | - |
| 11 | Polish & Edge Cases | 2h | ⬜ À faire | - | - |

**Légende** : ⬜ À faire | 🔄 En cours | ✅ Terminé | ⏸️ Bloqué

**Total estimé : 26h**

---

## 🎯 Vision Globale

Transformer les boards Deadstock pour supporter une hiérarchie **Collection > Catégorie > Pièce**, permettant aux designers de structurer organiquement leur travail créatif.

```
Board "Collection Ébauche"
├── Éléments libres (palette globale, mood...)
├── ZoneCard ".tops" → Sous-board ".tops"
│   ├── Éléments (palette tops...)
│   └── ZoneCard "Top rouge" → Sous-board "Top rouge"
│       └── Éléments (tissu, calcul, patron...)
└── ZoneCard ".bottoms" → Sous-board ".bottoms"
```

---

# SPRINT 1 : Appartenance `zoneId`

**Durée estimée** : 2h  
**Statut** : ⬜ À faire  
**Dépendances** : Aucune  
**Prérequis** : Aucun

## Objectif

Utiliser le champ `zoneId` existant (mais non utilisé) pour l'appartenance explicite des éléments aux zones, remplaçant le calcul par position.

## Contexte Technique

Le champ `zone_id` existe déjà dans :
- Table `board_elements` (colonne `zone_id`)
- Type `BoardElement` (champ `zoneId`)
- Repository `elementsRepository.ts` (gère `zoneId` dans `addElement` et `updateElement`)

Mais l'UI utilise actuellement `isElementInZone()` qui calcule l'appartenance par position géométrique.

## Fichiers à Modifier

### 1.1 - `src/features/boards/utils/zoneUtils.ts`

**Ajouter** les fonctions suivantes :

```typescript
/**
 * Retourne les éléments appartenant à une zone via zoneId
 */
export function getElementsByZoneId(
  elements: BoardElement[],
  zoneId: string
): BoardElement[] {
  return elements.filter(element => element.zoneId === zoneId);
}

/**
 * Retourne les éléments libres (sans zone assignée)
 */
export function getFreeElements(elements: BoardElement[]): BoardElement[] {
  return elements.filter(element => element.zoneId === null);
}

/**
 * Vérifie si un élément appartient à une zone (par zoneId)
 */
export function elementBelongsToZone(
  element: BoardElement,
  zoneId: string
): boolean {
  return element.zoneId === zoneId;
}
```

### 1.2 - `src/features/boards/actions/elementActions.ts`

**Ajouter** l'action :

```typescript
/**
 * Assigne ou retire un élément d'une zone
 */
export async function assignElementToZoneAction(
  elementId: string,
  zoneId: string | null
): Promise<ActionResult<BoardElement>> {
  try {
    const element = await elementsRepository.updateElement(elementId, {
      zoneId: zoneId,
    });

    if (!element) {
      return { success: false, error: 'Élément introuvable' };
    }

    revalidatePath(`/boards/${element.boardId}`);

    return { success: true, data: element };
  } catch (error) {
    console.error('assignElementToZoneAction error:', error);
    return { success: false, error: "Impossible d'assigner l'élément" };
  }
}
```

### 1.3 - `src/features/boards/context/BoardContext.tsx`

**Ajouter** dans l'interface `BoardContextValue` :

```typescript
assignElementToZone: (elementId: string, zoneId: string | null) => Promise<void>;
```

**Ajouter** dans le reducer :

```typescript
case 'ASSIGN_ELEMENT_TO_ZONE':
  return {
    ...state,
    elements: state.elements.map((el) =>
      el.id === action.payload.elementId
        ? { ...el, zoneId: action.payload.zoneId }
        : el
    ),
  };
```

**Ajouter** le callback :

```typescript
const assignElementToZone = useCallback(async (elementId: string, zoneId: string | null) => {
  dispatch({ 
    type: 'ASSIGN_ELEMENT_TO_ZONE', 
    payload: { elementId, zoneId } 
  });
  await assignElementToZoneAction(elementId, zoneId);
}, []);
```

### 1.4 - Migration Données Existantes (Optionnel)

Script SQL à exécuter une fois pour assigner `zoneId` aux éléments actuellement positionnés dans des zones :

```sql
-- Migration ponctuelle
UPDATE deadstock.board_elements e
SET zone_id = z.id
FROM deadstock.board_zones z
WHERE e.board_id = z.board_id
  AND e.zone_id IS NULL
  AND (e.position_x + COALESCE(e.width, 100) / 2) >= z.position_x
  AND (e.position_x + COALESCE(e.width, 100) / 2) <= z.position_x + z.width
  AND (e.position_y + COALESCE(e.height, 80) / 2) >= z.position_y
  AND (e.position_y + COALESCE(e.height, 80) / 2) <= z.position_y + z.height;
```

## Checklist de Validation

- [ ] `getElementsByZoneId(elements, zoneId)` retourne les bons éléments
- [ ] `getFreeElements(elements)` retourne les éléments sans zone
- [ ] `assignElementToZoneAction(elementId, zoneId)` persiste en DB
- [ ] Le reducer `ASSIGN_ELEMENT_TO_ZONE` met à jour le state local
- [ ] `assignElementToZone` est accessible via `useBoard()`
- [ ] TypeScript compile sans erreur (`npx tsc --noEmit`)

## Notes de Session

_Espace pour noter les observations, problèmes rencontrés, décisions prises pendant l'implémentation._

```
Date: 
Notes:


```

---

# SPRINT 2 : ZoneCard Compacte

**Durée estimée** : 3h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 1  
**Prérequis** : Sprint 1 complété

## Objectif

Remplacer les zones (rectangles extensibles) par des cards compactes affichant des miniatures des éléments.

## Fichiers à Créer

### 2.1 - `src/features/boards/components/ZoneElementThumbnail.tsx`

```typescript
// src/features/boards/components/ZoneElementThumbnail.tsx
'use client';

import React from 'react';
import {
  FileText, Palette, Image, Calculator, Film, Link,
  FileType, Scissors, User
} from 'lucide-react';
import type {
  BoardElement,
  TextileElementData,
  PaletteElementData,
  InspirationElementData,
  VideoElementData,
} from '../domain/types';

const THUMB_SIZE = 40;

interface ZoneElementThumbnailProps {
  element: BoardElement;
}

export function ZoneElementThumbnail({ element }: ZoneElementThumbnailProps) {
  const renderContent = () => {
    switch (element.elementType) {
      case 'textile': {
        const data = element.elementData as TextileElementData;
        if (data.snapshot?.imageUrl) {
          return (
            <img
              src={data.snapshot.imageUrl}
              alt={data.snapshot?.name || 'Tissu'}
              className="w-full h-full object-cover"
              draggable={false}
            />
          );
        }
        return <FileText className="w-4 h-4 text-gray-400" />;
      }

      case 'palette': {
        const data = element.elementData as PaletteElementData;
        const colors = data.colors?.slice(0, 4) || [];
        return (
          <div className="w-full h-full grid grid-cols-2 gap-px">
            {colors.map((color, i) => (
              <div key={i} style={{ backgroundColor: color }} />
            ))}
          </div>
        );
      }

      case 'inspiration': {
        const data = element.elementData as InspirationElementData;
        if (data.imageUrl || data.thumbnailUrl) {
          return (
            <img
              src={data.thumbnailUrl || data.imageUrl}
              alt={data.caption || 'Inspiration'}
              className="w-full h-full object-cover"
              draggable={false}
            />
          );
        }
        return <Image className="w-4 h-4 text-gray-400" />;
      }

      case 'video': {
        const data = element.elementData as VideoElementData;
        if (data.thumbnailUrl) {
          return (
            <img
              src={data.thumbnailUrl}
              alt={data.title || 'Video'}
              className="w-full h-full object-cover"
              draggable={false}
            />
          );
        }
        return <Film className="w-4 h-4 text-gray-400" />;
      }

      case 'note':
        return <FileText className="w-4 h-4 text-amber-500" />;

      case 'calculation':
        return <Calculator className="w-4 h-4 text-blue-500" />;

      case 'link':
        return <Link className="w-4 h-4 text-indigo-500" />;

      case 'pdf':
        return <FileType className="w-4 h-4 text-red-500" />;

      case 'pattern':
        return <Scissors className="w-4 h-4 text-purple-500" />;

      case 'silhouette':
        return <User className="w-4 h-4 text-gray-500" />;

      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div
      className="
        rounded overflow-hidden
        bg-gray-100 dark:bg-gray-800
        flex items-center justify-center
        border border-gray-200 dark:border-gray-700
      "
      style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
      title={element.elementType}
    >
      {renderContent()}
    </div>
  );
}
```

### 2.2 - `src/features/boards/components/ZoneCardCompact.tsx`

```typescript
// src/features/boards/components/ZoneCardCompact.tsx
'use client';

import React, { forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import { GripVertical, ChevronRight, Package, Truck, CheckCircle, X } from 'lucide-react';
import { getElementsByZoneId } from '../utils/zoneUtils';
import { ZoneElementThumbnail } from './ZoneElementThumbnail';
import type { BoardZone, BoardElement, ProjectStatus } from '../domain/types';

const COMPACT_WIDTH = 280;
const COMPACT_HEIGHT_BASE = 80;
const COMPACT_HEIGHT_WITH_THUMBS = 140;
const MAX_THUMBNAILS = 6;

export interface ZoneCardCompactHandle {
  setTransform: (x: number, y: number) => void;
  resetTransform: () => void;
}

interface ZoneCardCompactProps {
  zone: BoardZone;
  elements: BoardElement[];
  position: { x: number; y: number };
  isSelected: boolean;
  style?: React.CSSProperties;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onDelete?: () => void;
}

const STATUS_CONFIG: Record<ProjectStatus | 'draft', {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
}> = {
  draft: { icon: Package, label: 'Projet', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  in_progress: { icon: Package, label: 'En cours', color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/30' },
  ordered: { icon: Truck, label: 'Commandé', color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/30' },
  shipped: { icon: Truck, label: 'Expédié', color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/30' },
  received: { icon: CheckCircle, label: 'Reçu', color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/30' },
  in_production: { icon: Package, label: 'Production', color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/30' },
  completed: { icon: CheckCircle, label: 'Terminé', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/50' },
  archived: { icon: Package, label: 'Archivé', color: 'text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-800' },
};

export const ZoneCardCompact = React.memo(forwardRef<ZoneCardCompactHandle, ZoneCardCompactProps>(
  function ZoneCardCompact({
    zone,
    elements,
    position,
    isSelected,
    style,
    onMouseDown,
    onDoubleClick,
    onDelete,
  }, ref) {
    const cardRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      setTransform: (x: number, y: number) => {
        if (cardRef.current) {
          cardRef.current.style.transform = `translate(${x}px, ${y}px)`;
        }
      },
      resetTransform: () => {
        if (cardRef.current) {
          cardRef.current.style.transform = '';
        }
      },
    }), []);

    const zoneElements = useMemo(() => 
      getElementsByZoneId(elements, zone.id),
      [elements, zone.id]
    );

    const elementCount = zoneElements.length;
    const hasThumbnails = elementCount > 0;
    const height = hasThumbnails ? COMPACT_HEIGHT_WITH_THUMBS : COMPACT_HEIGHT_BASE;

    const status = zone.crystallizedAt 
      ? (zone.linkedProjectStatus || 'ordered')
      : 'draft';
    const statusConfig = STATUS_CONFIG[status];
    const StatusIcon = statusConfig.icon;

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onDelete?.();
    };

    return (
      <div
        ref={cardRef}
        className={`
          group absolute
          bg-white dark:bg-gray-900
          border rounded-lg
          overflow-visible
          transition-all duration-150
          select-none cursor-move
          ${isSelected
            ? 'ring-2 ring-gray-400 dark:ring-gray-500 shadow-lg border-gray-300 dark:border-gray-600'
            : 'shadow-md hover:shadow-lg border-gray-200 dark:border-gray-700'
          }
        `}
        style={{
          left: 0,
          top: 0,
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: COMPACT_WIDTH,
          height,
          zIndex: isSelected ? 50 : 10,
          ...style,
        }}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
      >
        {/* Bouton supprimer */}
        {onDelete && status === 'draft' && (
          <button
            onClick={handleDelete}
            className="
              absolute -top-2 -right-2
              w-5 h-5
              bg-red-500 hover:bg-red-600
              text-white rounded-full
              flex items-center justify-center
              opacity-0 group-hover:opacity-100
              transition-opacity duration-150
              shadow-sm z-20
            "
            title="Supprimer la zone"
          >
            <X className="w-3 h-3" strokeWidth={2.5} />
          </button>
        )}

        {/* Header */}
        <div className={`
          flex items-center gap-3 px-3 py-2
          border-b border-gray-100 dark:border-gray-800
          ${statusConfig.bgColor}
        `}>
          <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
          <StatusIcon className={`w-4 h-4 flex-shrink-0 ${statusConfig.color}`} />
          <span className="flex-1 font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
            {zone.name}
          </span>
          <span className={`
            text-xs px-2 py-0.5 rounded-full
            ${statusConfig.bgColor} ${statusConfig.color}
            border border-current/20
          `}>
            {statusConfig.label}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        </div>

        {/* Miniatures */}
        {hasThumbnails && (
          <div className="p-2">
            <div className="flex flex-wrap gap-1.5">
              {zoneElements.slice(0, MAX_THUMBNAILS).map((element) => (
                <ZoneElementThumbnail key={element.id} element={element} />
              ))}
              {elementCount > MAX_THUMBNAILS && (
                <div className="
                  w-10 h-10 rounded
                  bg-gray-100 dark:bg-gray-800
                  flex items-center justify-center
                  text-xs text-gray-500 dark:text-gray-400
                ">
                  +{elementCount - MAX_THUMBNAILS}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="
          absolute bottom-0 left-0 right-0
          px-3 py-1.5
          text-xs text-gray-500 dark:text-gray-400
          bg-gray-50/80 dark:bg-gray-800/80
          border-t border-gray-100 dark:border-gray-800
          rounded-b-lg
        ">
          {elementCount} élément{elementCount > 1 ? 's' : ''}
          {elementCount === 0 && ' • Double-clic pour ajouter'}
        </div>
      </div>
    );
  }
));
```

## Fichiers à Modifier

### 2.3 - `src/features/boards/components/BoardCanvas.tsx`

**Remplacer** l'import de `ZoneCard` par `ZoneCardCompact` :

```typescript
// Remplacer
import { ZoneCard } from './ZoneCard';
// Par
import { ZoneCardCompact } from './ZoneCardCompact';
```

**Remplacer** le rendu des zones :

```typescript
// Remplacer
<ZoneCard
  key={zone.id}
  zone={zone}
  // ...props
/>

// Par
<ZoneCardCompact
  key={zone.id}
  zone={zone}
  elements={elements}
  position={{ x: zone.positionX, y: zone.positionY }}
  isSelected={selectedZoneId === zone.id}
  onMouseDown={(e) => handleZoneMouseDown(e, zone)}
  onDoubleClick={() => handleZoneDoubleClick(zone)}
  onDelete={() => removeZone(zone.id)}
/>
```

**Ajouter** le handler pour le double-clic (préparation Sprint 3) :

```typescript
const handleZoneDoubleClick = useCallback((zone: BoardZone) => {
  // TODO Sprint 3: Ouvrir le Focus Mode
  console.log('Double-clic zone:', zone.name);
}, []);
```

## Checklist de Validation

- [ ] `ZoneElementThumbnail.tsx` créé et sans erreur TypeScript
- [ ] `ZoneCardCompact.tsx` créé et sans erreur TypeScript
- [ ] Les zones s'affichent en cards compactes (280px de large)
- [ ] Les miniatures des éléments sont visibles (max 6)
- [ ] Le badge "+N" s'affiche si plus de 6 éléments
- [ ] Le badge d'état (Projet/Commandé/Livré) est correct
- [ ] Le compteur d'éléments est affiché en footer
- [ ] Double-clic déclenche le handler (log visible)
- [ ] Drag de la zone fonctionne toujours
- [ ] Sélection de la zone fonctionne toujours

## Notes de Session

```
Date: 
Notes:


```

---

# SPRINT 3 : Focus Mode Overlay

**Durée estimée** : 4h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 2  
**Prérequis** : Sprint 2 complété

## Objectif

Créer l'overlay semi-modal pour prévisualiser et éditer le contenu d'une zone. Le board parent reste visible (assombri) et permet le drag d'éléments vers la zone.

## Fichiers à Créer

### 3.1 - `src/features/boards/context/ZoneFocusContext.tsx`

```typescript
// src/features/boards/context/ZoneFocusContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { BoardZone } from '../domain/types';

interface ZoneFocusContextValue {
  focusedZone: BoardZone | null;
  isFocusMode: boolean;
  openFocusMode: (zone: BoardZone) => void;
  closeFocusMode: () => void;
}

const ZoneFocusContext = createContext<ZoneFocusContextValue | null>(null);

interface ZoneFocusProviderProps {
  children: ReactNode;
}

export function ZoneFocusProvider({ children }: ZoneFocusProviderProps) {
  const [focusedZone, setFocusedZone] = useState<BoardZone | null>(null);

  const openFocusMode = useCallback((zone: BoardZone) => {
    setFocusedZone(zone);
  }, []);

  const closeFocusMode = useCallback(() => {
    setFocusedZone(null);
  }, []);

  const value: ZoneFocusContextValue = {
    focusedZone,
    isFocusMode: focusedZone !== null,
    openFocusMode,
    closeFocusMode,
  };

  return (
    <ZoneFocusContext.Provider value={value}>
      {children}
    </ZoneFocusContext.Provider>
  );
}

export function useZoneFocus() {
  const context = useContext(ZoneFocusContext);
  if (!context) {
    throw new Error('useZoneFocus must be used within a ZoneFocusProvider');
  }
  return context;
}
```

### 3.2 - `src/features/boards/components/ZoneFocusOverlay.tsx`

```typescript
// src/features/boards/components/ZoneFocusOverlay.tsx
'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowUpRight, Plus, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useBoard } from '../context/BoardContext';
import { useZoneFocus } from '../context/ZoneFocusContext';
import { getElementsByZoneId } from '../utils/zoneUtils';
import { ZoneElementThumbnail } from './ZoneElementThumbnail';
import type { BoardElement } from '../domain/types';

interface ZoneFocusOverlayProps {
  onNavigateToBoard?: (boardId: string) => void;
}

export function ZoneFocusOverlay({ onNavigateToBoard }: ZoneFocusOverlayProps) {
  const { focusedZone, closeFocusMode } = useZoneFocus();
  const { elements, assignElementToZone, removeElement } = useBoard();

  const [isDragOver, setIsDragOver] = useState(false);

  // Éléments de cette zone
  const zoneElements = useMemo(() => {
    if (!focusedZone) return [];
    return getElementsByZoneId(elements, focusedZone.id);
  }, [elements, focusedZone]);

  // Handler pour retirer un élément de la zone
  const handleRemoveFromZone = useCallback(async (elementId: string) => {
    await assignElementToZone(elementId, null);
    toast.success('Élément retiré de la zone');
  }, [assignElementToZone]);

  // Handler pour supprimer définitivement
  const handleDeleteElement = useCallback(async (elementId: string) => {
    await removeElement(elementId);
    toast.success('Élément supprimé');
  }, [removeElement]);

  // Handler drop (élément du board vers la zone)
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const elementId = e.dataTransfer.getData('elementId');
    if (!elementId || !focusedZone) return;

    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    if (element.zoneId === focusedZone.id) {
      toast.info('Cet élément est déjà dans cette zone');
      return;
    }

    await assignElementToZone(elementId, focusedZone.id);
    toast.success('Élément ajouté à la zone');
  }, [focusedZone, elements, assignElementToZone]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFocusMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeFocusMode]);

  // Handler pour ouvrir le sous-board en plein écran
  const handleOpenFullScreen = useCallback(() => {
    if (focusedZone?.linkedBoardId && onNavigateToBoard) {
      closeFocusMode();
      onNavigateToBoard(focusedZone.linkedBoardId);
    } else {
      toast.info('Sous-board non encore créé');
    }
  }, [focusedZone, onNavigateToBoard, closeFocusMode]);

  if (!focusedZone) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={closeFocusMode}
      />

      {/* Panel Focus */}
      <div
        className={`
          fixed inset-x-8 inset-y-8 md:inset-x-16 md:inset-y-12 lg:inset-x-32 lg:inset-y-16
          bg-white dark:bg-gray-900
          rounded-xl shadow-2xl
          z-[101]
          flex flex-col
          overflow-hidden
          ${isDragOver ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Header */}
        <div className="
          flex items-center gap-4 px-6 py-4
          border-b border-gray-200 dark:border-gray-700
          bg-gray-50 dark:bg-gray-800
        ">
          <button
            onClick={closeFocusMode}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Retour au board (Échap)"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex-1">
            {focusedZone.name}
          </h2>

          {/* Bouton ouvrir en plein écran */}
          <button
            onClick={handleOpenFullScreen}
            className="
              flex items-center gap-2 px-3 py-1.5 rounded-lg
              bg-gray-200 dark:bg-gray-700
              hover:bg-gray-300 dark:hover:bg-gray-600
              text-sm transition-colors
            "
            title="Ouvrir en plein écran"
          >
            <ArrowUpRight className="w-4 h-4" />
            Ouvrir
          </button>

          <button
            onClick={closeFocusMode}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-auto p-6">
          {zoneElements.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <Package className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg mb-2">Zone vide</p>
              <p className="text-sm mb-4">
                Glissez des éléments depuis le board ou ajoutez-en directement
              </p>
              {isDragOver && (
                <div className="
                  absolute inset-8
                  border-4 border-dashed border-blue-400
                  rounded-xl
                  flex items-center justify-center
                  bg-blue-50/50 dark:bg-blue-900/20
                ">
                  <p className="text-blue-600 dark:text-blue-400 text-lg font-medium">
                    Déposez ici pour ajouter à la zone
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {zoneElements.map((element) => (
                <ZoneFocusElementCard
                  key={element.id}
                  element={element}
                  onRemoveFromZone={() => handleRemoveFromZone(element.id)}
                  onDelete={() => handleDeleteElement(element.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="
          flex items-center justify-between gap-4 px-6 py-3
          border-t border-gray-200 dark:border-gray-700
          bg-gray-50 dark:bg-gray-800
        ">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {zoneElements.length} élément{zoneElements.length > 1 ? 's' : ''} dans cette zone
          </span>

          <button
            onClick={() => toast.info('À implémenter: ajout élément')}
            className="
              flex items-center gap-2
              px-4 py-2 rounded-lg
              bg-gray-900 dark:bg-gray-100
              text-white dark:text-gray-900
              hover:bg-gray-800 dark:hover:bg-gray-200
              transition-colors
            "
          >
            <Plus className="w-4 h-4" />
            Ajouter un élément
          </button>
        </div>
      </div>
    </>
  );
}

// Sous-composant pour un élément dans le focus mode
interface ZoneFocusElementCardProps {
  element: BoardElement;
  onRemoveFromZone: () => void;
  onDelete: () => void;
}

function ZoneFocusElementCard({ element, onRemoveFromZone, onDelete }: ZoneFocusElementCardProps) {
  return (
    <div className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden aspect-square">
      <div className="w-full h-full p-2 flex items-center justify-center">
        <ZoneElementThumbnail element={element} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-white/90 dark:bg-gray-800/90 text-xs truncate">
        {element.elementType}
      </div>

      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onRemoveFromZone}
          className="p-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-xs"
          title="Retirer de la zone"
        >
          ↩
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded bg-red-500 hover:bg-red-600 text-white"
          title="Supprimer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
```

## Fichiers à Modifier

### 3.3 - `src/features/boards/components/BoardCanvas.tsx`

**Ajouter** les imports :

```typescript
import { ZoneFocusProvider, useZoneFocus } from '../context/ZoneFocusContext';
import { ZoneFocusOverlay } from './ZoneFocusOverlay';
```

**Wrapper** le composant avec `ZoneFocusProvider` (dans le return ou au niveau du layout).

**Modifier** le handler `handleZoneDoubleClick` :

```typescript
const { openFocusMode } = useZoneFocus();

const handleZoneDoubleClick = useCallback((zone: BoardZone) => {
  openFocusMode(zone);
}, [openFocusMode]);
```

**Ajouter** l'overlay à la fin du rendu :

```typescript
return (
  <ZoneFocusProvider>
    <div className="...">
      {/* ... contenu existant ... */}
      
      {/* Focus Mode Overlay */}
      <ZoneFocusOverlay />
    </div>
  </ZoneFocusProvider>
);
```

### 3.4 - `src/features/boards/components/ElementCard.tsx`

**Ajouter** le support du drag pour le Focus Mode :

```typescript
// Dans le div principal de ElementCard, ajouter :
draggable={true}
onDragStart={(e) => {
  e.dataTransfer.setData('elementId', element.id);
}}
```

## Checklist de Validation

- [ ] `ZoneFocusContext.tsx` créé et sans erreur TypeScript
- [ ] `ZoneFocusOverlay.tsx` créé et sans erreur TypeScript
- [ ] Double-clic sur ZoneCard ouvre le Focus Mode
- [ ] Le backdrop assombrit le board parent
- [ ] Les éléments de la zone sont affichés en grille
- [ ] Bouton ← ferme le Focus Mode
- [ ] Touche Échap ferme le Focus Mode
- [ ] Clic sur backdrop ferme le Focus Mode
- [ ] Drag d'un élément du board vers l'overlay fonctionne
- [ ] "Retirer de la zone" remet `zoneId` à null
- [ ] Bouton ↗ "Ouvrir" est visible (navigation à implémenter Sprint 6)

## Notes de Session

```
Date: 
Notes:


```

---

# SPRINT 4 : Indicateur Visuel

**Durée estimée** : 1h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 1  
**Prérequis** : Sprint 1 complété

## Objectif

Ajouter un indicateur visuel (barre latérale colorée) sur les éléments qui appartiennent à une zone.

## Fichiers à Modifier

### 4.1 - `src/features/boards/components/ElementCard.tsx`

**Ajouter** l'import du contexte :

```typescript
import { useBoard } from '../context/BoardContext';
```

**Ajouter** dans le composant :

```typescript
const { zones } = useBoard();

// Trouver la zone parente si elle existe
const parentZone = element.zoneId 
  ? zones.find(z => z.id === element.zoneId)
  : null;
```

**Ajouter** dans le rendu (juste après l'ouverture du div principal) :

```typescript
{/* Indicateur d'appartenance à une zone */}
{parentZone && (
  <div
    className="absolute left-0 top-0 bottom-0 w-1 rounded-l"
    style={{ backgroundColor: parentZone.color || '#6366F1' }}
    title={`Dans: ${parentZone.name}`}
  />
)}
```

**Optionnel** : Ajouter un léger padding-left si l'élément a une zone :

```typescript
<div className={`h-full flex flex-col ${parentZone ? 'pl-2' : ''} ${noHeader ? 'p-2' : 'p-3 pt-5'}`}>
```

## Checklist de Validation

- [ ] Les éléments avec `zoneId` ont une barre latérale colorée (3-4px)
- [ ] La couleur correspond à `zone.color` de la zone parente
- [ ] Le tooltip affiche "Dans: [nom de la zone]"
- [ ] Les éléments sans `zoneId` n'ont pas de barre
- [ ] La barre ne gêne pas le drag handle

## Notes de Session

```
Date: 
Notes:


```

---

# SPRINT 5 : Boards Imbriqués DB

**Durée estimée** : 2h  
**Statut** : ⬜ À faire  
**Dépendances** : Aucune  
**Prérequis** : Aucun (peut être fait en parallèle des Sprints 1-4)

## Objectif

Ajouter le support des boards imbriqués en base de données (parentBoardId, boardType, linkedBoardId, zoneType).

## Fichiers à Créer

### 5.1 - `database/migrations/033_add_board_hierarchy.sql`

```sql
-- Migration: Ajout de la hiérarchie des boards
-- Sprint 5: Boards Imbriqués

-- Ajouter parent_board_id pour la hiérarchie
ALTER TABLE deadstock.boards
ADD COLUMN IF NOT EXISTS parent_board_id UUID REFERENCES deadstock.boards(id) ON DELETE SET NULL;

-- Ajouter board_type pour distinguer les types
-- 'free' = board libre (défaut)
-- 'piece' = pièce/vêtement
-- 'category' = catégorie (.tops, .bottoms...)
-- 'collection' = collection de vêtements
ALTER TABLE deadstock.boards
ADD COLUMN IF NOT EXISTS board_type TEXT DEFAULT 'free' 
CHECK (board_type IN ('free', 'piece', 'category', 'collection'));

-- Index pour les requêtes par parent
CREATE INDEX IF NOT EXISTS idx_boards_parent_id ON deadstock.boards(parent_board_id);

-- Index pour les requêtes par type
CREATE INDEX IF NOT EXISTS idx_boards_type ON deadstock.boards(board_type);

COMMENT ON COLUMN deadstock.boards.parent_board_id IS 'ID du board parent (null = board racine)';
COMMENT ON COLUMN deadstock.boards.board_type IS 'Type de board: free, piece, category, collection';
```

### 5.2 - `database/migrations/034_add_zone_linked_board.sql`

```sql
-- Migration: Ajout du lien zone -> sous-board
-- Sprint 5: Boards Imbriqués

-- Ajouter linked_board_id pour pointer vers un sous-board
ALTER TABLE deadstock.board_zones
ADD COLUMN IF NOT EXISTS linked_board_id UUID REFERENCES deadstock.boards(id) ON DELETE SET NULL;

-- Ajouter zone_type pour distinguer pièce vs catégorie
-- 'piece' = zone représentant un vêtement
-- 'category' = zone représentant une catégorie
ALTER TABLE deadstock.board_zones
ADD COLUMN IF NOT EXISTS zone_type TEXT DEFAULT 'piece'
CHECK (zone_type IN ('piece', 'category'));

-- Ajouter des champs pour le cache des miniatures
ALTER TABLE deadstock.board_zones
ADD COLUMN IF NOT EXISTS thumbnail_urls TEXT[] DEFAULT '{}';

ALTER TABLE deadstock.board_zones
ADD COLUMN IF NOT EXISTS child_count INTEGER DEFAULT 0;

-- Index pour les requêtes par linked_board
CREATE INDEX IF NOT EXISTS idx_zones_linked_board ON deadstock.board_zones(linked_board_id);

COMMENT ON COLUMN deadstock.board_zones.linked_board_id IS 'ID du sous-board lié (null = zone sans sous-board)';
COMMENT ON COLUMN deadstock.board_zones.zone_type IS 'Type de zone: piece ou category';
COMMENT ON COLUMN deadstock.board_zones.thumbnail_urls IS 'Cache des URLs miniatures pour affichage rapide';
COMMENT ON COLUMN deadstock.board_zones.child_count IS 'Cache du nombre d éléments/enfants';
```

## Fichiers à Modifier

### 5.3 - `src/features/boards/domain/types.ts`

**Ajouter** les nouveaux types :

```typescript
export type BoardType = 'free' | 'piece' | 'category' | 'collection';
export type ZoneType = 'piece' | 'category';
```

**Modifier** l'interface `Board` :

```typescript
export interface Board {
  id: string;
  userId: string;
  parentBoardId: string | null;  // NOUVEAU
  name: string;
  boardType: BoardType;          // NOUVEAU
  // ... autres champs existants
}
```

**Modifier** l'interface `BoardZone` :

```typescript
export interface BoardZone {
  id: string;
  boardId: string;
  name: string;
  zoneType: ZoneType;              // NOUVEAU
  linkedBoardId: string | null;    // NOUVEAU
  thumbnailUrls: string[];         // NOUVEAU
  childCount: number;              // NOUVEAU
  // ... autres champs existants
}
```

**Modifier** `mapBoardFromRow` et `mapZoneFromRow` pour inclure les nouveaux champs.

### 5.4 - `src/features/boards/infrastructure/boardsRepository.ts`

**Ajouter** la fonction :

```typescript
/**
 * Récupère la chaîne d'ancêtres d'un board (pour le breadcrumb)
 */
export async function getBoardAncestors(boardId: string): Promise<Board[]> {
  const supabase = createAdminClient();
  const ancestors: Board[] = [];
  
  let currentId: string | null = boardId;
  
  while (currentId) {
    const { data: board } = await supabase
      .from('boards')
      .select('*')
      .eq('id', currentId)
      .single();
    
    if (!board) break;
    
    if (board.parent_board_id) {
      // Récupérer le parent
      const { data: parent } = await supabase
        .from('boards')
        .select('*')
        .eq('id', board.parent_board_id)
        .single();
      
      if (parent) {
        ancestors.unshift(mapBoardFromRow(parent));
        currentId = parent.parent_board_id;
      } else {
        currentId = null;
      }
    } else {
      currentId = null;
    }
  }
  
  return ancestors;
}

/**
 * Récupère les boards racines d'un utilisateur (pour la page Boards)
 */
export async function getRootBoards(userId: string): Promise<Board[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .is('parent_board_id', null)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(mapBoardFromRow);
}
```

### 5.5 - `src/features/boards/infrastructure/zonesRepository.ts`

**Modifier** les fonctions existantes pour gérer `linkedBoardId` et `zoneType`.

## Checklist de Validation

- [ ] Migration `033_add_board_hierarchy.sql` exécutée sans erreur
- [ ] Migration `034_add_zone_linked_board.sql` exécutée sans erreur
- [ ] Types TypeScript mis à jour (`BoardType`, `ZoneType`)
- [ ] `Board` a les champs `parentBoardId` et `boardType`
- [ ] `BoardZone` a les champs `linkedBoardId`, `zoneType`, `thumbnailUrls`, `childCount`
- [ ] `getBoardAncestors()` retourne la chaîne de parents
- [ ] `getRootBoards()` retourne uniquement les boards racines
- [ ] Aucune régression sur les fonctionnalités existantes

## Notes de Session

```
Date: 
Notes:


```

---

# SPRINT 6 : Navigation Hiérarchique

**Durée estimée** : 3h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 3, Sprint 5  
**Prérequis** : Focus Mode fonctionnel, DB mise à jour

## Objectif

Permettre la navigation entre boards imbriqués avec breadcrumb et création automatique de sous-boards.

## Fichiers à Modifier

### 6.1 - `src/features/boards/components/SharedBoardHeader.tsx`

**Ajouter** le breadcrumb :

```typescript
interface BreadcrumbItem {
  id: string;
  name: string;
  href: string;
}

interface SharedBoardHeaderProps {
  board: Board;
  ancestors?: Board[];  // NOUVEAU
  // ... autres props
}

// Dans le rendu, avant le nom du board :
{ancestors && ancestors.length > 0 && (
  <nav className="flex items-center gap-1 text-sm text-gray-500">
    <Link href="/boards" className="hover:text-gray-700">
      Mes Projets
    </Link>
    {ancestors.map((ancestor) => (
      <React.Fragment key={ancestor.id}>
        <ChevronRight className="w-4 h-4" />
        <Link 
          href={`/boards/${ancestor.id}`}
          className="hover:text-gray-700"
        >
          {ancestor.name}
        </Link>
      </React.Fragment>
    ))}
    <ChevronRight className="w-4 h-4" />
  </nav>
)}
```

### 6.2 - `src/features/boards/actions/zoneActions.ts`

**Ajouter** l'action pour créer un sous-board :

```typescript
/**
 * Crée un sous-board lié à une zone
 */
export async function createLinkedBoardAction(
  zoneId: string,
  parentBoardId: string,
  name: string,
  zoneType: ZoneType
): Promise<ActionResult<Board>> {
  try {
    const userId = await requireUserId();
    
    // Créer le sous-board
    const boardType: BoardType = zoneType === 'category' ? 'category' : 'piece';
    const newBoard = await boardsRepository.createBoard({
      userId,
      name,
      parentBoardId,
      boardType,
    });
    
    // Lier la zone au nouveau board
    await zonesRepository.updateZone(zoneId, {
      linkedBoardId: newBoard.id,
    });
    
    revalidatePath(`/boards/${parentBoardId}`);
    
    return { success: true, data: newBoard };
  } catch (error) {
    console.error('createLinkedBoardAction error:', error);
    return { success: false, error: 'Impossible de créer le sous-board' };
  }
}
```

### 6.3 - `src/features/boards/components/ZoneFocusOverlay.tsx`

**Modifier** le handler `handleOpenFullScreen` :

```typescript
const handleOpenFullScreen = useCallback(async () => {
  if (!focusedZone) return;
  
  let targetBoardId = focusedZone.linkedBoardId;
  
  // Si pas de sous-board, en créer un
  if (!targetBoardId) {
    const result = await createLinkedBoardAction(
      focusedZone.id,
      focusedZone.boardId,
      focusedZone.name,
      focusedZone.zoneType || 'piece'
    );
    
    if (result.success && result.data) {
      targetBoardId = result.data.id;
    } else {
      toast.error('Erreur lors de la création du sous-board');
      return;
    }
  }
  
  closeFocusMode();
  router.push(`/boards/${targetBoardId}`);
}, [focusedZone, closeFocusMode, router]);
```

### 6.4 - `src/app/(main)/boards/[boardId]/page.tsx`

**Charger** les ancêtres pour le breadcrumb :

```typescript
// Dans le composant serveur
const ancestors = await getBoardAncestors(boardId);

// Passer aux composants clients
<SharedBoardHeader 
  board={board} 
  ancestors={ancestors}
  // ...
/>
```

## Checklist de Validation

- [ ] Breadcrumb affiche `Mes Projets / Collection / .tops / Top rouge`
- [ ] Clic sur un élément du breadcrumb navigue vers ce board
- [ ] Bouton ↗ dans Focus Mode crée un sous-board si nécessaire
- [ ] Bouton ↗ navigue vers le sous-board existant
- [ ] Le sous-board a le bon `parentBoardId`
- [ ] Le sous-board a le bon `boardType`
- [ ] La zone est mise à jour avec `linkedBoardId`

## Notes de Session

```
Date: 
Notes:


```

---

# SPRINT 7 : Journey Hiérarchique

**Durée estimée** : 2h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 6  
**Prérequis** : Navigation hiérarchique fonctionnelle

## Objectif

Adapter la vue Journey pour les boards imbriqués : afficher uniquement le niveau actuel et permettre la navigation vers les sous-boards.

## Fichiers à Modifier

### 7.1 - `src/features/journey/config/steps.ts`

**Ajouter** les sections pour les ZoneCards :

```typescript
export const JOURNEY_PHASES = [
  {
    id: 'mood',
    label: 'Mood',
    types: ['inspiration', 'palette', 'silhouette', 'video', 'link', 'pdf', 'note'],
  },
  {
    id: 'conception',
    label: 'Conception',
    types: ['pattern', 'calculation', 'textile'],
  },
  {
    id: 'execution',
    label: 'Exécution',
    types: ['zone'],  // Zones de type 'piece'
  },
  // NOUVEAU : Section pour les catégories (visible seulement pour les collections)
  {
    id: 'categories',
    label: 'Catégories',
    types: ['zone_category'],  // Zones de type 'category'
    condition: (board: Board) => board.boardType === 'collection',
  },
  // NOUVEAU : Section pour les pièces (visible seulement pour les catégories)
  {
    id: 'pieces',
    label: 'Pièces',
    types: ['zone_piece'],  // Zones de type 'piece' dans une catégorie
    condition: (board: Board) => board.boardType === 'category',
  },
];
```

### 7.2 - `src/features/journey/components/JourneyNavigation.tsx`

**Modifier** pour afficher les ZoneCards dans les sections appropriées :

```typescript
// Filtrer les zones par type
const categoryZones = zones.filter(z => z.zoneType === 'category');
const pieceZones = zones.filter(z => z.zoneType === 'piece');

// Dans le rendu de la section "Catégories" ou "Pièces"
{categoryZones.map((zone) => (
  <button
    key={zone.id}
    onClick={() => handleNavigateToZone(zone)}
    className="..."
  >
    {zone.name}
    <span className="text-xs text-gray-500">
      ({zone.childCount} pièces)
    </span>
  </button>
))}
```

### 7.3 - `src/features/journey/components/JourneyClientWrapper.tsx`

**Ajouter** la navigation vers sous-board en préservant le mode Journey :

```typescript
const handleNavigateToZone = useCallback((zone: BoardZone) => {
  if (zone.linkedBoardId) {
    // Naviguer vers le sous-board en mode Journey
    router.push(`/boards/${zone.linkedBoardId}/journey`);
  }
}, [router]);
```

## Checklist de Validation

- [ ] Journey d'une collection affiche section "Catégories" avec les ZoneCards
- [ ] Journey d'une catégorie affiche section "Pièces" avec les ZoneCards
- [ ] Clic sur une ZoneCard navigue vers le sous-board en mode Journey
- [ ] Le toggle Board/Journey reste sur Journey après navigation
- [ ] Breadcrumb fonctionne identiquement en vue Board et Journey
- [ ] Les sections conditionnelles ne s'affichent que pour les bons types de boards

## Notes de Session

```
Date: 
Notes:


```

---

# SPRINT 8 : Page Boards Damier

**Durée estimée** : 3h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 5  
**Prérequis** : DB avec `boardType` et `parentBoardId`

## Objectif

Afficher les collections avec un damier d'images des pièces sur la page Boards.

## Fichiers à Créer

### 8.1 - `src/features/boards/components/CollectionThumbnailGrid.tsx`

```typescript
// src/features/boards/components/CollectionThumbnailGrid.tsx
'use client';

import React from 'react';
import { FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollectionThumbnailGridProps {
  images: string[];
  totalCount: number;
  className?: string;
}

export function CollectionThumbnailGrid({ 
  images, 
  totalCount,
  className 
}: CollectionThumbnailGridProps) {
  const displayImages = images.slice(0, 4);
  const remaining = totalCount - displayImages.length;

  // 0 images
  if (displayImages.length === 0) {
    return (
      <div className={cn(
        "w-full h-full bg-gray-100 dark:bg-gray-800",
        "flex items-center justify-center",
        className
      )}>
        <FolderOpen className="w-12 h-12 text-gray-300 dark:text-gray-600" />
      </div>
    );
  }

  // 1 image
  if (displayImages.length === 1) {
    return (
      <div className={cn("w-full h-full", className)}>
        <img 
          src={displayImages[0]} 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 2 images
  if (displayImages.length === 2) {
    return (
      <div className={cn("w-full h-full grid grid-cols-2 gap-0.5", className)}>
        {displayImages.map((url, i) => (
          <img key={i} src={url} alt="" className="w-full h-full object-cover" />
        ))}
      </div>
    );
  }

  // 3 images
  if (displayImages.length === 3) {
    return (
      <div className={cn("w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5", className)}>
        <img src={displayImages[0]} alt="" className="w-full h-full object-cover" />
        <img src={displayImages[1]} alt="" className="w-full h-full object-cover" />
        <img src={displayImages[2]} alt="" className="w-full h-full object-cover col-span-2" />
      </div>
    );
  }

  // 4+ images
  return (
    <div className={cn("w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5", className)}>
      {displayImages.slice(0, 3).map((url, i) => (
        <img key={i} src={url} alt="" className="w-full h-full object-cover" />
      ))}
      
      {remaining > 0 ? (
        <div className="relative">
          <img src={displayImages[3]} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold text-lg">
            +{remaining}
          </div>
        </div>
      ) : (
        <img src={displayImages[3]} alt="" className="w-full h-full object-cover" />
      )}
    </div>
  );
}
```

## Fichiers à Modifier

### 8.2 - `src/app/(main)/boards/page.tsx`

**Modifier** la requête pour ne charger que les boards racines :

```typescript
// Remplacer
const boards = await getBoardsByUser(userId);

// Par
const boards = await getRootBoards(userId);
```

**Charger** les previews pour les collections :

```typescript
// Pour chaque board de type collection ou category
const boardsWithPreviews = await Promise.all(
  boards.map(async (board) => {
    if (board.boardType === 'collection' || board.boardType === 'category') {
      const previews = await getCollectionPreviews(board.id);
      return { ...board, previews };
    }
    return { ...board, previews: null };
  })
);
```

### 8.3 - Composant BoardCard (créer ou modifier)

**Utiliser** `CollectionThumbnailGrid` pour les collections :

```typescript
{board.boardType === 'collection' && board.previews ? (
  <CollectionThumbnailGrid 
    images={board.previews.images}
    totalCount={board.previews.totalCount}
  />
) : (
  <img 
    src={board.coverImageUrl || '/placeholder.png'}
    alt={board.name}
    className="w-full h-full object-cover"
  />
)}
```

## Checklist de Validation

- [ ] `CollectionThumbnailGrid.tsx` créé et sans erreur TypeScript
- [ ] Page Boards affiche seulement les boards racines
- [ ] Collections affichent un damier avec les images des pièces
- [ ] Pièces uniques affichent une image simple
- [ ] Badge "+N" s'affiche si plus de 4 pièces
- [ ] Layout adaptatif selon le nombre d'images (1, 2, 3, 4+)
- [ ] Placeholder affiché si collection vide

## Notes de Session

```
Date: 
Notes:


```

---

# SPRINT 9 : Auto-Arrange Hiérarchique

**Durée estimée** : 2h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 1  
**Prérequis** : Appartenance `zoneId` fonctionnelle

## Objectif

Adapter l'auto-arrange pour respecter la hiérarchie : les éléments avec `zoneId` ne sont pas déplacés individuellement.

## Fichiers à Modifier

### 9.1 - `src/features/boards/utils/autoArrange.ts`

**Modifier** la fonction `groupElementsByPhase` :

```typescript
function groupElementsByPhase(
  elements: BoardElement[],
  zones: BoardZone[]
): Map<PhaseId, BoardElement[]> {
  const groups = new Map<PhaseId, BoardElement[]>();

  for (const phase of PHASE_ORDER) {
    groups.set(phase, []);
  }

  for (const element of elements) {
    // NOUVEAU: Ignorer les éléments qui ont un zoneId
    if (element.zoneId) {
      continue;  // Ces éléments suivent leur zone, pas l'auto-arrange
    }

    const phase = ELEMENT_TO_PHASE[element.elementType];
    const group = groups.get(phase);
    if (group) {
      group.push(element);
    }
  }

  return groups;
}
```

**Modifier** la gestion des zones par état :

```typescript
// Séparer les zones par type et état
const categoryZones = zones.filter(z => z.zoneType === 'category');
const pieceZones = zones.filter(z => z.zoneType === 'piece');
const draftPieceZones = pieceZones.filter(z => !z.crystallizedAt);
const orderedPieceZones = pieceZones.filter(z => z.crystallizedAt);

// Positionnement :
// - Catégories → après les éléments libres (ou section dédiée)
// - Pièces draft → colonne Conception
// - Pièces commandées → colonne Exécution
```

## Checklist de Validation

- [ ] Éléments avec `zoneId` ne sont pas déplacés par l'auto-arrange
- [ ] Éléments libres sont rangés par phase
- [ ] ZoneCards de type "piece" draft vont dans Conception
- [ ] ZoneCards de type "piece" commandées/livrées vont dans Exécution
- [ ] ZoneCards de type "category" sont positionnées logiquement
- [ ] Aucune régression sur l'auto-arrange existant

## Notes de Session

```
Date: 
Notes:


```

---

# SPRINT 10 : Création Collection

**Durée estimée** : 2h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 5, Sprint 6  
**Prérequis** : DB et navigation fonctionnelles

## Objectif

Permettre de transformer un board simple en collection et d'ajouter des catégories.

## Fichiers à Modifier/Créer

### 10.1 - Action de conversion

```typescript
// src/features/boards/actions/boardActions.ts

export async function convertToCollectionAction(
  boardId: string
): Promise<ActionResult<Board>> {
  try {
    const board = await boardsRepository.updateBoard(boardId, {
      boardType: 'collection',
    });
    
    revalidatePath(`/boards/${boardId}`);
    
    return { success: true, data: board };
  } catch (error) {
    return { success: false, error: 'Impossible de convertir en collection' };
  }
}
```

### 10.2 - Action de création de catégorie

```typescript
export async function createCategoryAction(
  collectionBoardId: string,
  categoryName: string
): Promise<ActionResult<{ zone: BoardZone; board: Board }>> {
  try {
    const userId = await requireUserId();
    
    // Créer le sous-board pour la catégorie
    const categoryBoard = await boardsRepository.createBoard({
      userId,
      name: categoryName,
      parentBoardId: collectionBoardId,
      boardType: 'category',
    });
    
    // Créer la zone sur le board collection
    const zone = await zonesRepository.createZone({
      boardId: collectionBoardId,
      name: categoryName,
      zoneType: 'category',
      linkedBoardId: categoryBoard.id,
      // Position par défaut
      positionX: 100,
      positionY: 100,
      width: 280,
      height: 140,
    });
    
    revalidatePath(`/boards/${collectionBoardId}`);
    
    return { success: true, data: { zone, board: categoryBoard } };
  } catch (error) {
    return { success: false, error: 'Impossible de créer la catégorie' };
  }
}
```

### 10.3 - UI de conversion (dans BoardToolbar ou menu)

```typescript
// Bouton dans le menu du board
{board.boardType === 'free' && (
  <button onClick={handleConvertToCollection}>
    Convertir en collection
  </button>
)}

{board.boardType === 'collection' && (
  <button onClick={() => setShowCategoryModal(true)}>
    Ajouter une catégorie
  </button>
)}
```

## Checklist de Validation

- [ ] Un board "free" peut être converti en "collection"
- [ ] Le type du board est mis à jour en DB
- [ ] On peut créer une catégorie dans une collection
- [ ] La catégorie crée à la fois une zone ET un sous-board
- [ ] La zone est liée au sous-board (`linkedBoardId`)
- [ ] Le sous-board a le bon `parentBoardId` et `boardType`

## Notes de Session

```
Date: 
Notes:


```

---

# SPRINT 11 : Polish & Edge Cases

**Durée estimée** : 2h  
**Statut** : ⬜ À faire  
**Dépendances** : Tous les sprints précédents  
**Prérequis** : Fonctionnalités principales terminées

## Objectif

Gérer les cas limites, améliorer l'expérience et tester le flux complet.

## Tâches

### 11.1 - Suppression en Cascade

- [ ] Supprimer une zone avec sous-board : demander confirmation
- [ ] Option "Supprimer la zone et son contenu" vs "Détacher seulement"
- [ ] Gérer les boards orphelins

### 11.2 - Déplacement entre Niveaux

- [ ] Permettre de drag un élément HORS d'une zone (retirer `zoneId`)
- [ ] Feedback visuel lors du drag vers/hors d'une zone

### 11.3 - Animations et Transitions

- [ ] Animation d'ouverture du Focus Mode
- [ ] Transition lors de la navigation vers un sous-board
- [ ] Feedback de chargement

### 11.4 - Tests E2E

- [ ] Test: Créer collection → Ajouter catégorie → Ajouter pièce
- [ ] Test: Navigation breadcrumb aller-retour
- [ ] Test: Focus Mode → Ouvrir en plein écran
- [ ] Test: Drag élément vers zone via Focus Mode
- [ ] Test: Journey d'une collection

### 11.5 - Edge Cases

- [ ] Board avec 0 éléments
- [ ] Collection avec 0 catégories
- [ ] Catégorie avec 0 pièces
- [ ] Noms très longs (troncature)
- [ ] Beaucoup de niveaux (performance)

## Checklist de Validation

- [ ] Suppression cascade fonctionne avec confirmation
- [ ] Pas de boards orphelins après suppression
- [ ] Transitions fluides entre vues
- [ ] Tous les tests E2E passent
- [ ] Edge cases gérés gracieusement

## Notes de Session

```
Date: 
Notes:


```

---

# 📎 Annexes

## A. Commandes Utiles

```powershell
# Lancer le dev server
npm run dev

# Vérifier TypeScript
npx tsc --noEmit

# Voir un fichier
Get-Content -LiteralPath "src/path/to/file.tsx"

# Chercher dans les fichiers
Get-ChildItem -Path "src" -Recurse -Filter "*.tsx" | Select-String -Pattern "zoneId"
```

## B. Documents Liés

- `PROJECT_CONTEXT_V4_2.md` - Contexte technique global
- `SPRINT_PLAN.md` - Plan des sprints Boards & Admin
- `ADR_018_CRYSTALLIZATION_RULES.md` - Règles de cristallisation

## C. Décisions d'Architecture

| Décision | Choix | Raison |
|----------|-------|--------|
| Appartenance éléments | `zoneId` explicite | Plus fiable que calcul par position |
| Focus Mode vs Navigation | Les deux | Focus = preview, Navigation = travail |
| Boards imbriqués | `parentBoardId` | Hiérarchie claire et requêtes simples |
| Page Boards | Boards racines uniquement | Performance et clarté |
| Vue Journey | Niveau actuel uniquement | Cohérence avec isolation |

---

**Document créé le** : 27 Janvier 2026  
**Auteur** : Thomas / Claude  
**Prochaine session** : Commencer Sprint 1
