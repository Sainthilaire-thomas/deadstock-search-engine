// src/app/boards/[boardId]/layout.tsx

import { notFound } from 'next/navigation';
import { getBoardAction } from '@/features/boards/actions/boardActions';
import { BoardProvider } from '@/features/boards/context/BoardContext';

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
      {children}
    </BoardProvider>
  );
}
