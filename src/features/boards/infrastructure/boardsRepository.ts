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

export async function listBoards(sessionId: string): Promise<Board[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('session_id', sessionId)
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
  sessionId: string
): Promise<BoardWithDetails | null> {
  const supabase = createAdminClient();

  // Get board
  const { data: boardData, error: boardError } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .eq('session_id', sessionId)
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

  const board = mapBoardFromRow(boardData as BoardRow);
  const elements = (elementsData || []).map((row) => mapElementFromRow(row as BoardElementRow));
  const zones = (zonesData || []).map((row) => mapZoneFromRow(row as BoardZoneRow));

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
  sessionId: string
): Promise<Board> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('boards')
    .insert({
      session_id: sessionId,
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
  sessionId: string
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
    .eq('session_id', sessionId)
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
  sessionId: string
): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId)
    .eq('session_id', sessionId);

  if (error) {
    console.error('deleteBoard error:', error);
    throw error;
  }

  return true;
}

// ============================================
// GET BOARDS COUNT
// ============================================

export async function getBoardsCount(sessionId: string): Promise<number> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from('boards')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
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
