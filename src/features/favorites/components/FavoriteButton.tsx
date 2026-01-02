'use client';

import { useTransition } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleFavoriteAction } from '../actions/favoriteActions';
import { Button } from '@/components/ui/button';
import { useFavorites } from '../context/FavoritesContext';

interface FavoriteButtonProps {
  textileId: string;
  variant?: 'default' | 'icon-only';
  className?: string;
}

export function FavoriteButton({
  textileId,
  variant = 'icon-only',
  className,
}: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [isPending, startTransition] = useTransition();
  const isCurrentlyFavorite = isFavorite(textileId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update - instantané !
    if (isCurrentlyFavorite) {
      removeFavorite(textileId);
    } else {
      addFavorite(textileId);
    }

    // Sync avec le serveur en arrière-plan
    startTransition(async () => {
      await toggleFavoriteAction(textileId);
    });
  };

  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          'group relative flex h-9 w-9 items-center justify-center rounded-full transition-all',
          'bg-background/80 backdrop-blur-sm hover:bg-background',
          'border border-border hover:border-primary',
          isPending && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-label={isCurrentlyFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Heart
          className={cn(
            'h-5 w-5 transition-all',
            isCurrentlyFavorite
              ? 'fill-primary text-primary'
              : 'text-muted-foreground group-hover:text-primary'
          )}
        />
      </button>
    );
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      variant={isCurrentlyFavorite ? 'default' : 'outline'}
      size='sm'
      className={cn('gap-2', className)}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-all',
          isCurrentlyFavorite && 'fill-current'
        )}
      />
      {isCurrentlyFavorite ? 'En favoris' : 'Ajouter aux favoris'}
    </Button>
  );
}
