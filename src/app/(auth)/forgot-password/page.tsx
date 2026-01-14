// src/app/(auth)/forgot-password/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { resetPassword } from "@/lib/supabase/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await resetPassword(email);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess("Si un compte existe, un email de réinitialisation vient d’être envoyé.");
    setLoading(false);
  }

  return (
    <Card className="rounded-3xl border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Mot de passe oublié</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Entre ton email. Tu recevras un lien de réinitialisation.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
          {loading ? "Envoi..." : "Envoyer le lien"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-300">
        <Link href="/login" className="hover:underline">
          Retour connexion
        </Link>
      </div>
    </Card>
  );
}
