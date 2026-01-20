'use client';

import React, { useState } from 'react';

// Icons as simple SVG components (outline style)
const Icons = {
  Factory: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  Recycle: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
    </svg>
  ),
  Scissors: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 11-5.196 3 3 3 0 015.196-3zm1.536-.887a2.165 2.165 0 001.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863l2.077-1.199m0-3.328a4.323 4.323 0 012.068-1.379l5.325-1.628a4.5 4.5 0 012.48-.044l.803.215-7.794 4.5m-2.882-1.664A4.331 4.331 0 0010.607 12m3.736 0l7.794 4.5-.802.215a4.5 4.5 0 01-2.48-.043l-5.326-1.629a4.324 4.324 0 01-2.068-1.379M14.343 12l-2.882 1.664" />
    </svg>
  ),
  User: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  Truck: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  Leaf: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4-4-8-7.582-8-12a8 8 0 1116 0c0 4.418-4 8-8 12z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 13V7m0 0l3 3m-3-3l-3 3" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  Home: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  Certificate: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  ),
};

interface StepProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  highlight?: boolean;
}

function Step({ icon, title, subtitle, highlight }: StepProps) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${highlight ? 'bg-white/5' : ''}`}>
      <div className={`shrink-0 ${highlight ? 'text-emerald-400' : 'text-white/40'}`}>
        {icon}
      </div>
      <div>
        <div className={`text-sm font-medium ${highlight ? 'text-white' : 'text-white/70'}`}>{title}</div>
        <div className="text-xs text-white/50">{subtitle}</div>
      </div>
    </div>
  );
}

export default function ValueChainComparison() {
  const [activeTab, setActiveTab] = useState<'economic' | 'carbon' | 'quality'>('economic');

  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/2 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-6">
            <span>Comparatif transparent</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            La différence{' '}
            <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Deadstock
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Même budget qu&apos;une marque premium, mais une chaîne de valeur radicalement différente.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10">
            {[
              { id: 'economic', label: '💰 Économique', color: 'amber' },
              { id: 'carbon', label: '🌱 Carbone', color: 'emerald' },
              { id: 'quality', label: '✨ Qualité', color: 'purple' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-500 text-white`
                    : 'text-white/60 hover:text-white'
                }`}
                style={{
                  backgroundColor: activeTab === tab.id 
                    ? tab.id === 'economic' ? '#f59e0b' 
                    : tab.id === 'carbon' ? '#10b981' 
                    : '#8b5cf6'
                    : 'transparent'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Marque Premium */}
          <div className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-white/2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/40 mb-1">Circuit classique</div>
                  <div className="text-lg font-semibold text-white/90">Marque Premium</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">~180€</div>
                  <div className="text-xs text-white/40">Prix moyen robe</div>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-2">
              {activeTab === 'economic' && (
                <>
                  <Step 
                    icon={<Icons.Factory />} 
                    title="Production tissu neuf" 
                    subtitle="Matière première cultivée ou synthétisée"
                  />
                  <Step 
                    icon={<Icons.Globe />} 
                    title="Sourcing international" 
                    subtitle="Chine, Inde, Turquie... négociation volume"
                  />
                  <Step 
                    icon={<Icons.Scissors />} 
                    title="Confection délocalisée" 
                    subtitle="Ateliers Portugal, Maroc ou Asie"
                  />
                  <Step 
                    icon={<Icons.Truck />} 
                    title="Logistique mondiale" 
                    subtitle="Entrepôt central → boutiques → vous"
                  />
                  <Step 
                    icon={<Icons.ShoppingBag />} 
                    title="Marge retail" 
                    subtitle="×3 à ×5 entre production et prix final"
                  />
                </>
              )}
              {activeTab === 'carbon' && (
                <>
                  <Step 
                    icon={<Icons.Factory />} 
                    title="Production matière" 
                    subtitle="~15 kg CO2 (coton conventionnel)"
                  />
                  <Step 
                    icon={<Icons.Truck />} 
                    title="Transport matière" 
                    subtitle="~3 kg CO2 (8000+ km)"
                  />
                  <Step 
                    icon={<Icons.Scissors />} 
                    title="Confection" 
                    subtitle="~2 kg CO2 (énergie atelier)"
                  />
                  <Step 
                    icon={<Icons.Truck />} 
                    title="Transport produit fini" 
                    subtitle="~2 kg CO2 (12000+ km)"
                  />
                  <Step 
                    icon={<Icons.ShoppingBag />} 
                    title="Distribution" 
                    subtitle="~1 kg CO2 (boutique, livraison)"
                  />
                </>
              )}
              {activeTab === 'quality' && (
                <>
                  <Step 
                    icon={<Icons.Factory />} 
                    title="Tissu standard" 
                    subtitle="Qualité correcte, production optimisée coût"
                  />
                  <Step 
                    icon={<Icons.Scissors />} 
                    title="Confection série" 
                    subtitle="Process industriel, contrôle qualité variable"
                  />
                  <Step 
                    icon={<Icons.Copy />} 
                    title="Modèle reproduit" 
                    subtitle="Des milliers d'exemplaires identiques"
                  />
                  <Step 
                    icon={<Icons.Clock />} 
                    title="Durée de vie ~3-5 ans" 
                    subtitle="Usure normale, démodé avant usé"
                  />
                  <Step 
                    icon={<Icons.ShoppingBag />} 
                    title="Valeur revente faible" 
                    subtitle="Seconde main saturée, peu de demande"
                  />
                </>
              )}
            </div>

            {/* Bottom stats */}
            <div className="px-6 py-4 border-t border-white/10 bg-white/2">
              {activeTab === 'economic' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Répartition opaque</span>
                  <span className="text-white/70">Marge marque : ~60%</span>
                </div>
              )}
              {activeTab === 'carbon' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Empreinte totale</span>
                  <span className="text-red-400 font-semibold">~23 kg CO2</span>
                </div>
              )}
              {activeTab === 'quality' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Unicité</span>
                  <span className="text-white/70">1 parmi des milliers</span>
                </div>
              )}
            </div>
          </div>

          {/* Deadstock */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/3 overflow-hidden">
            <div className="px-6 py-4 border-b border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-400 mb-1">Circuit Deadstock</div>
                  <div className="text-lg font-semibold text-white">Votre pièce unique</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">~150-200€</div>
                  <div className="text-xs text-white/40">Tissu + façon couturier</div>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-2">
              {activeTab === 'economic' && (
                <>
                  <Step 
                    icon={<Icons.Recycle />} 
                    title="Tissu deadstock" 
                    subtitle="Fin de série maisons de luxe, déjà produit"
                    highlight
                  />
                  <Step 
                    icon={<Icons.MapPin />} 
                    title="Sourcing local" 
                    subtitle="Fournisseurs français et européens"
                    highlight
                  />
                  <Step 
                    icon={<Icons.User />} 
                    title="Artisan local" 
                    subtitle="Couturier près de chez vous, juste rémunéré"
                    highlight
                  />
                  <Step 
                    icon={<Icons.Home />} 
                    title="Circuit court" 
                    subtitle="Fournisseur → couturier → vous"
                    highlight
                  />
                  <Step 
                    icon={<Icons.Heart />} 
                    title="Valeur directe" 
                    subtitle="Chaque euro va à la matière ou à l'artisan"
                    highlight
                  />
                </>
              )}
              {activeTab === 'carbon' && (
                <>
                  <Step 
                    icon={<Icons.Recycle />} 
                    title="Matière existante" 
                    subtitle="0 kg CO2 (déjà produit)"
                    highlight
                  />
                  <Step 
                    icon={<Icons.MapPin />} 
                    title="Transport local" 
                    subtitle="~0.5 kg CO2 (< 500 km)"
                    highlight
                  />
                  <Step 
                    icon={<Icons.User />} 
                    title="Confection locale" 
                    subtitle="~1 kg CO2 (atelier proche)"
                    highlight
                  />
                  <Step 
                    icon={<Icons.Home />} 
                    title="Livraison directe" 
                    subtitle="~0.5 kg CO2 (circuit court)"
                    highlight
                  />
                  <Step 
                    icon={<Icons.Sparkles />} 
                    title="Zéro surproduction" 
                    subtitle="Fait pour vous, pas de stock"
                    highlight
                  />
                </>
              )}
              {activeTab === 'quality' && (
                <>
                  <Step 
                    icon={<Icons.Sparkles />} 
                    title="Tissu haut de gamme" 
                    subtitle="Deadstock de maisons de luxe"
                    highlight
                  />
                  <Step 
                    icon={<Icons.User />} 
                    title="Confection artisanale" 
                    subtitle="Attention aux détails, finitions main"
                    highlight
                  />
                  <Step 
                    icon={<Icons.Certificate />} 
                    title="Pièce unique certifiée" 
                    subtitle="Vérifiée par recherche d'image inversée"
                    highlight
                  />
                  <Step 
                    icon={<Icons.Clock />} 
                    title="Durée de vie 10+ ans" 
                    subtitle="Qualité supérieure, intemporel"
                    highlight
                  />
                  <Step 
                    icon={<Icons.Heart />} 
                    title="Valeur patrimoniale" 
                    subtitle="Histoire unique, transmission possible"
                    highlight
                  />
                </>
              )}
            </div>

            {/* Bottom stats */}
            <div className="px-6 py-4 border-t border-emerald-500/20 bg-emerald-500/5">
              {activeTab === 'economic' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Répartition transparente</span>
                  <span className="text-emerald-400 font-semibold">100% matière + artisan</span>
                </div>
              )}
              {activeTab === 'carbon' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Empreinte totale</span>
                  <span className="text-emerald-400 font-semibold">~2 kg CO2 (-91%)</span>
                </div>
              )}
              {activeTab === 'quality' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Unicité</span>
                  <span className="text-emerald-400 font-semibold">1 seule au monde</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom message */}
        <div className="mt-12 text-center">
          <p className="text-white/50 text-sm max-w-2xl mx-auto">
            Même prix, autre histoire. Avec Deadstock, votre budget va directement 
            à la qualité du tissu et au savoir-faire d&apos;un artisan local — 
            pas aux intermédiaires ni à la publicité.
          </p>
        </div>
      </div>
    </section>
  );
}
