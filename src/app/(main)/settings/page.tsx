// src/app/(main)/settings/page.tsx
"use client";

import { useAuth } from "@/features/auth/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container py-8 max-w-2xl">
        <div className="h-8 w-48 animate-pulse rounded bg-muted mb-6" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-8 max-w-2xl">
        <p className="text-muted-foreground">Non connecté</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Mon compte</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Nom</label>
            <p className="font-medium">{profile.full_name || "Non renseigné"}</p>
          </div>

          <Separator />

          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <p className="font-medium">{profile.email}</p>
          </div>

          <Separator />

          <div>
            <label className="text-sm text-muted-foreground">Plan</label>
            <div className="mt-1">
              <Badge variant={profile.role === "admin" ? "default" : "outline"}>
                {profile.role}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm text-muted-foreground">Recherches aujourd'hui</label>
            <p className="font-medium">{profile.searches_today}</p>
          </div>
        </div>
      </Card>

      <p className="text-sm text-muted-foreground mt-6">
        Plus d'options à venir...
      </p>
    </div>
  );
}
