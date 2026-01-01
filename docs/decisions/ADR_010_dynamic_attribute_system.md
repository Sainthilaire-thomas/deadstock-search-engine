# ADR-010: Dynamic Textile Attribute System

**Date**: 2024-12-28  
**Status**: Accepted  
**Context**: Phase 2 - Multi-Sources Implementation  
**Authors**: Thomas

---

## Context

### Current Problem

**Système actuel** : 3 catégories **hard-codées** dans le code
```typescript
type TermCategory = 'material' | 'color' | 'pattern';
```

**Limitations** :
- ❌ Impossible d'ajouter catégories sans redéployer code
- ❌ "Pattern" mélange vrais motifs + weave + finitions
- ❌ Pas de hiérarchie (ex: Weave > Twill > Herringbone Twill)
- ❌ Pas de gestion admin des catégories
- ❌ Normalisation limitée : beaucoup d'infos perdues

**Observation critique** (Thomas) :
> "Beaucoup de patterns scrappés ressemblent à des materials"
→ Twill, Satin, Poplin = **Weave**, pas Pattern
→ Stretch, Glossy = **Properties/Finish**, pas Pattern

### Vision Produit

**Le but de l'appli** : Normaliser descriptions textile entre sites deadstock
→ Besoin de **catégoriser précisément** tous les attributs textiles
→ Système doit être **extensible** pour ajouter catégories futures

---

## Decision

### Architecture : Dynamic Attribute System

**Principe** : Les catégories d'attributs sont **data, pas code**.

```
Catégories stockées en DB → Admin peut modifier → Scraping s'adapte automatiquement
```

---

## Textile Attributes Taxonomy (Exhaustif)

### Catégories Identifiées

#### 1. FIBER / MATERIAL ✅
**Définition** : Composition matière du tissu (fibre)
**Exemples** : 
- Naturelles : Silk, Cotton, Wool, Linen
- Synthétiques : Polyester, Nylon, Acrylic, Viscose
- Mélanges : "80% Cotton 20% Elastane"

**Priorité** : 🔴 MVP (Essentielle)

---

#### 2. COLOR ✅
**Définition** : Couleur dominante du tissu
**Exemples** : 
- Basiques : Black, White, Red, Blue, Green
- Nuances : Navy Blue, Sky Blue, Burgundy, Beige
- Spéciaux : Multicolor, Rainbow, Metallic Gold

**Priorité** : 🔴 MVP (Essentielle)

---

#### 3. WEAVE / CONSTRUCTION 🆕
**Définition** : Type de tissage ou construction du tissu
**Exemples** :
- Tissages basiques : Plain, Twill, Satin
- Tissages complexes : Jacquard, Dobby
- Tricot : Jersey, Rib, Interlock
- Structures : Crepe, Chiffon, Organza, Taffeta, Velvet, Poplin

**Sous-catégories** :
- Twill > Herringbone Twill, Cavalry Twill
- Satin > Duchesse Satin, Charmeuse

**Priorité** : 🟠 MVP (Différenciateur fort)

---

#### 4. PATTERN 🔄 (Redéfini)
**Définition** : Motif visuel répété sur le tissu
**Exemples** :
- Uni : Solid/Plain
- Géométriques : Striped, Checked/Plaid, Polka Dots, Geometric
- Organiques : Floral, Paisley, Animal Print
- Abstraits : Abstract, Tie-Dye

**Contre-exemples** (PAS des patterns) :
- ❌ Twill, Satin → Weave
- ❌ Stretch, Glossy → Properties/Finish

**Priorité** : 🟠 MVP (Utile recherche)

---

#### 5. FINISH / SURFACE 🆕
**Définition** : Traitement de surface ou aspect du tissu
**Exemples** :
- Aspect : Glossy, Matte, Shiny, Dull
- Texture : Brushed, Napped, Smooth, Crisp
- Traitement : Coated, Waxed, Oiled
- Effet : Washed, Stone-washed, Distressed

**Priorité** : 🟡 Phase 3-4

---

#### 6. PROPERTIES / FEATURES 🆕
**Définition** : Propriétés fonctionnelles du tissu
**Exemples** :
- Élasticité : Stretch, Non-stretch, 2-way stretch, 4-way stretch
- Opacité : Transparent, Semi-transparent, Opaque
- Performance : Breathable, Waterproof, Moisture-wicking

**Priorité** : 🟡 Phase 3-4

---

#### 7. WEIGHT / THICKNESS 🆕
**Définition** : Épaisseur / poids du tissu
**Exemples** :
- Léger : Lightweight (< 150 g/m²)
- Moyen : Medium weight (150-300 g/m²)
- Lourd : Heavyweight (> 300 g/m²)

**Alternativement** : Light, Medium, Heavy (qualitatif)

**Priorité** : 🟢 Phase 4+

---

#### 8. USE / APPLICATION 🆕
**Définition** : Usage recommandé du tissu
**Exemples** :
- Vêtements : Shirting, Dress, Suiting, Outerwear
- Spécialisé : Lining, Interfacing, Upholstery, Activewear

**Priorité** : 🟢 Phase 4+ (ou déduire des autres attributs)

---

## MVP Categories (Phase 2)

### 4 Catégories Prioritaires

**Pourquoi 4 ?**
- 3 serait déceptif pour démo
- 4 couvre l'essentiel + un différenciateur
- Plus serait overwhelming pour MVP

**Sélection** :
1. ✅ **Fiber** (Material) - Indispensable
2. ✅ **Color** - Indispensable
3. ✅ **Weave** - Forte valeur ajoutée, résout confusion actuelle
4. ✅ **Pattern** - Utile pour recherche visuelle

**Reportées à Phase 3+** :
- Finish, Properties, Weight, Use

---

## Technical Architecture

### 1. Database Schema

#### Table: attribute_categories

```sql
CREATE TABLE deadstock.attribute_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  name TEXT NOT NULL,                    -- "Weave", "Fiber", "Color"
  slug TEXT NOT NULL UNIQUE,             -- "weave", "fiber", "color"
  
  -- Hierarchy
  parent_id UUID REFERENCES attribute_categories(id),
  level INT DEFAULT 0,                   -- 0 = root, 1 = child, 2 = grandchild
  
  -- Display
  display_order INT DEFAULT 0,           -- Ordre affichage UI
  icon TEXT,                             -- Icon name (lucide-react)
  color TEXT,                            -- Color hex for UI
  
  -- Metadata
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_searchable BOOLEAN DEFAULT true,    -- Afficher dans filtres recherche ?
  is_required BOOLEAN DEFAULT false,     -- Obligatoire dans textiles ?
  
  -- i18n
  translations JSONB,                    -- {"en": "Weave", "fr": "Tissage", "es": "Tejido"}
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CHECK (level >= 0 AND level <= 3),    -- Max 3 niveaux hiérarchie
  CHECK (parent_id IS NULL OR level > 0)
);

-- Indexes
CREATE INDEX idx_categories_parent ON attribute_categories(parent_id);
CREATE INDEX idx_categories_slug ON attribute_categories(slug);
CREATE INDEX idx_categories_active ON attribute_categories(is_active);

-- Example data
INSERT INTO attribute_categories (name, slug, level, display_order, is_required) VALUES
  ('Fiber', 'fiber', 0, 1, true),
  ('Color', 'color', 0, 2, true),
  ('Weave', 'weave', 0, 3, false),
  ('Pattern', 'pattern', 0, 4, false);

-- Hierarchical example (Weave > Twill > Herringbone)
INSERT INTO attribute_categories (name, slug, parent_id, level) VALUES
  ('Twill', 'twill', (SELECT id FROM attribute_categories WHERE slug='weave'), 1),
  ('Herringbone Twill', 'herringbone-twill', (SELECT id FROM attribute_categories WHERE slug='twill'), 2);
```

#### Table: dictionary_mappings (Updated)

```sql
ALTER TABLE deadstock.dictionary_mappings
  DROP COLUMN category,  -- Remove TEXT enum
  ADD COLUMN category_id UUID REFERENCES attribute_categories(id);

-- Migrate existing data
UPDATE dictionary_mappings dm
SET category_id = ac.id
FROM attribute_categories ac
WHERE dm.category = ac.slug;

-- Make NOT NULL after migration
ALTER TABLE dictionary_mappings
  ALTER COLUMN category_id SET NOT NULL;

-- Update constraint
ALTER TABLE dictionary_mappings
  DROP CONSTRAINT dictionary_mappings_source_unique,
  ADD CONSTRAINT dictionary_mappings_source_unique 
    UNIQUE(source_term, source_locale, category_id);
```

#### Table: textile_attributes (New)

```sql
-- Replace individual columns with dynamic attributes
CREATE TABLE deadstock.textile_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  textile_id UUID NOT NULL REFERENCES textiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES attribute_categories(id),
  
  -- Value (normalized EN)
  value TEXT NOT NULL,
  
  -- Original extracted term (FR/EN/ES)
  source_term TEXT,
  source_locale TEXT,
  
  -- Confidence
  confidence FLOAT DEFAULT 1.0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(textile_id, category_id)  -- Un seul weave par textile
);

CREATE INDEX idx_textile_attrs_textile ON textile_attributes(textile_id);
CREATE INDEX idx_textile_attrs_category ON textile_attributes(category_id);
CREATE INDEX idx_textile_attrs_value ON textile_attributes(value);
```

**Migration strategy** :
```sql
-- Migrate existing textiles
INSERT INTO textile_attributes (textile_id, category_id, value)
SELECT 
  t.id,
  (SELECT id FROM attribute_categories WHERE slug = 'fiber'),
  t.material_type
FROM textiles t
WHERE t.material_type IS NOT NULL;

-- Similar for color, pattern...

-- Keep old columns temporarily for backward compat
-- Drop in future migration
```

---

### 2. Domain Model

#### Entity: AttributeCategory

```typescript
export class AttributeCategory {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public parentId: string | null,
    public level: number,
    public displayOrder: number,
    public isActive: boolean,
    public isSearchable: boolean,
    public isRequired: boolean,
    public translations: Record<Locale, string>
  ) {
    this.validate();
  }
  
  /**
   * Business Rule: Slug doit être unique et valide
   */
  private validate(): void {
    if (!/^[a-z0-9-]+$/.test(this.slug)) {
      throw new Error('Invalid slug format');
    }
    
    if (this.level < 0 || this.level > 3) {
      throw new Error('Level must be between 0 and 3');
    }
  }
  
  /**
   * Business Method: Est une catégorie racine ?
   */
  isRoot(): boolean {
    return this.parentId === null && this.level === 0;
  }
  
  /**
   * Business Method: Peut avoir des enfants ?
   */
  canHaveChildren(): boolean {
    return this.level < 3; // Max 3 niveaux
  }
}
```

#### Value Object: TextileAttribute

```typescript
export class TextileAttribute {
  constructor(
    public readonly categoryId: string,
    public readonly categorySlug: string,  // Denormalized for perf
    public value: string,                  // Normalized EN value
    public sourceTerm: string | null,      // Original term
    public sourceLocale: Locale | null,
    public confidence: number
  ) {
    this.validate();
  }
  
  private validate(): void {
    if (this.confidence < 0 || this.confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }
    
    if (this.value.trim().length === 0) {
      throw new Error('Value cannot be empty');
    }
  }
}
```

#### Updated Textile Entity

```typescript
export class Textile {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    
    // Dynamic attributes replace material_type, color, pattern
    public attributes: Map<string, TextileAttribute>,
    
    // Rest unchanged...
    public composition: Record<string, number> | null,
    public quantity: number,
    // ...
  ) {}
  
  /**
   * Business Method: Obtenir attribut par catégorie
   */
  getAttribute(categorySlug: string): TextileAttribute | null {
    return this.attributes.get(categorySlug) || null;
  }
  
  /**
   * Business Method: Ajouter/Mettre à jour attribut
   */
  setAttribute(attribute: TextileAttribute): void {
    this.attributes.set(attribute.categorySlug, attribute);
  }
  
  /**
   * Business Method: Vérifier si attributs requis présents
   */
  hasRequiredAttributes(requiredCategories: string[]): boolean {
    return requiredCategories.every(cat => this.attributes.has(cat));
  }
}
```

---

### 3. Admin UX - Category Management

#### Features

**Page `/admin/categories`** :

1. **List Categories**
   - Table hiérarchique (indentation niveaux)
   - Colonnes : Name, Slug, Level, Active, Searchable, Required, Actions
   - Drag & drop pour réordonner (display_order)
   
2. **Create Category**
   - Form : Name, Slug (auto-generate), Parent (dropdown)
   - Translations (tabs FR/EN/ES)
   - Options : Active, Searchable, Required
   - Icon picker, Color picker
   
3. **Edit Category**
   - Même form que Create
   - Warning si catégorie utilisée (show count textiles)
   
4. **Delete Category**
   - Warning si mappings/textiles utilisent cette catégorie
   - Option : Merge vers autre catégorie
   
5. **Merge Categories**
   - Select 2+ categories
   - Choisir catégorie destination
   - Migrate tous mappings + textiles
   
6. **Create Hierarchy**
   - Drag & drop catégorie sur autre → devient child
   - Max 3 niveaux (root > child > grandchild)

#### Mockup Structure

```
┌─────────────────────────────────────────────────┐
│ Category Management                              │
├─────────────────────────────────────────────────┤
│ [+ New Category]  [Merge Selected]               │
├─────────────────────────────────────────────────┤
│ ☐ Fiber          │ fiber    │ 0 │ ✓ │ ✓ │ ✓ │ 🎨│
│ ☐ Color          │ color    │ 0 │ ✓ │ ✓ │ ✓ │ 🎨│
│ ☐ Weave          │ weave    │ 0 │ ✓ │ ✓ │   │ 🎨│
│   ☐ Twill        │ twill    │ 1 │ ✓ │ ✓ │   │ 📝│
│     ☐ Herringbone│ herring..│ 2 │ ✓ │   │   │ 📝│
│   ☐ Satin        │ satin    │ 1 │ ✓ │ ✓ │   │ 📝│
│ ☐ Pattern        │ pattern  │ 0 │ ✓ │ ✓ │   │ 🎨│
└─────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 0 : Database Schema (1-2 jours)

**Actions** :
1. ✅ Create `attribute_categories` table
2. ✅ Seed 4 MVP categories (Fiber, Color, Weave, Pattern)
3. ✅ Create `textile_attributes` table
4. ✅ Migrate existing data
5. ✅ Keep old columns temporarily (backward compat)

**Deliverables** :
- Migration 006_dynamic_attributes.sql
- Validation scripts

---

### Phase 1 : Domain Refactor (2-3 jours)

**Actions** :
1. ✅ Create AttributeCategory entity
2. ✅ Create TextileAttribute value object
3. ✅ Refactor Textile entity (Map<string, TextileAttribute>)
4. ✅ Update repositories (categoryRepo, textileRepo)
5. ✅ Update use cases (normalizeTextile, scrapeAndSave)

**Deliverables** :
- Refactored domain layer
- Tests passing

---

### Phase 2 : Adapter Updates (1 jour)

**Actions** :
1. ✅ Update MyLittleCouponAdapter (parseWeave())
2. ✅ Update TheFabricSalesAdapter (parseWeave())
3. ✅ Clean parsePatterns() (remove weave terms)

**Deliverables** :
- Adapters extracting 4 categories
- Smart parsing tests

---

### Phase 3 : Admin UI (3-4 jours)

**Actions** :
1. ✅ Create `/admin/categories` page
2. ✅ List categories (hierarchical table)
3. ✅ Create/Edit category form
4. ✅ Delete with validation
5. ✅ Merge categories workflow
6. ✅ Drag & drop hierarchy

**Deliverables** :
- Full CRUD categories
- Merge functionality
- Hierarchy management

---

### Phase 4 : Search Integration (2 jours)

**Actions** :
1. ✅ Update search API (dynamic filters)
2. ✅ Generate filters from categories (WHERE is_searchable = true)
3. ✅ Update frontend search UI

**Deliverables** :
- Search avec filtres dynamiques
- UI s'adapte aux catégories actives

---

### Phase 5 : Cleanup (1 jour)

**Actions** :
1. ✅ Drop old columns (material_type, color, pattern)
2. ✅ Update docs
3. ✅ Final tests

---

## Migration Strategy

### Backward Compatibility

**Phase 0-2** : Dual-write
- Write to both old columns AND textile_attributes
- Read from old columns (existing code works)

**Phase 3-4** : Transition
- Read from textile_attributes
- Old columns still present (safety)

**Phase 5** : Cleanup
- Drop old columns
- 100% dynamic system

---

## Benefits

### Immediate (MVP)

1. ✅ **Résout confusion Pattern/Weave**
   - Twill, Satin → Weave (séparé)
   - Solid, Striped → Pattern (clarifié)

2. ✅ **Meilleure normalisation**
   - 4 catégories vs 3 actuelles
   - Weave = forte valeur ajoutée

3. ✅ **Démo convaincante**
   - Système sophistiqué
   - Pas juste "color + material"

### Long-terme

1. ✅ **Extensibilité illimitée**
   - Ajouter Finish, Properties, Weight sans code
   - Admin self-service

2. ✅ **Hiérarchie**
   - Weave > Twill > Herringbone Twill
   - Recherche drill-down

3. ✅ **Normalisation pro**
   - Mapping précis entre sites
   - Taxonomy professionnelle

4. ✅ **Future-proof**
   - Nouveaux types textiles (ex: smart fabrics)
   - Pas de refactor architecture

---

## Success Metrics

### MVP (Phase 2)
- ✅ 4 catégories actives (Fiber, Color, Weave, Pattern)
- ✅ 100+ mappings Weave créés
- ✅ 0 confusion Pattern/Weave
- ✅ Quality 85%+ sur 4 catégories

### Long-terme (Phase 3+)
- ✅ 8+ catégories actives
- ✅ Admin peut ajouter catégorie en <5 min
- ✅ Hiérarchie 3 niveaux utilisée
- ✅ Search filters s'adaptent automatiquement

---

## Risks & Mitigations

### Risk 1 : Complexité Migration

**Mitigation** : Dual-write period, keep old columns, progressive rollout

### Risk 2 : Performance (Joins)

**Mitigation** : Denormalize categorySlug in textile_attributes, indexes

### Risk 3 : Admin UX Complexity

**Mitigation** : Start simple (CRUD), add hierarchy later (Phase 3.2)

---

## Alternatives Considered

### Alternative 1 : Keep Hard-Coded Categories

**Rejected** : Not scalable, requires code deploy for new categories

### Alternative 2 : EAV (Entity-Attribute-Value) Generic

**Rejected** : Too generic, loses type safety, complex queries

### Alternative 3 : JSONB Attributes Only

**Rejected** : Hard to search, no admin UI, no validation

---

## References

- ADR-008: Intelligent Data Extraction (Smart Parsing)
- ADR-009: Internationalization Strategy
- Textile Industry Standards: ASTM, ISO textile terminology

---

**Status** : Accepted  
**Priority** : HIGH (Required for Phase 2 completion)  
**Next Actions** : 
1. Create Migration 006
2. Implement Phase 0 (Database)
3. Refactor Domain (Phase 1)
