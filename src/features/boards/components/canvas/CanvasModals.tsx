// src/features/boards/components/canvas/CanvasModals.tsx
// Composant regroupant tous les modals du BoardCanvas

'use client';

import { CrystallizationDialog } from '../CrystallizationDialog';
import { PaletteEditor } from '../PaletteEditor';
import { PatternImportModal } from '@/features/pattern/components/PatternImportModal';
import { ImageUploadModal } from '../ImageUploadModal';
import { VideoModal } from '../VideoModal';
import { LinkModal } from '../LinkModal';
import { PdfModal } from '../PdfModal';
import { PatternModal } from '../PatternModal';
import { SilhouetteModal } from '../SilhouetteModal';

import type {
  Board,
  BoardElement,
  PaletteElementData,
  InspirationElementData,
  VideoElementData,
  LinkElementData,
  PdfElementData,
  PatternElementData,
  SilhouetteElementData,
} from '../../domain/types';
import type { PatternCalculationElementData } from '@/features/pattern/domain/types';

interface CanvasModalsProps {
  // Data
  elements: BoardElement[];
  boardId: string;

  // Crystallization
  crystallizingChildBoard: Board | null;
  onCloseCrystallization: () => void;

  // Pattern Import
  showPatternModal: boolean;
  onClosePatternImportModal: () => void;
  onAddPatternCalculation: (data: PatternCalculationElementData) => void;

  // Palette Editor
  editingPaletteId: string | null;
  onSavePalette: (id: string, data: PaletteElementData) => void;
  onClosePaletteEditor: () => void;

  // Image Modal
  showImageModal: boolean;
  onCloseImageModal: () => void;
  onSaveImage: (data: InspirationElementData) => void;

  // Video Modal
  showVideoModal: boolean;
  editingVideoId: string | null;
  onCloseVideoModal: () => void;
  onSaveVideo: (data: VideoElementData) => void;

  // Link Modal
  showLinkModal: boolean;
  editingLinkId: string | null;
  onCloseLinkModal: () => void;
  onSaveLink: (data: LinkElementData) => void;

  // PDF Modal
  isPdfModalOpen: boolean;
  editingPdfId: string | null;
  onClosePdfModal: () => void;
  onSavePdf: (data: PdfElementData) => void;

  // Pattern Modal
  isPatternModalOpen: boolean;
  editingPatternId: string | null;
  onClosePatternElementModal: () => void;
  onSavePattern: (data: PatternElementData) => void;

  // Silhouette Modal
  isSilhouetteModalOpen: boolean;
  editingSilhouetteId: string | null;
  onCloseSilhouetteModal: () => void;
  onSaveSilhouette: (data: SilhouetteElementData) => void;
}

export function CanvasModals({
  elements,
  boardId,
  crystallizingChildBoard,
  onCloseCrystallization,
  showPatternModal,
  onClosePatternImportModal,
  onAddPatternCalculation,
  editingPaletteId,
  onSavePalette,
  onClosePaletteEditor,
  showImageModal,
  onCloseImageModal,
  onSaveImage,
  showVideoModal,
  editingVideoId,
  onCloseVideoModal,
  onSaveVideo,
  showLinkModal,
  editingLinkId,
  onCloseLinkModal,
  onSaveLink,
  isPdfModalOpen,
  editingPdfId,
  onClosePdfModal,
  onSavePdf,
  isPatternModalOpen,
  editingPatternId,
  onClosePatternElementModal,
  onSavePattern,
  isSilhouetteModalOpen,
  editingSilhouetteId,
  onCloseSilhouetteModal,
  onSaveSilhouette,
}: CanvasModalsProps) {
  // Helper pour trouver les données d'un élément
  const getElementData = <T,>(id: string | null): T | undefined => {
    if (!id) return undefined;
    return elements.find(e => e.id === id)?.elementData as T | undefined;
  };

  return (
    <>
      {/* Crystallization Dialog */}
      {crystallizingChildBoard && (
        <CrystallizationDialog
          childBoard={crystallizingChildBoard}
          parentBoardId={boardId}
          isOpen={!!crystallizingChildBoard}
          onClose={onCloseCrystallization}
          onSuccess={onCloseCrystallization}
        />
      )}

      {/* Pattern Import Modal */}
      {showPatternModal && (
        <PatternImportModal
          open={showPatternModal}
          onClose={onClosePatternImportModal}
          context="board"
          onAddToBoard={onAddPatternCalculation}
        />
      )}

      {/* Palette Editor Modal */}
      {editingPaletteId && (() => {
        const element = elements.find(e => e.id === editingPaletteId);
        if (!element || element.elementType !== 'palette') return null;
        return (
          <PaletteEditor
            initialData={element.elementData as PaletteElementData}
            boardElements={elements}
            onSave={(data) => onSavePalette(editingPaletteId, data)}
            onCancel={onClosePaletteEditor}
          />
        );
      })()}

      {/* Image Upload Modal */}
      {showImageModal && (
        <ImageUploadModal
          onSave={onSaveImage}
          onCancel={onCloseImageModal}
        />
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <VideoModal
          isOpen={showVideoModal}
          onClose={onCloseVideoModal}
          onSave={onSaveVideo}
          initialData={getElementData<VideoElementData>(editingVideoId)}
        />
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <LinkModal
          isOpen={showLinkModal}
          onClose={onCloseLinkModal}
          onSave={onSaveLink}
          initialData={getElementData<LinkElementData>(editingLinkId)}
        />
      )}

      {/* PDF Modal */}
      {isPdfModalOpen && (
        <PdfModal
          isOpen={isPdfModalOpen}
          onClose={onClosePdfModal}
          onSave={onSavePdf}
          initialData={getElementData<PdfElementData>(editingPdfId)}
        />
      )}

      {/* Pattern Modal */}
      {isPatternModalOpen && (
        <PatternModal
          isOpen={isPatternModalOpen}
          onClose={onClosePatternElementModal}
          onSave={onSavePattern}
          initialData={getElementData<PatternElementData>(editingPatternId)}
        />
      )}

      {/* Silhouette Modal */}
      {isSilhouetteModalOpen && (
        <SilhouetteModal
          isOpen={isSilhouetteModalOpen}
          onClose={onCloseSilhouetteModal}
          onSave={onSaveSilhouette}
          initialData={getElementData<SilhouetteElementData>(editingSilhouetteId)}
        />
      )}
    </>
  );
}
