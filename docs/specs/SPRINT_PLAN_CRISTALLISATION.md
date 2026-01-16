# Plan de Sprints : Cristallisation & Parcours Projet

**Version** : 1.0  
**Date** : 16 Janvier 2026  
**Référence** : PARCOURS_DESIGNER_REFERENCE.md  
**Statut** : À implémenter

---

## Vue d'Ensemble

Ce document détaille les sprints techniques pour implémenter le parcours complet du designer : de la cristallisation jusqu'à la production.

### Sprints Prévus

| Sprint | Nom | Durée | Priorité |
|--------|-----|-------|----------|
| C1 | Zone + Éléments Solidaires | 4-5h | P1 |
| C2 | Projet Brouillon - Lecture Live | 3-4h | P1 |
| C3 | Action Passer Commande + Snapshot | 4-5h | P1 |
| C4 | Zone Commandée - Comportements | 3h | P1 |
| C5 | Vue Journey - Liste par Phase | 4-5h | P2 |
| C6 | Suivi Post-Commande | 3h | P2 |

**Total estimé : 21-25h**

---

## Sprint C1 : Zone + Éléments Solidaires

**Objectif** : Quand on déplace une zone cristallisée (brouillon), les éléments contenus suivent.

**Durée estimée** : 4-5h

### C1.1 - Fonction `isElementInZone` (45min)

```typescript
// src/features/boards/utils/zoneUtils.ts

/**
 * Détermine si un élément est "dans" une zone
 * Critère : le centre de l'élément est dans la zone
 */
export function isElementInZone(
  element: BoardElement,
  zone: BoardZone
): boolean {
  const elementCenterX = element.positionX + (element.width || 200) / 2;
  const elementCenterY = element.positionY + (element.height || 150) / 2;

  return (
    elementCenterX >= zone.positionX &&
    elementCenterX <= zone.positionX + zone.width &&
    elementCenterY >= zone.positionY &&
    elementCenterY <= zone.positionY + zone.height
  );
}
```

**Tests** :
- [ ] Élément complètement dans la zone → true
- [ ] Élément avec centre dans la zone mais débordant → true
- [ ] Élément avec centre hors zone → false
- [ ] Élément sur le bord exact → true (inclusif)

### C1.2 - Fonction `getElementsInZone` (30min)

```typescript
// src/features/boards/utils/zoneUtils.ts

/**
 * Retourne tous les éléments contenus dans une zone
 */
export function getElementsInZone(
  elements: BoardElement[],
  zone: BoardZone
): BoardElement[] {
  return elements.filter(element => isElementInZone(element, zone));
}

/**
 * Version async pour récupérer depuis la DB
 */
export async function getElementsInZoneFromDb(
  zoneId: string
): Promise<BoardElement[]> {
  // 1. Récupérer la zone
  const zone = await zonesRepository.getZoneById(zoneId);
  if (!zone) return [];

  // 2. Récupérer tous les éléments du board
  const elements = await elementsRepository.getElementsByBoard(zone.boardId);

  // 3. Filtrer ceux dans la zone
  return getElementsInZone(elements, zone);
}
```

### C1.3 - Modifier le déplacement de zone (1h30)

**Fichier** : `src/features/boards/components/BoardCanvas.tsx`

**Logique actuelle** :
```typescript
const handleZoneMouseUp = () => {
  // Sauvegarde uniquement la position de la zone
  saveZonePosition(pos.id, pos.x, pos.y);
};
```

**Nouvelle logique** :
```typescript
const handleZoneMouseDown = (e: React.MouseEvent, zone: BoardZone) => {
  // ... code existant ...

  // Si zone cristallisée (brouillon), capturer les éléments contenus
  if (zone.crystallizedAt && !zone.snapshot) {
    const containedElements = getElementsInZone(elements, zone);
    zoneDragRef.current = {
      ...zoneDragRef.current,
      containedElementIds: containedElements.map(el => el.id),
      containedElementsStartPositions: containedElements.map(el => ({
        id: el.id,
        x: el.positionX,
        y: el.positionY,
      })),
    };
  }
};

const handleZoneMouseMove = (e: MouseEvent) => {
  if (!zoneDragRef.current) return;
  
  const dx = e.clientX - zoneDragRef.current.startX;
  const dy = e.clientY - zoneDragRef.current.startY;
  
  // Déplacer la zone
  const newZoneX = Math.max(0, zoneDragRef.current.zoneStartX + dx);
  const newZoneY = Math.max(0, zoneDragRef.current.zoneStartY + dy);
  setDragPosition({ type: 'zone', id: zoneDragRef.current.zoneId, x: newZoneX, y: newZoneY });

  // Déplacer les éléments contenus (si zone cristallisée brouillon)
  if (zoneDragRef.current.containedElementsStartPositions) {
    zoneDragRef.current.containedElementsStartPositions.forEach(startPos => {
      const newElX = Math.max(0, startPos.x + dx);
      const newElY = Math.max(0, startPos.y + dy);
      // Mise à jour visuelle locale (optimistic)
      moveElementLocal(startPos.id, newElX, newElY);
    });
  }
};

const handleZoneMouseUp = () => {
  const pos = dragPositionRef.current;

  if (pos && pos.type === 'zone') {
    // Sauvegarder position zone
    moveZoneLocal(pos.id, pos.x, pos.y);
    saveZonePosition(pos.id, pos.x, pos.y);

    // Sauvegarder positions des éléments contenus
    if (zoneDragRef.current?.containedElementsStartPositions) {
      const dx = pos.x - zoneDragRef.current.zoneStartX;
      const dy = pos.y - zoneDragRef.current.zoneStartY;
      
      const elementMoves = zoneDragRef.current.containedElementsStartPositions.map(startPos => ({
        elementId: startPos.id,
        positionX: startPos.x + dx,
        positionY: startPos.y + dy,
      }));
      
      // Bulk save
      saveElementPositions(elementMoves);
    }
  }

  // Reset
  setDragPosition(null);
  zoneDragRef.current = null;
  // ... reste du cleanup
};
```

### C1.4 - Action bulk save positions (45min)

**Fichier** : `src/features/boards/actions/elementActions.ts`

```typescript
export async function bulkMoveElementsAction(
  moves: Array<{ elementId: string; positionX: number; positionY: number }>
): Promise<ActionResult<void>> {
  try {
    const sessionId = await getOrCreateSessionId();

    // Transaction pour mettre à jour tous les éléments
    const promises = moves.map(move =>
      elementsRepository.moveElement(move.elementId, {
        positionX: move.positionX,
        positionY: move.positionY,
      }, sessionId)
    );

    await Promise.all(promises);

    return { success: true };
  } catch (error) {
    console.error('bulkMoveElementsAction error:', error);
    return { success: false, error: 'Failed to move elements' };
  }
}
```

### C1.5 - Mise à jour du type zoneDragRef (30min)

```typescript
// Dans BoardCanvas.tsx

const zoneDragRef = useRef<{
  zoneId: string;
  startX: number;
  startY: number;
  zoneStartX: number;
  zoneStartY: number;
  // Nouveau : pour le déplacement solidaire
  containedElementIds?: string[];
  containedElementsStartPositions?: Array<{ id: string; x: number; y: number }>;
} | null>(null);
```

### Critères de Validation C1

- [ ] Déplacer une zone NON cristallisée → zone seule bouge
- [ ] Déplacer une zone cristallisée BROUILLON → zone + éléments bougent ensemble
- [ ] Les positions sont sauvegardées en DB après le drag
- [ ] Pas de lag visuel pendant le déplacement
- [ ] Undo/refresh montre les bonnes positions

---

## Sprint C2 : Projet Brouillon - Lecture Live

**Objectif** : Un projet brouillon affiche les éléments actuels de sa zone source (pas de copie).

**Durée estimée** : 3-4h

### C2.1 - API `getProjectContent` (1h)

**Fichier** : `src/features/journey/infrastructure/projectRepository.ts`

```typescript
export interface ProjectContent {
  project: Project;
  textiles: BoardElement[];
  calculations: BoardElement[];
  palettes: BoardElement[];
  notes: BoardElement[];
  inspirations: BoardElement[];
  isLive: boolean; // true si brouillon (données live), false si snapshot
}

export async function getProjectContent(
  projectId: string
): Promise<ProjectContent | null> {
  const supabase = createAdminClient();

  // 1. Récupérer le projet
  const { data: project, error } = await supabase
    .schema('deadstock')
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error || !project) return null;

  // 2. Si commandé+ → retourner le snapshot
  if (project.status !== 'draft' && project.snapshot) {
    return {
      project: mapProjectFromRow(project),
      textiles: project.snapshot.textiles || [],
      calculations: project.snapshot.calculations || [],
      palettes: project.snapshot.palettes || [],
      notes: project.snapshot.notes || [],
      inspirations: project.snapshot.inspirations || [],
      isLive: false,
    };
  }

  // 3. Si brouillon → lire les éléments live de la zone
  if (!project.source_zone_id) {
    return {
      project: mapProjectFromRow(project),
      textiles: [],
      calculations: [],
      palettes: [],
      notes: [],
      inspirations: [],
      isLive: true,
    };
  }

  const elements = await getElementsInZoneFromDb(project.source_zone_id);

  return {
    project: mapProjectFromRow(project),
    textiles: elements.filter(e => e.elementType === 'textile'),
    calculations: elements.filter(e => e.elementType === 'calculation'),
    palettes: elements.filter(e => e.elementType === 'palette'),
    notes: elements.filter(e => e.elementType === 'note'),
    inspirations: elements.filter(e => e.elementType === 'inspiration'),
    isLive: true,
  };
}
```

### C2.2 - Route API (30min)

**Fichier** : `src/app/api/projects/[projectId]/content/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getProjectContent } from '@/features/journey/infrastructure/projectRepository';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const content = await getProjectContent(params.projectId);

    if (!content) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching project content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### C2.3 - Hook `useProjectContent` (45min)

**Fichier** : `src/features/journey/hooks/useProjectContent.ts`

```typescript
import { useState, useEffect } from 'react';
import type { ProjectContent } from '../infrastructure/projectRepository';

export function useProjectContent(projectId: string | null) {
  const [content, setContent] = useState<ProjectContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setContent(null);
      setIsLoading(false);
      return;
    }

    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/projects/${projectId}/content`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch project content');
        }

        const data = await response.json();
        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [projectId]);

  // Fonction pour rafraîchir manuellement
  const refresh = () => {
    if (projectId) {
      // Re-trigger useEffect
      setContent(null);
    }
  };

  return { content, isLoading, error, refresh };
}
```

### C2.4 - Page Projet avec contenu live (1h)

**Fichier** : `src/app/(main)/journey/[projectId]/page.tsx`

```typescript
'use client';

import { useParams } from 'next/navigation';
import { useProjectContent } from '@/features/journey/hooks/useProjectContent';
import { ProjectHeader } from '@/features/journey/components/ProjectHeader';
import { ProjectTextilesList } from '@/features/journey/components/ProjectTextilesList';
import { ProjectCalculations } from '@/features/journey/components/ProjectCalculations';
import { ProjectPalettes } from '@/features/journey/components/ProjectPalettes';
import { DraftBanner } from '@/features/journey/components/DraftBanner';
import { Loader2 } from 'lucide-react';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { content, isLoading, error, refresh } = useProjectContent(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Projet introuvable</p>
      </div>
    );
  }

  const { project, textiles, calculations, palettes, isLive } = content;

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <ProjectHeader project={project} />

      {isLive && (
        <DraftBanner 
          boardId={project.sourceBoardId}
          zoneId={project.sourceZoneId}
          onRefresh={refresh}
        />
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">Tissus</h2>
        {textiles.length > 0 ? (
          <ProjectTextilesList textiles={textiles} isLive={isLive} />
        ) : (
          <p className="text-muted-foreground text-sm">
            Aucun tissu dans ce projet. Ajoutez des tissus à la zone sur le board.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Calculs de métrage</h2>
        {calculations.length > 0 ? (
          <ProjectCalculations calculations={calculations} />
        ) : (
          <p className="text-muted-foreground text-sm">
            Aucun calcul de métrage.
          </p>
        )}
      </section>

      {palettes.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Palettes</h2>
          <ProjectPalettes palettes={palettes} />
        </section>
      )}

      {isLive && (
        <div className="pt-6 border-t">
          <button
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            onClick={() => {/* TODO Sprint C3 */}}
          >
            Passer commande
          </button>
        </div>
      )}
    </div>
  );
}
```

### C2.5 - Composant DraftBanner (30min)

**Fichier** : `src/features/journey/components/DraftBanner.tsx`

```typescript
import Link from 'next/link';
import { Info, RefreshCw, ExternalLink } from 'lucide-react';

interface DraftBannerProps {
  boardId: string;
  zoneId: string;
  onRefresh: () => void;
}

export function DraftBanner({ boardId, zoneId, onRefresh }: DraftBannerProps) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Projet en brouillon</strong> — Les modifications sur le board 
            sont reflétées ici en temps réel.
          </p>
          <div className="flex gap-3 mt-2">
            <Link
              href={`/boards/${boardId}?zone=${zoneId}`}
              className="text-sm text-amber-700 dark:text-amber-300 hover:underline inline-flex items-center gap-1"
            >
              Voir sur le board <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={onRefresh}
              className="text-sm text-amber-700 dark:text-amber-300 hover:underline inline-flex items-center gap-1"
            >
              Rafraîchir <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Critères de Validation C2

- [ ] Page projet affiche les éléments actuels de la zone
- [ ] Modifier un élément sur le board → refresh projet → nouvelle valeur visible
- [ ] Ajouter un élément dans la zone → visible dans le projet
- [ ] Retirer un élément de la zone → disparaît du projet
- [ ] Banner "brouillon" affiché avec lien vers board

---

## Sprint C3 : Action Passer Commande + Snapshot

**Objectif** : Permettre au designer de passer commande, ce qui fige les données dans un snapshot.

**Durée estimée** : 4-5h

### C3.1 - Migration DB (30min)

**Fichier** : `database/migrations/017_project_order_fields.sql`

```sql
-- Ajouter les champs de commande au projet

-- Statut du projet
ALTER TABLE deadstock.projects 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'
CHECK (status IN ('draft', 'ordered', 'shipped', 'received', 'in_production', 'completed', 'archived'));

-- Dates de suivi
ALTER TABLE deadstock.projects
ADD COLUMN IF NOT EXISTS ordered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Snapshot des données (figé à la commande)
ALTER TABLE deadstock.projects
ADD COLUMN IF NOT EXISTS snapshot JSONB;

-- Index pour requêtes par statut
CREATE INDEX IF NOT EXISTS idx_projects_status ON deadstock.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_session_status ON deadstock.projects(session_id, status);

-- Commentaires
COMMENT ON COLUMN deadstock.projects.status IS 'Statut du projet: draft, ordered, shipped, received, in_production, completed, archived';
COMMENT ON COLUMN deadstock.projects.snapshot IS 'Copie figée des données au moment de la commande (textiles, calculs, palettes, détails commande)';
```

### C3.2 - Types TypeScript (30min)

**Fichier** : `src/features/journey/domain/types.ts`

```typescript
export type ProjectStatus = 
  | 'draft' 
  | 'ordered' 
  | 'shipped' 
  | 'received' 
  | 'in_production' 
  | 'completed' 
  | 'archived';

export interface Project {
  id: string;
  name: string;
  description?: string;
  projectType: 'single_piece' | 'ensemble' | 'collection';
  status: ProjectStatus;
  
  // Liens source
  sourceBoardId: string;
  sourceZoneId: string;
  
  // Dates
  createdAt: Date;
  orderedAt?: Date;
  shippedAt?: Date;
  receivedAt?: Date;
  completedAt?: Date;
  
  // Snapshot (null si brouillon)
  snapshot?: ProjectSnapshot;
  
  sessionId: string;
}

export interface ProjectSnapshot {
  textiles: SnapshotTextile[];
  calculations: SnapshotCalculation[];
  palettes: SnapshotPalette[];
  orderDetails: OrderDetails;
  totals: OrderTotals;
  capturedAt: string; // ISO date
}

export interface SnapshotTextile {
  textileId: string;
  name: string;
  source: string;
  sourceUrl?: string;
  pricePerMeter: number;
  imageUrl?: string;
  quantityOrdered: number;
  subtotal: number;
  attributes?: {
    fiber?: string;
    color?: string;
    width?: number;
  };
}

export interface SnapshotCalculation {
  garmentType: string;
  size: string;
  totalMeters: number;
  fabricWidth?: number;
}

export interface SnapshotPalette {
  colors: string[];
}

export interface OrderDetails {
  supplier: string;
  orderReference?: string;
  orderDate: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface OrderTotals {
  fabricCost: number;
  shipping?: number;
  total: number;
}
```

### C3.3 - Composant formulaire commande (1h30)

**Fichier** : `src/features/journey/components/OrderForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, AlertTriangle, Loader2 } from 'lucide-react';
import type { BoardElement } from '@/features/boards/domain/types';
import { placeOrderAction } from '../actions/orderActions';

interface OrderFormProps {
  projectId: string;
  textiles: BoardElement[];
  calculations: BoardElement[];
  onCancel: () => void;
}

export function OrderForm({ projectId, textiles, calculations, onCancel }: OrderFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État du formulaire
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    // Pré-remplir avec les quantités des calculs si disponibles
    const initial: Record<string, number> = {};
    textiles.forEach(t => {
      // Trouver le calcul correspondant ou utiliser 1m par défaut
      const calc = calculations[0]?.elementData;
      initial[t.id] = calc?.totalMeters || 1;
    });
    return initial;
  });
  const [supplier, setSupplier] = useState('');
  const [orderReference, setOrderReference] = useState('');
  const [notes, setNotes] = useState('');

  // Calcul du total
  const calculateTotal = () => {
    return textiles.reduce((sum, textile) => {
      const qty = quantities[textile.id] || 0;
      const price = textile.elementData?.pricePerMeter || 0;
      return sum + (qty * price);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await placeOrderAction({
        projectId,
        quantities,
        supplier,
        orderReference,
        notes,
      });

      if (!result.success) {
        setError(result.error || 'Erreur lors de la commande');
        return;
      }

      // Rediriger vers la page projet mise à jour
      router.refresh();
    } catch (err) {
      setError('Erreur inattendue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Attention :</strong> Une fois la commande passée, le projet 
            sera figé et ne pourra plus être modifié.
          </p>
        </div>
      </div>

      {/* Liste des tissus avec quantités */}
      <div className="space-y-4">
        <h3 className="font-medium">Tissus à commander</h3>
        {textiles.map(textile => (
          <div key={textile.id} className="flex items-center gap-4 p-4 border rounded-lg">
            {textile.elementData?.imageUrl && (
              <img
                src={textile.elementData.imageUrl}
                alt={textile.elementData.name}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <p className="font-medium">{textile.elementData?.name}</p>
              <p className="text-sm text-muted-foreground">
                {textile.elementData?.source} • {textile.elementData?.pricePerMeter}€/m
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={quantities[textile.id] || ''}
                onChange={(e) => setQuantities(prev => ({
                  ...prev,
                  [textile.id]: parseFloat(e.target.value) || 0
                }))}
                className="w-20 px-3 py-2 border rounded-lg text-right"
              />
              <span className="text-sm text-muted-foreground">m</span>
            </div>
            <div className="w-24 text-right">
              <p className="font-medium">
                {((quantities[textile.id] || 0) * (textile.elementData?.pricePerMeter || 0)).toFixed(2)}€
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Détails commande */}
      <div className="space-y-4">
        <h3 className="font-medium">Détails de la commande</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Fournisseur *
          </label>
          <input
            type="text"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="Ex: Nona Source"
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Référence commande
          </label>
          <input
            type="text"
            value={orderReference}
            onChange={(e) => setOrderReference(e.target.value)}
            placeholder="Ex: NS-2026-1234"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instructions particulières..."
            rows={3}
            className="w-full px-3 py-2 border rounded-lg resize-none"
          />
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between py-4 border-t border-b">
        <span className="text-lg font-medium">Total estimé</span>
        <span className="text-2xl font-bold">{calculateTotal().toFixed(2)}€</span>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 py-3 border rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !supplier || textiles.length === 0}
          className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ShoppingCart className="w-5 h-5" />
          )}
          Confirmer la commande
        </button>
      </div>
    </form>
  );
}
```

### C3.4 - Server Action `placeOrder` (1h)

**Fichier** : `src/features/journey/actions/orderActions.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { getOrCreateSessionId } from '@/features/favorites/utils/sessionManager';
import { projectsRepository } from '../infrastructure/projectsRepository';
import { getElementsInZoneFromDb } from '@/features/boards/utils/zoneUtils';
import type { ProjectSnapshot, SnapshotTextile, OrderDetails, OrderTotals } from '../domain/types';

interface PlaceOrderInput {
  projectId: string;
  quantities: Record<string, number>; // elementId -> meters
  supplier: string;
  orderReference?: string;
  notes?: string;
}

export async function placeOrderAction(input: PlaceOrderInput): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const sessionId = await getOrCreateSessionId();

    // 1. Vérifier que le projet existe et est en brouillon
    const project = await projectsRepository.getProjectById(input.projectId);
    
    if (!project) {
      return { success: false, error: 'Projet introuvable' };
    }

    if (project.status !== 'draft') {
      return { success: false, error: 'Ce projet a déjà été commandé' };
    }

    if (project.sessionId !== sessionId) {
      return { success: false, error: 'Accès non autorisé' };
    }

    // 2. Récupérer les éléments actuels de la zone
    const elements = await getElementsInZoneFromDb(project.sourceZoneId);

    // 3. Créer le snapshot
    const textiles: SnapshotTextile[] = elements
      .filter(e => e.elementType === 'textile')
      .map(e => ({
        textileId: e.elementData?.textileId || e.id,
        name: e.elementData?.name || 'Tissu inconnu',
        source: e.elementData?.source || '',
        sourceUrl: e.elementData?.sourceUrl,
        pricePerMeter: e.elementData?.pricePerMeter || 0,
        imageUrl: e.elementData?.imageUrl,
        quantityOrdered: input.quantities[e.id] || 0,
        subtotal: (input.quantities[e.id] || 0) * (e.elementData?.pricePerMeter || 0),
        attributes: {
          fiber: e.elementData?.fiber,
          color: e.elementData?.color,
          width: e.elementData?.width,
        },
      }));

    const calculations = elements
      .filter(e => e.elementType === 'calculation')
      .map(e => ({
        garmentType: e.elementData?.garmentType || '',
        size: e.elementData?.size || '',
        totalMeters: e.elementData?.totalMeters || 0,
        fabricWidth: e.elementData?.fabricWidth,
      }));

    const palettes = elements
      .filter(e => e.elementType === 'palette')
      .map(e => ({
        colors: e.elementData?.colors || [],
      }));

    const fabricCost = textiles.reduce((sum, t) => sum + t.subtotal, 0);

    const orderDetails: OrderDetails = {
      supplier: input.supplier,
      orderReference: input.orderReference,
      orderDate: new Date().toISOString(),
      notes: input.notes,
    };

    const totals: OrderTotals = {
      fabricCost,
      total: fabricCost, // TODO: ajouter frais de port
    };

    const snapshot: ProjectSnapshot = {
      textiles,
      calculations,
      palettes,
      orderDetails,
      totals,
      capturedAt: new Date().toISOString(),
    };

    // 4. Mettre à jour le projet
    await projectsRepository.updateProject(input.projectId, {
      status: 'ordered',
      orderedAt: new Date(),
      snapshot,
    });

    // 5. Revalider les pages
    revalidatePath(`/journey/${input.projectId}`);
    revalidatePath(`/boards/${project.sourceBoardId}`);

    return { success: true };
  } catch (error) {
    console.error('placeOrderAction error:', error);
    return { success: false, error: 'Erreur lors de la commande' };
  }
}
```

### C3.5 - Mise à jour repository (30min)

**Fichier** : `src/features/journey/infrastructure/projectsRepository.ts`

Ajouter la fonction `updateProject` :

```typescript
export async function updateProject(
  projectId: string,
  updates: {
    status?: ProjectStatus;
    orderedAt?: Date;
    shippedAt?: Date;
    receivedAt?: Date;
    completedAt?: Date;
    snapshot?: ProjectSnapshot;
  }
): Promise<Project | null> {
  const supabase = createAdminClient();

  const dbUpdates: Record<string, unknown> = {};
  
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.orderedAt) dbUpdates.ordered_at = updates.orderedAt.toISOString();
  if (updates.shippedAt) dbUpdates.shipped_at = updates.shippedAt.toISOString();
  if (updates.receivedAt) dbUpdates.received_at = updates.receivedAt.toISOString();
  if (updates.completedAt) dbUpdates.completed_at = updates.completedAt.toISOString();
  if (updates.snapshot) dbUpdates.snapshot = updates.snapshot;

  const { data, error } = await supabase
    .schema('deadstock')
    .from('projects')
    .update(dbUpdates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('updateProject error:', error);
    throw error;
  }

  return mapProjectFromRow(data);
}
```

### Critères de Validation C3

- [ ] Migration appliquée sans erreur
- [ ] Bouton "Passer commande" ouvre le formulaire
- [ ] Quantités pré-remplies depuis les calculs
- [ ] Total calculé correctement
- [ ] Validation : fournisseur obligatoire
- [ ] Soumission crée le snapshot en DB
- [ ] Statut passe à "ordered"
- [ ] Page projet affiche le snapshot (pas live)
- [ ] Retour sur board : zone marquée "Commandé"

---

## Sprint C4 : Zone Commandée - Comportements

**Objectif** : Une zone commandée peut être déplacée (seule) et réduite, mais pas modifiée.

**Durée estimée** : 3h

### C4.1 - Logique de déplacement conditionnel (45min)

**Fichier** : `src/features/boards/components/BoardCanvas.tsx`

Modifier `handleZoneMouseDown` :

```typescript
const handleZoneMouseDown = (e: React.MouseEvent, zone: BoardZone) => {
  if (e.button !== 0) return;
  e.stopPropagation();
  selectZone(zone.id);

  // Déterminer si c'est une zone commandée (a un snapshot)
  const isOrdered = zone.crystallizedAt && zone.snapshot;
  const isDraft = zone.crystallizedAt && !zone.snapshot;

  zoneDragRef.current = {
    zoneId: zone.id,
    startX: e.clientX,
    startY: e.clientY,
    zoneStartX: zone.positionX,
    zoneStartY: zone.positionY,
    // Pour brouillon : capturer les éléments
    containedElementIds: isDraft ? getElementsInZone(elements, zone).map(el => el.id) : [],
    containedElementsStartPositions: isDraft 
      ? getElementsInZone(elements, zone).map(el => ({ id: el.id, x: el.positionX, y: el.positionY }))
      : [],
    // Pour commandé : pas d'éléments (zone seule)
    isOrderedZone: isOrdered,
  };

  setDragging(true);
  document.addEventListener('mousemove', handleZoneMouseMove);
  document.addEventListener('mouseup', handleZoneMouseUp);
};
```

### C4.2 - Bloquer le resize des zones commandées (30min)

**Fichier** : `src/features/boards/components/ZoneCard.tsx`

```typescript
// Dans le rendu des poignées de resize
{!isCrystallized || (isCrystallized && !zone.snapshot) ? (
  // Afficher les poignées de resize
  <>
    {isSelected && RESIZE_HANDLES.map(handle => (
      <ResizeHandle
        key={handle}
        handle={handle}
        onMouseDown={(e) => onResizeStart(e, handle)}
      />
    ))}
  </>
) : null}
```

### C4.3 - Mode réduit toggle (1h)

**Fichier** : `src/features/boards/domain/types.ts`

Ajouter au type BoardZone :
```typescript
export interface BoardZone {
  // ... existant
  isCollapsed?: boolean; // Mode réduit
}
```

**Fichier** : `src/features/boards/components/ZoneCard.tsx`

```typescript
interface ZoneCardProps {
  zone: BoardZone;
  // ... existant
  onToggleCollapse?: () => void;
}

export function ZoneCard({ zone, onToggleCollapse, ...props }: ZoneCardProps) {
  const isOrdered = zone.crystallizedAt && zone.snapshot;
  const isCollapsed = zone.isCollapsed && isOrdered;

  if (isCollapsed) {
    // Rendu compact
    return (
      <div
        className="absolute rounded-lg border-2 border-solid bg-muted/50 cursor-move"
        style={{
          left: zone.positionX,
          top: zone.positionY,
          width: 250,
          height: 40,
          borderColor: zone.color,
        }}
        onMouseDown={props.onMouseDown}
      >
        <div 
          className="h-full px-3 flex items-center justify-between gap-2"
          style={{ backgroundColor: zone.color }}
        >
          <div className="flex items-center gap-2 text-white">
            <Lock className="w-3 h-3" />
            <span className="text-sm font-medium truncate max-w-[120px]">
              {zone.name}
            </span>
            <span className="text-xs opacity-75">✓</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/80">
              {zone.snapshot?.totals?.total?.toFixed(0)}€
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse?.();
              }}
              className="p-1 hover:bg-white/20 rounded"
            >
              <Maximize2 className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rendu normal (existant) avec bouton réduire pour zones commandées
  return (
    <div /* ... existant ... */>
      {/* Header */}
      <div /* ... existant ... */>
        {/* ... nom, badge ... */}
        
        {isOrdered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse?.();
            }}
            className="p-1 hover:bg-white/20 rounded"
            title="Réduire"
          >
            <Minimize2 className="w-3 h-3 text-white" />
          </button>
        )}
      </div>
      
      {/* ... reste du contenu ... */}
    </div>
  );
}
```

### C4.4 - Action toggle collapse (30min)

**Fichier** : `src/features/boards/actions/zoneActions.ts`

```typescript
export async function toggleZoneCollapseAction(zoneId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const zone = await zonesRepository.getZoneById(zoneId);
    if (!zone) {
      return { success: false, error: 'Zone introuvable' };
    }

    await zonesRepository.updateZone(zoneId, {
      isCollapsed: !zone.isCollapsed,
    });

    revalidatePath(`/boards/${zone.boardId}`);
    return { success: true };
  } catch (error) {
    console.error('toggleZoneCollapseAction error:', error);
    return { success: false, error: 'Erreur' };
  }
}
```

### C4.5 - Bloquer modification éléments dans zone commandée (15min)

**Fichier** : `src/features/boards/components/BoardCanvas.tsx`

```typescript
const handleDoubleClick = (element: BoardElement) => {
  // Vérifier si l'élément est dans une zone commandée
  const parentZone = zones.find(z => 
    z.crystallizedAt && 
    z.snapshot && 
    isElementInZone(element, z)
  );

  if (parentZone) {
    // Ne pas permettre l'édition
    toast.info('Cet élément fait partie d\'un projet commandé et ne peut pas être modifié.');
    return;
  }

  // Édition normale
  setEditingElementId(element.id);
};
```

### Critères de Validation C4

- [ ] Zone commandée : peut être déplacée (seule, sans éléments)
- [ ] Zone commandée : pas de poignées de resize
- [ ] Zone commandée : bouton réduire visible
- [ ] Mode réduit : affichage compact (1 ligne)
- [ ] Mode réduit : bouton agrandir visible
- [ ] Toggle collapse sauvegardé en DB
- [ ] Double-clic sur élément dans zone commandée → message info

---

## Sprint C5 : Vue Journey - Liste par Phase

**Objectif** : Page Journey affichant tous les projets groupés par statut.

**Durée estimée** : 4-5h

### C5.1 - API liste projets par statut (1h)

**Fichier** : `src/features/journey/infrastructure/projectsRepository.ts`

```typescript
export interface ProjectsByStatus {
  drafts: Project[];
  ordered: Project[];
  received: Project[];
  completed: Project[];
}

export async function getProjectsByStatus(
  sessionId: string
): Promise<ProjectsByStatus> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .schema('deadstock')
    .from('projects')
    .select('*')
    .eq('session_id', sessionId)
    .neq('status', 'archived')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getProjectsByStatus error:', error);
    throw error;
  }

  const projects = (data || []).map(mapProjectFromRow);

  return {
    drafts: projects.filter(p => p.status === 'draft'),
    ordered: projects.filter(p => ['ordered', 'shipped'].includes(p.status)),
    received: projects.filter(p => ['received', 'in_production'].includes(p.status)),
    completed: projects.filter(p => p.status === 'completed'),
  };
}
```

### C5.2 - Page Journey principale (2h)

**Fichier** : `src/app/(main)/journey/page.tsx`

```typescript
import { getOrCreateSessionId } from '@/features/favorites/utils/sessionManager';
import { getProjectsByStatus } from '@/features/journey/infrastructure/projectsRepository';
import { JourneyDashboard } from '@/features/journey/components/JourneyDashboard';

export default async function JourneyPage() {
  const sessionId = await getOrCreateSessionId();
  const projectsByStatus = await getProjectsByStatus(sessionId);

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Journey</h1>
          <p className="text-muted-foreground">
            Suivez vos projets de la conception à la réalisation
          </p>
        </div>
      </div>

      <JourneyDashboard projectsByStatus={projectsByStatus} />
    </div>
  );
}
```

### C5.3 - Composant JourneyDashboard (1h30)

**Fichier** : `src/features/journey/components/JourneyDashboard.tsx`

```typescript
'use client';

import { FileText, Package, CheckCircle, Trophy } from 'lucide-react';
import type { ProjectsByStatus, Project } from '../domain/types';
import { ProjectCard } from './ProjectCard';

interface JourneyDashboardProps {
  projectsByStatus: ProjectsByStatus;
}

const COLUMNS = [
  {
    key: 'drafts' as const,
    title: 'Brouillons',
    icon: FileText,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    key: 'ordered' as const,
    title: 'Commandés',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    key: 'received' as const,
    title: 'Reçus',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
  },
  {
    key: 'completed' as const,
    title: 'Terminés',
    icon: Trophy,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
  },
];

export function JourneyDashboard({ projectsByStatus }: JourneyDashboardProps) {
  const totalProjects = 
    projectsByStatus.drafts.length +
    projectsByStatus.ordered.length +
    projectsByStatus.received.length +
    projectsByStatus.completed.length;

  if (totalProjects === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-medium mb-2">Aucun projet</h2>
        <p className="text-muted-foreground mb-4">
          Cristallisez une zone sur un board pour créer votre premier projet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {COLUMNS.map(column => {
        const projects = projectsByStatus[column.key];
        const Icon = column.icon;

        return (
          <div key={column.key} className="space-y-4">
            {/* Header colonne */}
            <div className={`${column.bgColor} rounded-lg p-3`}>
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${column.color}`} />
                <span className="font-medium">{column.title}</span>
                <span className="ml-auto text-sm text-muted-foreground">
                  {projects.length}
                </span>
              </div>
            </div>

            {/* Liste projets */}
            <div className="space-y-3">
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun projet
                </p>
              ) : (
                projects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project}
                    variant="compact"
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### C5.4 - Composant ProjectCard (30min)

**Fichier** : `src/features/journey/components/ProjectCard.tsx`

```typescript
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ExternalLink } from 'lucide-react';
import type { Project } from '../domain/types';

interface ProjectCardProps {
  project: Project;
  variant?: 'compact' | 'full';
}

export function ProjectCard({ project, variant = 'compact' }: ProjectCardProps) {
  const timeAgo = formatDistanceToNow(new Date(project.createdAt), {
    addSuffix: true,
    locale: fr,
  });

  if (variant === 'compact') {
    return (
      <Link
        href={`/journey/${project.id}`}
        className="block p-3 border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium truncate">{project.name}</p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
          {project.snapshot?.totals && (
            <span className="text-sm font-medium shrink-0">
              {project.snapshot.totals.total.toFixed(0)}€
            </span>
          )}
        </div>
        {project.snapshot?.orderDetails?.supplier && (
          <p className="text-xs text-muted-foreground mt-1">
            {project.snapshot.orderDetails.supplier}
          </p>
        )}
      </Link>
    );
  }

  // Variant full pour la page détail
  return (
    <div className="p-4 border rounded-lg">
      {/* ... version détaillée ... */}
    </div>
  );
}
```

### Critères de Validation C5

- [ ] Page /journey affiche les 4 colonnes
- [ ] Projets groupés par statut correctement
- [ ] Compteur par colonne
- [ ] Clic sur projet → page détail
- [ ] État vide si aucun projet
- [ ] Affichage du prix total pour projets commandés

---

## Sprint C6 : Suivi Post-Commande

**Objectif** : Actions pour faire avancer le statut (expédié, reçu, terminé).

**Durée estimée** : 3h

### C6.1 - Actions de changement de statut (1h)

**Fichier** : `src/features/journey/actions/statusActions.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { projectsRepository } from '../infrastructure/projectsRepository';
import type { ProjectStatus } from '../domain/types';

export async function updateProjectStatusAction(
  projectId: string,
  newStatus: ProjectStatus,
  additionalData?: {
    trackingNumber?: string;
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const project = await projectsRepository.getProjectById(projectId);
    
    if (!project) {
      return { success: false, error: 'Projet introuvable' };
    }

    // Validation des transitions
    const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      draft: ['ordered'],
      ordered: ['shipped', 'received'],
      shipped: ['received'],
      received: ['in_production', 'completed'],
      in_production: ['completed'],
      completed: ['archived'],
      archived: [],
    };

    if (!validTransitions[project.status].includes(newStatus)) {
      return { 
        success: false, 
        error: `Transition ${project.status} → ${newStatus} non autorisée` 
      };
    }

    // Préparer les mises à jour
    const updates: Record<string, unknown> = { status: newStatus };

    switch (newStatus) {
      case 'shipped':
        updates.shippedAt = new Date();
        if (additionalData?.trackingNumber) {
          // Ajouter au snapshot
          updates.snapshot = {
            ...project.snapshot,
            shipping: {
              ...project.snapshot?.shipping,
              trackingNumber: additionalData.trackingNumber,
            },
          };
        }
        break;
      case 'received':
        updates.receivedAt = new Date();
        break;
      case 'completed':
        updates.completedAt = new Date();
        break;
    }

    await projectsRepository.updateProject(projectId, updates);

    revalidatePath(`/journey/${projectId}`);
    revalidatePath('/journey');

    return { success: true };
  } catch (error) {
    console.error('updateProjectStatusAction error:', error);
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }
}
```

### C6.2 - Composant Timeline projet (1h)

**Fichier** : `src/features/journey/components/ProjectTimeline.tsx`

```typescript
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  FileText, 
  ShoppingCart, 
  Truck, 
  Package, 
  Scissors, 
  Trophy,
  Circle,
  CheckCircle2
} from 'lucide-react';
import type { Project } from '../domain/types';

interface ProjectTimelineProps {
  project: Project;
}

const TIMELINE_STEPS = [
  { status: 'draft', label: 'Créé', icon: FileText, dateField: 'createdAt' },
  { status: 'ordered', label: 'Commandé', icon: ShoppingCart, dateField: 'orderedAt' },
  { status: 'shipped', label: 'Expédié', icon: Truck, dateField: 'shippedAt' },
  { status: 'received', label: 'Reçu', icon: Package, dateField: 'receivedAt' },
  { status: 'in_production', label: 'En production', icon: Scissors, dateField: null },
  { status: 'completed', label: 'Terminé', icon: Trophy, dateField: 'completedAt' },
];

export function ProjectTimeline({ project }: ProjectTimelineProps) {
  const currentIndex = TIMELINE_STEPS.findIndex(s => s.status === project.status);

  return (
    <div className="space-y-3">
      {TIMELINE_STEPS.map((step, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;
        
        const date = step.dateField ? project[step.dateField as keyof Project] : null;
        const Icon = step.icon;

        return (
          <div 
            key={step.status}
            className={`flex items-center gap-3 ${isFuture ? 'opacity-40' : ''}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${isPast ? 'bg-green-100 text-green-600' : ''}
              ${isCurrent ? 'bg-primary text-primary-foreground' : ''}
              ${isFuture ? 'bg-muted text-muted-foreground' : ''}
            `}>
              {isPast ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
            </div>
            
            <div className="flex-1">
              <p className={`text-sm ${isCurrent ? 'font-medium' : ''}`}>
                {step.label}
              </p>
              {date && (
                <p className="text-xs text-muted-foreground">
                  {format(new Date(date as string), 'dd MMM yyyy', { locale: fr })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### C6.3 - Boutons d'action selon statut (1h)

**Fichier** : `src/features/journey/components/ProjectActions.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Package, Scissors, Trophy, Loader2 } from 'lucide-react';
import { updateProjectStatusAction } from '../actions/statusActions';
import type { Project, ProjectStatus } from '../domain/types';

interface ProjectActionsProps {
  project: Project;
}

export function ProjectActions({ project }: ProjectActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    setIsLoading(true);
    
    const result = await updateProjectStatusAction(project.id, newStatus, {
      trackingNumber: trackingNumber || undefined,
    });

    if (result.success) {
      router.refresh();
    }

    setIsLoading(false);
  };

  // Définir les actions disponibles selon le statut actuel
  const getAvailableActions = () => {
    switch (project.status) {
      case 'ordered':
        return [
          { 
            status: 'shipped' as const, 
            label: 'Marquer expédié', 
            icon: Truck,
            showTracking: true,
          },
          { 
            status: 'received' as const, 
            label: 'Marquer reçu', 
            icon: Package,
          },
        ];
      case 'shipped':
        return [
          { 
            status: 'received' as const, 
            label: 'Marquer reçu', 
            icon: Package,
          },
        ];
      case 'received':
        return [
          { 
            status: 'in_production' as const, 
            label: 'Commencer production', 
            icon: Scissors,
          },
          { 
            status: 'completed' as const, 
            label: 'Marquer terminé', 
            icon: Trophy,
          },
        ];
      case 'in_production':
        return [
          { 
            status: 'completed' as const, 
            label: 'Marquer terminé', 
            icon: Trophy,
          },
        ];
      default:
        return [];
    }
  };

  const actions = getAvailableActions();

  if (actions.length === 0) return null;

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-medium">Actions</h3>
      
      {actions.some(a => a.showTracking) && (
        <div>
          <label className="block text-sm mb-1">Numéro de suivi (optionnel)</label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Ex: COLISSIMO-ABC123"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.status}
              onClick={() => handleStatusChange(action.status)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

### Critères de Validation C6

- [ ] Projet commandé → peut marquer "expédié" ou "reçu"
- [ ] Projet expédié → peut marquer "reçu"
- [ ] Projet reçu → peut commencer production ou terminer
- [ ] Timeline reflète les dates de chaque étape
- [ ] Numéro de suivi optionnel à l'expédition
- [ ] Page Journey mise à jour après changement de statut

---

## Récapitulatif

| Sprint | Objectif Principal | Durée |
|--------|-------------------|-------|
| **C1** | Zone + éléments solidaires | 4-5h |
| **C2** | Projet brouillon = lecture live | 3-4h |
| **C3** | Passer commande + snapshot | 4-5h |
| **C4** | Zone commandée (déplacer, réduire) | 3h |
| **C5** | Vue Journey par phase | 4-5h |
| **C6** | Suivi post-commande | 3h |

**Total : 21-25h**

---

## Ordre d'Exécution Recommandé

```
Semaine 1 :
├── C1 : Zone + éléments solidaires (pré-requis)
└── C2 : Projet brouillon live

Semaine 2 :
├── C3 : Passer commande + snapshot
└── C4 : Zone commandée comportements

Semaine 3 :
├── C5 : Vue Journey
└── C6 : Suivi post-commande
```

---

**Document prêt pour implémentation.**
