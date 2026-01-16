// src/features/boards/actions/crystallizationActions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/lib/auth/getAuthUser';
import { zonesRepository } from '../infrastructure/zonesRepository';
import { elementsRepository } from '../infrastructure/elementsRepository';
import { createProject as createProjectInDb } from '@/features/journey/infrastructure/projectsRepository';
import { isElementInZone } from '../utils/zoneUtils';
import type { BoardZone } from '../domain/types';
import type { ActionResult } from '../domain/types';
import type { ProjectType } from '@/features/journey/domain/types';

// ============================================
// TYPES
// ============================================

export interface CrystallizeZoneInput {
  zoneId: string;
  boardId: string;
  projectName: string;
  projectType: ProjectType;
  client?: string;
  deadline?: string;
  budgetMin?: number;
  budgetMax?: number;
}

export interface CrystallizeZoneResult {
  projectId: string;
  zone: BoardZone;
}

// ============================================
// CRYSTALLIZE ZONE ACTION
// ============================================

export async function crystallizeZoneAction(
  input: CrystallizeZoneInput
): Promise<ActionResult<CrystallizeZoneResult>> {
  try {
    const userId = await requireUserId();

    // 1. Vérifier que la zone existe et n'est pas déjà cristallisée
    const zone = await zonesRepository.getZoneById(input.zoneId);
    
    if (!zone) {
      return { success: false, error: 'Zone introuvable' };
    }

    if (zone.crystallizedAt) {
      return { success: false, error: 'Cette zone est déjà cristallisée' };
    }

    // 2. Récupérer les éléments de la zone
    const allElements = await elementsRepository.getElementsByBoard(input.boardId);
    const zoneElements = allElements.filter(el => isElementInZone(el, zone));

    if (zoneElements.length === 0) {
      return { success: false, error: 'La zone ne contient aucun élément' };
    }

    // 3. Créer le projet avec les données extraites
    const project = await createProjectInDb({
      name: input.projectName,
      userId,
      projectType: input.projectType,
      description: `Créé depuis la zone "${zone.name}"`,
    });

    // 4. Marquer la zone comme cristallisée
    const updatedZone = await zonesRepository.crystallizeZone(input.zoneId, project.id);

    if (!updatedZone) {
      return { success: false, error: 'Erreur lors de la cristallisation' };
    }

    // 5. Revalidate paths
    revalidatePath(`/boards/${input.boardId}`);
    revalidatePath('/projects');

    return {
      success: true,
      data: {
        projectId: project.id,
        zone: updatedZone,
      },
    };
  } catch (error) {
    console.error('crystallizeZoneAction error:', error);
    return {
      success: false,
      error: 'Impossible de cristalliser la zone'
    };
  }
}
