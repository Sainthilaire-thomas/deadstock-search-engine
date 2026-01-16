"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useBoard } from "@/features/boards/context/BoardContext";
import { JourneyNavigation } from "@/features/journey/components/JourneyNavigation";
import { TextileJourneyView } from "@/features/journey/components/views/TextileJourneyView";
import { ELEMENT_TYPE_CONFIGS, JOURNEY_PHASES } from "@/features/journey/config/steps";
import { getElementsInZone } from "@/features/boards/utils/zoneUtils";
import type { ElementType, BoardElement } from "@/features/boards/domain/types";
import type { SearchResult } from "@/features/search/domain/types";
import type { FavoriteWithTextile } from "@/features/favorites/domain/types";

interface JourneyClientWrapperProps {
  initialSearchData: SearchResult;
  initialFavorites: FavoriteWithTextile[];
}

// Composant pour afficher un élément dans la liste (types autres que textile)
function ElementListItem({ element }: { element: BoardElement }) {
  const config = ELEMENT_TYPE_CONFIGS[element.elementType];
  const Icon = config.icon;

  const getTitle = (): string => {
    const data = element.elementData as unknown as Record<string, unknown>;

    switch (element.elementType) {
      case "palette":
        return (data.name as string) || "Palette sans nom";
      case "pattern":
        return (data.name as string) || (data.filename as string) || "Patron";
      case "textile":
        return (data.snapshot as { name?: string })?.name || "Tissu";
      case "calculation":
        return (data.summary as string) || (data.garmentType as string) || "Calcul";
      case "note":
        const content = (data.content as string) || "";
        return content.slice(0, 50) + (content.length > 50 ? "..." : "") || "Note vide";
      case "inspiration":
        return (data.caption as string) || "Image d'inspiration";
      case "pdf":
        return (data.filename as string) || "Document PDF";
      case "silhouette":
        return (data.name as string) || "Silhouette";
      case "video":
        return (data.title as string) || "Vidéo";
      case "link":
        return (data.title as string) || (data.url as string) || "Lien";
      default:
        return "Élément";
    }
  };

  const getSubtitle = (): string | null => {
    const data = element.elementData as unknown as Record<string, unknown>;

    switch (element.elementType) {
      case "palette":
        const colors = data.colors as string[] | undefined;
        return colors ? `${colors.length} couleurs` : null;
      case "pattern":
        return (data.brand as string) || null;
      case "textile":
        const snapshot = data.snapshot as { source?: string } | undefined;
        return snapshot?.source || null;
      case "calculation":
        const yardage = data.yardageByWidth as Record<string, number> | undefined;
        if (yardage) {
          const firstWidth = Object.keys(yardage)[0];
          return firstWidth ? `${yardage[firstWidth]}m (laize ${firstWidth}cm)` : null;
        }
        return null;
      case "video":
        return (data.platform as string) || null;
      case "link":
        return (data.siteName as string) || null;
      default:
        return null;
    }
  };

  const title = getTitle();
  const subtitle = getSubtitle();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      <span className="text-xs text-muted-foreground">{config.emoji}</span>
    </div>
  );
}

// Composant pour les zones cristallisées
function CrystallizedZoneItem({ 
  zone, 
  isSelected,
  onClick 
}: { 
  zone: { id: string; name: string; crystallizedAt: Date | null };
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <div 
      className={`flex items-center gap-3 rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
      }`}
      onClick={onClick}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
        <span className="text-lg">⚡</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{zone.name}</p>
        <p className="text-xs text-muted-foreground">
          Cristallisé le {zone.crystallizedAt?.toLocaleDateString("fr-FR")}
        </p>
      </div>
      {isSelected && (
        <span className="text-xs text-primary font-medium">Sélectionné</span>
      )}
    </div>
  );
}

export function JourneyClientWrapper({ 
  initialSearchData, 
  initialFavorites 
}: JourneyClientWrapperProps) {
  const searchParams = useSearchParams();
  const selectedType = searchParams.get("type");

  const { elements, zones } = useBoard();
const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Filtrer les éléments selon le type sélectionné
  const filteredElements = useMemo(() => {
    if (!selectedType || selectedType === "zones" || selectedType === "textile") {
      return [];
    }
    return elements.filter((el) => el.elementType === selectedType);
  }, [elements, selectedType]);

  // Filtrer les zones cristallisées
  const crystallizedZones = useMemo(() => {
    if (selectedType !== "zones") {
      return [];
    }
    return zones.filter((z) => z.crystallizedAt !== null);
  }, [zones, selectedType]);

  // Éléments de la zone cristallisée sélectionnée
const selectedZone = useMemo(() => {
  if (!selectedZoneId) return null;
  return zones.find(z => z.id === selectedZoneId) || null;
}, [zones, selectedZoneId]);

const zoneElements = useMemo(() => {
  if (!selectedZone) return [];
  return getElementsInZone(elements, selectedZone);
}, [elements, selectedZone]);


  // Obtenir le titre de la section
  const getSectionTitle = (): string => {
    if (!selectedType) {
      return "Sélectionnez un type";
    }
    if (selectedType === "zones") {
      return "Projets cristallisés";
    }
    const config = ELEMENT_TYPE_CONFIGS[selectedType as ElementType];
    return config?.labelPlural || selectedType;
  };

  // Contenu par défaut (aucun type sélectionné)
  const renderDefaultContent = () => {
    const phaseStats = JOURNEY_PHASES.map((phase) => {
      const count = elements.filter((el) =>
        phase.elementTypes.some((et) => et.type === el.elementType)
      ).length;
      return { phase, count };
    });

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Vue Journey
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Sélectionnez un type d'élément dans le menu pour voir la liste détaillée.
        </p>

        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
          {phaseStats.map(({ phase, count }) => (
            <div
              key={phase.id}
              className="rounded-lg border border-border bg-card p-3 text-center"
            >
              <div className="text-2xl mb-1">{phase.emoji}</div>
              <div className="text-lg font-semibold">{count}</div>
              <div className="text-xs text-muted-foreground">{phase.title}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Rendu du contenu principal
  const renderContent = () => {
    // Cas spécial : type=textile → vue avec tabs
    if (selectedType === "textile") {
      return (
        <div className="p-6 h-full">
          <TextileJourneyView 
            initialSearchData={initialSearchData}
            initialFavorites={initialFavorites}
          />
        </div>
      );
    }

    // Aucun type sélectionné
    if (!selectedType) {
      return renderDefaultContent();
    }

   // Zones cristallisées
    if (selectedType === "zones") {
      return (
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">
              {getSectionTitle()}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {crystallizedZones.length} projet(s) cristallisé(s)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Liste des projets */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Projets</h2>
              {crystallizedZones.length > 0 ? (
                <div className="space-y-2">
                  {crystallizedZones.map((zone) => (
                    <CrystallizedZoneItem 
                      key={zone.id} 
                      zone={zone}
                      isSelected={selectedZoneId === zone.id}
                      onClick={() => setSelectedZoneId(
                        selectedZoneId === zone.id ? null : zone.id
                      )}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="text-4xl mb-3">⚡</div>
                  <p>Aucune zone cristallisée</p>
                  <p className="text-sm mt-1">
                    Cristallisez une zone depuis le Board pour la voir ici
                  </p>
                </div>
              )}
            </div>

            {/* Contenu du projet sélectionné */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                {selectedZone ? `Contenu de "${selectedZone.name}"` : 'Sélectionnez un projet'}
              </h2>
              
              {selectedZone ? (
                zoneElements.length > 0 ? (
                  <div className="space-y-2">
                    {zoneElements.map((element) => (
                      <ElementListItem key={element.id} element={element} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    <p>Aucun élément dans cette zone</p>
                    <p className="text-sm mt-1">
                      Ajoutez des éléments dans la zone sur le Board
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                  <p>← Cliquez sur un projet pour voir son contenu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Autres types d'éléments
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            {getSectionTitle()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredElements.length} élément(s)
          </p>
        </div>

        {filteredElements.length > 0 ? (
          <div className="space-y-2">
            {filteredElements.map((element) => (
              <ElementListItem key={element.id} element={element} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-3">
              {ELEMENT_TYPE_CONFIGS[selectedType as ElementType]?.emoji || "📄"}
            </div>
            <p>Aucun élément de ce type</p>
            <p className="text-sm mt-1">
              Ajoutez des éléments depuis le Board
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Navigation */}
      <JourneyNavigation />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}
