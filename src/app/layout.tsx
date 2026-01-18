// src/app/layout.tsx
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { FavoritesProvider } from '@/features/favorites/context/FavoritesContext';
import { getAuthUser } from '@/lib/auth/getAuthUser';
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
  // Charger la locale et les messages
  const locale = await getLocale();
  const messages = await getMessages();

  // Charger les favoris initiaux côté serveur
  let initialFavoriteIds: string[] = [];
  try {
    const user = await getAuthUser();
    if (user) {
      const favorites = await getFavoritesBySession(user.id);
      initialFavoriteIds = favorites.map(f => f.textile_id);
    }
  } catch (error) {
    console.error('Error loading initial favorites:', error);
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
