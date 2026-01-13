// src/app/(main)/boards/[boardId]/page.tsx

import { BoardHeader } from '@/features/boards/components/BoardHeader';
import { BoardCanvas } from '@/features/boards/components/BoardCanvas';
import { ContextualSearchProvider } from '@/features/boards/context/ContextualSearchContext';

export default function BoardPage() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      
      {/* Header */}
      <BoardHeader />
      
      {/* Canvas Area - pleine largeur, BoardToolbar est inclus dans BoardCanvas */}
      <div className="flex-1 overflow-hidden">
        <ContextualSearchProvider>
        <BoardCanvas />
        </ContextualSearchProvider>
      </div>
    </div>
  );
}
