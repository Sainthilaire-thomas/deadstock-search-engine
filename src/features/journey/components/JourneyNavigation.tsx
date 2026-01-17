/**
 * JourneyNavigation Component
 *
 * Navigation pour la vue Journey d'un Board
 * Affiche les 3 phases avec compteurs d'éléments
 * Note: Le header (titre board, retour) est maintenant dans SharedBoardHeader
 */

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBoard } from "@/features/boards/context/BoardContext";
import { JOURNEY_PHASES, ELEMENT_TYPE_CONFIGS } from "../config/steps";
import type { ElementType } from "@/features/boards/domain/types";
import type { PhaseId } from "../config/steps";

interface ElementCount {
  type: ElementType;
  count: number;
}

interface PhaseCount {
  phaseId: PhaseId;
  total: number;
  byType: ElementCount[];
}

export function JourneyNavigation() {
  const params = useParams();
  const searchParams = useSearchParams();
  const boardId = params.boardId as string;
  const selectedType = searchParams.get("type");

  const { elements, zones } = useBoard();

  // Compter les éléments par type et par phase
  const phaseCounts = useMemo((): PhaseCount[] => {
    return JOURNEY_PHASES.map((phase) => {
      const byType: ElementCount[] = phase.elementTypes.map((etConfig) => ({
        type: etConfig.type,
        count: elements.filter((el) => el.elementType === etConfig.type).length,
      }));

      return {
        phaseId: phase.id,
        total: byType.reduce((sum, item) => sum + item.count, 0),
        byType,
      };
    });
  }, [elements]);

  // Compter les zones cristallisées pour la phase Exécution
  const crystallizedZonesCount = useMemo(() => {
    return zones.filter((z) => z.crystallizedAt !== null).length;
  }, [zones]);

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      {/* Phases - navigation directe sans header */}
      <nav className="flex-1 overflow-y-auto p-2">
        {JOURNEY_PHASES.map((phase) => {
          const phaseCount = phaseCounts.find((pc) => pc.phaseId === phase.id);
          const PhaseIcon = phase.icon;

          return (
            <div key={phase.id} className="mb-4">
              {/* Phase Header */}
              <div className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-foreground">
                <PhaseIcon className="h-4 w-4 text-muted-foreground" />
                <span>{phase.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {phaseCount?.total || 0}
                </span>
              </div>

              {/* Element Types */}
              <div className="space-y-0.5">
                {phase.elementTypes.map((etConfig) => {
                  const count = phaseCount?.byType.find(
                    (bt) => bt.type === etConfig.type
                  )?.count || 0;
                  const isSelected = selectedType === etConfig.type;
                  const TypeIcon = etConfig.icon;

                  return (
                    <Link
                      key={etConfig.type}
                      href={`/boards/${boardId}/journey?type=${etConfig.type}`}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        count === 0 && "opacity-50"
                      )}
                    >
                      <TypeIcon className="h-4 w-4" />
                      <span className="flex-1">{etConfig.labelPlural}</span>
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          isSelected
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        )}
                      >
                        {count}
                      </span>
                      {isSelected && (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Link>
                  );
                })}

                {/* Zones cristallisées dans Exécution */}
                {phase.id === "execution" && (
                  <Link
                    href={`/boards/${boardId}/journey?type=zones`}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                      selectedType === "zones"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      crystallizedZonesCount === 0 && "opacity-50"
                    )}
                  >
                    <span className="text-base">⚡</span>
                    <span className="flex-1">Projets</span>
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        selectedType === "zones"
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      )}
                    >
                      {crystallizedZonesCount}
                    </span>
                    {selectedType === "zones" && (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer - Stats */}
      <div className="border-t border-border p-4">
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Total éléments</span>
            <span className="font-medium">{elements.length}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Zones</span>
            <span className="font-medium">{zones.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
