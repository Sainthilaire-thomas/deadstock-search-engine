/**
 * SidebarStep Component
 * 
 * Représente une étape individuelle dans la sidebar du parcours designer
 */

"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SidebarStepProps, StepStatus } from "../domain/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Styles selon le statut de l'étape
 */
const STATUS_STYLES: Record<StepStatus, string> = {
  completed: "bg-primary text-primary-foreground hover:bg-primary/90",
  current: "bg-accent text-accent-foreground border-2 border-primary",
  upcoming: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  locked: "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
};

export function SidebarStep({ step, status, isCollapsed, onClick }: SidebarStepProps) {
  const isDisabled = status === "locked";
  const isClickable = !isDisabled && step.availableInMVP;
  const IconComponent = step.icon;

  const content = (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
        STATUS_STYLES[status],
        isClickable && "cursor-pointer",
        isCollapsed ? "justify-center" : "justify-start"
      )}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Indicateur ordre (petit badge) */}
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          status === "completed" && "bg-primary-foreground text-primary",
          status === "current" && "bg-primary text-primary-foreground",
          status === "upcoming" && "bg-muted text-muted-foreground",
          status === "locked" && "bg-background text-muted-foreground"
        )}
      >
        {status === "locked" ? (
          <Lock className="h-3 w-3" />
        ) : (
          step.order
        )}
      </div>

      {/* Icône de l'étape (toujours l'icône originale) */}
      <div className="flex shrink-0 items-center justify-center">
        <IconComponent className="h-5 w-5" />
      </div>

      {/* Titre (visible seulement si expanded) */}
      {!isCollapsed && (
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-medium leading-none">{step.title}</span>
          {!step.availableInMVP && (
            <span className="mt-1 text-xs opacity-60">Bientôt</span>
          )}
        </div>
      )}

      {/* Indicateur current (barre latérale) */}
      {status === "current" && (
        <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}
    </div>
  );

  // Wrapper avec tooltip si collapsed
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            {isClickable ? (
              <Link href={step.path} className="block">
                {content}
              </Link>
            ) : (
              <div>{content}</div>
            )}
          </TooltipTrigger>
          <TooltipContent side="right" className="flex flex-col gap-1">
            <span className="font-semibold">{step.title}</span>
            <span className="text-xs text-muted-foreground">{step.description}</span>
            {!step.availableInMVP && (
              <span className="text-xs italic text-muted-foreground">Disponible prochainement</span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Version expanded sans tooltip
  if (isClickable) {
    return (
      <Link href={step.path} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
