// src/lib/auth/requireUser.ts
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type DeadstockUserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  searches_today: number;
  searches_reset_at: string;
  live_searches_today: number;
  avatar_url: string | null;
};

export async function requireUser() {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    redirect("/login");
  }

  const user = authData.user;

  const { data: profile, error: profileError } = await supabase
    .from("users") // schema deadstock via search_path côté DB? sinon "deadstock.users"
    .select("id,email,full_name,role,searches_today,searches_reset_at,live_searches_today,avatar_url")
    .eq("id", user.id)
    .single();

  // Si ton table est dans le schema deadstock et que supabase-js ne résout pas,
  // remplace .from("users") par .from("deadstock.users")
  if (profileError || !profile) {
    // cas rare : user auth créé mais trigger pas encore exécuté
    redirect("/login?error=profile_missing");
  }

  return { user, profile: profile as DeadstockUserProfile };
}

export async function requireAdmin() {
  const { user, profile } = await requireUser();
  if (profile.role !== "admin") {
    redirect("/search?error=forbidden");
  }
  return { user, profile };
}
