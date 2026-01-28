// src/features/boards/actions/zoneActions.ts
// DEPRECATED: UB-4 - Unified Boards Architecture (ADR-032)
// This file provides backward compatibility aliases
// All functions redirect to boardActions.ts - DO NOT ADD NEW CODE HERE

'use server';

import {
  createChildBoardAction,
  updateBoardAction,
  moveChildBoardAction,
  resizeChildBoardAction,
  deleteChildBoardAction,
} from './boardActions';
import type {
  Board,
  UpdateBoardInput,
  ActionResult,
} from '../domain/types';

// ============================================
// DEPRECATED ALIASES - Use boardActions instead
// ============================================

/**
 * @deprecated Use createChildBoardAction from boardActions instead
 */
export async function createZoneAction(
  input: { boardId: string; name?: string; color?: string; positionX?: number; positionY?: number; width?: number; height?: number }
): Promise<ActionResult<Board>> {
  return createChildBoardAction(input.boardId, {
    name: input.name,
    positionX: input.positionX,
    positionY: input.positionY,
    width: input.width,
    height: input.height,
    color: input.color,
  });
}

/**
 * @deprecated Use updateBoardAction from boardActions instead
 */
export async function updateZoneAction(
  zoneId: string,
  input: UpdateBoardInput
): Promise<ActionResult<Board>> {
  // Note: We need userId but don't have it here
  // This is a limitation of the deprecated API
  return updateBoardAction(zoneId, input);
}

/**
 * @deprecated Use moveChildBoardAction from boardActions instead
 */
export async function moveZoneAction(
  zoneId: string,
  positionX: number,
  positionY: number
): Promise<ActionResult<void>> {
  return moveChildBoardAction(zoneId, positionX, positionY);
}

/**
 * @deprecated Use resizeChildBoardAction from boardActions instead
 */
export async function resizeZoneAction(
  zoneId: string,
  width: number,
  height: number
): Promise<ActionResult<void>> {
  return resizeChildBoardAction(zoneId, width, height);
}

/**
 * @deprecated Use deleteChildBoardAction from boardActions instead
 */
export async function deleteZoneAction(
  zoneId: string
): Promise<ActionResult<void>> {
  return deleteChildBoardAction(zoneId);
}

/**
 * @deprecated Use createChildBoardAction from boardActions instead
 */
export async function addZoneToBoard(
  boardId: string,
  name: string = 'Nouvelle pièce',
  position?: { x: number; y: number }
): Promise<ActionResult<Board>> {
  return createChildBoardAction(boardId, {
    name,
    positionX: position?.x ?? 50,
    positionY: position?.y ?? 50,
  });
}

/**
 * @deprecated This function is no longer needed - child boards are boards
 */
export async function createLinkedBoardAction(
  _zoneId: string,
  _parentBoardId: string,
  _name: string
): Promise<ActionResult<Board>> {
  // In unified architecture, child boards ARE boards
  // This function is no longer meaningful
  return { success: false, error: 'Cette fonction est obsolète. Les pièces sont maintenant des boards.' };
}
