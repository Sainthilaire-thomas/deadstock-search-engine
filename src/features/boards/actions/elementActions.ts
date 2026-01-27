// src/features/boards/actions/elementActions.ts

'use server';

import { revalidatePath } from 'next/cache';
import { elementsRepository } from '../infrastructure/elementsRepository';
import { boardsRepository } from '../infrastructure/boardsRepository';
import { requireUserId } from '@/lib/auth/getAuthUser';
import type {
  BoardElement,
  CreateElementInput,
  UpdateElementInput,
  MoveElementInput,
  ActionResult,
} from '../domain/types';

// ============================================
// ADD ELEMENT
// ============================================

export async function addElementAction(
  input: CreateElementInput
): Promise<ActionResult<BoardElement>> {
  try {
    // Verify board ownership
    const userId = await requireUserId();
    const board = await boardsRepository.getBoard(input.boardId, userId);
    
    if (!board) {
      return { success: false, error: 'Board introuvable' };
    }

    const element = await elementsRepository.addElement(input);
    
    revalidatePath(`/boards/${input.boardId}`);
    
    return { success: true, data: element };
  } catch (error) {
    console.error('addElementAction error:', error);
    return { success: false, error: 'Impossible d\'ajouter l\'élément' };
  }
}

// ============================================
// UPDATE ELEMENT
// ============================================

export async function updateElementAction(
  elementId: string,
  input: UpdateElementInput
): Promise<ActionResult<BoardElement>> {
  try {
    const element = await elementsRepository.updateElement(elementId, input);
    
    if (!element) {
      return { success: false, error: 'Élément introuvable' };
    }
    
    revalidatePath(`/boards/${element.boardId}`);
    
    return { success: true, data: element };
  } catch (error) {
    console.error('updateElementAction error:', error);
    return { success: false, error: 'Impossible de mettre à jour l\'élément' };
  }
}

// ============================================
// MOVE ELEMENT
// ============================================

export async function moveElementAction(
  elementId: string,
  input: MoveElementInput
): Promise<ActionResult<void>> {
  try {
    await elementsRepository.moveElement(elementId, input);
    return { success: true };
  } catch (error) {
    console.error('moveElementAction error:', error);
    return { success: false, error: 'Impossible de déplacer l\'élément' };
  }
}

// ============================================
// REMOVE ELEMENT
// ============================================

export async function removeElementAction(
  elementId: string
): Promise<ActionResult<void>> {
  try {
    const boardId = await elementsRepository.removeElement(elementId);
    
    if (boardId) {
      revalidatePath(`/boards/${boardId}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('removeElementAction error:', error);
    return { success: false, error: 'Impossible de supprimer l\'élément' };
  }
}

// ============================================
// BULK MOVE ELEMENTS
// ============================================

export async function bulkMoveElementsAction(
  moves: Array<{ elementId: string; positionX: number; positionY: number }>
): Promise<ActionResult<void>> {
  try {
    await elementsRepository.bulkMoveElements(moves);
    return { success: true };
  } catch (error) {
    console.error('bulkMoveElementsAction error:', error);
    return { success: false, error: 'Impossible de déplacer les éléments' };
  }
}

// ============================================
// BRING TO FRONT
// ============================================

export async function bringToFrontAction(
  elementId: string,
  boardId: string
): Promise<ActionResult<void>> {
  try {
    await elementsRepository.bringToFront(elementId, boardId);
    revalidatePath(`/boards/${boardId}`);
    return { success: true };
  } catch (error) {
    console.error('bringToFrontAction error:', error);
    return { success: false, error: 'Impossible de mettre l\'élément au premier plan' };
  }
}

// ============================================
// ADD TEXTILE FROM FAVORITES
// ============================================

export async function addTextileToBoard(
  boardId: string,
  textile: {
    id: string;
    name: string;
    source: string;
    price: number | null;
    imageUrl: string | null;
    availableQuantity: number | null;
    material: string | null;
    color: string | null;
  },
  position?: { x: number; y: number }
): Promise<ActionResult<BoardElement>> {
  return addElementAction({
    boardId,
    elementType: 'textile',
    elementData: {
      textileId: textile.id,
      snapshot: {
        name: textile.name,
        source: textile.source,
        price: textile.price ?? 0,
        currency: 'EUR',
        imageUrl: textile.imageUrl,
        availableQuantity: textile.availableQuantity,
        material: textile.material,
        color: textile.color,
      },
    },
    positionX: position?.x ?? 100,
    positionY: position?.y ?? 100,
    width: 200,
    height: 150,
  });
}

// ============================================
// ADD NOTE
// ============================================

export async function addNoteToBoard(
  boardId: string,
  content: string = '',
  position?: { x: number; y: number }
): Promise<ActionResult<BoardElement>> {
  return addElementAction({
    boardId,
    elementType: 'note',
    elementData: {
      content,
      format: 'plain',
      color: '#FEF3C7', // Jaune pâle par défaut
    },
    positionX: position?.x ?? 100,
    positionY: position?.y ?? 100,
    width: 200,
    height: 150,
  });
}

// ============================================
// ADD PALETTE
// ============================================

export async function addPaletteToBoard(
  boardId: string,
  colors: string[],
  name?: string,
  position?: { x: number; y: number }
): Promise<ActionResult<BoardElement>> {
  return addElementAction({
    boardId,
    elementType: 'palette',
    elementData: {
      name: name || 'Nouvelle palette',
      colors,
      source: 'manual',
    },
    positionX: position?.x ?? 100,
    positionY: position?.y ?? 100,
    width: 200,
    height: 80,
  });
}

// ============================================
// ADD CALCULATION
// ============================================

export async function addCalculationToBoard(
  boardId: string,
  calculation: {
    summary: string;
    garmentType: string;
    size: string;
    variations?: Record<string, string>;
    result: {
      baseYardage: number;
      totalYardage: number;
      recommended: number;
    };
  },
  position?: { x: number; y: number }
): Promise<ActionResult<BoardElement>> {
  return addElementAction({
    boardId,
    elementType: 'calculation',
    elementData: calculation,
    positionX: position?.x ?? 100,
    positionY: position?.y ?? 100,
    width: 220,
    height: 120,
  });
}

// ============================================
// ASSIGN ELEMENT TO ZONE
// ============================================

/**
 * Assigne ou retire un élément d'une zone
 * @param elementId - ID de l'élément
 * @param zoneId - ID de la zone (null pour retirer de la zone)
 */
export async function assignElementToZoneAction(
  elementId: string,
  zoneId: string | null
): Promise<ActionResult<BoardElement>> {
  try {
    const element = await elementsRepository.updateElement(elementId, {
      zoneId: zoneId,
    });

    if (!element) {
      return { success: false, error: 'Élément introuvable' };
    }

    revalidatePath(`/boards/${element.boardId}`);

    return { success: true, data: element };
  } catch (error) {
    console.error('assignElementToZoneAction error:', error);
    return { success: false, error: "Impossible d'assigner l'élément à la zone" };
  }
}
