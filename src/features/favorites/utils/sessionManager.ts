/**
 * Session Manager
 * 
 * Gère l'identifiant de session temporaire stocké dans un cookie
 * Sera remplacé par user_id lors de l'implémentation de l'auth en Phase 2
 */

import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'deadstock_session_id';
const SESSION_DURATION = 90 * 24 * 60 * 60 * 1000; // 90 jours en millisecondes

/**
 * Génère un UUID v4
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Récupère ou crée un session_id
 * 
 * @returns session_id stocké dans cookie
 */
export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existingSession = cookieStore.get(SESSION_COOKIE_NAME);

  if (existingSession?.value) {
    return existingSession.value;
  }

  // Créer nouveau session_id
  const newSessionId = generateUUID();
  
  cookieStore.set(SESSION_COOKIE_NAME, newSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });

  return newSessionId;
}

/**
 * Récupère le session_id existant (sans en créer un nouveau)
 * 
 * @returns session_id ou null si n'existe pas
 */
export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value || null;
}

/**
 * Supprime le session_id (pour tests ou logout futur)
 */
export async function clearSessionId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
