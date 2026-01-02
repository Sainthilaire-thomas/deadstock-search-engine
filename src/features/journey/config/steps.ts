/**
 * Configuration des 9 étapes du parcours designer
 */

import {
  Lightbulb,
  Palette,
  PenTool,
  Calculator,
  Search,
  CheckCircle,
  ShoppingCart,
  Factory,
  Leaf,
} from "lucide-react";
import type { DesignJourneyStep } from "../domain/types";

/**
 * Les 9 étapes du parcours designer textile
 * 
 * MVP (Phase 1) : Étapes 1, 3, 4, 5, 6, 7
 * Phase 2+ : Étapes 2, 8, 9
 */
export const DESIGNER_JOURNEY_STEPS: DesignJourneyStep[] = [
  // ========================================
  // PHASE CONCEPTION
  // ========================================
  {
    id: "idea",
    order: 1,
    title: "Idée",
    description: "Définir le concept de votre projet textile",
    icon: Lightbulb,
    path: "/projects/new",
    phase: "conception",
    availableInMVP: true,
    emoji: "💡",
  },
  {
    id: "inspiration",
    order: 2,
    title: "Inspiration",
    description: "Créer des mood boards et palettes de couleurs",
    icon: Palette,
    path: "/tools/mood-board",
    phase: "conception",
    availableInMVP: false, // Phase 2
    emoji: "🎨",
  },
  {
    id: "design",
    order: 3,
    title: "Design",
    description: "Définir le patron et le type de vêtement",
    icon: PenTool,
    path: "/projects",
    phase: "conception",
    availableInMVP: true,
    emoji: "✏️",
  },

  // ========================================
  // PHASE PRÉPARATION
  // ========================================
  {
    id: "calculation",
    order: 4,
    title: "Calcul",
    description: "Calculer le métrage de tissu nécessaire",
    icon: Calculator,
    path: "/tools/yardage-calculator",
    phase: "preparation",
    availableInMVP: true,
    emoji: "📏",
  },
  {
    id: "sourcing",
    order: 5,
    title: "Sourcing",
    description: "Rechercher des tissus deadstock adaptés",
    icon: Search,
    path: "/search",
    phase: "preparation",
    availableInMVP: true,
    emoji: "🔍",
  },
  {
    id: "validation",
    order: 6,
    title: "Validation",
    description: "Vérifier les caractéristiques des textiles",
    icon: CheckCircle,
    path: "/favorites",
    phase: "preparation",
    availableInMVP: true,
    emoji: "✅",
  },

  // ========================================
  // PHASE EXÉCUTION
  // ========================================
  {
    id: "purchase",
    order: 7,
    title: "Achat",
    description: "Commander les tissus sélectionnés",
    icon: ShoppingCart,
    path: "/favorites", // Redirection vers sources externes
    phase: "execution",
    availableInMVP: true,
    emoji: "🛒",
  },
  {
    id: "production",
    order: 8,
    title: "Production",
    description: "Suivre l'avancement de la production",
    icon: Factory,
    path: "/projects/production",
    phase: "execution",
    availableInMVP: false, // Phase 4
    emoji: "🏭",
  },
  {
    id: "impact",
    order: 9,
    title: "Impact",
    description: "Mesurer CO2 et eau économisés",
    icon: Leaf,
    path: "/projects/impact",
    phase: "execution",
    availableInMVP: false, // Phase 5
    emoji: "🌱",
  },
];

/**
 * Obtenir une étape par son ID
 */
export function getStepById(stepId: string): DesignJourneyStep | undefined {
  return DESIGNER_JOURNEY_STEPS.find((step) => step.id === stepId);
}

/**
 * Obtenir une étape par son path
 */
export function getStepByPath(path: string): DesignJourneyStep | undefined {
  return DESIGNER_JOURNEY_STEPS.find((step) => path.startsWith(step.path));
}

/**
 * Obtenir toutes les étapes MVP
 */
export function getMVPSteps(): DesignJourneyStep[] {
  return DESIGNER_JOURNEY_STEPS.filter((step) => step.availableInMVP);
}

/**
 * Obtenir les étapes par phase
 */
export function getStepsByPhase(phase: DesignJourneyStep["phase"]): DesignJourneyStep[] {
  return DESIGNER_JOURNEY_STEPS.filter((step) => step.phase === phase);
}

/**
 * Labels des phases pour UI
 */
export const PHASE_LABELS: Record<DesignJourneyStep["phase"], string> = {
  conception: "Conception",
  preparation: "Préparation",
  execution: "Exécution",
  future: "Prochainement",
};
