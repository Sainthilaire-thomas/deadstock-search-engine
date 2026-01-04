import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Sidebar } from '@/features/journey/components/Sidebar';
import { MobileJourneyNav } from '@/features/journey/components/MobileJourneyNav';
import { FavoritesCountBadge } from '@/features/favorites/components/FavoritesCountBadge';
import { FavoritesProvider } from '@/features/favorites/context/FavoritesContext';
import { getOrCreateSessionId } from '@/features/favorites/utils/sessionManager';
import { getFavoritesBySession } from '@/features/favorites/infrastructure/favoritesRepository';
import { Toaster } from 'sonner';
import Link from 'next/link';

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
            <div className='min-h-screen bg-background'>
              {/* Sidebar Desktop */}
              <Sidebar />

              {/* Main Content avec padding pour la sidebar */}
              <div className='md:pl-60'>
                {/* Header */}
                <header className='sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
                  <div className='container flex h-16 items-center justify-between'>
                    <div className='flex items-center gap-8'>
                      <span className='font-bold text-xl'>Deadstock</span>
                      
                      {/* Navigation Links */}
                      <nav className='hidden md:flex items-center gap-4'>
                        <Link 
                          href="/admin" 
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Admin
                        </Link>
                      </nav>
                    </div>
                    
                    {/* Actions à droite */}
                    <div className='flex items-center gap-2'>
                      <FavoritesCountBadge />
                      <ThemeToggle />
                    </div>
                  </div>
                </header>

                {/* Main content */}
                <main className='pb-16 md:pb-0'>{children}</main>
              </div>

              {/* Mobile Bottom Navigation */}
              <MobileJourneyNav />
            </div>
          </FavoritesProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
