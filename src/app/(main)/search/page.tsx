import { searchTextiles } from '@/features/search/application/searchTextiles';
import { SearchInterface } from '@/components/search/SearchInterface';
import { getOrCreateSessionId } from '@/features/favorites/utils/sessionManager';
import { getFavoritesBySession } from '@/features/favorites/infrastructure/favoritesRepository';

export default async function SearchPage() {
  // Initial load: fetch all textiles and available filters
  const initialData = await searchTextiles();
  
  // Récupérer les favoris de la session (avec fallback si erreur)
  let favoriteIds = new Set<string>();
  try {
    const sessionId = await getOrCreateSessionId();
    const favorites = await getFavoritesBySession(sessionId);
    favoriteIds = new Set(favorites.map(f => f.textile_id));
  } catch (error) {
    console.error('Could not load favorites, continuing without them:', error);
  }
  
  // Ajouter l'info isFavorite à chaque textile
  const textilesWithFavorites = initialData.textiles.map(textile => ({
    ...textile,
    isFavorite: favoriteIds.has(textile.id),
  }));
  
  const dataWithFavorites = {
    ...initialData,
    textiles: textilesWithFavorites,
  };
  
  return (
    <div className='container mx-auto py-8'>
      {/* Header avec titre */}
      <div className='mb-8'>
        <h1 className='text-4xl font-bold mb-2'>Sourcing - Recherche de Textiles</h1>
        <p className='text-muted-foreground'>
          Trouvez le textile parfait parmi {initialData.total} produits deadstock
        </p>
      </div>

      {/* Message d'aide contextuel */}
      <div className='mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg'>
        <div className='flex gap-3'>
          <span className='text-2xl'>💡</span>
          <div className='space-y-1'>
            <p className='text-sm font-medium'>Comment utiliser la recherche ?</p>
            <ul className='text-sm text-muted-foreground space-y-1'>
              <li>• Utilisez les <strong>filtres</strong> pour affiner votre recherche</li>
              <li>• Cliquez sur <strong>❤️</strong> pour ajouter des tissus à vos favoris</li>
              <li>• Comparez ensuite vos favoris dans l&apos;étape <strong>Validation</strong></li>
            </ul>
          </div>
        </div>
      </div>

      <SearchInterface initialData={dataWithFavorites} />
    </div>
  );
}
