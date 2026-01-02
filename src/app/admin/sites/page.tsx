// src/app/admin/sites/page.tsx
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllSites } from '@/features/admin/application/queries';
import { ArrowLeft, Plus, Globe, Calendar, TrendingUp } from 'lucide-react';

export default async function SitesPage() {
  const sites = await getAllSites();

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
            <h1 className="text-3xl font-bold">Sites</h1>
            <p className="text-muted-foreground">
              Manage scraping sources
            </p>
          </div>
        </div>
        <Link href="/admin/sites/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Site
          </Button>
        </Link>
      </div>

      {/* Sites List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map((site) => (
          <Link key={site.id} href={`/admin/sites/${site.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{site.name}</CardTitle>
                  </div>
                  <Badge variant={
                    site.status === 'active' ? 'default' :
                    site.status === 'discovered' ? 'secondary' :
                    site.status === 'paused' ? 'outline' :
                    'secondary'
                  }>
                    {site.status}
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  {site.url}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Platform */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Platform</span>
                    <Badge variant="outline">{site.platform_type}</Badge>
                  </div>

                  {/* Priority */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Priority</span>
                    <Badge variant={
                      site.priority === 'high' ? 'default' :
                      site.priority === 'medium' ? 'secondary' :
                      'outline'
                    }>
                      {site.priority}
                    </Badge>
                  </div>

                  {/* Quality Score */}
                  {site.quality_score !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Quality
                      </span>
                      <span className="font-medium">
                        {Math.round(site.quality_score * 100)}%
                      </span>
                    </div>
                  )}

                  {/* Last Scraped */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Last Scraped
                    </span>
                    <span className="text-xs">
                      {site.last_scraped_at 
                        ? new Date(site.last_scraped_at).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {sites.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sites configured</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first scraping source to get started
            </p>
            <Link href="/admin/sites/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Site
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
