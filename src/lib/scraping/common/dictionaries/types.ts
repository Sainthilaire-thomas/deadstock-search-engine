export interface DictionaryEntry {
  value: string;              // Traduction EN
  source: 'manual' | 'llm_suggested' | 'user_feedback';
  confidence: number;         // 0-1
  validated_at: string;       // ISO date
  validated_by: string;       // User ID
  occurrences?: number;       // Combien de fois utilisé
  notes?: string;             // Notes humain
}

export interface RegexPattern {
  regex: RegExp;
  value: string;
  source: string;
  priority: number;
}

export interface Dictionary {
  exact: Record<string, DictionaryEntry>;
  patterns: RegexPattern[]; // Phase 5+, vide pour MVP
}
