// src/app/admin/sites/[id]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { sitesRepo } from '@/features/admin/infrastructure/sitesRepo';
import { jobsRepo } from '@/features/admin/infrastructure/jobsRepo';
import { ArrowLeft, Globe, Calendar, TrendingUp, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { getSiteByIdServer } from '@/features/admin/application/queries';
import { SiteActions } from '@/features/admin/components/SiteActions';

interface SiteDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SiteDetailPage({ params }: SiteDetailPageProps) {
  // Await params (Next.js 15+)
  const { id } = await params;
  
  const site = await getSiteByIdServer(id);
  
  if (!site) {
    notFound();
  }

  const jobs = await jobsRepo.getJobsBySite(id, 10);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/sites">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sites
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{site.name}</h1>
            <p className="text-muted-foreground">{site.url}</p>
          </div>
        </div>
        <Badge variant={
          site.status === 'active' ? 'default' :
          site.status === 'discovered' ? 'secondary' :
          'outline'
        }>
          {site.status}
        </Badge>
      </div>

      {/* Site Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{site.platform_type}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={
              site.priority === 'high' ? 'default' :
              site.priority === 'medium' ? 'secondary' :
              'outline'
            }>
              {site.priority}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {site.quality_score !== null 
                ? `${Math.round(site.quality_score * 100)}%`
                : 'N/A'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{site.jobsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Textiles Indexed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{site.textilesCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Last Scraped
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {site.last_scraped_at 
                ? new Date(site.last_scraped_at).toLocaleString()
                : 'Never'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Info */}
      {site.profile && (
        <Card>
          <CardHeader>
            <CardTitle>Discovery Profile</CardTitle>
            <CardDescription>
             Discovered on {site.profile.discovered_at ? new Date(site.profile.discovered_at).toLocaleDateString() : 'Unknown'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Collections</div>
                <div className="text-2xl font-bold">{site.profile.total_collections}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Relevant</div>
                <div className="text-2xl font-bold">{site.profile.relevant_collections}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Estimated Products</div>
                <div className="text-2xl font-bold">{site.profile.estimated_products}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Platform</div>
                <div className="text-lg font-semibold">
                  {site.profile.is_shopify ? 'Shopify' : 'Other'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Manage this site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SiteActions 
            siteId={site.id}
            siteUrl={site.url}
            hasProfile={!!site.profile}
          />
          
          {site.profile && (
            <div className="pt-4 border-t">
              <Link href={`/admin/sites/${site.id}/configure`}>
                <Button variant="outline" className="w-full">
                  Configure Scraping Settings
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>Last 10 scraping operations</CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No jobs yet
            </p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    {job.status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                    {job.status === 'failed' && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    {job.status === 'running' && (
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    )}
                    <div>
                      <div className="font-medium">
                        Job #{job.id.slice(0, 8)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {job.products_saved} products saved • {job.errors_count} errors
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      job.status === 'completed' ? 'default' :
                      job.status === 'failed' ? 'destructive' :
                      job.status === 'running' ? 'secondary' :
                      'outline'
                    }>
                      {job.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {site.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {site.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
