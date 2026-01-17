// src/app/page.tsx
import Link from "next/link";
import { ArrowRight, Check, Layers, Search, Sparkles, Timer, Shield, Zap, Heart, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <span className="text-sm font-bold">DS</span>
            </div>
            <span className="hidden text-sm font-semibold sm:inline">Deadstock Search Engine</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm sm:flex">
            <a href="#solution" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              Solution
            </a>
            <a href="#features" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              Fonctionnalités
            </a>
            <a href="#how" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              Comment ça marche
            </a>
            <Link href="/pricing" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              Tarifs
            </Link>
          </nav>

          <div className="flex items-center gap-2">
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
      <section className="relative overflow-hidden bg-linear-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
          <div className="space-y-6">
            <Badge className="w-fit bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
              🌱 Nouveau — moteur de sourcing deadstock multi-sources
            </Badge>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Trouvez le textile deadstock parfait, <span className="text-emerald-600 dark:text-emerald-400">sans perdre des heures</span>.
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Une recherche unifiée, des boards pour organiser vos trouvailles, et un workflow pensé pour les créateurs.
              <strong className="text-zinc-900 dark:text-white"> Moins de tabs, plus de décisions.</strong>
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                  Commencer gratuitement <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-zinc-300 dark:border-zinc-700">
                  Voir les tarifs
                </Button>
              </Link>
              <Link href="/boards" className="w-full sm:w-auto">
  <Button size="lg" variant="ghost" className="w-full">
                  Voir la démo
                </Button>
              </Link>
            </div>

            <div className="flex flex-col gap-4 pt-2 text-sm sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Accès gratuit immédiat</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>Données et favoris sauvegardés</span>
              </div>
            </div>
          </div>

          {/* Mockup */}
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-linear-to-tr from-emerald-100/50 to-zinc-100/50 blur-2xl dark:from-emerald-900/20 dark:to-zinc-800/20" />
            <Card className="overflow-hidden rounded-2xl border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-500">Aperçu interface</div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
                  <Search className="h-4 w-4 text-zinc-400" />
                  <div className="text-sm text-zinc-500">
                    satin noir • 150cm • min 3m • &lt; 15€/m
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {[
                    { title: "Satin viscose — coupon 6m", meta: "8.90€/m • 53.4€", tag: "Coupon", tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
                    { title: "Twill noir — coupe à la demande", meta: "12.30€/m • MOQ 2m", tag: "Cut-to-order", tagColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
                    { title: "Crêpe noir — coupon 3m", meta: "10.10€/m • 30.3€", tag: "Coupon", tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-zinc-500">{item.meta}</div>
                      </div>
                      <Badge className={`ml-3 shrink-0 ${item.tagColor}`}>
                        {item.tag}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 p-4 text-sm dark:bg-emerald-900/20">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Timer className="h-4 w-4" />
                    <span className="font-medium">-70% de temps de sourcing</span>
                  </div>
                  <div className="text-emerald-600/60 dark:text-emerald-500/60">exemple</div>
                </div>
              </div>
            </Card>

            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-zinc-500">
              <span className="font-medium">268+ textiles</span>
              <span>•</span>
              <span className="font-medium">4 sources</span>
              <span>•</span>
              <span className="font-medium">boards & favoris</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section id="solution" className="bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Le défi</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pourquoi sourcer du deadstock est si compliqué ?</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Problème */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <span className="text-lg">😫</span>
                </div>
                <h3 className="text-xl font-semibold">Le problème</h3>
              </div>

              <div className="grid gap-3">
                {[
                  { icon: <Timer className="h-5 w-5" />, text: "10+ sites à parcourir pour un même besoin", color: "text-red-600" },
                  { icon: <Search className="h-5 w-5" />, text: "Filtres incohérents d'un fournisseur à l'autre", color: "text-red-600" },
                  { icon: <Layers className="h-5 w-5" />, text: "Difficile d'organiser et partager ses trouvailles", color: "text-red-600" },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className={item.color}>{item.icon}</div>
                    <div className="text-sm font-medium">{item.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Solution */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <span className="text-lg">✨</span>
                </div>
                <h3 className="text-xl font-semibold">Notre solution</h3>
              </div>

              <div className="grid gap-3">
                {[
                  {
                    icon: <Search className="h-5 w-5" />,
                    title: "DB unifiée",
                    desc: "Une recherche, plusieurs sources, filtres cohérents.",
                    color: "text-emerald-600",
                  },
                  {
                    icon: <Sparkles className="h-5 w-5" />,
                    title: "Découverte intelligente",
                    desc: "Suggestions et matching couleur/matière.",
                    color: "text-emerald-600",
                  },
                  {
                    icon: <Layers className="h-5 w-5" />,
                    title: "Boards & workflow",
                    desc: "Organisez, annotez, exportez vos sélections.",
                    color: "text-emerald-600",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/10"
                  >
                    <div className={`mt-0.5 ${item.color}`}>{item.icon}</div>
                    <div>
                      <div className="text-sm font-semibold">{item.title}</div>
                      <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Fonctionnalités</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tout pour sourcer plus vite</h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Des outils pensés pour les créateurs qui veulent décider sereinement.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Search className="h-6 w-6" />, title: "Recherche multi-sources", desc: "Filtres cohérents et résultats unifiés de 4+ fournisseurs.", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
              { icon: <Layers className="h-6 w-6" />, title: "Boards design", desc: "Moodboards, zones, et organisation visuelle de vos sélections.", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
              { icon: <Zap className="h-6 w-6" />, title: "Calculateur métrage", desc: "Estimez rapidement les besoins pour votre projet.", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
              { icon: <Heart className="h-6 w-6" />, title: "Favoris & alertes", desc: "Gardez le meilleur sous la main, soyez notifié.", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
              { icon: <Sparkles className="h-6 w-6" />, title: "Impact tracking", desc: "Suivez l'impact environnemental de vos choix.", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
              { icon: <FileText className="h-6 w-6" />, title: "Export pro", desc: "Partage facile avec clients et ateliers.", color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
            ].map((f) => (
              <Card key={f.title} className="rounded-xl border-zinc-200 p-6 hover:shadow-lg transition-shadow dark:border-zinc-800 dark:bg-zinc-900">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <div className="text-base font-semibold">{f.title}</div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{f.desc}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">En 3 étapes</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Comment ça marche</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "1", title: "Décrivez votre besoin", desc: "Couleur, matière, budget, quantité — nos filtres s'adaptent.", color: "bg-blue-600" },
              { step: "2", title: "Comparez & sauvegardez", desc: "Favoris et boards pour trier et organiser rapidement.", color: "bg-purple-600" },
              { step: "3", title: "Passez en production", desc: "Export, specs techniques et partage avec votre équipe.", color: "bg-emerald-600" },
            ].map((s) => (
              <div key={s.step} className="relative">
                <Card className="rounded-xl border-zinc-200 p-6 dark:border-zinc-800 dark:bg-zinc-900 h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white text-lg font-bold ${s.color}`}>
                      {s.step}
                    </div>
                    <div className="text-lg font-semibold">{s.title}</div>
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">{s.desc}</div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-zinc-900 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-500 p-8 sm:p-12 text-center">
            <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Prêt à sourcer plus vite ?</h3>
            <p className="mt-4 text-lg text-emerald-100 max-w-2xl mx-auto">
              Créez un compte gratuit et commencez à constituer vos boards dès maintenant.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-white text-emerald-700 hover:bg-zinc-100">
                  Commencer gratuitement <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                  Comparer les offres
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
              <Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
              <Link href="/boards" className="hover:text-white transition-colors">Démo</Link>
              <Link href="/login" className="hover:text-white transition-colors">Connexion</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
