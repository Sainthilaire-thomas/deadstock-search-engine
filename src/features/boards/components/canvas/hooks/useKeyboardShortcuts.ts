// src/features/boards/components/canvas/hooks/useKeyboardShortcuts.ts
// Hook pour les raccourcis clavier du board
// UB-5: Adapté pour architecture unifiée (childBoards au lieu de zones)

import { useEffect, useCallback } from 'react';

export interface UseKeyboardShortcutsProps {
  selectedElementIds: string[];
  selectedChildBoardId: string | null;
  isEditing: boolean;
  removeElement: (id: string) => void;
  removeChildBoard: (id: string) => void;
  clearSelection: () => void;
  onEscape?: () => void;
  // Deprecated aliases for backward compatibility
  selectedZoneId?: string | null;
  removeZone?: (id: string) => void;
}

export function useKeyboardShortcuts({
  selectedElementIds,
  selectedChildBoardId,
  isEditing,
  removeElement,
  removeChildBoard,
  clearSelection,
  onEscape,
  // Deprecated aliases
  selectedZoneId,
  removeZone,
}: UseKeyboardShortcutsProps): void {
  // Support both new and deprecated names
  const actualSelectedChildBoardId = selectedChildBoardId ?? selectedZoneId ?? null;
  const actualRemoveChildBoard = removeChildBoard ?? removeZone ?? (() => {});

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
      if (actualSelectedChildBoardId) {
        actualRemoveChildBoard(actualSelectedChildBoardId);
      }
    }

    if (e.key === 'Escape') {
      clearSelection();
      onEscape?.();
    }
  }, [selectedElementIds, actualSelectedChildBoardId, isEditing, removeElement, actualRemoveChildBoard, clearSelection, onEscape]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
