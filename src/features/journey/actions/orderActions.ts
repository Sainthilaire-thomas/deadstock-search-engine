// src/features/journey/actions/orderActions.ts
// Server Actions for order operations (Sprint C3)
// Date: 2026-01-16
// UB-5: Adapté temporairement pour architecture unifiée
// UB-7 TODO: Refactoring complet nécessaire

'use server';

import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/lib/auth/getAuthUser';
import { getProjectById, updateProject } from '../infrastructure/projectsRepository';
import { boardsRepository } from '@/features/boards/infrastructure/boardsRepository';
import { getElementsByBoard } from '@/features/boards/infrastructure/elementsRepository';
import {
  isTextileElement,
  isCalculationElement,
  isPaletteElement,
} from '@/features/boards/domain/types';
import type {
  ProjectSnapshot,
  SnapshotTextile,
  SnapshotCalculation,
  SnapshotPalette,
  OrderDetails,
  OrderTotals,
} from '../domain/types';

// ============================================
// TYPES
// ============================================

export interface PlaceOrderInput {
  projectId: string;
  quantities: Record<string, number>; // elementId -> meters
  supplier: string;
  orderReference?: string;
  notes?: string;
}

export interface PlaceOrderResult {
  success: boolean;
  error?: string;
}

// ============================================
// PLACE ORDER ACTION
// ============================================

/**
 * Place an order for a project - creates a snapshot and changes status to 'ordered'
 * UB-5: Adapté pour architecture unifiée (sourceZoneId → sourceBoardId)
 */
export async function placeOrderAction(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  try {
    const userId = await requireUserId();

    // 1. Verify project exists and is in draft status
    const project = await getProjectById(input.projectId, userId);

    if (!project) {
      return { success: false, error: 'Projet introuvable' };
    }

    if (project.status !== 'draft') {
      return { success: false, error: 'Ce projet a déjà été commandé' };
    }

    // UB-5: Dans la nouvelle architecture, sourceZoneId est en fait un boardId (child board)
    const sourceChildBoardId = project.sourceZoneId;
    if (!sourceChildBoardId) {
      return { success: false, error: 'Ce projet n\'a pas de source' };
    }

    // 2. Get current elements from the child board
    // UB-5: Les éléments sont maintenant directement dans le child board (via boardId)
    const childBoardElements = await getElementsByBoard(sourceChildBoardId);

    if (!childBoardElements || childBoardElements.length === 0) {
      // Pas d'erreur, juste un snapshot vide
      console.warn('No elements found in child board:', sourceChildBoardId);
    }

    // 3. Build the snapshot - Textiles
    const textiles: SnapshotTextile[] = [];
    for (const e of childBoardElements) {
      if (e.elementType === 'textile' && isTextileElement(e.elementData)) {
        const data = e.elementData;
        const textile: SnapshotTextile = {
          textileId: data.textileId,
          name: data.snapshot.name,
          source: data.snapshot.source,
          pricePerMeter: data.snapshot.price,
          quantityOrdered: input.quantities[e.id] || 0,
          subtotal: (input.quantities[e.id] || 0) * data.snapshot.price,
        };

        // Add optional fields only if they exist
        if (data.snapshot.imageUrl) {
          textile.imageUrl = data.snapshot.imageUrl;
        }

        // Build attributes object
        const attributes: SnapshotTextile['attributes'] = {};
        if (data.snapshot.material) {
          attributes.fiber = data.snapshot.material;
        }
        if (data.snapshot.color) {
          attributes.color = data.snapshot.color;
        }
        if (Object.keys(attributes).length > 0) {
          textile.attributes = attributes;
        }

        textiles.push(textile);
      }
    }

    // 3b. Build the snapshot - Calculations
    const calculations: SnapshotCalculation[] = [];
    for (const e of childBoardElements) {
      if (e.elementType === 'calculation' && isCalculationElement(e.elementData)) {
        const data = e.elementData;
        const calc: SnapshotCalculation = {
          garmentType: data.garmentType,
          size: data.size ?? '',
          totalMeters: data.result?.totalYardage ?? 0,
        };
        calculations.push(calc);
      }
    }

    // 3c. Build the snapshot - Palettes
    const palettes: SnapshotPalette[] = [];
    for (const e of childBoardElements) {
      if (e.elementType === 'palette' && isPaletteElement(e.elementData)) {
        const data = e.elementData;
        palettes.push({
          colors: data.colors,
        });
      }
    }

    const fabricCost = textiles.reduce((sum, t) => sum + t.subtotal, 0);

    const orderDetails: OrderDetails = {
      supplier: input.supplier,
      orderDate: new Date().toISOString(),
    };

    // Add optional order details
    if (input.orderReference) {
      orderDetails.orderReference = input.orderReference;
    }
    if (input.notes) {
      orderDetails.notes = input.notes;
    }

    const totals: OrderTotals = {
      fabricCost,
      total: fabricCost, // TODO: add shipping costs later
    };

    const snapshot: ProjectSnapshot = {
      textiles,
      calculations,
      palettes,
      orderDetails,
      totals,
      capturedAt: new Date().toISOString(),
    };

    // 4. Update the project
    await updateProject(input.projectId, userId, {
      status: 'ordered',
      orderedAt: new Date(),
      snapshot,
    });

    // 5. Revalidate paths
    revalidatePath(`/journey/${input.projectId}`);
    if (project.sourceBoardId) {
      revalidatePath(`/boards/${project.sourceBoardId}`);
    }
    revalidatePath('/journey');

    return { success: true };
  } catch (error) {
    console.error('placeOrderAction error:', error);
    return { success: false, error: 'Erreur lors de la commande' };
  }
}
