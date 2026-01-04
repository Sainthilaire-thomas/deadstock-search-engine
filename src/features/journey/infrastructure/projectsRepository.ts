// src/features/journey/infrastructure/projectsRepository.ts
// Repository for projects CRUD operations (server-side)
// Session 10 - 2026-01-03

import { createClient } from '@/lib/supabase/server';
import type {
  Project,
  ProjectType,
  ProjectStatus,
  JourneyStep,
  MoodBoardItem,
  GarmentConfig,
  FabricModifiers,
  ColorPalette,
  YardageDetails,
  SelectedTextile,
  ProjectConstraints,
} from '../domain/types';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CreateProjectData {
  name: string;
  sessionId: string;
  projectType?: ProjectType;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  projectType?: ProjectType;
  status?: ProjectStatus;
  currentStep?: JourneyStep;
  
  // Inspiration
  moodBoard?: MoodBoardItem[];
  colorPalette?: ColorPalette;
  styleKeywords?: string[];
  
  // Design
  garments?: GarmentConfig[];
  
  // Calculation
  fabricWidth?: number;
  marginPercent?: number;
  fabricModifiers?: FabricModifiers;
  totalYardage?: number;
  yardageDetails?: YardageDetails;
  
  // Sourcing
  selectedTextiles?: SelectedTextile[];
  
  // Client info
  clientName?: string;
  clientEmail?: string;
  deadline?: string;
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  
  // Constraints
  constraints?: ProjectConstraints;
}

export interface ProjectListItem {
  id: string;
  name: string;
  projectType: ProjectType;
  status: ProjectStatus;
  currentStep: JourneyStep;
  garmentsCount: number;
  totalYardage: number | null;
  updatedAt: string;
  createdAt: string;
}

// ============================================
// DATABASE ROW TYPE
// ============================================

interface ProjectRow {
  id: string;
  user_id: string | null;
  session_id: string | null;
  name: string;
  name_i18n: Record<string, string> | null;
  description: string | null;
  description_i18n: Record<string, string> | null;
  project_type: string;
  status: string;
  current_step: string;
  mood_board: MoodBoardItem[] | null;
  color_palette: ColorPalette | null;
  style_keywords: string[] | null;
  reference_images: unknown[] | null;
  garments: GarmentConfig[] | null;
  fabric_width: number | null;
  margin_percent: number | null;
  fabric_modifiers: FabricModifiers | null;
  total_yardage: number | null;
  yardage_details: YardageDetails | null;
  selected_textiles: SelectedTextile[] | null;
  client_name: string | null;
  client_email: string | null;
  deadline: string | null;
  budget_min: number | null;
  budget_max: number | null;
  currency: string | null;
  constraints: ProjectConstraints | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// MAPPER FUNCTIONS
// ============================================

function mapRowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    sessionId: row.session_id ?? undefined,
    name: row.name,
    nameI18n: row.name_i18n ?? undefined,
    description: row.description ?? undefined,
    descriptionI18n: row.description_i18n ?? undefined,
    projectType: row.project_type as ProjectType,
    status: row.status as ProjectStatus,
    currentStep: row.current_step as JourneyStep,
    moodBoard: row.mood_board ?? [],
    colorPalette: row.color_palette ?? undefined,
    styleKeywords: row.style_keywords ?? [],
    referenceImages: [],
    garments: row.garments ?? [],
    fabricWidth: row.fabric_width ?? 140,
    marginPercent: row.margin_percent ?? 10,
    fabricModifiers: row.fabric_modifiers ?? {
      directional: false,
      patternMatch: false,
      velvet: false,
      stretch: false,
    },
    totalYardage: row.total_yardage ?? undefined,
    yardageDetails: row.yardage_details ?? undefined,
    selectedTextiles: row.selected_textiles ?? [],
    clientName: row.client_name ?? undefined,
    clientEmail: row.client_email ?? undefined,
    deadline: row.deadline ?? undefined,
    budgetMin: row.budget_min ?? undefined,
    budgetMax: row.budget_max ?? undefined,
    currency: row.currency ?? 'EUR',
    constraints: row.constraints ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToListItem(row: ProjectRow): ProjectListItem {
  return {
    id: row.id,
    name: row.name,
    projectType: row.project_type as ProjectType,
    status: row.status as ProjectStatus,
    currentStep: row.current_step as JourneyStep,
    garmentsCount: row.garments?.length ?? 0,
    totalYardage: row.total_yardage,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

// ============================================
// REPOSITORY FUNCTIONS
// ============================================

/**
 * Get all projects for a session
 */
export async function getProjectsBySession(sessionId: string): Promise<ProjectListItem[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .schema('deadstock')
    .from('projects')
    .select('*')
    .eq('session_id', sessionId)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching projects:', error);
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }
  
  return (data as ProjectRow[]).map(mapRowToListItem);
}

/**
 * Get a single project by ID
 */
export async function getProjectById(
  projectId: string,
  sessionId: string
): Promise<Project | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .schema('deadstock')
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('session_id', sessionId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching project:', error);
    throw new Error(`Failed to fetch project: ${error.message}`);
  }
  
  return mapRowToProject(data as ProjectRow);
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectData): Promise<Project> {
  const supabase = await createClient();
  
  const { data: created, error } = await supabase
    .schema('deadstock')
    .from('projects')
    .insert({
      name: data.name,
      session_id: data.sessionId,
      project_type: data.projectType ?? 'single_piece',
      description: data.description ?? null,
      status: 'draft',
      current_step: 'idea',
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating project:', error);
    throw new Error(`Failed to create project: ${error.message}`);
  }
  
  return mapRowToProject(created as ProjectRow);
}

/**
 * Update an existing project
 */
export async function updateProject(
  projectId: string,
  sessionId: string,
  updates: UpdateProjectData
): Promise<Project> {
  const supabase = await createClient();
  
  // Map camelCase to snake_case for database
  const dbUpdates: Record<string, unknown> = {};
  
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.projectType !== undefined) dbUpdates.project_type = updates.projectType;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.currentStep !== undefined) dbUpdates.current_step = updates.currentStep;
  
  // Inspiration
  if (updates.moodBoard !== undefined) dbUpdates.mood_board = updates.moodBoard;
  if (updates.colorPalette !== undefined) dbUpdates.color_palette = updates.colorPalette;
  if (updates.styleKeywords !== undefined) dbUpdates.style_keywords = updates.styleKeywords;
  
  // Design
  if (updates.garments !== undefined) dbUpdates.garments = updates.garments;
  
  // Calculation
  if (updates.fabricWidth !== undefined) dbUpdates.fabric_width = updates.fabricWidth;
  if (updates.marginPercent !== undefined) dbUpdates.margin_percent = updates.marginPercent;
  if (updates.fabricModifiers !== undefined) dbUpdates.fabric_modifiers = updates.fabricModifiers;
  if (updates.totalYardage !== undefined) dbUpdates.total_yardage = updates.totalYardage;
  if (updates.yardageDetails !== undefined) dbUpdates.yardage_details = updates.yardageDetails;
  
  // Sourcing
  if (updates.selectedTextiles !== undefined) dbUpdates.selected_textiles = updates.selectedTextiles;
  
  // Client info
  if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
  if (updates.clientEmail !== undefined) dbUpdates.client_email = updates.clientEmail;
  if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
  if (updates.budgetMin !== undefined) dbUpdates.budget_min = updates.budgetMin;
  if (updates.budgetMax !== undefined) dbUpdates.budget_max = updates.budgetMax;
  if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
  
  // Constraints
  if (updates.constraints !== undefined) dbUpdates.constraints = updates.constraints;
  
  const { data: updated, error } = await supabase
    .schema('deadstock')
    .from('projects')
    .update(dbUpdates)
    .eq('id', projectId)
    .eq('session_id', sessionId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating project:', error);
    throw new Error(`Failed to update project: ${error.message}`);
  }
  
  return mapRowToProject(updated as ProjectRow);
}

/**
 * Delete a project
 */
export async function deleteProject(
  projectId: string,
  sessionId: string
): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .schema('deadstock')
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('session_id', sessionId);
  
  if (error) {
    console.error('Error deleting project:', error);
    throw new Error(`Failed to delete project: ${error.message}`);
  }
}

/**
 * Check if a project exists and belongs to session
 */
export async function projectExists(
  projectId: string,
  sessionId: string
): Promise<boolean> {
  const supabase = await createClient();
  
  const { count, error } = await supabase
    .schema('deadstock')
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('id', projectId)
    .eq('session_id', sessionId);
  
  if (error) {
    console.error('Error checking project existence:', error);
    return false;
  }
  
  return (count ?? 0) > 0;
}

/**
 * Get project count for a session
 */
export async function getProjectsCount(sessionId: string): Promise<number> {
  const supabase = await createClient();
  
  const { count, error } = await supabase
    .schema('deadstock')
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId);
  
  if (error) {
    console.error('Error counting projects:', error);
    return 0;
  }
  
  return count ?? 0;
}
