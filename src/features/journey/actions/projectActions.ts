// src/features/journey/actions/projectActions.ts
// Server Actions for project operations
// Session 10 - 2026-01-03

'use server';

import { revalidatePath } from 'next/cache';
import { getOrCreateSessionId } from '@/features/favorites/utils/sessionManager';
import {
  getProjectsBySession,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsCount,
} from '../infrastructure/projectsRepository';
import type {
  Project,
  ProjectType,
  MoodBoardItem,
  GarmentConfig,
  FabricModifiers,
  ColorPalette,
  YardageDetails,
  SelectedTextile,
  ProjectConstraints,
  JourneyStep,
} from '../domain/types';
import type { ProjectListItem, UpdateProjectData } from '../infrastructure/projectsRepository';

// ============================================
// READ ACTIONS
// ============================================

/**
 * Get all projects for the current session
 */
export async function getProjectsAction(): Promise<ProjectListItem[]> {
  const sessionId = await getOrCreateSessionId();
  return getProjectsBySession(sessionId);
}

/**
 * Get a single project by ID
 */
export async function getProjectAction(projectId: string): Promise<Project | null> {
  const sessionId = await getOrCreateSessionId();
  return getProjectById(projectId, sessionId);
}

/**
 * Get projects count for current session
 */
export async function getProjectsCountAction(): Promise<number> {
  const sessionId = await getOrCreateSessionId();
  return getProjectsCount(sessionId);
}

// ============================================
// CREATE ACTIONS
// ============================================

export interface CreateProjectInput {
  name: string;
  projectType?: ProjectType;
  description?: string;
}

/**
 * Create a new project
 */
export async function createProjectAction(input: CreateProjectInput): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  
  const project = await createProject({
    name: input.name,
    sessionId,
    projectType: input.projectType,
    description: input.description,
  });
  
  revalidatePath('/journey');
  
  return project;
}

// ============================================
// UPDATE ACTIONS
// ============================================

/**
 * Update project basic info (Step 1: Idea)
 */
export async function updateProjectIdeaAction(
  projectId: string,
  data: {
    name?: string;
    description?: string;
    projectType?: ProjectType;
    clientName?: string;
    clientEmail?: string;
    deadline?: string;
    budgetMin?: number;
    budgetMax?: number;
    constraints?: ProjectConstraints;
  }
): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  
  const project = await updateProject(projectId, sessionId, data);
  
  revalidatePath(`/journey/${projectId}`);
  revalidatePath('/journey');
  
  return project;
}

/**
 * Update project inspiration (Step 2: Inspiration)
 */
export async function updateProjectInspirationAction(
  projectId: string,
  data: {
    moodBoard?: MoodBoardItem[];
    colorPalette?: ColorPalette;
    styleKeywords?: string[];
  }
): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  
  const project = await updateProject(projectId, sessionId, data);
  
  revalidatePath(`/journey/${projectId}/inspiration`);
  
  return project;
}

/**
 * Update project garments (Step 3: Design)
 */
export async function updateProjectGarmentsAction(
  projectId: string,
  garments: GarmentConfig[]
): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  
  const project = await updateProject(projectId, sessionId, { garments });
  
  revalidatePath(`/journey/${projectId}/design`);
  revalidatePath(`/journey/${projectId}/calculate`);
  
  return project;
}

/**
 * Update project calculation params (Step 4: Calculate)
 */
export async function updateProjectCalculationAction(
  projectId: string,
  data: {
    fabricWidth?: number;
    marginPercent?: number;
    fabricModifiers?: FabricModifiers;
    totalYardage?: number;
    yardageDetails?: YardageDetails;
  }
): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  
  const project = await updateProject(projectId, sessionId, data);
  
  revalidatePath(`/journey/${projectId}/calculate`);
  
  return project;
}

/**
 * Update selected textiles (Step 5-6: Sourcing/Validation)
 */
export async function updateProjectTextilesAction(
  projectId: string,
  selectedTextiles: SelectedTextile[]
): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  
  const project = await updateProject(projectId, sessionId, { selectedTextiles });
  
  revalidatePath(`/journey/${projectId}/sourcing`);
  revalidatePath(`/journey/${projectId}/validation`);
  
  return project;
}

/**
 * Update current step
 */
export async function updateProjectStepAction(
  projectId: string,
  currentStep: JourneyStep
): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  
  const project = await updateProject(projectId, sessionId, { currentStep });
  
  revalidatePath(`/journey/${projectId}`);
  
  return project;
}

/**
 * Generic update action for any project fields
 */
export async function updateProjectAction(
  projectId: string,
  updates: UpdateProjectData
): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  
  const project = await updateProject(projectId, sessionId, updates);
  
  revalidatePath(`/journey/${projectId}`);
  revalidatePath('/journey');
  
  return project;
}

// ============================================
// DELETE ACTIONS
// ============================================

/**
 * Delete a project
 */
export async function deleteProjectAction(projectId: string): Promise<void> {
  const sessionId = await getOrCreateSessionId();
  
  await deleteProject(projectId, sessionId);
  
  revalidatePath('/journey');
}

// ============================================
// MOOD BOARD SPECIFIC ACTIONS
// ============================================

/**
 * Add item to mood board
 */
export async function addMoodBoardItemAction(
  projectId: string,
  item: Omit<MoodBoardItem, 'id'>
): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  const project = await getProjectById(projectId, sessionId);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  const newItem: MoodBoardItem = {
    ...item,
    id: crypto.randomUUID(),
  };
  
  const updatedMoodBoard = [...project.moodBoard, newItem];
  
  return updateProject(projectId, sessionId, { moodBoard: updatedMoodBoard });
}

/**
 * Update mood board item
 */
export async function updateMoodBoardItemAction(
  projectId: string,
  itemId: string,
  updates: Partial<MoodBoardItem>
): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  const project = await getProjectById(projectId, sessionId);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  const updatedMoodBoard = project.moodBoard.map(item =>
    item.id === itemId ? { ...item, ...updates } : item
  );
  
  return updateProject(projectId, sessionId, { moodBoard: updatedMoodBoard });
}

/**
 * Remove mood board item
 */
export async function removeMoodBoardItemAction(
  projectId: string,
  itemId: string
): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  const project = await getProjectById(projectId, sessionId);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  const updatedMoodBoard = project.moodBoard.filter(item => item.id !== itemId);
  
  return updateProject(projectId, sessionId, { moodBoard: updatedMoodBoard });
}

/**
 * Reorder mood board items (update positions/zIndex)
 */
export async function reorderMoodBoardAction(
  projectId: string,
  items: MoodBoardItem[]
): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  
  return updateProject(projectId, sessionId, { moodBoard: items });
}

// ============================================
// GARMENT SPECIFIC ACTIONS
// ============================================

/**
 * Add garment to project
 */
export async function addGarmentAction(
  projectId: string,
  garment: Omit<GarmentConfig, 'id'>
): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  const project = await getProjectById(projectId, sessionId);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  const newGarment: GarmentConfig = {
    ...garment,
    id: crypto.randomUUID(),
  };
  
  const updatedGarments = [...project.garments, newGarment];
  
  const updated = await updateProject(projectId, sessionId, { garments: updatedGarments });
  
  revalidatePath(`/journey/${projectId}/design`);
  revalidatePath(`/journey/${projectId}/calculate`);
  
  return updated;
}

/**
 * Update garment
 */
export async function updateGarmentAction(
  projectId: string,
  garmentId: string,
  updates: Partial<GarmentConfig>
): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  const project = await getProjectById(projectId, sessionId);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  const updatedGarments = project.garments.map(g =>
    g.id === garmentId ? { ...g, ...updates } : g
  );
  
  const updated = await updateProject(projectId, sessionId, { garments: updatedGarments });
  
  revalidatePath(`/journey/${projectId}/design`);
  revalidatePath(`/journey/${projectId}/calculate`);
  
  return updated;
}

/**
 * Remove garment
 */
export async function removeGarmentAction(
  projectId: string,
  garmentId: string
): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  const project = await getProjectById(projectId, sessionId);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  const updatedGarments = project.garments.filter(g => g.id !== garmentId);
  
  const updated = await updateProject(projectId, sessionId, { garments: updatedGarments });
  
  revalidatePath(`/journey/${projectId}/design`);
  revalidatePath(`/journey/${projectId}/calculate`);
  
  return updated;
}

/**
 * Duplicate garment
 */
export async function duplicateGarmentAction(
  projectId: string,
  garmentId: string
): Promise<Project> {
  const sessionId = await getOrCreateSessionId();
  const project = await getProjectById(projectId, sessionId);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  const garmentToDuplicate = project.garments.find(g => g.id === garmentId);
  
  if (!garmentToDuplicate) {
    throw new Error('Garment not found');
  }
  
  const duplicatedGarment: GarmentConfig = {
    ...garmentToDuplicate,
    id: crypto.randomUUID(),
    name: garmentToDuplicate.name 
      ? `${garmentToDuplicate.name} (copie)` 
      : undefined,
  };
  
  const updatedGarments = [...project.garments, duplicatedGarment];
  
  const updated = await updateProject(projectId, sessionId, { garments: updatedGarments });
  
  revalidatePath(`/journey/${projectId}/design`);
  revalidatePath(`/journey/${projectId}/calculate`);
  
  return updated;
}
