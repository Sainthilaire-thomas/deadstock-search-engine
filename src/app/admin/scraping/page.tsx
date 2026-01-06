// src/app/admin/scraping/page.tsx

import Link from 'next/link';
import { Play, Loader, History, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllSites, getRecentJobsWithSites } from '@/features/admin/application/queries';

function JobStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Terminé
        </Badge>
      );
    case 'running':
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Loader className="h-3 w-3 mr-1 animate-spin" />
          En cours
        </Badge>
      );
    case 'failed':
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Échec
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function ScrapingPage() {
  const [sites, recentJobs] = await Promise.all([
    getAllSites(),
    getRecentJobsWithSites(10),
  ]);

  // Récupérer le count de textiles par site
// Récupérer le count de textiles par site
  const supabase = (await import('@/lib/supabase/admin')).createAdminClient();
  const { data: textileCounts } = await supabase
    .from('textiles')
    .select('site_id');

  const countBySite: Record<string, number> = {};
  if (textileCounts) {
    for (const t of textileCounts as { site_id: string | null }[]) {
      if (t.site_id) {
        countBySite[t.site_id] = (countBySite[t.site_id] || 0) + 1;
      }
    }
  }

  const activeSites = sites.filter(s => s.status === 'active' || s.status === 'discovered');
  const runningJobs = recentJobs.filter((j: any) => j.status === 'running');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scraping & Contrôle</h1>
          <p className="text-muted-foreground">
            Planifiez et gérez les jobs de scraping pour chaque source.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/jobs">
              <History className="h-4 w-4 mr-2" />
              Tous les jobs
            </Link>
          </Button>
        </div>
      </div>

      {/* Info box */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Étape 2 du workflow admin.</strong> Une fois la discovery effectuée,
            lancez le scraping pour indexer les produits. Le scraping peut être
            complet (tous les produits) ou delta (nouveautés uniquement).
          </p>
        </CardContent>
      </Card>

      {/* Jobs en cours */}
      {runningJobs.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Loader className="h-4 w-4 animate-spin" />
              Jobs en cours ({runningJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {runningJobs.map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-background rounded border">
                  <div>
                    <span className="font-medium">{job.site?.name || 'Site inconnu'}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {job.products_fetched || 0} produits trouvés
                    </span>
                  </div>
                  <JobStatusBadge status={job.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sites disponibles pour scraping */}
      <Card>
        <CardHeader>
          <CardTitle>Sites disponibles</CardTitle>
          <CardDescription>
            {activeSites.length} site{activeSites.length > 1 ? 's' : ''} prêt{activeSites.length > 1 ? 's' : ''} pour le scraping
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeSites.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Aucun site prêt pour le scraping. Lancez d'abord une discovery.
              </p>
              <Button asChild>
                <Link href="/admin/discovery">
                  Aller à Discovery
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSites.map(site => {
                const lastJob = recentJobs.find((j: any) => j.site_id === site.id);
                const textilesCount = countBySite[site.id] || 0;
                return (
                  <div key={site.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{site.name || 'Sans nom'}</div>
                      <div className="text-sm text-muted-foreground">
                        {textilesCount > 0 && (
                          <span className="text-green-600 font-medium">{textilesCount} textiles</span>
                        )}
                        {textilesCount > 0 && lastJob && ' • '}
                        {lastJob ? (
                          <>
                            Dernier scraping: {lastJob.created_at ? new Date(lastJob.created_at).toLocaleDateString('fr-FR') : '-'}
                          </>
                        ) : (
                          textilesCount === 0 && 'Jamais scrapé'
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lastJob?.status && <JobStatusBadge status={lastJob.status} />}
                      <Button size="sm" asChild>
                        <Link href={`/admin/sites/${site.id}`}>
                          <Play className="h-4 w-4 mr-1" />
                          Scraper
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jobs récents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Jobs récents</CardTitle>
              <CardDescription>Dernières opérations de scraping</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/jobs">Voir tout</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">Aucun job récent</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Site</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Produits</th>
                    <th className="pb-2 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentJobs.slice(0, 5).map((job: any) => (
                    <tr key={job.id}>
                      <td className="py-2 font-medium">{job.site?.name || 'Inconnu'}</td>
                      <td className="py-2 text-muted-foreground">
                        {job.created_at ? new Date(job.created_at).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="py-2">{job.products_saved || 0}</td>
                      <td className="py-2">
                        {job.status && <JobStatusBadge status={job.status} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
