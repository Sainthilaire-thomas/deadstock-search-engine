// src/features/navigation/components/MainHeader.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, LayoutGrid, ArrowLeft } from 'lucide-react';
import { UserMenu } from '@/features/auth/components/UserMenu';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { FavoritesCountBadge } from '@/features/favorites/components/FavoritesCountBadge';
import { useImmersiveMode } from '@/features/boards/context/ImmersiveModeContext';
import { useNavigation } from '@/features/navigation/context/NavigationContext';

export function MainHeader() {
  const pathname = usePathname();
  const { isImmersive } = useImmersiveMode();
  const { activeBoard } = useNavigation();

  // Détecter les pages pour adapter la navigation
  const isOnSearchPage = pathname === '/search';
  const isOnBoardPage = pathname?.match(/^\/boards\/[^/]+/) !== null;
  const isOnBoardsList = pathname === '/boards';

  // Mode immersif : header réduit uniquement sur les pages board individuelles
  const showImmersive = isImmersive && isOnBoardPage && !isOnBoardsList;

  return (
    <header
      className={`
        sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur
        supports-backdrop-filter:bg-background/60
        transition-all duration-300
        ${showImmersive ? 'h-12' : 'h-16'}
      `}
    >
      <div
        className={`
          container flex items-center justify-between
          transition-all duration-300
          ${showImmersive ? 'h-12' : 'h-16'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link 
            href="/home" 
            className={`font-bold transition-all ${showImmersive ? 'text-lg' : 'text-xl'}`}
          >
            Deadstock
          </Link>
        </div>

        {/* Navigation centrale */}
        {!showImmersive && (
          <nav className="hidden md:flex items-center gap-6">
            {/* Retour au projet actif */}
            {activeBoard && !isOnBoardPage && (
              <Link
                href={activeBoard.returnPath}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à "{activeBoard.name}"
              </Link>
            )}

            {/* Lien Recherche */}
            {!isOnSearchPage && (
              <Link
                href="/search"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="w-4 h-4" />
                Chercher des tissus
              </Link>
            )}

            {/* Lien Projets */}
            {!isOnBoardsList && !isOnBoardPage && (
              <Link
                href="/boards"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
                Mes Projets
              </Link>
            )}
          </nav>
        )}

        {/* Actions droite */}
        <div className="flex items-center gap-2">
          {/* Favoris avec badge - lien cliquable */}
          <Link href="/favorites" className="hover:opacity-80 transition-opacity">
            <FavoritesCountBadge />
          </Link>
          
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
