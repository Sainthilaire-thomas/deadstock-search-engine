/**
 * Use Case: Get Unknowns
 * 
 * Récupère la liste des unknown terms à reviewer
 */

import { UnknownTerm, UnknownTermStatus } from '../domain/UnknownTerm';
import { CategoryType } from '../domain/DictionaryMapping';
import { unknownsRepo } from '../infrastructure/unknownsRepo';

export interface GetUnknownsInput {
  status?: UnknownTermStatus;
  category?: CategoryType;
  minOccurrences?: number;
  limit?: number;
}

export interface GetUnknownsOutput {
  unknowns: UnknownTerm[];
  total: number;
}

/**
 * Récupère les unknown terms selon des filtres
 */
export async function getUnknowns(
  input: GetUnknownsInput = {}
): Promise<GetUnknownsOutput> {
  
  const unknowns = await unknownsRepo.findAll({
    status: input.status || 'pending',
    category: input.category,
    minOccurrences: input.minOccurrences || 1,
    limit: input.limit || 100
  });
  
  return {
    unknowns,
    total: unknowns.length
  };
}
