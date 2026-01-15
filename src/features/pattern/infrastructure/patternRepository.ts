// src/features/pattern/infrastructure/patternRepository.ts

/**
 * Repository pour les patrons importés
 * Conforme ADR-017 (Unified Repositories)
 */

import { createClient } from '@/lib/supabase/server';
import type { 
  ImportedPattern, 
  PatternAnalysisResult,
  SavePatternInput 
} from '../domain/types';

// ============================================
// TYPES
// ============================================

interface PatternRow {
  id: string;
  user_id: string | null;
  session_id: string | null;
  name: string;
  brand: string | null;
  garment_type: string | null;
  file_url: string | null;
  file_type: string | null;
  file_size_bytes: number | null;
  page_count: number | null;
  analysis_result: Record<string, unknown> | null;
  precision_level: number | null;
  confidence: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// MAPPERS
// ============================================

function mapRowToPattern(row: PatternRow): ImportedPattern {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    sessionId: row.session_id ?? undefined,
    name: row.name,
    brand: row.brand ?? undefined,
    garmentType: row.garment_type as ImportedPattern['garmentType'],
    fileUrl: row.file_url ?? '',
    fileType: (row.file_type as 'pdf' | 'image') ?? 'pdf',
    fileSizeBytes: row.file_size_bytes ?? undefined,
    pageCount: row.page_count ?? undefined,
    analysisResult: row.analysis_result 
      ? (row.analysis_result as unknown as PatternAnalysisResult) 
      : undefined,
    precisionLevel: row.precision_level as 1 | 2 | 3 | undefined,
    confidence: row.confidence ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ============================================
// REPOSITORY
// ============================================

export const patternRepository = {
  /**
   * Get all patterns for a session
   */
  async getBySession(userId: string): Promise<ImportedPattern[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('imported_patterns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching patterns:', error);
      throw error;
    }
    
    return (data || []).map(mapRowToPattern);
  },

  /**
   * Get a single pattern by ID
   */
  async getById(id: string, userId: string): Promise<ImportedPattern | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('imported_patterns')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching pattern:', error);
      throw error;
    }
    
    return data ? mapRowToPattern(data) : null;
  },

  /**
   * Save a new pattern
   */
  async save(input: SavePatternInput): Promise<ImportedPattern> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('imported_patterns')
      .insert({
        session_id: input.sessionId,
        name: input.name,
        brand: input.brand,
        file_url: input.fileUrl,
        file_type: input.fileType,
        analysis_result: input.analysisResult,
        precision_level: input.analysisResult?.precisionLevel,
        confidence: input.analysisResult?.confidence,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving pattern:', error);
      throw error;
    }
    
    return mapRowToPattern(data);
  },

  /**
   * Update pattern analysis result
   */
  async updateAnalysis(
    id: string, 
    userId: string,
    analysisResult: PatternAnalysisResult
  ): Promise<ImportedPattern | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('imported_patterns')
      .update({
        analysis_result: analysisResult,
        precision_level: analysisResult.precisionLevel,
        confidence: analysisResult.confidence,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating pattern:', error);
      throw error;
    }
    
    return data ? mapRowToPattern(data) : null;
  },

  /**
   * Delete a pattern
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('imported_patterns')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting pattern:', error);
      throw error;
    }
    
    return true;
  },

  /**
   * Count patterns for a session
   */
  async countBySession(userId: string): Promise<number> {
    const supabase = await createClient();
    
    const { count, error } = await supabase
      .from('imported_patterns')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error counting patterns:', error);
      throw error;
    }
    
    return count || 0;
  },
};
