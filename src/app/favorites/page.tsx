import Link from 'next/link';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { getOrCreateSessionId } from '@/features/favorites/utils/sessionManager';
import { getFavoritesBySessionServer } from '@/features/favorites/infrastructure/favoritesRepositoryServer';
import { FavoritesGrid } from '@/features/favorites/components/FavoritesGrid';

export default async function FavoritesPage() {
  const sessionId = await getOrCreateSessionId();
  const favorites = await getFavoritesBySessionServer(sessionId);

  return (
    <div className='container mx-auto py-8'>
      {/* Header */}
      <div className='mb-8'>
        <Link
          href='/search'
          className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4'
        >
          <ArrowLeft className='h-4 w-4' />
          Retour à la recherche
        </Link>
        
        <h1 className='text-4xl font-bold mb-2'>Validation - Mes Favoris</h1>
        <p className='text-muted-foreground'>
          {favorites.length === 0
            ? 'Aucun favori pour le moment'
            : 'Comparez vos favoris en détail avant de passer commande (' + favorites.length + ')'}
        </p>
      </div>

      {/* Message si vide */}
      {favorites.length === 0 ? (
        <div className='text-center py-12 bg-muted/50 rounded-lg border border-border'>
          <div className='max-w-md mx-auto space-y-6'>
            <div className='text-6xl'>🔍</div>
            <div className='space-y-2'>
              <p className='text-lg font-semibold'>Aucun favori pour le moment</p>
              <p className='text-sm text-muted-foreground'>
                Commencez par ajouter des tissus à vos favoris depuis la recherche
              </p>
            </div>
            
            {/* Guide étape par étape */}
            <div className='bg-background border rounded-lg p-4 text-left space-y-3'>
              <p className='text-sm font-medium flex items-center gap-2'>
                <Lightbulb className='h-4 w-4 text-primary' />
                Comment ajouter des favoris ?
              </p>
              <ol className='text-sm text-muted-foreground space-y-2 pl-6'>
                <li>1. Allez sur la page <strong>Sourcing</strong></li>
                <li>2. Parcourez les textiles disponibles</li>
                <li>3. Cliquez sur <strong>❤️</strong> pour ajouter à vos favoris</li>
                <li>4. Revenez ici pour comparer et valider</li>
              </ol>
            </div>

            <Link
              href='/search'
              className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium'
            >
              Commencer la recherche →
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Astuce quand il y a des favoris */}
          <div className='mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg'>
            <div className='flex gap-3'>
              <span className='text-2xl'>💡</span>
              <div className='space-y-1'>
                <p className='text-sm font-medium'>Prochaines étapes</p>
                <ul className='text-sm text-muted-foreground space-y-1'>
                  <li>• <strong>Cliquez sur un textile</strong> pour voir tous ses détails</li>
                  <li>• <strong>Naviguez entre vos favoris</strong> pour les comparer</li>
                  <li>• <strong>Cliquez sur ❤️</strong> pour retirer un favori de la liste</li>
                  <li>• Quand vous avez choisi, passez à l&apos;étape <strong>Achat</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Grille des favoris */}
          <FavoritesGrid favorites={favorites} />
        </>
      )}
    </div>
  );
}
