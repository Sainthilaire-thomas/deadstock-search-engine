// src/app/(main)/home/page.tsx

import Link from 'next/link';
import { Search, LayoutGrid, ArrowRight, Sparkles, Filter, Layers, Palette, Calculator, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { listBoardsAction } from '@/features/boards/actions/boardActions';

export const metadata = {
  title: 'Accueil | Deadstock',
  description: 'Recherchez des tissus deadstock ou créez un projet de design circulaire',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Récupérer le nombre de boards pour l'affichage
  const result = await listBoardsAction();
  const boards = result.data ?? [];
  const activeBoardsCount = boards.filter((b) => b.status !== 'archived').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Titre */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Que souhaitez-vous faire ?
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trouvez des tissus deadstock pour vos créations ou organisez votre projet de design avec une approche circulaire.
          </p>
        </div>

        {/* Cartes de choix */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Carte Recherche */}
          <Link href="/search" className="group">
            <Card className="h-full hover:border-foreground/20 transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-6 md:p-8 flex flex-col h-full">
                {/* Icône */}
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Search className="w-7 h-7 text-primary" />
                </div>

                {/* Titre et description */}
                <h2 className="text-xl font-semibold mb-2">
                  Rechercher des tissus
                </h2>
                <p className="text-muted-foreground mb-6 flex-1">
                  Explorez notre catalogue de tissus deadstock provenant de plusieurs fournisseurs. Filtres avancés, recherche multi-critères.
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Layers className="w-4 h-4 text-primary/70" />
                    <span>268 tissus de 4 fournisseurs</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Filter className="w-4 h-4 text-primary/70" />
                    <span>Filtres par matière, couleur, prix</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-primary/70" />
                    <span>Accès direct et instantané</span>
                  </li>
                </ul>

                {/* CTA */}
                <div className="flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                  Lancer une recherche
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Carte Projets */}
          <Link href="/boards" className="group">
            <Card className="relative h-full hover:border-foreground/20 transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-6 md:p-8 flex flex-col h-full">
                {/* Icône */}
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <LayoutGrid className="w-7 h-7 text-primary" />
                </div>

                {/* Badge compteur */}
                {activeBoardsCount > 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                      {activeBoardsCount} projet{activeBoardsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Titre et description */}
                <h2 className="text-xl font-semibold mb-2">
                  Mes Projets
                </h2>
                <p className="text-muted-foreground mb-6 flex-1">
                  Créez un projet de design avec une approche circulaire. Moodboard, calcul de métrage, recherche contextuelle de tissus.
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Palette className="w-4 h-4 text-primary/70" />
                    <span>Moodboard & palettes de couleurs</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Calculator className="w-4 h-4 text-primary/70" />
                    <span>Calcul de métrage automatique</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Target className="w-4 h-4 text-primary/70" />
                    <span>Recherche contextuelle intelligente</span>
                  </li>
                </ul>

                {/* CTA */}
                <div className="flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                  {activeBoardsCount > 0 ? 'Voir mes projets' : 'Créer un projet'}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Note bas de page */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Les deux approches sont complémentaires : recherchez librement ou laissez votre projet guider vos choix.
        </p>
      </div>
    </div>
  );
}
