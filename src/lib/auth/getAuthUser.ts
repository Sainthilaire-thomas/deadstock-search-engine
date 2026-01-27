// src/lib/auth/getAuthUser.ts
import { createClient } from '@/lib/supabase/server';

/**
 * Récupère l'utilisateur authentifié sans redirection
 * Utilise getUser() qui vérifie le JWT auprès du serveur Supabase Auth
 * Retourne null si non connecté
 */
export async function getAuthUser(): Promise<{ id: string; email: string } | null> {
  try {
    const supabase = await createClient();
    
    // getUser() vérifie le JWT côté serveur (recommandé par Supabase)
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email || '',
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
