// src/app/admin/discovery/[siteSlug]/page.tsx

import Link from 'next/link';
import { ArrowLeft, RefreshCw, Globe, Calendar, Package, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createAdminClient } from '@/lib/supabase/admin';
import { ExtractionPatternsCard } from '@/features/admin/components/ExtractionPatternsCard';
import { notFound } from 'next/navigation';
import type { ExtractionPatterns } from '@/features/admin/domain/types';
import { SaleTypeCard } from '@/features/admin/components/SaleTypeCard';
import type { SaleTypeDetection } from '@/features/admin/domain/types';
// ============================================================================
// TYPES (pour caster les JSON de Supabase)
// ============================================================================

interface QualityMetrics {
  hasImages: number;
  hasPrice: number;
  hasTags: number;
  hasDescription: number;
  hasWeight: number;
  hasProductType: number;
  overallScore: number;
}

interface CollectionData {
  handle: string;
  title: string;
  productsCount: number;
  suggestedRelevant: boolean;
  suggestedPriority: 'high' | 'medium' | 'low';
  relevanceReason?: string;
}

// ============================================================================
// DATA FETCHING
// ============================================================================

async function getSiteWithProfile(siteSlug: string) {
  const supabase = createAdminClient();

  // Try to find site by ID or slug
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('*')
    .or(`id.eq.${siteSlug},url.ilike.%${siteSlug}%`)
    .single();

  if (siteError || !site) {
    return null;
  }

  // Get latest profile
  const { data: profile } = await supabase
    .from('site_profiles')
    .select('*')
    .eq('site_id', site.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return { site, profile };
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function DiscoverySiteDetailPage({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}) {
  const { siteSlug } = await params;
  const data = await getSiteWithProfile(siteSlug);

  if (!data) {
    notFound();
  }

  const { site, profile } = data;

  // Cast JSON fields to proper types avec fallbacks
  const qualityMetrics = (profile?.quality_metrics ?? null) as QualityMetrics | null;
  const collections = (Array.isArray(profile?.collections) ? profile.collections : []) as unknown as CollectionData[];
  const extractionPatterns = ((profile as Record<string, unknown>)?.extraction_patterns ?? null) as ExtractionPatterns | null;
const saleTypeDetection = ((profile as Record<string, unknown>)?.sale_type_detection ?? null) as SaleTypeDetection | null;
 
return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/discovery">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{site.name || site.url}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {site.url}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/sites/${site.id}`}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-découvrir
            </Link>
          </Button>
        </div>
      </div>

      {/* Profile Summary */}
      {profile && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Package className="h-4 w-4" />
                <span className="text-sm">Collections</span>
              </div>
              <p className="text-2xl font-bold">{profile.total_collections ?? 0}</p>
              <p className="text-xs text-muted-foreground">{profile.relevant_collections ?? 0} pertinentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Package className="h-4 w-4" />
                <span className="text-sm">Produits estimés</span>
              </div>
              <p className="text-2xl font-bold">{(profile.estimated_products ?? 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{(profile.estimated_available ?? 0).toLocaleString()} disponibles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Qualité</span>
              </div>
              <p className="text-2xl font-bold">
                {Math.round((qualityMetrics?.overallScore ?? 0) * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">Score global</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Découvert</span>
              </div>
              <p className="text-2xl font-bold">
                {profile.discovered_at 
                  ? new Date(profile.discovered_at).toLocaleDateString('fr-FR')
                  : '-'
                }
              </p>
              <p className="text-xs text-muted-foreground">
                Valide jusqu&apos;au {profile.valid_until 
                  ? new Date(profile.valid_until).toLocaleDateString('fr-FR')
                  : '-'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="extraction" className="space-y-4">
        <TabsList>
          <TabsTrigger value="extraction">Extraction</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="quality">Qualité</TabsTrigger>
          <TabsTrigger value="raw">Données brutes</TabsTrigger>
        </TabsList>

        {/* Extraction Tab */}
       <TabsContent value="extraction" className="space-y-4">
  <SaleTypeCard saleTypeDetection={saleTypeDetection} />
  <ExtractionPatternsCard 
    extractionPatterns={extractionPatterns}
    readOnly={true}
  />
</TabsContent>
        

        {/* Collections Tab */}
        <TabsContent value="collections">
          <Card>
            <CardHeader>
              <CardTitle>Collections</CardTitle>
              <CardDescription>
                {collections.length} collections analysées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {collections.slice(0, 20).map((collection) => (
                  <div 
                    key={collection.handle} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{collection.title}</p>
                      <p className="text-xs text-muted-foreground">{collection.handle}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{collection.productsCount} produits</span>
                      {collection.suggestedRelevant ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Pertinent
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Non pertinent
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {collection.suggestedPriority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>Métriques de Qualité</CardTitle>
            </CardHeader>
            <CardContent>
              {qualityMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(qualityMetrics).map(([key, value]) => (
                    <div key={key} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-xl font-bold">
                        {typeof value === 'number' ? `${Math.round(value * 100)}%` : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Raw Data Tab */}
        <TabsContent value="raw">
          <Card>
            <CardHeader>
              <CardTitle>Données brutes du profile</CardTitle>
              <CardDescription>Format JSON pour debug</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-xs">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
