// src/app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { searchTextiles } from '@/features/search/application/searchTextiles';
import type { SearchFilters } from '@/features/search/domain/types';

export async function POST(request: NextRequest) {
  try {
    const filters: SearchFilters = await request.json();
    
    const result = await searchTextiles(filters);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search textiles' },
      { status: 500 }
    );
  }
}
