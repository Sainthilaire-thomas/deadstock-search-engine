// src/features/boards/context/BoardContext.tsx

'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
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
  | { type: 'RESIZE_ZONE'; payload: { id: string; width: number; height: number } };
  

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
  removeElement: (id: string) => Promise<void>;
  

  // Quick add helpers
  addNote: (position?: { x: number; y: number }) => Promise<void>;
  addPalette: (colors: string[], position?: { x: number; y: number }) => Promise<void>;

  // Zone actions
  addZone: (name?: string, position?: { x: number; y: number }) => Promise<void>;
  updateZone: (id: string, input: UpdateZoneInput) => Promise<void>;
  moveZone: (id: string, x: number, y: number) => Promise<void>;
  removeZone: (id: string) => Promise<void>;
   resizeZone: (id: string, width: number, height: number) => Promise<void>;

  // Selection
  selectElements: (ids: string[]) => void;
  clearSelection: () => void;
  toggleElementSelection: (id: string) => void;
  selectZone: (id: string | null) => void;

  // Drag state
  setDragging: (isDragging: boolean) => void;
}

// ============================================
// CONTEXT
// ============================================

const BoardContext = createContext<BoardContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

interface BoardProviderProps {
  children: ReactNode;
  initialBoard: BoardWithDetails;
}

export function BoardProvider({ children, initialBoard }: BoardProviderProps) {
  const [state, dispatch] = useReducer(boardReducer, {
    board: initialBoard,
    elements: initialBoard.elements,
    zones: initialBoard.zones,
    selectedElementIds: [],
    selectedZoneId: null,
    isDragging: false,
    isLoading: false,
    error: null,
  });

  const boardId = initialBoard.id;

  // ============================================
  // BOARD ACTIONS
  // ============================================

  const updateBoardName = useCallback(async (name: string) => {
    // Optimistic update
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
    // Optimistic update for smooth dragging
    dispatch({ type: 'MOVE_ELEMENT', payload: { id, x, y } });

    // Persist to database (fire and forget for performance)
    moveElementAction(id, { positionX: x, positionY: y });
  }, []);

  const removeElement = useCallback(async (id: string) => {
    // Optimistic update
    dispatch({ type: 'REMOVE_ELEMENT', payload: id });

    await removeElementAction(id);
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
    // Optimistic update for smooth dragging
    dispatch({ type: 'MOVE_ZONE', payload: { id, x, y } });

    // Persist to database (fire and forget for performance)
    moveZoneAction(id, x, y);
  }, []);

  const resizeZone = useCallback(async (id: string, width: number, height: number) => {
    // Optimistic update for smooth resizing
    dispatch({ type: 'RESIZE_ZONE', payload: { id, width, height } });

    // Persist to database (fire and forget for performance)
    resizeZoneAction(id, width, height);
  }, []);

  const removeZone = useCallback(async (id: string) => {
    // Optimistic update
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
  // CONTEXT VALUE
  // ============================================

  const value: BoardContextValue = {
    ...state,
    updateBoardName,
    addElement,
    updateElement,
    moveElement,
    removeElement,
    addNote,
    addPalette,
    addZone,
    updateZone: updateZoneHandler,
    moveZone,
    removeZone,
    resizeZone,
    selectElements,
    clearSelection,
    toggleElementSelection,
    selectZone,
    setDragging,
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
