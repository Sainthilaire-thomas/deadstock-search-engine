/**
 * Configuration des 3 phases du parcours designer
 * VERSION 2.0 - Journey comme vue alternative du Board
 */

import {
  Lightbulb,
  Calculator,
  ShoppingCart,
  Palette,
  Scissors,
  User,
  Image,
  FileText,
  PenTool,
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

export type PhaseId = "conception" | "preparation" | "execution";

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
  palette: {
    type: "palette",
    label: "Palette",
    labelPlural: "Palettes",
    icon: Palette,
    emoji: "🎨",
  },
  pattern: {
    type: "pattern",
    label: "Patron",
    labelPlural: "Patrons",
    icon: Scissors,
    emoji: "✂️",
  },
  silhouette: {
    type: "silhouette",
    label: "Silhouette",
    labelPlural: "Silhouettes",
    icon: User,
    emoji: "👤",
  },
  inspiration: {
    type: "inspiration",
    label: "Inspiration",
    labelPlural: "Inspirations",
    icon: Image,
    emoji: "📷",
  },
  pdf: {
    type: "pdf",
    label: "Document",
    labelPlural: "Documents",
    icon: FileText,
    emoji: "📄",
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
};

// ============================================
// JOURNEY PHASES (3 phases)
// ============================================

export const JOURNEY_PHASES: JourneyPhase[] = [
  {
    id: "conception",
    title: "Conception",
    icon: Lightbulb,
    emoji: "💡",
    elementTypes: [
      ELEMENT_TYPE_CONFIGS.palette,
      ELEMENT_TYPE_CONFIGS.pattern,
      ELEMENT_TYPE_CONFIGS.silhouette,
      ELEMENT_TYPE_CONFIGS.inspiration,
      ELEMENT_TYPE_CONFIGS.pdf,
    ],
  },
  {
    id: "preparation",
    title: "Préparation",
    icon: Calculator,
    emoji: "📏",
    elementTypes: [
      ELEMENT_TYPE_CONFIGS.calculation,
      ELEMENT_TYPE_CONFIGS.textile,
      ELEMENT_TYPE_CONFIGS.note,
    ],
  },
  {
    id: "execution",
    title: "Exécution",
    icon: ShoppingCart,
    emoji: "🛒",
    elementTypes: [
      ELEMENT_TYPE_CONFIGS.video,
      ELEMENT_TYPE_CONFIGS.link,
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
  conception: "Conception",
  preparation: "Préparation",
  execution: "Exécution",
};
