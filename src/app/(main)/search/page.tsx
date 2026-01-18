// src/app/(main)/search/page.tsx

import { SearchInterface } from '@/components/search/SearchInterface';
import { searchTextiles } from '@/features/search/application/searchTextiles';

export const metadata = {
  title: 'Rechercher des tissus | Deadstock',
  description: 'Recherchez parmi des centaines de tissus deadstock de plusieurs fournisseurs',
};

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  // Charger les données initiales côté serveur
  const initialData = await searchTextiles({});

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchInterface initialData={initialData} />
    </div>
  );
}
