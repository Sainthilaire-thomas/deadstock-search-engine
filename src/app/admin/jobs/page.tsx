// src/app/admin/jobs/page.tsx
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { jobsRepo } from '@/features/admin/infrastructure/jobsRepo';
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Clock, TrendingUp } from 'lucide-react';

export default async function JobsPage() {
  const jobs = await jobsRepo.getAllJobs(50);
  const stats = await jobsRepo.getJobStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Scraping Jobs</h1>
            <p className="text-muted-foreground">
              All scraping operations history
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.completed} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products Saved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalErrors}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
          <CardDescription>Most recent first</CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No jobs found
            </p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Link 
                  key={job.id} 
                  href={`/admin/jobs/${job.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between border rounded-lg p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Status Icon */}
                      <div>
                        {job.status === 'completed' && (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        )}
                        {job.status === 'failed' && (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                        {job.status === 'running' && (
                          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                        )}
                        {job.status === 'queued' && (
                          <Clock className="h-6 w-6 text-yellow-600" />
                        )}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {job.site?.name || 'Unknown Site'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {job.site?.platform_type || 'unknown'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Job #{job.id.slice(0, 8)} • {job.site?.url}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{job.products_saved}</div>
                          <div className="text-xs text-muted-foreground">Saved</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{job.products_skipped}</div>
                          <div className="text-xs text-muted-foreground">Skipped</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-red-600">{job.errors_count}</div>
                          <div className="text-xs text-muted-foreground">Errors</div>
                        </div>
                        {job.quality_score && (
                          <div className="text-center">
                            <div className="font-medium">{Math.round(job.quality_score * 100)}%</div>
                            <div className="text-xs text-muted-foreground">Quality</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status & Date */}
                    <div className="text-right ml-4">
                      <Badge variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'failed' ? 'destructive' :
                        job.status === 'running' ? 'secondary' :
                        'outline'
                      }>
                        {job.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-2">
                       {job.created_at ? new Date(job.created_at).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
