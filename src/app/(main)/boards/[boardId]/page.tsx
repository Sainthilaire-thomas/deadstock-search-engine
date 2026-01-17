// src/app/(main)/boards/[boardId]/page.tsx
import { BoardCanvas } from '@/features/boards/components/BoardCanvas';
import { ContextualSearchProvider } from '@/features/boards/context/ContextualSearchContext';

export default function BoardPage() {
  return (
    <ContextualSearchProvider>
      <BoardCanvas />
    </ContextualSearchProvider>
  );
}
