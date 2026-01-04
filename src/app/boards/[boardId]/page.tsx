// src/app/boards/[boardId]/page.tsx

import { BoardHeader } from '@/features/boards/components/BoardHeader';
import { BoardCanvas } from '@/features/boards/components/BoardCanvas';
import { BoardToolPanel } from '@/features/boards/components/BoardToolPanel';

export default function BoardPage() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <BoardHeader />

      {/* Canvas Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Canvas */}
        <div className="flex-1 relative bg-muted/30">
          <BoardCanvas />
        </div>

        {/* Right Panel - Tools */}
        <BoardToolPanel />
      </div>
    </div>
  );
}
