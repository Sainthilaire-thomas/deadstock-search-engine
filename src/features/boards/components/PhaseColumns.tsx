// src/features/boards/components/PhaseColumns.tsx
// Sprint P2.5 - Colonnes visuelles de phase pour le canvas

'use client';

import React from 'react';
import { PHASE_ORDER, PHASE_LABELS, type PhaseId } from '../utils/autoArrange';

// ============================================
// TYPES
// ============================================

export interface PhaseBounds {
  phase: PhaseId;
  x: number;
  width: number;
  elementCount: number;
}

interface PhaseColumnsProps {
  phaseBounds: PhaseBounds[];
  canvasHeight: number;
  isVisible: boolean;
}

// ============================================
// PHASE COLORS (fond transparent)
// ============================================

const PHASE_BG_COLORS: Record<PhaseId, string> = {
  mood: 'bg-purple-500/5 dark:bg-purple-400/10',
  conception: 'bg-blue-500/5 dark:bg-blue-400/10',
  execution: 'bg-green-500/5 dark:bg-green-400/10',
};

const PHASE_BORDER_COLORS: Record<PhaseId, string> = {
  mood: 'border-purple-300/50 dark:border-purple-600/30',
  conception: 'border-blue-300/50 dark:border-blue-600/30',
  execution: 'border-green-300/50 dark:border-green-600/30',
};

const PHASE_TEXT_COLORS: Record<PhaseId, string> = {
  mood: 'text-purple-600/70 dark:text-purple-400/70',
  conception: 'text-blue-600/70 dark:text-blue-400/70',
  execution: 'text-green-600/70 dark:text-green-400/70',
};

const PHASE_ICONS: Record<PhaseId, string> = {
  mood: '🎨',
  conception: '📐',
  execution: '🚀',
};

// ============================================
// COMPONENT
// ============================================

export const PhaseColumns = React.memo(function PhaseColumns({
  phaseBounds,
  canvasHeight,
  isVisible,
}: PhaseColumnsProps) {
  if (!isVisible || phaseBounds.length === 0) {
    return null;
  }

  return (
    <>
      {phaseBounds.map(({ phase, x, width, elementCount }) => (
        <div
          key={phase}
          className={`
            absolute top-0 pointer-events-none
            ${PHASE_BG_COLORS[phase]}
            border-r ${PHASE_BORDER_COLORS[phase]}
            transition-opacity duration-300
          `}
          style={{
            left: x,
            width: width,
            height: canvasHeight,
            zIndex: 0,
          }}
        >
          {/* Header de phase */}
          <div 
            className={`
              sticky top-2 mx-2 px-3 py-1.5
              rounded-lg backdrop-blur-sm
              bg-white/60 dark:bg-gray-800/60
              border ${PHASE_BORDER_COLORS[phase]}
              flex items-center gap-2
              ${PHASE_TEXT_COLORS[phase]}
              text-sm font-medium
              shadow-sm
            `}
            style={{ zIndex: 1 }}
          >
            <span>{PHASE_ICONS[phase]}</span>
            <span>{PHASE_LABELS[phase]}</span>
            <span className="ml-auto text-xs opacity-70">
              {elementCount} {phase === 'execution' ? (elementCount > 1 ? 'zones' : 'zone') : (elementCount > 1 ? 'éléments' : 'élément')}
            </span>
          </div>
        </div>
      ))}
    </>
  );
});
