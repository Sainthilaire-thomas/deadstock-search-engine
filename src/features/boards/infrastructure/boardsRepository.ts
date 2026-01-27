// src/features/boards/infrastructure/boardsRepository.ts

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Board,
  BoardWithDetails,
  BoardWithPreview,
  BoardRow,
  BoardElementRow,
  BoardZoneRow,
  CreateBoardInput,
  UpdateBoardInput,
} from '../domain/types';

import {
  mapBoardFromRow,
  mapElementFromRow,
  mapZoneFromRow,
} from '../domain/types';

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
// NEW Sprint 5 - LIST ROOT BOARDS ONLY
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
// ============================================

export async function listBoardsWithPreview(userId: string): Promise<BoardWithPreview[]> {
  const supabase = createAdminClient();

  // Requête optimisée : counts seulement, pas de element_data
  // NEW Sprint 5: Filter only root boards (parent_board_id IS NULL)
  // FIX: Specify relationship explicitly due to linked_board_id FK
  const { data, error } = await supabase
    .from('boards')
    .select(`
      *,
      board_elements (count),
      board_zones!board_zones_board_id_fkey (count)
    `)
    .eq('user_id', userId)
    .is('parent_board_id', null)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('listBoardsWithPreview error:', error);
    throw error;
  }

  return (data || []).map((row) => {
    const board = mapBoardFromRow(row as BoardRow);

    // Extraire les counts depuis la réponse Supabase
    const elementCount = (row.board_elements as unknown as { count: number }[])?.[0]?.count ?? 0;
    const zoneCount = (row.board_zones as unknown as { count: number }[])?.[0]?.count ?? 0;

    return {
      ...board,
      previewUrl: row.cover_image_url || null,
      elementCount,
      zoneCount,
    };
  });
}

/**
 * Extrait l'URL de preview d'un board
 * Priorité: cover_image_url > inspiration > textile > silhouette > pattern
 */
function extractPreviewUrl(
  coverImageUrl: string | null,
  elements: Array<{ element_type: string; element_data: Record<string, unknown> }>
): string | null {
  // 1. Cover explicite définie par l'utilisateur
  if (coverImageUrl) {
    return coverImageUrl;
  }

  // 2. Chercher dans les éléments par priorité

  // Priorité aux inspirations (images uploadées)
  const inspiration = elements.find(
    (e) => e.element_type === 'inspiration' && e.element_data?.imageUrl
  );
  if (inspiration?.element_data?.imageUrl) {
    return inspiration.element_data.imageUrl as string;
  }

  // Textiles avec image (depuis snapshot)
  const textile = elements.find(
    (e) => e.element_type === 'textile' && e.element_data?.snapshot
  );
  if (textile?.element_data?.snapshot) {
    const snapshot = textile.element_data.snapshot as Record<string, unknown>;
    if (snapshot.imageUrl) {
      return snapshot.imageUrl as string;
    }
  }

  // Silhouettes
  const silhouette = elements.find(
    (e) => e.element_type === 'silhouette' && e.element_data?.url
  );
  if (silhouette?.element_data?.url) {
    return silhouette.element_data.url as string;
  }

  // Patterns (thumbnail)
  const pattern = elements.find(
    (e) => e.element_type === 'pattern' && e.element_data?.thumbnailUrl
  );
  if (pattern?.element_data?.thumbnailUrl) {
    return pattern.element_data.thumbnailUrl as string;
  }

  // Pattern (url directe si pas de thumbnail)
  const patternDirect = elements.find(
    (e) => e.element_type === 'pattern' && e.element_data?.url && e.element_data?.fileType === 'image'
  );
  if (patternDirect?.element_data?.url) {
    return patternDirect.element_data.url as string;
  }

  // 3. Pas d'image trouvée
  return null;
}

// ============================================
// GET BOARD WITH DETAILS
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

 // Get zones
  const { data: zonesData, error: zonesError } = await supabase
    .from('board_zones')
    .select('*')
    .eq('board_id', boardId)
    .order('created_at', { ascending: true });

  if (zonesError) {
    console.error('getBoard zones error:', zonesError);
    throw zonesError;
  }

  // Get project statuses for crystallized zones
  const linkedProjectIds = (zonesData || [])
    .map((z) => z.linked_project_id)
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

  // Map zones with project status
  const zones = (zonesData || []).map((row) => {
    const zoneRow = row as BoardZoneRow;
    // Inject project status into the row before mapping
    if (zoneRow.linked_project_id && projectStatusMap[zoneRow.linked_project_id]) {
      zoneRow.linked_project_status = projectStatusMap[zoneRow.linked_project_id];
    }
    return mapZoneFromRow(zoneRow);
  });

  return {
    ...board,
    elements,
    zones,
    elementCount: elements.length,
  };
}

// ============================================
// NEW Sprint 5 - GET BOARD ANCESTORS (for breadcrumb)
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
// NEW Sprint 5 - GET CHILD BOARDS
// ============================================

export async function getChildBoards(parentBoardId: string): Promise<Board[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('parent_board_id', parentBoardId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('getChildBoards error:', error);
    throw error;
  }

  return (data || []).map((row) => mapBoardFromRow(row as BoardRow));
}

// ============================================
// CREATE BOARD
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
      parent_board_id: input.parentBoardId || null,  // NEW Sprint 5
      name: input.name || null,
      description: input.description || null,
      status: input.status || 'active',
      board_type: input.boardType || 'free',         // NEW Sprint 5
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
// UPDATE BOARD
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
  if (input.boardType !== undefined) updateData.board_type = input.boardType;  // NEW Sprint 5

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
// NEW Sprint 5 - GET ROOT BOARDS COUNT
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
  listRootBoards,           // NEW Sprint 5
  listBoardsWithPreview,
  getBoard,
  getBoardAncestors,        // NEW Sprint 5
  getChildBoards,           // NEW Sprint 5
  createBoard,
  updateBoard,
  updateBoardCoverImage,
  deleteBoard,
  getBoardsCount,
  getRootBoardsCount,       // NEW Sprint 5
};
