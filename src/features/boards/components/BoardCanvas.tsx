// src/features/boards/components/BoardCanvas.tsx
// VERSION REFACTORISÉE - Hooks et composants extraits

'use client';

import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Layout, MousePointer } from 'lucide-react';
import { toast } from 'sonner';

import { useBoard } from '../context/BoardContext';
import { useContextualSearchPanel } from '../context/ContextualSearchContext';
import { useTransform, ZOOM_MIN, ZOOM_MAX } from '../context/TransformContext';
import { BoardToolbar } from './BoardToolbar';
import { ZoneCard } from './ZoneCard';
import { ElementCard } from './ElementCard';
import { ContextualSearchPanel } from './ContextualSearchPanel';
import { ZoomControls } from './ZoomControls';

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
import { AutoArrangeDialog, type AutoArrangeDialogResult } from './AutoArrangeDialog';
import { autoArrangeByPhase, calculatePhaseBounds, type ArrangeOptions, type PhaseBounds } from '../utils/autoArrange';
import { PhaseColumns } from './PhaseColumns';
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
const { transform, setScale, zoomToFit } = useTransform();

const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // ============================================
  // PAN MODE STATE (Space+Drag)
  // ============================================
  const [isPanMode, setIsPanMode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  // ============================================
  // ZOOM HANDLER (Ctrl+Scroll)
  // ============================================
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, transform.scale + delta));
      // Arrondir à 2 décimales pour éviter les erreurs de floating point
      setScale(Math.round(newScale * 100) / 100);
    }
  }, [transform.scale, setScale]);

  // Attacher l'event wheel avec passive: false pour permettre preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // ============================================
  // PAN MODE HANDLERS (Space+Drag)
  // ============================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && 
          !(e.target instanceof HTMLInputElement) && 
          !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsPanMode(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPanMode(false);
        setIsPanning(false);
        panStartRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handlePanMouseDown = useCallback((e: React.MouseEvent) => {
    if (isPanMode && canvasRef.current) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: canvasRef.current.scrollLeft,
        scrollTop: canvasRef.current.scrollTop,
      };
    }
  }, [isPanMode]);

  const handlePanMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && panStartRef.current && canvasRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      canvasRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
      canvasRef.current.scrollTop = panStartRef.current.scrollTop - dy;
    }
  }, [isPanning]);

  const handlePanMouseUp = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

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

// Auto-arrange state (Sprint P2)
  const [showAutoArrangeDialog, setShowAutoArrangeDialog] = useState(false);
  const [isArranging, setIsArranging] = useState(false);
  const [arrangeTargets, setArrangeTargets] = useState<Map<string, { x: number; y: number }> | null>(null);
  
  // Phase columns state (Sprint P2.5)
  const [phaseBounds, setPhaseBounds] = useState<PhaseBounds[]>([]);
  const [showPhaseColumns, setShowPhaseColumns] = useState(false);

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
    scale: transform.scale,
    moveElementLocal,
    saveElementPosition,
    toggleElementSelection,
    clearSelection,
    setDragging,
  });

const {
    dragPosition: zoneDragPosition,
    zoneDragElementPositions,
    draggingZoneId,
    draggingElementIds,
    draggingElementCount,
    handleZoneMouseDown
  } = useZoneDrag({
    scale: transform.scale,
    elements,
    moveZoneLocal,
    saveZonePosition,
    moveElementLocal,
    selectZone,
    setDragging,
  });

const { resizeState, handleZoneResizeStart } = useZoneResize({
    scale: transform.scale,
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

  // Callback mémorisé pour ContextualSearchPanel (REACT-3)
  const handleAddTextileToBoard = useCallback(async (textile: { 
    id: string; 
    name: string; 
    supplier_name?: string | null; 
    price_value?: number | null; 
    price_currency?: string | null; 
    image_url?: string | null; 
    quantity_value?: number | null; 
    fiber?: string | null; 
    color?: string | null; 
  }) => {
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
  }, [addElement]);

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
    // Ne pas traiter le clic si on est en mode pan
    if (isPanMode) return;
    
    if (e.target === canvasRef.current) {
      clearSelection();
      setEditingElementId(null);
      setEditingZoneId(null);
      setEditingPaletteId(null);
    }
 }, [clearSelection, isPanMode]);

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
  // AUTO-ARRANGE HANDLER (Sprint P2)
  // ============================================
  const handleAutoArrange = useCallback(async (options: AutoArrangeDialogResult) => {
    const { showPhaseColumns: shouldShowColumns, ...arrangeOptions } = options;
    
    // Calculer les nouvelles positions
    const result = autoArrangeByPhase(elements, zones, arrangeOptions);
    
    if (result.elementMoves.length === 0 && result.zoneMoves.length === 0) {
      return;
    }
    
    // Créer la map des positions cibles pour l'animation
    const targets = new Map<string, { x: number; y: number }>();
    
    // Éléments libres
    for (const move of result.elementMoves) {
      targets.set(move.id, { x: move.x, y: move.y });
    }
    
    // Zones + calculer le delta pour les éléments à l'intérieur
    for (const move of result.zoneMoves) {
      const zone = zones.find(z => z.id === move.id);
      if (!zone) continue;
      
      targets.set(`zone-${move.id}`, { x: move.x, y: move.y });
      
      // Calculer le delta de déplacement de la zone
      const deltaX = move.x - zone.positionX;
      const deltaY = move.y - zone.positionY;
      
      // Trouver les éléments dans cette zone et les déplacer avec elle
      for (const element of elements) {
        const inX = element.positionX >= zone.positionX && 
                    element.positionX < zone.positionX + zone.width;
        const inY = element.positionY >= zone.positionY && 
                    element.positionY < zone.positionY + zone.height;
        
        if (inX && inY && !targets.has(element.id)) {
          targets.set(element.id, {
            x: element.positionX + deltaX,
            y: element.positionY + deltaY,
          });
        }
      }
    }
    
    // Démarrer l'animation
    setArrangeTargets(targets);
    setIsArranging(true);
    
    // Attendre la fin de l'animation CSS (500ms)
    await new Promise(resolve => setTimeout(resolve, 550));
    
    // Appliquer les positions finales et sauvegarder en DB
    // D'abord les éléments libres
    for (const move of result.elementMoves) {
      moveElementLocal(move.id, move.x, move.y);
      saveElementPosition(move.id, move.x, move.y);
    }
    
    // Ensuite les zones
    for (const move of result.zoneMoves) {
      const zone = zones.find(z => z.id === move.id);
      if (!zone) continue;
      
      moveZoneLocal(move.id, move.x, move.y);
      saveZonePosition(move.id, move.x, move.y);
      
      // Déplacer les éléments dans la zone
      const deltaX = move.x - zone.positionX;
      const deltaY = move.y - zone.positionY;
      
      for (const element of elements) {
        const inX = element.positionX >= zone.positionX && 
                    element.positionX < zone.positionX + zone.width;
        const inY = element.positionY >= zone.positionY && 
                    element.positionY < zone.positionY + zone.height;
        
        if (inX && inY) {
          const newX = element.positionX + deltaX;
          const newY = element.positionY + deltaY;
          moveElementLocal(element.id, newX, newY);
          saveElementPosition(element.id, newX, newY);
        }
      }
    }
    
    // Calculer et stocker les bounds des phases pour l'affichage des colonnes
    const bounds = calculatePhaseBounds(result, elements, zones, arrangeOptions);
    setPhaseBounds(bounds);
    setShowPhaseColumns(shouldShowColumns);
    
    // Terminer l'animation
    setIsArranging(false);
    setArrangeTargets(null);
    
    toast.success('Éléments rangés par phase');
  }, [elements, zones, moveElementLocal, saveElementPosition, moveZoneLocal, saveZonePosition]);
  // ============================================
  // RENDER CALCULATIONS
  // ============================================
  const allPositions = [
    ...elements.map((e) => ({ x: e.positionX + (e.width || 200), y: e.positionY + (e.height || 150) })),
    ...zones.map((z) => ({ x: z.positionX + z.width, y: z.positionY + z.height })),
  ];
 const baseCanvasWidth = Math.max(1200, ...allPositions.map((p) => p.x + 100));
  const baseCanvasHeight = Math.max(800, ...allPositions.map((p) => p.y + 100));
  // Dimensions ajustées pour le zoom
  const canvasWidth = baseCanvasWidth * transform.scale;
  const canvasHeight = baseCanvasHeight * transform.scale;
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
        onAutoArrange={() => setShowAutoArrangeDialog(true)}
      />

     <div
        ref={canvasRef}
        className={`flex-1 relative overflow-auto bg-gray-100 dark:bg-gray-700 ${
          isPanMode ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''
        }`}
        onClick={handleCanvasClick}
        onMouseDown={handlePanMouseDown}
        onMouseMove={handlePanMouseMove}
        onMouseUp={handlePanMouseUp}
        onMouseLeave={handlePanMouseUp}
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
          <div 
            className="relative" 
            style={{ 
              width: canvasWidth, 
              height: canvasHeight, 
              minWidth: '100%', 
              minHeight: '100%' 
            }}
          >
          {/* Contenu zoomable */}
            <div
              ref={contentRef}
              className="absolute origin-top-left"
              style={{
                transform: `scale(${transform.scale})`,
                width: baseCanvasWidth,
                height: baseCanvasHeight,
              }}
            >
            {/* Phase Columns Background (Sprint P2.5) */}
            <PhaseColumns
              phaseBounds={phaseBounds}
              canvasHeight={baseCanvasHeight}
              isVisible={showPhaseColumns && viewMode === 'project'}
            />
            
            {/* Zones */}
            {zones.map((zone) => {
              const isDragging = zoneDragPosition?.id === zone.id;
              const isResizing = resizeState?.id === zone.id;
              
              // Animation auto-arrange (Sprint P2)
              const arrangeTarget = isArranging ? arrangeTargets?.get(`zone-${zone.id}`) : null;
              
              const position = arrangeTarget
                ? { x: arrangeTarget.x, y: arrangeTarget.y }
                : isDragging
                ? { x: zoneDragPosition.x, y: zoneDragPosition.y }
                : isResizing
                ? { x: resizeState.x, y: resizeState.y }
                : { x: zone.positionX, y: zone.positionY };
              const size = isResizing
                ? { width: resizeState.width, height: resizeState.height }
                : { width: zone.width, height: zone.height };

              // Ghost Mode: déterminer si cette zone est en cours de drag
              const isBeingDragged = draggingZoneId === zone.id;
              const ghostElementCount = isBeingDragged ? draggingElementCount : 0;

             return (
                <ZoneCard
                  key={zone.id}
                  zone={{ ...zone, positionX: position.x, positionY: position.y, width: size.width, height: size.height }}
                  isSelected={selectedZoneId === zone.id}
                  style={isArranging && arrangeTarget ? {
                    transition: 'left 0.5s ease-out, top 0.5s ease-out',
                  } : undefined}
                  isEditing={editingZoneId === zone.id}
                  isVisible={showZones}
                  isDragging={isBeingDragged}
                  ghostElementCount={ghostElementCount}
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
              // Ghost Mode: masquer les éléments pendant le drag de zone
              const isHiddenDuringZoneDrag = draggingElementIds.includes(element.id);
              if (isHiddenDuringZoneDrag) return null;

              // Animation auto-arrange (Sprint P2)
              const arrangeTarget = isArranging ? arrangeTargets?.get(element.id) : null;

              const individualDragPos = elementDragPosition?.id === element.id ? { x: elementDragPosition.x, y: elementDragPosition.y } : null;
              const zoneDragPos = zoneDragElementPositions[element.id];
              const position = arrangeTarget 
                ? { x: arrangeTarget.x, y: arrangeTarget.y }
                : individualDragPos || zoneDragPos || { x: element.positionX, y: element.positionY };

              return (
                <ElementCard
                  key={element.id}
                  element={{ ...element, positionX: position.x, positionY: position.y }}
                  isSelected={selectedElementIds.includes(element.id)}
                  isEditing={editingElementId === element.id}
                  style={isArranging && arrangeTarget ? {
                    transition: 'left 0.5s ease-out, top 0.5s ease-out',
                  } : undefined}
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                  onDoubleClick={() => handleDoubleClick(element)}
                  onSaveNote={(content) => handleSaveNote(element.id, content)}
                  onCancelEdit={() => setEditingElementId(null)}
                  onDelete={() => removeElement(element.id)}
                />
              );
            })}
            </div>
            {/* Fin du contenu zoomable */}
          </div>
        )}

        {/* Instructions */}
        {!isEmpty && (
          <div className="absolute bottom-4 left-4 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded border border-gray-200 dark:border-gray-700">
            <MousePointer className="w-3 h-3" />
            Cliquer • Glisser • Double-clic éditer • Suppr supprimer
          </div>
        )}
       {/* Zoom Controls */}
        <ZoomControls
          onRequestFit={() => {
            if (elements.length === 0 && zones.length === 0) return;
            
            const allItems = [
              ...elements.map(e => ({ x: e.positionX, y: e.positionY, w: e.width || 200, h: e.height || 150 })),
              ...zones.map(z => ({ x: z.positionX, y: z.positionY, w: z.width, h: z.height })),
            ];
            
            const contentBounds = {
              minX: Math.min(...allItems.map(i => i.x)),
              minY: Math.min(...allItems.map(i => i.y)),
              maxX: Math.max(...allItems.map(i => i.x + i.w)),
              maxY: Math.max(...allItems.map(i => i.y + i.h)),
              width: 0,
              height: 0,
            };
            contentBounds.width = contentBounds.maxX - contentBounds.minX;
            contentBounds.height = contentBounds.maxY - contentBounds.minY;
            
            zoomToFit(contentBounds);
          }}
        />

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

  {/* Auto-Arrange Dialog (Sprint P2) */}
      {showAutoArrangeDialog && (
        <AutoArrangeDialog
          isOpen={showAutoArrangeDialog}
          onClose={() => setShowAutoArrangeDialog(false)}
          onConfirm={handleAutoArrange}
          elements={elements}
          zones={zones}
          initialShowPhaseColumns={showPhaseColumns}
        />
      )}

    {/* Contextual Search Panel */}
      <ContextualSearchPanel
        boardId={boardId}
        onAddToBoard={handleAddTextileToBoard}
      />
    </div>
  );
}
