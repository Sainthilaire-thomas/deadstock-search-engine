/**
 * Infrastructure: Dictionary Repository
 * 
 * Accès aux données des mappings dictionnaire dans Supabase
 * Version 2.0: i18n-ready with dynamic categories
 */

import { createScraperClient } from '@/shared/infrastructure/supabase/client';
import { DictionaryMapping, Category, CategoryType, SourceType } from '../domain/DictionaryMapping';
import type { Locale } from '../domain/types';

/**
 * Repository pour les mappings dictionnaire
 */
export const dictionaryRepo = {
  
  /**
   * Récupérer tous les mappings d'une catégorie
   */
  async getByCategory(category: CategoryType, sourceLocale?: Locale): Promise<DictionaryMapping[]> {
    const supabase = createScraperClient();
    
    // Get category_id from slug
    const { data: categoryData } = await supabase
      .from('attribute_categories')
      .select('id')
      .eq('slug', category)
      .single();
    
    if (!categoryData) return [];
    
    let query = supabase
      .from('dictionary_mappings')
      .select(`
        *,
        attribute_categories!category_id (
          slug
        )
      `)
      .eq('category_id', categoryData.id)
      .order('source_term', { ascending: true });
    
    if (sourceLocale) {
      query = query.eq('source_locale', sourceLocale);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to get dictionary by category: ${error.message}`);
    }
    
    if (!data) return [];
    
    return data.map(row => this.toDomain(row));
  },
  
  /**
   * Récupérer tous les mappings
   */
  async getAll(): Promise<DictionaryMapping[]> {
    const supabase = createScraperClient();
    
    const { data, error } = await supabase
      .from('dictionary_mappings')
      .select(`
        *,
        attribute_categories!category_id (
          slug
        )
      `)
      .order('source_locale', { ascending: true })
      .order('source_term', { ascending: true });
    
    if (error) {
      throw new Error(`Failed to get all dictionaries: ${error.message}`);
    }
    
    if (!data) return [];
    
    return data.map(row => this.toDomain(row));
  },
  
  /**
   * Rechercher un mapping par terme, locale et catégorie
   */
  async findByTerm(
    source_term: string, 
    source_locale: Locale, 
    category: CategoryType
  ): Promise<DictionaryMapping | null> {
    const supabase = createScraperClient();
    
    // Get category_id from slug
    const { data: categoryData } = await supabase
      .from('attribute_categories')
      .select('id')
      .eq('slug', category)
      .single();
    
    if (!categoryData) return null;
    
    const { data, error } = await supabase
      .from('dictionary_mappings')
      .select(`
        *,
        attribute_categories!category_id (
          slug
        )
      `)
      .eq('source_term', source_term.toLowerCase().trim())
      .eq('source_locale', source_locale)
      .eq('category_id', categoryData.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to find mapping: ${error.message}`);
    }
    
    return this.toDomain(data);
  },
  
  /**
   * Sauvegarder un mapping
   */
  async save(mapping: DictionaryMapping): Promise<void> {
    const supabase = createScraperClient();
    
    const row = this.toDatabase(mapping);
    
    const { error } = await supabase
      .from('dictionary_mappings')
      .upsert(row, {
        onConflict: 'source_term,source_locale,category_id'
      });
    
    if (error) {
      throw new Error(`Failed to save mapping: ${error.message}`);
    }
  },
  
  /**
   * Supprimer un mapping
   */
  async delete(id: string): Promise<void> {
    const supabase = createScraperClient();
    
    const { error } = await supabase
      .from('dictionary_mappings')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Failed to delete mapping: ${error.message}`);
    }
  },
  
  /**
   * Incrémenter le compteur d'usage
   */
  async incrementUsage(id: string): Promise<void> {
    const supabase = createScraperClient();
    
    const { error } = await supabase.rpc('increment_mapping_usage', {
      p_mapping_id: id
    });
    
    if (error) {
      throw new Error(`Failed to increment usage: ${error.message}`);
    }
  },
  
  // --- Mappers ---
  
  /**
   * Mapper DB row → Domain Entity
   */
  toDomain(row: any): DictionaryMapping {
    // Extract category slug from joined table or fallback to old column
    const categorySlug = row.attribute_categories?.slug || row.category || 'fiber';
    
    return new DictionaryMapping(
      row.id,
      row.source_term,
      row.source_locale as Locale,
      row.translations,
      new Category(categorySlug as CategoryType),
      row.source as SourceType,
      row.confidence,
      new Date(row.validated_at),
      row.validated_by,
      row.notes || undefined,
      row.usage_count || 0
    );
  },
  
  /**
   * Mapper Domain Entity → DB row
   */
  toDatabase(mapping: DictionaryMapping): any {
    // Get category_id from slug (will need to be async or pre-fetched)
    // For now, we'll need to handle this in save() method
    return {
      id: mapping.id,
      source_term: mapping.source_term,
      source_locale: mapping.source_locale,
      translations: mapping.translations,
      // category_id will be set in save() method after looking up slug
      source: mapping.source,
      confidence: mapping.confidence,
      validated_at: mapping.validatedAt.toISOString(),
      validated_by: mapping.validatedBy,
      notes: mapping.notes || null,
      usage_count: mapping.usageCount
    };
  }
};
