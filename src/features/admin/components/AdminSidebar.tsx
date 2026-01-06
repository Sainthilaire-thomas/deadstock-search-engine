// src/features/admin/components/AdminSidebar.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useAdminNavigation, 
  type SiteNavData, 
  type NavItem, 
  type NavChild 
} from '../hooks/useAdminNavigation';
import { type SiteStatus } from '../config/navigation';

// ============================================================================
// TYPES
// ============================================================================

interface AdminSidebarProps {
  sites: SiteNavData[];
  counts: {
    pendingJobs?: number;
    pendingUnknowns?: number;
    pendingDemands?: number;
  };
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatusIcon({ status }: { status?: SiteStatus }) {
  if (!status) return null;
  
  switch (status) {
    case 'active':
      return <span className="text-xs" title="Actif">✅</span>;
    case 'discovered':
      return <span className="text-xs" title="Découvert">🔍</span>;
    case 'pending':
      return <span className="text-xs" title="En attente">⏳</span>;
    case 'error':
      return <span className="text-xs" title="Erreur">❌</span>;
    default:
      return null;
  }
}

function Badge({ count }: { count?: number }) {
  if (!count || count === 0) return null;
  
  return (
    <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full min-w-5 text-center">
      {count > 99 ? '99+' : count}
    </span>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AdminSidebar({ sites, counts }: AdminSidebarProps) {
  const pathname = usePathname();
  const { navigation, badges } = useAdminNavigation(sites, counts);
  
  // État des accordéons ouverts
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [openSites, setOpenSites] = useState<string[]>([]);

  // Ouvre automatiquement la section active au chargement
  useEffect(() => {
    const sections: string[] = [];
    if (pathname.includes('/admin/sites') || pathname.includes('/admin/discovery')) {
      sections.push('discovery');
    }
    if (pathname.includes('/admin/jobs') || pathname.includes('/admin/scraping')) {
      sections.push('scraping');
    }
    if (pathname.includes('/admin/tuning')) {
      sections.push('tuning');
    }
    if (sections.length > 0) {
      setOpenSections(sections);
    }
  }, [pathname]);

  const toggleSection = (key: string) => {
    setOpenSections(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const toggleSite = (siteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenSites(prev =>
      prev.includes(siteId)
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const getBadge = (key: string): number => {
    return badges[key as keyof typeof badges] || 0;
  };

  const isActive = (href?: string): boolean => {
    if (!href) return false;
    return pathname === href;
  };

  const isSectionActive = (key: string): boolean => {
    if (key === 'dashboard') return pathname === '/admin';
    if (key === 'discovery') return pathname.startsWith('/admin/sites');
    if (key === 'scraping') return pathname.startsWith('/admin/jobs');
    if (key === 'tuning') return pathname.startsWith('/admin/tuning');
    return pathname.startsWith(`/admin/${key}`);
  };

  // Rendu d'un enfant simple (lien)
  const renderSimpleChild = (child: NavChild, depth: number = 0) => {
    const active = isActive(child.href);
    const Icon = child.icon;
    
    return (
      <Link
        key={child.key}
        href={child.href}
        className={cn(
          "flex items-center gap-2 rounded text-sm transition-colors",
          depth === 0 ? "px-2 py-1.5" : "px-2 py-1",
          depth === 0 ? "" : "text-xs",
          active
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Icon className={cn("shrink-0", depth === 0 ? "h-3.5 w-3.5" : "h-3 w-3")} />
        <span className="flex-1 truncate">{child.label}</span>
        <Badge count={child.badge} />
      </Link>
    );
  };

  // Rendu d'un site avec sous-accordéon
  const renderSiteChild = (child: NavChild) => {
    const isOpen = openSites.includes(child.key);
    const active = pathname.includes(child.href);
    const Icon = child.icon;
    
    return (
      <div key={child.key}>
        <button
          onClick={(e) => toggleSite(child.key, e)}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
            active
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3 shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0" />
          )}
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left truncate">{child.label}</span>
          <StatusIcon status={child.status} />
        </button>

        {isOpen && child.children && (
          <div className="ml-5 mt-1 space-y-0.5 border-l border-border/50 pl-2">
            {child.children.map((subpage) => renderSimpleChild(subpage, 1))}
          </div>
        )}
      </div>
    );
  };

  // Rendu d'une section
  const renderSection = (item: NavItem) => {
    if (item.type === 'separator') {
      return <div key={item.key} className="h-px bg-border my-3" />;
    }

    const badge = getBadge(item.key);
    const isOpen = openSections.includes(item.key);
    const hasChildren = item.children && item.children.length > 0;
    const active = isSectionActive(item.key);
    const Icon = item.icon;

    // Section simple sans enfants
    if (!hasChildren && item.href) {
      return (
        <Link
          key={item.key}
          href={item.href}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
            active
              ? "bg-primary/10 text-primary font-medium"
              : "hover:bg-muted"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1">{item.label}</span>
          <Badge count={badge} />
        </Link>
      );
    }

    // Section avec accordéon
    return (
      <div key={item.key}>
        <button
          onClick={() => toggleSection(item.key)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
            active
              ? "bg-primary/10 text-primary font-medium"
              : "hover:bg-muted"
          )}
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <Badge count={badge} />
        </button>

        {isOpen && item.children && (
          <div className="ml-4 mt-1 space-y-1 border-l border-border/50 pl-2">
            {item.children.map((child) => {
              if (child.children && child.children.length > 0) {
                return renderSiteChild(child);
              }
              return renderSimpleChild(child);
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 border-r bg-muted/30 h-screen overflow-y-auto shrink-0">
      <div className="p-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-bold text-lg">Deadstock</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navigation.map(renderSection)}
        </nav>

        {/* Footer stats */}
        <div className="mt-8 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Sites</span>
              <span className="font-medium">{sites.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Unknowns</span>
              <span className="font-medium">{counts.pendingUnknowns || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
