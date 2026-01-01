import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Deadstock Search Engine',
  description: 'Moteur de recherche textile deadstock',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                  <Link href="/" className="flex items-center space-x-2">
                    <span className="font-bold text-xl">Deadstock</span>
                  </Link>
                  <nav className="hidden md:flex gap-6">
                    <Link href="/search" className="text-sm font-medium transition-colors hover:text-primary">
                      Recherche
                    </Link>
                    <Link href="/tools/yardage-calculator" className="text-sm font-medium transition-colors hover:text-primary">
                      Calculateur
                    </Link>
                    <Link href="/admin" className="text-sm font-medium transition-colors hover:text-primary">
                      Admin
                    </Link>
                  </nav>
                </div>
                <ThemeToggle />
              </div>
            </header>
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
