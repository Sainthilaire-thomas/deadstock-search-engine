# SPEC : Design System & Parcours Designer

**Date** : 1 Janvier 2026  
**Version** : 1.0  
**Status** : 📝 Draft - À valider  
**Auteur** : Thomas

---

## 🎨 Principes Design

### Vision
**Design sobre, moderne et épuré** inspiré par :
- Linear (minimaliste, focus produit)
- Vercel (épuré, typographie claire)
- Stripe (sobre, professionnel)

### Principes Clés
1. ✅ **Minimal** : Pas de fioritures, focus sur le contenu
2. ✅ **Monochrome** : Nuances de gris + 1 accent color
3. ✅ **Typographie** : Hierarchie claire, lisibilité
4. ✅ **Espacement** : Breathing room, pas de surcharge
5. ✅ **Icons outline** : Lucide React (pas d'emojis pleins)
6. ✅ **Animations subtiles** : Micro-interactions discrètes

---

## 🎨 Design Tokens

### Palette Couleurs

#### Neutral (Grayscale)
```css
--color-bg: #FFFFFF;           /* Background principal */
--color-bg-subtle: #FAFAFA;    /* Background secondaire */
--color-bg-muted: #F5F5F5;     /* Background cards hover */

--color-border: #E5E5E5;       /* Borders principales */
--color-border-subtle: #F0F0F0;/* Borders légères */

--color-text: #171717;         /* Text principal */
--color-text-secondary: #737373; /* Text secondaire */
--color-text-tertiary: #A3A3A3;  /* Text tertiaire */
--color-text-disabled: #D4D4D4;  /* Text désactivé */
```

#### Accent (Brand)
```css
--color-accent: #0A0A0A;       /* Noir presque pur (CTA, focus) */
--color-accent-hover: #262626; /* Hover state */
--color-accent-subtle: #F5F5F5;/* Accent background */
```

#### Semantic
```css
--color-success: #16A34A;      /* Vert (complété) */
--color-warning: #EA580C;      /* Orange (en cours) */
--color-info: #0284C7;         /* Bleu (disponible) */
--color-locked: #A3A3A3;       /* Gris (verrouillé) */
```

#### Dark Mode
```css
--color-bg-dark: #0A0A0A;
--color-bg-subtle-dark: #171717;
--color-text-dark: #FAFAFA;
--color-text-secondary-dark: #A3A3A3;
--color-border-dark: #262626;
```

---

### Typographie

```css
/* Font Stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Type Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
```

---

### Spacing

```css
/* Base: 4px */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

---

### Borders & Radius

```css
--border-width: 1px;
--border-width-thick: 2px;

--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.5rem;   /* 8px */
--radius-lg: 0.75rem;  /* 12px */
--radius-xl: 1rem;     /* 16px */
```

---

### Shadows

```css
/* Subtiles, jamais agressives */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.05);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.05);
```

---

## 🧩 Composants UI

### Sidebar Parcours

#### Structure
```tsx
<Sidebar
  variant="collapsible"
  defaultOpen={false}
  currentStep="sourcing"
  steps={DESIGN_JOURNEY_STEPS}
/>
```

#### États Visuels

**ÉTAT RÉDUIT (par défaut)** :
```
┌──┐
│  │  ← 56px width
│ ⚡│  ← Icon outline uniquement
│  │
│🎯│  ← Dot indicator sur étape courante
│  │
│📐│
│  │
│🔍│
│  │
│✓ │
│  │
│🛒│
│  │
│🏭│
│  │
│🌱│
│  │
└──┘
```

**ÉTAT DÉPLOYÉ** :
```
┌──────────────┐
│              │  ← 240px width
│  PARCOURS    │  ← Header léger
│              │
│  ⚡ Idée     │  ← Icon + Label
│  ✓           │  ← Statut (discret)
│              │
│  🎯 Inspiration│
│  ⏳ Phase 2  │  ← Info contextuelle
│              │
│  📐 Design   │
│  ✓           │
│              │
│  📏 Calcul   │
│  ✓ 17.5m    │  ← Info utile
│              │
│  🔍 Sourcing │  ← Étape courante
│  ● En cours │  ← Statut visible
│              │
│  ✓ Validation│
│              │
│  🛒 Achat    │
│              │
│  🏭 Production│
│  🔒 Phase 4  │
│              │
│  🌱 Impact   │
│  🔒 Phase 5  │
│              │
└──────────────┘
```

---

### Icônes du Parcours (Lucide React)

**Avec variantes outline** :

```typescript
import {
  Lightbulb,      // Idée
  Palette,        // Inspiration  
  PenTool,        // Design
  Ruler,          // Calcul
  Search,         // Sourcing
  CheckCircle,    // Validation
  ShoppingCart,   // Achat
  Factory,        // Production
  Leaf            // Impact
} from 'lucide-react';

const DESIGN_JOURNEY_STEPS = [
  {
    id: 'idea',
    icon: Lightbulb,
    label: 'Idée',
    status: 'completed',
    phase: 'mvp'
  },
  {
    id: 'inspiration',
    icon: Palette,
    label: 'Inspiration',
    status: 'locked',
    phase: 'phase-2',
    tooltip: 'Mood boards & nuancier'
  },
  {
    id: 'design',
    icon: PenTool,
    label: 'Design',
    status: 'completed',
    phase: 'mvp'
  },
  {
    id: 'calculation',
    icon: Ruler,
    label: 'Calcul',
    status: 'completed',
    phase: 'mvp',
    meta: '17.5m' // Info contextuelle
  },
  {
    id: 'sourcing',
    icon: Search,
    label: 'Sourcing',
    status: 'current',
    phase: 'mvp'
  },
  {
    id: 'validation',
    icon: CheckCircle,
    label: 'Validation',
    status: 'available',
    phase: 'mvp'
  },
  {
    id: 'purchase',
    icon: ShoppingCart,
    label: 'Achat',
    status: 'available',
    phase: 'mvp'
  },
  {
    id: 'production',
    icon: Factory,
    label: 'Production',
    status: 'locked',
    phase: 'phase-4',
    tooltip: 'Kanban & tracking'
  },
  {
    id: 'impact',
    icon: Leaf,
    label: 'Impact',
    status: 'locked',
    phase: 'phase-5',
    tooltip: 'Calcul CO2 & certificats'
  }
];
```

---

### Statuts Visuels

#### Icônes de Statut (outline)
```typescript
import { 
  Check,        // Completed
  Circle,       // Available
  Lock,         // Locked
  Clock,        // Coming Soon
  Loader        // Current (avec animation)
} from 'lucide-react';
```

#### Couleurs par Statut
```typescript
const STATUS_STYLES = {
  completed: {
    icon: 'text-neutral-400',
    bg: 'bg-neutral-50',
    border: 'border-neutral-200'
  },
  current: {
    icon: 'text-neutral-900',
    bg: 'bg-neutral-100',
    border: 'border-neutral-300'
  },
  available: {
    icon: 'text-neutral-500',
    bg: 'bg-white',
    border: 'border-neutral-200'
  },
  locked: {
    icon: 'text-neutral-300',
    bg: 'bg-neutral-50',
    border: 'border-neutral-100'
  }
};
```

---

### Animation Sidebar

```css
/* Transition fluide */
.sidebar {
  transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: width;
}

/* État réduit */
.sidebar-collapsed {
  width: 56px;
}

/* État déployé */
.sidebar-expanded {
  width: 240px;
}

/* Fade in labels */
.sidebar-label {
  opacity: 0;
  transition: opacity 150ms ease-in;
}

.sidebar-expanded .sidebar-label {
  opacity: 1;
  transition-delay: 100ms;
}
```

---

### Composant Sidebar (Code)

```tsx
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DesignJourneyStep } from '@/features/journey/domain/types';

interface SidebarProps {
  currentStep: string;
  steps: DesignJourneyStep[];
  defaultOpen?: boolean;
}

export function Sidebar({ currentStep, steps, defaultOpen = false }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <aside 
      className={cn(
        'sidebar',
        'fixed left-0 top-16 h-[calc(100vh-4rem)]',
        'bg-white border-r border-neutral-200',
        'transition-all duration-200 ease-in-out',
        isOpen ? 'w-60' : 'w-14'
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'absolute -right-3 top-6',
          'w-6 h-6 rounded-full',
          'bg-white border border-neutral-200',
          'flex items-center justify-center',
          'hover:bg-neutral-50 transition-colors',
          'shadow-sm'
        )}
      >
        {isOpen ? (
          <ChevronLeft className="w-3 h-3 text-neutral-600" />
        ) : (
          <ChevronRight className="w-3 h-3 text-neutral-600" />
        )}
      </button>

      {/* Header */}
      {isOpen && (
        <div className="px-4 py-6 border-b border-neutral-100">
          <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Parcours
          </h2>
        </div>
      )}

      {/* Steps */}
      <nav className="p-2">
        {steps.map((step) => (
          <SidebarStep
            key={step.id}
            step={step}
            isOpen={isOpen}
            isCurrent={step.id === currentStep}
          />
        ))}
      </nav>
    </aside>
  );
}

interface SidebarStepProps {
  step: DesignJourneyStep;
  isOpen: boolean;
  isCurrent: boolean;
}

function SidebarStep({ step, isOpen, isCurrent }: SidebarStepProps) {
  const Icon = step.icon;
  
  return (
    <div
      className={cn(
        'group relative',
        'flex items-center gap-3',
        'px-2 py-2.5 rounded-lg',
        'transition-colors duration-150',
        isCurrent && 'bg-neutral-100',
        !isCurrent && step.status !== 'locked' && 'hover:bg-neutral-50',
        step.status === 'locked' && 'opacity-40 cursor-not-allowed'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0',
        isCurrent ? 'text-neutral-900' : 'text-neutral-500'
      )}>
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>

      {/* Label & Meta (visible quand open) */}
      {isOpen && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              'text-sm font-medium truncate',
              isCurrent ? 'text-neutral-900' : 'text-neutral-700'
            )}>
              {step.label}
            </span>
            
            {/* Status Icon */}
            <StatusIcon status={step.status} />
          </div>
          
          {/* Meta info */}
          {step.meta && (
            <span className="text-xs text-neutral-500 mt-0.5 block">
              {step.meta}
            </span>
          )}
          
          {/* Phase info pour locked */}
          {step.status === 'locked' && step.tooltip && (
            <span className="text-xs text-neutral-400 mt-0.5 block">
              {step.tooltip}
            </span>
          )}
        </div>
      )}

      {/* Tooltip (visible quand collapsed) */}
      {!isOpen && (
        <div className={cn(
          'absolute left-full ml-2',
          'px-2 py-1 rounded-md',
          'bg-neutral-900 text-white text-xs',
          'whitespace-nowrap',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-150',
          'pointer-events-none',
          'z-50'
        )}>
          {step.label}
          {step.meta && ` • ${step.meta}`}
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  const iconClass = "w-4 h-4";
  
  switch (status) {
    case 'completed':
      return <Check className={cn(iconClass, 'text-neutral-400')} strokeWidth={2} />;
    case 'current':
      return <Circle className={cn(iconClass, 'text-neutral-900 fill-neutral-900')} strokeWidth={2} />;
    case 'locked':
      return <Lock className={cn(iconClass, 'text-neutral-300')} strokeWidth={1.5} />;
    default:
      return null;
  }
}
```

---

## 📱 Adaptation Mobile

### Bottom Navigation

```tsx
'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function MobileJourneyNav({ currentStep, steps }: MobileJourneyNavProps) {
  return (
    <>
      {/* Bottom Nav - 5 premiers steps */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {steps.slice(0, 4).map((step) => {
            const Icon = step.icon;
            const isCurrent = step.id === currentStep;
            
            return (
              <button
                key={step.id}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg',
                  'transition-colors',
                  isCurrent && 'bg-neutral-100',
                  !isCurrent && 'hover:bg-neutral-50'
                )}
              >
                <Icon 
                  className={cn(
                    'w-5 h-5',
                    isCurrent ? 'text-neutral-900' : 'text-neutral-500'
                  )} 
                  strokeWidth={1.5}
                />
                <span className={cn(
                  'text-xs',
                  isCurrent ? 'text-neutral-900 font-medium' : 'text-neutral-600'
                )}>
                  {step.label}
                </span>
              </button>
            );
          })}

          {/* Menu "Plus" */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-neutral-50">
                <MoreHorizontal className="w-5 h-5 text-neutral-500" strokeWidth={1.5} />
                <span className="text-xs text-neutral-600">Plus</span>
              </button>
            </SheetTrigger>
            
            <SheetContent side="bottom" className="h-[80vh]">
              <div className="py-4">
                <h3 className="text-sm font-medium text-neutral-900 mb-4">
                  Parcours Complet
                </h3>
                
                <div className="space-y-1">
                  {steps.map((step) => {
                    const Icon = step.icon;
                    const isCurrent = step.id === currentStep;
                    
                    return (
                      <div
                        key={step.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg',
                          isCurrent && 'bg-neutral-100'
                        )}
                      >
                        <Icon 
                          className={cn(
                            'w-5 h-5',
                            isCurrent ? 'text-neutral-900' : 'text-neutral-500'
                          )}
                          strokeWidth={1.5}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-neutral-900">
                            {step.label}
                          </div>
                          {step.meta && (
                            <div className="text-xs text-neutral-500 mt-0.5">
                              {step.meta}
                            </div>
                          )}
                        </div>
                        <StatusIcon status={step.status} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Spacer pour compenser bottom nav */}
      <div className="h-20 md:hidden" />
    </>
  );
}
```

---

## 🎨 Exemples Visuels

### Page Recherche avec Sidebar

```
Desktop (Sidebar Collapsed)
┌──┬────────────────────────────────────────────────────┐
│  │  Header                                [Dark] [👤] │
├──┼────────────────────────────────────────────────────┤
│⚡│  Recherche de Textiles                             │
│  │                                                    │
│🎯│  [Barre de recherche...]              [Rechercher]│
│  │                                                    │
│📐│  ┌─────────┬──────────────────────────────────┐  │
│  │  │ FILTRES │  RÉSULTATS (112)                 │  │
│📏│  │         │                                   │  │
│  │  │ Matière │  [Card] [Card] [Card]            │  │
│🔍│  │ ☐ Silk  │  [Card] [Card] [Card]            │  │
│  │  │ ☐ Cotton│                                   │  │
│✓ │  │         │                                   │  │
│  │  │ Couleur │                                   │  │
│🛒│  │ ☐ Blue  │                                   │  │
│  │  │ ☐ Red   │                                   │  │
│🏭│  │         │                                   │  │
│  │  └─────────┴──────────────────────────────────┘  │
│🌱│                                                    │
└──┴────────────────────────────────────────────────────┘
```

---

## 🎯 Priorisation MVP

### Phase 1 - MVP Demo (Maintenant)

**Sidebar Parcours** :
- ✅ Structure collapsible
- ✅ 9 étapes définies
- ✅ Statuts visuels (completed, current, available, locked)
- ✅ Responsive (desktop sidebar, mobile bottom nav)
- ✅ Tooltips informatifs
- ✅ Animations subtiles

**Étapes Implémentées** :
1. ✅ Idée (créer projet basique)
2. ⏭️ Inspiration (placeholder "Phase 2")
3. ✅ Design (sélection type vêtement)
4. ✅ Calcul (calculateur métrage)
5. ✅ Sourcing (recherche unifiée)
6. ✅ Validation (page détail produit)
7. ✅ Achat (redirection source)
8. ⏭️ Production (placeholder "Phase 4")
9. ⏭️ Impact (placeholder "Phase 5")

---

## 📋 Checklist Implémentation

### Design System
- [ ] Setup Tailwind config avec tokens
- [ ] Créer `src/styles/design-tokens.css`
- [ ] Installer Lucide React icons
- [ ] Créer composants UI de base (Button, Card, etc.)

### Sidebar Parcours
- [ ] Créer `src/features/journey/domain/types.ts`
- [ ] Créer `src/features/journey/config/steps.ts`
- [ ] Créer `src/components/journey/Sidebar.tsx`
- [ ] Créer `src/components/journey/SidebarStep.tsx`
- [ ] Créer `src/components/journey/MobileJourneyNav.tsx`
- [ ] Intégrer dans layout principal
- [ ] Persister état sidebar (localStorage)
- [ ] Tests responsive

### Pages
- [ ] Update layout avec sidebar
- [ ] Marquer étape courante par page
- [ ] Breadcrumb secondaire si besoin

---

**Status** : 📝 Draft  
**Prochaine étape** : Validation design → Implémentation composants
