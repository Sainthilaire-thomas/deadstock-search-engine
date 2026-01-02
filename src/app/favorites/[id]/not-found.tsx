import Link from 'next/link';
import { AlertCircle, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FavoriteNotFound() {
  return (
    <div className='container mx-auto py-16 max-w-2xl'>
      <div className='text-center space-y-6'>
        {/* Icon */}
        <div className='flex justify-center'>
          <div className='rounded-full bg-muted p-6'>
            <AlertCircle className='h-16 w-16 text-muted-foreground' />
          </div>
        </div>

        {/* Titre */}
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold'>Favori introuvable</h1>
          <p className='text-muted-foreground text-lg'>
            Ce textile n&apos;est pas dans vos favoris ou n&apos;existe plus.
          </p>
        </div>

        {/* Suggestions */}
        <div className='bg-muted/50 rounded-lg p-6 space-y-4 text-left'>
          <p className='text-sm font-medium'>Que s&apos;est-il passé ?</p>
          <ul className='space-y-2 text-sm text-muted-foreground'>
            <li>• Ce textile a peut-être été retiré de vos favoris</li>
            <li>• Le produit n&apos;existe plus sur la plateforme source</li>
            <li>• Le lien est incorrect ou obsolète</li>
          </ul>
        </div>

        {/* Actions */}
        <div className='flex flex-col sm:flex-row gap-3 justify-center pt-4'>
          <Button asChild variant='default' size='lg' className='gap-2'>
            <Link href='/favorites'>
              <ArrowLeft className='h-4 w-4' />
              Retour aux favoris
            </Link>
          </Button>
          
          <Button asChild variant='outline' size='lg' className='gap-2'>
            <Link href='/search'>
              <Search className='h-4 w-4' />
              Nouvelle recherche
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
