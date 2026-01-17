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
import { OrderForm } from "./OrderForm";
import { ShoppingCart, FileText, Package, CheckCircle, Trophy } from "lucide-react";
import type { ProjectStatus, BoardZone } from "@/features/boards/domain/types";

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
  zone: { id: string; name: string; crystallizedAt: Date | null; linkedProjectStatus?: ProjectStatus };
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
const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

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

  // Configuration des colonnes par statut
  const STATUS_COLUMNS = [
    {
      key: 'draft' as const,
      title: 'Brouillons',
      icon: FileText,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      statuses: ['draft'],
    },
    {
      key: 'ordered' as const,
      title: 'Commandés',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      statuses: ['ordered', 'shipped'],
    },
    {
      key: 'received' as const,
      title: 'Reçus',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      statuses: ['received', 'in_production'],
    },
    {
      key: 'completed' as const,
      title: 'Terminés',
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      statuses: ['completed'],
    },
  ];

  // Grouper les zones par statut du projet
  const zonesByStatus = useMemo(() => {
    const grouped: Record<string, BoardZone[]> = {
      draft: [],
      ordered: [],
      received: [],
      completed: [],
    };

    crystallizedZones.forEach((zone) => {
      const status = zone.linkedProjectStatus || 'draft';
      
      if (['draft', 'in_progress'].includes(status)) {
        grouped.draft.push(zone);
      } else if (['ordered', 'shipped'].includes(status)) {
        grouped.ordered.push(zone);
      } else if (['received', 'in_production'].includes(status)) {
        grouped.received.push(zone);
      } else if (status === 'completed') {
        grouped.completed.push(zone);
      } else {
        // Par défaut, mettre dans brouillons
        grouped.draft.push(zone);
      }
    });

    return grouped;
  }, [crystallizedZones]);

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

   // Zones cristallisées - Vue par statut
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

          {crystallizedZones.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-3">⚡</div>
              <p>Aucune zone cristallisée</p>
              <p className="text-sm mt-1">
                Cristallisez une zone depuis le Board pour la voir ici
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {STATUS_COLUMNS.map((column) => {
                const zonesInColumn = zonesByStatus[column.key];
                const Icon = column.icon;

                return (
                  <div key={column.key} className="space-y-3">
                    {/* Header colonne */}
                    <div className={`${column.bgColor} rounded-lg p-3`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${column.color}`} />
                        <span className="font-medium">{column.title}</span>
                        <span className="ml-auto text-sm text-muted-foreground">
                          {zonesInColumn.length}
                        </span>
                      </div>
                    </div>

                    {/* Liste des projets */}
                    <div className="space-y-2 min-h-25">
                      {zonesInColumn.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Aucun projet
                        </p>
                      ) : (
                        zonesInColumn.map((zone) => (
                          <CrystallizedZoneItem
                            key={zone.id}
                            zone={zone}
                            isSelected={selectedZoneId === zone.id}
                            onClick={() => setSelectedZoneId(
                              selectedZoneId === zone.id ? null : zone.id
                            )}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Contenu du projet sélectionné */}
          {selectedZone && (
            <div className="border-t pt-6">
              <h2 className="text-lg font-medium mb-4">
                Contenu de &quot;{selectedZone.name}&quot;
              </h2>

              {zoneElements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
              )}

              {/* Bouton Passer commande - uniquement pour les brouillons */}
              {selectedZone.linkedProjectId && selectedZone.linkedProjectStatus === 'draft' && (
                <div className="mt-6 pt-4 border-t">
                  <button
                    onClick={() => setIsOrderFormOpen(true)}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Passer commande
                  </button>
                </div>
              )}
            </div>
          )}
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
    <div className="flex h-full bg-background">
      {/* Sidebar Navigation */}
      <JourneyNavigation />
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Order Form Modal */}
      {isOrderFormOpen && selectedZone?.linkedProjectId && (
        <OrderForm
          projectId={selectedZone.linkedProjectId}
          zoneElements={zoneElements}
          onCancel={() => setIsOrderFormOpen(false)}
          onSuccess={() => {
            setIsOrderFormOpen(false);
            setSelectedZoneId(null);
          }}
        />
      )}
    </div>
  );
}
