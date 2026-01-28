// src/features/boards/infrastructure/elementsRepository.ts
// UPDATED: UB-3 - Unified Boards Architecture (ADR-032) - Removed zoneId

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  BoardElement,
  BoardElementRow,
  CreateElementInput,
  UpdateElementInput,
  MoveElementInput,
} from '../domain/types';

import { mapElementFromRow } from '../domain/types';

// ============================================
// GET ELEMENTS BY BOARD
// ============================================

export async function getElementsByBoard(boardId: string): Promise<BoardElement[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('board_elements')
    .select('*')
    .eq('board_id', boardId)
    .order('z_index', { ascending: true });

  if (error) {
    console.error('getElementsByBoard error:', error);
    throw error;
  }

  return (data || []).map((row) => mapElementFromRow(row as unknown as BoardElementRow));
}

// ============================================
// GET ELEMENT BY ID
// ============================================

export async function getElementById(elementId: string): Promise<BoardElement | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('board_elements')
    .select('*')
    .eq('id', elementId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('getElementById error:', error);
    throw error;
  }

  return mapElementFromRow(data as unknown as BoardElementRow);
}

// ============================================
// ADD ELEMENT
// UPDATED UB-3: Removed zoneId
// ============================================

export async function addElement(input: CreateElementInput): Promise<BoardElement> {
  const supabase = createAdminClient();

  // Get max z_index for this board
  const { data: maxZData } = await supabase
    .from('board_elements')
    .select('z_index')
    .eq('board_id', input.boardId)
    .order('z_index', { ascending: false })
    .limit(1)
    .single();

  const nextZIndex = (maxZData?.z_index ?? -1) + 1;

  const { data, error } = await supabase
    .from('board_elements')
    .insert({
      board_id: input.boardId,
      // REMOVED UB-3: zone_id: input.zoneId || null,
      element_type: input.elementType,
      element_data: JSON.parse(JSON.stringify(input.elementData)),
      position_x: input.positionX ?? 100,
      position_y: input.positionY ?? 100,
      width: input.width || null,
      height: input.height || null,
      z_index: input.zIndex ?? nextZIndex,
    })
    .select()
    .single();

  if (error) {
    console.error('addElement error:', error);
    throw error;
  }

  return mapElementFromRow(data as unknown as BoardElementRow);
}

// ============================================
// UPDATE ELEMENT
// UPDATED UB-3: Removed zoneId
// ============================================

export async function updateElement(
  elementId: string,
  input: UpdateElementInput
): Promise<BoardElement | null> {
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {};

  // REMOVED UB-3: if (input.zoneId !== undefined) updateData.zone_id = input.zoneId;
  if (input.elementData !== undefined) updateData.element_data = input.elementData as unknown as Record<string, unknown>;
  if (input.positionX !== undefined) updateData.position_x = input.positionX;
  if (input.positionY !== undefined) updateData.position_y = input.positionY;
  if (input.width !== undefined) updateData.width = input.width;
  if (input.height !== undefined) updateData.height = input.height;
  if (input.zIndex !== undefined) updateData.z_index = input.zIndex;

  const { data, error } = await supabase
    .from('board_elements')
    .update(updateData)
    .eq('id', elementId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('updateElement error:', error);
    throw error;
  }

  return mapElementFromRow(data as unknown as BoardElementRow);
}

// ============================================
// NEW UB-3: MOVE ELEMENT TO ANOTHER BOARD
// (replaces assignElementToZone)
// ============================================

export async function moveElementToBoard(
  elementId: string,
  targetBoardId: string,
  newPosition?: { x: number; y: number }
): Promise<BoardElement | null> {
  const supabase = createAdminClient();

  // UB-5: Repositionner l'élément à des coordonnées visibles dans le nouveau board
  // Si pas de position spécifiée, utiliser une position aléatoire dans la zone visible
  const positionX = newPosition?.x ?? 100 + Math.random() * 200;
  const positionY = newPosition?.y ?? 100 + Math.random() * 200;

  const { data, error } = await supabase
    .from('board_elements')
    .update({ 
      board_id: targetBoardId,
      position_x: positionX,
      position_y: positionY,
    })
    .eq('id', elementId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('moveElementToBoard error:', error);
    throw error;
  }

  return mapElementFromRow(data as unknown as BoardElementRow);
}

// ============================================
// MOVE ELEMENT (position)
// ============================================

export async function moveElement(
  elementId: string,
  input: MoveElementInput
): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('board_elements')
    .update({
      position_x: input.positionX,
      position_y: input.positionY,
    })
    .eq('id', elementId);

  if (error) {
    console.error('moveElement error:', error);
    throw error;
  }

  return true;
}

// ============================================
// REMOVE ELEMENT
// ============================================

export async function removeElement(elementId: string): Promise<string | null> {
  const supabase = createAdminClient();

  // Get board_id before deletion for revalidation
  const { data: element } = await supabase
    .from('board_elements')
    .select('board_id')
    .eq('id', elementId)
    .single();

  const boardId = element?.board_id || null;

  const { error } = await supabase
    .from('board_elements')
    .delete()
    .eq('id', elementId);

  if (error) {
    console.error('removeElement error:', error);
    throw error;
  }

  return boardId;
}

// ============================================
// BULK MOVE ELEMENTS
// ============================================

export async function bulkMoveElements(
  moves: Array<{ elementId: string; positionX: number; positionY: number }>
): Promise<boolean> {
  const supabase = createAdminClient();

  // Execute all moves in parallel
  const promises = moves.map((move) =>
    supabase
      .from('board_elements')
      .update({
        position_x: move.positionX,
        position_y: move.positionY,
      })
      .eq('id', move.elementId)
  );

  const results = await Promise.all(promises);

  const hasError = results.some((r) => r.error);
  if (hasError) {
    console.error('bulkMoveElements errors:', results.filter((r) => r.error));
    throw new Error('Some elements failed to move');
  }

  return true;
}

// ============================================
// BRING TO FRONT
// ============================================

export async function bringToFront(elementId: string, boardId: string): Promise<boolean> {
  const supabase = createAdminClient();

  // Get max z_index
  const { data: maxZData } = await supabase
    .from('board_elements')
    .select('z_index')
    .eq('board_id', boardId)
    .order('z_index', { ascending: false })
    .limit(1)
    .single();

  const newZIndex = (maxZData?.z_index ?? 0) + 1;

  const { error } = await supabase
    .from('board_elements')
    .update({ z_index: newZIndex })
    .eq('id', elementId);

  if (error) {
    console.error('bringToFront error:', error);
    throw error;
  }

  return true;
}

// ============================================
// EXPORT AS OBJECT
// ============================================

export const elementsRepository = {
  getElementsByBoard,
  getElementById,
  addElement,
  updateElement,
  moveElementToBoard,  // NEW UB-3
  moveElement,
  removeElement,
  bulkMoveElements,
  bringToFront,
};
