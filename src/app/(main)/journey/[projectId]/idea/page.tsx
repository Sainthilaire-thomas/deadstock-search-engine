// src/app/journey/[projectId]/idea/page.tsx
// Étape 1 : Définir l'idée du projet

'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { useProject } from '@/features/journey/context/ProjectContext';
import { cn } from '@/lib/utils';
import type { ProjectType, ProjectConstraints } from '@/features/journey/domain/types';

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'single_piece', label: 'Pièce unique' },
  { value: 'collection', label: 'Collection' },
  { value: 'prototype', label: 'Prototype' },
];

export default function IdeaPage() {
  const { 
    project, 
    isLoading, 
    isSaving, 
    updateIdea, 
    deleteProject,
    goToStep 
  } = useProject();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form state
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [projectType, setProjectType] = useState<ProjectType>(project?.projectType ?? 'single_piece');
  const [clientName, setClientName] = useState(project?.clientName ?? '');
  const [deadline, setDeadline] = useState(
  project?.deadline 
    ? (typeof project.deadline === 'string' ? project.deadline : project.deadline.toISOString().split('T')[0])
    : ''
);
  const [budgetMin, setBudgetMin] = useState(project?.budgetMin?.toString() ?? '');
  const [budgetMax, setBudgetMax] = useState(project?.budgetMax?.toString() ?? '');
  const [constraints, setConstraints] = useState<ProjectConstraints>(project?.constraints ?? {});

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSaveAndContinue = async () => {
    await updateIdea({
      name,
      description: description || undefined,
      projectType,
      clientName: clientName || undefined,
      deadline: deadline || undefined,
      budgetMin: budgetMin ? parseFloat(budgetMin) : undefined,
      budgetMax: budgetMax ? parseFloat(budgetMax) : undefined,
      constraints,
    });
    goToStep('design');
  };

  const handleDelete = async () => {
    await deleteProject();
  };

  const toggleConstraint = (key: keyof ProjectConstraints) => {
    setConstraints(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
            Étape 1
          </span>
          <span>sur 9</span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Idée du projet</h1>
        <p className="text-muted-foreground mt-1">
          Définissez les bases de votre projet de création
        </p>
      </div>

      {/* Formulaire */}
      <div className="space-y-6">
        {/* Nom */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Nom du projet *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(
              "w-full px-4 py-2.5 rounded-lg",
              "bg-background border border-input",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Type de projet
          </label>
          <div className="flex gap-2">
            {PROJECT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setProjectType(type.value)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  projectType === type.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Décrivez votre projet, vos inspirations..."
            className={cn(
              "w-full px-4 py-2.5 rounded-lg resize-none",
              "bg-background border border-input",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          />
        </div>

        {/* Séparateur */}
        <div className="border-t border-border pt-6">
          <h2 className="text-lg font-medium text-foreground mb-4">
            Informations client
            <span className="text-muted-foreground font-normal text-sm ml-2">(optionnel)</span>
          </h2>
        </div>

        {/* Client */}
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-foreground mb-2">
            Nom du client
          </label>
          <input
            type="text"
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Pour qui créez-vous ?"
            className={cn(
              "w-full px-4 py-2.5 rounded-lg",
              "bg-background border border-input",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          />
        </div>

        {/* Deadline */}
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-foreground mb-2">
            Date limite
          </label>
          <input
            type="date"
            id="deadline"
            value={typeof deadline === 'string' ? deadline : ''}
            onChange={(e) => setDeadline(e.target.value)}
            className={cn(
              "w-full px-4 py-2.5 rounded-lg",
              "bg-background border border-input",
              "text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Budget tissu (€)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              placeholder="Min"
              min="0"
              className={cn(
                "flex-1 px-4 py-2.5 rounded-lg",
                "bg-background border border-input",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            />
            <span className="text-muted-foreground">à</span>
            <input
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="Max"
              min="0"
              className={cn(
                "flex-1 px-4 py-2.5 rounded-lg",
                "bg-background border border-input",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            />
          </div>
        </div>

        {/* Contraintes */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Contraintes du projet
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'deadstockOnly' as const, label: 'Deadstock uniquement' },
              { key: 'organic' as const, label: 'Matières bio' },
              { key: 'localProduction' as const, label: 'Production locale' },
              { key: 'shortDeadline' as const, label: 'Délai court' },
              { key: 'tightBudget' as const, label: 'Budget serré' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                  constraints[key]
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                <input
                  type="checkbox"
                  checked={constraints[key] ?? false}
                  onChange={() => toggleConstraint(key)}
                  className="sr-only"
                />
                <div className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center",
                  constraints[key] ? "bg-primary border-primary" : "border-muted-foreground"
                )}>
                  {constraints[key] && (
                    <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
          
          <button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={isSaving || !name.trim()}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 transition-colors",
              "font-medium text-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                Continuer vers Design
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de confirmation suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-4 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Supprimer ce projet ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Cette action est irréversible. Toutes les données du projet seront perdues.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
