// src/app/(auth)/signup/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { signUp, signInWithOAuth } from "@/lib/supabase/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { data, error } = await signUp(email, password, fullName.trim() || undefined);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Selon config Supabase : session immédiate ou email confirmation
    if (data.session) {
      // Force un refresh complet pour synchroniser les cookies
      window.location.href = "/search";
      return;
    }

    setSuccess("Compte créé. Vérifie tes emails pour confirmer ton inscription.");
    setLoading(false);
  }

  async function onGoogle() {
    setLoading(true);
    setError(null);
    const { error } = await signInWithOAuth("google");
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // sinon : redirect vers Google
  }

  return (
    <Card className="rounded-3xl border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Créer un compte</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Accède aux favoris, boards, et à la recherche avancée.
        </p>
      </div>

      <div className="mt-6">
        <Button onClick={onGoogle} disabled={loading} className="w-full" variant="outline">
          Continuer avec Google
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">ou</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nom (optionnel)</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Min 6 caractères (selon réglages Supabase).
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
            {success}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Création..." : "Créer un compte"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-300">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-zinc-900 hover:underline dark:text-white">
          Se connecter
        </Link>
      </div>
    </Card>
  );
}
