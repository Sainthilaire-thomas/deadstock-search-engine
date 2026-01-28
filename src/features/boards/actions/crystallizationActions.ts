// src/features/boards/actions/crystallizationActions.ts
// UPDATED: UB-4 - Unified Boards Architecture (ADR-032)
// BoardZone → Board

'use server';

import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/lib/auth/getAuthUser';
import { boardsRepository } from '../infrastructure/boardsRepository';
import { elementsRepository } from '../infrastructure/elementsRepository';
import { createProject as createProjectInDb } from '@/features/journey/infrastructure/projectsRepository';
import type { Board } from '../domain/types';
import type { ActionResult } from '../domain/types';
import type { ProjectType } from '@/features/journey/domain/types';

// ============================================
// TYPES
// ============================================

export interface CrystallizeBoardInput {
  boardId: string;           // The child board to crystallize (was zoneId)
  parentBoardId: string;     // The parent board (was boardId)
  projectName: string;
  projectType: ProjectType;
  client?: string;
  deadline?: string;
  budgetMin?: number;
  budgetMax?: number;
}

export interface CrystallizeBoardResult {
  projectId: string;
  board: Board;              // Was zone
}

// DEPRECATED ALIAS
export type CrystallizeZoneInput = CrystallizeBoardInput;
export type CrystallizeZoneResult = CrystallizeBoardResult;

// ============================================
// CRYSTALLIZE BOARD ACTION (was crystallizeZoneAction)
// ============================================

export async function crystallizeBoardAction(
  input: CrystallizeBoardInput
): Promise<ActionResult<CrystallizeBoardResult>> {
  try {
    const userId = await requireUserId();

    // 1. Vérifier que le board existe et n'est pas déjà cristallisé
    const board = await boardsRepository.getBoard(input.boardId, userId);

    if (!board) {
      return { success: false, error: 'Pièce introuvable' };
    }

    if (board.crystallizedAt) {
      return { success: false, error: 'Cette pièce est déjà cristallisée' };
    }

    // 2. Récupérer les éléments du board (child board has its own elements now)
    const elements = await elementsRepository.getElementsByBoard(input.boardId);

    if (elements.length === 0) {
      return { success: false, error: 'La pièce ne contient aucun élément' };
    }

    // 3. Créer le projet avec les données extraites
    const project = await createProjectInDb({
      name: input.projectName,
      userId,
      projectType: input.projectType,
      description: `Créé depuis la pièce "${board.name}"`,
      sourceBoardId: input.parentBoardId,
      sourceZoneId: input.boardId,  // Keep for backward compat in projects table
    });

    // 4. Marquer le board comme cristallisé
    const updatedBoard = await boardsRepository.crystallizeBoard(input.boardId, project.id);

    if (!updatedBoard) {
      return { success: false, error: 'Erreur lors de la cristallisation' };
    }

    // 5. Revalidate paths
    revalidatePath(`/boards/${input.parentBoardId}`);
    revalidatePath(`/boards/${input.boardId}`);
    revalidatePath('/projects');

    return {
      success: true,
      data: {
        projectId: project.id,
        board: updatedBoard,
      },
    };
  } catch (error) {
    console.error('crystallizeBoardAction error:', error);
    return {
      success: false,
      error: 'Impossible de cristalliser la pièce'
    };
  }
}

// ============================================
// DEPRECATED ALIAS
// ============================================

/**
 * @deprecated Use crystallizeBoardAction instead
 */
export async function crystallizeZoneAction(
  input: CrystallizeZoneInput
): Promise<ActionResult<CrystallizeZoneResult>> {
  // Map old field names to new
  return crystallizeBoardAction({
    boardId: (input as unknown as { zoneId?: string }).zoneId || input.boardId,
    parentBoardId: input.parentBoardId,
    projectName: input.projectName,
    projectType: input.projectType,
    client: input.client,
    deadline: input.deadline,
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
  });
}
