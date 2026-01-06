// src/features/pattern/index.ts

/**
 * Pattern Import Module
 * 
 * Provides pattern analysis and yardage calculation
 * for the Deadstock Search Engine.
 */

// Domain
export * from './domain/types';
export * from './domain/garmentFormulas';

// Application
export { calculateYardage, isTextileSufficient } from './application/calculateYardage';

// Infrastructure
export { patternRepository } from './infrastructure/patternRepository';

// Components
export { PatternImportModal } from './components/PatternImportModal';
export { PatternConfigForm } from './components/PatternConfigForm';
export { ManualPatternForm } from './components/ManualPatternForm';
export { YardageResult } from './components/YardageResult';
export { PatternCalculationCard } from './components/PatternCalculationCard';
