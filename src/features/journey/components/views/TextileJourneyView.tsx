"use client";
import { useState, useCallback } from "react";
import { useBoard } from "@/features/boards/context/BoardContext";
import { useFavorites } from "@/features/favorites/context/FavoritesContext";
import { SearchInterface } from "@/components/search/SearchInterface";
import { FavoritesGrid } from "@/features/favorites/components/FavoritesGrid";
import { getFavoritesAction } from "@/features/favorites/actions/favoriteActions";
import { ELEMENT_TYPE_CONFIGS } from "@/features/journey/config/steps";
import type { BoardElement } from "@/features/boards/domain/types";
import type { FavoriteWithTextile } from "@/features/favorites/domain/types";
import type { SearchResult } from "@/features/search/domain/types";

// Tabs disponibles
type TabId = "board" | "search" | "favorites" | "compare";

interface Tab {
  id: TabId;
  label: string;
  badge?: number;
}

// Props - initialSearchData n'est plus requis (lazy load)
interface TextileJourneyViewProps {
  initialFavorites: FavoriteWithTextile[];
}

// Composant pour afficher un élément textile du board
function TextileElementItem({ element }: { element: BoardElement }) {
  const data = element.elementData as unknown as {
    snapshot?: {
      name?: string;
      source?: string;
      price?: number;
      imageUrl?: string;
    };
  };

  const snapshot = data.snapshot;
  const config = ELEMENT_TYPE_CONFIGS.textile;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer">
      {snapshot?.imageUrl ? (
        <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
          <img
            src={snapshot.imageUrl}
            alt={snapshot.name || "Tissu"}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted shrink-0">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {snapshot?.name || "Tissu sans nom"}
        </p>
        {snapshot?.source && (
          <p className="text-xs text-muted-foreground truncate">
            {snapshot.source}
          </p>
        )}
        {snapshot?.price && (
          <p className="text-xs text-muted-foreground">
            {snapshot.price.toFixed(2)} €
          </p>
        )}
      </div>
    </div>
  );
}

// Composant placeholder pour la comparaison
function CompareTabContent({ favorites }: { favorites: FavoriteWithTextile[] }) {
  if (favorites.length < 2) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-4xl mb-3">⚖️</div>
        <p className="font-medium">Comparaison de tissus</p>
        <p className="text-sm mt-1">
          Ajoutez au moins 2 tissus en favoris pour les comparer
        </p>
        <p className="text-xs mt-2">
          ({favorites.length}/2 minimum)
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12 text-muted-foreground">
      <div className="text-4xl mb-3">🚧</div>
      <p className="font-medium">Comparaison en cours de développement</p>
      <p className="text-sm mt-1">
        Vous pourrez bientôt comparer vos {favorites.length} favoris côte à côte
      </p>
    </div>
  );
}

// Skeleton pour le chargement de la recherche
function SearchSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Barre de recherche skeleton */}
      <div className="h-10 bg-muted rounded-lg w-full" />
      
      {/* Filtres skeleton */}
      <div className="flex gap-2">
        <div className="h-8 bg-muted rounded-md w-24" />
        <div className="h-8 bg-muted rounded-md w-20" />
        <div className="h-8 bg-muted rounded-md w-28" />
      </div>
      
      {/* Grille skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TextileJourneyView({
  initialFavorites
}: TextileJourneyViewProps) {
  const { elements } = useBoard();
  const { count: favoritesCount } = useFavorites();
  const [activeTab, setActiveTab] = useState<TabId>("board");
  const [favorites, setFavorites] = useState<FavoriteWithTextile[]>(initialFavorites);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  
  // État pour le lazy loading des textiles de recherche
  const [searchData, setSearchData] = useState<SearchResult | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Charger les textiles à la demande
  const loadSearchData = useCallback(async () => {
    if (searchData || isLoadingSearch) return; // Déjà chargé ou en cours
    
    setIsLoadingSearch(true);
    setSearchError(null);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Filtres vides = tous les textiles
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des textiles');
      }
      
      const data: SearchResult = await response.json();
      setSearchData(data);
    } catch (error) {
      console.error('Error loading search data:', error);
      setSearchError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoadingSearch(false);
    }
  }, [searchData, isLoadingSearch]);

  // Gérer le changement d'onglet
  const handleTabChange = async (tabId: TabId) => {
    setActiveTab(tabId);
    
    // Lazy load des textiles quand on va sur l'onglet Recherche
    if (tabId === "search" && !searchData) {
      loadSearchData();
    }
    
    // Recharger les favoris quand on clique sur l'onglet Favoris
    if (tabId === "favorites") {
      setIsLoadingFavorites(true);
      try {
        const result = await getFavoritesAction();
        if (result.success && result.data) {
          setFavorites(result.data);
        }
      } catch (error) {
        console.error("Error reloading favorites:", error);
      } finally {
        setIsLoadingFavorites(false);
      }
    }
  };

  // Filtrer les éléments textile du board
  const textileElements = elements.filter((el) => el.elementType === "textile");

  // Définir les tabs avec leurs badges
  const tabs: Tab[] = [
    { id: "board", label: "Mes Tissus", badge: textileElements.length },
    { id: "search", label: "Recherche" },
    { id: "favorites", label: "Favoris", badge: favoritesCount || undefined },
    { id: "compare", label: "Comparaison" },
  ];

  // Rendu du contenu selon le tab actif
  const renderTabContent = () => {
    switch (activeTab) {
      case "board":
        return textileElements.length > 0 ? (
          <div className="space-y-2">
            {textileElements.map((element) => (
              <TextileElementItem key={element.id} element={element} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-3">🧵</div>
            <p className="font-medium">Aucun tissu sur ce board</p>
            <p className="text-sm mt-1">
              Ajoutez des tissus depuis l'onglet Recherche ou Favoris
            </p>
          </div>
        );

      case "search":
        // Afficher skeleton pendant le chargement
        if (isLoadingSearch) {
          return <SearchSkeleton />;
        }
        
        // Afficher erreur si échec
        if (searchError) {
          return (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="font-medium text-destructive">Erreur de chargement</p>
              <p className="text-sm mt-1">{searchError}</p>
              <button
                onClick={loadSearchData}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
              >
                Réessayer
              </button>
            </div>
          );
        }
        
        // Afficher l'interface de recherche si chargé
        if (searchData) {
          return <SearchInterface initialData={searchData} />;
        }
        
        // État initial - déclencher le chargement
        return <SearchSkeleton />;

      case "favorites":
        if (isLoadingFavorites) {
          return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square bg-muted rounded-lg" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              ))}
            </div>
          );
        }
        
        return favorites.length > 0 ? (
          <FavoritesGrid favorites={favorites} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-3">❤️</div>
            <p className="font-medium">Aucun favori</p>
            <p className="text-sm mt-1">
              Ajoutez des tissus en favoris depuis la Recherche
            </p>
          </div>
        );

      case "compare":
        return <CompareTabContent favorites={favorites} />;

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header avec titre */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-foreground">Tissus</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez vos tissus : recherche, favoris et éléments du board
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <nav className="flex gap-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
                ${activeTab === tab.id
                  ? "bg-background border border-b-0 border-border text-foreground -mb-px"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`
                  ml-2 px-1.5 py-0.5 text-xs rounded-full
                  ${activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                  }
                `}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu du tab */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}
