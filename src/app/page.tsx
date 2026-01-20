'use client';

import React, { useState } from 'react';
import ValueChainComparison from '@/components/landing/ValueChainComparison';
import Link from 'next/link';

export default function LandingPageV2() {
  const [activeJourney, setActiveJourney] = useState<'consumer' | 'creator'>('consumer');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Subtle texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-[#0a0a0f] text-sm">
              DS
            </div>
            <span className="font-semibold tracking-tight text-lg">Deadstock</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#concept" className="hover:text-white transition-colors">Le concept</a>
            <a href="#parcours" className="hover:text-white transition-colors">Votre parcours</a>
            <a href="#comment" className="hover:text-white transition-colors">Comment ça marche</a>
            <a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a>
          </div>

          <Link 
            href="/search"
            className="px-5 py-2.5 bg-white text-[#0a0a0f] rounded-full font-medium text-sm hover:bg-white/90 transition-colors"
          >
            Accéder à l&apos;app
          </Link>
        </div>
      </nav>

     {/* Hero Section - Vision-first */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-150 h-150 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div 
          className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-teal-500/10 rounded-full blur-[100px] animate-pulse" 
          style={{ animationDelay: '1s' }} 
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-white/70">La mode circulaire, réinventée</span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
              Du tissu oublié
              <br />
              <span className="bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                au vêtement unique.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-white/60 leading-relaxed mb-4">
              Des millions de mètres de tissus sont détruits chaque année.
              <br />
              Des vêtements identiques sont produits par milliards.
            </p>
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed mb-10">
              <strong className="text-white">Deadstock propose une autre voie</strong> : créez des pièces
              à votre image, seul ou accompagné d&apos;un couturier.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link 
                href="/search"
                className="group px-8 py-4 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all inline-flex items-center"
              >
                Créer ma première pièce
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <a 
                href="#comment"
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Voir comment ça marche
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>268+ tissus deadstock</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>4 fournisseurs vérifiés</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Pièces certifiées uniques</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section id="concept" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Problem */}
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-linear-to-b from-red-500/50 to-transparent rounded-full" />
              <h2 className="text-3xl font-bold mb-6 text-white/90">Le problème</h2>
              <div className="space-y-4 text-lg text-white/60">
                <p>
                  <span className="text-red-400 font-semibold">15 millions</span> de tonnes de textiles
                  sont jetées chaque année en Europe.
                </p>
                <p>
                  Les tissus &quot;deadstock&quot; — invendus, fins de séries, surplus — sont
                  <span className="text-red-400 font-semibold"> détruits faute de débouchés</span>.
                </p>
                <p>
                  Pendant ce temps, nous portons tous les <span className="text-red-400 font-semibold">mêmes vêtements</span> produits
                  par milliards.
                </p>
              </div>
            </div>

            {/* Solution */}
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-linear-to-b from-emerald-500/50 to-transparent rounded-full" />
              <h2 className="text-3xl font-bold mb-6 text-white/90">Notre solution</h2>
              <div className="space-y-4 text-lg text-white/60">
                <p>
                  <span className="text-emerald-400 font-semibold">Deadstock</span> rend ces tissus accessibles
                  aux designers comme aux particuliers.
                </p>
                <p>
                  Choisissez un modèle, trouvez votre tissu, visualisez le résultat,
                  et <span className="text-emerald-400 font-semibold">faites-le réaliser</span> par un couturier près de chez vous.
                </p>
                <p>
                  Un tissu unique, un design choisi, <span className="text-emerald-400 font-semibold">un vêtement
                  qui n&apos;appartient qu&apos;à vous</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

       {/* Value Chain Comparison */}
      <ValueChainComparison />

      {/* Two Journeys Section */}
      <section id="parcours" className="py-32 relative">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-emerald-500/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Choisissez <span className="text-emerald-400">votre parcours</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Que vous soyez débutant ou expert, Deadstock s&apos;adapte à vos besoins.
            </p>
          </div>

          {/* Journey Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1.5 rounded-full bg-white/5 border border-white/10">
              <button
                onClick={() => setActiveJourney('consumer')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeJourney === 'consumer'
                    ? 'bg-emerald-500 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Je veux un vêtement unique
              </button>
              <button
                onClick={() => setActiveJourney('creator')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeJourney === 'creator'
                    ? 'bg-teal-500 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Je crée mes propres designs
              </button>
            </div>
          </div>

          {/* Consumer Journey */}
          {activeJourney === 'consumer' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
                    <span>Parcours guidé</span>
                    <span className="text-white/40">•</span>
                    <span>Aucune compétence requise</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">
                    Faites-vous faire un vêtement unique
                  </h3>
                  <p className="text-lg text-white/60 mb-8">
                    Pas besoin de savoir coudre. Choisissez un modèle, personnalisez-le
                    avec un tissu deadstock, et un couturier le réalise pour vous.
                  </p>

                  {/* Steps */}
                  <div className="space-y-4">
                    {[
                      { num: '1', title: 'Choisissez un modèle', desc: 'Parcourez notre sélection de patrons simples et élégants' },
                      { num: '2', title: 'Sélectionnez votre tissu', desc: 'Filtré automatiquement pour être compatible avec votre choix' },
                      { num: '3', title: 'Visualisez le résultat', desc: 'Voyez votre vêtement avant qu\'il soit cousu grâce à l\'IA' },
                      { num: '4', title: 'Trouvez un couturier', desc: 'Un artisan près de chez vous le réalise pour vous' },
                    ].map((step) => (
                      <div key={step.num} className="flex gap-4 items-start group">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-semibold text-sm shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                          {step.num}
                        </div>
                        <div>
                          <div className="font-medium text-white">{step.title}</div>
                          <div className="text-sm text-white/50">{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual */}
                <div className="relative">
                  <div className="aspect-4/3 rounded-2xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-white/10 p-8">
                    <div className="grid grid-cols-2 gap-4 h-full">
                      <div className="bg-white/5 rounded-xl p-4 flex flex-col">
                        <div className="text-xs text-white/40 mb-2">Étape 1</div>
                        <div className="text-sm text-white/80 font-medium mb-3">Modèle choisi</div>
                        <div className="flex-1 bg-white/5 rounded-lg flex items-center justify-center">
                          <div 
                            className="w-20 h-28 bg-white/10 rounded" 
                            style={{
                              clipPath: 'polygon(20% 0%, 80% 0%, 85% 15%, 100% 15%, 100% 100%, 0% 100%, 0% 15%, 15% 15%)'
                            }} 
                          />
                        </div>
                        <div className="mt-2 text-xs text-white/50">Blouse Lin Simple</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 flex flex-col">
                        <div className="text-xs text-white/40 mb-2">Étape 2</div>
                        <div className="text-sm text-white/80 font-medium mb-3">Tissu sélectionné</div>
                        <div 
                          className="flex-1 bg-linear-to-br from-amber-200 to-amber-100 rounded-lg" 
                          style={{
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)`
                          }} 
                        />
                        <div className="mt-2 text-xs text-white/50">Lin naturel • 12€/m</div>
                      </div>
                      <div className="col-span-2 bg-white/5 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-linear-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-white font-medium">Résultat : pièce certifiée unique</div>
                          <div className="text-xs text-white/50">Vérifié par recherche d&apos;image inversée</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Creator Journey */}
          {activeJourney === 'creator' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm mb-6">
                    <span>Parcours créatif</span>
                    <span className="text-white/40">•</span>
                    <span>Pour designers & couturiers</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">
                    Créez vos propres designs
                  </h3>
                  <p className="text-lg text-white/60 mb-8">
                    Outils avancés pour designers, étudiants en mode et couturiers professionnels.
                    De l&apos;inspiration à la réalisation.
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: '🎨', title: 'Moodboards', desc: 'Organisez vos inspirations' },
                      { icon: '🔍', title: 'Recherche contextuelle', desc: 'Trouvez le tissu parfait' },
                      { icon: '✨', title: 'Visualisation IA', desc: 'Appliquez vos tissus sur vos designs' },
                      { icon: '📐', title: 'Calcul métrage', desc: 'Estimations précises' },
                      { icon: '✂️', title: 'Plan de coupe', desc: 'Optimisation automatique' },
                      { icon: '📋', title: 'Projets', desc: 'Du concept à la réalisation' },
                    ].map((feature) => (
                      <div key={feature.title} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-teal-500/30 transition-colors group">
                        <div className="text-2xl mb-2">{feature.icon}</div>
                        <div className="font-medium text-white text-sm">{feature.title}</div>
                        <div className="text-xs text-white/50">{feature.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual - Board preview */}
                <div className="relative">
                  <div className="aspect-4/3 rounded-2xl bg-[#1a1a24] border border-white/10 overflow-hidden">
                    {/* Board toolbar */}
                    <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                      <div className="w-3 h-3 rounded-full bg-green-400/60" />
                      <div className="ml-4 text-xs text-white/40">Mon projet • Collection été</div>
                    </div>
                    
                    {/* Board content */}
                    <div className="p-4 grid grid-cols-3 gap-3">
                      {/* Inspiration image */}
                      <div className="aspect-square rounded-lg bg-linear-to-br from-rose-300 to-pink-200 opacity-80" />
                      
                      {/* Color palette */}
                      <div className="aspect-square rounded-lg bg-white/5 p-2 flex flex-col gap-1">
                        <div className="flex-1 rounded bg-amber-200" />
                        <div className="flex-1 rounded bg-emerald-600" />
                        <div className="flex-1 rounded bg-stone-100" />
                        <div className="flex-1 rounded bg-stone-800" />
                      </div>
                      
                      {/* Textile */}
                      <div className="aspect-square rounded-lg bg-linear-to-br from-amber-200 to-amber-100 relative overflow-hidden">
                        <div 
                          className="absolute inset-0 opacity-30" 
                          style={{
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,0.05) 8px, rgba(0,0,0,0.05) 16px)`
                          }} 
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/50 text-[10px] text-white">
                          Lin
                        </div>
                      </div>
                      
                      {/* Note */}
                      <div className="aspect-square rounded-lg bg-yellow-400/90 p-2">
                        <div className="text-[10px] text-yellow-900 font-medium">Note</div>
                        <div className="text-[8px] text-yellow-900/70 mt-1">Vérifier dispo 3m minimum</div>
                      </div>
                      
                      {/* Calculation */}
                      <div className="aspect-square rounded-lg bg-white/5 border border-white/10 p-2">
                        <div className="text-[10px] text-white/60">Métrage</div>
                        <div className="text-lg text-white font-bold mt-1">2.4m</div>
                      </div>
                      
                      {/* Search result */}
                      <div className="aspect-square rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xl">🔍</div>
                          <div className="text-[10px] text-teal-400 mt-1">12 tissus</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Uniqueness Certificate Section */}
      <section id="comment" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
                <span>Exclusivité Deadstock</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Votre pièce,{' '}
                <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  certifiée unique
                </span>
              </h2>
              <p className="text-lg text-white/60 mb-6">
                Grâce à la recherche d&apos;image inversée, nous vérifions que votre création
                n&apos;existe <strong className="text-white">nulle part ailleurs</strong> sur internet.
              </p>
              <p className="text-lg text-white/60 mb-8">
                Chaque pièce reçoit un <strong className="text-white">certificat d&apos;unicité</strong> avec
                QR code — la preuve technologique que vous portez quelque chose de vraiment unique.
              </p>

              <div className="space-y-3">
                {[
                  'Scan automatique après création',
                  'Vérification sur 15+ milliards d\'images',
                  'QR code à coudre dans le vêtement',
                  'Passeport digital avec traçabilité complète'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificate visual */}
            <div className="relative flex justify-center">
              <div className="w-80 bg-[#1a1a24] rounded-2xl border border-white/10 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/40">Vérifié le</div>
                    <div className="text-sm text-white">20 Jan 2026</div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-white mb-1">Certificat d&apos;Unicité</div>
                  <div className="text-sm text-white/50">Pièce #DS-2026-0142</div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-white/40">Résultat du scan</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                      ✓ Unique
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Google Images</span>
                      <span className="text-emerald-400">0 résultat</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Bases e-commerce</span>
                      <span className="text-emerald-400">0 résultat</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Réseaux sociaux</span>
                      <span className="text-emerald-400">0 résultat</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center">
                    <div 
                      className="w-12 h-12 bg-[#1a1a24]" 
                      style={{
                        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px),
                                         repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)`
                      }} 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white/40">Scannez pour vérifier</div>
                    <div className="text-sm text-white">deadstock.app/verify/0142</div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-xl bg-linear-to-br from-purple-500/20 to-pink-500/20 blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/2 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Le vrai luxe, c&apos;est de
              <span className="bg-linear-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"> ne ressembler à personne</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                old: 'Logo visible = statut',
                new: 'Absence de logo = confiance en soi',
                icon: '👁️'
              },
              {
                old: 'Édition limitée',
                new: 'Pièce unique, littéralement',
                icon: '✨'
              },
              {
                old: 'Fabriqué loin, par des inconnus',
                new: 'Fabriqué près, par un artisan',
                icon: '🏠'
              }
            ].map((item) => (
              <div key={item.old} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-colors group">
                <div className="text-3xl mb-4">{item.icon}</div>
                <div className="mb-4">
                  <div className="text-sm text-white/40 line-through mb-1">{item.old}</div>
                  <div className="text-lg text-white font-medium">{item.new}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-linear-to-t from-emerald-500/10 to-transparent" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à créer votre première
            <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"> pièce unique</span> ?
          </h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Rejoignez le mouvement de la mode circulaire et personnelle.
            Commencez gratuitement, sans engagement.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/search"
              className="group px-10 py-5 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all inline-flex items-center"
            >
              Commencer gratuitement
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors">
              Voir la démo
            </button>
          </div>

          <div className="mt-8 flex justify-center gap-8 text-sm text-white/40">
            <span>✓ Accès gratuit</span>
            <span>✓ Pas de carte requise</span>
            <span>✓ 268+ tissus disponibles</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-[#0a0a0f] text-sm">
                DS
              </div>
              <span className="font-semibold">Deadstock</span>
              <span className="text-white/40 text-sm">— Du tissu oublié au vêtement unique</span>
            </div>
            
            <div className="flex gap-8 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
