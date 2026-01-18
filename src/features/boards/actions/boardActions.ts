// src/features/boards/actions/boardActions.ts

'use server';

import { revalidatePath } from 'next/cache';
import { boardsRepository } from '../infrastructure/boardsRepository';
import { requireUserId } from '@/lib/auth/getAuthUser';
import type {
  Board,
  BoardWithDetails,
  BoardWithPreview,  // ← AJOUTER
  CreateBoardInput,
  UpdateBoardInput,
  ActionResult,
} from '../domain/types';

// ============================================
// LIST BOARDS
// ============================================

export async function listBoardsAction(): Promise<ActionResult<Board[]>> {
  try {
    const userId = await requireUserId();
    const boards = await boardsRepository.listBoards(userId);
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
    const userId = await requireUserId();
    const board = await boardsRepository.getBoard(boardId, userId);
    
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
    const userId = await requireUserId();
    const board = await boardsRepository.createBoard(input, userId);
    
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
    const userId = await requireUserId();
    const board = await boardsRepository.updateBoard(boardId, input, userId);
    
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
    const userId = await requireUserId();
    await boardsRepository.deleteBoard(boardId, userId);
    
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
    const userId = await requireUserId();
    const count = await boardsRepository.getBoardsCount(userId);
    return { success: true, data: count };
  } catch (error) {
    console.error('getBoardsCountAction error:', error);
    return { success: false, error: 'Impossible de compter les boards' };
  }
}

// ============================================
// LIST BOARDS WITH PREVIEW
// ============================================

export async function listBoardsWithPreviewAction(): Promise<ActionResult<BoardWithPreview[]>> {
  try {
    const userId = await requireUserId();
    const boards = await boardsRepository.listBoardsWithPreview(userId);
    return { success: true, data: boards };
  } catch (error) {
    console.error('listBoardsWithPreviewAction error:', error);
    return { success: false, error: 'Impossible de charger les boards' };
  }
}

// ============================================
// UPDATE BOARD COVER IMAGE
// ============================================

export async function updateBoardCoverImageAction(
  boardId: string,
  coverImageUrl: string | null
): Promise<ActionResult<Board>> {
  try {
    const userId = await requireUserId();
    const board = await boardsRepository.updateBoardCoverImage(boardId, coverImageUrl, userId);

    if (!board) {
      return { success: false, error: 'Board introuvable' };
    }

    revalidatePath('/boards');
    revalidatePath(`/boards/${boardId}`);

    return { success: true, data: board };
  } catch (error) {
    console.error('updateBoardCoverImageAction error:', error);
    return { success: false, error: 'Impossible de mettre à jour la couverture' };
  }
}