/**
 * Domain Entity: UnknownTerm
 * 
 * Représente un terme non reconnu lors de la normalisation
 * Contient les règles métier pour le tracking et la review
 */

import { Category, CategoryType } from './DictionaryMapping';
import type { UserId } from './types';

export type UnknownTermStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'skipped';

/**
 * Entity: UnknownTerm
 */
export class UnknownTerm {
  constructor(
    public readonly id: string,
    public readonly term: string,
    public readonly category: Category,
    public occurrences: number,
    public contexts: string[],
    public status: UnknownTermStatus,
    public sourcePlatform?: string,
    public llmSuggestion?: string,
    public llmConfidence?: number,
    public humanMapping?: string,
    public reviewedBy?: UserId,
    public reviewedAt?: Date,
    public reviewNotes?: string
  ) {
    this.validate();
  }
  
  /**
   * Business Rule: Validation
   */
  private validate(): void {
    if (this.term.trim().length === 0) {
      throw new Error('Term cannot be empty');
    }
    
    if (this.occurrences < 0) {
      throw new Error('Occurrences cannot be negative');
    }
    
    if (this.llmConfidence !== undefined) {
      if (this.llmConfidence < 0 || this.llmConfidence > 1) {
        throw new Error('LLM confidence must be between 0 and 1');
      }
    }
  }
  
  /**
   * Business Method: Incrémenter occurrences
   */
  incrementOccurrence(context?: string): void {
    this.occurrences += 1;
    
    // Ajouter contexte si fourni et pas déjà présent
    if (context && !this.contexts.includes(context)) {
      // Limiter à 10 contextes max
      if (this.contexts.length < 10) {
        this.contexts.push(context);
      }
    }
  }
  
  /**
   * Business Method: Marquer comme en cours de review
   */
  startReview(): void {
    if (this.status !== 'pending') {
      throw new Error('Can only start review for pending terms');
    }
    
    this.status = 'reviewing';
  }
  
  /**
   * Business Method: Approuver avec mapping
   */
  approve(mapping: string, by: UserId, notes?: string): void {
    if (this.status !== 'pending' && this.status !== 'reviewing') {
      throw new Error('Can only approve pending or reviewing terms');
    }
    
    if (mapping.trim().length === 0) {
      throw new Error('Mapping cannot be empty');
    }
    
    this.status = 'approved';
    this.humanMapping = mapping;
    this.reviewedBy = by;
    this.reviewedAt = new Date();
    this.reviewNotes = notes;
  }
  
  /**
   * Business Method: Rejeter
   */
  reject(by: UserId, notes?: string): void {
    if (this.status !== 'pending' && this.status !== 'reviewing') {
      throw new Error('Can only reject pending or reviewing terms');
    }
    
    this.status = 'rejected';
    this.reviewedBy = by;
    this.reviewedAt = new Date();
    this.reviewNotes = notes;
  }
  
  /**
   * Business Method: Skip (ignorer pour l'instant)
   */
  skip(): void {
    if (this.status !== 'pending' && this.status !== 'reviewing') {
      throw new Error('Can only skip pending or reviewing terms');
    }
    
    this.status = 'skipped';
  }
  
  /**
   * Business Method: Ajouter suggestion LLM
   */
  addLLMSuggestion(suggestion: string, confidence: number): void {
    if (confidence < 0 || confidence > 1) {
      throw new Error('LLM confidence must be between 0 and 1');
    }
    
    this.llmSuggestion = suggestion;
    this.llmConfidence = confidence;
  }
  
  /**
   * Business Query: Est-ce un unknown fréquent ?
   */
  isFrequent(): boolean {
    return this.occurrences >= 5;
  }
  
  /**
   * Business Query: A-t-il une suggestion LLM fiable ?
   */
  hasReliableLLMSuggestion(): boolean {
    return this.llmConfidence !== undefined && this.llmConfidence >= 0.9;
  }
  
  /**
   * Business Query: Est-il prêt pour review ?
   */
  isReadyForReview(): boolean {
    return this.status === 'pending' && this.occurrences >= 1;
  }
}
