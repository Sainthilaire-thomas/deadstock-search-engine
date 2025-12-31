'use server';

import { approveMapping } from '@/features/tuning/application/approveMapping';
import { rejectUnknown } from '@/features/tuning/application/rejectUnknown';
import { revalidatePath } from 'next/cache';
import { normalizationService } from '@/features/normalization/infrastructure/normalizationService';

export async function handleApprove(
  unknownId: string,
  value: string
) {
  try {
    await approveMapping({
      unknownId,
      value,
      validatedBy: null // TODO: Get from auth (UUID required)
    });
    
    // Invalider le cache dictionnaire
    normalizationService.invalidateCache();
    
    // Recharger la page
    revalidatePath('/admin/tuning');
    
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

export async function handleReject(
  unknownId: string,
  notes?: string
) {
  try {
    await rejectUnknown({
      unknownId,
      rejectedBy: null, // TODO: Get from auth (UUID required)
      notes
    });
    
    // Recharger la page
    revalidatePath('/admin/tuning');
    
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}
