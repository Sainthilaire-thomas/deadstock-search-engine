/**
 * Infrastructure: Unknowns Repository
 * 
 * Accès aux données des unknown terms dans Supabase
 */

import { createScraperClient } from '@/lib/supabase/client';
import { UnknownTerm, UnknownTermStatus } from '../domain/UnknownTerm';
import { Category, CategoryType } from '../domain/DictionaryMapping';

interface FindAllFilters {
  status?: UnknownTermStatus;
  category?: CategoryType;
  minOccurrences?: number;
  limit?: number;
}

/**
 * Repository pour les unknown terms
 */
export const unknownsRepo = {
  
  /**
   * Récupérer un unknown par ID
   */
  async getById(id: string): Promise<UnknownTerm | null> {
    const supabase = createScraperClient();
    
    const { data, error } = await supabase
      .from('unknown_terms')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get unknown by id: ${error.message}`);
    }
    
    return this.toDomain(data);
  },
  
  /**
   * Récupérer tous les unknowns avec filtres
   */
  async findAll(filters: FindAllFilters = {}): Promise<UnknownTerm[]> {
    const supabase = createScraperClient();
    
    let query = supabase
      .from('unknown_terms')
      .select('*');
    
    // Filtres
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.minOccurrences) {
      query = query.gte('occurrences', filters.minOccurrences);
    }
    
    // Tri par occurrences desc (les plus fréquents en premier)
    query = query.order('occurrences', { ascending: false });
    
    // Limite
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to find unknowns: ${error.message}`);
    }
    
    if (!data) return [];
    
    return data.map(row => this.toDomain(row));
  },
  
  /**
   * Sauvegarder/Mettre à jour un unknown
   */
  async update(unknown: UnknownTerm): Promise<void> {
    const supabase = createScraperClient();
    
    const row = this.toDatabase(unknown);
    
    const { error } = await supabase
      .from('unknown_terms')
      .update(row)
      .eq('id', unknown.id);
    
    if (error) {
      throw new Error(`Failed to update unknown: ${error.message}`);
    }
  },
  
 /**
   * Logger un nouveau unknown ou incrémenter occurrences
   * Context peut être un objet JSON avec product_id, image, url
   */
  async logOrIncrement(
    term: string,
    category: CategoryType,
    context?: string,
    sourcePlatform?: string,
    productId?: string,
    imageUrl?: string,
    productUrl?: string
  ): Promise<string> {
    const supabase = createScraperClient();
    
    // Créer un contexte enrichi si on a image/url
    let enrichedContext = context || term;
    
    if (productId || imageUrl || productUrl) {
      enrichedContext = JSON.stringify({
        text: context || term,
        product_id: productId,
        image: imageUrl,
        url: productUrl
      });
    }
    
    const { data, error } = await supabase.rpc('increment_unknown_occurrence', {
      p_term: term,
      p_category: category,
      p_context: enrichedContext,
      p_source_platform: sourcePlatform || null
    });
    
    if (error) {
      throw new Error(`Failed to log unknown: ${error.message}`);
    }
    
    return data; // Returns UUID
  },
  
  /**
   * Compter les unknowns par statut
   */
  async countByStatus(): Promise<Record<UnknownTermStatus, number>> {
    const supabase = createScraperClient();
    
    const { data, error } = await supabase
      .from('unknown_terms')
      .select('status');
    
    if (error) {
      throw new Error(`Failed to count unknowns: ${error.message}`);
    }
    
    if (!data) {
      return {
        pending: 0,
        reviewing: 0,
        approved: 0,
        rejected: 0,
        skipped: 0
      };
    }
    
    // Count par status
    const counts: Record<string, number> = {};
    data.forEach(row => {
      counts[row.status] = (counts[row.status] || 0) + 1;
    });
    
    return {
      pending: counts.pending || 0,
      reviewing: counts.reviewing || 0,
      approved: counts.approved || 0,
      rejected: counts.rejected || 0,
      skipped: counts.skipped || 0
    };
  },
  
  // --- Mappers ---
  
  /**
   * Mapper DB row → Domain Entity
   */
  toDomain(row: any): UnknownTerm {
    return new UnknownTerm(
      row.id,
      row.term,
      new Category(row.category as CategoryType),
      row.occurrences,
      row.contexts || [],
      row.status as UnknownTermStatus,
      row.source_platform || undefined,
      row.llm_suggestion || undefined,
      row.llm_confidence || undefined,
      row.human_mapping || undefined,
      row.reviewed_by || undefined,
      row.reviewed_at ? new Date(row.reviewed_at) : undefined,
      row.review_notes || undefined
    );
  },
  
  /**
   * Mapper Domain Entity → DB row
   */
  toDatabase(unknown: UnknownTerm): any {
    return {
      term: unknown.term,
      category: unknown.category.value,
      occurrences: unknown.occurrences,
      contexts: unknown.contexts,
      status: unknown.status,
      source_platform: unknown.sourcePlatform || null,
      llm_suggestion: unknown.llmSuggestion || null,
      llm_confidence: unknown.llmConfidence || null,
      human_mapping: unknown.humanMapping || null,
      reviewed_by: unknown.reviewedBy || null,
      reviewed_at: unknown.reviewedAt ? unknown.reviewedAt.toISOString() : null,
      review_notes: unknown.reviewNotes || null,
      updated_at: new Date().toISOString()
    };
  }
};
