'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FavoriteButton } from './FavoriteButton';
import type { FavoriteWithTextile } from '../domain/types';

interface FavoriteDetailViewProps {
  favorite: FavoriteWithTextile;
  prevFavorite: FavoriteWithTextile | null;
  nextFavorite: FavoriteWithTextile | null;
  currentIndex: number;
  totalFavorites: number;
}

export function FavoriteDetailView({
  favorite,
  prevFavorite,
  nextFavorite,
  currentIndex,
  totalFavorites,
}: FavoriteDetailViewProps) {
  const textile = favorite.textile;

  return (
    <div className='container mx-auto py-8 max-w-5xl'>
      {/* Navigation supérieure */}
      <div className='mb-6 flex items-center justify-between'>
        <Link
          href='/favorites'
          className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' />
          Retour aux favoris
        </Link>

        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>
            Favori {currentIndex + 1} sur {totalFavorites}
          </span>
        </div>
      </div>

      {/* Navigation entre favoris */}
      <div className='mb-6 flex items-center justify-between gap-4'>
        <Button
          asChild
          variant='outline'
          size='sm'
          disabled={!prevFavorite}
          className='gap-2'
        >
          {prevFavorite ? (
            <Link href={'/favorites/' + prevFavorite.textile.id}>
              <ChevronLeft className='h-4 w-4' />
              Favori précédent
            </Link>
          ) : (
            <span>
              <ChevronLeft className='h-4 w-4' />
              Favori précédent
            </span>
          )}
        </Button>

        <Button
          asChild
          variant='outline'
          size='sm'
          disabled={!nextFavorite}
          className='gap-2'
        >
          {nextFavorite ? (
            <Link href={'/favorites/' + nextFavorite.textile.id}>
              Favori suivant
              <ChevronRight className='h-4 w-4' />
            </Link>
          ) : (
            <span>
              Favori suivant
              <ChevronRight className='h-4 w-4' />
            </span>
          )}
        </Button>
      </div>

      {/* Contenu principal */}
      <div className='grid lg:grid-cols-2 gap-8'>
        {/* Image */}
        <div className='relative'>
          <div className='sticky top-24'>
            <div className='relative aspect-square bg-muted rounded-lg overflow-hidden'>
              {textile.image_url ? (
                <Image
                  src={textile.image_url}
                  alt={textile.name}
                  fill
                  className='object-cover'
                  priority
                />
              ) : (
                <div className='flex items-center justify-center h-full text-muted-foreground'>
                  Pas d&apos;image
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Détails */}
        <div className='space-y-6'>
          {/* Header avec titre et favori */}
          <div>
            <div className='flex items-start justify-between gap-4 mb-4'>
              <h1 className='text-3xl font-bold'>{textile.name}</h1>
              <FavoriteButton textileId={textile.id} />
            </div>

            <div className='flex flex-wrap gap-2 mb-4'>
              {textile.material_type && (
                <Badge variant='secondary' className='capitalize'>
                  {textile.material_type}
                </Badge>
              )}
              {textile.color && (
                <Badge variant='outline' className='capitalize'>
                  {textile.color}
                </Badge>
              )}
              {textile.pattern && (
                <Badge variant='outline' className='capitalize'>
                  {textile.pattern}
                </Badge>
              )}
            </div>
          </div>

          {/* Prix et quantité */}
          <Card>
            <CardContent className='p-6 space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Prix</span>
                <span className='text-2xl font-bold'>
                  {textile.price_value
                    ? textile.price_value.toFixed(2) + ' ' + textile.price_currency + '/' + textile.quantity_unit
                    : 'Prix non disponible'}
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Quantité disponible</span>
                <span className='text-lg font-semibold'>
                  {textile.quantity_value} {textile.quantity_unit}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Caractéristiques détaillées */}
          <div className='space-y-4'>
            <h2 className='text-xl font-semibold'>Caractéristiques</h2>

            <div className='space-y-3'>
              {textile.composition && (
                <div className='flex justify-between py-2 border-b'>
                  <span className='text-sm text-muted-foreground'>Composition</span>
                  <span className='text-sm font-medium text-right'>
                    {typeof textile.composition === 'string' 
                      ? textile.composition 
                      : JSON.stringify(textile.composition)}
                  </span>
                </div>
              )}

              {textile.width_value && (
                <div className='flex justify-between py-2 border-b'>
                  <span className='text-sm text-muted-foreground'>Largeur</span>
                  <span className='text-sm font-medium'>
                    {textile.width_value} {textile.width_unit || 'cm'}
                  </span>
                </div>
              )}

              {textile.weight_value && (
                <div className='flex justify-between py-2 border-b'>
                  <span className='text-sm text-muted-foreground'>Poids</span>
                  <span className='text-sm font-medium'>
                    {textile.weight_value} {textile.weight_unit || 'g/m²'}
                  </span>
                </div>
              )}

              <div className='flex justify-between py-2 border-b'>
                <span className='text-sm text-muted-foreground'>Source</span>
                <span className='text-sm font-medium capitalize'>{textile.source_platform}</span>
              </div>
            </div>
          </div>

          {/* Description */}
         {textile.description && (
  <div className='space-y-2'>
    <h2 className='text-xl font-semibold'>Description</h2>
    <div 
      className='text-muted-foreground leading-relaxed prose prose-sm max-w-none'
      dangerouslySetInnerHTML={{ __html: textile.description }}
    />
  </div>
)}

          {/* Bouton achat */}
          <Button asChild size='lg' className='w-full gap-2'>
            <a href={textile.source_url} target='_blank' rel='noopener noreferrer'>
              <ExternalLink className='h-4 w-4' />
              Acheter sur {textile.source_platform}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
