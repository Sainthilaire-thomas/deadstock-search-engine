// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

// Client pour les scrapers (utilise service_role pour écriture)
export function createScraperClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'deadstock', // ← Pointer vers le schéma deadstock
    },
  });
}
