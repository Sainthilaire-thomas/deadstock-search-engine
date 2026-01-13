// src/app/api/colors/available/route.ts
// Retourne les couleurs qui ont des tissus disponibles dans la base

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .schema('deadstock')
      .from('textiles_search')
      .select('color')
      .eq('available', true)
      .not('color', 'is', null);

    if (error) {
      console.error('Error fetching available colors:', error);
      return NextResponse.json(
        { error: 'Failed to fetch colors' },
        { status: 500 }
      );
    }

    // Extraire les couleurs uniques et compter
    const colorCounts = new Map<string, number>();
    for (const row of data || []) {
      if (row.color) {
        colorCounts.set(row.color, (colorCounts.get(row.color) || 0) + 1);
      }
    }

    // Convertir en array trié par count
    const colors = Array.from(colorCounts.entries())
      .map(([color, count]) => ({ color, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      colors: colors.map(c => c.color),
      colorCounts: colors,
    });

  } catch (error) {
    console.error('Error in available colors API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
