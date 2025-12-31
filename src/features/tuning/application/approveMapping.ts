/**
 * Use Case: Approve Mapping
 * 
 * Approuve un unknown term et crée un mapping dans le dictionnaire
 */

import { DictionaryMapping, Category } from '../domain/DictionaryMapping';
import { dictionaryRepo } from '../infrastructure/dictionaryRepo';
import { unknownsRepo } from '../infrastructure/unknownsRepo';
import type { ApproveMappingInput } from '../domain/types';



export interface ApproveMappingOutput {
  success: boolean;
  mappingId: string;
}

/**
 * Approuve un unknown term et crée le mapping correspondant
 */
export async function approveMapping(
  input: ApproveMappingInput
): Promise<ApproveMappingOutput> {
  
  // 1. Récupérer l'unknown term
  const unknown = await unknownsRepo.getById(input.unknownId);
  
  if (!unknown) {
    throw new Error(`Unknown term not found: ${input.unknownId}`);
  }
  
  // 2. Approuver l'unknown (business logic in domain)
  unknown.approve(input.value, input.validatedBy, input.notes);
  
// 3. Créer le mapping dans le dictionnaire
const sourceLocale = input.sourceLocale || 'fr'; // Default FR
const targetLocale = input.targetLocale || 'en'; // Default EN

const mapping = new DictionaryMapping(
  crypto.randomUUID(),
  unknown.term,
  sourceLocale,                        // NEW: source locale
  { [targetLocale]: input.value },    // NEW: translations object
  unknown.category,
  'manual',
  1.0,
  new Date(),
  input.validatedBy,
  input.notes,
  0
);
  
  // 4. Sauvegarder le mapping
  await dictionaryRepo.save(mapping);
  
  // 5. Mettre à jour l'unknown term
  await unknownsRepo.update(unknown);
  
  return {
    success: true,
    mappingId: mapping.id
  };
}
