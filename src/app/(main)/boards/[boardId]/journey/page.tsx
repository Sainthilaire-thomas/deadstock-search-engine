/**
 * Journey Page - Vue par type/phase des éléments d'un Board
 *
 * Server Component allégé - les textiles sont chargés à la demande
 * côté client pour éviter le chargement de 268+ textiles au mount.
 */
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { getFavoritesBySession } from "@/features/favorites/infrastructure/favoritesRepository";
import { JourneyClientWrapper } from "@/features/journey/components/JourneyClientWrapper";
import type { FavoriteWithTextile } from "@/features/favorites/domain/types";

export default async function JourneyPage() {
  // Charger uniquement les favoris (léger)
  // Les textiles seront chargés à la demande dans TextileJourneyView
  let initialFavorites: FavoriteWithTextile[] = [];
  
  try {
    const user = await getAuthUser();
    if (user) {
      initialFavorites = await getFavoritesBySession(user.id);
    }
  } catch (error) {
    console.error("Could not load favorites:", error);
  }

  return (
    <JourneyClientWrapper
      initialFavorites={initialFavorites}
    />
  );
}
