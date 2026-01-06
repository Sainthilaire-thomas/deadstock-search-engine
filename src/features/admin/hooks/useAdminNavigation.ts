// src/features/admin/hooks/useAdminNavigation.ts

'use client';

import { useMemo } from 'react';
import { Globe, type LucideIcon } from 'lucide-react';
import { adminNavStructure, type SiteStatus } from '../config/navigation';

// ============================================================================
// TYPES
// ============================================================================

export interface SiteNavData {
  id: string;
  name: string;
  slug: string;
  status: SiteStatus;
}

export interface NavChild {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  status?: SiteStatus;
  badge?: number;
  children?: NavChild[];
}

export interface NavItem {
  key: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  type?: 'separator';
  children?: NavChild[];
}

export interface NavBadges {
  discovery: number;
  scraping: number;
  tuning: number;
  demands: number;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAdminNavigation(
  sites: SiteNavData[],
  counts: {
    pendingJobs?: number;
    pendingUnknowns?: number;
    pendingDemands?: number;
  } = {}
) {
  const navigation = useMemo(() => {
    return adminNavStructure.map((section): NavItem => {
      // Séparateur
      if (section.type === 'separator') {
        return {
          key: section.key,
          label: '',
          icon: section.icon,
          type: 'separator',
        };
      }

      // Si la section a des sous-pages par site, on les injecte
      if (section.siteSubpages && section.siteSubpages.length > 0 && sites.length > 0) {
        const siteChildren: NavChild[] = sites.map(site => ({
          key: site.id,
          label: site.name,
          href: `/admin/${section.key}/${site.slug}`,
          icon: Globe,
          status: site.status,
          children: section.siteSubpages!.map(subpage => ({
            key: subpage.key,
            label: subpage.label,
            href: `/admin/${section.key}/${site.slug}/${subpage.key}`,
            icon: subpage.icon,
          })),
        }));

        return {
          key: section.key,
          label: section.label,
          href: section.href,
          icon: section.icon,
          children: [
            ...(section.staticChildren || []).map(child => ({
              key: child.href,
              label: child.label,
              href: child.href,
              icon: child.icon,
            })),
            ...siteChildren,
          ],
        };
      }

      // Section avec enfants statiques seulement
      if (section.staticChildren && section.staticChildren.length > 0) {
        return {
          key: section.key,
          label: section.label,
          href: section.href,
          icon: section.icon,
          children: section.staticChildren.map(child => ({
            key: child.href,
            label: child.label,
            href: child.href,
            icon: child.icon,
          })),
        };
      }

      // Section simple sans enfants
      return {
        key: section.key,
        label: section.label,
        href: section.href,
        icon: section.icon,
      };
    });
  }, [sites]);

  // Calcul des badges
  const badges = useMemo((): NavBadges => ({
    discovery: sites.filter(s => s.status === 'pending').length,
    scraping: counts.pendingJobs || 0,
    tuning: counts.pendingUnknowns || 0,
    demands: counts.pendingDemands || 0,
  }), [sites, counts]);

  return { navigation, badges };
}
