'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { AddToBoardButton } from '@/features/boards/components/AddToBoardButton';
import type { Textile } from '@/features/search/domain/types';

interface TextileGridProps {
  textiles: (Textile & { isFavorite?: boolean })[];
  isLoading?: boolean;
}

export function TextileGrid({ textiles, isLoading = false }: TextileGridProps) {
  if (isLoading) {
    return (
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <Skeleton className='h-48 w-full' />
            <CardContent className='p-4 space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-4 w-1/2' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (textiles.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>Aucun textile trouvé</p>
      </div>
    );
  }

  return (
    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {textiles.map((textile) => (
        <div key={textile.id} className='relative'>
          {/* Boutons actions - EN DEHORS du Link */}
          <div className='absolute top-2 right-2 z-20 flex gap-1'>
            <AddToBoardButton
              textile={{
                id: textile.id,
                name: textile.name,
                source: textile.source_platform || '',
                price: textile.price_value,
                imageUrl: textile.image_url,
                availableQuantity: textile.quantity_value,
                material: textile.material_type,
                color: textile.color,
              }}
              variant='ghost'
              size='icon'
            />
            <FavoriteButton textileId={textile.id} />
          </div>

          <Link href={'/textiles/' + textile.id}>
            <Card className='overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full'>
              <div className='relative h-48 bg-muted'>
                {textile.image_url ? (
                  <Image
                    src={textile.image_url}
                    alt={textile.name}
                    fill
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    className='object-cover'
                  />
                ) : (
                  <div className='flex items-center justify-center h-full text-muted-foreground'>
                    Pas d&apos;image
                  </div>
                )}
              </div>

              <CardContent className='p-4 space-y-3'>
                <h3 className='font-medium line-clamp-2 min-h-[3rem]'>
                  {textile.name}
                </h3>

                <div className='flex flex-wrap gap-2'>
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
                </div>

                <div className='space-y-1 text-sm text-muted-foreground'>
                  <div className='flex justify-between'>
                    <span>Quantité</span>
                    <span className='font-medium text-foreground'>
                      {textile.quantity_value}
                      {textile.quantity_unit}
                    </span>
                  </div>
                  {textile.price_value && (
                    <div className='flex justify-between'>
                      <span>Prix</span>
                      <span className='font-medium text-foreground'>
                        {textile.price_value.toFixed(2)} {textile.price_currency}/
                        {textile.quantity_unit}
                      </span>
                    </div>
                  )}
                </div>

                <div className='pt-2 border-t text-xs text-muted-foreground'>
                  Source: {textile.source_platform}
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      ))}
    </div>
  );
}
