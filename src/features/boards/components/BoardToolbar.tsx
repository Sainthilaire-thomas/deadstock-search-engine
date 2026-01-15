// src/features/boards/components/BoardToolbar.tsx
// Sprint 6: Boutons PDF, Pattern, Silhouette activés

'use client';

import {
  Image,
  Video,
  Shirt,
  Palette,
  Ruler,
  StickyNote,
  Link,
  FileText,
  Scissors,
  User,
  Eye,
  LayoutGrid,
  Square,
  Maximize2,
  Minimize2,
  Search,
  Lightbulb,
  Calculator,
  ShoppingCart,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import NextLink from 'next/link';
import { useImmersiveModeOptional } from '@/features/boards/context/ImmersiveModeContext';
import { useContextualSearchPanel } from '../context/ContextualSearchContext';
// Types pour les outils
export type ToolType =
  | 'image'
  | 'video'
  | 'textile'
  | 'palette'
  | 'calculation'
  | 'note'
  | 'link'
  | 'pdf'
  | 'pattern'
  | 'silhouette'
  | 'zone';

interface BoardToolbarProps {
  onAddElement: (type: ToolType) => void;
  onToggleViewMode?: () => void;
  viewMode?: 'inspiration' | 'project';
  elementCounts?: {
    conception: number;
    preparation: number;
    execution: number;
  };
}

interface ToolButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function ToolButton({ icon, tooltip, onClick, active, disabled }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative w-10 h-10 flex items-center justify-center
        rounded-lg transition-all duration-150
        ${active
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={tooltip}
    >
      {icon}

      {/* Tooltip */}
      <div className="
        absolute left-full ml-3 px-2 py-1
        bg-gray-900 dark:bg-gray-100
        text-white dark:text-gray-900
        text-xs font-medium
        rounded shadow-lg
        opacity-0 group-hover:opacity-100
        pointer-events-none
        whitespace-nowrap
        z-50
        transition-opacity duration-150
      ">
        {tooltip}
        {disabled && <span className="text-gray-400 dark:text-gray-500 ml-1">(bientôt)</span>}
      </div>
    </button>
  );
}

function Divider() {
  return <div className="w-6 h-px bg-gray-200 dark:bg-gray-700 my-1 mx-auto" />;
}

interface JourneyButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  href: string;
  count: number;
  phaseTypes: { emoji: string; label: string; type: string }[];
}

function JourneyButton({ icon, tooltip, href, count, phaseTypes }: JourneyButtonProps) {
  return (
    <div className="group relative">
      <NextLink
        href={href}
        className={`
          relative w-10 h-10 flex items-center justify-center
          rounded-lg transition-all duration-150
          text-gray-500 dark:text-gray-400 
          hover:text-gray-900 dark:hover:text-gray-100 
          hover:bg-gray-100 dark:hover:bg-gray-800
          cursor-pointer
        `}
        title={tooltip}
      >
        {icon}
        {/* Badge compteur */}
        {count > 0 && (
          <div className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-primary rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary-foreground">
              {count}
            </span>
          </div>
        )}
      </NextLink>

      {/* Popup au hover avec les types */}
      <div className="
        absolute left-full ml-1
        bg-popover border border-border
        text-popover-foreground
        text-xs
        rounded-lg shadow-lg
        opacity-0 group-hover:opacity-100
        invisible group-hover:visible
        z-50
        transition-all duration-150
        min-w-40
        overflow-hidden
        before:content-[''] before:absolute before:top-0 before:bottom-0 before:-left-2 before:w-2
      ">
        <div className="px-3 py-2 border-b border-border bg-muted/50">
          <span className="font-semibold">{tooltip}</span>
          <span className="ml-2 text-muted-foreground">({count})</span>
        </div>
        <div className="py-1">
          {phaseTypes.map((pt) => (
            <NextLink
              key={pt.type}
              href={`${href}?type=${pt.type}`}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent transition-colors"
            >
              <span>{pt.emoji}</span>
              <span>{pt.label}</span>
            </NextLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BoardToolbar({ onAddElement, onToggleViewMode, viewMode = 'inspiration', elementCounts }: BoardToolbarProps) {
  const params = useParams();
  const boardId = params.boardId as string;
  const isProjectMode = viewMode === 'project';

  // Mode immersif (optionnel - peut être null si hors du provider)
  const immersiveMode = useImmersiveModeOptional();
  const isImmersive = immersiveMode?.isImmersive ?? false;
// Recherche contextuelle
  const contextualSearch = useContextualSearchPanel();
  const hasActiveConstraints = contextualSearch.state.constraints.length > 0;

  return (
    <div className="
      w-14 h-full
      bg-white dark:bg-gray-900
      border-r border-gray-200 dark:border-gray-700
      flex flex-col items-center
      py-3 gap-0.5
      shrink-0
    ">
      {/* Section: Éléments de base */}
      <ToolButton
        icon={<StickyNote className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Note"
        onClick={() => onAddElement('note')}
      />

      <ToolButton
        icon={<Palette className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Palette de couleurs"
        onClick={() => onAddElement('palette')}
      />

      <ToolButton
        icon={<Shirt className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Tissu depuis favoris"
        onClick={() => onAddElement('textile')}
      />

      <ToolButton
        icon={<Ruler className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Calcul métrage"
        onClick={() => onAddElement('calculation')}
      />

      <Divider />

      {/* Section: Médias */}
      <ToolButton
        icon={<Image className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Image / Inspiration"
        onClick={() => onAddElement('image')}
      />

      <ToolButton
        icon={<Video className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Vidéo"
        onClick={() => onAddElement('video')}
      />

      <ToolButton
        icon={<Link className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Lien web"
        onClick={() => onAddElement('link')}
      />

      <Divider />

      {/* Section: Documents - Sprint 6 ACTIVÉ */}
      <ToolButton
        icon={<FileText className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="PDF"
        onClick={() => onAddElement('pdf')}
      />

      <ToolButton
        icon={<Scissors className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Patron"
        onClick={() => onAddElement('pattern')}
      />

      <ToolButton
        icon={<User className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Silhouette"
        onClick={() => onAddElement('silhouette')}
      />

     {/* Spacer */}
      <div className="flex-1" />

      {/* Section: Journey - Accès rapide aux phases */}
      <Divider />

      <JourneyButton
        icon={<Lightbulb className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Conception"
        href={`/boards/${boardId}/journey`}
        count={elementCounts?.conception ?? 0}
        phaseTypes={[
          { emoji: '🎨', label: 'Palettes', type: 'palette' },
          { emoji: '✂️', label: 'Patrons', type: 'pattern' },
          { emoji: '👤', label: 'Silhouettes', type: 'silhouette' },
          { emoji: '📷', label: 'Inspirations', type: 'inspiration' },
          { emoji: '📄', label: 'Documents', type: 'pdf' },
        ]}
      />

      <JourneyButton
        icon={<Calculator className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Préparation"
        href={`/boards/${boardId}/journey`}
        count={elementCounts?.preparation ?? 0}
        phaseTypes={[
          { emoji: '📐', label: 'Calculs', type: 'calculation' },
          { emoji: '🧵', label: 'Tissus', type: 'textile' },
          { emoji: '📝', label: 'Notes', type: 'note' },
        ]}
      />

      <JourneyButton
        icon={<ShoppingCart className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Exécution"
        href={`/boards/${boardId}/journey`}
        count={elementCounts?.execution ?? 0}
        phaseTypes={[
          { emoji: '🎬', label: 'Vidéos', type: 'video' },
          { emoji: '🔗', label: 'Liens', type: 'link' },
          { emoji: '⚡', label: 'Projets', type: 'zones' },
        ]}
      />

      <Divider />

      {/* Section: Vue et contrôles */}

      {/* Recherche contextuelle - Sprint B3 */}
      <div className="relative">
        <ToolButton
          icon={<Search className="w-5 h-5" strokeWidth={1.5} />}
          tooltip={contextualSearch.state.isOpen ? 'Fermer recherche' : 'Recherche contextuelle'}
          onClick={() => contextualSearch.state.isOpen ? contextualSearch.closePanel() : contextualSearch.openPanel()}
          active={contextualSearch.state.isOpen}
        />
        {/* Badge contraintes actives */}
        {hasActiveConstraints && !contextualSearch.state.isOpen && (
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">
              {contextualSearch.state.constraints.length}
            </span>
          </div>
        )}
      </div>

    
      {/* Mode Immersif */}
      {immersiveMode && (
        <ToolButton
          icon={isImmersive
            ? <Minimize2 className="w-5 h-5" strokeWidth={1.5} />
            : <Maximize2 className="w-5 h-5" strokeWidth={1.5} />
          }
          tooltip={isImmersive ? 'Quitter mode immersif' : 'Mode immersif (masquer sidebar)'}
          onClick={immersiveMode.toggleImmersiveMode}
          active={isImmersive}
        />
      )}

      <ToolButton
        icon={isProjectMode
          ? <LayoutGrid className="w-5 h-5" strokeWidth={1.5} />
          : <Eye className="w-5 h-5" strokeWidth={1.5} />
        }
        tooltip={isProjectMode ? 'Mode Projet (zones visibles)' : 'Mode Inspiration (zones masquées)'}
        onClick={() => onToggleViewMode?.()}
        active={isProjectMode}
      />

      <ToolButton
        icon={<Square className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Créer une zone"
        onClick={() => onAddElement('zone')}
      />
    </div>
  );
}
