// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchTextiles } from '@/features/search/application/searchTextiles';
import type { SearchFilters } from '@/features/search/domain/types';

interface SearchRequestBody extends SearchFilters {
  page?: number;
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequestBody = await request.json();
    
    // Extraire pagination du body
    const { page, limit, ...filters } = body;
    
    const result = await searchTextiles(filters, { page, limit });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search textiles' },
      { status: 500 }
    );
  }
}
