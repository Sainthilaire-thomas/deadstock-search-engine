/**
 * Sidebar Component
 * 
 * Navigation principale du parcours designer en 9 étapes
 * Collapsible : 240px → 56px
 */

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarStep } from "./SidebarStep";
import { DESIGNER_JOURNEY_STEPS, getStepByPath } from "../config/steps";
import type { SidebarProps, StepStatus } from "../domain/types";

/**
 * Clé localStorage pour persister l'état collapsed
 */
const SIDEBAR_COLLAPSED_KEY = "deadstock-sidebar-collapsed";

/**
 * Déterminer le statut d'une étape
 */
function getStepStatus(stepId: string, currentPath: string): StepStatus {
  const step = DESIGNER_JOURNEY_STEPS.find((s) => s.id === stepId);
  if (!step) return "upcoming";

  const currentStep = getStepByPath(currentPath);
  
  // Étape non disponible dans MVP
  if (!step.availableInMVP) {
    return "locked";
  }

  // Étape courante
  if (currentStep?.id === step.id) {
    return "current";
  }

  // Pour MVP : considérer comme "upcoming" les étapes après la courante
  // (Logique simple pour MVP, sera enrichie avec projet context plus tard)
  if (currentStep && step.order < currentStep.order) {
    return "completed";
  }

  return "upcoming";
}

export function Sidebar({ currentStep, className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Restaurer l'état depuis localStorage au mount
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored !== null) {
      setIsCollapsed(stored === "true");
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
      return newValue;
    });
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-200 ease-in-out",
        isCollapsed ? "w-14" : "w-60",
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header avec logo et toggle */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-border px-3",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">DS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-none">Deadstock</span>
                <span className="text-xs text-muted-foreground">Designer</span>
              </div>
            </div>
          )}

          <button
            onClick={toggleCollapse}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent transition-colors",
              isCollapsed && "mx-auto"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Titre section (si expanded) */}
        {!isCollapsed && (
          <div className="px-3 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Parcours Designer
            </h2>
          </div>
        )}

        {/* Liste des étapes */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
          {DESIGNER_JOURNEY_STEPS.map((step) => {
            const status = getStepStatus(step.id, pathname);
            
            return (
              <SidebarStep
                key={step.id}
                step={step}
                status={status}
                isCollapsed={isCollapsed}
              />
            );
          })}
        </nav>

        {/* Footer avec phase indicator (si expanded) */}
        {!isCollapsed && (
          <div className="border-t border-border px-3 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex h-2 w-2 rounded-full bg-primary" />
              <span>MVP Phase 1</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
