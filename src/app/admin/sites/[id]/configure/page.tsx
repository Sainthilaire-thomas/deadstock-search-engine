// src/app/admin/sites/[id]/configure/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSiteByIdServer } from '@/features/admin/application/queries';
import { ArrowLeft, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { ScrapingConfigForm } from '@/features/admin/components/ScrapingConfigForm';
import { ScrapingConfig } from '@/features/admin/domain/types';

interface ConfigurePageProps {
  params: Promise<{
    id: string;
  }>;
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
              <div className="text-2xl font-bold">{site.profile.total_collections}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Relevant</div>
              <div className="text-2xl font-bold text-green-600">
                {site.profile.relevant_collections}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Estimated Products</div>
              <div className="text-2xl font-bold">{site.profile.estimated_products}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Quality
              </div>
              <div className="text-2xl font-bold">
                {site.profile.quality_metrics 
  ? `${Math.round(((site.profile.quality_metrics as any).hasImages || 0) * 100)}%`
  : 'N/A'
}

              </div>
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
        profile={site.profile}
        currentConfig={site.scraping_config as ScrapingConfig | null}
      />
    </div>
  );
}
