# 🎯 Système de Tuning Normalization - Documentation Technique

**Version** : 1.0

**Date** : 27 décembre 2025

**Owner** : Thomas

**ADR** : ADR_004_normalization_tuning_system.md

---

## Table des Matières

1. [Vision Globale](https://claude.ai/chat/dd173dbf-94b5-4721-9cd2-57561c855cc1#vision-globale)
2. [Architecture Système](https://claude.ai/chat/dd173dbf-94b5-4721-9cd2-57561c855cc1#architecture-syst%C3%A8me)
3. [Composants Détaillés](https://claude.ai/chat/dd173dbf-94b5-4721-9cd2-57561c855cc1#composants-d%C3%A9taill%C3%A9s)
4. [Flow de Données](https://claude.ai/chat/dd173dbf-94b5-4721-9cd2-57561c855cc1#flow-de-donn%C3%A9es)
5. [Implémentation Code](https://claude.ai/chat/dd173dbf-94b5-4721-9cd2-57561c855cc1#impl%C3%A9mentation-code)
6. [Roadmap](https://claude.ai/chat/dd173dbf-94b5-4721-9cd2-57561c855cc1#roadmap)
7. [Monitoring &amp; Métriques](https://claude.ai/chat/dd173dbf-94b5-4721-9cd2-57561c855cc1#monitoring--m%C3%A9triques)
8. [Troubleshooting](https://claude.ai/chat/dd173dbf-94b5-4721-9cd2-57561c855cc1#troubleshooting)

---

## Vision Globale

### Objectif

Créer un système hybride de normalisation textile (FR→EN) qui :

* Garantit **95%+ quality** dès MVP
* Coûte **<$10/mois** (décroissant vers $2/mois)
* Nécessite **<30 min/semaine** maintenance
* S'**auto-améliore** progressivement

### Problème Résolu

**Avant** :

```
Quality Score: 70%
Materials détectés: 80%
Colors détectés: 40%
```

**Après** (MVP) :

```
Quality Score: 95%+
Materials détectés: 95%+
Colors détectés: 90%+
```

---

## Architecture Système

### Vue d'Ensemble

```
┌──────────────────────────────────────────────────────────┐
│                   PRODUCTION LAYER                        │
│              (Scraping Temps Réel)                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐         ┌─────────────┐                │
│  │  Textile   │────────▶│ Normalize   │                │
│  │  Brut (FR) │         │  Function   │                │
│  └────────────┘         └──────┬──────┘                │
│                                 │                        │
│                          ┌──────▼──────┐                │
│                          │ Dictionary  │                │
│                          │  Try Match  │                │
│                          └──────┬──────┘                │
│                                 │                        │
│                    ┌────────────┴────────────┐          │
│                    │                         │          │
│               FOUND (85%)              NOT FOUND (15%)  │
│                    │                         │          │
│                    ▼                         ▼          │
│            ┌──────────────┐          ┌─────────────┐   │
│            │ Return Dict  │          │ LLM Fallback│   │
│            │  Value (EN)  │          │  API Call   │   │
│            │   1ms, $0    │          │   2s, $0.003│   │
│            └──────┬───────┘          └──────┬──────┘   │
│                    │                         │          │
│                    │         ┌───────────────┘          │
│                    │         │  Log Unknown             │
│                    │         ▼                           │
│                    │  ┌──────────────┐                  │
│                    │  │ unknown_terms│                  │
│                    │  │   Database   │                  │
│                    │  └──────────────┘                  │
│                    │                                     │
│                    ▼                                     │
│           ┌──────────────────┐                          │
│           │ Normalized (EN)  │                          │
│           │   Insert to DB   │                          │
│           └──────────────────┘                          │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│              SUPERVISION LAYER                            │
│          (Asynchrone, 1-2×/semaine)                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐                                       │
│  │ Review Alert │                                       │
│  │ 20+ unknowns │                                       │
│  └──────┬───────┘                                       │
│         │                                               │
│         ▼                                               │
│  ┌────────────────────┐                                │
│  │ Admin UI /tuning   │                                │
│  │                    │                                │
│  │ • List unknowns    │                                │
│  │ • Batch LLM call   │                                │
│  │ • Review context   │                                │
│  └──────┬─────────────┘                                │
│         │                                               │
│         ▼                                               │
│  ┌────────────────────┐                                │
│  │ Human Decision     │                                │
│  │                    │                                │
│  │ ✓ Approve          │                                │
│  │ ✗ Reject           │                                │
│  │ ✏️ Edit/Custom      │                                │
│  └──────┬─────────────┘                                │
│         │                                               │
│         ▼                                               │
│  ┌────────────────────┐                                │
│  │ Update Dictionary  │                                │
│  │ + Regex patterns   │                                │
│  └──────┬─────────────┘                                │
│         │                                               │
│         ▼                                               │
│  ┌────────────────────┐                                │
│  │ Non-Regression Test│                                │
│  │                    │                                │
│  │ • Re-normalize all │                                │
│  │ • Detect changes   │                                │
│  │ • Show impact      │                                │
│  └──────┬─────────────┘                                │
│         │                                               │
│    ┌────┴────┐                                         │
│    ▼         ▼                                          │
│  [OK]    [ROLLBACK]                                    │
│    │                                                    │
│    ▼                                                    │
│  Deploy                                                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Composants Détaillés

### 1. Dictionnaire de Production

#### Structure Fichier

**Location** : `src/lib/scraping/common/dictionaries/`

```
dictionaries/
├── index.ts              # Export central
├── materials.ts          # Matériaux
├── colors.ts             # Couleurs
├── patterns.ts           # Motifs
└── types.ts              # TypeScript interfaces
```

#### Format Data

```typescript
// types.ts
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
  priority: number;           // Pour résolution conflits
}

export interface Dictionary {
  exact: Record<string, DictionaryEntry>;
  patterns: RegexPattern[];
}
```

```typescript
// materials.ts
import { Dictionary } from './types';

export const materials: Dictionary = {
  exact: {
    // Manuels (Phase 1)
    "coton": {
      value: "cotton",
      source: "manual",
      confidence: 1.0,
      validated_at: "2025-12-27",
      validated_by: "thomas",
      occurrences: 45
    },
  
    "soie": {
      value: "silk",
      source: "manual",
      confidence: 1.0,
      validated_at: "2025-12-27",
      validated_by: "thomas",
      occurrences: 32
    },
  
    // LLM suggested (Phase 2+)
    "lilas": {
      value: "lilac",
      source: "llm_suggested",
      confidence: 0.98,
      validated_at: "2025-12-28",
      validated_by: "thomas",
      notes: "LLM suggestion approved after review"
    },
  
    "bouclette": {
      value: "boucle",
      source: "llm_suggested",
      confidence: 0.92,
      validated_at: "2025-12-28",
      validated_by: "thomas"
    }
  },
  
  // Regex patterns (Phase 5+)
  patterns: [
    {
      regex: /100%?\s*coton/i,
      value: "cotton",
      source: "manual",
      priority: 10
    },
    {
      regex: /(\d+)%?\s*soie/i,
      value: "silk",
      source: "manual",
      priority: 10
    },
    {
      regex: /boucl(e|ette)/i,
      value: "boucle",
      source: "llm_suggested",
      priority: 5
    }
  ]
};
```

#### Fonction Normalize

```typescript
// src/lib/scraping/common/normalize.ts

import { materials, colors, patterns } from './dictionaries';

interface NormalizeOptions {
  enableLLMFallback?: boolean; // Default true en production
  logUnknowns?: boolean;        // Default true
}

export async function extractMaterialType(
  text: string,
  options: NormalizeOptions = {}
): Promise<string | null> {
  
  const { enableLLMFallback = true, logUnknowns = true } = options;
  
  const normalized = text.toLowerCase().trim();
  
  // 1. Try exact match
  if (materials.exact[normalized]) {
    const entry = materials.exact[normalized];
  
    // Update occurrences (optional, for analytics)
    entry.occurrences = (entry.occurrences || 0) + 1;
  
    return entry.value;
  }
  
  // 2. Try regex patterns (sorted by priority)
  const sortedPatterns = [...materials.patterns].sort((a, b) => 
    b.priority - a.priority
  );
  
  for (const pattern of sortedPatterns) {
    if (pattern.regex.test(normalized)) {
      return pattern.value;
    }
  }
  
  // 3. Dictionary miss
  if (enableLLMFallback) {
    // LLM fallback (async)
    const llmResult = await normalizWithLLM(text, 'material');
  
    if (logUnknowns) {
      await logUnknownTerm({
        term: text,
        category: 'material',
        llm_suggestion: llmResult.value,
        llm_confidence: llmResult.confidence
      });
    }
  
    return llmResult.value;
  }
  
  // 4. No fallback → log and return null
  if (logUnknowns) {
    await logUnknownTerm({
      term: text,
      category: 'material'
    });
  }
  
  return null;
}
```

---

### 2. LLM Fallback Service

#### Configuration

```typescript
// src/lib/ai/config.ts

export const LLM_CONFIG = {
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  max_tokens: 300,
  temperature: 0.1, // Low pour déterminisme
  timeout: 5000, // 5s max
  retries: 2
};

export const PROMPT_TEMPLATES = {
  material: `You are a textile terminology expert.

TASK: Translate this French textile term to English.

TERM: "{{term}}"
CATEGORY: material

CONTEXT (if available): "{{context}}"

RULES:
- Use standard textile industry terminology
- Provide the most common English equivalent
- Be concise (1-3 words maximum)
- Consider the textile context

RESPOND in JSON format only:
{
  "value": "english_term",
  "confidence": 0.95,
  "reasoning": "brief explanation"
}

Example:
Input: "lilas clair"
Output: {"value": "light lilac", "confidence": 0.95, "reasoning": "lilas is lilac in French, clair means light"}`,

  color: `You are a textile color expert.

TASK: Translate this French color term to English.

TERM: "{{term}}"
CATEGORY: color

CONTEXT (if available): "{{context}}"

RULES:
- Use standard color names
- Be specific if the term indicates a specific shade
- Keep it concise

RESPOND in JSON format only:
{
  "value": "english_color",
  "confidence": 0.95,
  "reasoning": "brief explanation"
}`,
  
  pattern: `You are a textile pattern expert.

TASK: Translate this French pattern/motif term to English.

TERM: "{{term}}"
CATEGORY: pattern

RULES:
- Use standard textile pattern terminology
- Examples: stripes, floral, geometric, paisley

RESPOND in JSON format only:
{
  "value": "english_pattern",
  "confidence": 0.95,
  "reasoning": "brief explanation"
}`
};
```

#### Service Implementation

```typescript
// src/lib/ai/normalize-llm.ts

import Anthropic from '@anthropic-ai/sdk';
import { LLM_CONFIG, PROMPT_TEMPLATES } from './config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

interface LLMResult {
  value: string;
  confidence: number;
  reasoning: string;
  cost: number; // Pour tracking
}

export async function normalizWithLLM(
  term: string,
  category: 'material' | 'color' | 'pattern',
  context?: string
): Promise<LLMResult> {
  
  // Build prompt from template
  const template = PROMPT_TEMPLATES[category];
  const prompt = template
    .replace('{{term}}', term)
    .replace('{{context}}', context || 'N/A');
  
  try {
    const message = await anthropic.messages.create({
      model: LLM_CONFIG.model,
      max_tokens: LLM_CONFIG.max_tokens,
      temperature: LLM_CONFIG.temperature,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
  
    // Parse response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }
  
    const parsed = JSON.parse(content.text);
  
    // Calculate cost (approximation)
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const cost = (inputTokens * 0.000003) + (outputTokens * 0.000015);
  
    return {
      value: parsed.value,
      confidence: parsed.confidence || 0.9,
      reasoning: parsed.reasoning || '',
      cost
    };
  
  } catch (error) {
    console.error('LLM normalization error:', error);
  
    // Fallback strategy
    return {
      value: term, // Return as-is
      confidence: 0.1,
      reasoning: 'LLM call failed, returning original term',
      cost: 0
    };
  }
}

// Batch version (pour supervision)
export async function normalizeBatch(
  terms: Array<{term: string, category: string, context?: string}>
): Promise<LLMResult[]> {
  
  // Build batch prompt
  const batchPrompt = `You are a textile terminology expert.
Translate these French textile terms to English.

TERMS:
${terms.map((t, i) => `${i+1}. "${t.term}" (${t.category})`).join('\n')}

RESPOND with a JSON array:
[
  {"term": "lilas", "value": "lilac", "confidence": 0.95, "reasoning": "..."},
  {"term": "écru", "value": "ecru", "confidence": 0.98, "reasoning": "..."},
  ...
]`;

  try {
    const message = await anthropic.messages.create({
      model: LLM_CONFIG.model,
      max_tokens: 2000,
      temperature: LLM_CONFIG.temperature,
      messages: [{
        role: 'user',
        content: batchPrompt
      }]
    });
  
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }
  
    const results = JSON.parse(content.text);
  
    // Calculate per-item cost
    const totalCost = (message.usage.input_tokens * 0.000003) + 
                     (message.usage.output_tokens * 0.000015);
    const costPerItem = totalCost / terms.length;
  
    return results.map((r: any) => ({
      ...r,
      cost: costPerItem
    }));
  
  } catch (error) {
    console.error('Batch LLM normalization error:', error);
    return terms.map(t => ({
      value: t.term,
      confidence: 0.1,
      reasoning: 'Batch call failed',
      cost: 0
    }));
  }
}
```

---

### 3. Database Schema

```sql
-- Table pour tracking unknowns
CREATE TABLE deadstock.unknown_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Term info
  term TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('material', 'color', 'pattern')),
  source_platform TEXT, -- 'my_little_coupon', 'the_fabric_sales', etc.
  
  -- Occurrences tracking
  occurrences INT DEFAULT 1,
  first_seen_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  contexts JSONB DEFAULT '[]'::jsonb, -- Array of full text contexts
  
  -- LLM fallback tracking
  llm_suggestion TEXT,
  llm_confidence FLOAT,
  llm_reasoning TEXT,
  llm_cost_total FLOAT DEFAULT 0, -- Cumulative cost in $
  llm_calls_count INT DEFAULT 0,
  
  -- Human review
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'reviewing', 'approved', 'rejected', 'skipped')
  ),
  human_mapping TEXT,
  is_regex BOOLEAN DEFAULT false,
  regex_pattern TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  
  -- Dictionary integration
  added_to_dict BOOLEAN DEFAULT false,
  added_to_dict_at TIMESTAMP,
  dict_type TEXT CHECK (dict_type IN ('exact', 'regex', NULL)),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(term, category)
);

-- Indexes
CREATE INDEX idx_unknown_status ON deadstock.unknown_terms(status);
CREATE INDEX idx_unknown_occurrences ON deadstock.unknown_terms(occurrences DESC);
CREATE INDEX idx_unknown_confidence ON deadstock.unknown_terms(llm_confidence DESC);
CREATE INDEX idx_unknown_category ON deadstock.unknown_terms(category);
CREATE INDEX idx_unknown_platform ON deadstock.unknown_terms(source_platform);

-- Function pour update last_seen_at
CREATE OR REPLACE FUNCTION update_unknown_term_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER unknown_terms_updated_at
  BEFORE UPDATE ON deadstock.unknown_terms
  FOR EACH ROW
  EXECUTE FUNCTION update_unknown_term_timestamp();

-- Table pour regression test snapshots
CREATE TABLE deadstock.normalization_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  dictionary_version TEXT,
  total_textiles INT,
  changes_detected INT,
  changes_detail JSONB,
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP,
  notes TEXT
);

-- Table pour tracking coûts LLM
CREATE TABLE deadstock.llm_cost_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  category TEXT,
  calls_count INT DEFAULT 0,
  total_cost FLOAT DEFAULT 0,
  avg_confidence FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(date, category)
);
```

---

### 4. Logging Service

```typescript
// src/lib/scraping/common/log-unknown.ts

import { createScraperClient } from '@/lib/supabase/client';

interface LogUnknownParams {
  term: string;
  category: 'material' | 'color' | 'pattern';
  source_platform?: string;
  context?: string;
  llm_suggestion?: string;
  llm_confidence?: number;
  llm_reasoning?: string;
  llm_cost?: number;
}

export async function logUnknownTerm(params: LogUnknownParams) {
  const supabase = createScraperClient();
  
  try {
    // Check if already exists
    const { data: existing } = await supabase
      .from('unknown_terms')
      .select('*')
      .eq('term', params.term)
      .eq('category', params.category)
      .single();
  
    if (existing) {
      // Update existing
      const newContexts = existing.contexts || [];
      if (params.context && !newContexts.includes(params.context)) {
        newContexts.push(params.context);
      }
    
      await supabase
        .from('unknown_terms')
        .update({
          occurrences: existing.occurrences + 1,
          last_seen_at: new Date().toISOString(),
          contexts: newContexts,
          llm_suggestion: params.llm_suggestion || existing.llm_suggestion,
          llm_confidence: params.llm_confidence || existing.llm_confidence,
          llm_reasoning: params.llm_reasoning || existing.llm_reasoning,
          llm_cost_total: existing.llm_cost_total + (params.llm_cost || 0),
          llm_calls_count: existing.llm_calls_count + (params.llm_cost ? 1 : 0)
        })
        .eq('id', existing.id);
    } else {
      // Insert new
      await supabase
        .from('unknown_terms')
        .insert({
          term: params.term,
          category: params.category,
          source_platform: params.source_platform,
          contexts: params.context ? [params.context] : [],
          llm_suggestion: params.llm_suggestion,
          llm_confidence: params.llm_confidence,
          llm_reasoning: params.llm_reasoning,
          llm_cost_total: params.llm_cost || 0,
          llm_calls_count: params.llm_cost ? 1 : 0
        });
    }
  
  } catch (error) {
    console.error('Error logging unknown term:', error);
    // Non-blocking, just log
  }
}
```

---

### 5. Interface Supervision

#### API Routes

```typescript
// app/api/admin/tuning/unknowns/route.ts

import { NextResponse } from 'next/server';
import { createScraperClient } from '@/lib/supabase/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';
  const category = searchParams.get('category');
  
  const supabase = createScraperClient();
  
  let query = supabase
    .from('unknown_terms')
    .select('*')
    .eq('status', status)
    .order('occurrences', { ascending: false });
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ unknowns: data });
}

// app/api/admin/tuning/suggest-batch/route.ts

import { NextResponse } from 'next/server';
import { normalizeBatch } from '@/lib/ai/normalize-llm';

export async function POST(request: Request) {
  const { terms } = await request.json();
  
  // Call LLM batch
  const suggestions = await normalizeBatch(terms);
  
  // Update DB avec suggestions
  const supabase = createScraperClient();
  
  for (const suggestion of suggestions) {
    await supabase
      .from('unknown_terms')
      .update({
        llm_suggestion: suggestion.value,
        llm_confidence: suggestion.confidence,
        llm_reasoning: suggestion.reasoning,
        llm_cost_total: sql`llm_cost_total + ${suggestion.cost}`,
        llm_calls_count: sql`llm_calls_count + 1`
      })
      .eq('term', suggestion.term);
  }
  
  return NextResponse.json({ suggestions });
}

// app/api/admin/tuning/approve/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { id, mapping, isRegex, regexPattern } = await request.json();
  
  const supabase = createScraperClient();
  
  // Update unknown_terms
  await supabase
    .from('unknown_terms')
    .update({
      status: 'approved',
      human_mapping: mapping,
      is_regex: isRegex,
      regex_pattern: regexPattern,
      reviewed_at: new Date().toISOString(),
      added_to_dict: true,
      added_to_dict_at: new Date().toISOString(),
      dict_type: isRegex ? 'regex' : 'exact'
    })
    .eq('id', id);
  
  // TODO: Update dictionary file
  // (voir section suivante)
  
  return NextResponse.json({ success: true });
}
```

#### React Component

```tsx
// app/admin/tuning/page.tsx

'use client';

import { useState, useEffect } from 'react';

interface UnknownTerm {
  id: string;
  term: string;
  category: string;
  occurrences: number;
  contexts: string[];
  llm_suggestion: string | null;
  llm_confidence: number | null;
  status: string;
}

export default function TuningPage() {
  const [unknowns, setUnknowns] = useState<UnknownTerm[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadUnknowns();
  }, []);
  
  async function loadUnknowns() {
    const res = await fetch('/api/admin/tuning/unknowns?status=pending');
    const data = await res.json();
    setUnknowns(data.unknowns);
  }
  
  async function getSuggestions() {
    setLoading(true);
  
    const terms = unknowns.map(u => ({
      term: u.term,
      category: u.category,
      context: u.contexts[0]
    }));
  
    await fetch('/api/admin/tuning/suggest-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ terms })
    });
  
    await loadUnknowns(); // Reload avec suggestions
    setLoading(false);
  }
  
  async function approve(id: string, mapping: string, isRegex: boolean = false) {
    await fetch('/api/admin/tuning/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, mapping, isRegex })
    });
  
    await loadUnknowns();
  }
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Tuning Dashboard</h1>
    
      <div className="mb-6">
        <button
          onClick={getSuggestions}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Getting Suggestions...' : '🤖 Get LLM Suggestions for All'}
        </button>
      </div>
    
      <div className="space-y-4">
        {unknowns.map(unknown => (
          <div key={unknown.id} className="border rounded p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">
                  "{unknown.term}" 
                  <span className="text-sm text-gray-500 ml-2">
                    ({unknown.category}, {unknown.occurrences}× occurrences)
                  </span>
                </h3>
              </div>
            </div>
          
            {unknown.contexts.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-600">Contexts:</p>
                <ul className="text-sm list-disc list-inside">
                  {unknown.contexts.slice(0, 2).map((ctx, i) => (
                    <li key={i} className="text-gray-700">{ctx}</li>
                  ))}
                </ul>
              </div>
            )}
          
            {unknown.llm_suggestion && (
              <div className="mb-3 p-2 bg-blue-50 rounded">
                <p className="text-sm font-medium">
                  LLM Suggestion: "{unknown.llm_suggestion}"
                  {unknown.llm_confidence && (
                    <span className="text-gray-600 ml-2">
                      ({(unknown.llm_confidence * 100).toFixed(0)}% confident)
                    </span>
                  )}
                </p>
              </div>
            )}
          
            <div className="flex gap-2">
              <button
                onClick={() => approve(unknown.id, unknown.llm_suggestion!)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                ✅ Approve
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
              >
                ✏️ Edit
              </button>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 6. Tests Non-Régression

```typescript
// scripts/test-regression.ts

import './load-env';
import { createScraperClient } from '../src/lib/supabase/client';
import { extractMaterialType, extractColor } from '../src/lib/scraping/common/normalize';

interface Change {
  textile_id: string;
  name: string;
  field: 'material' | 'color';
  old_value: string | null;
  new_value: string | null;
  impact: 'improvement' | 'regression' | 'lateral';
}

async function runRegressionTest() {
  console.log('🧪 Running Non-Regression Test...\n');
  
  const supabase = createScraperClient();
  
  // 1. Create snapshot
  const snapshotId = await createSnapshot();
  
  // 2. Fetch all textiles
  const { data: textiles, error } = await supabase
    .from('textiles')
    .select('id, name, description, material_type, color');
  
  if (error) {
    console.error('Error fetching textiles:', error);
    return;
  }
  
  console.log(`📊 Testing ${textiles.length} textiles...\n`);
  
  // 3. Re-normalize with current dictionaries
  const changes: Change[] = [];
  
  for (const textile of textiles) {
    const fullText = `${textile.name} ${textile.description || ''}`;
  
    // Re-normalize (without LLM fallback for test)
    const newMaterial = await extractMaterialType(fullText, { 
      enableLLMFallback: false 
    });
    const newColor = await extractColor(fullText, { 
      enableLLMFallback: false 
    });
  
    // Detect changes
    if (textile.material_type !== newMaterial) {
      changes.push({
        textile_id: textile.id,
        name: textile.name,
        field: 'material',
        old_value: textile.material_type,
        new_value: newMaterial,
        impact: classifyChange(textile.material_type, newMaterial)
      });
    }
  
    if (textile.color !== newColor) {
      changes.push({
        textile_id: textile.id,
        name: textile.name,
        field: 'color',
        old_value: textile.color,
        new_value: newColor,
        impact: classifyChange(textile.color, newColor)
      });
    }
  }
  
  // 4. Classify changes
  const improvements = changes.filter(c => c.impact === 'improvement');
  const regressions = changes.filter(c => c.impact === 'regression');
  const laterals = changes.filter(c => c.impact === 'lateral');
  
  // 5. Generate report
  console.log('─'.repeat(60));
  console.log(`\n📋 Regression Test Results:`);
  console.log(`   Total textiles: ${textiles.length}`);
  console.log(`   Unchanged: ${textiles.length - changes.length}`);
  console.log(`   Changed: ${changes.length} (${(changes.length/textiles.length*100).toFixed(1)}%)\n`);
  
  console.log(`   ✅ Improvements: ${improvements.length} (unknown → known)`);
  console.log(`   ❌ Regressions: ${regressions.length} (known → unknown)`);
  console.log(`   🔄 Lateral: ${laterals.length} (value changed)\n`);
  
  // 6. Show regressions details
  if (regressions.length > 0) {
    console.log(`⚠️  REGRESSIONS (review required):\n`);
    regressions.forEach((c, i) => {
      console.log(`${i+1}. "${c.name}"`);
      console.log(`   ${c.field}: "${c.old_value}" → "${c.new_value}"`);
      console.log();
    });
  }
  
  // 7. Save snapshot
  await saveSnapshot(snapshotId, {
    total: textiles.length,
    changes: changes.length,
    improvements: improvements.length,
    regressions: regressions.length,
    changes_detail: changes
  });
  
  // 8. Return result
  return {
    total: textiles.length,
    changes,
    improvements,
    regressions,
    laterals,
    snapshot_id: snapshotId
  };
}

function classifyChange(
  oldValue: string | null, 
  newValue: string | null
): 'improvement' | 'regression' | 'lateral' {
  
  if (oldValue === null && newValue !== null) return 'improvement';
  if (oldValue !== null && newValue === null) return 'regression';
  return 'lateral';
}

async function createSnapshot(): Promise<string> {
  const supabase = createScraperClient();
  
  const { data, error } = await supabase
    .from('normalization_snapshots')
    .insert({
      dictionary_version: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return data.id;
}

async function saveSnapshot(id: string, results: any) {
  const supabase = createScraperClient();
  
  await supabase
    .from('normalization_snapshots')
    .update({
      total_textiles: results.total,
      changes_detected: results.changes,
      changes_detail: results.changes_detail
    })
    .eq('id', id);
}

// Run
runRegressionTest()
  .then(() => console.log('\n✅ Test complete'))
  .catch(err => console.error('\n❌ Test failed:', err));
```

---

## Flow de Données

### Scraping Flow

```
┌────────────────────────────────────────────────┐
│ 1. Scraper starts (daily cron)                │
│                                                │
│    scrape-mlc-to-db.ts                        │
│         ↓                                      │
│    Fetch 500 products from MLC API            │
│         ↓                                      │
│    For each product:                          │
│      - Extract title, description             │
│      - Call normalize(text, 'material')       │
│      - Call normalize(text, 'color')          │
│         ↓                                      │
│    normalize() checks dictionary              │
│         ↓                                      │
│    ┌────Found?────┐                           │
│    ▼              ▼                            │
│   YES            NO                            │
│    │              │                            │
│    │              ├─ Call LLM (2s, $0.003)   │
│    │              ├─ Log to unknown_terms     │
│    │              └─ Return LLM result        │
│    │                                           │
│    └──────────────┬──────────────┘            │
│                   ▼                            │
│    Insert textile with normalized data        │
│                                                │
└────────────────────────────────────────────────┘

Daily stats:
- Dictionary hits: 425/500 (85%)
- LLM fallback: 75/500 (15%)
- Cost: $0.225
- Duration: ~5 minutes
```

### Supervision Flow

```
┌────────────────────────────────────────────────┐
│ Weekly Review (Thomas, 30 minutes)            │
│                                                │
│ 1. Email notification: "20 unknowns pending"  │
│         ↓                                      │
│ 2. Open /admin/tuning                         │
│         ↓                                      │
│ 3. Click "Get LLM Suggestions"                │
│    - Batch call Claude (1 API call)          │
│    - Get 20 suggestions in 3 seconds         │
│    - Cost: $0.05                              │
│         ↓                                      │
│ 4. Review each suggestion:                    │
│    - "lilas" → "lilac" ✓ Approve             │
│    - "écru" → "ecru" ✓ Approve               │
│    - "bouclette" → "boucle" ✏️ Edit to "knit" │
│         ↓                                      │
│ 5. Click "Run Non-Regression Test"            │
│    - Script analyzes 150 textiles            │
│    - Reports: 12 improvements, 0 regressions │
│         ↓                                      │
│ 6. Click "Apply Changes"                      │
│    - Dictionary updated                       │
│    - Database updated                         │
│         ↓                                      │
│ 7. Next scraping uses new dictionary         │
│    - Coverage 85% → 92%                       │
│    - LLM calls reduce 15% → 8%                │
│    - Cost drops $7/month → $3.60/month        │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Roadmap

### Phase 1: MVP Dictionnaire (Cette semaine - 4h) ✅

**Objectif** : Quality 70% → 80%

**Tasks** :

* [X] Table `unknown_terms` SQL
* [X] Dictionnaire JSON (materials, colors)
* [X] Fonction `extractMaterialType()` avec logging
* [X] Script CLI `scripts/analyze-unknowns.ts`
* [X] Enrichir dictionnaire manuellement (10-15 termes)
* [X] Re-scraper MLC

**Résultat** : Fondations système, quality +10%

---

### Phase 2: LLM Fallback Temps Réel (Semaine 2 - 3h)

**Objectif** : Quality 80% → 95%

**Tasks** :

* [ ] Service `normalize-llm.ts`
* [ ] Claude API integration
* [ ] Config prompts templates
* [ ] Update `extractMaterialType()` avec LLM fallback
* [ ] Enhanced logging (llm_suggestion, cost)
* [ ] Monitoring dashboard coûts

**Résultat** : 100% coverage immédiat

---

### Phase 3: Interface Supervision (Semaine 2-3 - 1 jour)

**Objectif** : Workflow humain efficace

**Tasks** :

* [ ] Page `/admin/tuning`
* [ ] API route `/api/admin/tuning/unknowns`
* [ ] API route `/api/admin/tuning/suggest-batch`
* [ ] API route `/api/admin/tuning/approve`
* [ ] React component liste unknowns
* [ ] Batch LLM suggestions button
* [ ] Approve/reject/edit flows

**Résultat** : Review 50 termes en 20 min

---

### Phase 4: Tests Non-Régression (Semaine 3 - 3h)

**Objectif** : Confiance updates

**Tasks** :

* [ ] Script `scripts/test-regression.ts`
* [ ] Snapshot system (DB)
* [ ] Change detection logic
* [ ] Classification (improvement/regression/lateral)
* [ ] Report génération
* [ ] UI confirmation avant apply

**Résultat** : Zero surprises

---

### Phase 5: Regex Patterns (Phase 3 projet - 2 jours)

**Objectif** : Coverage 95% → 98%

**Tasks** :

* [ ] Support regex dans dictionnaires
* [ ] Priority matching system
* [ ] UI regex builder
* [ ] Test regex en temps réel
* [ ] Migration exact → regex patterns

**Résultat** : Gestion patterns complexes

---

### Phase 6: Prompt Tuning (Phase 4+ - Continu)

**Objectif** : Amélioration continue LLM

**Tasks** :

* [ ] Interface édition prompts
* [ ] Template variables
* [ ] A/B testing prompts
* [ ] Analytics accuracy par prompt
* [ ] Version control prompts

**Résultat** : Fine-tuning continu

---

## Monitoring & Métriques

### Dashboard Metrics

```typescript
// Metrics à tracker

interface DailyMetrics {
  date: Date;
  
  // Quality
  quality_score: number;
  materials_detected_pct: number;
  colors_detected_pct: number;
  
  // Coverage
  dictionary_coverage_pct: number; // % hits sans LLM
  llm_fallback_pct: number;
  
  // Costs
  llm_calls_count: number;
  llm_cost_total: number;
  
  // Unknowns
  unknowns_pending: number;
  unknowns_reviewed: number;
  
  // Textiles
  total_textiles: number;
}
```

### Alerts

```typescript
// Alert triggers

const ALERTS = {
  high_cost: {
    condition: (metrics) => metrics.llm_cost_total > 15, // $15/mois
    action: 'Email Thomas: LLM costs high, review unknowns'
  },
  
  low_coverage: {
    condition: (metrics) => metrics.dictionary_coverage_pct < 80,
    action: 'Email Thomas: Dictionary coverage dropping'
  },
  
  pending_review: {
    condition: (metrics) => metrics.unknowns_pending > 50,
    action: 'Email Thomas: 50+ unknowns need review'
  },
  
  quality_drop: {
    condition: (metrics) => metrics.quality_score < 90,
    action: 'Email Thomas: Quality score below 90%'
  }
};
```

---

## Troubleshooting

### Problème 1 : Coûts LLM Trop Élevés

**Symptôme** : >$20/mois après 1 mois

**Causes possibles** :

1. Coverage dictionnaire pas assez augmenté
2. Nouvelle source avec beaucoup unknowns
3. LLM appelé même pour termes connus (bug)

**Debug** :

```sql
-- Check coverage
SELECT 
  COUNT(*) FILTER (WHERE llm_calls_count > 0) as llm_calls,
  COUNT(*) as total,
  (COUNT(*) FILTER (WHERE llm_calls_count > 0)::float / COUNT(*)) * 100 as pct
FROM deadstock.unknown_terms;

-- Check coûts par catégorie
SELECT 
  category,
  SUM(llm_cost_total) as total_cost,
  AVG(llm_confidence) as avg_confidence
FROM deadstock.unknown_terms
GROUP BY category;
```

**Solutions** :

* Review unknowns plus fréquemment
* Enrichir dictionnaire prioritairement termes haute fréquence
* Vérifier pas de bug (LLM appelé inutilement)

---

### Problème 2 : Quality Score Ne Monte Pas

**Symptôme** : Quality reste 85% après enrichissement

**Causes possibles** :

1. Dictionnaire enrichi mais pas déployé
2. Tests non-régression pas appliqués
3. Nouveaux textiles avec nouveaux termes

**Debug** :

```sql
-- Check textiles avec unknowns
SELECT 
  material_type,
  COUNT(*) 
FROM deadstock.textiles 
WHERE material_type IS NULL OR material_type = 'unknown'
GROUP BY material_type;
```

**Solutions** :

* Vérifier dictionnaire déployé
* Re-scraper textiles existants
* Analyser nouveaux unknowns

---

### Problème 3 : LLM Suggestions Mauvaises

**Symptôme** : LLM suggère "purple" au lieu de "lilac"

**Cause** : Prompt pas assez spécifique

**Solution** :

* Améliorer prompt template
* Ajouter examples dans prompt
* Ajuster temperature (plus bas = plus déterministe)

---

**Fin Documentation Technique**

**Version** : 1.0

**Prochaine Révision** : Après Phase 2 (LLM fallback implémenté)
