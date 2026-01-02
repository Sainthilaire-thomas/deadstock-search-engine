'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavorites } from '../context/FavoritesContext';

interface FavoritesCountBadgeProps {
  className?: string;
}

export function FavoritesCountBadge({ className }: FavoritesCountBadgeProps) {
  const { count } = useFavorites();

  return (
    <Link
      href='/favorites'
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-full transition-colors',
        'hover:bg-accent',
        className
      )}
      aria-label={count + ' favoris'}
    >
      <Heart className='h-5 w-5' />
      
      {count > 0 && (
        <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold'>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
