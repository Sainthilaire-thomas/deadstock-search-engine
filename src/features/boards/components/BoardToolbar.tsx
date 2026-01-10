// src/features/boards/components/BoardToolbar.tsx

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
} from 'lucide-react';
import { useImmersiveModeOptional } from '@/features/boards/context/ImmersiveModeContext';

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

export function BoardToolbar({ onAddElement, onToggleViewMode, viewMode = 'inspiration' }: BoardToolbarProps) {
  const isProjectMode = viewMode === 'project';
  
  // Mode immersif (optionnel - peut être null si hors du provider)
  const immersiveMode = useImmersiveModeOptional();
  const isImmersive = immersiveMode?.isImmersive ?? false;

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
        disabled // Sprint 5
      />

      <ToolButton
        icon={<Link className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Lien web"
        onClick={() => onAddElement('link')}
        disabled // Sprint 5
      />

      <Divider />

      {/* Section: Documents */}
      <ToolButton
        icon={<FileText className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="PDF"
        onClick={() => onAddElement('pdf')}
        disabled // Sprint 6
      />

      <ToolButton
        icon={<Scissors className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Patron"
        onClick={() => onAddElement('pattern')}
        disabled // Sprint 6
      />

      <ToolButton
        icon={<User className="w-5 h-5" strokeWidth={1.5} />}
        tooltip="Silhouette"
        onClick={() => onAddElement('silhouette')}
        disabled // Sprint 6
      />

      {/* Spacer */}
      <div className="flex-1" />

      <Divider />

      {/* Section: Vue et contrôles */}
      
      {/* Mode Immersif - Nouveau ! */}
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
