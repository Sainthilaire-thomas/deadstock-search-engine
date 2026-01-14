// src/app/pricing/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, X, ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PlanKey = "free" | "premium" | "pro" | "enterprise";

type Plan = {
  key: PlanKey;
  name: string;
  badge?: string;
  badgeColor?: string;
  priceMonthly: number | null;
  highlight?: boolean;
  cta: string;
  ctaHref: string;
  features: {
    searchesPerDay: string;
    results: string;
    projects: string;
    smartDiscovery: string;
    team: string;
    export: string;
    boards: string;
    favorites: string;
  };
};

function formatPrice(eur: number) {
  return `${eur}€`;
}

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const plans: Plan[] = useMemo(
    () => [
      {
        key: "free",
        name: "Free",
        badge: "Pour démarrer",
        badgeColor: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
        priceMonthly: 0,
        cta: "Commencer",
        ctaHref: "/signup",
        features: {
          searchesPerDay: "10 / jour",
          results: "50 résultats",
          projects: "1 projet",
          smartDiscovery: "non",
          team: "non",
          export: "Basique",
          boards: "oui",
          favorites: "oui",
        },
      },
      {
        key: "premium",
        name: "Premium",
        badge: "Le plus populaire",
        badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        priceMonthly: 19,
        highlight: true,
        cta: "Passer en Premium",
        ctaHref: "/signup",
        features: {
          searchesPerDay: "Illimité",
          results: "Tous",
          projects: "Illimité",
          smartDiscovery: "3 / jour",
          team: "non",
          export: "Standard",
          boards: "oui",
          favorites: "oui",
        },
      },
      {
        key: "pro",
        name: "Pro",
        badge: "Pour les studios",
        badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        priceMonthly: 49,
        cta: "Passer en Pro",
        ctaHref: "/signup",
        features: {
          searchesPerDay: "Illimité",
          results: "Tous",
          projects: "Illimité",
          smartDiscovery: "Illimité",
          team: "Jusqu'à 5",
          export: "Avancé",
          boards: "oui",
          favorites: "oui",
        },
      },
      {
        key: "enterprise",
        name: "Enterprise",
        badge: "Sur mesure",
        badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        priceMonthly: null,
        cta: "Nous contacter",
        ctaHref: "/signup",
        features: {
          searchesPerDay: "Illimité",
          results: "Tous",
          projects: "Illimité",
          smartDiscovery: "Illimité",
          team: "Illimité",
          export: "Sur mesure",
          boards: "oui",
          favorites: "oui",
        },
      },
    ],
    []
  );

  const annualDiscount = 0.2;

  const displayPrice = (p: Plan) => {
    if (p.priceMonthly === null) return { main: "Sur devis", sub: "" };

    if (billing === "monthly") {
      return { main: `${formatPrice(p.priceMonthly)}`, sub: "/ mois" };
    }

    const monthlyDiscounted = Math.round(p.priceMonthly * (1 - annualDiscount));
    return { main: `${formatPrice(monthlyDiscounted)}`, sub: "/ mois" };
  };

  const renderFeatureValue = (value: string) => {
    if (value === "oui") return <Check className="h-5 w-5 text-emerald-600" />;
    if (value === "non") return <X className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />;
    return <span>{value}</span>;
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <span className="text-sm font-bold">DS</span>
            </div>
            <span className="hidden text-sm font-semibold sm:inline">Deadstock Search Engine</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/search" className="hidden sm:inline-flex">
              <Button variant="ghost">Voir la démo</Button>
            </Link>
            <Link href="/login" className="hidden sm:inline-flex">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/signup">
              <Button className="gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                Commencer gratuitement <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-linear-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              Tarifs simples et transparents
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Choisissez l'offre adaptée à votre <span className="text-emerald-600 dark:text-emerald-400">rythme de sourcing</span>
            </h1>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Commencez en Free, passez en Premium pour sourcer sans friction, ou en Pro pour une approche studio.
            </p>

            {/* Billing toggle */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  billing === "monthly"
                    ? "bg-zinc-900 text-white shadow-lg dark:bg-white dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                Mensuel
              </button>

              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all flex items-center gap-2 ${
                  billing === "yearly"
                    ? "bg-zinc-900 text-white shadow-lg dark:bg-white dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                Annuel
                <Badge className="bg-emerald-500 text-white text-xs">-20%</Badge>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-4">
            {plans.map((p) => {
              const price = displayPrice(p);

              return (
                <Card
                  key={p.key}
                  className={`relative rounded-2xl p-6 transition-all ${
                    p.highlight
                      ? "border-2 border-emerald-500 bg-white shadow-xl dark:border-emerald-400 dark:bg-zinc-900"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
                >
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-emerald-500 text-white shadow-lg">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Recommandé
                      </Badge>
                    </div>
                  )}

                  <div className="pt-2">
                    <div className="text-lg font-semibold">{p.name}</div>
                    {p.badge && (
                      <Badge className={`mt-2 ${p.badgeColor}`}>{p.badge}</Badge>
                    )}
                  </div>

                  <div className="mt-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{price.main}</span>
                      {price.sub && <span className="text-zinc-500 dark:text-zinc-400">{price.sub}</span>}
                    </div>
                    {billing === "yearly" && p.priceMonthly !== null && p.priceMonthly > 0 && (
                      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        Facturé {Math.round(p.priceMonthly * 12 * (1 - annualDiscount))}€/an
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Recherches</span>
                      <span className="font-medium">{p.features.searchesPerDay}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Résultats</span>
                      <span className="font-medium">{p.features.results}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Projets</span>
                      <span className="font-medium">{p.features.projects}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Smart Discovery</span>
                      <span className="font-medium">{renderFeatureValue(p.features.smartDiscovery)}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Équipe</span>
                      <span className="font-medium">{renderFeatureValue(p.features.team)}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Export</span>
                      <span className="font-medium">{p.features.export}</span>
                    </li>
                  </ul>

                  <div className="mt-6">
                    <Link href={p.ctaHref}>
                      <Button
                        className={`w-full ${
                          p.highlight
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : ""
                        }`}
                        variant={p.highlight ? "default" : "outline"}
                      >
                        {p.cta}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              Comparatif détaillé
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">Toutes les fonctionnalités en détail</h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              Les essentiels pour décider vite — et les options pro quand ton sourcing s'accélère.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 dark:bg-zinc-800">
                  <TableHead className="w-60 font-semibold">Fonctionnalité</TableHead>
                  <TableHead className="text-center font-semibold">Free</TableHead>
                  <TableHead className="text-center font-semibold bg-emerald-50 dark:bg-emerald-900/20">Premium</TableHead>
                  <TableHead className="text-center font-semibold">Pro</TableHead>
                  <TableHead className="text-center font-semibold">Enterprise</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Recherches / jour", free: "10", premium: "∞", pro: "∞", enterprise: "∞" },
                  { name: "Résultats affichés", free: "50", premium: "Tous", pro: "Tous", enterprise: "Tous" },
                  { name: "Projets", free: "1", premium: "∞", pro: "∞", enterprise: "∞" },
                  { name: "Smart Discovery", free: false, premium: "3 / jour", pro: "∞", enterprise: "∞" },
                  { name: "Membres équipe", free: false, premium: false, pro: "5", enterprise: "∞" },
                  { name: "Boards & favoris", free: true, premium: true, pro: true, enterprise: true },
                  { name: "Export", free: "Basique", premium: "Standard", pro: "Avancé", enterprise: "Sur mesure" },
                  { name: "Support", free: "Email", premium: "Prioritaire", pro: "Dédié", enterprise: "24/7" },
                ].map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-center">
                      {typeof row.free === "boolean" ? (
                        row.free ? <Check className="h-5 w-5 text-emerald-600 mx-auto" /> : <X className="h-5 w-5 text-zinc-300 mx-auto" />
                      ) : (
                        row.free
                      )}
                    </TableCell>
                    <TableCell className="text-center bg-emerald-50/50 dark:bg-emerald-900/10">
                      {typeof row.premium === "boolean" ? (
                        row.premium ? <Check className="h-5 w-5 text-emerald-600 mx-auto" /> : <X className="h-5 w-5 text-zinc-300 mx-auto" />
                      ) : (
                        <span className="font-medium text-emerald-700 dark:text-emerald-400">{row.premium}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? <Check className="h-5 w-5 text-emerald-600 mx-auto" /> : <X className="h-5 w-5 text-zinc-300 mx-auto" />
                      ) : (
                        row.pro
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {typeof row.enterprise === "boolean" ? (
                        row.enterprise ? <Check className="h-5 w-5 text-emerald-600 mx-auto" /> : <X className="h-5 w-5 text-zinc-300 mx-auto" />
                      ) : (
                        row.enterprise
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              Questions fréquentes
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">Besoin d'aide pour choisir ?</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
            {[
              {
                q: "Est-ce que je peux commencer gratuitement ?",
                a: "Oui ! Le plan Free te permet de tester le moteur, sauvegarder des favoris et créer un premier projet. Aucune carte bancaire requise.",
              },
              {
                q: "Que signifie Smart Discovery ?",
                a: "C'est notre recherche augmentée avec matching couleur/matière et suggestions intelligentes. Elle est limitée en Premium, illimitée en Pro.",
              },
              {
                q: "Puis-je changer de plan à tout moment ?",
                a: "Absolument. Tu peux upgrader ou downgrader ton plan quand tu veux. Le changement prend effet immédiatement.",
              },
              {
                q: "Enterprise, c'est pour qui ?",
                a: "Pour les équipes et besoins spécifiques : intégration API, sourcing sur-mesure, règles internes, et accompagnement dédié.",
              },
            ].map((item) => (
              <Card key={item.q} className="rounded-xl border-zinc-200 p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="font-semibold text-zinc-900 dark:text-white">{item.q}</div>
                <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.a}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-zinc-900 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-500 p-8 sm:p-12 text-center">
            <h3 className="text-2xl font-bold text-white sm:text-3xl">Prêt à sourcer plus vite ?</h3>
            <p className="mt-3 text-emerald-100 max-w-xl mx-auto">
              Rejoins les créateurs qui gagnent du temps grâce à Deadstock Search Engine.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-white text-emerald-700 hover:bg-zinc-100">
                  Commencer gratuitement <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                  Voir la démo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-900">
                <span className="text-xs font-bold">DS</span>
              </div>
              <span className="text-sm text-zinc-400">© {new Date().getFullYear()} Deadstock Search Engine</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-400">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <Link href="/search" className="hover:text-white transition-colors">Démo</Link>
              <Link href="/login" className="hover:text-white transition-colors">Connexion</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
