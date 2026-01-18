// src/app/(main)/favorites/page.tsx

import Link from 'next/link';
import { Heart, Search } from 'lucide-react';
import { getFavoritesAction } from '@/features/favorites/actions/favoriteActions';
import { FavoritesGrid } from '@/features/favorites/components/FavoritesGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Mes Favoris | Deadstock',
  description: 'Vos tissus deadstock favoris',
};

export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
  const result = await getFavoritesAction();
  const favorites = result.data || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Mes Favoris</h1>
          <p className="text-muted-foreground mt-1">
            {favorites.length} tissu{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
          </p>
        </div>
        {favorites.length > 0 && (
          <Button asChild variant="outline">
            <Link href="/search">
              <Search className="w-4 h-4 mr-2" />
              Rechercher plus
            </Link>
          </Button>
        )}
      </div>

      {/* Empty state */}
      {favorites.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium mb-2">Aucun favori</h2>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Explorez notre catalogue et sauvegardez vos tissus préférés en cliquant sur le cœur.
            </p>
            <Button asChild>
              <Link href="/search">
                <Search className="w-4 h-4 mr-2" />
                Découvrir les tissus
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Favorites grid */}
      {favorites.length > 0 && (
        <FavoritesGrid favorites={favorites} />
      )}
    </div>
  );
}
