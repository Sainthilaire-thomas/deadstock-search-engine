// src/app/(auth)/layout.tsx
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-zinc-200/70 bg-zinc-50/80 backdrop-blur dark:border-white/10 dark:bg-black/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950">
              <span className="text-sm font-semibold">DS</span>
            </div>
            <span className="hidden text-sm font-semibold sm:inline">Deadstock Search Engine</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link href="/search" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
              Voir la démo
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl place-items-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
