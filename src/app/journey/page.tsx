// src/app/journey/new/page.tsx
// Page de création d'un nouveau projet

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createProjectAction } from '@/features/journey/actions/projectActions';
import { cn } from '@/lib/utils';
import type { ProjectType } from '@/features/journey/domain/types';

const PROJECT_TYPES: { value: ProjectType; label: string; description: string }[] = [
  {
    value: 'single_piece',
    label: 'Pièce unique',
    description: 'Un vêtement ou accessoire individuel',
  },
  {
    value: 'collection',
    label: 'Collection',
    description: 'Plusieurs pièces coordonnées',
  },
  {
    value: 'prototype',
    label: 'Prototype',
    description: 'Test ou échantillon avant production',
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('single_piece');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Le nom du projet est requis');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const project = await createProjectAction({
        name: name.trim(),
        projectType,
        description: description.trim() || undefined,
      });
      
      router.push(`/journey/${project.id}/idea`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/journey"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux projets
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Nouveau projet</h1>
        <p className="text-muted-foreground mt-1">
          Commencez par donner un nom à votre projet
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom du projet */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Nom du projet *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Robe d'été en lin, Collection Automne 2026..."
            className={cn(
              "w-full px-4 py-2.5 rounded-lg",
              "bg-background border border-input",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "transition-colors"
            )}
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        {/* Type de projet */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Type de projet
          </label>
          <div className="grid gap-3">
            {PROJECT_TYPES.map((type) => (
              <label
                key={type.value}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                  projectType === type.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <input
                  type="radio"
                  name="projectType"
                  value={type.value}
                  checked={projectType === type.value}
                  onChange={(e) => setProjectType(e.target.value as ProjectType)}
                  className="mt-1"
                  disabled={isSubmitting}
                />
                <div>
                  <span className="font-medium text-foreground">{type.label}</span>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {type.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Description (optionnel) */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
            Description <span className="text-muted-foreground font-normal">(optionnel)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes, inspirations, contraintes particulières..."
            rows={3}
            className={cn(
              "w-full px-4 py-2.5 rounded-lg resize-none",
              "bg-background border border-input",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "transition-colors"
            )}
            disabled={isSubmitting}
          />
        </div>

        {/* Erreur */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/journey"
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium",
              "text-muted-foreground hover:text-foreground",
              "transition-colors"
            )}
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 transition-colors",
              "font-medium text-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                Continuer
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
