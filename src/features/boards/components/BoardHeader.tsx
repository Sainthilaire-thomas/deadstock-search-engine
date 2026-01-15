// src/features/boards/components/BoardHeader.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share, MoreHorizontal, Check, X,LayoutList } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBoard } from '../context/BoardContext';

export function BoardHeader() {
  const params = useParams();
  const boardId = params.boardId as string;
  const { board, elements, updateBoardName } = useBoard();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(board?.name || '');

  const displayName = board?.name || 'Sans titre';

  const handleSaveName = async () => {
    if (editName.trim()) {
      await updateBoardName(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(board?.name || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <header className="border-b bg-background px-4 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <Link href="/boards">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>

        <div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 w-64"
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={handleSaveName}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <h1
              className="font-medium cursor-pointer hover:text-muted-foreground transition-colors"
              onClick={() => {
                setEditName(board?.name || '');
                setIsEditing(true);
              }}
              title="Cliquer pour modifier"
            >
              {displayName}
            </h1>
          )}
          <p className="text-sm text-muted-foreground">
            {elements.length} élément{elements.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

          <div className="flex items-center gap-2">
        <Link href={`/boards/${boardId}/journey`}>
          <Button variant="outline" size="sm">
            <LayoutList className="w-4 h-4 mr-2" />
            Journey
          </Button>
        </Link>
        <Button variant="outline" size="sm" disabled>
          <Share className="w-4 h-4 mr-2" />
          Partager
        </Button>
      </div>
    </header>
  );
}
