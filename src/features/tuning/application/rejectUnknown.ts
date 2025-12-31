/**
 * Use Case: Reject Unknown
 * 
 * Rejette un unknown term (ne sera pas ajouté au dictionnaire)
 */

import { unknownsRepo } from '../infrastructure/unknownsRepo';
import type { RejectUnknownInput } from '../domain/types';


export interface RejectUnknownOutput {
  success: boolean;
}

/**
 * Rejette un unknown term
 */
export async function rejectUnknown(
  input: RejectUnknownInput
): Promise<RejectUnknownOutput> {
  
  // 1. Récupérer l'unknown term
  const unknown = await unknownsRepo.getById(input.unknownId);
  
  if (!unknown) {
    throw new Error(`Unknown term not found: ${input.unknownId}`);
  }
  
  // 2. Rejeter (business logic in domain)
  unknown.reject(input.rejectedBy, input.notes);
  
  // 3. Sauvegarder
  await unknownsRepo.update(unknown);
  
  return {
    success: true
  };
}
