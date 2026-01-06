// src/features/boards/components/CrystallizationDialog.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { crystallizeZoneAction } from '../actions/crystallizationActions';
import { useBoard } from '../context/BoardContext';
import type { BoardZone } from '../domain/types';
import type { ProjectType } from '@/features/journey/domain/types';

interface CrystallizationDialogProps {
  zone: BoardZone;
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectId: string) => void;
}

export function CrystallizationDialog({
  zone,
  boardId,
  isOpen,
  onClose,
  onSuccess,
}: CrystallizationDialogProps) {
  const router = useRouter();
   const { crystallizeZone } = useBoard();
  const [projectName, setProjectName] = useState(zone.name);
  const [projectType, setProjectType] = useState<ProjectType>('single_piece');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      toast.error('Le nom du projet est requis');
      return;
    }

    setIsSubmitting(true);

    const result = await crystallizeZoneAction({
      zoneId: zone.id,
      boardId,
      projectName: projectName.trim(),
      projectType,
    });

    setIsSubmitting(false);

    if (result.success && result.data) {
      toast.success('Projet créé avec succès !');
      crystallizeZone(zone.id, result.data.projectId);
      onSuccess(result.data.projectId);
      onClose();
    } else {
      toast.error(result.error || 'Erreur lors de la création');
    }
  };

  const handleGoToProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      toast.error('Le nom du projet est requis');
      return;
    }

    setIsSubmitting(true);

    const result = await crystallizeZoneAction({
      zoneId: zone.id,
      boardId,
      projectName: projectName.trim(),
      projectType,
    });

    setIsSubmitting(false);

    if (result.success && result.data) {
      toast.success('Projet créé avec succès !');
      crystallizeZone(zone.id, result.data.projectId);
      router.push(`/journey/${result.data.projectId}/idea`);
    } else {
      toast.error(result.error || 'Erreur lors de la création');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Cristalliser la zone</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Zone info */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              Zone sélectionnée : <span className="font-medium text-foreground">{zone.name}</span>
            </p>
          </div>

          {/* Project name */}
          <div className="space-y-2">
            <label htmlFor="projectName" className="text-sm font-medium">
              Nom du projet *
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ex: Veste Lin Été"
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Project type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type de projet</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProjectType('single_piece')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  projectType === 'single_piece'
                    ? 'border-primary bg-primary/10'
                    : 'border-input hover:border-primary/50'
                }`}
              >
                <span className="text-lg">👗</span>
                <p className="text-sm font-medium mt-1">Pièce unique</p>
                <p className="text-xs text-muted-foreground">1 vêtement</p>
              </button>
              <button
                type="button"
                onClick={() => setProjectType('collection')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  projectType === 'collection'
                    ? 'border-primary bg-primary/10'
                    : 'border-input hover:border-primary/50'
                }`}
              >
                <span className="text-lg">👗👔</span>
                <p className="text-sm font-medium mt-1">Collection</p>
                <p className="text-xs text-muted-foreground">Plusieurs pièces</p>
              </button>
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground">
            La zone sera marquée comme cristallisée et restera visible sur le board.
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-input rounded-lg hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !projectName.trim()}
              className="flex-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Création...' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
