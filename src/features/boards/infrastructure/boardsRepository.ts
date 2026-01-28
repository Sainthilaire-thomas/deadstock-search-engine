// src/features/boards/infrastructure/boardsRepository.ts
// UPDATED: UB-3 - Unified Boards Architecture (ADR-032)

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Board,
  BoardElement,
  BoardWithDetails,
  BoardWithPreview,
  BoardRow,
  BoardElementRow,
  CreateBoardInput,
  UpdateBoardInput,
} from '../domain/types';

import {
  mapBoardFromRow,
  mapElementFromRow,
} from '../domain/types';

// ============================================
// HELPER - Random color for new child boards
// ============================================

const BOARD_COLORS = [
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#06B6D4', // Cyan
];

function getRandomBoardColor(): string {
  return BOARD_COLORS[Math.floor(Math.random() * BOARD_COLORS.length)];
}

// ============================================
// LIST BOARDS (all boards for user)
// ============================================

export async function listBoards(userId: string): Promise<Board[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('listBoards error:', error);
    throw error;
  }

  return (data || []).map((row) => mapBoardFromRow(row as BoardRow));
}

// ============================================
// LIST ROOT BOARDS ONLY
// ============================================

export async function listRootBoards(userId: string): Promise<Board[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .is('parent_board_id', null)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('listRootBoards error:', error);
    throw error;
  }

  return (data || []).map((row) => mapBoardFromRow(row as BoardRow));
}

// ============================================
// LIST BOARDS WITH PREVIEW
// UPDATED UB-3: childBoardCount instead of zoneCount
// ============================================

export async function listBoardsWithPreview(userId: string): Promise<BoardWithPreview[]> {
  const supabase = createAdminClient();

  // UPDATED UB-3: Count child boards instead of zones
  const { data, error } = await supabase
    .from('boards')
    .select(`
      *,
      board_elements (count)
    `)
    .eq('user_id', userId)
    .is('parent_board_id', null)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('listBoardsWithPreview error:', error);
    throw error;
  }

  // Get child board counts in a separate query
  const boardIds = (data || []).map(b => b.id);
  
  let childBoardCounts: Record<string, number> = {};
  if (boardIds.length > 0) {
    const { data: childData } = await supabase
      .from('boards')
      .select('parent_board_id')
      .in('parent_board_id', boardIds);
    
    if (childData) {
      childData.forEach(child => {
        if (child.parent_board_id) {
          childBoardCounts[child.parent_board_id] = (childBoardCounts[child.parent_board_id] || 0) + 1;
        }
      });
    }
  }

  return (data || []).map((row) => {
    const board = mapBoardFromRow(row as BoardRow);
    const elementCount = (row.board_elements as unknown as { count: number }[])?.[0]?.count ?? 0;
    const childBoardCount = childBoardCounts[row.id] || 0;

    return {
      ...board,
      previewUrl: row.cover_image_url || null,
      elementCount,
      childBoardCount,  // UPDATED UB-3: renamed from zoneCount
    };
  });
}

// ============================================
// GET BOARD WITH DETAILS
// UPDATED UB-3: childBoards instead of zones
// ============================================

export async function getBoard(
  boardId: string,
  userId: string
): Promise<BoardWithDetails | null> {
  const supabase = createAdminClient();

  // Get board
  const { data: boardData, error: boardError } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .eq('user_id', userId)
    .single();

  if (boardError || !boardData) {
    if (boardError?.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('getBoard error:', boardError);
    throw boardError;
  }

  // Get elements
  const { data: elementsData, error: elementsError } = await supabase
    .from('board_elements')
    .select('*')
    .eq('board_id', boardId)
    .order('z_index', { ascending: true });

  if (elementsError) {
    console.error('getBoard elements error:', elementsError);
    throw elementsError;
  }

// UPDATED UB-3: Get child boards instead of zones
  // UB-5: Include element count for each child board
  const { data: childBoardsData, error: childBoardsError } = await supabase
    .from('boards')
    .select(`
      *,
      board_elements (count)
    `)
    .eq('parent_board_id', boardId)
    .order('created_at', { ascending: true });

  if (childBoardsError) {
    console.error('getBoard childBoards error:', childBoardsError);
    throw childBoardsError;
  }

  // UB-5: Get preview elements for each child board (max 6 per board)
  const childBoardIds = (childBoardsData || []).map(cb => cb.id);
  let previewElementsMap: Record<string, BoardElement[]> = {};

  if (childBoardIds.length > 0) {
    // Fetch elements for all child boards in one query
    const { data: previewData, error: previewError } = await supabase
      .from('board_elements')
      .select('*')
      .in('board_id', childBoardIds)
      .order('z_index', { ascending: true });

    if (previewError) {
      console.error('getBoard preview elements error:', previewError);
      // Non-blocking: continue without preview elements
    } else if (previewData) {
      // Group by board_id and limit to 6 per board
      for (const row of previewData) {
        const boardId = row.board_id;
        if (!previewElementsMap[boardId]) {
          previewElementsMap[boardId] = [];
        }
        if (previewElementsMap[boardId].length < 6) {
          previewElementsMap[boardId].push(mapElementFromRow(row as BoardElementRow));
        }
      }
    }
  }

  // Get project statuses for crystallized child boards
  const linkedProjectIds = (childBoardsData || [])
    .map((cb) => cb.linked_project_id)
    .filter((id): id is string => id !== null);

  let projectStatusMap: Record<string, string> = {};

  if (linkedProjectIds.length > 0) {
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id, status')
      .in('id', linkedProjectIds);

    if (projectsError) {
      console.error('getBoard projects error:', projectsError);
      // Non-blocking: continue without project statuses
    } else if (projectsData) {
      projectStatusMap = Object.fromEntries(
        projectsData.map((p) => [p.id, p.status])
      );
    }
  }

  const board = mapBoardFromRow(boardData as BoardRow);
  const elements = (elementsData || []).map((row) => mapElementFromRow(row as BoardElementRow));

  // UPDATED UB-3: Map child boards with project status
  // UB-5: Include element count and preview elements
  const childBoards = (childBoardsData || []).map((row) => {
    const childBoardRow = row as BoardRow;
    // Inject project status into the row before mapping
    if (childBoardRow.linked_project_id && projectStatusMap[childBoardRow.linked_project_id]) {
      childBoardRow.linked_project_status = projectStatusMap[childBoardRow.linked_project_id];
    }
    const mappedBoard = mapBoardFromRow(childBoardRow);
    // UB-5: Extract element count from the joined query
    const elementCount = (row as unknown as { board_elements: { count: number }[] }).board_elements?.[0]?.count ?? 0;
    // UB-5: Get preview elements for this child board
    const previewElements = previewElementsMap[mappedBoard.id] || [];
    return {
      ...mappedBoard,
      elementCount,
      previewElements,
    };
  });

  return {
    ...board,
    elements,
    childBoards,  // UPDATED UB-3: renamed from zones
    elementCount: elements.length,
    childBoardCount: childBoards.length,  // UPDATED UB-3: renamed from zoneCount
  };
}

// ============================================
// GET BOARD ANCESTORS (for breadcrumb)
// ============================================

export async function getBoardAncestors(boardId: string): Promise<Board[]> {
  const supabase = createAdminClient();
  const ancestors: Board[] = [];

  // First get the current board to find its parent
  const { data: currentBoard } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .single();

  if (!currentBoard || !currentBoard.parent_board_id) {
    return ancestors; // No ancestors
  }

  // Fetch ancestors one by one (max 10 levels to prevent infinite loops)
  const idsToFetch: string[] = [currentBoard.parent_board_id];

  // Collect all parent IDs first
  for (let i = 0; i < 10; i++) {
    const lastId = idsToFetch[idsToFetch.length - 1];
    const { data } = await supabase
      .from('boards')
      .select('parent_board_id')
      .eq('id', lastId)
      .single();

    if (!data?.parent_board_id) break;
    idsToFetch.push(data.parent_board_id);
  }

  // Fetch all ancestors in one query
  const { data: ancestorsData } = await supabase
    .from('boards')
    .select('*')
    .in('id', idsToFetch);

  if (ancestorsData) {
    // Sort from root to direct parent
    for (const id of idsToFetch.reverse()) {
      const ancestor = ancestorsData.find(a => a.id === id);
      if (ancestor) {
        ancestors.push(mapBoardFromRow(ancestor as BoardRow));
      }
    }
  }

  return ancestors;
}

// ============================================
// GET CHILD BOARDS
// ============================================

export async function getChildBoards(parentBoardId: string): Promise<Board[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('parent_board_id', parentBoardId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getChildBoards error:', error);
    throw error;
  }

  return (data || []).map((row) => mapBoardFromRow(row as BoardRow));
}

// ============================================
// CREATE BOARD
// UPDATED UB-3: Support position/size/color for child boards
// ============================================

export async function createBoard(
  input: CreateBoardInput,
  userId: string
): Promise<Board> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('boards')
    .insert({
      user_id: userId,
      parent_board_id: input.parentBoardId || null,
      name: input.name || null,
      description: input.description || null,
      status: input.status || 'draft',  // UPDATED UB-3: default to 'draft'
      board_type: input.boardType || 'free',
      // NEW UB-3: Position/size/color for child boards
      position_x: input.positionX ?? null,
      position_y: input.positionY ?? null,
      width: input.width ?? 280,
      height: input.height ?? 140,
      color: input.color || getRandomBoardColor(),
    })
    .select()
    .single();

  if (error) {
    console.error('createBoard error:', error);
    throw error;
  }

  return mapBoardFromRow(data as BoardRow);
}

// ============================================
// NEW UB-3: CREATE CHILD BOARD (replaces createZone)
// ============================================

export async function createChildBoard(
  parentBoardId: string,
  input: {
    name?: string;
    positionX?: number;
    positionY?: number;
    width?: number;
    height?: number;
    color?: string;
    boardType?: 'piece' | 'category';
  },
  userId: string
): Promise<Board> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('boards')
    .insert({
      user_id: userId,
      parent_board_id: parentBoardId,
      name: input.name || 'Nouvelle pièce',
      status: 'draft',
      board_type: input.boardType || 'piece',
      position_x: input.positionX ?? 50,
      position_y: input.positionY ?? 50,
      width: input.width ?? 280,
      height: input.height ?? 140,
      color: input.color || getRandomBoardColor(),
    })
    .select()
    .single();

  if (error) {
    console.error('createChildBoard error:', error);
    throw error;
  }

  return mapBoardFromRow(data as BoardRow);
}

// ============================================
// UPDATE BOARD
// UPDATED UB-3: Support all new fields
// ============================================

export async function updateBoard(
  boardId: string,
  input: UpdateBoardInput,
  userId: string
): Promise<Board | null> {
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.boardType !== undefined) updateData.board_type = input.boardType;
  // NEW UB-3: Position/size/color
  if (input.positionX !== undefined) updateData.position_x = input.positionX;
  if (input.positionY !== undefined) updateData.position_y = input.positionY;
  if (input.width !== undefined) updateData.width = input.width;
  if (input.height !== undefined) updateData.height = input.height;
  if (input.color !== undefined) updateData.color = input.color;

  const { data, error } = await supabase
    .from('boards')
    .update(updateData)
    .eq('id', boardId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('updateBoard error:', error);
    throw error;
  }

  return mapBoardFromRow(data as BoardRow);
}

// ============================================
// NEW UB-3: MOVE CHILD BOARD (replaces moveZone)
// ============================================

export async function moveChildBoard(
  boardId: string,
  positionX: number,
  positionY: number
): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('boards')
    .update({ position_x: positionX, position_y: positionY })
    .eq('id', boardId);

  if (error) {
    console.error('moveChildBoard error:', error);
    throw error;
  }

  return true;
}

// ============================================
// NEW UB-3: RESIZE CHILD BOARD (replaces resizeZone)
// ============================================

export async function resizeChildBoard(
  boardId: string,
  width: number,
  height: number
): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('boards')
    .update({ width, height })
    .eq('id', boardId);

  if (error) {
    console.error('resizeChildBoard error:', error);
    throw error;
  }

  return true;
}

// ============================================
// NEW UB-3: CRYSTALLIZE BOARD (replaces crystallizeZone)
// ============================================

export async function crystallizeBoard(
  boardId: string,
  projectId: string
): Promise<Board | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('boards')
    .update({
      crystallized_at: new Date().toISOString(),
      linked_project_id: projectId,
      status: 'ordered',  // UPDATED UB-3: Use new status
    })
    .eq('id', boardId)
    .select()
    .single();

  if (error) {
    console.error('crystallizeBoard error:', error);
    throw error;
  }

  return mapBoardFromRow(data as BoardRow);
}

// ============================================
// UPDATE BOARD COVER IMAGE
// ============================================

export async function updateBoardCoverImage(
  boardId: string,
  coverImageUrl: string | null,
  userId: string
): Promise<Board | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('boards')
    .update({ cover_image_url: coverImageUrl })
    .eq('id', boardId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('updateBoardCoverImage error:', error);
    throw error;
  }

  return mapBoardFromRow(data as BoardRow);
}

// ============================================
// DELETE BOARD
// ============================================

export async function deleteBoard(
  boardId: string,
  userId: string
): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId)
    .eq('user_id', userId);

  if (error) {
    console.error('deleteBoard error:', error);
    throw error;
  }

  return true;
}

// ============================================
// GET BOARDS COUNT
// ============================================

export async function getBoardsCount(userId: string): Promise<number> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from('boards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('status', 'archived');

  if (error) {
    console.error('getBoardsCount error:', error);
    throw error;
  }

  return count || 0;
}

// ============================================
// GET ROOT BOARDS COUNT
// ============================================

export async function getRootBoardsCount(userId: string): Promise<number> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from('boards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('parent_board_id', null)
    .neq('status', 'archived');

  if (error) {
    console.error('getRootBoardsCount error:', error);
    throw error;
  }

  return count || 0;
}

// ============================================
// EXPORT AS OBJECT
// ============================================

export const boardsRepository = {
  listBoards,
  listRootBoards,
  listBoardsWithPreview,
  getBoard,
  getBoardAncestors,
  getChildBoards,
  createBoard,
  createChildBoard,      // NEW UB-3
  updateBoard,
  moveChildBoard,        // NEW UB-3
  resizeChildBoard,      // NEW UB-3
  crystallizeBoard,      // NEW UB-3
  updateBoardCoverImage,
  deleteBoard,
  getBoardsCount,
  getRootBoardsCount,
};
