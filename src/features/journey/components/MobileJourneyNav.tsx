"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getMVPSteps } from "../config/steps";
import type { MobileJourneyNavProps } from "../domain/types";

export function MobileJourneyNav({ className }: MobileJourneyNavProps) {
  const pathname = usePathname();
  const mvpSteps = getMVPSteps();

  // Afficher seulement les 5 étapes principales pour mobile
  // (Idée, Calcul, Sourcing, Validation, Favoris)
  const mobileSteps = mvpSteps.filter((step) =>
    ["idea", "calculation", "sourcing", "validation", "purchase"].includes(step.id)
  );

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card md:hidden",
        className
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {mobileSteps.map((step) => {
          const isActive = pathname.startsWith(step.path);
          const Icon = step.icon;

          return (
            <Link
              key={step.id}
              href={step.path}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{step.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
