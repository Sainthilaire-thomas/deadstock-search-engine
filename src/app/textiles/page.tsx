// src/app/textiles/page.tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'deadstock' }
});

export default async function TextilesPage() {
  const { data: textiles, error } = await supabase
    .from('textiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Deadstock Textiles
          </h1>
          <p className="text-gray-600">
            {textiles?.length || 0} textiles from My Little Coupon
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {textiles?.map((textile: any) => (
            <div
              key={textile.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {textile.image_url && (
                <div className="aspect-square bg-gray-100 relative">
                  <img
                    src={textile.image_url}
                    alt={textile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {textile.name}
                </h3>

                <div className="space-y-1 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Material:</span>
                    <span className={`font-medium ${
                      textile.material_type === 'unknown' 
                        ? 'text-red-500' 
                        : 'text-green-600'
                    }`}>
                      {textile.material_type || 'unknown'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Color:</span>
                    <span className={`font-medium ${
                      !textile.color 
                        ? 'text-red-500' 
                        : 'text-blue-600'
                    }`}>
                      {textile.color || 'unknown'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-medium text-gray-700">
                      {textile.quantity_value} {textile.quantity_unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xl font-bold text-gray-900">
                    {textile.price_value.toFixed(2)}€
                  </span>
                  
                  <a  href={textile.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Source
                  </a>
                </div>

                <div className="mt-2">
                  {textile.available ? (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      Available
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Data Quality Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Total Textiles</p>
              <p className="text-2xl font-bold text-gray-900">
                {textiles?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Materials Detected</p>
              <p className="text-2xl font-bold text-green-600">
                {textiles?.filter(t => t.material_type && t.material_type !== 'unknown').length || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Colors Detected</p>
              <p className="text-2xl font-bold text-blue-600">
                {textiles?.filter(t => t.color).length || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {textiles?.filter(t => t.available).length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
