// src/lib/supabase/auth.ts
import type { Provider } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase/browser";

/**
 * Client-side auth helpers ONLY.
 * (Server-side user access stays in src/lib/supabase/server.ts where it belongs.)
 */

export async function signUp(email: string, password: string, fullName?: string) {
  const supabase = createBrowserClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
    },
  });
}

export async function signIn(email: string, password: string) {
  const supabase = createBrowserClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithOAuth(provider: Provider) {
  const supabase = createBrowserClient();
  const redirectTo = `${window.location.origin}/api/auth/callback`;

  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
}

export async function signOut() {
  const supabase = createBrowserClient();
  return supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  const supabase = createBrowserClient();
  const redirectTo = `${window.location.origin}/reset-password`;
  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

export async function getUser() {
  const supabase = createBrowserClient();
  return supabase.auth.getUser();
}
