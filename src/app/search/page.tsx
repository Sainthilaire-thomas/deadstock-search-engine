import { searchTextiles } from '@/features/search/application/searchTextiles';
import { SearchInterface } from '@/components/search/SearchInterface';

export default async function SearchPage() {
  // Initial load: fetch all textiles and available filters
  const initialData = await searchTextiles();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Recherche de Textiles</h1>
        <p className="text-muted-foreground">
          Trouvez le textile parfait parmi {initialData.total} produits deadstock
        </p>
      </div>
      
      <SearchInterface initialData={initialData} />
    </div>
  );
}
