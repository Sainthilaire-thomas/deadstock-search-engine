'use client';

import { useState } from 'react';
import { handleApprove, handleReject } from '../actions';

interface UnknownData {
  id: string;
  term: string;
  category: string;
  occurrences: number;
  contexts: string[];
  status: string;
}

interface Props {
  unknowns: UnknownData[];
}

// Helper pour parser le contexte JSON
function parseContext(context: string) {
  try {
    const parsed = JSON.parse(context);
    return {
      text: parsed.text || context,
      image: parsed.image || null,
      url: parsed.url || null,
      productId: parsed.product_id || null
    };
  } catch {
    // Si ce n'est pas du JSON, retourner le texte brut
    return {
      text: context,
      image: null,
      url: null,
      productId: null
    };
  }
}
// Ajoute après la fonction parseContext (ligne ~35)
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function UnknownsList({ unknowns }: Props) {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const onApprove = async (unknownId: string) => {
    const value = mappings[unknownId];
    if (!value || value.trim() === '') {
      alert('Please enter a translation');
      return;
    }

    setLoading({ ...loading, [unknownId]: true });

    const result = await handleApprove(unknownId, value.trim());

    if (result.success) {
      // Page will reload automatically via revalidatePath
    } else {
      alert(`Error: ${result.error}`);
      setLoading({ ...loading, [unknownId]: false });
    }
  };

  const onReject = async (unknownId: string) => {
    if (!confirm('Are you sure you want to reject this term?')) {
      return;
    }

    setLoading({ ...loading, [unknownId]: true });

    const result = await handleReject(unknownId);

    if (result.success) {
      // Page will reload automatically
    } else {
      alert(`Error: ${result.error}`);
      setLoading({ ...loading, [unknownId]: false });
    }
  };

  return (
    <div className="space-y-6">
      {unknowns.map(unknown => {
        const contextData = parseContext(unknown.contexts[0] || '');

        return (
          <div
            key={unknown.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm"
          >
            {/* Image du produit */}
            {contextData.image && (
              <div className="mb-4">
                <img
                  src={contextData.image}
                  alt="Product"
                  className="w-32 h-32 object-cover rounded border border-gray-200 dark:border-gray-600"
                />
              </div>
            )}

            {/* Context en premier - plus visible */}
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                  📝 Contexte complet :
                </p>
                {contextData.url && (
                  <a
                    href={contextData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    🔗 Voir le produit
                  </a>
                )}
              </div>
              <p className="text-base text-gray-900 dark:text-gray-100 font-mono leading-relaxed">
  {stripHtml(contextData.text).substring(0, 200)}...
</p>
            </div>

            {/* Metadata */}
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded font-medium text-sm">
                {unknown.category}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {unknown.occurrences}× occurrences
              </span>
            </div>

            {/* Input Translation */}
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                  🇬🇧 Traduction anglaise :
                </span>
                <input
                  type="text"
                  placeholder={`Ex: ${unknown.category === 'color' ? 'red, sky blue, lilac' : 'cotton, silk, wool'}...`}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                  value={mappings[unknown.id] || ''}
                  onChange={e => setMappings({
                    ...mappings,
                    [unknown.id]: e.target.value
                  })}
                  disabled={loading[unknown.id]}
                />
              </label>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => onApprove(unknown.id)}
                  disabled={!mappings[unknown.id] || loading[unknown.id]}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors text-lg"
                >
                  {loading[unknown.id] ? '⏳ Processing...' : '✓ Approve'}
                </button>

                <button
                  onClick={() => onReject(unknown.id)}
                  disabled={loading[unknown.id]}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {loading[unknown.id] ? '...' : '✗ Reject'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
