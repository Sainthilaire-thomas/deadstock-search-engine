// src/features/boards/actions/boardActions.ts

'use server';

import { revalidatePath } from 'next/cache';
import { boardsRepository } from '../infrastructure/boardsRepository';
import { getOrCreateSessionId } from '@/features/favorites/utils/sessionManager';
import type {
  Board,
  BoardWithDetails,
  CreateBoardInput,
  UpdateBoardInput,
  ActionResult,
} from '../domain/types';

// ============================================
// LIST BOARDS
// ============================================

export async function listBoardsAction(): Promise<ActionResult<Board[]>> {
  try {
    const sessionId = await getOrCreateSessionId();
    const boards = await boardsRepository.listBoards(sessionId);
    return { success: true, data: boards };
  } catch (error) {
    console.error('listBoardsAction error:', error);
    return { success: false, error: 'Impossible de charger les boards' };
  }
}

// ============================================
// GET BOARD
// ============================================

export async function getBoardAction(
  boardId: string
): Promise<ActionResult<BoardWithDetails>> {
  try {
    const sessionId = await getOrCreateSessionId();
    const board = await boardsRepository.getBoard(boardId, sessionId);
    
    if (!board) {
      return { success: false, error: 'Board introuvable' };
    }
    
    return { success: true, data: board };
  } catch (error) {
    console.error('getBoardAction error:', error);
    return { success: false, error: 'Impossible de charger le board' };
  }
}

// ============================================
// CREATE BOARD
// ============================================

export async function createBoardAction(
  input: CreateBoardInput = {}
): Promise<ActionResult<Board>> {
  try {
    const sessionId = await getOrCreateSessionId();
    const board = await boardsRepository.createBoard(input, sessionId);
    
    revalidatePath('/boards');
    
    return { success: true, data: board };
  } catch (error) {
    console.error('createBoardAction error:', error);
    return { success: false, error: 'Impossible de créer le board' };
  }
}

// ============================================
// UPDATE BOARD
// ============================================

export async function updateBoardAction(
  boardId: string,
  input: UpdateBoardInput
): Promise<ActionResult<Board>> {
  try {
    const sessionId = await getOrCreateSessionId();
    const board = await boardsRepository.updateBoard(boardId, input, sessionId);
    
    if (!board) {
      return { success: false, error: 'Board introuvable' };
    }
    
    revalidatePath('/boards');
    revalidatePath(`/boards/${boardId}`);
    
    return { success: true, data: board };
  } catch (error) {
    console.error('updateBoardAction error:', error);
    return { success: false, error: 'Impossible de mettre à jour le board' };
  }
}

// ============================================
// DELETE BOARD
// ============================================

export async function deleteBoardAction(
  boardId: string
): Promise<ActionResult<void>> {
  try {
    const sessionId = await getOrCreateSessionId();
    await boardsRepository.deleteBoard(boardId, sessionId);
    
    revalidatePath('/boards');
    
    return { success: true };
  } catch (error) {
    console.error('deleteBoardAction error:', error);
    return { success: false, error: 'Impossible de supprimer le board' };
  }
}

// ============================================
// ARCHIVE BOARD
// ============================================

export async function archiveBoardAction(
  boardId: string
): Promise<ActionResult<Board>> {
  return updateBoardAction(boardId, { status: 'archived' });
}

// ============================================
// GET BOARDS COUNT
// ============================================

export async function getBoardsCountAction(): Promise<ActionResult<number>> {
  try {
    const sessionId = await getOrCreateSessionId();
    const count = await boardsRepository.getBoardsCount(sessionId);
    return { success: true, data: count };
  } catch (error) {
    console.error('getBoardsCountAction error:', error);
    return { success: false, error: 'Impossible de compter les boards' };
  }
}
