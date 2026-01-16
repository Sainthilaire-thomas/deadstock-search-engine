// src/features/boards/utils/zoneUtils.ts

import type { BoardElement, BoardZone } from '../domain/types';

/**
 * Détermine si un élément est "dans" une zone
 * Critère : le centre de l'élément est dans les limites de la zone
 */
export function isElementInZone(element: BoardElement, zone: BoardZone): boolean {
  const elementCenterX = element.positionX + (element.width || 100) / 2;
  const elementCenterY = element.positionY + (element.height || 80) / 2;

  return (
    elementCenterX >= zone.positionX &&
    elementCenterX <= zone.positionX + zone.width &&
    elementCenterY >= zone.positionY &&
    elementCenterY <= zone.positionY + zone.height
  );
}

/**
 * Retourne tous les éléments contenus dans une zone
 */
export function getElementsInZone(
  elements: BoardElement[],
  zone: BoardZone
): BoardElement[] {
  return elements.filter(element => isElementInZone(element, zone));
}

/**
 * Vérifie si une zone est cristallisée ET en mode brouillon (pas encore commandée)
 */
export function isZoneDraft(zone: BoardZone): boolean {
  return zone.crystallizedAt !== null && zone.linkedProjectId !== null;
  // Note: on ajoutera la vérification du statut 'ordered' quand le snapshot sera implémenté
}

/**
 * Vérifie si une zone est cristallisée ET commandée (figée)
 */
export function isZoneOrdered(zone: BoardZone): boolean {
  // Pour l'instant, on n'a pas le champ snapshot/status sur la zone
  // On le détectera via le projet lié plus tard
  return false; // TODO: implémenter quand Sprint C3 sera fait
}
