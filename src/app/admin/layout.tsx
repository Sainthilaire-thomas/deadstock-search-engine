// src/app/admin/layout.tsx

import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { getAllSites, getAdminMetrics } from '@/features/admin/application/queries';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import type { SiteNavData } from '@/features/admin/hooks/useAdminNavigation';
import type { SiteStatus } from '@/features/admin/config/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Admin - Deadstock',
  description: 'Administration du moteur de recherche textiles',
};

// Créer un slug à partir du nom ou de l'URL
function createSlug(name: string | null, url: string, id: string): string {
  if (name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  try {
    const domain = new URL(url).hostname.replace('www.', '').split('.')[0];
    return domain;
  } catch {
    return id;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sites, metrics] = await Promise.all([
    getAllSites(),
    getAdminMetrics(),
  ]);

  const sitesNav: SiteNavData[] = sites.map(site => ({
    id: site.id,
    name: site.name || 'Sans nom',
    slug: createSlug(site.name, site.url, site.id),
    status: (site.status as SiteStatus) || 'pending',
  }));

  const counts = {
    pendingJobs: metrics.recentJobs,
    pendingUnknowns: metrics.pendingUnknowns,
    pendingDemands: 0,
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar sites={sitesNav} counts={counts} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Admin */}
        <header className="h-14 border-b bg-background/95 backdrop-blur shrink-0 flex items-center justify-between px-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour Designer
          </Link>
          <ThemeToggle />
        </header>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
