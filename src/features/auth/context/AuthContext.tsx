// src/features/auth/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";

export type UserRole = "free" | "premium" | "pro" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  searches_today: number;
  searches_reset_at: string;
  live_searches_today: number;
  avatar_url: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createBrowserClient(), []);

 const fetchProfile = useCallback(async (userId: string) => {
    
    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, role, searches_today, searches_reset_at, live_searches_today, avatar_url")
      .eq("id", userId)
      .single();
    
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as UserProfile;
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const newProfile = await fetchProfile(user.id);
    if (newProfile) {
      setProfile(newProfile);
    }
  }, [user, fetchProfile]);

const handleSignOut = useCallback(async () => {
  await supabase.auth.signOut();
  setUser(null);
  setProfile(null);
}, [supabase]);

useEffect(() => {
    // Récupérer la session initiale
    const initAuth = async () => {
    
      setIsLoading(true);

      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
     
      
      if (currentUser) {
        setUser(currentUser);
        const userProfile = await fetchProfile(currentUser.id);
        setProfile(userProfile);
      }
      
      setIsLoading(false);
    };

    initAuth();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const value: AuthContextValue = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signOut: handleSignOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
