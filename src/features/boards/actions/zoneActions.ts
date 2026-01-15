// src/features/boards/actions/zoneActions.ts

'use server';

import { revalidatePath } from 'next/cache';
import { zonesRepository } from '../infrastructure/zonesRepository';
import { boardsRepository } from '../infrastructure/boardsRepository';
import { requireUserId } from '@/lib/auth/getAuthUser';
import type {
  BoardZone,
  CreateZoneInput,
  UpdateZoneInput,
  ActionResult,
} from '../domain/types';

// ============================================
// CREATE ZONE
// ============================================

export async function createZoneAction(
  input: CreateZoneInput
): Promise<ActionResult<BoardZone>> {
  try {
    // Verify board ownership
    const userId = await requireUserId();
    const board = await boardsRepository.getBoard(input.boardId, userId);

    if (!board) {
      return { success: false, error: 'Board introuvable' };
    }

    const zone = await zonesRepository.createZone(input);

    revalidatePath(`/boards/${input.boardId}`);

    return { success: true, data: zone };
  } catch (error) {
    console.error('createZoneAction error:', error);
    return { success: false, error: 'Impossible de créer la zone' };
  }
}

// ============================================
// UPDATE ZONE
// ============================================

export async function updateZoneAction(
  zoneId: string,
  input: UpdateZoneInput
): Promise<ActionResult<BoardZone>> {
  try {
    const zone = await zonesRepository.updateZone(zoneId, input);

    if (!zone) {
      return { success: false, error: 'Zone introuvable' };
    }

    revalidatePath(`/boards/${zone.boardId}`);

    return { success: true, data: zone };
  } catch (error) {
    console.error('updateZoneAction error:', error);
    return { success: false, error: 'Impossible de mettre à jour la zone' };
  }
}

// ============================================
// MOVE ZONE
// ============================================

export async function moveZoneAction(
  zoneId: string,
  positionX: number,
  positionY: number
): Promise<ActionResult<void>> {
  try {
    await zonesRepository.moveZone(zoneId, positionX, positionY);
    return { success: true };
  } catch (error) {
    console.error('moveZoneAction error:', error);
    return { success: false, error: 'Impossible de déplacer la zone' };
  }
}

// ============================================
// RESIZE ZONE
// ============================================

export async function resizeZoneAction(
  zoneId: string,
  width: number,
  height: number
): Promise<ActionResult<void>> {
  try {
    await zonesRepository.resizeZone(zoneId, width, height);
    return { success: true };
  } catch (error) {
    console.error('resizeZoneAction error:', error);
    return { success: false, error: 'Impossible de redimensionner la zone' };
  }
}

// ============================================
// DELETE ZONE
// ============================================

export async function deleteZoneAction(
  zoneId: string
): Promise<ActionResult<void>> {
  try {
    const boardId = await zonesRepository.deleteZone(zoneId);

    if (boardId) {
      revalidatePath(`/boards/${boardId}`);
    }

    return { success: true };
  } catch (error) {
    console.error('deleteZoneAction error:', error);
    return { success: false, error: 'Impossible de supprimer la zone' };
  }
}

// ============================================
// QUICK CREATE ZONE
// ============================================

const ZONE_COLORS = [
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#06B6D4', // Cyan
];

export async function addZoneToBoard(
  boardId: string,
  name: string = 'Nouvelle zone',
  position?: { x: number; y: number }
): Promise<ActionResult<BoardZone>> {
  // Pick a random color
  const color = ZONE_COLORS[Math.floor(Math.random() * ZONE_COLORS.length)];

  return createZoneAction({
    boardId,
    name,
    color,
    positionX: position?.x ?? 50,
    positionY: position?.y ?? 50,
    width: 300,
    height: 200,
  });
}
