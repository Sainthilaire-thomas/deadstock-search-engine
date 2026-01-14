// src/app/admin/tuning/quality/page.tsx

import Link from 'next/link';
import { ArrowLeft, BarChart, TrendingUp, TrendingDown, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAdminMetrics, getAllSites, getCoverageBySource } from '@/features/admin/application/queries';
import { createAdminClient } from '@/lib/supabase/admin';

// Récupérer les stats de couverture globales
async function getCoverageStats() {
  const supabase = createAdminClient();

  const { data: textiles } = await supabase
    .from('textiles_search')
    .select('fiber, color, pattern, weave, quantity_value, width_value, price_per_meter');

  const total = textiles?.length || 0;

  if (total === 0) {
    return {
      total: 0,
      coverage: { material: 0, color: 0, pattern: 0, length: 0, width: 0 }
    };
  }

  return {
    total,
    coverage: {
      material: Math.round((textiles!.filter(t => t.fiber).length / total) * 100),
      color: Math.round((textiles!.filter(t => t.color).length / total) * 100),
      pattern: Math.round((textiles!.filter(t => t.pattern).length / total) * 100),
      length: Math.round((textiles!.filter(t => t.quantity_value && t.quantity_value > 0).length / total) * 100),
      width: Math.round((textiles!.filter(t => t.width_value && t.width_value > 0).length / total) * 100),
    },
  };
}

function ProgressBar({ value, label, target }: { value: number; label: string; target?: number }) {
  const getColor = (v: number) => {
    if (v >= 80) return 'bg-green-500';
    if (v >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className={
            value >= 80 ? 'text-green-600' :
            value >= 50 ? 'text-yellow-600' :
            'text-red-600'
          }>{value}%</span>
          {target && (
            <span className="text-xs text-muted-foreground">
              (cible: {target}%)
            </span>
          )}
        </div>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden relative">
        <div
          className={`h-full ${getColor(value)} transition-all`}
          style={{ width: `${value}%` }}
        />
        {target && (
          <div
            className="absolute top-0 h-full w-0.5 bg-foreground/50"
            style={{ left: `${target}%` }}
          />
        )}
      </div>
    </div>
  );
}

// Mini barre de progression pour le tableau
function MiniProgressBar({ value }: { value: number }) {
  const getColor = (v: number) => {
    if (v >= 80) return 'bg-green-500';
    if (v >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (v: number) => {
    if (v >= 80) return 'text-green-600';
    if (v >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center gap-2 min-w-20">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(value)} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`text-xs font-medium w-8 text-right ${getTextColor(value)}`}>
        {value}%
      </span>
    </div>
  );
}

export default async function TuningQualityPage() {
  const [stats, metrics, sites, coverageBySource] = await Promise.all([
    getCoverageStats(),
    getAdminMetrics(),
    getAllSites(),
    getCoverageBySource(),
  ]);

  // Cibles de qualité
  const targets = {
    material: 95,
    color: 85,
    pattern: 60,
    length: 80,
    width: 50,
  };

  // Score global pondéré
  const globalScore = Math.round(
    (stats.coverage.material * 0.3 +
     stats.coverage.color * 0.25 +
     stats.coverage.pattern * 0.15 +
     stats.coverage.length * 0.2 +
     stats.coverage.width * 0.1)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/tuning">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Dashboard Qualité</h1>
          <p className="text-muted-foreground">
            Métriques de couverture sur {stats.total.toLocaleString()} textiles
          </p>
        </div>
      </div>

      {/* Score global + Recommandations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Score Global</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${
                globalScore >= 70 ? 'text-green-600' :
                globalScore >= 40 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {globalScore}%
              </div>
              <div>
                {globalScore >= 70 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {globalScore >= 70 ? 'Bonne qualité' :
               globalScore >= 40 ? 'Qualité moyenne' :
               'Qualité insuffisante'}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardDescription>Statistiques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Textiles indexés</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{metrics.pendingUnknowns}</div>
                <div className="text-xs text-muted-foreground">Unknowns en attente</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{sites.length}</div>
                <div className="text-xs text-muted-foreground">Sources actives</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Couverture par dimension */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Couverture Globale par Dimension
          </CardTitle>
          <CardDescription>
            Pourcentage de textiles avec chaque attribut renseigné
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProgressBar
            label="Matière (fiber)"
            value={stats.coverage.material}
            target={targets.material}
          />
          <ProgressBar
            label="Couleur"
            value={stats.coverage.color}
            target={targets.color}
          />
          <ProgressBar
            label="Motif (pattern)"
            value={stats.coverage.pattern}
            target={targets.pattern}
          />
          <ProgressBar
            label="Longueur disponible"
            value={stats.coverage.length}
            target={targets.length}
          />
          <ProgressBar
            label="Largeur (laize)"
            value={stats.coverage.width}
            target={targets.width}
          />
        </CardContent>
      </Card>

      {/* NEW: Coverage par source - Sprint A1 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Couverture par Source
          </CardTitle>
          <CardDescription>
            Détail de la qualité des données par fournisseur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Source</th>
                  <th className="text-right py-3 px-2 font-medium">Textiles</th>
                  <th className="py-3 px-2 font-medium">Matière</th>
                  <th className="py-3 px-2 font-medium">Couleur</th>
                  <th className="py-3 px-2 font-medium">Motif</th>
                  <th className="py-3 px-2 font-medium">Tissage</th>
                  <th className="py-3 px-2 font-medium">Largeur</th>
                  <th className="py-3 px-2 font-medium">Quantité</th>
                  <th className="py-3 px-2 font-medium">Prix/m</th>
                </tr>
              </thead>
              <tbody>
                {coverageBySource.map((source) => (
                  <tr key={source.siteId} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2">
                      <Link 
                        href={`/admin/sites/${source.siteId}`}
                        className="font-medium hover:underline text-blue-600 dark:text-blue-400"
                      >
                        {source.siteName}
                      </Link>
                    </td>
                    <td className="text-right py-3 px-2 font-mono">
                      {source.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-2">
                      <MiniProgressBar value={source.coverage.fiber} />
                    </td>
                    <td className="py-3 px-2">
                      <MiniProgressBar value={source.coverage.color} />
                    </td>
                    <td className="py-3 px-2">
                      <MiniProgressBar value={source.coverage.pattern} />
                    </td>
                    <td className="py-3 px-2">
                      <MiniProgressBar value={source.coverage.weave} />
                    </td>
                    <td className="py-3 px-2">
                      <MiniProgressBar value={source.coverage.width} />
                    </td>
                    <td className="py-3 px-2">
                      <MiniProgressBar value={source.coverage.quantity} />
                    </td>
                    <td className="py-3 px-2">
                      <MiniProgressBar value={source.coverage.price} />
                    </td>
                  </tr>
                ))}
                {coverageBySource.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                      Aucune donnée disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions pour améliorer la qualité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.pendingUnknowns > 0 && (
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <span className="text-sm">
                <strong>{metrics.pendingUnknowns}</strong> termes inconnus à traiter
              </span>
              <Button size="sm" asChild>
                <Link href="/admin/tuning">Traiter</Link>
              </Button>
            </div>
          )}
          {stats.coverage.material < targets.material && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">
                Améliorer la couverture matière (+{targets.material - stats.coverage.material}% pour atteindre la cible)
              </span>
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin/tuning">Dictionnaire</Link>
              </Button>
            </div>
          )}
          {stats.coverage.length < targets.length && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">
                Configurer l'extraction des longueurs
              </span>
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin/discovery">Patterns</Link>
              </Button>
            </div>
          )}
          {globalScore >= 70 && metrics.pendingUnknowns === 0 && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
              <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <span className="text-sm text-green-700 dark:text-green-300">
                La qualité des données est bonne !
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
