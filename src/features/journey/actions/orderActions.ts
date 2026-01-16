// src/features/journey/actions/orderActions.ts
// Server Actions for order operations (Sprint C3)
// Date: 2026-01-16

'use server';

import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/lib/auth/getAuthUser';
import { getProjectById, updateProject } from '../infrastructure/projectsRepository';
import { getElementsInZone } from '@/features/boards/utils/zoneUtils';
import { getZoneById } from '@/features/boards/infrastructure/zonesRepository';
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

    if (!project.sourceZoneId) {
      return { success: false, error: 'Ce projet n\'a pas de zone source' };
    }

    // 2. Get current elements from the zone
    const zone = await getZoneById(project.sourceZoneId);
    if (!zone) {
      return { success: false, error: 'Zone source introuvable' };
    }

    const allElements = await getElementsByBoard(zone.boardId);
    const zoneElements = getElementsInZone(allElements, zone);

    // 3. Build the snapshot - Textiles
    const textiles: SnapshotTextile[] = [];
    for (const e of zoneElements) {
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
    for (const e of zoneElements) {
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
    for (const e of zoneElements) {
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
