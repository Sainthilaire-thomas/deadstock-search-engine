/**
 * Configuration des 3 phases du parcours designer
 * VERSION 3.0 - Réorganisation : Mood → Conception → Exécution
 */

import {
  Lightbulb,
  Sparkles,
  PenTool,
  Rocket,
  Palette,
  Scissors,
  User,
  Image,
  FileText,
  Ruler,
  Search,
  StickyNote,
  Video,
  Link,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ElementType } from "@/features/boards/domain/types";

// ============================================
// TYPES
// ============================================

export type PhaseId = "mood" | "conception" | "execution";

export interface ElementTypeConfig {
  type: ElementType;
  label: string;
  labelPlural: string;
  icon: LucideIcon;
  emoji: string;
}

export interface JourneyPhase {
  id: PhaseId;
  title: string;
  icon: LucideIcon;
  emoji: string;
  elementTypes: ElementTypeConfig[];
}

// ============================================
// ELEMENT TYPE CONFIGURATIONS
// ============================================

export const ELEMENT_TYPE_CONFIGS: Record<ElementType, ElementTypeConfig> = {
  inspiration: {
    type: "inspiration",
    label: "Inspiration",
    labelPlural: "Inspirations",
    icon: Image,
    emoji: "📷",
  },
  palette: {
    type: "palette",
    label: "Palette",
    labelPlural: "Palettes",
    icon: Palette,
    emoji: "🎨",
  },
  silhouette: {
    type: "silhouette",
    label: "Silhouette",
    labelPlural: "Silhouettes",
    icon: User,
    emoji: "👤",
  },
  video: {
    type: "video",
    label: "Vidéo",
    labelPlural: "Vidéos",
    icon: Video,
    emoji: "🎬",
  },
  link: {
    type: "link",
    label: "Lien",
    labelPlural: "Liens",
    icon: Link,
    emoji: "🔗",
  },
  pdf: {
    type: "pdf",
    label: "Document",
    labelPlural: "Documents",
    icon: FileText,
    emoji: "📄",
  },
  pattern: {
    type: "pattern",
    label: "Patron",
    labelPlural: "Patrons",
    icon: Scissors,
    emoji: "✂️",
  },
  calculation: {
    type: "calculation",
    label: "Calcul",
    labelPlural: "Calculs",
    icon: Ruler,
    emoji: "📐",
  },
  textile: {
    type: "textile",
    label: "Tissu",
    labelPlural: "Tissus",
    icon: Search,
    emoji: "🧵",
  },
  note: {
    type: "note",
    label: "Note",
    labelPlural: "Notes",
    icon: StickyNote,
    emoji: "📝",
  },
};

// ============================================
// JOURNEY PHASES (3 phases)
// ============================================

export const JOURNEY_PHASES: JourneyPhase[] = [
  {
    id: "mood",
    title: "Mood",
    icon: Sparkles,
    emoji: "✨",
    elementTypes: [
      ELEMENT_TYPE_CONFIGS.inspiration,
      ELEMENT_TYPE_CONFIGS.palette,
      ELEMENT_TYPE_CONFIGS.silhouette,
      ELEMENT_TYPE_CONFIGS.video,
      ELEMENT_TYPE_CONFIGS.link,
      ELEMENT_TYPE_CONFIGS.pdf,
      ELEMENT_TYPE_CONFIGS.note,
    ],
  },
  {
    id: "conception",
    title: "Conception",
    icon: PenTool,
    emoji: "✏️",
    elementTypes: [
      ELEMENT_TYPE_CONFIGS.pattern,
      ELEMENT_TYPE_CONFIGS.calculation,
      ELEMENT_TYPE_CONFIGS.textile,
    ],
  },
  {
    id: "execution",
    title: "Exécution",
    icon: Rocket,
    emoji: "🚀",
    elementTypes: [
      // Les projets (zones cristallisées) sont gérés séparément dans JourneyNavigation
    ],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Obtenir une phase par son ID
 */
export function getPhaseById(phaseId: PhaseId): JourneyPhase | undefined {
  return JOURNEY_PHASES.find((phase) => phase.id === phaseId);
}

/**
 * Obtenir la phase d'un type d'élément
 */
export function getPhaseForElementType(elementType: ElementType): JourneyPhase | undefined {
  return JOURNEY_PHASES.find((phase) =>
    phase.elementTypes.some((et) => et.type === elementType)
  );
}

/**
 * Obtenir la config d'un type d'élément
 */
export function getElementTypeConfig(elementType: ElementType): ElementTypeConfig {
  return ELEMENT_TYPE_CONFIGS[elementType];
}

/**
 * Labels des phases pour UI
 */
export const PHASE_LABELS: Record<PhaseId, string> = {
  mood: "Mood",
  conception: "Conception",
  execution: "Exécution",
};
