// src/lib/auth/getAuthUser.ts
import { createClient } from '@/lib/supabase/server';

/**
 * Récupère l'utilisateur authentifié sans redirection
 * Utilise getSession() pour éviter un appel réseau systématique
 * Retourne null si non connecté
 */
export async function getAuthUser(): Promise<{ id: string; email: string } | null> {
  try {
    const supabase = await createClient();
    // getSession() lit le JWT localement (pas d'appel réseau)
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user) {
      return null;
    }
    
    return {
      id: session.user.id,
      email: session.user.email || '',
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
