// src/app/admin/page.tsx
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAdminMetrics, getAllSites, getRecentJobsWithSites } from '@/features/admin/application/queries';
import { 
  Database, 
  Globe, 
  TrendingUp, 
  AlertCircle, 
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

export default async function AdminDashboard() {
  const metrics = await getAdminMetrics();
  const sites = await getAllSites();
  const recentJobs = await getRecentJobsWithSites(5);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage sites, scraping jobs, and data quality
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSites}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeSites} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Textiles</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTextiles}</div>
            <p className="text-xs text-muted-foreground">
              Indexed products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgQualityScore}%</div>
            <p className="text-xs text-muted-foreground">
              Average data quality
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Unknowns</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingUnknowns}</div>
            <p className="text-xs text-muted-foreground">
              Terms to normalize
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common admin tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/admin/sites">
            <Button>
              <Globe className="mr-2 h-4 w-4" />
              Manage Sites
            </Button>
          </Link>
          <Link href="/admin/jobs">
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              View Jobs
            </Button>
          </Link>
          <Link href="/admin/tuning">
            <Button variant="outline">
              <AlertCircle className="mr-2 h-4 w-4" />
              Tune Dictionary
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Sites Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sites</CardTitle>
              <CardDescription>Configured scraping sources</CardDescription>
            </div>
            <Link href="/admin/sites">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sites.slice(0, 5).map((site) => (
              <div key={site.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <div className="font-medium">{site.name}</div>
                  <div className="text-sm text-muted-foreground">{site.url}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    site.status === 'active' ? 'default' :
                    site.status === 'discovered' ? 'secondary' :
                    'outline'
                  }>
                    {site.status}
                  </Badge>
                  {site.quality_score && (
                    <span className="text-sm text-muted-foreground">
                      {Math.round(site.quality_score * 100)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Last scraping operations</CardDescription>
            </div>
            <Link href="/admin/jobs">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent jobs
            </p>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job: any) => (
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
                      <div className="font-medium">{job.site?.name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">
                        {job.products_saved} products saved
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
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
