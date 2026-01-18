// src/app/(auth)/login/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn, signInWithOAuth } from "@/lib/supabase/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setError(null);

  const result = await signIn(email, password);

  if (result.error) {
    setError(result.error.message);
    setLoading(false);
    return;
  }

 window.location.href = "/home";
}

  async function onGoogle() {
    setLoading(true);
    setError(null);
    const { error } = await signInWithOAuth("google");
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-3xl border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Reprends là où tu t'étais arrêté.
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
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="text-zinc-600 hover:underline dark:text-zinc-300">
          Mot de passe oublié ?
        </Link>
      </div>

      <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-300">
        Pas de compte ?{" "}
        <Link href="/signup" className="font-medium text-zinc-900 hover:underline dark:text-white">
          Créer un compte
        </Link>
      </div>
    </Card>
  );
}
