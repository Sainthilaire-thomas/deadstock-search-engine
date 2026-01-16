// src/features/boards/components/canvas/hooks/useKeyboardShortcuts.ts
// Hook pour les raccourcis clavier du board

import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsProps {
  selectedElementIds: string[];
  selectedZoneId: string | null;
  isEditing: boolean;
  removeElement: (id: string) => void;
  removeZone: (id: string) => void;
  clearSelection: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts({
  selectedElementIds,
  selectedZoneId,
  isEditing,
  removeElement,
  removeZone,
  clearSelection,
  onEscape,
}: UseKeyboardShortcutsProps): void {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ne pas intercepter si on est en mode édition
    if (isEditing) return;

    // Ne pas intercepter si on est dans un input/textarea
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();

      if (selectedElementIds.length > 0) {
        selectedElementIds.forEach(id => removeElement(id));
      }

      if (selectedZoneId) {
        removeZone(selectedZoneId);
      }
    }

    if (e.key === 'Escape') {
      clearSelection();
      onEscape?.();
    }
  }, [selectedElementIds, selectedZoneId, isEditing, removeElement, removeZone, clearSelection, onEscape]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
