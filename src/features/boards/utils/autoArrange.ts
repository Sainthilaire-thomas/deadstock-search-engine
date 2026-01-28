// src/features/boards/utils/autoArrange.ts
// Sprint P2 - Auto-arrangement des éléments par phase Journey

import type { Board, BoardElement, ElementType } from '../domain/types';

// ============================================
// TYPES
// ============================================

export type PhaseId = 'mood' | 'conception' | 'execution';

export interface ArrangeOptions {
  spacing: number;        // Espacement entre éléments (défaut: 24px)
  phaseSpacing: number;   // Espacement entre phases (défaut: 100px)
  startX: number;         // Position X de départ
  startY: number;         // Position Y de départ
  columnsPerPhase: number; // Nombre de colonnes par phase (défaut: 4)
}

export interface ElementMove {
  id: string;
  x: number;
  y: number;
}

export interface ChildBoardMove {
  id: string;
  x: number;
  y: number;
}

export interface ArrangeResult {
  elementMoves: ElementMove[];
  childBoardMoves: ChildBoardMove[];
}

export interface PhasePreview {
  phase: PhaseId;
  label: string;
  count: number;
}

// ============================================
// CONSTANTS
// ============================================

// Mapping ElementType → Phase
export const ELEMENT_TO_PHASE: Record<ElementType, PhaseId> = {
  // Mood (inspiration, recherche)
  inspiration: 'mood',
  palette: 'mood',
  silhouette: 'mood',
  video: 'mood',
  link: 'mood',
  pdf: 'mood',
  note: 'mood',

  // Conception (technique, calculs)
  pattern: 'conception',
  calculation: 'conception',
  textile: 'conception',
};

export const PHASE_LABELS: Record<PhaseId, string> = {
  mood: 'Mood',
  conception: 'Conception',
  execution: 'Exécution',
};

export const PHASE_ORDER: PhaseId[] = ['mood', 'conception', 'execution'];

// Dimensions par défaut des éléments (si non spécifiées)
export const DEFAULT_ELEMENT_SIZES: Record<ElementType, { width: number; height: number }> = {
  note: { width: 200, height: 120 },
  palette: { width: 200, height: 100 },
  textile: { width: 180, height: 220 },
  calculation: { width: 240, height: 200 },
  inspiration: { width: 200, height: 200 },
  video: { width: 280, height: 180 },
  link: { width: 240, height: 120 },
  pdf: { width: 160, height: 200 },
  pattern: { width: 140, height: 180 },
  silhouette: { width: 120, height: 160 },
};

// ============================================
// DEFAULT OPTIONS
// ============================================

export const DEFAULT_ARRANGE_OPTIONS: ArrangeOptions = {
  spacing: 24,
  phaseSpacing: 100,
  startX: 50,
  startY: 50,
  columnsPerPhase: 4,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Obtient la taille d'un élément (utilise les valeurs par défaut si non spécifiées)
 */
function getElementSize(element: BoardElement): { width: number; height: number } {
  const defaults = DEFAULT_ELEMENT_SIZES[element.elementType];
  return {
    width: element.width ?? defaults.width,
    height: element.height ?? defaults.height,
  };
}

/**
 * Vérifie si un élément est visuellement dans un child board
 */
function isElementInChildBoard(element: BoardElement, childBoards: Board[]): boolean {
  return childBoards.some(cb => {
    // Un child board doit avoir des coordonnées
    if (cb.positionX === null || cb.positionY === null) return false;
    
    const inX = element.positionX >= cb.positionX &&
                element.positionX < cb.positionX + cb.width;
    const inY = element.positionY >= cb.positionY &&
                element.positionY < cb.positionY + cb.height;
    return inX && inY;
  });
}

/**
 * Groupe les éléments libres (non dans un child board) par phase
 */
function groupElementsByPhase(
  elements: BoardElement[],
  childBoards: Board[]
): Map<PhaseId, BoardElement[]> {
  const groups = new Map<PhaseId, BoardElement[]>();

  // Initialiser les groupes
  for (const phase of PHASE_ORDER) {
    groups.set(phase, []);
  }

  // Trier les éléments
  for (const element of elements) {
    // Ignorer les éléments dans un child board
    if (isElementInChildBoard(element, childBoards)) {
      continue;
    }

    const phase = ELEMENT_TO_PHASE[element.elementType];
    const group = groups.get(phase);
    if (group) {
      group.push(element);
    }
  }

  return groups;
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Génère un aperçu du rangement (compteurs par phase)
 */
export function getArrangePreview(
  elements: BoardElement[],
  childBoards: Board[]
): PhasePreview[] {
  const groups = groupElementsByPhase(elements, childBoards);

  const previews: PhasePreview[] = [];

  for (const phase of PHASE_ORDER) {
    const count = phase === 'execution'
      ? childBoards.length
      : (groups.get(phase)?.length ?? 0);

    if (count > 0) {
      previews.push({
        phase,
        label: PHASE_LABELS[phase],
        count,
      });
    }
  }

  return previews;
}

/**
 * Calcule les nouvelles positions pour un arrangement automatique par phase
 *
 * Layout:
 * - Chaque phase est une colonne verticale
 * - Les éléments sont disposés en grille dans chaque phase
 * - Les child boards (pièces) vont dans "Exécution"
 * - Les éléments DANS un child board ne bougent pas
 */
export function autoArrangeByPhase(
  elements: BoardElement[],
  childBoards: Board[],
  options: Partial<ArrangeOptions> = {}
): ArrangeResult {
  const opts = { ...DEFAULT_ARRANGE_OPTIONS, ...options };

  const elementMoves: ElementMove[] = [];
  const childBoardMoves: ChildBoardMove[] = [];

  // Grouper les éléments libres par phase
  const groups = groupElementsByPhase(elements, childBoards);

  let currentX = opts.startX;

  // Pour chaque phase (sauf execution qui contient les child boards)
  for (const phase of PHASE_ORDER) {
    if (phase === 'execution') {
      // Les child boards vont dans Exécution
      if (childBoards.length > 0) {
        let childBoardY = opts.startY;
        let maxChildBoardWidth = 0;

        for (const cb of childBoards) {
          childBoardMoves.push({
            id: cb.id,
            x: currentX,
            y: childBoardY,
          });

          childBoardY += cb.height + opts.spacing;
          maxChildBoardWidth = Math.max(maxChildBoardWidth, cb.width);
        }

        currentX += maxChildBoardWidth + opts.phaseSpacing;
      }
    } else {
      const phaseElements = groups.get(phase) ?? [];

      if (phaseElements.length === 0) {
        continue; // Skip empty phases
      }

      // Calculer la largeur max des éléments de cette phase
      let maxWidth = 0;
      for (const el of phaseElements) {
        const size = getElementSize(el);
        maxWidth = Math.max(maxWidth, size.width);
      }

      // Layout en grille verticale (1 colonne par phase pour simplicité)
      let currentY = opts.startY;
      let columnX = currentX;
      let columnMaxWidth = 0;
      let itemsInColumn = 0;

      for (const element of phaseElements) {
        const size = getElementSize(element);

        // Si on dépasse N éléments par colonne, nouvelle colonne
        if (itemsInColumn >= opts.columnsPerPhase * 3) { // ~12 éléments max par colonne
          columnX += columnMaxWidth + opts.spacing;
          currentY = opts.startY;
          columnMaxWidth = 0;
          itemsInColumn = 0;
        }

        elementMoves.push({
          id: element.id,
          x: columnX,
          y: currentY,
        });

        currentY += size.height + opts.spacing;
        columnMaxWidth = Math.max(columnMaxWidth, size.width);
        itemsInColumn++;
      }

      // Avancer X pour la prochaine phase
      currentX = columnX + columnMaxWidth + opts.phaseSpacing;
    }
  }

  return { elementMoves, childBoardMoves };
}

/**
 * Calcule le nombre total d'éléments qui seront déplacés
 */
export function countMovableItems(
  elements: BoardElement[],
  childBoards: Board[]
): { elements: number; childBoards: number; total: number } {
  const groups = groupElementsByPhase(elements, childBoards);

  let elementCount = 0;
  for (const phase of ['mood', 'conception'] as PhaseId[]) {
    elementCount += groups.get(phase)?.length ?? 0;
  }

  return {
    elements: elementCount,
    childBoards: childBoards.length,
    total: elementCount + childBoards.length,
  };
}

// ============================================
// PHASE BOUNDS (pour affichage colonnes)
// ============================================

export interface PhaseBounds {
  phase: PhaseId;
  x: number;
  width: number;
  elementCount: number;
}

/**
 * Calcule les bounds de chaque phase après un arrangement
 * Utilisé pour afficher les colonnes de fond
 */
export function calculatePhaseBounds(
  result: ArrangeResult,
  elements: BoardElement[],
  childBoards: Board[],
  options: Partial<ArrangeOptions> = {}
): PhaseBounds[] {
  const opts = { ...DEFAULT_ARRANGE_OPTIONS, ...options };
  const bounds: PhaseBounds[] = [];

  // Grouper les moves par position X pour déterminer les colonnes
  const elementMovesByPhase = new Map<PhaseId, { moves: ElementMove[]; minX: number; maxX: number }>();

  // Initialiser
  for (const phase of PHASE_ORDER) {
    elementMovesByPhase.set(phase, { moves: [], minX: Infinity, maxX: 0 });
  }

  // Classifier les element moves par phase
  for (const move of result.elementMoves) {
    const element = elements.find(e => e.id === move.id);
    if (!element) continue;

    const phase = ELEMENT_TO_PHASE[element.elementType];
    const phaseData = elementMovesByPhase.get(phase);
    if (phaseData) {
      const size = {
        width: element.width ?? DEFAULT_ELEMENT_SIZES[element.elementType].width,
      };
      phaseData.moves.push(move);
      phaseData.minX = Math.min(phaseData.minX, move.x);
      phaseData.maxX = Math.max(phaseData.maxX, move.x + size.width);
    }
  }

  // Ajouter les child boards à execution
  const executionData = elementMovesByPhase.get('execution')!;
  for (const move of result.childBoardMoves) {
    const cb = childBoards.find(c => c.id === move.id);
    if (!cb) continue;

    executionData.moves.push({ id: move.id, x: move.x, y: move.y });
    executionData.minX = Math.min(executionData.minX, move.x);
    executionData.maxX = Math.max(executionData.maxX, move.x + cb.width);
  }

  // Construire les bounds avec padding
  const padding = opts.spacing;

  for (const phase of PHASE_ORDER) {
    const phaseData = elementMovesByPhase.get(phase)!;
    const count = phase === 'execution' ? result.childBoardMoves.length : phaseData.moves.length;

    if (count === 0) continue;

    bounds.push({
      phase,
      x: phaseData.minX - padding,
      width: (phaseData.maxX - phaseData.minX) + padding * 2,
      elementCount: count,
    });
  }

  return bounds;
}

// ============================================
// ALIASES DEPRECATED (pour compatibilité)
// ============================================

/** @deprecated Use childBoardMoves instead */
export type ZoneMove = ChildBoardMove;
