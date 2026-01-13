// src/features/boards/components/ConstraintToggleButton.tsx
// Sprint B3 - Bouton sobre pour activer/désactiver une contrainte de recherche

'use client';

import { Search } from 'lucide-react';
import { useContextualSearchPanel } from '../context/ContextualSearchContext';

interface ConstraintToggleButtonProps {
  /** ID de l'élément source */
  elementId: string;
/** Callback pour activer la contrainte (appelé seulement si pas déjà actif) */
  onActivate: (e: React.MouseEvent) => void;
  /** Position du bouton */
  position?: 'top-right' | 'bottom-right' | 'inline';
  /** Taille */
  size?: 'sm' | 'md';
  /** Classes additionnelles */
  className?: string;
}

export function ConstraintToggleButton({
  elementId,
  onActivate,
  position = 'top-right',
  size = 'sm',
  className = '',
}: ConstraintToggleButtonProps) {
  const { isElementActive, removeConstraint } = useContextualSearchPanel();
  
  const isActive = isElementActive(elementId);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isActive) {
      removeConstraint(elementId);
    } else {
        onActivate(e);
    }
  };
  
  // Styles selon la position
  const positionClasses = {
    'top-right': 'absolute top-1 right-1',
    'bottom-right': 'absolute bottom-1 right-1',
    'inline': '',
  }[position];
  
  // Styles selon la taille
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
  }[size];
  
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  
  return (
    <button
      onClick={handleClick}
      className={`
        ${positionClasses}
        ${sizeClasses}
        flex items-center justify-center
        rounded-md
        transition-all duration-150
        ${isActive
          ? 'bg-blue-500 text-white shadow-sm'
          : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
        }
        ${className}
      `}
      title={isActive ? 'Retirer des contraintes' : 'Utiliser comme contrainte de recherche'}
    >
      <Search className={iconSize} strokeWidth={isActive ? 2.5 : 1.5} />
    </button>
  );
}

// ============================================================================
// Badge indicateur (pour afficher sur l'élément quand actif)
// ============================================================================

interface ConstraintActiveBadgeProps {
  elementId: string;
  position?: 'top-left' | 'top-right';
}

export function ConstraintActiveBadge({
  elementId,
  position = 'top-left',
}: ConstraintActiveBadgeProps) {
  const { isElementActive } = useContextualSearchPanel();
  
  if (!isElementActive(elementId)) {
    return null;
  }
  
  const positionClasses = {
    'top-left': 'absolute -top-1 -left-1',
    'top-right': 'absolute -top-1 -right-1',
  }[position];
  
  return (
    <div
      className={`
        ${positionClasses}
        w-3 h-3
        bg-blue-500
        rounded-full
        border-2 border-white dark:border-gray-900
        shadow-sm
      `}
      title="Contrainte active"
    />
  );
}
