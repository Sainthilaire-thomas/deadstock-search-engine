// src/features/boards/infrastructure/zonesRepository.ts

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  BoardZone,
  BoardZoneRow,
  CreateZoneInput,
  UpdateZoneInput,
} from '../domain/types';

import { mapZoneFromRow } from '../domain/types';

// ============================================
// GET ZONES BY BOARD
// ============================================

export async function getZonesByBoard(boardId: string): Promise<BoardZone[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('board_zones')
    .select('*')
    .eq('board_id', boardId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getZonesByBoard error:', error);
    throw error;
  }

  return (data || []).map((row) => mapZoneFromRow(row as unknown as BoardZoneRow));
}

// ============================================
// GET ZONE BY ID
// ============================================

export async function getZoneById(zoneId: string): Promise<BoardZone | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('board_zones')
    .select('*')
    .eq('id', zoneId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('getZoneById error:', error);
    throw error;
  }

  return mapZoneFromRow(data as unknown as BoardZoneRow);
}

// ============================================
// CREATE ZONE
// ============================================

export async function createZone(input: CreateZoneInput): Promise<BoardZone> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('board_zones')
    .insert({
      board_id: input.boardId,
      name: input.name,
      color: input.color || '#6366F1', // Indigo par défaut
      position_x: input.positionX ?? 50,
      position_y: input.positionY ?? 50,
      width: input.width ?? 300,
      height: input.height ?? 200,
    })
    .select()
    .single();

  if (error) {
    console.error('createZone error:', error);
    throw error;
  }

  return mapZoneFromRow(data as unknown as BoardZoneRow);
}

// ============================================
// UPDATE ZONE
// ============================================

export async function updateZone(
  zoneId: string,
  input: UpdateZoneInput
): Promise<BoardZone | null> {
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.color !== undefined) updateData.color = input.color;
  if (input.positionX !== undefined) updateData.position_x = input.positionX;
  if (input.positionY !== undefined) updateData.position_y = input.positionY;
  if (input.width !== undefined) updateData.width = input.width;
  if (input.height !== undefined) updateData.height = input.height;

  const { data, error } = await supabase
    .from('board_zones')
    .update(updateData)
    .eq('id', zoneId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('updateZone error:', error);
    throw error;
  }

  return mapZoneFromRow(data as unknown as BoardZoneRow);
}

// ============================================
// MOVE ZONE
// ============================================

export async function moveZone(
  zoneId: string,
  positionX: number,
  positionY: number
): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('board_zones')
    .update({
      position_x: positionX,
      position_y: positionY,
    })
    .eq('id', zoneId);

  if (error) {
    console.error('moveZone error:', error);
    throw error;
  }

  return true;
}

// ============================================
// RESIZE ZONE
// ============================================

export async function resizeZone(
  zoneId: string,
  width: number,
  height: number
): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('board_zones')
    .update({
      width,
      height,
    })
    .eq('id', zoneId);

  if (error) {
    console.error('resizeZone error:', error);
    throw error;
  }

  return true;
}

// ============================================
// DELETE ZONE
// ============================================

export async function deleteZone(zoneId: string): Promise<string | null> {
  const supabase = createAdminClient();

  // Get board_id before deletion for revalidation
  const { data: zone } = await supabase
    .from('board_zones')
    .select('board_id')
    .eq('id', zoneId)
    .single();

  const boardId = zone?.board_id || null;

  const { error } = await supabase
    .from('board_zones')
    .delete()
    .eq('id', zoneId);

  if (error) {
    console.error('deleteZone error:', error);
    throw error;
  }

  return boardId;
}

// ============================================
// CRYSTALLIZE ZONE
// ============================================

export async function crystallizeZone(
  zoneId: string,
  projectId: string
): Promise<BoardZone | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('board_zones')
    .update({
      crystallized_at: new Date().toISOString(),
      linked_project_id: projectId,
    })
    .eq('id', zoneId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('crystallizeZone error:', error);
    throw error;
  }

  return mapZoneFromRow(data as unknown as BoardZoneRow);
}

// ============================================
// GET CRYSTALLIZED ZONES BY BOARD
// ============================================

export async function getCrystallizedZonesByBoard(boardId: string): Promise<BoardZone[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('board_zones')
    .select('*')
    .eq('board_id', boardId)
    .not('crystallized_at', 'is', null)
    .order('crystallized_at', { ascending: false });

  if (error) {
    console.error('getCrystallizedZonesByBoard error:', error);
    throw error;
  }

  return (data || []).map((row) => mapZoneFromRow(row as unknown as BoardZoneRow));
}

// ============================================
// GET ACTIVE ZONES BY BOARD
// ============================================

export async function getActiveZonesByBoard(boardId: string): Promise<BoardZone[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('board_zones')
    .select('*')
    .eq('board_id', boardId)
    .is('crystallized_at', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getActiveZonesByBoard error:', error);
    throw error;
  }

  return (data || []).map((row) => mapZoneFromRow(row as unknown as BoardZoneRow));
}

// ============================================
// EXPORT AS OBJECT
// ============================================

export const zonesRepository = {
  getZonesByBoard,
  getZoneById,
  createZone,
  updateZone,
  moveZone,
  resizeZone,
  deleteZone,
  // Crystallization
  crystallizeZone,
  getCrystallizedZonesByBoard,
  getActiveZonesByBoard,
};
