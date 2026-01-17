'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LayoutGrid, LayoutList, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JOURNEY_PHASES, ELEMENT_TYPE_CONFIGS } from '@/features/journey/config/steps';
import type { PhaseId } from '@/features/journey/config/steps';

interface ViewToggleProps {
  currentView: 'board' | 'journey';
  boardId: string;
  phaseCounts: {
    mood: number;
    conception: number;
    execution: number;
  };
  elementCountsByType?: Record<string, number>;
}

export function ViewToggle({ currentView, boardId, phaseCounts, elementCountsByType = {} }: ViewToggleProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredPhase, setHoveredPhase] = useState<PhaseId | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setHoveredPhase(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalJourneyCount = phaseCounts.mood + phaseCounts.conception + phaseCounts.execution;

  return (
    <div className="flex items-center rounded-lg border bg-muted p-1">
      {/* Board button */}
      <Link
        href={`/boards/${boardId}`}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          currentView === 'board'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span>Board</span>
      </Link>

      {/* Journey button - avec dropdown seulement en vue Board */}
      {currentView === 'board' ? (
        // Vue Board: dropdown complet avec sous-menus
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              'text-muted-foreground hover:text-foreground'
            )}
          >
            <LayoutList className="h-4 w-4" />
            <span>Journey</span>
            {totalJourneyCount > 0 && (
              <span className="text-xs text-muted-foreground">({totalJourneyCount})</span>
            )}
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isDropdownOpen && "rotate-180"
            )} />
          </button>

          {/* Dropdown menu avec sous-menus */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-52 rounded-lg border bg-popover shadow-lg z-50 overflow-visible">
              <div className="py-1">
                {JOURNEY_PHASES.map((phase) => {
                  const count = phaseCounts[phase.id];
                  const hasSubItems = phase.elementTypes.length > 0 || phase.id === 'execution';
                  
                  return (
                    <div
                      key={phase.id}
                      className="relative"
                      onMouseEnter={() => setHoveredPhase(phase.id)}
                      onMouseLeave={() => setHoveredPhase(null)}
                    >
                      {/* Phase item */}
                      <Link
                        href={`/boards/${boardId}/journey?phase=${phase.id}`}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setHoveredPhase(null);
                        }}
                        className="flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span>{phase.emoji}</span>
                          <span>{phase.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={cn(
                            "text-xs tabular-nums",
                            count === 0 ? "text-muted-foreground" : "text-foreground font-medium"
                          )}>
                            {count}
                          </span>
                          {hasSubItems && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      </Link>

                      {/* Sous-menu des types d'éléments */}
                      {hoveredPhase === phase.id && hasSubItems && (
                        <div className="absolute left-full top-0 ml-1 w-44 rounded-lg border bg-popover shadow-lg z-50">
                          <div className="py-1">
                            {phase.elementTypes.map((etConfig) => {
                              const typeCount = elementCountsByType[etConfig.type] || 0;
                              return (
                                <Link
                                  key={etConfig.type}
                                  href={`/boards/${boardId}/journey?type=${etConfig.type}`}
                                  onClick={() => {
                                    setIsDropdownOpen(false);
                                    setHoveredPhase(null);
                                  }}
                                  className={cn(
                                    "flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors",
                                    typeCount === 0 && "opacity-50"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{etConfig.emoji}</span>
                                    <span>{etConfig.labelPlural}</span>
                                  </div>
                                  <span className="text-xs tabular-nums text-muted-foreground">
                                    {typeCount}
                                  </span>
                                </Link>
                              );
                            })}
                            
                            {/* Projets (zones cristallisées) pour Exécution */}
                            {phase.id === 'execution' && (
                              <Link
                                href={`/boards/${boardId}/journey?type=zones`}
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  setHoveredPhase(null);
                                }}
                                className="flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <span>⚡</span>
                                  <span>Projets</span>
                                </div>
                                <span className="text-xs tabular-nums text-muted-foreground">
                                  {elementCountsByType['zones'] || 0}
                                </span>
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Vue Journey: simple bouton actif sans dropdown
        <Link
          href={`/boards/${boardId}/journey`}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            'bg-background text-foreground shadow-sm'
          )}
        >
          <LayoutList className="h-4 w-4" />
          <span>Journey</span>
        </Link>
      )}
    </div>
  );
}
