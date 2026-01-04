// src/app/admin/sites/[id]/configure/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSiteByIdServer } from '@/features/admin/application/queries';
import { ArrowLeft, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { ScrapingConfigForm } from '@/features/admin/components/ScrapingConfigForm';

interface ConfigurePageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Map database profile (snake_case) to component format (camelCase)
 */
function mapDbProfileToComponentProfile(dbProfile: any) {
  return {
    collections: dbProfile.collections || [],
    qualityMetrics: dbProfile.quality_metrics || {
      hasImages: 0,
      hasPrice: 0,
      hasTags: 0,
      hasDescription: 0,
      hasWeight: 0,
      hasProductType: 0,
      overallScore: 0,
    },
    globalAnalysis: dbProfile.global_analysis || null,
    totalCollections: dbProfile.total_collections || 0,
    relevantCollections: dbProfile.relevant_collections || 0,
    estimatedProducts: dbProfile.estimated_products || 0,
    estimatedAvailable: dbProfile.estimated_available || 0,
  };
}

/**
 * Map database scraping config to component format
 */
function mapDbConfigToComponentConfig(dbConfig: any) {
  if (!dbConfig) return undefined;
  
  return {
    selectedCollections: dbConfig.selectedCollections || dbConfig.selected_collections || [],
    maxProductsPerCollection: dbConfig.maxProductsPerCollection || dbConfig.max_products_per_collection || 100,
    filters: {
      minPrice: dbConfig.filters?.minPrice || dbConfig.filters?.min_price,
      maxPrice: dbConfig.filters?.maxPrice || dbConfig.filters?.max_price,
      requireImages: dbConfig.filters?.requireImages ?? dbConfig.filters?.require_images ?? true,
      onlyAvailable: dbConfig.filters?.onlyAvailable ?? dbConfig.filters?.only_available ?? true,
    },
  };
}

export default async function ConfigurePage({ params }: ConfigurePageProps) {
  const { id } = await params;
  const site = await getSiteByIdServer(id);
  
  if (!site) {
    notFound();
  }

  if (!site.profile) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Link href={`/admin/sites/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Site
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Discovery Profile</h3>
            <p className="text-muted-foreground text-center mb-4">
              You need to run discovery first before configuring scraping.
            </p>
            <Link href={`/admin/sites/${id}`}>
              <Button>Go Back and Run Discovery</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Map DB data to component format
  const mappedProfile = mapDbProfileToComponentProfile(site.profile);
  const mappedConfig = mapDbConfigToComponentConfig(site.scraping_config);

  // Extract quality score for display
  const qualityScore = mappedProfile.qualityMetrics?.overallScore 
    ? Math.round(mappedProfile.qualityMetrics.overallScore * 100)
    : (mappedProfile.qualityMetrics?.hasImages 
        ? Math.round(mappedProfile.qualityMetrics.hasImages * 100)
        : 0);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/sites/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Site
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Configure Scraping</h1>
          <p className="text-muted-foreground">{site.name}</p>
        </div>
      </div>

      {/* Discovery Results (Read-only) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Discovery Results</CardTitle>
              <CardDescription>
                Discovered on {site.profile.discovered_at ? new Date(site.profile.discovered_at).toLocaleDateString() : 'Unknown'}
              </CardDescription>
            </div>
            <Badge variant="secondary">Read-only</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Collections</div>
              <div className="text-2xl font-bold">{mappedProfile.totalCollections}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Relevant</div>
              <div className="text-2xl font-bold text-green-600">
                {mappedProfile.relevantCollections}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Estimated Products</div>
              <div className="text-2xl font-bold">{mappedProfile.estimatedProducts.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Quality
              </div>
              <div className="text-2xl font-bold">{qualityScore}%</div>
            </div>
          </div>

          {/* Last Discovery Date */}
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Valid until {new Date(site.profile.valid_until).toLocaleDateString()}
              {site.profile.needs_rediscovery && (
                <Badge variant="destructive" className="ml-2">
                  Rediscovery needed
                </Badge>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <ScrapingConfigForm 
        siteId={site.id}
        siteName={site.name || 'Unknown Site'}
        siteUrl={site.url}
        profile={mappedProfile}
        currentConfig={mappedConfig}
      />
    </div>
  );
}
