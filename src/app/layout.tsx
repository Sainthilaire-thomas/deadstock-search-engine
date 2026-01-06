// src/app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { FavoritesProvider } from '@/features/favorites/context/FavoritesContext';
import { getOrCreateSessionId } from '@/features/favorites/utils/sessionManager';
import { getFavoritesBySession } from '@/features/favorites/infrastructure/favoritesRepository';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Deadstock Search Engine',
  description: 'Moteur de recherche textile deadstock',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Charger les favoris initiaux côté serveur
  let initialFavoriteIds: string[] = [];
  try {
    const sessionId = await getOrCreateSessionId();
    const favorites = await getFavoritesBySession(sessionId);
    initialFavoriteIds = favorites.map(f => f.textile_id);
  } catch (error) {
    console.error('Error loading initial favorites:', error);
  }

  return (
    <html lang='fr' suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <FavoritesProvider initialFavorites={initialFavoriteIds}>
            {children}
          </FavoritesProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
