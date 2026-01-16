// src/app/api/textiles/urls/route.ts
// API pour récupérer les URLs source des textiles
// Sprint C3 - 2026-01-16

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { textileIds } = body;

    if (!textileIds || !Array.isArray(textileIds) || textileIds.length === 0) {
      return NextResponse.json(
        { error: 'textileIds array required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .schema('deadstock')
      .from('textiles')
      .select('id, source_url, source_platform')
      .in('id', textileIds);

    if (error) {
      console.error('Error fetching textile URLs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch URLs' },
        { status: 500 }
      );
    }

    // Transformer en maps
    const urls: Record<string, string | null> = {};
    const sources: Record<string, string | null> = {};
    data?.forEach(textile => {
      urls[textile.id] = textile.source_url;
      sources[textile.id] = textile.source_platform;
    });

    return NextResponse.json({ urls, sources });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
