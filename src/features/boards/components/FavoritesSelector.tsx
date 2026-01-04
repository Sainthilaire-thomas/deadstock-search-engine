// src/features/boards/components/FavoritesSelector.tsx

'use client';

import { useState, useEffect } from 'react';
import { Heart, Plus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useBoard } from '../context/BoardContext';
import { getFavoritesAction } from '@/features/favorites/actions/favoriteActions';
import { addTextileToBoard } from '../actions/elementActions';
import type { FavoriteWithTextile } from '@/features/favorites/domain/types';

export function FavoritesSelector() {
  const { board, elements, isLoading: boardLoading } = useBoard();
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteWithTextile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  // IDs des textiles déjà sur le board
  const textileIdsOnBoard = new Set(
    elements
      .filter((el) => el.elementType === 'textile')
      .map((el) => (el.elementData as { textileId?: string })?.textileId)
      .filter(Boolean)
  );

  // Charger les favoris à l'ouverture
  useEffect(() => {
    if (isOpen) {
      loadFavorites();
    }
  }, [isOpen]);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const result = await getFavoritesAction();
      if (result.success && result.data) {
        setFavorites(result.data);
      }
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTextile = async (favorite: FavoriteWithTextile) => {
    if (!board || !favorite.textile) return;

    const textile = favorite.textile;
    setAddingId(textile.id);

    try {
      // Position aléatoire pour éviter l'empilement
      const position = {
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 200,
      };

      const result = await addTextileToBoard(
        board.id,
        {
          id: textile.id,
          name: textile.name,
          source: textile.source_platform,
          price: textile.price_value,
          imageUrl: textile.image_url,
          availableQuantity: textile.quantity_value,
          material: textile.material_type,
          color: textile.color,
        },
        position
      );

      if (result.success) {
        // Rafraîchir la page pour voir le nouvel élément
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur ajout textile:', error);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={boardLoading}
        >
          <Heart className="w-4 h-4 mr-2" />
          Tissu depuis favoris
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-100 sm:w-135">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Mes favoris
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Aucun favori pour le moment.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez des tissus à vos favoris depuis la recherche.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {favorites.map((favorite) => {
                const textile = favorite.textile;
                if (!textile) return null;

                const isOnBoard = textileIdsOnBoard.has(textile.id);
                const isAdding = addingId === textile.id;

                return (
                  <div
                    key={favorite.id}
                    className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                      isOnBoard
                        ? 'bg-muted/50 border-muted'
                        : 'bg-background hover:bg-muted/30'
                    }`}
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                      {textile.image_url ? (
                        <img
                          src={textile.image_url}
                          alt={textile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Heart className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {textile.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {textile.source_platform}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {textile.price_value && (
                          <span className="text-sm font-medium">
                            {textile.price_value.toFixed(2)} {textile.price_currency || '€'}
                          </span>
                        )}
                        {textile.material_type && (
                          <span className="text-xs text-muted-foreground">
                            • {textile.material_type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0">
                      {isOnBoard ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Check className="w-4 h-4" />
                          <span>Ajouté</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddTextile(favorite)}
                          disabled={isAdding}
                        >
                          {isAdding ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
