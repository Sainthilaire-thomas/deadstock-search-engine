// src/features/admin/config/navigation.ts

import {
  LayoutDashboard,
  Search,
  Download,
  Wrench,
  Book,
  MessageSquare,
  List,
  Globe,
  BarChart,
  Tags,
  Regex,
  Calendar,
  Loader,
  History,
  Clock,
  Play,
  HelpCircle,
  TestTube,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type SiteStatus = 'active' | 'discovered' | 'pending' | 'error';

export interface SubPage {
  key: string;
  label: string;
  icon: LucideIcon;
}

export interface StaticChild {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  key: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  staticChildren?: StaticChild[];
  siteSubpages?: SubPage[];
  type?: 'separator';
}

// ============================================================================
// NAVIGATION STRUCTURE (Statique)
// Les sites sont injectés dynamiquement via useAdminNavigation
// ============================================================================

export const adminNavStructure: NavSection[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    key: 'discovery',
    label: '1. Discovery',
    icon: Search,
    staticChildren: [
      { label: 'Vue d\'ensemble', href: '/admin/sites', icon: List },
      { label: 'Ajouter un site', href: '/admin/sites/new', icon: Globe },
    ],
    // Sous-pages par site pour Discovery (TODO: activer quand pages créées)
    // siteSubpages: [
    //   { key: 'analysis', label: 'Analyse', icon: BarChart },
    //   { key: 'tags', label: 'Classification Tags', icon: Tags },
    //   { key: 'patterns', label: 'Patterns', icon: Regex },
    // ],
  },
  {
    key: 'scraping',
    label: '2. Scraping',
    icon: Download,
    staticChildren: [
      { label: 'Jobs', href: '/admin/jobs', icon: Loader },
      // { label: 'Planning', href: '/admin/scraping', icon: Calendar },
      // { label: 'Historique', href: '/admin/scraping/history', icon: History },
    ],
    // Sous-pages par site pour Scraping (TODO: activer quand pages créées)
    // siteSubpages: [
    //   { key: 'schedule', label: 'Planification', icon: Clock },
    //   { key: 'manual', label: 'À la demande', icon: Play },
    //   { key: 'metrics', label: 'Métriques', icon: BarChart },
    // ],
  },
  {
    key: 'tuning',
    label: '3. Tuning',
    icon: Wrench,
    staticChildren: [
      { label: 'Unknowns', href: '/admin/tuning', icon: HelpCircle },
      // { label: 'Qualité', href: '/admin/tuning/quality', icon: BarChart },
      // { label: 'Tests', href: '/admin/tuning/tests', icon: TestTube },
    ],
    // Pas de sous-pages par site pour Tuning (c'est global)
  },
  {
    key: 'separator',
    label: '',
    icon: LayoutDashboard,
    type: 'separator',
  },
  // TODO: Activer quand les pages seront créées
  // {
  //   key: 'dictionary',
  //   label: 'Dictionnaire',
  //   href: '/admin/dictionary',
  //   icon: Book,
  // },
  // {
  //   key: 'demands',
  //   label: 'Demandes',
  //   href: '/admin/demands',
  //   icon: MessageSquare,
  // },
];
