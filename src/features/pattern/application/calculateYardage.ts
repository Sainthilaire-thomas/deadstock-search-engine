// src/features/pattern/application/calculateYardage.ts

/**
 * Use Case : Calcul de métrage
 * 
 * Calcule le métrage nécessaire pour un projet de couture
 * à partir d'une analyse de patron ou de formules internes.
 */

import type {
  GarmentType,
  PatternConfig,
  YardageCalculationResult,
  YardageTable,
  YardageModifiers,
  YardageForWidth,
  CalculateYardageInput,
} from '../domain/types';
import {
  getBaseYardage,
  getWidthCoefficient,
  STANDARD_FABRIC_WIDTHS,
  MODIFIER_COEFFICIENTS,
} from '../domain/garmentFormulas';

/**
 * Point d'entrée principal du Use Case
 */
export function calculateYardage(input: CalculateYardageInput): YardageCalculationResult {
  const { analysis, config } = input;
  
  // Si on a un tableau extrait avec données valides, l'utiliser
  if (analysis?.hasYardageTable && analysis.yardageTable) {
    return calculateFromTable(analysis.yardageTable, config);
  }
  
  // Sinon, utiliser les formules
  const source = analysis?.detectedGarmentType ? 'formula_specific' : 'formula_generic';
  return calculateFromFormulas(config.garmentType, config, source);
}

/**
 * Calcul depuis un tableau de métrage extrait (précision niveau 1)
 */
function calculateFromTable(
  table: YardageTable,
  config: PatternConfig
): YardageCalculationResult {
  const { 
    garmentType,
    selectedView = 'default', 
    selectedSize, 
    quantity, 
    modifiers, 
    knownFabricWidthCm 
  } = config;
  
  // Récupérer les données du tableau
  const viewData = table.data[selectedView] ?? table.data[Object.keys(table.data)[0]];
  if (!viewData) {
    // Fallback sur formules si pas de données
    return calculateFromFormulas(garmentType, config, 'formula_generic');
  }
  
  const sizeData = viewData[selectedSize];
  if (!sizeData) {
    // Fallback sur formules si taille non trouvée
    return calculateFromFormulas(garmentType, config, 'formula_generic');
  }
  
  // Conversion yards → mètres si nécessaire
  const toMeters = table.unit === 'yards' ? 0.9144 : 1;
  
  // Construire yardageByWidth
  const yardageByWidth: Record<number, number> = {};
  const multiResults: YardageForWidth[] = [];
  
  for (const [widthStr, yardage] of Object.entries(sizeData)) {
    const widthCm = parseInt(widthStr, 10);
    const baseYardage = yardage * toMeters * quantity;
    const withModifiers = applyModifiers(baseYardage, modifiers);
    const recommended = roundUpToHalf(withModifiers);
    
    yardageByWidth[widthCm] = withModifiers;
    multiResults.push({
      fabricWidthCm: widthCm,
      baseYardage,
      withModifiers,
      recommended,
    });
  }
  
  // Trier par largeur
  multiResults.sort((a, b) => a.fabricWidthCm - b.fabricWidthCm);
  
  // Mode single si largeur connue
  if (knownFabricWidthCm && yardageByWidth[knownFabricWidthCm] !== undefined) {
    const baseYardage = sizeData[knownFabricWidthCm] * toMeters * quantity;
    return {
      garmentType,
      size: selectedSize,
      quantity,
      precisionLevel: 1,
      source: 'extracted_table',
      mode: 'single_width',
      singleResult: {
        fabricWidthCm: knownFabricWidthCm,
        baseYardage,
        withModifiers: yardageByWidth[knownFabricWidthCm],
        recommended: roundUpToHalf(yardageByWidth[knownFabricWidthCm]),
      },
      multiResults: [],
      yardageByWidth,
    };
  }
  
  return {
    garmentType,
    size: selectedSize,
    quantity,
    precisionLevel: 1,
    source: 'extracted_table',
    mode: 'multi_width',
    multiResults,
    yardageByWidth,
  };
}

/**
 * Calcul depuis les formules internes (précision niveau 2 ou 3)
 */
function calculateFromFormulas(
  garmentType: GarmentType,
  config: PatternConfig,
  source: 'formula_specific' | 'formula_generic'
): YardageCalculationResult {
  const { selectedSize, quantity, modifiers, knownFabricWidthCm } = config;
  
  // Récupérer le métrage de base pour 140cm
  const baseYardage140 = getBaseYardage(garmentType, selectedSize);
  
  // Calculer pour chaque largeur standard
  const yardageByWidth: Record<number, number> = {};
  const multiResults: YardageForWidth[] = [];
  
  for (const widthCm of STANDARD_FABRIC_WIDTHS) {
    const coefficient = getWidthCoefficient(widthCm);
    const baseYardage = baseYardage140 * coefficient * quantity;
    const withModifiers = applyModifiers(baseYardage, modifiers);
    const recommended = roundUpToHalf(withModifiers);
    
    yardageByWidth[widthCm] = roundUp(withModifiers);
    multiResults.push({
      fabricWidthCm: widthCm,
      baseYardage: roundUp(baseYardage),
      withModifiers: roundUp(withModifiers),
      recommended,
    });
  }
  
  const precisionLevel = source === 'formula_specific' ? 2 : 3;
  
  // Mode single si largeur connue
  if (knownFabricWidthCm) {
    const coefficient = getWidthCoefficient(knownFabricWidthCm);
    const baseYardage = baseYardage140 * coefficient * quantity;
    const withModifiers = applyModifiers(baseYardage, modifiers);
    
    return {
      garmentType,
      size: selectedSize,
      quantity,
      precisionLevel,
      source,
      mode: 'single_width',
      singleResult: {
        fabricWidthCm: knownFabricWidthCm,
        baseYardage: roundUp(baseYardage),
        withModifiers: roundUp(withModifiers),
        recommended: roundUpToHalf(withModifiers),
      },
      multiResults: [],
      yardageByWidth: { [knownFabricWidthCm]: roundUp(withModifiers) },
    };
  }
  
  return {
    garmentType,
    size: selectedSize,
    quantity,
    precisionLevel,
    source,
    mode: 'multi_width',
    multiResults,
    yardageByWidth,
  };
}

/**
 * Applique les modificateurs au métrage de base
 */
function applyModifiers(baseYardage: number, modifiers: YardageModifiers): number {
  let result = baseYardage;
  
  if (modifiers.directional) {
    result *= MODIFIER_COEFFICIENTS.directional;
  }
  if (modifiers.patternMatching) {
    result *= MODIFIER_COEFFICIENTS.patternMatching;
  }
  if (modifiers.safetyMarginPercent > 0) {
    result *= 1 + modifiers.safetyMarginPercent / 100;
  }
  
  return result;
}

/**
 * Arrondi au 0.05m supérieur
 */
function roundUp(value: number): number {
  return Math.ceil(value * 20) / 20;
}

/**
 * Arrondi au 0.5m supérieur (pour recommandation)
 */
function roundUpToHalf(value: number): number {
  return Math.ceil(value * 2) / 2;
}

// ============================================
// HELPER EXPORTS
// ============================================

/**
 * Vérifie si un tissu est suffisant pour un calcul donné
 */
export function isTextileSufficient(
  textileWidthCm: number,
  textileQuantityM: number,
  yardageByWidth: Record<number, number>
): { sufficient: boolean; needed: number; available: number } {
  let needed = yardageByWidth[textileWidthCm];
  
  if (needed === undefined) {
    needed = interpolateYardage(yardageByWidth, textileWidthCm);
  }
  
  return {
    sufficient: textileQuantityM >= needed,
    needed,
    available: textileQuantityM,
  };
}

/**
 * Interpole le métrage pour une largeur non standard
 */
function interpolateYardage(
  yardageByWidth: Record<number, number>,
  targetWidth: number
): number {
  const widths = Object.keys(yardageByWidth).map(Number).sort((a, b) => a - b);
  
  if (widths.length === 0) return 0;
  if (widths.length === 1) return yardageByWidth[widths[0]];
  
  if (targetWidth <= widths[0]) return yardageByWidth[widths[0]];
  if (targetWidth >= widths[widths.length - 1]) return yardageByWidth[widths[widths.length - 1]];
  
  const lowerIdx = widths.findIndex(w => w > targetWidth) - 1;
  const lower = widths[lowerIdx];
  const upper = widths[lowerIdx + 1];
  
  const ratio = (targetWidth - lower) / (upper - lower);
  return yardageByWidth[lower] + ratio * (yardageByWidth[upper] - yardageByWidth[lower]);
}
