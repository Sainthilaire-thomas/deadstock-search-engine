// src/app/(main)/layout.tsx

import { Sidebar } from '@/features/journey/components/Sidebar';
import { MobileJourneyNav } from '@/features/journey/components/MobileJourneyNav';
import { FavoritesCountBadge } from '@/features/favorites/components/FavoritesCountBadge';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import Link from 'next/link';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-background'>
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Main Content avec padding pour la sidebar */}
      <div className='md:pl-60'>
        {/* Header */}
        <header className='sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
          <div className='container flex h-16 items-center justify-between'>
            <div className='flex items-center gap-8'>
              <Link href="/" className='font-bold text-xl'>Deadstock</Link>
              <nav className='hidden md:flex items-center gap-4'>
                <Link
                  href="/admin"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Admin
                </Link>
              </nav>
            </div>
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
  );
}
