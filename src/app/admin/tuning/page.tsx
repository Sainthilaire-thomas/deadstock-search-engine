import { getUnknowns } from '@/features/tuning/application/getUnknowns';
import { UnknownsList } from './components/UnknownsList';

export default async function TuningPage() {
  const { unknowns, total } = await getUnknowns({
    status: 'pending'
  });

  const unknownsData = unknowns.map(u => ({
    id: u.id,
    term: u.term,
    category: u.category.value,
    occurrences: u.occurrences,
    contexts: u.contexts,
    status: u.status
  }));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        🎯 Tuning Dashboard
      </h1>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
          📊 {total} unknown terms to review
        </p>
      </div>

      <div className="mb-8 p-5 bg-amber-50 dark:bg-amber-900/30 rounded-lg border-2 border-amber-200 dark:border-amber-700">
        <h2 className="font-bold text-lg mb-3 text-amber-900 dark:text-amber-100">💡 How to review</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-amber-800 dark:text-amber-200">
          <li><strong>Read the context</strong> - Identify the color/material in the French text</li>
          <li><strong>Type the English translation</strong> in the input field below</li>
          <li>Click <span className="text-green-600 dark:text-green-400 font-semibold">✓ Approve</span> to save</li>
        </ol>

        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-amber-300 dark:border-amber-600">
          <p className="text-xs font-semibold mb-2 text-amber-900 dark:text-amber-100">💡 Examples:</p>
          <div className="space-y-1 text-xs font-mono text-amber-800 dark:text-amber-200">
            <p>Context: "CRÊPE FLUIDE <span className="bg-yellow-200 dark:bg-yellow-700 dark:text-yellow-100">CIEL</span>" → Type: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">sky blue</code></p>
            <p>Context: "100% SOIE <span className="bg-yellow-200 dark:bg-yellow-700 dark:text-yellow-100">Rising Red</span>" → Type: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">red</code></p>
            <p>Context: "CABAN <span className="bg-yellow-200 dark:bg-yellow-700 dark:text-yellow-100">LILAS</span> CLAIR" → Type: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">lilac</code></p>
          </div>
        </div>
      </div>

      {unknownsData.length === 0 ? (
        <div className="p-12 text-center bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-lg font-semibold text-green-800 dark:text-green-200">No unknown terms!</p>
          <p className="text-sm text-green-600 dark:text-green-400">Quality is perfect.</p>
        </div>
      ) : (
        <UnknownsList unknowns={unknownsData} />
      )}
    </div>
  );
}
