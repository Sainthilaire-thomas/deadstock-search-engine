/**
 * Journey Page - Vue par type/phase des éléments d'un Board
 * 
 * Server Component qui charge les données initiales pour search et favorites,
 * puis les passe au Client Component wrapper.
 */

import { searchTextiles } from "@/features/search/application/searchTextiles";
import { getOrCreateSessionId } from "@/features/favorites/utils/sessionManager";
import { getFavoritesBySession } from "@/features/favorites/infrastructure/favoritesRepository";
import { JourneyClientWrapper } from "@/features/journey/components/JourneyClientWrapper";
import type { FavoriteWithTextile } from "@/features/favorites/domain/types";

export default async function JourneyPage() {
  // Charger les données de recherche initiales
  const initialSearchData = await searchTextiles();

  // Charger les favoris
  let initialFavorites: FavoriteWithTextile[] = [];
  try {
    const sessionId = await getOrCreateSessionId();
    initialFavorites = await getFavoritesBySession(sessionId);
  } catch (error) {
    console.error("Could not load favorites:", error);
  }

  // Ajouter l'info isFavorite à chaque textile pour la recherche
  const favoriteIds = new Set(initialFavorites.map(f => f.textile_id));
  const textilesWithFavorites = initialSearchData.textiles.map(textile => ({
    ...textile,
    isFavorite: favoriteIds.has(textile.id),
  }));

  const searchDataWithFavorites = {
    ...initialSearchData,
    textiles: textilesWithFavorites,
  };

  return (
    <JourneyClientWrapper
      initialSearchData={searchDataWithFavorites}
      initialFavorites={initialFavorites}
    />
  );
}
