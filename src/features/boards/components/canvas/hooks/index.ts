// src/features/boards/components/canvas/hooks/index.ts
// Exports des hooks du canvas
// UB-5: useChildBoardDrag remplace useZoneDrag

export { useElementDrag } from './useElementDrag';
export { useChildBoardDrag, useZoneDrag } from './useZoneDrag';
export { useChildBoardResize, useZoneResize, type ResizeHandle } from './useZoneResize';
export { useKeyboardShortcuts } from './useKeyboardShortcuts';
