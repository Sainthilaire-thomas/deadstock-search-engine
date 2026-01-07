// src/features/admin/domain/types.ts
import { Database } from '@/types/database.types';

// ============================================================================
// TYPES DE BASE DEPUIS SUPABASE (Source de vérité)
// ============================================================================

type SiteRow = Database['deadstock']['Tables']['sites']['Row'];
type ScrapingJobRow = Database['deadstock']['Tables']['scraping_jobs']['Row'];
type SiteProfileRow = Database['deadstock']['Tables']['site_profiles']['Row'];

// Export des types DB directement pour garantir la cohérence
export type Site = SiteRow;
export type ScrapingJob = ScrapingJobRow;
export type SiteProfile = SiteProfileRow;

// ============================================================================
// TYPES MÉTIER (Extensions et configurations)
// ============================================================================

export interface ScrapingConfig {
  collections?: string[];
  maxProductsPerCollection?: number;
  refreshFrequency?: 'daily' | 'weekly' | 'monthly';
  maxRequestsPerHour?: number;
  delayBetweenRequests?: number;
  filters?: {
    onlyAvailable?: boolean;
    requireImages?: boolean;
    requirePrice?: boolean;
    priceRange?: {
      min: number;
      max: number;
    };
  };
}

export interface AdminMetrics {
  totalSites: number;
  activeSites: number;
  totalTextiles: number;
  totalJobs: number;
  recentJobs: number;
  avgQualityScore: number;
  pendingUnknowns: number;
  lastScrapingAt: string | null;
}

// ============================================================================
// TYPES ENRICHIS (Avec relations)
// ============================================================================

export interface SiteWithProfile extends Site {
  profile?: SiteProfile;
  jobsCount?: number;
  textilesCount?: number;
}

export interface JobWithSite extends ScrapingJob {
  site?: Pick<Site, 'id' | 'name' | 'url' | 'platform_type'>;
}


// ============================================================================
// EXTRACTION PATTERNS (Phase 1 - Dimensions)
// ============================================================================

export type ExtractionField = 'length' | 'width' | 'weight' | 'composition';
export type ExtractionSource = 'tags' | 'title' | 'body_html' | 'variant';

export interface ExtractedExample {
  raw: string;           // Texte brut trouvé
  extracted: number;     // Valeur extraite
  productTitle?: string; // Titre du produit (pour contexte)
}

export interface ExtractionPattern {
  id: string;                    // UUID généré
  field: ExtractionField;        // Quel champ extraire
  source: ExtractionSource;      // Où chercher
  pattern: string;               // Regex string
  captureGroup: number;          // Quel groupe capturer (default 1)
  unit: string;                  // Unité par défaut (m, cm, gsm)
  coverage: number;              // % de produits où ça matche (0-1)
  matchCount: number;            // Nombre de produits matchés
  totalTested: number;           // Nombre total de produits testés
  examples: ExtractedExample[];  // Exemples trouvés (max 5)
  enabled: boolean;              // Admin peut activer/désactiver
  confidence: number;            // Score de confiance (0-1)
}

export interface ExtractionPatterns {
  patterns: ExtractionPattern[];
  analyzedAt: string;            // ISO date
  productsAnalyzed: number;
}
