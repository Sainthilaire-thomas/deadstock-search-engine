/**
 * Infrastructure: Textile Repository
 * 
 * Accès aux données des textiles dans Supabase
 */

import { createScraperClient } from '@/shared/infrastructure/supabase/client';
import { Textile } from '../domain/Textile';

/**
 * Repository pour les textiles
 */
export const textileRepo = {
  
  /**
   * Sauvegarder un textile (upsert par source_url)
   */
  async save(textile: Textile): Promise<void> {
    const supabase = createScraperClient();
    
    const row = this.toDatabase(textile);
    
    const { error } = await supabase
      .from('textiles')
      .upsert(row, {
        onConflict: 'source_url',
        ignoreDuplicates: false
      });
    
    if (error) {
      throw new Error(`Failed to save textile: ${error.message}`);
    }
  },
  
  /**
   * Récupérer un textile par source_url
   */
  async findBySourceUrl(sourceUrl: string): Promise<Textile | null> {
    const supabase = createScraperClient();
    
    const { data, error } = await supabase
      .from('textiles')
      .select('*')
      .eq('source_url', sourceUrl)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to find textile: ${error.message}`);
    }
    
    return this.toDomain(data);
  },
  
  /**
   * Récupérer tous les textiles
   */
  async findAll(): Promise<Textile[]> {
    const supabase = createScraperClient();
    
    const { data, error } = await supabase
      .from('textiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to get textiles: ${error.message}`);
    }
    
    if (!data) return [];
    
    return data.map(row => this.toDomain(row));
  },
  
  // --- Mappers ---
  
  /**
   * Mapper DB row → Domain Entity
   */
  toDomain(row: any): Textile {
    return new Textile(
      row.id,
      row.name,
      row.description || '',
      row.material_type,
      row.color,
      row.composition,
      row.quantity_value,
      row.quantity_unit,
      row.price_value,
      row.price_currency,
      row.source_platform,
      row.source_url,
      row.source_product_id,
      row.supplier_name,
      row.available,
      row.image_url,
      row.raw_data,
      row.created_at ? new Date(row.created_at) : undefined,
      row.updated_at ? new Date(row.updated_at) : undefined
    );
  },
  
  /**
   * Mapper Domain Entity → DB row
   */
  toDatabase(textile: Textile): any {
    return {
      name: textile.name,
      description: textile.description,
      material_type: textile.materialType,
      color: textile.color,
      composition: textile.composition,
      quantity_value: textile.quantityValue,
      quantity_unit: textile.quantityUnit,
      price_value: textile.priceValue,
      price_currency: textile.priceCurrency,
      source_platform: textile.sourcePlatform,
      source_url: textile.sourceUrl,
      source_product_id: textile.sourceProductId,
      supplier_name: textile.supplierName,
      available: textile.available,
      image_url: textile.imageUrl,
      raw_data: textile.rawData
    };
  }
};
