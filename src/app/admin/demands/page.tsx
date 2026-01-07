// src/app/admin/demands/page.tsx

import { Search, TrendingUp, AlertTriangle, BarChart, Clock, Zap, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function DemandsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart className="h-6 w-6" />
            Monitoring Recherches
          </h1>
          <p className="text-muted-foreground">
            Suivi des recherches utilisateurs et du système demand-driven.
          </p>
        </div>
      </div>

      {/* Info box - Concept */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Système Demand-Driven.</strong> La recherche initiale interroge les textiles en base. 
            Si peu de résultats, l'utilisateur peut lancer une "recherche étendue" qui re-scrape 
            les sources en temps réel. Les termes inconnus sont traités par LLM et remontés ici.
          </p>
        </CardContent>
      </Card>

      {/* Workflow visuel */}
      <Card>
        <CardHeader>
          <CardTitle>Flux de recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 text-sm">
            {/* Step 1 */}
            <div className="flex-1 p-3 border rounded-lg text-center bg-muted/30">
              <Search className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="font-medium">Recherche initiale</div>
              <div className="text-xs text-muted-foreground">Dans la base locale</div>
            </div>
            
            <div className="text-muted-foreground">→</div>
            
            {/* Step 2 */}
            <div className="flex-1 p-3 border rounded-lg text-center bg-muted/30">
              <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="font-medium">Peu de résultats ?</div>
              <div className="text-xs text-muted-foreground">&lt; 10 textiles</div>
            </div>
            
            <div className="text-muted-foreground">→</div>
            
            {/* Step 3 */}
            <div className="flex-1 p-3 border rounded-lg text-center bg-blue-50 dark:bg-blue-950">
              <RefreshCw className="h-5 w-5 mx-auto mb-2 text-blue-600" />
              <div className="font-medium text-blue-700 dark:text-blue-300">Recherche étendue</div>
              <div className="text-xs text-muted-foreground">Scraping temps réel</div>
            </div>
            
            <div className="text-muted-foreground">→</div>
            
            {/* Step 4 */}
            <div className="flex-1 p-3 border rounded-lg text-center bg-green-50 dark:bg-green-950">
              <Zap className="h-5 w-5 mx-auto mb-2 text-green-600" />
              <div className="font-medium text-green-700 dark:text-green-300">Nouveaux résultats</div>
              <div className="text-xs text-muted-foreground">Affichés en temps réel</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recherches aujourd'hui</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Total utilisateurs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recherches étendues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">-</div>
            <p className="text-xs text-muted-foreground">Déclenchées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taux de satisfaction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">- %</div>
            <p className="text-xs text-muted-foreground">Résultats trouvés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              Termes inconnus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-orange-600">0</div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/tuning">Traiter</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Termes inconnus - cas spécial */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <AlertTriangle className="h-5 w-5" />
            Traitement des termes inconnus
          </CardTitle>
          <CardDescription>
            Quand une recherche contient des termes non reconnus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-orange-50 dark:bg-orange-950/50 rounded-lg">
              <div className="font-medium mb-2">1. Détection automatique</div>
              <p className="text-muted-foreground">
                "lin bio certifié" → "lin" reconnu, "bio certifié" inconnu
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
              <div className="font-medium mb-2">2. Analyse LLM</div>
              <p className="text-muted-foreground">
                Suggestion automatique : "bio certifié" → "organic certified" (85% confiance)
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
              <div className="font-medium mb-2">3. Remontée admin</div>
              <p className="text-muted-foreground">
                Notification dans Tuning pour validation humaine si confiance &lt; 90%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recherches non satisfaites */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recherches non satisfaites
              </CardTitle>
              <CardDescription>
                Termes fréquemment recherchés avec peu ou pas de résultats
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Search className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              Les statistiques de recherche seront disponibles une fois le tracking activé.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status fonctionnalité */}
      <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Fonctionnalité en cours de développement
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Le système demand-driven nécessite l'implémentation de : 
                tracking des recherches, API de scraping temps réel, 
                intégration LLM pour les termes inconnus.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
