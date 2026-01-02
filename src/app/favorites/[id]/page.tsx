import { notFound } from 'next/navigation';
import { getOrCreateSessionId } from '@/features/favorites/utils/sessionManager';
import { getFavoritesBySessionServer } from '@/features/favorites/infrastructure/favoritesRepositoryServer';
import { FavoriteDetailView } from '@/features/favorites/components/FavoriteDetailView';

interface FavoriteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function FavoriteDetailPage({ params }: FavoriteDetailPageProps) {
  const { id } = await params;
  const sessionId = await getOrCreateSessionId();
  const favorites = await getFavoritesBySessionServer(sessionId);
  
  // Trouver le favori actuel
  const currentIndex = favorites.findIndex(f => f.textile.id === id);
  
  if (currentIndex === -1) {
    notFound();
  }
  
  const currentFavorite = favorites[currentIndex];
  const prevFavorite = currentIndex > 0 ? favorites[currentIndex - 1] : null;
  const nextFavorite = currentIndex < favorites.length - 1 ? favorites[currentIndex + 1] : null;
  
  return (
    <FavoriteDetailView
      favorite={currentFavorite}
      prevFavorite={prevFavorite}
      nextFavorite={nextFavorite}
      currentIndex={currentIndex}
      totalFavorites={favorites.length}
    />
  );
}
