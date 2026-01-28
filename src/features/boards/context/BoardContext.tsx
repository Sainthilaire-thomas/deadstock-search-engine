// src/features/boards/context/BoardContext.tsx
// UPDATED: UB-4 - Unified Boards Architecture (ADR-032)
// zones → childBoards

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
  Board,
  CreateElementInput,
  UpdateElementInput,
  CreateBoardInput,
  UpdateBoardInput,
} from '../domain/types';
import {
  addElementAction,
  updateElementAction,
  moveElementAction,
  removeElementAction,
  addNoteToBoard,
  addPaletteToBoard,
  moveElementToBoardAction,
} from '../actions/elementActions';
import {
  updateBoardAction,
  createChildBoardAction,
  moveChildBoardAction,
  resizeChildBoardAction,
  deleteChildBoardAction,
} from '../actions/boardActions';

// ============================================
// VIEW MODE TYPE
// ============================================

export type ViewMode = 'inspiration' | 'project';

// ============================================
// STATE TYPE
// UPDATED UB-4: zones → childBoards
// ============================================

interface BoardState {
  board: BoardWithDetails | null;
  elements: BoardElement[];
  childBoards: Board[];  // UPDATED UB-4: renamed from zones
  selectedElementIds: string[];
  selectedChildBoardId: string | null;  // UPDATED UB-4: renamed from selectedZoneId
  isDragging: boolean;
  isLoading: boolean;
  error: string | null;
  viewMode: ViewMode;
}

// ============================================
// ACTIONS
// UPDATED UB-4: Zone actions → ChildBoard actions
// ============================================

type BoardAction =
  | { type: 'SET_BOARD'; payload: BoardWithDetails }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_ELEMENT'; payload: BoardElement }
  | { type: 'UPDATE_ELEMENT'; payload: BoardElement }
  | { type: 'MOVE_ELEMENT'; payload: { id: string; x: number; y: number } }
  | { type: 'REMOVE_ELEMENT'; payload: string }
  | { type: 'ADD_CHILD_BOARD'; payload: Board }  // UPDATED UB-4
  | { type: 'UPDATE_CHILD_BOARD'; payload: Board }  // UPDATED UB-4
  | { type: 'MOVE_CHILD_BOARD'; payload: { id: string; x: number; y: number } }  // UPDATED UB-4
  | { type: 'REMOVE_CHILD_BOARD'; payload: string }  // UPDATED UB-4
  | { type: 'SELECT_ELEMENTS'; payload: string[] }
  | { type: 'SELECT_CHILD_BOARD'; payload: string | null }  // UPDATED UB-4
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'UPDATE_BOARD_NAME'; payload: string }
  | { type: 'RESIZE_CHILD_BOARD'; payload: { id: string; width: number; height: number } }  // UPDATED UB-4
  | { type: 'CRYSTALLIZE_CHILD_BOARD'; payload: { id: string; projectId: string; crystallizedAt: Date } }  // UPDATED UB-4
  | { type: 'SET_VIEW_MODE'; payload: ViewMode };

// ============================================
// REDUCER
// UPDATED UB-4: Zone handling → ChildBoard handling
// ============================================

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'SET_BOARD':
      return {
        ...state,
        board: action.payload,
        elements: action.payload.elements,
        childBoards: action.payload.childBoards,  // UPDATED UB-4
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

    // UPDATED UB-4: Zone actions → ChildBoard actions
    case 'ADD_CHILD_BOARD':
      return {
        ...state,
        childBoards: [...state.childBoards, action.payload],
        isLoading: false,
      };

    case 'UPDATE_CHILD_BOARD':
      return {
        ...state,
        childBoards: state.childBoards.map((cb) =>
          cb.id === action.payload.id ? action.payload : cb
        ),
      };

    case 'MOVE_CHILD_BOARD':
      return {
        ...state,
        childBoards: state.childBoards.map((cb) =>
          cb.id === action.payload.id
            ? { ...cb, positionX: action.payload.x, positionY: action.payload.y }
            : cb
        ),
      };

    case 'RESIZE_CHILD_BOARD':
      return {
        ...state,
        childBoards: state.childBoards.map((cb) =>
          cb.id === action.payload.id
            ? { ...cb, width: action.payload.width, height: action.payload.height }
            : cb
        ),
      };

    case 'CRYSTALLIZE_CHILD_BOARD':
      return {
        ...state,
        childBoards: state.childBoards.map((cb) =>
          cb.id === action.payload.id
            ? {
                ...cb,
                crystallizedAt: action.payload.crystallizedAt,
                linkedProjectId: action.payload.projectId,
                status: 'ordered' as const,  // UPDATED UB-4: Use new status
              }
            : cb
        ),
      };

    case 'REMOVE_CHILD_BOARD':
      return {
        ...state,
        childBoards: state.childBoards.filter((cb) => cb.id !== action.payload),
        selectedChildBoardId: state.selectedChildBoardId === action.payload ? null : state.selectedChildBoardId,
      };

    case 'SELECT_ELEMENTS':
      return {
        ...state,
        selectedElementIds: action.payload,
        selectedChildBoardId: null, // Deselect child board when selecting elements
      };

    case 'SELECT_CHILD_BOARD':
      return {
        ...state,
        selectedChildBoardId: action.payload,
        selectedElementIds: [], // Deselect elements when selecting child board
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

    default:
      return state;
  }
}

// ============================================
// CONTEXT TYPE
// UPDATED UB-4: Zone methods → ChildBoard methods
// ============================================

interface BoardContextValue extends BoardState {
  // Board actions
  updateBoardName: (name: string) => Promise<void>;

  // Element actions
  addElement: (input: Omit<CreateElementInput, 'boardId'>) => Promise<void>;
  updateElement: (id: string, input: UpdateElementInput) => Promise<void>;
  moveElement: (id: string, x: number, y: number) => Promise<void>;
  moveElementLocal: (id: string, x: number, y: number) => void;
  saveElementPosition: (id: string, x: number, y: number) => Promise<void>;
  removeElementLocal: (id: string) => void;  // UB-9: sans appel DB
  removeElement: (id: string) => Promise<void>;

  // Quick add helpers
  addNote: (position?: { x: number; y: number }) => Promise<void>;
  addPalette: (colors: string[], position?: { x: number; y: number }) => Promise<void>;

  // UPDATED UB-4: Zone actions → ChildBoard actions
  addChildBoard: (name?: string, position?: { x: number; y: number }) => Promise<void>;
  updateChildBoard: (id: string, input: UpdateBoardInput) => Promise<void>;
  moveChildBoard: (id: string, x: number, y: number) => Promise<void>;
  moveChildBoardLocal: (id: string, x: number, y: number) => void;
  saveChildBoardPosition: (id: string, x: number, y: number) => Promise<void>;
  removeChildBoard: (id: string) => Promise<void>;
  resizeChildBoard: (id: string, width: number, height: number) => Promise<void>;
  resizeChildBoardLocal: (id: string, width: number, height: number) => void;
  saveChildBoardSize: (id: string, width: number, height: number) => Promise<void>;
  crystallizeChildBoard: (id: string, projectId: string) => void;

  // DEPRECATED ALIASES (for gradual migration) - remove after full migration
  zones: Board[];  // Alias for childBoards
  selectedZoneId: string | null;  // Alias for selectedChildBoardId
  addZone: (name?: string, position?: { x: number; y: number }) => Promise<void>;
  updateZone: (id: string, input: UpdateBoardInput) => Promise<void>;
  moveZone: (id: string, x: number, y: number) => Promise<void>;
  moveZoneLocal: (id: string, x: number, y: number) => void;
  saveZonePosition: (id: string, x: number, y: number) => Promise<void>;
  removeZone: (id: string) => Promise<void>;
  resizeZone: (id: string, width: number, height: number) => Promise<void>;
  resizeZoneLocal: (id: string, width: number, height: number) => void;
  saveZoneSize: (id: string, width: number, height: number) => Promise<void>;
  crystallizeZone: (id: string, projectId: string) => void;
  selectZone: (id: string | null) => void;

  // Selection
  selectElements: (ids: string[]) => void;
  clearSelection: () => void;
  toggleElementSelection: (id: string) => void;
  selectChildBoard: (id: string | null) => void;

  // Drag state
  setDragging: (isDragging: boolean) => void;

  // View mode
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
  const [state, dispatch] = useReducer(boardReducer, {
    board: initialBoard,
    elements: initialBoard.elements,
    childBoards: initialBoard.childBoards,  // UPDATED UB-4
    selectedElementIds: [],
    selectedChildBoardId: null,  // UPDATED UB-4
    isDragging: false,
    isLoading: false,
    error: null,
    viewMode: 'inspiration',
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

  const moveElementLocal = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_ELEMENT', payload: { id, x, y } });
  }, []);

  const saveElementPosition = useCallback(async (id: string, x: number, y: number) => {
    await moveElementAction(id, { positionX: x, positionY: y });
  }, []);

// UB-9: Retire un élément du state local SANS le supprimer de la DB
  // Utilisé lors du transfert vers un autre board
  const removeElementLocal = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ELEMENT', payload: id });
  }, []);

  const removeElement = useCallback(async (id: string) => {
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
  // CHILD BOARD ACTIONS (UPDATED UB-4)
  // ============================================

  const addChildBoard = useCallback(async (name?: string, position?: { x: number; y: number }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const result = await createChildBoardAction(boardId, {
      name: name || 'Nouvelle pièce',
      positionX: position?.x,
      positionY: position?.y,
    });
    if (result.success && result.data) {
      dispatch({ type: 'ADD_CHILD_BOARD', payload: result.data });
      // Switch to project mode when adding a child board
      dispatch({ type: 'SET_VIEW_MODE', payload: 'project' });
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, 'project');
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error || 'Erreur' });
    }
  }, [boardId]);

  const updateChildBoard = useCallback(async (id: string, input: UpdateBoardInput) => {
    const result = await updateBoardAction(id, input);
    if (result.success && result.data) {
      dispatch({ type: 'UPDATE_CHILD_BOARD', payload: result.data });
    }
  }, []);

  const moveChildBoard = useCallback(async (id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_CHILD_BOARD', payload: { id, x, y } });
    moveChildBoardAction(id, x, y);
  }, []);

  const moveChildBoardLocal = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_CHILD_BOARD', payload: { id, x, y } });
  }, []);

  const saveChildBoardPosition = useCallback(async (id: string, x: number, y: number) => {
    await moveChildBoardAction(id, x, y);
  }, []);

  const resizeChildBoard = useCallback(async (id: string, width: number, height: number) => {
    dispatch({ type: 'RESIZE_CHILD_BOARD', payload: { id, width, height } });
    resizeChildBoardAction(id, width, height);
  }, []);

  const resizeChildBoardLocal = useCallback((id: string, width: number, height: number) => {
    dispatch({ type: 'RESIZE_CHILD_BOARD', payload: { id, width, height } });
  }, []);

  const saveChildBoardSize = useCallback(async (id: string, width: number, height: number) => {
    await resizeChildBoardAction(id, width, height);
  }, []);

  const crystallizeChildBoard = useCallback((id: string, projectId: string) => {
    dispatch({
      type: 'CRYSTALLIZE_CHILD_BOARD',
      payload: { id, projectId, crystallizedAt: new Date() }
    });
  }, []);

  const removeChildBoard = useCallback(async (id: string) => {
    dispatch({ type: 'REMOVE_CHILD_BOARD', payload: id });
    await deleteChildBoardAction(id);
  }, []);

  // ============================================
  // SELECTION
  // ============================================

  const selectElements = useCallback((ids: string[]) => {
    dispatch({ type: 'SELECT_ELEMENTS', payload: ids });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'SELECT_ELEMENTS', payload: [] });
    dispatch({ type: 'SELECT_CHILD_BOARD', payload: null });
  }, []);

  const toggleElementSelection = useCallback((id: string) => {
    dispatch({
      type: 'SELECT_ELEMENTS',
      payload: state.selectedElementIds.includes(id)
        ? state.selectedElementIds.filter((i) => i !== id)
        : [...state.selectedElementIds, id],
    });
  }, [state.selectedElementIds]);

  const selectChildBoard = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_CHILD_BOARD', payload: id });
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
    // Board actions
    updateBoardName,
    // Element actions
    addElement,
    updateElement,
    moveElement,
   moveElementLocal,
    saveElementPosition,
    removeElementLocal,  // UB-9
    removeElement,
    // Quick add
    addNote,
    addPalette,
    // Child board actions (new names)
    addChildBoard,
    updateChildBoard,
    moveChildBoard,
    moveChildBoardLocal,
    saveChildBoardPosition,
    removeChildBoard,
    resizeChildBoard,
    resizeChildBoardLocal,
    saveChildBoardSize,
    crystallizeChildBoard,
    // Selection
    selectElements,
    clearSelection,
    toggleElementSelection,
    selectChildBoard,
    // Drag
    setDragging,
    // View mode
    setViewMode,
    toggleViewMode,
    
    // DEPRECATED ALIASES (for gradual migration)
    zones: state.childBoards,
    selectedZoneId: state.selectedChildBoardId,
    addZone: addChildBoard,
    updateZone: updateChildBoard,
    moveZone: moveChildBoard,
    moveZoneLocal: moveChildBoardLocal,
    saveZonePosition: saveChildBoardPosition,
    removeZone: removeChildBoard,
    resizeZone: resizeChildBoard,
    resizeZoneLocal: resizeChildBoardLocal,
    saveZoneSize: saveChildBoardSize,
    crystallizeZone: crystallizeChildBoard,
    selectZone: selectChildBoard,
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
