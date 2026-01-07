// src/app/admin/dictionary/page.tsx

import Link from 'next/link';
import { Book, Search, Plus, Languages, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createAdminClient } from '@/lib/supabase/admin';

// Récupérer les stats du dictionnaire
async function getDictionaryStats() {
  const supabase = createAdminClient();
  
  // Compter les mappings par catégorie
  const { data: mappings } = await supabase
    .from('dictionary_mappings')
    .select('category_id, source_locale, confidence');

  const { data: categories } = await supabase
    .from('attribute_categories')
    .select('id, name, slug');

  // Grouper par catégorie
  const statsByCategory: Record<string, { count: number; avgConfidence: number }> = {};
  
  if (mappings) {
    for (const m of mappings) {
      const catId = m.category_id;
      if (!statsByCategory[catId]) {
        statsByCategory[catId] = { count: 0, avgConfidence: 0 };
      }
      statsByCategory[catId].count++;
      statsByCategory[catId].avgConfidence += Number(m.confidence) || 1;
    }
    // Calculer les moyennes
    for (const catId of Object.keys(statsByCategory)) {
      statsByCategory[catId].avgConfidence /= statsByCategory[catId].count;
    }
  }

  // Stats par locale
  const statsByLocale: Record<string, number> = {};
  if (mappings) {
    for (const m of mappings) {
      const locale = m.source_locale || 'unknown';
      statsByLocale[locale] = (statsByLocale[locale] || 0) + 1;
    }
  }

  return {
    totalMappings: mappings?.length || 0,
    categories: categories || [],
    statsByCategory,
    statsByLocale,
  };
}

// Récupérer les mappings récents
async function getRecentMappings(limit: number = 10) {
  const supabase = createAdminClient();
  
  const { data } = await supabase
    .from('dictionary_mappings')
    .select(`
      id,
      source_term,
      source_locale,
      translations,
      confidence,
      created_at,
      category_id
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

function LocaleBadge({ locale }: { locale: string }) {
  const colors: Record<string, string> = {
    fr: 'bg-blue-100 text-blue-800',
    en: 'bg-green-100 text-green-800',
    es: 'bg-orange-100 text-orange-800',
    it: 'bg-red-100 text-red-800',
  };
  
  return (
    <Badge className={colors[locale] || 'bg-gray-100 text-gray-800'}>
      {locale.toUpperCase()}
    </Badge>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 90 ? 'text-green-600' : pct >= 70 ? 'text-yellow-600' : 'text-red-600';
  
  return <span className={`text-sm font-medium ${color}`}>{pct}%</span>;
}

export default async function DictionaryPage() {
  const [stats, recentMappings] = await Promise.all([
    getDictionaryStats(),
    getRecentMappings(10),
  ]);

  // Trouver le nom de catégorie par ID
  const getCategoryName = (categoryId: string) => {
    const cat = stats.categories.find(c => c.id === categoryId);
    return cat?.name || 'Inconnu';
  };

  const getCategorySlug = (categoryId: string) => {
    const cat = stats.categories.find(c => c.id === categoryId);
    return cat?.slug || '';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Book className="h-6 w-6" />
            Dictionnaire
          </h1>
          <p className="text-muted-foreground">
            Gérez les mappings de normalisation pour les attributs textiles.
          </p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un mapping
        </Button>
      </div>

      {/* Info box */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Le dictionnaire contient les mappings entre termes sources (français, anglais, etc.) 
            et leurs traductions normalisées. Ces mappings sont utilisés lors du scraping 
            pour normaliser les attributs des textiles.
          </p>
        </CardContent>
      </Card>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Mappings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMappings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Catégories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.categories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Langues sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(stats.statsByLocale).map(([locale, count]) => (
                <div key={locale} className="flex items-center gap-1">
                  <LocaleBadge locale={locale} />
                  <span className="text-sm text-muted-foreground">({count})</span>
                </div>
              ))}
              {Object.keys(stats.statsByLocale).length === 0 && (
                <span className="text-muted-foreground">Aucun</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unknowns en attente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold">0</div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/tuning">Traiter</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Mappings par catégorie
          </CardTitle>
          <CardDescription>
            Distribution des mappings dans chaque catégorie d'attributs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.categories.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">Aucune catégorie configurée</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.categories.map(cat => {
                const catStats = stats.statsByCategory[cat.id] || { count: 0, avgConfidence: 0 };
                return (
                  <div
                    key={cat.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{cat.name}</span>
                      <Badge variant="outline">{cat.slug}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {catStats.count} mapping{catStats.count > 1 ? 's' : ''}
                      </span>
                      {catStats.count > 0 && (
                        <ConfidenceBadge confidence={catStats.avgConfidence} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mappings récents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Mappings récents
              </CardTitle>
              <CardDescription>Derniers mappings ajoutés au dictionnaire</CardDescription>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentMappings.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Aucun mapping dans le dictionnaire. Les mappings sont créés automatiquement 
              lors de l'approbation des termes inconnus.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Terme source</th>
                    <th className="pb-2 font-medium">Langue</th>
                    <th className="pb-2 font-medium">Catégorie</th>
                    <th className="pb-2 font-medium">Traductions</th>
                    <th className="pb-2 font-medium">Confiance</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentMappings.map((mapping: any) => (
                    <tr key={mapping.id}>
                      <td className="py-2 font-medium">{mapping.source_term}</td>
                      <td className="py-2">
                        <LocaleBadge locale={mapping.source_locale} />
                      </td>
                      <td className="py-2">
                        <Badge variant="outline">
                          {getCategorySlug(mapping.category_id)}
                        </Badge>
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {mapping.translations && typeof mapping.translations === 'object' 
                          ? Object.entries(mapping.translations).map(([lang, val]) => (
                              <span key={lang} className="mr-2">
                                {lang}: {String(val)}
                              </span>
                            ))
                          : '-'
                        }
                      </td>
                      <td className="py-2">
                        <ConfidenceBadge confidence={mapping.confidence || 1} />
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {mapping.created_at 
                          ? new Date(mapping.created_at).toLocaleDateString('fr-FR')
                          : '-'
                        }
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
