// src/features/auth/components/UserMenu.tsx
"use client";

import { LogOut, Settings, User, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  free: "outline",
  premium: "secondary",
  pro: "default",
  admin: "default",
};

const roleLabel: Record<string, string> = {
  free: "Free",
  premium: "Premium",
  pro: "Pro",
  admin: "Admin",
};

export function UserMenu() {
  const { profile, isLoading, isAuthenticated, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <Button variant="outline" size="sm" onClick={() => window.location.href = "/login"}>
        Connexion
      </Button>
    );
  }

  const initials = profile.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : profile.email[0].toUpperCase();

 const handleSignOut = async () => {
  console.log("🔴 SignOut clicked");
  try {
    // Timeout de sécurité de 3 secondes
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("SignOut timeout")), 3000)
    );
    
    await Promise.race([signOut(), timeoutPromise]);
    console.log("🔴 SignOut success");
  } catch (error) {
    console.error("🔴 SignOut error:", error);
  }
  // Toujours rediriger, même en cas d'erreur
  console.log("🔴 Redirecting to /");
  window.location.href = "/";
};

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
  <button 
    type="button"
    className="relative h-9 w-9 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  >
    {profile.avatar_url ? (
      <img
        src={profile.avatar_url}
        alt={profile.full_name || "Avatar"}
        className="h-9 w-9 rounded-full object-cover"
      />
    ) : (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
        {initials}
      </div>
    )}
  </button>
</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile.full_name || "Utilisateur"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile.email}
            </p>
            <div className="pt-1">
              <Badge variant={roleBadgeVariant[profile.role] || "outline"}>
                {profile.role === "pro" || profile.role === "premium" ? (
                  <Crown className="mr-1 h-3 w-3" />
                ) : null}
                {roleLabel[profile.role] || profile.role}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onSelect={(e) => {
            e.preventDefault();
            handleNavigation("/settings");
          }}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          Paramètres
        </DropdownMenuItem>
        {profile.role === "admin" && (
          <DropdownMenuItem 
            onSelect={(e) => {
              e.preventDefault();
              handleNavigation("/admin");
            }}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            Administration
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onSelect={(e) => {
            e.preventDefault();
            handleSignOut();
          }} 
          className="text-red-600 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
