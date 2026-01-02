/**
 * Domain Types - Designer Journey
 * 
 * Définit les types pour le parcours en 9 étapes du designer textile
 */

import { LucideIcon } from "lucide-react";

/**
 * Statut d'une étape du parcours
 */
export type StepStatus = 
  | "completed"   // ✓ Étape complétée
  | "current"     // ● Étape en cours
  | "locked"      // 🔒 Étape verrouillée (non accessible)
  | "upcoming";   // ⏳ Étape future (visible mais pas encore active)

/**
 * Phase du projet (pour regroupement visuel)
 */
export type ProjectPhase = 
  | "conception"    // Idée, Inspiration, Design
  | "preparation"   // Calcul, Sourcing, Validation
  | "execution"     // Achat, Production, Impact
  | "future";       // Étapes Phase 2+

/**
 * Configuration d'une étape du parcours designer
 */
export interface DesignJourneyStep {
  /** Identifiant unique de l'étape */
  id: string;
  
  /** Numéro de l'étape (1-9) */
  order: number;
  
  /** Titre de l'étape */
  title: string;
  
  /** Description courte pour tooltip */
  description: string;
  
  /** Icône Lucide React */
  icon: LucideIcon;
  
  /** Route associée (ex: /tools/yardage-calculator) */
  path: string;
  
  /** Phase du projet */
  phase: ProjectPhase;
  
  /** Disponible dans le MVP ? */
  availableInMVP: boolean;
  
  /** Emoji pour mobile/quick view */
  emoji: string;
}

/**
 * État du parcours designer (context)
 */
export interface JourneyState {
  /** Étape actuellement active */
  currentStep: string;
  
  /** Étapes complétées */
  completedSteps: string[];
  
  /** Données du projet en cours */
  projectData?: {
    name?: string;
    type?: string;
    yardageNeeded?: number;
    selectedTextiles?: string[];
  };
}

/**
 * Props pour le composant Sidebar
 */
export interface SidebarProps {
  /** Étape courante (détectée depuis pathname) */
  currentStep?: string;
  
  /** Sidebar collapsée ? */
  isCollapsed?: boolean;
  
  /** Callback toggle collapse */
  onToggleCollapse?: () => void;
  
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Props pour un step individuel
 */
export interface SidebarStepProps {
  /** Configuration de l'étape */
  step: DesignJourneyStep;
  
  /** Statut de l'étape */
  status: StepStatus;
  
  /** Sidebar collapsée ? */
  isCollapsed: boolean;
  
  /** Callback au click */
  onClick?: () => void;
}

/**
 * Props pour la navigation mobile
 */
export interface MobileJourneyNavProps {
  /** Étape courante */
  currentStep?: string;
  
  /** Classes CSS additionnelles */
  className?: string;
}
