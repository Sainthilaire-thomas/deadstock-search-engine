// src/features/boards/utils/zoneUtils.ts
// DEPRECATED: Ce fichier est conservé pour compatibilité.
// Utilisez boardUtils.ts à la place.

export {
  isElementInChildBoard as isElementInZone,
  getElementsVisuallyInChildBoard as getElementsInZone,
  isBoardDraft as isZoneDraft,
  getActiveChildBoards,
  getCrystallizedChildBoards,
  getRandomBoardColor,
  getNextChildBoardPosition,
} from './boardUtils';

// Note: Les fonctions suivantes n'ont plus d'équivalent car zoneId n'existe plus:
// - getElementsByZoneId (les éléments appartiennent maintenant à un board via boardId)
// - getFreeElements (tous les éléments d'un board sont "dans" ce board)
// - elementBelongsToZone (remplacé par element.boardId === boardId)
