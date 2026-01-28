// src/features/boards/infrastructure/zonesRepository.ts
// DEPRECATED: UB-4 - Unified Boards Architecture (ADR-032)
// This file provides backward compatibility aliases
// All functions redirect to boardsRepository.ts - DO NOT ADD NEW CODE HERE

import { boardsRepository } from './boardsRepository';
import type { Board } from '../domain/types';

// ============================================
// DEPRECATED TYPE ALIAS
// ============================================

// BoardZone is now Board - use Board directly
export type BoardZone = Board;

// ============================================
// DEPRECATED FUNCTIONS - Use boardsRepository instead
// ============================================

/**
 * @deprecated Use boardsRepository.getChildBoards instead
 */
export async function getZonesByBoard(boardId: string): Promise<Board[]> {
  return boardsRepository.getChildBoards(boardId);
}

/**
 * @deprecated Use boardsRepository.getBoard instead (child boards are just boards)
 */
export async function getZoneById(zoneId: string): Promise<Board | null> {
  // We can't get a board without userId in the new architecture
  // This is a limitation - callers should migrate to use boardsRepository directly
  console.warn('zonesRepository.getZoneById is deprecated - use boardsRepository.getBoard instead');
  return null;
}

/**
 * @deprecated Child boards are boards - this concept is obsolete
 */
export async function getZoneByLinkedBoard(_linkedBoardId: string): Promise<Board | null> {
  console.warn('zonesRepository.getZoneByLinkedBoard is deprecated - child boards ARE boards now');
  return null;
}

/**
 * @deprecated Use boardsRepository.createChildBoard instead
 */
export async function createZone(input: {
  boardId: string;
  name?: string;
  color?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  zoneType?: string;
  linkedBoardId?: string | null;
}): Promise<Board> {
  // We need userId but don't have it - this is a breaking change
  throw new Error('createZone is deprecated - use boardsRepository.createChildBoard with userId');
}

/**
 * @deprecated Use boardsRepository.updateBoard instead
 */
export async function updateZone(
  _zoneId: string,
  _input: Record<string, unknown>
): Promise<Board | null> {
  throw new Error('updateZone is deprecated - use boardsRepository.updateBoard with userId');
}

/**
 * @deprecated Use boardsRepository.moveChildBoard instead
 */
export async function moveZone(
  zoneId: string,
  positionX: number,
  positionY: number
): Promise<boolean> {
  return boardsRepository.moveChildBoard(zoneId, positionX, positionY);
}

/**
 * @deprecated Use boardsRepository.resizeChildBoard instead
 */
export async function resizeZone(
  zoneId: string,
  width: number,
  height: number
): Promise<boolean> {
  return boardsRepository.resizeChildBoard(zoneId, width, height);
}

/**
 * @deprecated Use boardsRepository.deleteBoard instead
 */
export async function deleteZone(_zoneId: string): Promise<string | null> {
  throw new Error('deleteZone is deprecated - use boardsRepository.deleteBoard with userId');
}

/**
 * @deprecated Child boards are boards - linking is obsolete
 */
export async function linkZoneToBoard(
  _zoneId: string,
  _linkedBoardId: string
): Promise<Board | null> {
  console.warn('linkZoneToBoard is deprecated - child boards ARE boards now');
  return null;
}

/**
 * @deprecated Child boards are boards - linking is obsolete
 */
export async function unlinkZoneFromBoard(_zoneId: string): Promise<Board | null> {
  console.warn('unlinkZoneFromBoard is deprecated - child boards ARE boards now');
  return null;
}

/**
 * @deprecated Use boardsRepository.crystallizeBoard instead
 */
export async function crystallizeZone(
  zoneId: string,
  projectId: string
): Promise<Board | null> {
  return boardsRepository.crystallizeBoard(zoneId, projectId);
}

/**
 * @deprecated Query boards with status filter instead
 */
export async function getCrystallizedZonesByBoard(_boardId: string): Promise<Board[]> {
  console.warn('getCrystallizedZonesByBoard is deprecated - query boards with crystallized_at filter');
  return [];
}

/**
 * @deprecated Query boards with status filter instead
 */
export async function getActiveZonesByBoard(_boardId: string): Promise<Board[]> {
  console.warn('getActiveZonesByBoard is deprecated - query boards with status filter');
  return [];
}

/**
 * @deprecated Use boardType filter on boards instead
 */
export async function getZonesByType(_boardId: string, _zoneType: string): Promise<Board[]> {
  console.warn('getZonesByType is deprecated - use boardType filter on boards');
  return [];
}

/**
 * @deprecated Child boards are boards - all child boards are "linked"
 */
export async function getLinkedZones(_boardId: string): Promise<Board[]> {
  console.warn('getLinkedZones is deprecated - child boards ARE boards');
  return [];
}

// ============================================
// DEPRECATED EXPORT
// ============================================

export const zonesRepository = {
  getZonesByBoard,
  getZoneById,
  getZoneByLinkedBoard,
  createZone,
  updateZone,
  moveZone,
  resizeZone,
  deleteZone,
  linkZoneToBoard,
  unlinkZoneFromBoard,
  crystallizeZone,
  getCrystallizedZonesByBoard,
  getActiveZonesByBoard,
  getZonesByType,
  getLinkedZones,
};
