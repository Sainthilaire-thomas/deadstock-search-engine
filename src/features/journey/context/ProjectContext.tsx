// src/features/journey/context/ProjectContext.tsx
// Context provider for project state management
// Session 10 - 2026-01-03

'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useTransition,
  type ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  getProjectAction,
  updateProjectAction,
  updateProjectIdeaAction,
  updateProjectInspirationAction,
  updateProjectGarmentsAction,
  updateProjectCalculationAction,
  updateProjectStepAction,
  deleteProjectAction,
  addGarmentAction,
  updateGarmentAction,
  removeGarmentAction,
  duplicateGarmentAction,
  addMoodBoardItemAction,
  updateMoodBoardItemAction,
  removeMoodBoardItemAction,
  reorderMoodBoardAction,
} from '../actions/projectActions';
import { calculateYardage } from '../services/yardageCalculator';
import type {
  Project,
  JourneyStep,
  GarmentConfig,
  MoodBoardItem,
  ColorPalette,
  FabricModifiers,
  CalculationResult,
  ProjectConstraints,
  ProjectType,
} from '../domain/types';

// ============================================
// CONTEXT TYPE
// ============================================

interface ProjectContextValue {
  // State
  project: Project | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  hasUnsavedChanges: boolean;
  
  // Project Actions
  loadProject: (id: string) => Promise<void>;
  saveProject: () => Promise<void>;
  deleteProject: () => Promise<void>;
  
  // Step 1: Idea
  updateIdea: (data: {
    name?: string;
    description?: string;
    projectType?: ProjectType;
    clientName?: string;
    clientEmail?: string;
    deadline?: string;
    budgetMin?: number;
    budgetMax?: number;
    constraints?: ProjectConstraints;
  }) => Promise<void>;
  
  // Step 2: Inspiration
  updateInspiration: (data: {
    moodBoard?: MoodBoardItem[];
    colorPalette?: ColorPalette;
    styleKeywords?: string[];
  }) => Promise<void>;
  addMoodBoardItem: (item: Omit<MoodBoardItem, 'id'>) => Promise<void>;
  updateMoodBoardItem: (id: string, updates: Partial<MoodBoardItem>) => Promise<void>;
  removeMoodBoardItem: (id: string) => Promise<void>;
  reorderMoodBoard: (items: MoodBoardItem[]) => void;
  updateColorPalette: (palette: ColorPalette) => void;
  addStyleKeyword: (keyword: string) => void;
  removeStyleKeyword: (keyword: string) => void;
  
  // Step 3: Design
  addGarment: (garment: Omit<GarmentConfig, 'id'>) => Promise<void>;
  updateGarment: (id: string, updates: Partial<GarmentConfig>) => void;
  removeGarment: (id: string) => Promise<void>;
  duplicateGarment: (id: string) => Promise<void>;
  
  // Step 4: Calculate
  updateCalculationParams: (data: {
    fabricWidth?: number;
    marginPercent?: number;
    fabricModifiers?: FabricModifiers;
  }) => void;
  getCalculationResult: () => CalculationResult | null;
  saveCalculation: () => Promise<void>;
  
  // Navigation
  currentStep: JourneyStep;
  goToStep: (step: JourneyStep) => void;
  completeCurrentStep: () => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================

const ProjectContext = createContext<ProjectContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

interface ProjectProviderProps {
  children: ReactNode;
  initialProject?: Project | null;
  projectId?: string;
}

export function ProjectProvider({
  children,
  initialProject = null,
  projectId,
}: ProjectProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  
  // State
  const [project, setProject] = useState<Project | null>(initialProject);
  const [isLoading, setIsLoading] = useState(!initialProject && !!projectId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Local state for optimistic updates
  const [localGarments, setLocalGarments] = useState<GarmentConfig[]>(
    initialProject?.garments ?? []
  );
  const [localMoodBoard, setLocalMoodBoard] = useState<MoodBoardItem[]>(
    initialProject?.moodBoard ?? []
  );
  const [localCalculationParams, setLocalCalculationParams] = useState({
    fabricWidth: initialProject?.fabricWidth ?? 140,
    marginPercent: initialProject?.marginPercent ?? 10,
    fabricModifiers: initialProject?.fabricModifiers ?? {
      directional: false,
      patternMatch: false,
      velvet: false,
      stretch: false,
    },
  });
  
  // Determine current step from pathname
  const currentStep: JourneyStep = (() => {
    if (pathname?.includes('/inspiration')) return 'inspiration';
    if (pathname?.includes('/design')) return 'design';
    if (pathname?.includes('/calculate')) return 'calculate';
    if (pathname?.includes('/sourcing')) return 'sourcing';
    if (pathname?.includes('/validation')) return 'validation';
    if (pathname?.includes('/purchase')) return 'purchase';
    return 'idea';
  })();
  
  // Load project if not provided
  useEffect(() => {
    if (projectId && !initialProject) {
      loadProject(projectId);
    }
  }, [projectId]);
  
  // Sync local state when project changes
  useEffect(() => {
    if (project) {
      setLocalGarments(project.garments);
      setLocalMoodBoard(project.moodBoard);
      setLocalCalculationParams({
        fabricWidth: project.fabricWidth,
        marginPercent: project.marginPercent,
        fabricModifiers: project.fabricModifiers,
      });
    }
  }, [project?.id]);
  
  // ==========================================
  // LOAD & SAVE
  // ==========================================
  
  const loadProject = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loaded = await getProjectAction(id);
      if (loaded) {
        setProject(loaded);
        setLocalGarments(loaded.garments);
        setLocalMoodBoard(loaded.moodBoard);
        setLocalCalculationParams({
          fabricWidth: loaded.fabricWidth,
          marginPercent: loaded.marginPercent,
          fabricModifiers: loaded.fabricModifiers,
        });
      } else {
        setError(new Error('Project not found'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load project'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const saveProject = useCallback(async () => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      await updateProjectAction(project.id, {
        garments: localGarments,
        moodBoard: localMoodBoard,
        ...localCalculationParams,
      });
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save project'));
    } finally {
      setIsSaving(false);
    }
  }, [project, localGarments, localMoodBoard, localCalculationParams]);
  
  const handleDeleteProject = useCallback(async () => {
    if (!project) return;
    
    try {
      await deleteProjectAction(project.id);
      router.push('/journey');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete project'));
    }
  }, [project, router]);
  
  // ==========================================
  // STEP 1: IDEA
  // ==========================================
  
  const updateIdea = useCallback(async (data: Parameters<typeof updateProjectIdeaAction>[1]) => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      const updated = await updateProjectIdeaAction(project.id, data);
      setProject(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update project'));
    } finally {
      setIsSaving(false);
    }
  }, [project]);
  
  // ==========================================
  // STEP 2: INSPIRATION
  // ==========================================
  
  const updateInspiration = useCallback(async (data: Parameters<typeof updateProjectInspirationAction>[1]) => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      const updated = await updateProjectInspirationAction(project.id, data);
      setProject(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update inspiration'));
    } finally {
      setIsSaving(false);
    }
  }, [project]);
  
  const handleAddMoodBoardItem = useCallback(async (item: Omit<MoodBoardItem, 'id'>) => {
    if (!project) return;
    
    // Optimistic update
    const newItem: MoodBoardItem = { ...item, id: crypto.randomUUID() };
    setLocalMoodBoard(prev => [...prev, newItem]);
    setHasUnsavedChanges(true);
    
    try {
      const updated = await addMoodBoardItemAction(project.id, item);
      setProject(updated);
      setLocalMoodBoard(updated.moodBoard);
      setHasUnsavedChanges(false);
    } catch (err) {
      // Rollback
      setLocalMoodBoard(prev => prev.filter(i => i.id !== newItem.id));
      setError(err instanceof Error ? err : new Error('Failed to add item'));
    }
  }, [project]);
  
  const handleUpdateMoodBoardItem = useCallback(async (id: string, updates: Partial<MoodBoardItem>) => {
    if (!project) return;
    
    // Optimistic update
    setLocalMoodBoard(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
    setHasUnsavedChanges(true);
    
    try {
      const updated = await updateMoodBoardItemAction(project.id, id, updates);
      setProject(updated);
      setLocalMoodBoard(updated.moodBoard);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update item'));
    }
  }, [project]);
  
  const handleRemoveMoodBoardItem = useCallback(async (id: string) => {
    if (!project) return;
    
    const itemToRemove = localMoodBoard.find(i => i.id === id);
    
    // Optimistic update
    setLocalMoodBoard(prev => prev.filter(item => item.id !== id));
    setHasUnsavedChanges(true);
    
    try {
      const updated = await removeMoodBoardItemAction(project.id, id);
      setProject(updated);
      setLocalMoodBoard(updated.moodBoard);
      setHasUnsavedChanges(false);
    } catch (err) {
      // Rollback
      if (itemToRemove) {
        setLocalMoodBoard(prev => [...prev, itemToRemove]);
      }
      setError(err instanceof Error ? err : new Error('Failed to remove item'));
    }
  }, [project, localMoodBoard]);
  
  const reorderMoodBoard = useCallback((items: MoodBoardItem[]) => {
    setLocalMoodBoard(items);
    setHasUnsavedChanges(true);
  }, []);
  
  const updateColorPalette = useCallback((palette: ColorPalette) => {
    if (!project) return;
    setProject(prev => prev ? { ...prev, colorPalette: palette } : null);
    setHasUnsavedChanges(true);
  }, [project]);
  
  const addStyleKeyword = useCallback((keyword: string) => {
    if (!project) return;
    const keywords = [...(project.styleKeywords || [])];
    if (!keywords.includes(keyword)) {
      keywords.push(keyword);
      setProject(prev => prev ? { ...prev, styleKeywords: keywords } : null);
      setHasUnsavedChanges(true);
    }
  }, [project]);
  
  const removeStyleKeyword = useCallback((keyword: string) => {
    if (!project) return;
    const keywords = (project.styleKeywords || []).filter(k => k !== keyword);
    setProject(prev => prev ? { ...prev, styleKeywords: keywords } : null);
    setHasUnsavedChanges(true);
  }, [project]);
  
  // ==========================================
  // STEP 3: DESIGN (GARMENTS)
  // ==========================================
  
  const handleAddGarment = useCallback(async (garment: Omit<GarmentConfig, 'id'>) => {
    if (!project) return;
    
    // Optimistic update
    const newGarment: GarmentConfig = { ...garment, id: crypto.randomUUID() };
    setLocalGarments(prev => [...prev, newGarment]);
    setHasUnsavedChanges(true);
    
    try {
      const updated = await addGarmentAction(project.id, garment);
      setProject(updated);
      setLocalGarments(updated.garments);
      setHasUnsavedChanges(false);
    } catch (err) {
      // Rollback
      setLocalGarments(prev => prev.filter(g => g.id !== newGarment.id));
      setError(err instanceof Error ? err : new Error('Failed to add garment'));
    }
  }, [project]);
  
  const handleUpdateGarment = useCallback((id: string, updates: Partial<GarmentConfig>) => {
    // Local update only (debounced save)
    setLocalGarments(prev =>
      prev.map(g => (g.id === id ? { ...g, ...updates } : g))
    );
    setHasUnsavedChanges(true);
  }, []);
  
  const handleRemoveGarment = useCallback(async (id: string) => {
    if (!project) return;
    
    const garmentToRemove = localGarments.find(g => g.id === id);
    
    // Optimistic update
    setLocalGarments(prev => prev.filter(g => g.id !== id));
    setHasUnsavedChanges(true);
    
    try {
      const updated = await removeGarmentAction(project.id, id);
      setProject(updated);
      setLocalGarments(updated.garments);
      setHasUnsavedChanges(false);
    } catch (err) {
      // Rollback
      if (garmentToRemove) {
        setLocalGarments(prev => [...prev, garmentToRemove]);
      }
      setError(err instanceof Error ? err : new Error('Failed to remove garment'));
    }
  }, [project, localGarments]);
  
  const handleDuplicateGarment = useCallback(async (id: string) => {
    if (!project) return;
    
    try {
      const updated = await duplicateGarmentAction(project.id, id);
      setProject(updated);
      setLocalGarments(updated.garments);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to duplicate garment'));
    }
  }, [project]);
  
  // ==========================================
  // STEP 4: CALCULATE
  // ==========================================
  
  const updateCalculationParams = useCallback((data: {
    fabricWidth?: number;
    marginPercent?: number;
    fabricModifiers?: FabricModifiers;
  }) => {
    setLocalCalculationParams(prev => ({ ...prev, ...data }));
    setHasUnsavedChanges(true);
  }, []);
  
  const getCalculationResult = useCallback((): CalculationResult | null => {
    if (localGarments.length === 0) return null;
    
    return calculateYardage({
      garments: localGarments,
      ...localCalculationParams,
    });
  }, [localGarments, localCalculationParams]);
  
  const saveCalculation = useCallback(async () => {
    if (!project) return;
    
    const result = getCalculationResult();
    if (!result) return;
    
    setIsSaving(true);
    try {
      const updated = await updateProjectCalculationAction(project.id, {
        ...localCalculationParams,
        totalYardage: result.totalYardage,
        yardageDetails: {
          breakdown: result.breakdown,
          subtotal: result.subtotal,
          fabricWidthAdjustment: result.fabricWidthAdjustment,
          modifiersAmount: result.modifiersAmount,
          marginAmount: result.marginAmount,
          total: result.totalYardage,
          recommended: result.recommendedYardage,
        },
      });
      setProject(updated);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save calculation'));
    } finally {
      setIsSaving(false);
    }
  }, [project, localCalculationParams, getCalculationResult]);
  
  // ==========================================
  // NAVIGATION
  // ==========================================
  
  const goToStep = useCallback((step: JourneyStep) => {
    if (!project) return;
    
    const stepPaths: Record<JourneyStep, string> = {
      idea: `/journey/${project.id}/idea`,
      inspiration: `/journey/${project.id}/inspiration`,
      design: `/journey/${project.id}/design`,
      calculate: `/journey/${project.id}/calculate`,
      sourcing: `/search?projectId=${project.id}`,
      validation: `/favorites?projectId=${project.id}`,
      purchase: `/journey/${project.id}/purchase`,
      production: `/journey/${project.id}/production`,
      impact: `/journey/${project.id}/impact`,
    };
    
    startTransition(() => {
      router.push(stepPaths[step]);
    });
  }, [project, router]);
  
  const completeCurrentStep = useCallback(async () => {
    if (!project) return;
    
    const nextSteps: Record<JourneyStep, JourneyStep> = {
      idea: 'inspiration',
      inspiration: 'design',
      design: 'calculate',
      calculate: 'sourcing',
      sourcing: 'validation',
      validation: 'purchase',
      purchase: 'production',
      production: 'impact',
      impact: 'impact',
    };
    
    const nextStep = nextSteps[currentStep];
    
    // Save current step and navigate
    if (hasUnsavedChanges) {
      await saveProject();
    }
    
    await updateProjectStepAction(project.id, nextStep);
    goToStep(nextStep);
  }, [project, currentStep, hasUnsavedChanges, saveProject, goToStep]);
  
  // ==========================================
  // VALUE
  // ==========================================
  
  const value: ProjectContextValue = {
    // State
    project,
    isLoading: isLoading || isPending,
    isSaving,
    error,
    hasUnsavedChanges,
    
    // Project Actions
    loadProject,
    saveProject,
    deleteProject: handleDeleteProject,
    
    // Step 1: Idea
    updateIdea,
    
    // Step 2: Inspiration
    updateInspiration,
    addMoodBoardItem: handleAddMoodBoardItem,
    updateMoodBoardItem: handleUpdateMoodBoardItem,
    removeMoodBoardItem: handleRemoveMoodBoardItem,
    reorderMoodBoard,
    updateColorPalette,
    addStyleKeyword,
    removeStyleKeyword,
    
    // Step 3: Design
    addGarment: handleAddGarment,
    updateGarment: handleUpdateGarment,
    removeGarment: handleRemoveGarment,
    duplicateGarment: handleDuplicateGarment,
    
    // Step 4: Calculate
    updateCalculationParams,
    getCalculationResult,
    saveCalculation,
    
    // Navigation
    currentStep,
    goToStep,
    completeCurrentStep,
  };
  
  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useProject(): ProjectContextValue {
  const context = useContext(ProjectContext);
  
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  
  return context;
}

// ============================================
// OPTIONAL: Separate hooks for specific needs
// ============================================

export function useProjectGarments() {
  const { project, addGarment, updateGarment, removeGarment, duplicateGarment } = useProject();
  return {
    garments: project?.garments ?? [],
    addGarment,
    updateGarment,
    removeGarment,
    duplicateGarment,
  };
}

export function useProjectMoodBoard() {
  const {
    project,
    addMoodBoardItem,
    updateMoodBoardItem,
    removeMoodBoardItem,
    reorderMoodBoard,
    updateColorPalette,
  } = useProject();
  return {
    moodBoard: project?.moodBoard ?? [],
    colorPalette: project?.colorPalette,
    addItem: addMoodBoardItem,
    updateItem: updateMoodBoardItem,
    removeItem: removeMoodBoardItem,
    reorder: reorderMoodBoard,
    updatePalette: updateColorPalette,
  };
}

export function useYardageCalculation() {
  const {
    project,
    updateCalculationParams,
    getCalculationResult,
    saveCalculation,
    isSaving,
  } = useProject();
  return {
    fabricWidth: project?.fabricWidth ?? 140,
    marginPercent: project?.marginPercent ?? 10,
    fabricModifiers: project?.fabricModifiers,
    updateParams: updateCalculationParams,
    calculate: getCalculationResult,
    save: saveCalculation,
    isSaving,
  };
}
