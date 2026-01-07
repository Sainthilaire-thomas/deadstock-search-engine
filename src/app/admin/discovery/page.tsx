// src/app/admin/discovery/page.tsx

import Link from 'next/link';
import { Plus, CheckCircle, AlertTriangle, Clock, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllSites } from '@/features/admin/application/queries';

function StatusBadge({ status }: { status: string | null }) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Actif
        </Badge>
      );
    case 'discovered':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Découvert
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {status || 'Inconnu'}
        </Badge>
      );
  }
}

export default async function DiscoveryPage() {
  const sites = await getAllSites();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discovery & Préparation</h1>
          <p className="text-muted-foreground">
            Découvrir la structure des sites et configurer les règles d&apos;extraction.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/sites/new">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un site
          </Link>
        </Button>
      </div>

      {/* Info box */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Étape 1 du workflow admin.</strong> La discovery analyse la structure d&apos;un site
            (collections, tags, formats) pour préparer les règles d&apos;extraction.
            Une fois configuré, le site peut être scrapé régulièrement.
          </p>
        </CardContent>
      </Card>

      {/* Liste des sites */}
      <Card>
        <CardHeader>
          <CardTitle>Sites</CardTitle>
          <CardDescription>
            {sites.length} site{sites.length > 1 ? 's' : ''} configuré{sites.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sites.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Aucun site configuré</p>
              <Button asChild>
                <Link href="/admin/sites/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter votre premier site
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Site</th>
                    <th className="pb-3 font-medium">Plateforme</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium">Qualité</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sites.map(site => (
                    <tr key={site.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-4">
                        <Link 
                          href={`/admin/discovery/${site.id}`}
                          className="hover:underline"
                        >
                          <div className="font-medium">{site.name || 'Sans nom'}</div>
                          <div className="text-xs text-muted-foreground">{site.url}</div>
                        </Link>
                      </td>
                      <td className="py-4">
                        <Badge variant="outline">{site.platform_type || 'Inconnu'}</Badge>
                      </td>
                      <td className="py-4">
                        <StatusBadge status={site.status} />
                      </td>
                      <td className="py-4">
                        {site.quality_score != null ? (
                          <span className={
                            site.quality_score >= 0.7 ? 'text-green-600' :
                            site.quality_score >= 0.4 ? 'text-yellow-600' :
                            'text-red-600'
                          }>
                            {Math.round(site.quality_score * 100)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/discovery/${site.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Détails
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/sites/${site.id}`}>
                              Configurer
                            </Link>
                          </Button>
                        </div>
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
