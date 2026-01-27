// src/app/(main)/boards/[boardId]/layout.tsx
import { notFound } from 'next/navigation';
import { getBoardAction } from '@/features/boards/actions/boardActions';
import { BoardProvider } from '@/features/boards/context/BoardContext';
import { TransformProvider } from '@/features/boards/context/TransformContext';
import { ZoneFocusProvider } from '@/features/boards/context/ZoneFocusContext';
import { BoardLayoutClient } from '@/features/boards/components/BoardLayoutClient';

interface BoardLayoutProps {
  params: Promise<{ boardId: string }>;
  children: React.ReactNode;
}

export default async function BoardLayout({ params, children }: BoardLayoutProps) {
  const { boardId } = await params;
  const result = await getBoardAction(boardId);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <BoardProvider initialBoard={result.data}>
      <TransformProvider boardId={boardId}>
        <ZoneFocusProvider>
          <BoardLayoutClient>
            {children}
          </BoardLayoutClient>
        </ZoneFocusProvider>
      </TransformProvider>
    </BoardProvider>
  );
}
