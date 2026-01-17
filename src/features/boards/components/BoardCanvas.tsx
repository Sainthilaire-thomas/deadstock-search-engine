// src/features/boards/components/BoardCanvas.tsx
// VERSION REFACTORISÉE - Hooks et composants extraits

'use client';

import { useRef, useState, useCallback, useMemo } from 'react';
import { Layout, MousePointer } from 'lucide-react';
import { toast } from 'sonner';

import { useBoard } from '../context/BoardContext';
import { useContextualSearchPanel } from '../context/ContextualSearchContext';
import { BoardToolbar } from './BoardToolbar';
import { ZoneCard } from './ZoneCard';
import { ElementCard } from './ElementCard';
import { ContextualSearchPanel } from './ContextualSearchPanel';

import {
  useElementDrag,
  useZoneDrag,
  useZoneResize,
  useKeyboardShortcuts,
  CanvasModals,
  FavoritesSheet,
  type ResizeHandle,
} from './canvas';

import { isZoneOrdered } from '../domain/types';
import { isElementInZone } from '../utils/zoneUtils';
import type {
  BoardElement,
  BoardZone,
  CalculationElementData,
  TextileElementData,
  PaletteElementData,
  InspirationElementData,
  VideoElementData,
  LinkElementData,
  PdfElementData,
  PatternElementData,
  SilhouetteElementData,
} from '../domain/types';
import type { PatternCalculationElementData } from '@/features/pattern/domain/types';

type ToolType =
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

export function BoardCanvas() {
  const {
    elements,
    zones,
    viewMode,
    selectedElementIds,
    selectedZoneId,
    toggleElementSelection,
    clearSelection,
    moveElementLocal,
    saveElementPosition,
    updateElement,
    removeElement,
    selectZone,
    moveZoneLocal,
    saveZonePosition,
    resizeZoneLocal,
    saveZoneSize,
    updateZone,
    removeZone,
    setDragging,
    toggleViewMode,
    addNote,
    addPalette,
    addZone,
    addElement,
  } = useBoard();

  const { state: panelState } = useContextualSearchPanel();

  const canvasRef = useRef<HTMLDivElement>(null);

  // ============================================
  // EDITING STATE
  // ============================================
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);
  const [crystallizingZone, setCrystallizingZone] = useState<BoardZone | null>(null);

  // ============================================
  // MODAL STATE
  // ============================================
  const [showFavoritesSheet, setShowFavoritesSheet] = useState(false);
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPatternModalOpen, setIsPatternModalOpen] = useState(false);
  const [isSilhouetteModalOpen, setIsSilhouetteModalOpen] = useState(false);

  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingPdfId, setEditingPdfId] = useState<string | null>(null);
  const [editingPatternId, setEditingPatternId] = useState<string | null>(null);
  const [editingSilhouetteId, setEditingSilhouetteId] = useState<string | null>(null);

  // ============================================
  // DERIVED STATE
  // ============================================
  const boardId = zones[0]?.boardId || elements[0]?.boardId || '';

  const textileIdsOnBoard = useMemo(() => new Set(
    elements
      .filter((el) => el.elementType === 'textile')
      .map((el) => (el.elementData as TextileElementData)?.textileId)
      .filter(Boolean)
  ), [elements]);

 

  const isEditing = !!(editingElementId || editingZoneId || editingPaletteId);

  // ============================================
  // HOOKS
  // ============================================
  const { dragPosition: elementDragPosition, handleElementMouseDown } = useElementDrag({
    moveElementLocal,
    saveElementPosition,
    toggleElementSelection,
    clearSelection,
    setDragging,
  });

  const { dragPosition: zoneDragPosition, zoneDragElementPositions, handleZoneMouseDown } = useZoneDrag({
    elements,
    moveZoneLocal,
    saveZonePosition,
    moveElementLocal,
    selectZone,
    setDragging,
  });

  const { resizeState, handleZoneResizeStart } = useZoneResize({
    moveZoneLocal,
    saveZonePosition,
    resizeZoneLocal,
    saveZoneSize,
    selectZone,
    setDragging,
  });

  const closeAllModals = useCallback(() => {
    setEditingElementId(null);
    setEditingZoneId(null);
    setEditingPaletteId(null);
    setShowFavoritesSheet(false);
    setShowPatternModal(false);
    setShowImageModal(false);
    setShowVideoModal(false);
    setShowLinkModal(false);
    setIsPdfModalOpen(false);
    setIsPatternModalOpen(false);
    setIsSilhouetteModalOpen(false);
    setEditingVideoId(null);
    setEditingLinkId(null);
    setEditingPdfId(null);
    setEditingPatternId(null);
    setEditingSilhouetteId(null);
  }, []);

  useKeyboardShortcuts({
    selectedElementIds,
    selectedZoneId,
    isEditing,
    removeElement,
    removeZone,
    clearSelection,
    onEscape: closeAllModals,
  });

  // ============================================
  // HANDLERS
  // ============================================
  const handleAddElement = useCallback(async (type: ToolType) => {
    const position = { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 };

    switch (type) {
      case 'note': await addNote(position); break;
      case 'palette': await addPalette(['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'], position); break;
      case 'textile': setShowFavoritesSheet(true); break;
      case 'calculation': setShowPatternModal(true); break;
      case 'zone': await addZone('Nouvelle zone', position); break;
      case 'image': setShowImageModal(true); break;
      case 'video': setShowVideoModal(true); break;
      case 'link': setShowLinkModal(true); break;
      case 'pdf': setIsPdfModalOpen(true); break;
      case 'pattern': setIsPatternModalOpen(true); break;
      case 'silhouette': setIsSilhouetteModalOpen(true); break;
    }
  }, [addNote, addPalette, addZone]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      clearSelection();
      setEditingElementId(null);
      setEditingZoneId(null);
      setEditingPaletteId(null);
    }
  }, [clearSelection]);

const handleDoubleClick = useCallback((element: BoardElement) => {
    // Vérifier si l'élément est dans une zone commandée
    const parentOrderedZone = zones.find(z => 
      isZoneOrdered(z) && isElementInZone(element, z)
    );

    if (parentOrderedZone) {
      toast.info('Cet élément fait partie d\'un projet commandé et ne peut pas être modifié.');
      return;
    }

    switch (element.elementType) {
      case 'note': setEditingElementId(element.id); break;
      case 'palette': setEditingPaletteId(element.id); break;
      case 'video': setEditingVideoId(element.id); setShowVideoModal(true); break;
      case 'link': setEditingLinkId(element.id); setShowLinkModal(true); break;
      case 'pdf': setEditingPdfId(element.id); setIsPdfModalOpen(true); break;
      case 'pattern': setEditingPatternId(element.id); setIsPatternModalOpen(true); break;
      case 'silhouette': setEditingSilhouetteId(element.id); setIsSilhouetteModalOpen(true); break;
    }
  }, [zones]);

  const handleZoneDoubleClick = useCallback((zone: BoardZone) => {
    setEditingZoneId(zone.id);
  }, []);

  const handleSaveNote = useCallback(async (elementId: string, content: string) => {
    const element = elements.find((e) => e.id === elementId);
    if (element && element.elementType === 'note') {
      await updateElement(elementId, { elementData: { ...element.elementData, content } });
    }
    setEditingElementId(null);
  }, [elements, updateElement]);

  const handleSaveZoneName = useCallback(async (zoneId: string, name: string) => {
    if (name.trim()) {
      await updateZone(zoneId, { name: name.trim() });
    }
    setEditingZoneId(null);
  }, [updateZone]);

  // ============================================
  // MODAL HANDLERS
  // ============================================
  const handleAddPatternCalculation = useCallback(async (data: PatternCalculationElementData) => {
    const position = { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 };
    const elementData: CalculationElementData = {
      summary: `${data.patternName} ${data.selectedSize} ×${data.quantity}`,
      garmentType: data.garmentType,
      source: data.source,
      patternId: data.patternId,
      patternName: data.patternName,
      patternBrand: data.patternBrand,
      selectedSize: data.selectedSize,
      quantity: data.quantity,
      modifiers: data.modifiers,
      precisionLevel: data.precisionLevel,
      yardageByWidth: data.yardageByWidth,
      linkedTextileId: data.linkedTextileId,
    };
    await addElement({ elementType: 'calculation', elementData, positionX: position.x, positionY: position.y, width: 240, height: 200 });
    setShowPatternModal(false);
  }, [addElement]);

  const handleSaveImage = useCallback((data: InspirationElementData) => {
    const position = { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 };
    addElement({ elementType: 'inspiration', elementData: data, positionX: position.x, positionY: position.y, width: 200, height: 200 });
    setShowImageModal(false);
    toast.success('Image ajoutée');
  }, [addElement]);

  const handleSaveVideo = useCallback(async (data: VideoElementData) => {
    if (editingVideoId) {
      await updateElement(editingVideoId, { elementData: data });
      toast.success('Vidéo mise à jour');
    } else {
      const position = { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 };
      await addElement({ elementType: 'video', elementData: data, positionX: position.x, positionY: position.y, width: 280, height: 180 });
      toast.success('Vidéo ajoutée');
    }
    setShowVideoModal(false);
    setEditingVideoId(null);
  }, [editingVideoId, updateElement, addElement]);

  const handleSaveLink = useCallback(async (data: LinkElementData) => {
    if (editingLinkId) {
      await updateElement(editingLinkId, { elementData: data });
      toast.success('Lien mis à jour');
    } else {
      const position = { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 };
      await addElement({ elementType: 'link', elementData: data, positionX: position.x, positionY: position.y, width: 240, height: data.imageUrl ? 200 : 80 });
      toast.success('Lien ajouté');
    }
    setShowLinkModal(false);
    setEditingLinkId(null);
  }, [editingLinkId, updateElement, addElement]);

  const handleSavePdf = useCallback(async (data: PdfElementData) => {
    if (editingPdfId) {
      await updateElement(editingPdfId, { elementData: data });
      toast.success('PDF mis à jour');
    } else {
      const position = { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 };
      await addElement({ elementType: 'pdf', elementData: data, positionX: position.x, positionY: position.y, width: 160, height: 200 });
      toast.success('PDF ajouté');
    }
    setIsPdfModalOpen(false);
    setEditingPdfId(null);
  }, [editingPdfId, updateElement, addElement]);

  const handleSavePattern = useCallback(async (data: PatternElementData) => {
    if (editingPatternId) {
      await updateElement(editingPatternId, { elementData: data });
      toast.success('Patron mis à jour');
    } else {
      const position = { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 };
      await addElement({ elementType: 'pattern', elementData: data, positionX: position.x, positionY: position.y, width: 140, height: 180 });
      toast.success('Patron ajouté');
    }
    setIsPatternModalOpen(false);
    setEditingPatternId(null);
  }, [editingPatternId, updateElement, addElement]);

  const handleSaveSilhouette = useCallback(async (data: SilhouetteElementData) => {
    if (editingSilhouetteId) {
      await updateElement(editingSilhouetteId, { elementData: data });
      toast.success('Silhouette mise à jour');
    } else {
      const position = { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 };
      await addElement({ elementType: 'silhouette', elementData: data, positionX: position.x, positionY: position.y, width: 120, height: 160 });
      toast.success('Silhouette ajoutée');
    }
    setIsSilhouetteModalOpen(false);
    setEditingSilhouetteId(null);
  }, [editingSilhouetteId, updateElement, addElement]);

  const handleSavePalette = useCallback(async (id: string, data: PaletteElementData) => {
    await updateElement(id, { elementData: data });
    toast.success('Palette mise à jour');
    setEditingPaletteId(null);
  }, [updateElement]);

  const handleAddTextileFromFavorites = useCallback(async (elementData: TextileElementData, name: string) => {
    const position = { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 };
    await addElement({ elementType: 'textile', elementData, positionX: position.x, positionY: position.y });
  }, [addElement]);

  // ============================================
  // RENDER CALCULATIONS
  // ============================================
  const allPositions = [
    ...elements.map((e) => ({ x: e.positionX + (e.width || 200), y: e.positionY + (e.height || 150) })),
    ...zones.map((z) => ({ x: z.positionX + z.width, y: z.positionY + z.height })),
  ];
  const canvasWidth = Math.max(1200, ...allPositions.map((p) => p.x + 100));
  const canvasHeight = Math.max(800, ...allPositions.map((p) => p.y + 100));
  const isEmpty = elements.length === 0 && zones.length === 0;
  const showZones = viewMode === 'project';

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="flex h-full">
      <BoardToolbar
        onAddElement={handleAddElement}
        onToggleViewMode={toggleViewMode}
        viewMode={viewMode}
       
      />

      <div
        ref={canvasRef}
        className="flex-1 relative overflow-auto bg-gray-100 dark:bg-gray-700"
        onClick={handleCanvasClick}
      >
        {isEmpty ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Layout className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Board vide</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md px-4">
              Utilisez la barre d'outils à gauche pour ajouter des éléments : notes, palettes, tissus, calculs...
            </p>
          </div>
        ) : (
          <div className="relative" style={{ width: canvasWidth, height: canvasHeight, minWidth: '100%', minHeight: '100%' }}>
            {/* Zones */}
            {zones.map((zone) => {
              const isDragging = zoneDragPosition?.id === zone.id;
              const isResizing = resizeState?.id === zone.id;
              const position = isDragging
                ? { x: zoneDragPosition.x, y: zoneDragPosition.y }
                : isResizing
                ? { x: resizeState.x, y: resizeState.y }
                : { x: zone.positionX, y: zone.positionY };
              const size = isResizing
                ? { width: resizeState.width, height: resizeState.height }
                : { width: zone.width, height: zone.height };

              return (
                <ZoneCard
                  key={zone.id}
                  zone={{ ...zone, positionX: position.x, positionY: position.y, width: size.width, height: size.height }}
                  isSelected={selectedZoneId === zone.id}
                  isEditing={editingZoneId === zone.id}
                  isVisible={showZones}
                  onMouseDown={(e) => handleZoneMouseDown(e, zone)}
                  onDoubleClick={() => handleZoneDoubleClick(zone)}
                  onResizeStart={(e, handle) => handleZoneResizeStart(e, zone, handle as ResizeHandle)}
                  onSaveName={(name) => handleSaveZoneName(zone.id, name)}
                  onCancelEdit={() => setEditingZoneId(null)}
                  onCrystallize={() => setCrystallizingZone(zone)}
                  onDelete={() => removeZone(zone.id)}
                />
              );
            })}

            {/* Elements */}
            {elements.map((element) => {
              const individualDragPos = elementDragPosition?.id === element.id ? { x: elementDragPosition.x, y: elementDragPosition.y } : null;
              const zoneDragPos = zoneDragElementPositions[element.id];
              const position = individualDragPos || zoneDragPos || { x: element.positionX, y: element.positionY };

              return (
                <ElementCard
                  key={element.id}
                  element={{ ...element, positionX: position.x, positionY: position.y }}
                  isSelected={selectedElementIds.includes(element.id)}
                  isEditing={editingElementId === element.id}
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                  onDoubleClick={() => handleDoubleClick(element)}
                  onSaveNote={(content) => handleSaveNote(element.id, content)}
                  onCancelEdit={() => setEditingElementId(null)}
                  onDelete={() => removeElement(element.id)}
                />
              );
            })}
          </div>
        )}

        {/* Instructions */}
        {!isEmpty && (
          <div className="absolute bottom-4 left-4 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded border border-gray-200 dark:border-gray-700">
            <MousePointer className="w-3 h-3" />
            Cliquer • Glisser • Double-clic éditer • Suppr supprimer
          </div>
        )}

        {/* View mode indicator */}
        <div className="absolute top-4 right-4 text-xs px-2 py-1 rounded bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
          Mode {viewMode === 'inspiration' ? 'Inspiration' : 'Projet'}
          {viewMode === 'project' && zones.length > 0 && (
            <span className="ml-1 text-gray-400">• {zones.length} zone{zones.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Favorites Sheet */}
      <FavoritesSheet
        isOpen={showFavoritesSheet}
        onOpenChange={setShowFavoritesSheet}
        textileIdsOnBoard={textileIdsOnBoard}
        onAddTextile={handleAddTextileFromFavorites}
      />

      {/* All Modals */}
      <CanvasModals
        elements={elements}
        boardId={boardId}
        crystallizingZone={crystallizingZone}
        onCloseCrystallization={() => setCrystallizingZone(null)}
        showPatternModal={showPatternModal}
        onClosePatternImportModal={() => setShowPatternModal(false)}
        onAddPatternCalculation={handleAddPatternCalculation}
        editingPaletteId={editingPaletteId}
        onSavePalette={handleSavePalette}
        onClosePaletteEditor={() => setEditingPaletteId(null)}
        showImageModal={showImageModal}
        onCloseImageModal={() => setShowImageModal(false)}
        onSaveImage={handleSaveImage}
        showVideoModal={showVideoModal}
        editingVideoId={editingVideoId}
        onCloseVideoModal={() => { setShowVideoModal(false); setEditingVideoId(null); }}
        onSaveVideo={handleSaveVideo}
        showLinkModal={showLinkModal}
        editingLinkId={editingLinkId}
        onCloseLinkModal={() => { setShowLinkModal(false); setEditingLinkId(null); }}
        onSaveLink={handleSaveLink}
        isPdfModalOpen={isPdfModalOpen}
        editingPdfId={editingPdfId}
        onClosePdfModal={() => { setIsPdfModalOpen(false); setEditingPdfId(null); }}
        onSavePdf={handleSavePdf}
        isPatternModalOpen={isPatternModalOpen}
        editingPatternId={editingPatternId}
        onClosePatternElementModal={() => { setIsPatternModalOpen(false); setEditingPatternId(null); }}
        onSavePattern={handleSavePattern}
        isSilhouetteModalOpen={isSilhouetteModalOpen}
        editingSilhouetteId={editingSilhouetteId}
        onCloseSilhouetteModal={() => { setIsSilhouetteModalOpen(false); setEditingSilhouetteId(null); }}
        onSaveSilhouette={handleSaveSilhouette}
      />

      {/* Contextual Search Panel */}
      <ContextualSearchPanel
        boardId={boardId}
        onAddToBoard={async (textile) => {
          const position = { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 };
          const elementData: TextileElementData = {
            textileId: textile.id,
            snapshot: {
              name: textile.name,
              source: textile.supplier_name || '',
              price: textile.price_value || 0,
              currency: textile.price_currency || 'EUR',
              imageUrl: textile.image_url ?? null,
              availableQuantity: textile.quantity_value || null,
              material: textile.fiber || null,
              color: textile.color || null,
            },
          };
          await addElement({ elementType: 'textile', elementData, positionX: position.x, positionY: position.y });
          toast.success(`"${textile.name}" ajouté au board`);
        }}
      />
    </div>
  );
}
