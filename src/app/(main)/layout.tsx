// src/app/(main)/layout.tsx

'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { MobileJourneyNav } from '@/features/journey/components/MobileJourneyNav';
import { ImmersiveModeProvider, useImmersiveMode } from '@/features/boards/context/ImmersiveModeContext';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { FavoritesProvider } from '@/features/favorites/context/FavoritesContext';
import { MainHeader } from '@/features/navigation/components/MainHeader';

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { isImmersive, exitImmersiveMode } = useImmersiveMode();
  const pathname = usePathname();

  // Détecter si on est sur une page board spécifique (pas la liste)
  const isOnBoardPage = pathname?.match(/^\/boards\/[^/]+/) !== null;
  const isOnBoardsList = pathname === '/boards';

  // Auto-exit du mode immersif quand on quitte un board
  useEffect(() => {
    if (!isOnBoardPage && isImmersive) {
      exitImmersiveMode();
    }
  }, [isOnBoardPage, isImmersive, exitImmersiveMode]);

  // Le mode immersif n'est actif QUE sur les pages board individuelles
  const showImmersive = isImmersive && isOnBoardPage && !isOnBoardsList;

  return (
    <div className="min-h-screen bg-background">
      {/* Header global */}
      <MainHeader />

      {/* Main content */}
      <main className="pb-16 md:pb-0">{children}</main>

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
      <FavoritesProvider>
        <ImmersiveModeProvider>
          <MainLayoutContent>{children}</MainLayoutContent>
        </ImmersiveModeProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
