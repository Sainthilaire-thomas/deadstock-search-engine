'use client';

import { usePathname } from 'next/navigation';
import { SharedBoardHeader } from './SharedBoardHeader';

interface BoardLayoutClientProps {
  children: React.ReactNode;
}

export function BoardLayoutClient({ children }: BoardLayoutClientProps) {
  const pathname = usePathname();
  const currentView = pathname.includes('/journey') ? 'journey' : 'board';

  return (
    <div className="flex flex-col h-screen">
      <SharedBoardHeader currentView={currentView} />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
