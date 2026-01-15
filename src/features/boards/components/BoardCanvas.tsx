// src/features/boards/components/BoardCanvas.tsx
// VERSION HARMONISÉE - Types unifiés avec InspirationElementData (standard DB)
// SPRINT 6 INTÉGRÉ

'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Layout, MousePointer, Heart, Plus, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useBoard } from '../context/BoardContext';
import { BoardToolbar } from './BoardToolbar';
import { ZoneCard } from './ZoneCard';
import { ElementCard } from './ElementCard';
import { CrystallizationDialog } from './CrystallizationDialog';
import { PaletteEditor } from './PaletteEditor';
import { PatternImportModal } from '@/features/pattern/components/PatternImportModal';
import { getFavoritesAction } from '@/features/favorites/actions/favoriteActions';

// Sprint 5 imports
import { ImageUploadModal } from './ImageUploadModal';
import { VideoModal } from './VideoModal';
import { LinkModal } from './LinkModal';

// Sprint 6 imports
import { PdfModal } from './PdfModal';
import { PatternModal } from './PatternModal';
import { SilhouetteModal } from './SilhouetteModal';

//Sprint 7 imports
import { ContextualSearchPanel } from './ContextualSearchPanel';
import { useContextualSearchPanel } from '../context/ContextualSearchContext';

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
  SilhouetteElementData 
} from '../domain/types';
import type { PatternCalculationElementData } from '@/features/pattern/domain/types';
import type { FavoriteWithTextile } from '@/features/favorites/domain/types';

// Constantes pour le resize
const MIN_ZONE_WIDTH = 150;
const MIN_ZONE_HEIGHT = 100;

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

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
  const { 
  state: panelState, 
  closePanel, 
  closeAndReset,
} = useContextualSearchPanel();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);
  const [crystallizingZone, setCrystallizingZone] = useState<BoardZone | null>(null);

  // Modals/Sheets state
  const [showFavoritesSheet, setShowFavoritesSheet] = useState(false);
  const [showPatternModal, setShowPatternModal] = useState(false);
  
  // Sprint 5 modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

// Sprint 6 modal states
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPatternModalOpen, setIsPatternModalOpen] = useState(false);
  const [isSilhouetteModalOpen, setIsSilhouetteModalOpen] = useState(false);
  const [editingPdfId, setEditingPdfId] = useState<string | null>(null);
  const [editingPatternId, setEditingPatternId] = useState<string | null>(null);
  const [editingSilhouetteId, setEditingSilhouetteId] = useState<string | null>(null);


  // Favorites state
  const [favorites, setFavorites] = useState<FavoriteWithTextile[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [addingTextileId, setAddingTextileId] = useState<string | null>(null);

  // Extraire boardId
  const boardId = zones[0]?.boardId || elements[0]?.boardId || '';

  // ============================================
  // DRAG STATE - Local pour fluidité maximale
  // ============================================

  const [dragPosition, setDragPosition] = useState<{
    type: 'element' | 'zone';
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const dragPositionRef = useRef(dragPosition);
  dragPositionRef.current = dragPosition;

  const [resizeState, setResizeState] = useState<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const resizeStateRef = useRef(resizeState);
  resizeStateRef.current = resizeState;

  // IDs des textiles déjà sur le board
  const textileIdsOnBoard = new Set(
    elements
      .filter((el) => el.elementType === 'textile')
      .map((el) => (el.elementData as TextileElementData)?.textileId)
      .filter(Boolean)
  );

  // ============================================
  // FAVORITES LOADING
  // ============================================

  useEffect(() => {
    if (showFavoritesSheet) {
      loadFavorites();
    }
  }, [showFavoritesSheet]);

  const loadFavorites = async () => {
    setFavoritesLoading(true);
    try {
      const result = await getFavoritesAction();
      if (result.success && result.data) {
        setFavorites(result.data);
      }
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleAddTextile = async (favorite: FavoriteWithTextile) => {
    if (!favorite.textile) return;

    const textile = favorite.textile;
    setAddingTextileId(textile.id);

    try {
      const position = {
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 200,
      };

      const elementData: TextileElementData = {
        textileId: textile.id,
        snapshot: {
          name: textile.name,
          source: textile.source_platform || '',
          price: textile.price_value || 0,
          currency: textile.price_currency || 'EUR',
          imageUrl: textile.image_url || null,
          availableQuantity: textile.quantity_value || null,
          material: textile.material_type || null,
          color: textile.color || null,
        },
      };

      await addElement({
        elementType: 'textile',
        elementData,
        positionX: position.x,
        positionY: position.y,
      });

      toast.success(`"${textile.name}" ajouté au board`);
    } catch (error) {
      console.error('Erreur ajout textile:', error);
      toast.error("Erreur lors de l'ajout du tissu");
    } finally {
      setAddingTextileId(null);
    }
  };

  // ============================================
  // KEYBOARD SHORTCUTS (Delete/Backspace)
  // ============================================

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (editingElementId || editingZoneId || editingPaletteId) return;

    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();

      if (selectedElementIds.length > 0) {
        selectedElementIds.forEach(id => removeElement(id));
      }

      if (selectedZoneId) {
        removeZone(selectedZoneId);
      }
    }

    if (e.key === 'Escape') {
      clearSelection();
      setEditingElementId(null);
      setEditingZoneId(null);
      setEditingPaletteId(null);
      setShowFavoritesSheet(false);
      setShowPatternModal(false);
      setShowImageModal(false);
      setShowVideoModal(false);
      setShowLinkModal(false);
      setEditingVideoId(null);
      setEditingLinkId(null);
      // Sprint 6
      setIsPdfModalOpen(false);
      setIsPatternModalOpen(false);
      setIsSilhouetteModalOpen(false);
      setEditingPdfId(null);
      setEditingPatternId(null);
      setEditingSilhouetteId(null);
    }
  }, [selectedElementIds, selectedZoneId, editingElementId, editingZoneId, editingPaletteId, removeElement, removeZone, clearSelection]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ============================================
  // DRAG REFS
  // ============================================

  const elementDragRef = useRef<{
    elementId: string;
    startX: number;
    startY: number;
    elementStartX: number;
    elementStartY: number;
  } | null>(null);

  const zoneDragRef = useRef<{
    zoneId: string;
    startX: number;
    startY: number;
    zoneStartX: number;
    zoneStartY: number;
  } | null>(null);

  const zoneResizeRef = useRef<{
    zoneId: string;
    handle: ResizeHandle;
    startX: number;
    startY: number;
    zoneStartX: number;
    zoneStartY: number;
    zoneStartWidth: number;
    zoneStartHeight: number;
  } | null>(null);

  // ============================================
  // TOOL HANDLERS
  // ============================================

  const handleAddElement = async (type: ToolType) => {
    const position = {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    };

    switch (type) {
      case 'note':
        await addNote(position);
        break;
      case 'palette':
        const defaultColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        await addPalette(defaultColors, position);
        break;
      case 'textile':
        setShowFavoritesSheet(true);
        break;
      case 'calculation':
        setShowPatternModal(true);
        break;
      case 'zone':
        await addZone('Nouvelle zone', position);
        break;
      // Sprint 5
      case 'image':
        setShowImageModal(true);
        break;
      case 'video':
        setShowVideoModal(true);
        break;
      case 'link':
        setShowLinkModal(true);
        break;
      // Sprint 6
      case 'pdf':
        setIsPdfModalOpen(true);
        break;
      case 'pattern':
        setIsPatternModalOpen(true);
        break;
      case 'silhouette':
        setIsSilhouetteModalOpen(true);
        break;
    }
  };

  const handleAddPatternCalculation = async (data: PatternCalculationElementData) => {
    const position = {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    };

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

    await addElement({
      elementType: 'calculation',
      elementData,
      positionX: position.x,
      positionY: position.y,
      width: 240,
      height: 200,
    });

    setShowPatternModal(false);
  };

  // ============================================
  // Sprint 5 - IMAGE/VIDEO/LINK HANDLERS
  // ============================================

  const handleSaveImage = (data: InspirationElementData) => {
    const position = {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    };

    addElement({
      elementType: 'inspiration',
      elementData: data,
      positionX: position.x,
      positionY: position.y,
      width: 200,
      height: 200,
    });

    setShowImageModal(false);
    toast.success('Image ajoutée');
  };

  const handleSaveVideo = async (data: VideoElementData) => {
    if (editingVideoId) {
      await updateElement(editingVideoId, { elementData: data });
      setEditingVideoId(null);
      toast.success('Vidéo mise à jour');
    } else {
      const position = {
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
      };

      await addElement({
        elementType: 'video',
        elementData: data,
        positionX: position.x,
        positionY: position.y,
        width: 280,
        height: 180,
      });

      toast.success('Vidéo ajoutée');
    }

    setShowVideoModal(false);
  };

  const handleSaveLink = async (data: LinkElementData) => {
    if (editingLinkId) {
      await updateElement(editingLinkId, { elementData: data });
      setEditingLinkId(null);
      toast.success('Lien mis à jour');
    } else {
      const position = {
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
      };

      await addElement({
        elementType: 'link',
        elementData: data,
        positionX: position.x,
        positionY: position.y,
        width: 240,
        height: data.imageUrl ? 200 : 80,
      });

      toast.success('Lien ajouté');
    }

    setShowLinkModal(false);
  };

  // ============================================
  // Sprint 6 - PDF/PATTERN/SILHOUETTE HANDLERS
  // ============================================

 const handleSavePdf = async (data: PdfElementData) => {
    try {
      if (editingPdfId) {
        // Mode édition
        await updateElement(editingPdfId, { elementData: data });
        setEditingPdfId(null);
        toast.success('PDF mis à jour');
      } else {
        // Mode création
        const position = {
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 200,
        };

        await addElement({
          elementType: 'pdf',
          elementData: data,
          positionX: position.x,
          positionY: position.y,
          width: 160,
          height: 200,
        });

        toast.success('PDF ajouté');
      }

      setIsPdfModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du PDF:', error);
      toast.error('Erreur lors de la sauvegarde du PDF');
    }
  };

 const handleSavePattern = async (data: PatternElementData) => {
    try {
      if (editingPatternId) {
        // Mode édition
        await updateElement(editingPatternId, { elementData: data });
        setEditingPatternId(null);
        toast.success('Patron mis à jour');
      } else {
        // Mode création
        const position = {
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 200,
        };

        await addElement({
          elementType: 'pattern',
          elementData: data,
          positionX: position.x,
          positionY: position.y,
          width: 140,
          height: 180,
        });

        toast.success('Patron ajouté');
      }

      setIsPatternModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du patron:', error);
      toast.error('Erreur lors de la sauvegarde du patron');
    }
  };
const handleSaveSilhouette = async (data: SilhouetteElementData) => {
    try {
      if (editingSilhouetteId) {
        // Mode édition
        await updateElement(editingSilhouetteId, { elementData: data });
        setEditingSilhouetteId(null);
        toast.success('Silhouette mise à jour');
      } else {
        // Mode création
        const position = {
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 200,
        };

        await addElement({
          elementType: 'silhouette',
          elementData: data,
          positionX: position.x,
          positionY: position.y,
          width: 120,
          height: 160,
        });

        toast.success('Silhouette ajoutée');
      }

      setIsSilhouetteModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la silhouette:', error);
      toast.error('Erreur lors de la sauvegarde de la silhouette');
    }
  };

  // ============================================
  // DELETE HANDLERS
  // ============================================

  const handleDeleteElement = (id: string) => {
    removeElement(id);
  };

  const handleDeleteZone = (id: string) => {
    removeZone(id);
  };

  // ============================================
  // CANVAS HANDLERS
  // ============================================

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      clearSelection();
      setEditingElementId(null);
      setEditingZoneId(null);
      setEditingPaletteId(null);
    }
  };

const handleDoubleClick = (element: BoardElement) => {
  if (element.elementType === 'note') {
    setEditingElementId(element.id);
  } else if (element.elementType === 'palette') {
    setEditingPaletteId(element.id);
  } else if (element.elementType === 'video') {
    setEditingVideoId(element.id);
    setShowVideoModal(true);
  } else if (element.elementType === 'link') {
    setEditingLinkId(element.id);
    setShowLinkModal(true);
 } else if (element.elementType === 'pdf') {
    setEditingPdfId(element.id);
    setIsPdfModalOpen(true);
  } else if (element.elementType === 'pattern') {
    setEditingPatternId(element.id);
    setIsPatternModalOpen(true);
  } else if (element.elementType === 'silhouette') {
    setEditingSilhouetteId(element.id);
    setIsSilhouetteModalOpen(true);
  }
};

  const handleZoneDoubleClick = (zone: BoardZone) => {
    setEditingZoneId(zone.id);
  };

  const handleSaveZoneName = async (zoneId: string, name: string) => {
    if (name.trim()) {
      await updateZone(zoneId, { name: name.trim() });
    }
    setEditingZoneId(null);
  };

  const handleSaveNote = async (elementId: string, content: string) => {
    const element = elements.find((e) => e.id === elementId);
    if (element && element.elementType === 'note') {
      await updateElement(elementId, {
        elementData: { ...element.elementData, content },
      });
    }
    setEditingElementId(null);
  };

  const handleSavePalette = async (elementId: string, data: PaletteElementData) => {
    const element = elements.find((e) => e.id === elementId);
    if (element && element.elementType === 'palette') {
      await updateElement(elementId, {
        elementData: data,
      });
      toast.success('Palette mise à jour');
    }
    setEditingPaletteId(null);
  };

  // ============================================
  // ELEMENT DRAG
  // ============================================

  const handleElementMouseDown = (e: React.MouseEvent, element: BoardElement) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    if (!e.shiftKey) {
      clearSelection();
    }
    toggleElementSelection(element.id);

    elementDragRef.current = {
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      elementStartX: element.positionX,
      elementStartY: element.positionY,
    };
    setDragging(true);

    document.addEventListener('mousemove', handleElementMouseMove);
    document.addEventListener('mouseup', handleElementMouseUp);
  };

  const handleElementMouseMove = (e: MouseEvent) => {
    if (!elementDragRef.current) return;
    const dx = e.clientX - elementDragRef.current.startX;
    const dy = e.clientY - elementDragRef.current.startY;
    const newX = Math.max(0, elementDragRef.current.elementStartX + dx);
    const newY = Math.max(0, elementDragRef.current.elementStartY + dy);

    setDragPosition({ type: 'element', id: elementDragRef.current.elementId, x: newX, y: newY });
  };

  const handleElementMouseUp = () => {
    const pos = dragPositionRef.current;

    if (pos && pos.type === 'element') {
      moveElementLocal(pos.id, pos.x, pos.y);
      saveElementPosition(pos.id, pos.x, pos.y);
    }

    setDragPosition(null);
    elementDragRef.current = null;
    setDragging(false);
    document.removeEventListener('mousemove', handleElementMouseMove);
    document.removeEventListener('mouseup', handleElementMouseUp);
  };

  // ============================================
  // ZONE DRAG
  // ============================================

  const handleZoneMouseDown = (e: React.MouseEvent, zone: BoardZone) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    selectZone(zone.id);

    zoneDragRef.current = {
      zoneId: zone.id,
      startX: e.clientX,
      startY: e.clientY,
      zoneStartX: zone.positionX,
      zoneStartY: zone.positionY,
    };
    setDragging(true);

    document.addEventListener('mousemove', handleZoneMouseMove);
    document.addEventListener('mouseup', handleZoneMouseUp);
  };

  const handleZoneMouseMove = (e: MouseEvent) => {
    if (!zoneDragRef.current) return;
    const dx = e.clientX - zoneDragRef.current.startX;
    const dy = e.clientY - zoneDragRef.current.startY;
    const newX = Math.max(0, zoneDragRef.current.zoneStartX + dx);
    const newY = Math.max(0, zoneDragRef.current.zoneStartY + dy);

    setDragPosition({ type: 'zone', id: zoneDragRef.current.zoneId, x: newX, y: newY });
  };

  const handleZoneMouseUp = () => {
    const pos = dragPositionRef.current;

    if (pos && pos.type === 'zone') {
      moveZoneLocal(pos.id, pos.x, pos.y);
      saveZonePosition(pos.id, pos.x, pos.y);
    }

    setDragPosition(null);
    zoneDragRef.current = null;
    setDragging(false);
    document.removeEventListener('mousemove', handleZoneMouseMove);
    document.removeEventListener('mouseup', handleZoneMouseUp);
  };

  // ============================================
  // ZONE RESIZE
  // ============================================

  const handleZoneResizeStart = (e: React.MouseEvent, zone: BoardZone, handle: ResizeHandle) => {
    e.stopPropagation();
    e.preventDefault();
    selectZone(zone.id);

    zoneResizeRef.current = {
      zoneId: zone.id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      zoneStartX: zone.positionX,
      zoneStartY: zone.positionY,
      zoneStartWidth: zone.width,
      zoneStartHeight: zone.height,
    };
    setDragging(true);

    document.addEventListener('mousemove', handleZoneResizeMove);
    document.addEventListener('mouseup', handleZoneResizeEnd);
  };

  const handleZoneResizeMove = (e: MouseEvent) => {
    if (!zoneResizeRef.current) return;

    const ref = zoneResizeRef.current;
    const dx = e.clientX - ref.startX;
    const dy = e.clientY - ref.startY;

    let newX = ref.zoneStartX;
    let newY = ref.zoneStartY;
    let newWidth = ref.zoneStartWidth;
    let newHeight = ref.zoneStartHeight;

    if (ref.handle.includes('e')) {
      newWidth = Math.max(MIN_ZONE_WIDTH, ref.zoneStartWidth + dx);
    }
    if (ref.handle.includes('w')) {
      const widthChange = Math.min(dx, ref.zoneStartWidth - MIN_ZONE_WIDTH);
      newWidth = ref.zoneStartWidth - widthChange;
      newX = ref.zoneStartX + widthChange;
    }
    if (ref.handle.includes('s')) {
      newHeight = Math.max(MIN_ZONE_HEIGHT, ref.zoneStartHeight + dy);
    }
    if (ref.handle.includes('n')) {
      const heightChange = Math.min(dy, ref.zoneStartHeight - MIN_ZONE_HEIGHT);
      newHeight = ref.zoneStartHeight - heightChange;
      newY = ref.zoneStartY + heightChange;
    }

    setResizeState({
      id: ref.zoneId,
      x: Math.max(0, newX),
      y: Math.max(0, newY),
      width: newWidth,
      height: newHeight,
    });
  };

  const handleZoneResizeEnd = () => {
    const resize = resizeStateRef.current;

    if (resize) {
      moveZoneLocal(resize.id, resize.x, resize.y);
      resizeZoneLocal(resize.id, resize.width, resize.height);
      saveZonePosition(resize.id, resize.x, resize.y);
      saveZoneSize(resize.id, resize.width, resize.height);
    }

    setResizeState(null);
    zoneResizeRef.current = null;
    setDragging(false);
    document.removeEventListener('mousemove', handleZoneResizeMove);
    document.removeEventListener('mouseup', handleZoneResizeEnd);
  };

  // ============================================
  // RENDER
  // ============================================

  const allPositions = [
    ...elements.map((e) => ({ x: e.positionX + (e.width || 200), y: e.positionY + (e.height || 150) })),
    ...zones.map((z) => ({ x: z.positionX + z.width, y: z.positionY + z.height })),
  ];
  const canvasWidth = Math.max(1200, ...allPositions.map((p) => p.x + 100));
  const canvasHeight = Math.max(800, ...allPositions.map((p) => p.y + 100));

  const isEmpty = elements.length === 0 && zones.length === 0;
  const showZones = viewMode === 'project';

  return (
    <div className="flex h-full">
      {/* Toolbar gauche 48px */}
      <BoardToolbar
        onAddElement={handleAddElement}
        onToggleViewMode={toggleViewMode}
        viewMode={viewMode}
      />

      {/* Canvas principal */}
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
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Board vide
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md px-4">
              Utilisez la barre d'outils à gauche pour ajouter des éléments :
              notes, palettes, tissus, calculs...
            </p>
          </div>
        ) : (
          <div
            className="relative"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              minWidth: '100%',
              minHeight: '100%',
            }}
          >
            {/* Zones */}
            {zones.map((zone) => {
              const isDragging = dragPosition?.type === 'zone' && dragPosition.id === zone.id;
              const isResizing = resizeState?.id === zone.id;

              const position = isDragging
                ? { x: dragPosition.x, y: dragPosition.y }
                : isResizing
                ? { x: resizeState.x, y: resizeState.y }
                : { x: zone.positionX, y: zone.positionY };

              const size = isResizing
                ? { width: resizeState.width, height: resizeState.height }
                : { width: zone.width, height: zone.height };

              return (
                <ZoneCard
                  key={zone.id}
                  zone={{
                    ...zone,
                    positionX: position.x,
                    positionY: position.y,
                    width: size.width,
                    height: size.height,
                  }}
                  isSelected={selectedZoneId === zone.id}
                  isEditing={editingZoneId === zone.id}
                  isVisible={showZones}
                  onMouseDown={(e) => handleZoneMouseDown(e, zone)}
                  onDoubleClick={() => handleZoneDoubleClick(zone)}
                  onResizeStart={(e, handle) => handleZoneResizeStart(e, zone, handle)}
                  onSaveName={(name) => handleSaveZoneName(zone.id, name)}
                  onCancelEdit={() => setEditingZoneId(null)}
                  onCrystallize={() => setCrystallizingZone(zone)}
                  onDelete={() => handleDeleteZone(zone.id)}
                />
              );
            })}

            {/* Éléments */}
            {elements.map((element) => {
              const pos = dragPosition;
              const position = (pos?.type === 'element' && pos.id === element.id)
                ? { x: pos.x, y: pos.y }
                : { x: element.positionX, y: element.positionY };

              return (
                <ElementCard
                  key={element.id}
                  element={{
                    ...element,
                    positionX: position.x,
                    positionY: position.y,
                  }}
                  isSelected={selectedElementIds.includes(element.id)}
                  isEditing={editingElementId === element.id}
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                  onDoubleClick={() => handleDoubleClick(element)}
                  onSaveNote={(content) => handleSaveNote(element.id, content)}
                  onCancelEdit={() => setEditingElementId(null)}
                  onDelete={() => handleDeleteElement(element.id)}
                />
              );
            })}
          </div>
        )}

        {/* Instructions */}
        {!isEmpty && (
          <div className="
            absolute bottom-4 left-4
            text-xs text-gray-400 dark:text-gray-500
            flex items-center gap-2
            bg-white/80 dark:bg-gray-800/80
            backdrop-blur-sm
            px-3 py-2
            rounded
            border border-gray-200 dark:border-gray-700
          ">
            <MousePointer className="w-3 h-3" />
            Cliquer • Glisser • Double-clic éditer • Suppr supprimer
          </div>
        )}

        {/* View mode indicator */}
        <div className="
          absolute top-4 right-4
          text-xs
          px-2 py-1
          rounded
          bg-white/80 dark:bg-gray-800/80
          backdrop-blur-sm
          border border-gray-200 dark:border-gray-700
          text-gray-500 dark:text-gray-400
        ">
          Mode {viewMode === 'inspiration' ? 'Inspiration' : 'Projet'}
          {viewMode === 'project' && zones.length > 0 && (
            <span className="ml-1 text-gray-400">• {zones.length} zone{zones.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Favorites Sheet */}
      <Sheet open={showFavoritesSheet} onOpenChange={setShowFavoritesSheet}>
        <SheetContent side="right" className="w-100 sm:w-135">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Ajouter un tissu depuis mes favoris
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            {favoritesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Aucun favori pour le moment.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ajoutez des tissus à vos favoris depuis la recherche.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {favorites.map((favorite) => {
                  const textile = favorite.textile;
                  if (!textile) return null;

                  const isOnBoard = textileIdsOnBoard.has(textile.id);
                  const isAdding = addingTextileId === textile.id;

                  return (
                    <div
                      key={favorite.id}
                      className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                        isOnBoard
                          ? 'bg-muted/50 border-muted'
                          : 'bg-background hover:bg-muted/30'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                        {textile.image_url ? (
                          <img
                            src={textile.image_url}
                            alt={textile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Heart className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {textile.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {textile.source_platform}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {textile.price_value && (
                            <span className="text-sm font-medium">
                              {textile.price_value.toFixed(2)} {textile.price_currency || '€'}
                            </span>
                          )}
                          {textile.material_type && (
                            <span className="text-xs text-muted-foreground">
                              • {textile.material_type}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isOnBoard ? (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Check className="w-4 h-4" />
                            <span>Ajouté</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddTextile(favorite)}
                            disabled={isAdding}
                          >
                            {isAdding ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-1" />
                                Ajouter
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      {crystallizingZone && (
        <CrystallizationDialog
          zone={crystallizingZone}
          boardId={boardId}
          isOpen={!!crystallizingZone}
          onClose={() => setCrystallizingZone(null)}
          onSuccess={() => setCrystallizingZone(null)}
        />
      )}

      {/* Pattern Import Modal */}
      <PatternImportModal
        open={showPatternModal}
        onClose={() => setShowPatternModal(false)}
        context="board"
        onAddToBoard={handleAddPatternCalculation}
      />

      {/* Palette Editor Modal */}
      {editingPaletteId && (() => {
        const element = elements.find(e => e.id === editingPaletteId);
        if (!element || element.elementType !== 'palette') return null;
        return (
          <PaletteEditor
  initialData={element.elementData as PaletteElementData}
  boardElements={elements}
  onSave={(data) => handleSavePalette(editingPaletteId, data)}
  onCancel={() => setEditingPaletteId(null)}
/>
        );
      })()}

      {/* Image Upload Modal - Sprint 5 */}
      {showImageModal && (
        <ImageUploadModal
          onSave={handleSaveImage}
          onCancel={() => setShowImageModal(false)}
        />
      )}

      {/* Video Modal - Sprint 5 */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => {
          setShowVideoModal(false);
          setEditingVideoId(null);
        }}
        onSave={handleSaveVideo}
        initialData={
          editingVideoId
            ? (elements.find(e => e.id === editingVideoId)?.elementData as VideoElementData)
            : undefined
        }
      />

      {/* Link Modal - Sprint 5 */}
      <LinkModal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setEditingLinkId(null);
        }}
        onSave={handleSaveLink}
        initialData={
          editingLinkId
            ? (elements.find(e => e.id === editingLinkId)?.elementData as LinkElementData)
            : undefined
        }
      />

     

   {/* PDF Modal - Sprint 6 */}
      <PdfModal
        isOpen={isPdfModalOpen}
        onClose={() => {
          setIsPdfModalOpen(false);
          setEditingPdfId(null);
        }}
        onSave={handleSavePdf}
        initialData={
          editingPdfId
            ? (elements.find(e => e.id === editingPdfId)?.elementData as PdfElementData)
            : undefined
        }
      />

      {/* Pattern Modal - Sprint 6 */}
      <PatternModal
        isOpen={isPatternModalOpen}
        onClose={() => {
          setIsPatternModalOpen(false);
          setEditingPatternId(null);
        }}
        onSave={handleSavePattern}
        initialData={
          editingPatternId
            ? (elements.find(e => e.id === editingPatternId)?.elementData as PatternElementData)
            : undefined
        }
      />

      {/* Silhouette Modal - Sprint 6 */}
      <SilhouetteModal
        isOpen={isSilhouetteModalOpen}
        onClose={() => {
          setIsSilhouetteModalOpen(false);
          setEditingSilhouetteId(null);
        }}
        onSave={handleSaveSilhouette}
        initialData={
          editingSilhouetteId
            ? (elements.find(e => e.id === editingSilhouetteId)?.elementData as SilhouetteElementData)
            : undefined
        }
      />
      
{/* Contextual Search Panel - Sprint B2 */}
<ContextualSearchPanel

  boardId={boardId}
 
  onAddToBoard={async (textile) => {
    const position = {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    };

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

    await addElement({
      elementType: 'textile',
      elementData,
      positionX: position.x,
      positionY: position.y,
    });

    toast.success(`"${textile.name}" ajouté au board`);
  }}
/>
    </div>
  );
}
