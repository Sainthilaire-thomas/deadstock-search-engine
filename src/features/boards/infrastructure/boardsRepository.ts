// src/features/boards/infrastructure/boardsRepository.ts

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Board,
  BoardWithDetails,
  BoardRow,
  BoardElementRow,
  BoardZoneRow,
  CreateBoardInput,
  UpdateBoardInput,
} from '../domain/types';

import {
  mapBoardFromRow,
  mapElementFromRow,
  mapZoneFromRow,
} from '../domain/types';

// ============================================
// LIST BOARDS
// ============================================

export async function listBoards(userId: string): Promise<Board[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('listBoards error:', error);
    throw error;
  }

  return (data || []).map((row) => mapBoardFromRow(row as BoardRow));
}

// ============================================
// GET BOARD WITH DETAILS
// ============================================

export async function getBoard(
  boardId: string,
  userId: string
): Promise<BoardWithDetails | null> {
  const supabase = createAdminClient();

  // Get board
  const { data: boardData, error: boardError } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .eq('user_id', userId)
    .single();

  if (boardError || !boardData) {
    if (boardError?.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('getBoard error:', boardError);
    throw boardError;
  }

  // Get elements
  const { data: elementsData, error: elementsError } = await supabase
    .from('board_elements')
    .select('*')
    .eq('board_id', boardId)
    .order('z_index', { ascending: true });

  if (elementsError) {
    console.error('getBoard elements error:', elementsError);
    throw elementsError;
  }

 // Get zones
  const { data: zonesData, error: zonesError } = await supabase
    .from('board_zones')
    .select('*')
    .eq('board_id', boardId)
    .order('created_at', { ascending: true });

  if (zonesError) {
    console.error('getBoard zones error:', zonesError);
    throw zonesError;
  }

  // Get project statuses for crystallized zones
  const linkedProjectIds = (zonesData || [])
    .map((z) => z.linked_project_id)
    .filter((id): id is string => id !== null);

  let projectStatusMap: Record<string, string> = {};

  if (linkedProjectIds.length > 0) {
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id, status')
      .in('id', linkedProjectIds);

    if (projectsError) {
      console.error('getBoard projects error:', projectsError);
      // Non-blocking: continue without project statuses
    } else if (projectsData) {
      projectStatusMap = Object.fromEntries(
        projectsData.map((p) => [p.id, p.status])
      );
    }
  }

  const board = mapBoardFromRow(boardData as BoardRow);
  const elements = (elementsData || []).map((row) => mapElementFromRow(row as BoardElementRow));
  
  // Map zones with project status
  const zones = (zonesData || []).map((row) => {
    const zoneRow = row as BoardZoneRow;
    // Inject project status into the row before mapping
    if (zoneRow.linked_project_id && projectStatusMap[zoneRow.linked_project_id]) {
      zoneRow.linked_project_status = projectStatusMap[zoneRow.linked_project_id];
    }
    return mapZoneFromRow(zoneRow);
  });

  return {
    ...board,
    elements,
    zones,
    elementCount: elements.length,
  };
}

// ============================================
// CREATE BOARD
// ============================================

export async function createBoard(
  input: CreateBoardInput,
  userId: string
): Promise<Board> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('boards')
    .insert({
      user_id: userId,
      name: input.name || null,
      description: input.description || null,
      status: input.status || 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('createBoard error:', error);
    throw error;
  }

  return mapBoardFromRow(data as BoardRow);
}

// ============================================
// UPDATE BOARD
// ============================================

export async function updateBoard(
  boardId: string,
  input: UpdateBoardInput,
  userId: string
): Promise<Board | null> {
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.status !== undefined) updateData.status = input.status;

  const { data, error } = await supabase
    .from('boards')
    .update(updateData)
    .eq('id', boardId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('updateBoard error:', error);
    throw error;
  }

  return mapBoardFromRow(data as BoardRow);
}

// ============================================
// DELETE BOARD
// ============================================

export async function deleteBoard(
  boardId: string,
  userId: string
): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId)
    .eq('user_id', userId);

  if (error) {
    console.error('deleteBoard error:', error);
    throw error;
  }

  return true;
}

// ============================================
// GET BOARDS COUNT
// ============================================

export async function getBoardsCount(userId: string): Promise<number> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from('boards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('status', 'archived');

  if (error) {
    console.error('getBoardsCount error:', error);
    throw error;
  }

  return count || 0;
}

// ============================================
// EXPORT AS OBJECT
// ============================================

export const boardsRepository = {
  listBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  getBoardsCount,
};
