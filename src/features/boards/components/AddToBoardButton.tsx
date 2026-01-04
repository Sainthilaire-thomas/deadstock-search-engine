// src/features/boards/components/AddToBoardButton.tsx

'use client';

import { useState, useEffect } from 'react';
import { Plus, Layout, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { listBoardsAction, createBoardAction } from '../actions/boardActions';
import { addTextileToBoard } from '../actions/elementActions';
import type { Board } from '../domain/types';

interface AddToBoardButtonProps {
  textile: {
    id: string;
    name: string;
    source: string;
    price: number | null;
    imageUrl: string | null;
    availableQuantity: number | null;
    material: string | null;
    color: string | null;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
}

export function AddToBoardButton({ 
  textile, 
  variant = 'outline',
  size = 'sm' 
}: AddToBoardButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [addedTo, setAddedTo] = useState<string[]>([]);

  // Charger les boards quand le popover s'ouvre
  useEffect(() => {
    if (isOpen) {
      loadBoards();
    }
  }, [isOpen]);

  const loadBoards = async () => {
    setIsLoading(true);
    const result = await listBoardsAction();
    if (result.success && result.data) {
      // Filtrer les boards archivés
      setBoards(result.data.filter(b => b.status !== 'archived'));
    }
    setIsLoading(false);
  };

  const handleAddToBoard = async (boardId: string) => {
    setIsAdding(boardId);
    
    const result = await addTextileToBoard(boardId, textile);
    
    if (result.success) {
      setAddedTo(prev => [...prev, boardId]);
      // Fermer après un court délai pour montrer le feedback
      setTimeout(() => {
        setIsOpen(false);
        // Reset après fermeture
        setTimeout(() => setAddedTo([]), 300);
      }, 500);
    }
    
    setIsAdding(null);
  };

  const handleCreateAndAdd = async () => {
    setIsLoading(true);
    
    // Créer un nouveau board
    const createResult = await createBoardAction({ 
      name: `Board - ${textile.name.slice(0, 30)}` 
    });
    
    if (createResult.success && createResult.data) {
      // Ajouter le textile au nouveau board
      await addTextileToBoard(createResult.data.id, textile);
      setAddedTo([createResult.data.id]);
      
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => setAddedTo([]), 300);
      }, 500);
    }
    
    setIsLoading(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
    <PopoverTrigger asChild>
  <Button 
    variant={variant} 
    size={size}
    onClick={(e) => e.stopPropagation()}
  >
    {size === 'icon' ? (
      <Plus className="w-4 h-4" />
    ) : (
      <>
        <Plus className="w-4 h-4 mr-1" />
        Board
      </>
    )}
  </Button>
</PopoverTrigger>
      <PopoverContent 
  className="w-64 p-2" 
  align="end"
  onClick={(e) => e.stopPropagation()}
>
        <div className="space-y-1">
          <p className="text-sm font-medium px-2 py-1.5">Ajouter au board</p>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : boards.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                Aucun board actif
              </p>
              <Button 
                size="sm" 
                onClick={handleCreateAndAdd}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un board
              </Button>
            </div>
          ) : (
            <>
              {/* Liste des boards */}
              <div className="max-h-48 overflow-y-auto">
                {boards.map((board) => {
                  const isAdded = addedTo.includes(board.id);
                  const isCurrentlyAdding = isAdding === board.id;
                  
                  return (
                    <button
                      key={board.id}
                      onClick={() => handleAddToBoard(board.id)}
                      disabled={isCurrentlyAdding || isAdded}
                      className="w-full flex items-center gap-2 px-2 py-2 text-left text-sm rounded hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {isCurrentlyAdding ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isAdded ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Layout className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="truncate flex-1">
                        {board.name || 'Sans titre'}
                      </span>
                      {isAdded && (
                        <span className="text-xs text-green-500">Ajouté</span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Séparateur et bouton créer */}
              <div className="border-t mt-2 pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCreateAndAdd}
                  disabled={isLoading}
                  className="w-full justify-start"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau board
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
