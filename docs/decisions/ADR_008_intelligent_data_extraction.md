# ADR-008: Intelligent Data Extraction from Source Platforms

**Date**: 2024-12-28  
**Status**: Accepted  
**Context**: Phase 1 - MVP Development  
**Authors**: Thomas

---

## Context

### Current Problem

Le système actuel envoie **tout le texte brut** (title + description) au normalizationService, qui :
- Ne trouve souvent rien dans le dictionnaire (trop de bruit)
- Retourne tout le texte comme `unknown` au lieu d'extraire les termes spécifiques
- Crée des unknowns inutilisables : `"(Chute) CREPE DE CHINE 100% SOIE, Rising Red\n\nDécouvrez..."`
- Force des appels LLM coûteux même pour des données structurées disponibles

### Example Data from Shopify API

```json
{
  "title": "(Chute) CREPE DE CHINE 100% SOIE, Rising Red",
  "tags": "100% Soie, 2.7M, silk, Soie, Uni, Print, tissu soie",
  "body_html": "<p>couleur rouge éclatante...</p>"
}
```

**Constat** : Les données sont **déjà structurées** dans l'API mais nous les ignorons !

---

## Decision

### Phase 1 (Court-Terme) : Smart Parsing dans l'Adapter

**Implémentation immédiate** : Parser intelligemment les données Shopify AVANT normalisation.

#### Architecture

```
MyLittleCouponAdapter
  ↓
parseShopifyProduct(raw)
  ├─ parseTags(tags) → materials[], patterns[]
  ├─ parseTitle(title) → colors[]
  └─ Return ExtractedTerms
  ↓
normalizeTextile(extractedTerms)
  ├─ Dict check pour chaque terme extrait
  └─ LLM fallback uniquement si dict ne trouve pas
```

#### Extraction Rules (MLC-Specific)

**Materials** (depuis tags) :
- Pattern : `/\d+%?\s*(soie|coton|laine|lin|viscose|polyester)/i`
- Exemples : "100% Soie" → "soie", "silk" → "soie"

**Colors** (depuis title) :
- Pattern : Texte après la dernière virgule
- Exemple : "CREPE DE CHINE, Rising Red" → "Rising Red"

**Patterns** (depuis tags) :
- Keywords : "Uni", "Print", "Rayures", "Fleurs", "Abstrait"
- Direct match dans tags

**Fallback** :
- Si aucun terme extrait → LLM avec texte complet

---

### Phase 2 (Long-Terme) : Pattern Analysis System

**Vision** : Système intelligent qui analyse automatiquement les patterns Shopify de chaque source.

#### Components

##### 1. Pattern Analyzer
```typescript
// Analyse N produits d'une source et détecte les patterns
interface PatternAnalysisResult {
  source: string;
  patterns: {
    materials: ExtractionPattern[];
    colors: ExtractionPattern[];
    patterns: ExtractionPattern[];
  };
  confidence: number;
  sampleSize: number;
}

interface ExtractionPattern {
  field: 'tags' | 'title' | 'options' | 'variants' | 'metafields';
  regex?: string;
  position?: 'after_comma' | 'first_word' | 'in_brackets';
  keywords?: string[];
  confidence: number;
  examples: string[];
}
```

**Workflow** :
1. Fetch 50-100 produits de la source
2. Analyser les structures JSON (quels champs contiennent quoi)
3. Détecter les patterns récurrents
4. Générer des règles d'extraction
5. Calculer confidence score

##### 2. Rules Engine
```typescript
// Moteur qui applique les règles détectées
class ExtractionRulesEngine {
  private rules: Map<string, SourceRules>;
  
  async extract(
    product: RawProduct, 
    source: string
  ): Promise<ExtractedTerms> {
    const rules = this.rules.get(source);
    
    return {
      materials: this.applyRules(product, rules.materials),
      colors: this.applyRules(product, rules.colors),
      patterns: this.applyRules(product, rules.patterns)
    };
  }
}
```

##### 3. Learning System
```typescript
// Améliore les règles basé sur feedback utilisateur
interface FeedbackLoop {
  // Quand user approuve un unknown
  onApproval(unknown: UnknownTerm, mapping: DictionaryMapping): void;
  
  // Analyse si on aurait pu extraire ce terme
  suggestNewPattern(source: string, field: string): ExtractionPattern;
  
  // Update confidence des règles existantes
  updateConfidence(pattern: ExtractionPattern, success: boolean): void;
}
```

#### Storage

```sql
-- Table pour stocker les règles d'extraction par source
CREATE TABLE deadstock.extraction_rules (
  id UUID PRIMARY KEY,
  source TEXT NOT NULL,
  category TEXT NOT NULL, -- material/color/pattern
  field TEXT NOT NULL,    -- tags/title/options...
  pattern_type TEXT,      -- regex/keyword/position
  pattern_value TEXT,     -- La règle elle-même
  confidence FLOAT,       -- 0-1
  success_count INT,      -- Nombre de succès
  failure_count INT,      -- Nombre d'échecs
  last_tested_at TIMESTAMP,
  created_at TIMESTAMP,
  
  UNIQUE(source, category, field, pattern_value)
);

-- Table pour tracking pattern analysis
CREATE TABLE deadstock.pattern_analysis_runs (
  id UUID PRIMARY KEY,
  source TEXT NOT NULL,
  products_analyzed INT,
  patterns_discovered INT,
  avg_confidence FLOAT,
  run_at TIMESTAMP
);
```

---

## Consequences

### Phase 1 (Court-Terme)

**Positives** :
- ✅ Unknowns contiennent **termes spécifiques** : "Rising Red" au lieu de tout le texte
- ✅ Réduction appels LLM de ~70% (dict trouve dans tags)
- ✅ Quality normalization +30% immédiatement
- ✅ Interface tuning utilisable (unknowns courts)

**Négatives** :
- ⚠️ Règles hard-codées spécifiques à MLC
- ⚠️ À refaire pour chaque nouvelle source

### Phase 2 (Long-Terme)

**Positives** :
- ✅ Auto-scaling : Nouvelles sources automatiquement analysées
- ✅ Self-improving : Apprend des validations utilisateur
- ✅ Multi-source : TFS, Recovo auto-configurés
- ✅ Maintenance minimale : Règles se mettent à jour

**Négatives** :
- ⚠️ Complexité accrue
- ⚠️ Besoin de 50+ produits par source pour analyse
- ⚠️ Risk de sur-fit si patterns changent

---

## Implementation Plan

### Phase 1 : Smart Parsing (1-2 jours)

1. **Créer `ExtractedTerms` interface**
2. **Refactor `MyLittleCouponAdapter`**
   - `parseTags()` method
   - `parseTitle()` method
   - Return structured data
3. **Modifier `normalizeTextile()`**
   - Accepter `ExtractedTerms` au lieu de fullText
   - Itérer sur termes extraits
4. **Modifier `normalizationService`**
   - Chercher termes spécifiques (pas tout le texte)
5. **Update `unknownsRepo.logOrIncrement()`**
   - Stocker terme FR simple, pas contexte complet

### Phase 2 : Pattern Analyzer (2-3 semaines)

1. **Créer `PatternAnalyzer` service**
   - Fetch N produits
   - Analyze JSON structures
   - Detect recurring patterns
2. **Créer `ExtractionRulesEngine`**
   - Load rules from DB
   - Apply rules to products
3. **Créer interface admin**
   - View detected patterns
   - Approve/reject patterns
   - Test patterns on samples
4. **Feedback loop**
   - Update confidence on approvals
   - Suggest new patterns

### Phase 3 : Learning System (1+ mois)

1. **ML-based pattern detection** (optionnel)
2. **A/B testing extraction strategies**
3. **Cross-source pattern transfer**

---

## Alternatives Considered

### Alternative 1 : LLM-Only Extraction
**Rejected** : Coût trop élevé (~$0.01 par produit × 1000 produits/jour = $10/jour)

### Alternative 2 : Manual Rules per Source
**Rejected** : Non-scalable, maintenance lourde pour 15+ sources

### Alternative 3 : Computer Vision on Product Images
**Rejected** : Trop complexe, API Shopify suffit

---

## Success Metrics

### Phase 1
- Quality normalization : 63% → 85%+
- Unknown term length : <50 chars (vs 500+ actuellement)
- LLM calls reduction : -70%
- Time to review unknown : 30s → 10s

### Phase 2
- Auto-configuration new sources : <30 min (vs 2+ heures manuel)
- Pattern confidence : >90% après 100 produits
- Cross-source reusability : 40% patterns réutilisables
- Maintenance time : -80%

---

## References

- ADR-006: Product Context Enrichment
- ADR-007: Adapter Pattern for Scrapers
- Shopify Products API: https://shopify.dev/docs/api/admin-rest/2024-01/resources/product

---

## Notes

Cette architecture en 2 phases permet :
1. **Quick win** immédiat (Phase 1) pour débloquer le MVP
2. **Long-term vision** (Phase 2) pour scalabilité future

Le Pattern Analysis System n'est PAS critique pour le MVP mais sera essentiel quand on passera à 10+ sources.

---

**Status** : Accepted  
**Next Actions** : Implémenter Phase 1 - Smart Parsing dans MyLittleCouponAdapter
