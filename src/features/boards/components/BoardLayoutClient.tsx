'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SharedBoardHeader } from './SharedBoardHeader';
import { useBoard } from '@/features/boards/context/BoardContext';
import { useNavigation } from '@/features/navigation/context/NavigationContext';
import type { Board } from '../domain/types';

interface BoardLayoutClientProps {
  children: React.ReactNode;
  ancestors?: Board[];
}

export function BoardLayoutClient({ children, ancestors = [] }: BoardLayoutClientProps) {
  const pathname = usePathname();
  const { board } = useBoard();
  const { setActiveBoard } = useNavigation();
  
  const currentView = pathname.includes('/journey') ? 'journey' : 'board';

  // Enregistrer le board actif pour le bouton "Retour"
  useEffect(() => {
    if (board) {
      setActiveBoard({
        id: board.id,
        name: board.name || 'Sans titre',
        returnPath: pathname,
      });
    }
  }, [board, pathname, setActiveBoard]);

  return (
    <div className="flex flex-col h-screen">
      <SharedBoardHeader currentView={currentView} ancestors={ancestors} />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
