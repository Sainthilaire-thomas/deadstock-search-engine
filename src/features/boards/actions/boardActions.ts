// src/features/boards/actions/boardActions.ts
// UPDATED: UB-4 - Unified Boards Architecture (ADR-032)
// Added child board actions (replaces zone actions)

'use server';

import { revalidatePath } from 'next/cache';
import { boardsRepository } from '../infrastructure/boardsRepository';
import { requireUserId } from '@/lib/auth/getAuthUser';
import type {
  Board,
  BoardWithDetails,
  BoardWithPreview,
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
// LIST ROOT BOARDS
// ============================================

export async function listRootBoardsAction(): Promise<ActionResult<Board[]>> {
  try {
    const userId = await requireUserId();
    const boards = await boardsRepository.listRootBoards(userId);
    return { success: true, data: boards };
  } catch (error) {
    console.error('listRootBoardsAction error:', error);
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
// NEW UB-4: CREATE CHILD BOARD (replaces createZone)
// ============================================

export async function createChildBoardAction(
  parentBoardId: string,
  input: {
    name?: string;
    positionX?: number;
    positionY?: number;
    width?: number;
    height?: number;
    color?: string;
    boardType?: 'piece' | 'category';
  }
): Promise<ActionResult<Board>> {
  try {
    const userId = await requireUserId();
    const childBoard = await boardsRepository.createChildBoard(parentBoardId, input, userId);

    revalidatePath(`/boards/${parentBoardId}`);

    return { success: true, data: childBoard };
  } catch (error) {
    console.error('createChildBoardAction error:', error);
    return { success: false, error: 'Impossible de créer la pièce' };
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
// NEW UB-4: MOVE CHILD BOARD (replaces moveZone)
// ============================================

export async function moveChildBoardAction(
  boardId: string,
  positionX: number,
  positionY: number
): Promise<ActionResult<void>> {
  try {
    await boardsRepository.moveChildBoard(boardId, positionX, positionY);
    return { success: true };
  } catch (error) {
    console.error('moveChildBoardAction error:', error);
    return { success: false, error: 'Impossible de déplacer la pièce' };
  }
}

// ============================================
// NEW UB-4: RESIZE CHILD BOARD (replaces resizeZone)
// ============================================

export async function resizeChildBoardAction(
  boardId: string,
  width: number,
  height: number
): Promise<ActionResult<void>> {
  try {
    await boardsRepository.resizeChildBoard(boardId, width, height);
    return { success: true };
  } catch (error) {
    console.error('resizeChildBoardAction error:', error);
    return { success: false, error: 'Impossible de redimensionner la pièce' };
  }
}

// ============================================
// NEW UB-4: CRYSTALLIZE BOARD (replaces crystallizeZone)
// ============================================

export async function crystallizeBoardAction(
  boardId: string,
  projectId: string
): Promise<ActionResult<Board>> {
  try {
    const board = await boardsRepository.crystallizeBoard(boardId, projectId);

    if (!board) {
      return { success: false, error: 'Board introuvable' };
    }

    revalidatePath(`/boards/${boardId}`);
    if (board.parentBoardId) {
      revalidatePath(`/boards/${board.parentBoardId}`);
    }

    return { success: true, data: board };
  } catch (error) {
    console.error('crystallizeBoardAction error:', error);
    return { success: false, error: 'Impossible de cristalliser la pièce' };
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
// NEW UB-4: DELETE CHILD BOARD (replaces deleteZone)
// ============================================

export async function deleteChildBoardAction(
  boardId: string
): Promise<ActionResult<void>> {
  try {
    const userId = await requireUserId();
    
    // Get parent board ID before deletion for revalidation
    const board = await boardsRepository.getBoard(boardId, userId);
    const parentBoardId = board?.parentBoardId;
    
    await boardsRepository.deleteBoard(boardId, userId);

    if (parentBoardId) {
      revalidatePath(`/boards/${parentBoardId}`);
    }

    return { success: true };
  } catch (error) {
    console.error('deleteChildBoardAction error:', error);
    return { success: false, error: 'Impossible de supprimer la pièce' };
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
// GET ROOT BOARDS COUNT
// ============================================

export async function getRootBoardsCountAction(): Promise<ActionResult<number>> {
  try {
    const userId = await requireUserId();
    const count = await boardsRepository.getRootBoardsCount(userId);
    return { success: true, data: count };
  } catch (error) {
    console.error('getRootBoardsCountAction error:', error);
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

// ============================================
// GET BOARD ANCESTORS (for breadcrumb)
// ============================================

export async function getBoardAncestorsAction(
  boardId: string
): Promise<ActionResult<Board[]>> {
  try {
    const ancestors = await boardsRepository.getBoardAncestors(boardId);
    return { success: true, data: ancestors };
  } catch (error) {
    console.error('getBoardAncestorsAction error:', error);
    return { success: false, error: 'Impossible de charger les ancêtres' };
  }
}

// ============================================
// GET CHILD BOARDS
// ============================================

export async function getChildBoardsAction(
  parentBoardId: string
): Promise<ActionResult<Board[]>> {
  try {
    const childBoards = await boardsRepository.getChildBoards(parentBoardId);
    return { success: true, data: childBoards };
  } catch (error) {
    console.error('getChildBoardsAction error:', error);
    return { success: false, error: 'Impossible de charger les pièces' };
  }
}
