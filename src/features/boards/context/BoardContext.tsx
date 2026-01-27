// src/features/boards/context/BoardContext.tsx
// VERSION ÉPURÉE - Sprint 1 avec viewMode

'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import type {
  BoardWithDetails,
  BoardElement,
  BoardZone,
  CreateElementInput,
  UpdateElementInput,
  CreateZoneInput,
  UpdateZoneInput,
  ActionResult,
} from '../domain/types';
import {
  addElementAction,
  updateElementAction,
  moveElementAction,
  removeElementAction,
  addNoteToBoard,
  addPaletteToBoard,
  assignElementToZoneAction,
} from '../actions/elementActions';
import {
  updateBoardAction,
} from '../actions/boardActions';
import {
  createZoneAction,
  updateZoneAction,
  moveZoneAction,
  resizeZoneAction,
  deleteZoneAction,
  addZoneToBoard,
} from '../actions/zoneActions';

// ============================================
// VIEW MODE TYPE
// ============================================

export type ViewMode = 'inspiration' | 'project';

// ============================================
// STATE TYPE
// ============================================

interface BoardState {
  board: BoardWithDetails | null;
  elements: BoardElement[];
  zones: BoardZone[];
  selectedElementIds: string[];
  selectedZoneId: string | null;
  isDragging: boolean;
  isLoading: boolean;
  error: string | null;
  // NEW: View mode
  viewMode: ViewMode;
}

// ============================================
// ACTIONS
// ============================================

type BoardAction =
  | { type: 'SET_BOARD'; payload: BoardWithDetails }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_ELEMENT'; payload: BoardElement }
  | { type: 'UPDATE_ELEMENT'; payload: BoardElement }
  | { type: 'MOVE_ELEMENT'; payload: { id: string; x: number; y: number } }
  | { type: 'REMOVE_ELEMENT'; payload: string }
  | { type: 'ADD_ZONE'; payload: BoardZone }
  | { type: 'UPDATE_ZONE'; payload: BoardZone }
  | { type: 'MOVE_ZONE'; payload: { id: string; x: number; y: number } }
  | { type: 'REMOVE_ZONE'; payload: string }
  | { type: 'SELECT_ELEMENTS'; payload: string[] }
  | { type: 'SELECT_ZONE'; payload: string | null }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'UPDATE_BOARD_NAME'; payload: string }
  | { type: 'RESIZE_ZONE'; payload: { id: string; width: number; height: number } }
  | { type: 'CRYSTALLIZE_ZONE'; payload: { id: string; projectId: string; crystallizedAt: Date } }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'ASSIGN_ELEMENT_TO_ZONE'; payload: { elementId: string; zoneId: string | null } };  // ← AJOUTER

// ============================================
// REDUCER
// ============================================

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'SET_BOARD':
      return {
        ...state,
        board: action.payload,
        elements: action.payload.elements,
        zones: action.payload.zones,
        isLoading: false,
        error: null,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'ADD_ELEMENT':
      return {
        ...state,
        elements: [...state.elements, action.payload],
        isLoading: false,
      };

    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.payload.id ? action.payload : el
        ),
      };

    case 'MOVE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.payload.id
            ? { ...el, positionX: action.payload.x, positionY: action.payload.y }
            : el
        ),
      };

    case 'REMOVE_ELEMENT':
      return {
        ...state,
        elements: state.elements.filter((el) => el.id !== action.payload),
        selectedElementIds: state.selectedElementIds.filter(
          (id) => id !== action.payload
        ),
      };

    case 'ADD_ZONE':
      return {
        ...state,
        zones: [...state.zones, action.payload],
        isLoading: false,
      };

    case 'UPDATE_ZONE':
      return {
        ...state,
        zones: state.zones.map((z) =>
          z.id === action.payload.id ? action.payload : z
        ),
      };

    case 'MOVE_ZONE':
      return {
        ...state,
        zones: state.zones.map((z) =>
          z.id === action.payload.id
            ? { ...z, positionX: action.payload.x, positionY: action.payload.y }
            : z
        ),
      };

    case 'RESIZE_ZONE':
      return {
        ...state,
        zones: state.zones.map((z) =>
          z.id === action.payload.id
            ? { ...z, width: action.payload.width, height: action.payload.height }
            : z
        ),
      };

    case 'CRYSTALLIZE_ZONE':
      return {
        ...state,
        zones: state.zones.map((z) =>
          z.id === action.payload.id
            ? {
                ...z,
                crystallizedAt: action.payload.crystallizedAt,
                linkedProjectId: action.payload.projectId,
              }
            : z
        ),
      };

    case 'REMOVE_ZONE':
      return {
        ...state,
        zones: state.zones.filter((z) => z.id !== action.payload),
        selectedZoneId: state.selectedZoneId === action.payload ? null : state.selectedZoneId,
      };

    case 'SELECT_ELEMENTS':
      return {
        ...state,
        selectedElementIds: action.payload,
        selectedZoneId: null, // Deselect zone when selecting elements
      };

    case 'SELECT_ZONE':
      return {
        ...state,
        selectedZoneId: action.payload,
        selectedElementIds: [], // Deselect elements when selecting zone
      };

    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload };

    case 'UPDATE_BOARD_NAME':
      return {
        ...state,
        board: state.board
          ? { ...state.board, name: action.payload }
          : null,
      };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

      case 'ASSIGN_ELEMENT_TO_ZONE':
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.payload.elementId
            ? { ...el, zoneId: action.payload.zoneId }
            : el
        ),
      };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };


    default:
      return state;
  }
}

// ============================================
// CONTEXT TYPE
// ============================================

interface BoardContextValue extends BoardState {
  // Board actions
  updateBoardName: (name: string) => Promise<void>;

  // Element actions
  addElement: (input: Omit<CreateElementInput, 'boardId'>) => Promise<void>;
  updateElement: (id: string, input: UpdateElementInput) => Promise<void>;
  moveElement: (id: string, x: number, y: number) => Promise<void>;
    moveElementLocal: (id: string, x: number, y: number) => void;      // ✅ NEW
  saveElementPosition: (id: string, x: number, y: number) => Promise<void>; // ✅ NEW
  removeElement: (id: string) => Promise<void>;
  assignElementToZone: (elementId: string, zoneId: string | null) => Promise<void>;  // ← AJOUTER

  // Quick add helpers
  addNote: (position?: { x: number; y: number }) => Promise<void>;
  addPalette: (colors: string[], position?: { x: number; y: number }) => Promise<void>;

  // Zone actions
  addZone: (name?: string, position?: { x: number; y: number }) => Promise<void>;
  updateZone: (id: string, input: UpdateZoneInput) => Promise<void>;
  moveZone: (id: string, x: number, y: number) => Promise<void>;
  moveZoneLocal: (id: string, x: number, y: number) => void;    
   saveZonePosition: (id: string, x: number, y: number) => Promise<void>; 
  removeZone: (id: string) => Promise<void>;
  resizeZone: (id: string, width: number, height: number) => Promise<void>;
  resizeZoneLocal: (id: string, width: number, height: number) => void; // ✅ NEW
  saveZoneSize: (id: string, width: number, height: number) => Promise<void>; // ✅ NEW
  crystallizeZone: (id: string, projectId: string) => void;

  // Selection
  selectElements: (ids: string[]) => void;
  clearSelection: () => void;
  toggleElementSelection: (id: string) => void;
  selectZone: (id: string | null) => void;

  // Drag state
  setDragging: (isDragging: boolean) => void;

  // NEW: View mode
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

// ============================================
// CONTEXT
// ============================================

const BoardContext = createContext<BoardContextValue | null>(null);

// ============================================
// LOCAL STORAGE KEY
// ============================================

const VIEW_MODE_STORAGE_KEY = 'deadstock-board-view-mode';

// ============================================
// PROVIDER
// ============================================

interface BoardProviderProps {
  children: ReactNode;
  initialBoard: BoardWithDetails;
}

export function BoardProvider({ children, initialBoard }: BoardProviderProps) {
  // Get initial view mode from localStorage
  const getInitialViewMode = (): ViewMode => {
    if (typeof window === 'undefined') return 'inspiration';
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return stored === 'project' ? 'project' : 'inspiration';
  };

  const [state, dispatch] = useReducer(boardReducer, {
    board: initialBoard,
    elements: initialBoard.elements,
    zones: initialBoard.zones,
    selectedElementIds: [],
    selectedZoneId: null,
    isDragging: false,
    isLoading: false,
    error: null,
    viewMode: 'inspiration', // Default, will be updated by useEffect
  });

  // Load view mode from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (stored === 'project') {
      dispatch({ type: 'SET_VIEW_MODE', payload: 'project' });
    }
  }, []);

  const boardId = initialBoard.id;

  // ============================================
  // BOARD ACTIONS
  // ============================================

  const updateBoardName = useCallback(async (name: string) => {
    dispatch({ type: 'UPDATE_BOARD_NAME', payload: name });
    const result = await updateBoardAction(boardId, { name });
    if (!result.success) {
      dispatch({ type: 'SET_ERROR', payload: result.error || 'Erreur' });
    }
  }, [boardId]);

  // ============================================
  // ELEMENT ACTIONS
  // ============================================

  const addElement = useCallback(async (input: Omit<CreateElementInput, 'boardId'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const result = await addElementAction({ ...input, boardId });
    if (result.success && result.data) {
      dispatch({ type: 'ADD_ELEMENT', payload: result.data });
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error || 'Erreur' });
    }
  }, [boardId]);

  const updateElement = useCallback(async (id: string, input: UpdateElementInput) => {
    const result = await updateElementAction(id, input);
    if (result.success && result.data) {
      dispatch({ type: 'UPDATE_ELEMENT', payload: result.data });
    }
  }, []);

  const moveElement = useCallback(async (id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_ELEMENT', payload: { id, x, y } });
    moveElementAction(id, { positionX: x, positionY: y });
  }, []);

  // ✅ NOUVEAU : moveElement LOCAL uniquement (pas de POST)
const moveElementLocal = useCallback((id: string, x: number, y: number) => {
  dispatch({ type: 'MOVE_ELEMENT', payload: { id, x, y } });
}, []);

// ✅ NOUVEAU : saveElementPosition (POST uniquement, pour mouseUp)
const saveElementPosition = useCallback(async (id: string, x: number, y: number) => {
  await moveElementAction(id, { positionX: x, positionY: y });
}, []);

const removeElement = useCallback(async (id: string) => {
    dispatch({ type: 'REMOVE_ELEMENT', payload: id });
    await removeElementAction(id);
  }, []);

  // ============================================
  // ASSIGN ELEMENT TO ZONE
  // ============================================

  const assignElementToZone = useCallback(async (elementId: string, zoneId: string | null) => {
    // Mise à jour optimiste du state local
    dispatch({ type: 'ASSIGN_ELEMENT_TO_ZONE', payload: { elementId, zoneId } });
    
    // Persistance en base
    const result = await assignElementToZoneAction(elementId, zoneId);
    if (!result.success) {
      dispatch({ type: 'SET_ERROR', payload: result.error || 'Erreur' });
    }
  }, []);

  
  // ============================================
  // QUICK ADD HELPERS
  // ============================================

  const addNote = useCallback(async (position?: { x: number; y: number }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const result = await addNoteToBoard(boardId, '', position);
    if (result.success && result.data) {
      dispatch({ type: 'ADD_ELEMENT', payload: result.data });
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error || 'Erreur' });
    }
  }, [boardId]);

  const addPalette = useCallback(async (colors: string[], position?: { x: number; y: number }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const result = await addPaletteToBoard(boardId, colors, undefined, position);
    if (result.success && result.data) {
      dispatch({ type: 'ADD_ELEMENT', payload: result.data });
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error || 'Erreur' });
    }
  }, [boardId]);

  // ============================================
  // ZONE ACTIONS
  // ============================================

  const addZone = useCallback(async (name?: string, position?: { x: number; y: number }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const result = await addZoneToBoard(boardId, name || 'Nouvelle zone', position);
    if (result.success && result.data) {
      dispatch({ type: 'ADD_ZONE', payload: result.data });
      // Switch to project mode when adding a zone
      dispatch({ type: 'SET_VIEW_MODE', payload: 'project' });
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, 'project');
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error || 'Erreur' });
    }
  }, [boardId]);

  const updateZoneHandler = useCallback(async (id: string, input: UpdateZoneInput) => {
    const result = await updateZoneAction(id, input);
    if (result.success && result.data) {
      dispatch({ type: 'UPDATE_ZONE', payload: result.data });
    }
  }, []);

  const moveZone = useCallback(async (id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_ZONE', payload: { id, x, y } });
    moveZoneAction(id, x, y);
  }, []);

  // ✅ NOUVEAU : moveZone LOCAL uniquement
const moveZoneLocal = useCallback((id: string, x: number, y: number) => {
  dispatch({ type: 'MOVE_ZONE', payload: { id, x, y } });
}, []);

// ✅ NOUVEAU : saveZonePosition
const saveZonePosition = useCallback(async (id: string, x: number, y: number) => {
  await moveZoneAction(id, x, y);
}, []);

  const resizeZone = useCallback(async (id: string, width: number, height: number) => {
    dispatch({ type: 'RESIZE_ZONE', payload: { id, width, height } });
    resizeZoneAction(id, width, height);
  }, []);

  // ✅ NOUVEAU : resizeZone LOCAL uniquement
const resizeZoneLocal = useCallback((id: string, width: number, height: number) => {
  dispatch({ type: 'RESIZE_ZONE', payload: { id, width, height } });
}, []);

// ✅ NOUVEAU : saveZoneSize
const saveZoneSize = useCallback(async (id: string, width: number, height: number) => {
  await resizeZoneAction(id, width, height);
}, []);

  const crystallizeZone = useCallback((id: string, projectId: string) => {
    dispatch({
      type: 'CRYSTALLIZE_ZONE',
      payload: { id, projectId, crystallizedAt: new Date() }
    });
  }, []);

  const removeZone = useCallback(async (id: string) => {
    dispatch({ type: 'REMOVE_ZONE', payload: id });
    await deleteZoneAction(id);
  }, []);

  // ============================================
  // SELECTION
  // ============================================

  const selectElements = useCallback((ids: string[]) => {
    dispatch({ type: 'SELECT_ELEMENTS', payload: ids });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'SELECT_ELEMENTS', payload: [] });
    dispatch({ type: 'SELECT_ZONE', payload: null });
  }, []);

  const toggleElementSelection = useCallback((id: string) => {
    dispatch({
      type: 'SELECT_ELEMENTS',
      payload: state.selectedElementIds.includes(id)
        ? state.selectedElementIds.filter((i) => i !== id)
        : [...state.selectedElementIds, id],
    });
  }, [state.selectedElementIds]);

  const selectZone = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_ZONE', payload: id });
  }, []);

  // ============================================
  // DRAG STATE
  // ============================================

  const setDragging = useCallback((isDragging: boolean) => {
    dispatch({ type: 'SET_DRAGGING', payload: isDragging });
  }, []);

  // ============================================
  // VIEW MODE
  // ============================================

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  }, []);

  const toggleViewMode = useCallback(() => {
    const newMode = state.viewMode === 'inspiration' ? 'project' : 'inspiration';
    dispatch({ type: 'SET_VIEW_MODE', payload: newMode });
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, newMode);
  }, [state.viewMode]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

const value: BoardContextValue = {
    ...state,
    updateBoardName,
    addElement,
    updateElement,
    moveElement,
    moveElementLocal,      // ✅ NEW
    saveElementPosition,   // ✅ NEW
    removeElement,
    assignElementToZone,
    addNote,
    addPalette,
    addZone,
    updateZone: updateZoneHandler,
    moveZone,
    moveZoneLocal,         // ✅ NEW
    saveZonePosition,      // ✅ NEW
    removeZone,
    resizeZone,
    resizeZoneLocal,       // ✅ NEW
    saveZoneSize,          // ✅ NEW
    crystallizeZone,
    selectElements,
    clearSelection,
    toggleElementSelection,
    selectZone,
    setDragging,
    setViewMode,
    toggleViewMode,
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
}
