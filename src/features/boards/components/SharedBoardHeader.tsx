'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Share, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBoard } from '../context/BoardContext';
import { ViewToggle } from './ViewToggle';
import { JOURNEY_PHASES } from '@/features/journey/config/steps';
import type { PhaseId } from '@/features/journey/config/steps';

interface SharedBoardHeaderProps {
  currentView: 'board' | 'journey';
}

export function SharedBoardHeader({ currentView }: SharedBoardHeaderProps) {
  const params = useParams();
  const boardId = params.boardId as string;
  const { board, elements, zones, updateBoardName } = useBoard();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(board?.name || '');

  const displayName = board?.name || 'Sans titre';

  // Calculer les compteurs par phase
  const phaseCounts = useMemo(() => {
    const counts: Record<PhaseId, number> = { mood: 0, conception: 0, execution: 0 };
    
    JOURNEY_PHASES.forEach((phase) => {
      const phaseTypes = phase.elementTypes.map(et => et.type);
      counts[phase.id] = elements.filter(el => 
        phaseTypes.includes(el.elementType)
      ).length;
    });
    
    // Ajouter les zones cristallisées à execution
    const crystallizedZonesCount = zones.filter(z => z.crystallizedAt !== null).length;
    counts.execution += crystallizedZonesCount;
    
    return counts;
  }, [elements, zones]);

  // Calculer les compteurs par type d'élément
  const elementCountsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Compter chaque type d'élément
    elements.forEach(el => {
      counts[el.elementType] = (counts[el.elementType] || 0) + 1;
    });
    
    // Ajouter le compteur des zones cristallisées
    counts['zones'] = zones.filter(z => z.crystallizedAt !== null).length;
    
    return counts;
  }, [elements, zones]);

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
    if (e.key === 'Enter') handleSaveName();
    else if (e.key === 'Escape') handleCancel();
  };

  return (
    <header className="border-b bg-background px-4 py-3 flex items-center justify-between shrink-0">
      {/* Left section */}
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

      {/* Right section */}
      <div className="flex items-center gap-3">
        <ViewToggle 
          currentView={currentView} 
          boardId={boardId} 
          phaseCounts={phaseCounts}
          elementCountsByType={elementCountsByType}
        />
        <Button variant="outline" size="sm" disabled>
          <Share className="w-4 h-4 mr-2" />
          Partager
        </Button>
      </div>
    </header>
  );
}
