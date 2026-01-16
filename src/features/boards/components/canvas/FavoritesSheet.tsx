// src/features/boards/components/canvas/FavoritesSheet.tsx
// Sheet pour ajouter des textiles depuis les favoris

'use client';

import { useState, useEffect } from 'react';
import { Heart, Plus, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { getFavoritesAction } from '@/features/favorites/actions/favoriteActions';
import type { FavoriteWithTextile } from '@/features/favorites/domain/types';
import type { TextileElementData } from '../../domain/types';

interface FavoritesSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  textileIdsOnBoard: Set<string>;
  onAddTextile: (elementData: TextileElementData, name: string) => Promise<void>;
}

export function FavoritesSheet({
  isOpen,
  onOpenChange,
  textileIdsOnBoard,
  onAddTextile,
}: FavoritesSheetProps) {
  const [favorites, setFavorites] = useState<FavoriteWithTextile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingTextileId, setAddingTextileId] = useState<string | null>(null);

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
    if (!favorite.textile) return;

    const textile = favorite.textile;
    setAddingTextileId(textile.id);

    try {
      const elementData: TextileElementData = {
        textileId: textile.id,
        snapshot: {
          name: textile.name,
          source: textile.source_platform || '',
          price: textile.price_value || 0,
          currency: textile.price_currency || 'EUR',
          imageUrl: textile.image_url || null,
          availableQuantity: textile.quantity_value || null,
          material: textile.material_type || null,
          color: textile.color || null,
        },
      };

      await onAddTextile(elementData, textile.name);
      toast.success(`"${textile.name}" ajouté au board`);
    } catch (error) {
      console.error('Erreur ajout textile:', error);
      toast.error("Erreur lors de l'ajout du tissu");
    } finally {
      setAddingTextileId(null);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-100 sm:w-135">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Ajouter un tissu depuis mes favoris
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
                const isAdding = addingTextileId === textile.id;

                return (
                  <div
                    key={favorite.id}
                    className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                      isOnBoard
                        ? 'bg-muted/50 border-muted'
                        : 'bg-background hover:bg-muted/30'
                    }`}
                  >
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

                    <div className="shrink-0 flex items-center">
                      {isOnBoard ? (
                        <div className="flex items-center gap-1 text-xs text-green-600">
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
                            <>
                              <Plus className="w-4 h-4 mr-1" />
                              Ajouter
                            </>
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
