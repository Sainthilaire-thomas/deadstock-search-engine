import { createScraperClient } from '@/lib/supabase/client';

interface LogUnknownParams {
  term: string;
  category: 'material' | 'color' | 'pattern';
  source_platform?: string;
  context?: string;
}

export async function logUnknownTerm(params: LogUnknownParams) {
  const supabase = createScraperClient();
  
  try {
    // Use helper function from SQL migration
    const { data, error } = await supabase
      .rpc('increment_unknown_occurrence', {
        p_term: params.term,
        p_category: params.category,
        p_context: params.context || null,
        p_source_platform: params.source_platform || null
      });
    
    if (error) {
      console.error('Error logging unknown term:', error);
    }
    
  } catch (error) {
    console.error('Error logging unknown term:', error);
    // Non-blocking, just log
  }
}
