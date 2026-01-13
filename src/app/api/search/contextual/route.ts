// src/app/api/search/contextual/route.ts
// Sprint B2 - Recherche contextuelle depuis les boards

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { findMatchingColors, getMatchingColorNames } from '@/lib/color';

// ============================================================================
// Validation Schema
// ============================================================================

const ContextualSearchRequestSchema = z.object({
  // Source de la recherche (pour analytics/traçabilité)
  source: z.object({
    type: z.enum(['palette_color', 'textile', 'calculation']),
    elementId: z.string().optional(),
    boardId: z.string().optional(),
  }).optional(),
  
  // Contraintes de recherche
  constraints: z.object({
    // Recherche par couleur HEX
    colors: z.object({
      hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      minConfidence: z.number().min(0).max(100).optional().default(20),
    }).optional(),
    
    // Recherche par noms de couleurs directement
    colorNames: z.array(z.string()).optional(),
    
    // Filtre fibre/matière
    fiber: z.string().optional(),
    
    // Filtre weave
    weave: z.string().optional(),
    
    // Quantité minimum en mètres
    minQuantity: z.number().positive().optional(),
    
    // Inclure cut_to_order même sans quantité suffisante
    includeCutToOrder: z.boolean().optional().default(true),
  }),
  
  // Pagination
  pagination: z.object({
    limit: z.number().min(1).max(100).optional().default(20),
    offset: z.number().min(0).optional().default(0),
  }).optional(),
  
  // Tri
  sort: z.object({
    field: z.enum(['created_at', 'price_value', 'quantity_value', 'name']).optional().default('created_at'),
    direction: z.enum(['asc', 'desc']).optional().default('desc'),
  }).optional(),
});

export type ContextualSearchRequest = z.infer<typeof ContextualSearchRequestSchema>;

// ============================================================================
// Response Types
// ============================================================================

interface TextileWithMatch {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  source_url: string;
  price_value: number | null;
  price_currency: string;
  price_per_meter: number | null;
  sale_type: string | null;
  quantity_value: number | null;
  quantity_unit: string | null;
  width_value: number | null;
  fiber: string | null;
  color: string | null;
  pattern: string | null;
  weave: string | null;
  available: boolean;
  supplier_name: string | null;
  // Match info
  colorMatch?: {
    matchedColor: string;
    confidence: number;
  };
  // Sufficiency info
  sufficiency?: {
    sufficient: boolean;
    reason: string;
  };
}

interface ColorAggregation {
  color: string;
  count: number;
  totalMeters: number;
}

interface ContextualSearchResponse {
  results: TextileWithMatch[];
  total: number;
  aggregations: {
    byColor: ColorAggregation[];
    sufficientCount: number;
    insufficientCount: number;
  };
  // Couleurs DB utilisées pour la recherche
  searchedColors: string[];
}

// ============================================================================
// Helper Functions
// ============================================================================

function checkSufficiency(
  textile: { sale_type: string | null; quantity_value: number | null },
  minQuantity: number | undefined
): { sufficient: boolean; reason: string } {
  if (!minQuantity) {
    return { sufficient: true, reason: 'Pas de contrainte métrage' };
  }

  switch (textile.sale_type) {
    case 'cut_to_order':
      return { sufficient: true, reason: 'Coupe à la demande' };
    
    case 'fixed_length':
    case 'hybrid':
      if (textile.quantity_value !== null && textile.quantity_value >= minQuantity) {
        return { 
          sufficient: true, 
          reason: `${textile.quantity_value}m disponibles` 
        };
      }
      return { 
        sufficient: false, 
        reason: `${textile.quantity_value ?? 0}m < ${minQuantity}m requis` 
      };
    
    case 'by_piece':
      return { 
        sufficient: false, 
        reason: 'Vente à la pièce (métrage non applicable)' 
      };
    
    default:
      // Si pas de sale_type, on vérifie juste la quantité
      if (textile.quantity_value !== null && textile.quantity_value >= minQuantity) {
        return { sufficient: true, reason: `${textile.quantity_value}m disponibles` };
      }
      return { 
        sufficient: false, 
        reason: 'Stock inconnu' 
      };
  }
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request
    const body = await request.json();
    const parsed = ContextualSearchRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    
    const { constraints, pagination, sort } = parsed.data;
    const limit = pagination?.limit ?? 20;
    const offset = pagination?.offset ?? 0;
    
    // 2. Determine colors to search
    let searchColors: string[] = [];
    
    if (constraints.colorNames && constraints.colorNames.length > 0) {
      // Direct color names provided
      searchColors = constraints.colorNames;
    } else if (constraints.colors?.hex) {
      // Convert HEX to matching database colors
      searchColors = getMatchingColorNames(
        constraints.colors.hex,
        constraints.colors.minConfidence ?? 20
      );
    }
    
    // 3. Build query
    const supabase = await createClient();
    
    let query = supabase
      .schema('deadstock')
      .from('textiles_search')
      .select('*', { count: 'exact' });
    
    // Filter by colors
    if (searchColors.length > 0) {
      query = query.in('color', searchColors);
    }
    
    // Filter by fiber
    if (constraints.fiber) {
      query = query.eq('fiber', constraints.fiber);
    }
    
    // Filter by weave
    if (constraints.weave) {
      query = query.eq('weave', constraints.weave);
    }
    
    // Filter by quantity (only for non cut_to_order if specified)
    // We'll filter cut_to_order separately to always include them
    if (constraints.minQuantity && !constraints.includeCutToOrder) {
      query = query.gte('quantity_value', constraints.minQuantity);
    }
    
    // Only available textiles
    query = query.eq('available', true);
    
    // Sorting
    const sortField = sort?.field ?? 'created_at';
    const sortDir = sort?.direction ?? 'desc';
    query = query.order(sortField, { ascending: sortDir === 'asc' });
    
    // Pagination
    query = query.range(offset, offset + limit - 1);
    
    // 4. Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Contextual search error:', error);
      return NextResponse.json(
        { error: 'Search failed', details: error.message },
        { status: 500 }
      );
    }
    
    // 5. Get color matches info (if searching by HEX)
    const colorMatches = constraints.colors?.hex
      ? findMatchingColors(constraints.colors.hex, { maxResults: 5 })
      : [];
    
    // 6. Process results with sufficiency check
    const results: TextileWithMatch[] = (data || []).map(textile => {
      const sufficiency = checkSufficiency(textile, constraints.minQuantity);
      
      // Find color match info
      const colorMatch = colorMatches.find(m => m.color === textile.color);
      
      return {
        id: textile.id,
        name: textile.name,
        description: textile.description,
        image_url: textile.image_url,
        source_url: textile.source_url,
        price_value: textile.price_value,
        price_currency: textile.price_currency || 'EUR',
        price_per_meter: textile.price_per_meter,
        sale_type: textile.sale_type,
        quantity_value: textile.quantity_value,
        quantity_unit: textile.quantity_unit,
        width_value: textile.width_value,
        fiber: textile.fiber,
        color: textile.color,
        pattern: textile.pattern,
        weave: textile.weave,
        available: textile.available,
        supplier_name: textile.supplier_name,
        colorMatch: colorMatch ? {
          matchedColor: colorMatch.color,
          confidence: colorMatch.confidence,
        } : undefined,
        sufficiency,
      };
    });
    
    // 7. Filter by sufficiency if minQuantity is set (post-query for cut_to_order logic)
    let filteredResults = results;
    if (constraints.minQuantity && constraints.includeCutToOrder) {
      // Keep sufficient OR cut_to_order
      filteredResults = results.filter(r => 
        r.sufficiency?.sufficient || r.sale_type === 'cut_to_order'
      );
    }
    
    // 8. Calculate aggregations
    const byColorMap = new Map<string, { count: number; totalMeters: number }>();
    let sufficientCount = 0;
    let insufficientCount = 0;
    
    for (const textile of results) {
      // Color aggregation
      if (textile.color) {
        const existing = byColorMap.get(textile.color) || { count: 0, totalMeters: 0 };
        byColorMap.set(textile.color, {
          count: existing.count + 1,
          totalMeters: existing.totalMeters + (textile.quantity_value || 0),
        });
      }
      
      // Sufficiency aggregation
      if (textile.sufficiency?.sufficient) {
        sufficientCount++;
      } else {
        insufficientCount++;
      }
    }
    
    const byColor: ColorAggregation[] = Array.from(byColorMap.entries())
      .map(([color, stats]) => ({ color, ...stats }))
      .sort((a, b) => b.count - a.count);
    
    // 9. Return response
    const response: ContextualSearchResponse = {
      results: filteredResults,
      total: count || results.length,
      aggregations: {
        byColor,
        sufficientCount,
        insufficientCount,
      },
      searchedColors: searchColors,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Contextual search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
