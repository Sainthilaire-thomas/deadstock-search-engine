import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
