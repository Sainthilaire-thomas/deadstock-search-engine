// src/features/boards/utils/boardUtils.ts
// Utilitaires pour les boards unifiés (remplace zoneUtils.ts)

import type { Board, BoardElement } from '../domain/types';

/**
 * Détermine si un élément est visuellement "dans" un child board
 * Critère : le centre de l'élément est dans les limites du child board sur le canvas
 */
export function isElementInChildBoard(element: BoardElement, childBoard: Board): boolean {
  // Un child board doit avoir des coordonnées (les root boards n'en ont pas)
  if (childBoard.positionX === null || childBoard.positionY === null) {
    return false;
  }
  
  const elementCenterX = element.positionX + (element.width || 100) / 2;
  const elementCenterY = element.positionY + (element.height || 80) / 2;
  
  return (
    elementCenterX >= childBoard.positionX &&
    elementCenterX <= childBoard.positionX + childBoard.width &&
    elementCenterY >= childBoard.positionY &&
    elementCenterY <= childBoard.positionY + childBoard.height
  );
}

/**
 * Retourne tous les éléments visuellement contenus dans un child board
 * Note: Ceci est basé sur la position visuelle, pas sur l'appartenance DB
 */
export function getElementsVisuallyInChildBoard(
  elements: BoardElement[],
  childBoard: Board
): BoardElement[] {
  return elements.filter(element => isElementInChildBoard(element, childBoard));
}

/**
 * Vérifie si un board est cristallisé ET en mode brouillon (pas encore commandé)
 */
export function isBoardDraft(board: Board): boolean {
  return board.crystallizedAt !== null && board.linkedProjectId !== null;
}

/**
 * Retourne les child boards actifs (non archivés)
 */
export function getActiveChildBoards(childBoards: Board[]): Board[] {
  return childBoards.filter(cb => cb.status !== 'archived' && cb.status !== 'cancelled');
}

/**
 * Retourne les child boards cristallisés
 */
export function getCrystallizedChildBoards(childBoards: Board[]): Board[] {
  return childBoards.filter(cb => cb.crystallizedAt !== null);
}

/**
 * Génère une couleur aléatoire pour un nouveau child board
 */
export function getRandomBoardColor(): string {
  const colors = [
    '#6366F1', // Indigo (défaut)
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#F43F5E', // Rose
    '#EF4444', // Red
    '#F97316', // Orange
    '#EAB308', // Yellow
    '#22C55E', // Green
    '#14B8A6', // Teal
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Calcule la prochaine position pour un nouveau child board
 * Évite les chevauchements avec les child boards existants
 */
export function getNextChildBoardPosition(
  existingChildBoards: Board[],
  startX: number = 100,
  startY: number = 100,
  defaultWidth: number = 280,
  defaultHeight: number = 140,
  spacing: number = 20
): { x: number; y: number } {
  if (existingChildBoards.length === 0) {
    return { x: startX, y: startY };
  }

  // Trouve le child board le plus à droite
  let maxRight = startX;
  let yAtMaxRight = startY;
  
  for (const cb of existingChildBoards) {
    if (cb.positionX !== null) {
      const right = cb.positionX + cb.width;
      if (right > maxRight) {
        maxRight = right;
        yAtMaxRight = cb.positionY ?? startY;
      }
    }
  }

  return {
    x: maxRight + spacing,
    y: yAtMaxRight,
  };
}

/**
 * Filtre les child boards qui sont des "pièces" (pas des catégories)
 * Une pièce est un board dont le nom ne commence pas par "."
 */
export function getPieceBoards(childBoards: Board[]): Board[] {
  return childBoards.filter(cb => cb.name && !cb.name.startsWith('.'));
}

/**
 * Filtre les child boards qui sont des "catégories"
 * Une catégorie est un board dont le nom commence par "."
 */
export function getCategoryBoards(childBoards: Board[]): Board[] {
  return childBoards.filter(cb => cb.name && cb.name.startsWith('.'));
}

// ============================================
// ALIASES DEPRECATED (pour migration progressive)
// ============================================

/** @deprecated Use isElementInChildBoard instead */
export const isElementInZone = isElementInChildBoard;

/** @deprecated Use getElementsVisuallyInChildBoard instead */
export const getElementsInZone = getElementsVisuallyInChildBoard;

/** @deprecated Use isBoardDraft instead */
export const isZoneDraft = (board: Board) => isBoardDraft(board);
