// src/app/(main)/layout.tsx

'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/features/journey/components/Sidebar';
import { MobileJourneyNav } from '@/features/journey/components/MobileJourneyNav';
import { FavoritesCountBadge } from '@/features/favorites/components/FavoritesCountBadge';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ImmersiveModeProvider, useImmersiveMode } from '@/features/boards/context/ImmersiveModeContext';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { UserMenu } from '@/features/auth/components/UserMenu';
import Link from 'next/link';


function MainLayoutContent({ children }: { children: React.ReactNode }) {
  
  const { isImmersive, exitImmersiveMode } = useImmersiveMode();
  const pathname = usePathname();

  // Détecter si on est sur une page board spécifique (pas la liste)
  const isOnBoardPage = pathname?.match(/^\/boards\/[^/]+$/) !== null;

  // Auto-exit du mode immersif quand on quitte un board
  useEffect(() => {
    if (!isOnBoardPage && isImmersive) {
      exitImmersiveMode();
    }
  }, [isOnBoardPage, isImmersive, exitImmersiveMode]);

  // Le mode immersif n'est actif QUE sur les pages board individuelles
  const showImmersive = isImmersive && isOnBoardPage;

  return (
    <div className="min-h-screen bg-background">
       {/* Main Content */}
      <div>
        {/* Header - Simplifié en mode immersif */}
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
            <div className="flex items-center gap-8">
              <Link href="/" className={`font-bold transition-all ${showImmersive ? 'text-lg' : 'text-xl'}`}>
                Deadstock
              </Link>
              {!showImmersive && (
                <nav className="hidden md:flex items-center gap-4">
                  <Link
                    href="/admin"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Admin
                  </Link>
                </nav>
              )}
            </div>
            <div className="flex items-center gap-2">
              <FavoritesCountBadge />
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="pb-16 md:pb-0">{children}</main>
      </div>

      {/* Mobile Bottom Navigation - Masquée en mode immersif */}
      {!showImmersive && <MobileJourneyNav />}
    </div>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ImmersiveModeProvider>
        <MainLayoutContent>{children}</MainLayoutContent>
      </ImmersiveModeProvider>
    </AuthProvider>
  );
}
