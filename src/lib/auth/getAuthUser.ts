// src/lib/auth/getAuthUser.ts
import { createClient } from '@/lib/supabase/server';

/**
 * Récupère l'utilisateur authentifié sans redirection
 * Retourne null si non connecté
 */
export async function getAuthUser(): Promise<{ id: string; email: string } | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data?.user) {
      return null;
    }
    
    return {
      id: data.user.id,
      email: data.user.email || '',
    };
  } catch {
    return null;
  }
}

/**
 * Récupère le user_id ou throw si non connecté
 */
export async function requireUserId(): Promise<string> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.id;
}
