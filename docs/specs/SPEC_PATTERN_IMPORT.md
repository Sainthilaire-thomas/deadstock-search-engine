# SPEC_PATTERN_IMPORT - Import Patron & Calcul Métrage Intelligent

**Version:** 2.0  
**Date:** 05/01/2026  
**Statut:** Spécification  
**Phase:** 2 - Design Tools  
**Priorité:** ⭐ Killer Feature

---

## 1. Vue d'ensemble

### 1.1 Problème à résoudre

Les designers de mode passent un temps considérable à calculer manuellement le métrage nécessaire pour leurs projets :

1. **Lecture du patron** : Identifier les pièces, leurs dimensions, le nombre de découpes
2. **Consultation des tableaux** : Croiser taille × largeur tissu × vue/variante
3. **Calculs manuels** : Additionner, ajuster pour le sens du tissu, les raccords motifs
4. **Risque d'erreur** : Sous-estimation = tissu manquant, sur-estimation = gaspillage

### 1.2 Contexte Deadstock

**L'utilisateur type n'a PAS encore son tissu** — il vient chercher du deadstock compatible avec son patron.

```
Cas majoritaire (80%+) :
"J'ai un patron, je cherche un tissu deadstock compatible"

Cas minoritaire :
"J'ai repéré un tissu dans mes favoris, est-ce qu'il y en a assez ?"
```

### 1.3 Solution proposée

**Upload d'un patron PDF → Extraction automatique → Calcul métrage multi-largeurs → Recherche tissus filtrée**

L'utilisateur uploade son patron, l'IA extrait ce qu'elle peut, l'utilisateur complète/confirme les infos manquantes, et le système calcule le métrage pour différentes largeurs de tissu afin de faciliter la recherche.

### 1.4 Valeur ajoutée

| Bénéfice | Impact |
|----------|--------|
| Gain de temps | 10-30 min économisées par projet |
| Réduction erreurs | Moins de tissu gaspillé ou manquant |
| Magic moment | Différenciateur majeur vs concurrence |
| Intégration workflow | Liaison directe avec recherche tissus |
| Fonctionne pour tous | Patrons commerciaux ET indie/gratuits |

---

## 2. Constats sur les patrons PDF

### 2.1 Pas de standard universel

**Standards industriels (CAD/CAM)** :
- ASTM D6673 (retiré en 2019) : Format DXF pour échange de pièces
- Utilisé uniquement dans l'industrie pro (Gerber, Lectra, Optitex)
- **Ne contient PAS les tableaux de métrage**

**Patrons grand public (PDF)** :
- Aucun standard !
- Structure variable selon les marques
- Le tableau de métrage est une **image**, pas des données structurées

### 2.2 Deux grandes catégories de patrons

| Catégorie | Caractéristiques | Tableau métrage | Exemples |
|-----------|------------------|-----------------|----------|
| **Commerciaux** | Multi-tailles, instructions complètes | ✅ Présent | Burda, Simplicity, McCall's, Vogue |
| **Indie/Gratuits** | Variables, souvent 1 page couverture | ❌ Souvent absent | Ma Petite Mercerie, patrons Etsy, blogs |

### 2.3 Structure par marque

#### Les "Big 4" (même groupe CSS Industries)

| Marque | Structure | Tableau métrage | Format |
|--------|-----------|-----------------|--------|
| Simplicity | Instructions + tiles séparés | Page 2-3 | US (yards, 45"/60") |
| McCall's | Idem | Idem | Idem |
| Butterick | Idem | Idem | Idem |
| Vogue | Idem | Idem | Idem |
| New Look | Idem | Idem | Idem |

→ **5 marques = 1 seule structure à apprendre**

#### Burda (Allemand)

| Aspect | Particularité |
|--------|---------------|
| Tailles | Euro + US |
| Métrage | Sur le tissu papier, PAS dans les instructions PDF |
| Format | Métrique (cm, mètres) |

#### Indie français (Ma Petite Mercerie, etc.)

| Aspect | Particularité |
|--------|---------------|
| Page couverture | ✅ Souvent bien faite (logo, légende tailles) |
| Tableau métrage | ❌ Généralement absent |
| Tailles | Variables (S/M/L/XL ou 36-46) |
| Légende | Types de lignes différents par taille |

---

## 3. Architecture : Templates par marque + Participation utilisateur

### 3.1 Principe

Comme pour le scraping des sources textiles : **discovery par source** puis **extraction optimisée**.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PATTERN BRAND TEMPLATES                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │  SIMPLICITY     │    │     BURDA       │    │  MA PETITE      │     │
│  │  GROUP          │    │                 │    │  MERCERIE       │     │
│  ├─────────────────┤    ├─────────────────┤    ├─────────────────┤     │
│  │ ✅ Tableau p.2-3│    │ ✅ Tableau sur  │    │ ❌ Pas de       │     │
│  │ • Format US     │    │   tissu papier  │    │   tableau       │     │
│  │ • Yards         │    │ • Format Euro   │    │ ✅ Page couv    │     │
│  │ • 45"/60"       │    │ • Mètres        │    │ • Tailles SMLXL │     │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘     │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  GENERIC (fallback)                                             │   │
│  │  • Prompt IA générique                                          │   │
│  │  • Extraction best-effort                                       │   │
│  │  • Participation utilisateur pour compléter                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Modèle de données : Template marque

```typescript
interface PatternBrandTemplate {
  id: string;
  brandName: string;
  brandAliases: string[];           // ["Simplicity", "McCall's", "Butterick"]
  
  // Détection
  logoKeywords: string[];           // Pour détection auto sur page 1
  
  // Structure du PDF
  structure: {
    hasCoverPage: boolean;
    yardageTableLocation: 'instructions' | 'pattern_sheet' | 'none';
    typicalYardagePage: number | null;
    hasAssemblyGrid: boolean;
    testSquareCm: number;           // 2 ou 3 cm
  };
  
  // Format du tableau de métrage
  yardageFormat: {
    hasYardageTable: boolean;
    units: 'yards' | 'meters' | 'both';
    fabricWidths: number[];         // [115, 140] ou [45, 60]
    widthUnit: 'cm' | 'inches';
    sizeFormat: 'US' | 'EU' | 'letters';  // 8-10-12 ou 36-38-40 ou S-M-L
    hasViews: boolean;              // A, B, C variantes
    hasNapAnnotations: boolean;     // ** / ***
  };
  
  // Prompt IA optimisé
  extractionPrompt: string;
  
  // Métriques
  successRate: number;
  totalExtractions: number;
}
```

### 3.3 Table Supabase : Templates

```sql
CREATE TABLE deadstock.pattern_brand_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT NOT NULL UNIQUE,
  brand_aliases TEXT[] DEFAULT '{}',
  logo_keywords TEXT[] DEFAULT '{}',
  
  -- Structure
  has_cover_page BOOLEAN DEFAULT true,
  yardage_table_location TEXT,  -- 'instructions', 'pattern_sheet', 'none'
  typical_yardage_page INTEGER,
  test_square_cm INTEGER DEFAULT 2,
  
  -- Format métrage
  has_yardage_table BOOLEAN DEFAULT true,
  units TEXT DEFAULT 'meters',
  fabric_widths INTEGER[] NOT NULL,
  width_unit TEXT DEFAULT 'cm',
  size_format TEXT DEFAULT 'EU',
  
  -- Prompt
  extraction_prompt TEXT,
  
  -- Métriques
  success_rate FLOAT DEFAULT 0,
  total_extractions INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed des marques principales
INSERT INTO deadstock.pattern_brand_templates 
  (brand_name, brand_aliases, has_yardage_table, fabric_widths, width_unit, units, size_format) 
VALUES
  ('Simplicity', ARRAY['McCall''s', 'Butterick', 'Vogue', 'New Look', 'Know Me'], 
   true, ARRAY[115, 150], 'cm', 'both', 'US'),
  ('Burda', ARRAY['BurdaStyle'], 
   true, ARRAY[115, 140, 150], 'cm', 'meters', 'EU'),
  ('Ma Petite Mercerie', ARRAY['mapetitemercerie', 'MPM'], 
   false, ARRAY[110, 140, 150], 'cm', 'meters', 'letters'),
  ('Generic', ARRAY[], 
   false, ARRAY[110, 140, 150], 'cm', 'meters', 'letters');
```

---

## 4. Flux utilisateur

### 4.1 Vue d'ensemble

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Upload     │────▶│   Analyse    │────▶│   Config     │────▶│   Résultat   │
│   patron     │     │   auto IA    │     │   projet     │     │   + actions  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                            │                    │
                            ▼                    ▼
                     Extraction :         Utilisateur :
                     • Marque             • Taille
                     • Nom                • Quantité  
                     • Type vêtement      • Options tissu
                     • Tailles dispo      • (Largeur si connue)
                     • Pièces
                     • Tableau métrage
```

### 4.2 Étape 1 : Upload

```
┌─────────────────────────────────────────────────────────────────┐
│  📄 Importer un patron                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │         📄 Glissez votre patron ici                       │  │
│  │            ou cliquez pour sélectionner                   │  │
│  │                                                           │  │
│  │         PDF ou Image (JPG, PNG) • Max 20 Mo               │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  💡 Uploadez le PDF complet ou la page avec le tableau          │
│     de métrage (si votre patron en a un)                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Étape 2 : Analyse automatique + Résultats

L'interface s'adapte selon ce qui a été détecté :

#### Cas A : Patron commercial avec tableau (Burda, Simplicity...)

```
┌─────────────────────────────────────────────────────────────────┐
│  ✅ Patron analysé                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🏷️ Burda 6234                                            │  │
│  │  "Robe d'été"                                             │  │
│  │                                                           │  │
│  │  ✅ Tableau de métrage extrait                            │  │
│  │  Tailles : 34 • 36 • 38 • 40 • 42 • 44 • 46              │  │
│  │  Vues : A (longue), B (courte)                            │  │
│  │  Largeurs : 115cm, 140cm                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Votre projet :                                                 │
│  ─────────────                                                  │
│  Vue :        [A - Robe longue ▼]                              │
│  Taille :     [40 ▼]                                           │
│  Quantité :   [1]                                               │
│                                                                 │
│  Avez-vous déjà repéré un tissu ?                              │
│  (•) Non, je cherche                                            │
│  ( ) Oui, je connais sa largeur : [___] cm                     │
│                                                                 │
│  Options :                                                      │
│  ☐ Tissu directionnel     ☐ Motif à raccorder                  │
│  ☑️ Marge de sécurité (+10%)                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Cas B : Patron indie SANS tableau (Ma Petite Mercerie, gratuits...)

```
┌─────────────────────────────────────────────────────────────────┐
│  📄 Patron analysé                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🏷️ Ma Petite Mercerie                                    │  │
│  │  "Veste sans manches"                                     │  │
│  │                                                           │  │
│  │  ✅ Tailles détectées : S • M • L • XL                    │  │
│  │  ✅ Type : Veste                                          │  │
│  │  ⚠️ Pas de tableau de métrage                             │  │
│  │                                                           │  │
│  │  📹 Tutoriel disponible (QR code détecté)                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Votre projet :                                                 │
│  ─────────────                                                  │
│  Type :       [Veste sans manches ▼]  ← pré-rempli, modifiable │
│  Taille :     ( ) S  (•) M  ( ) L  ( ) XL                      │
│  Quantité :   [1]                                               │
│                                                                 │
│  Avez-vous déjà repéré un tissu ?                              │
│  (•) Non, je cherche                                            │
│  ( ) Oui, je connais sa largeur : [___] cm                     │
│                                                                 │
│  Options :                                                      │
│  ☐ Tissu directionnel     ☐ Motif à raccorder                  │
│  ☑️ Marge de sécurité (+10%)                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Étape 3 : Résultats

#### Si "Non, je cherche" (cas par défaut - contexte Deadstock)

```
┌─────────────────────────────────────────────────────────────────┐
│  📐 MÉTRAGE NÉCESSAIRE                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Veste sans manches • Taille M • ×1                             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Largeur tissu     Métrage nécessaire                     │  │
│  │  ─────────────     ──────────────────                     │  │
│  │  110 cm            1.80 m                                 │  │
│  │  140 cm            1.50 m                                 │  │
│  │  150 cm            1.40 m                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ⓘ Estimation basée sur nos formules (pas de tableau           │
│    de métrage dans ce patron)                                  │
│                                                                 │
│  [🔍 Chercher des tissus compatibles]                          │
│                                                                 │
│  [+ Ajouter ce calcul au board]                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Si "Oui, je connais sa largeur" (tissu déjà repéré)

```
┌─────────────────────────────────────────────────────────────────┐
│  📐 RÉSULTAT pour tissu 140cm                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Veste sans manches • Taille M • ×1                             │
│                                                                 │
│  Métrage nécessaire : 1.50 m                                    │
│  + Marge sécurité :   0.15 m                                    │
│  ─────────────────────────────                                  │
│  TOTAL : 1.65 m                                                 │
│                                                                 │
│  💡 Recommandé : 1.70 m                                         │
│                                                                 │
│  [+ Ajouter au board]                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Trois niveaux de précision

Le système adapte sa confiance et son affichage selon la qualité des données :

```
┌─────────────────────────────────────────────────────────────────────────┐
│  NIVEAU 1 : Tableau métrage extrait                                     │
│  ──────────────────────────────────                                     │
│  Source : Extraction directe du tableau du patron                       │
│  Précision : ★★★★★                                                      │
│  Affichage : "Métrage : 2.40m (extrait du patron)"                     │
│  Marques : Burda, Simplicity, McCall's, Vogue...                       │
├─────────────────────────────────────────────────────────────────────────┤
│  NIVEAU 2 : Estimation par type de vêtement + taille                   │
│  ───────────────────────────────────────────────────                    │
│  Source : Formules internes basées sur le type détecté/confirmé        │
│  Précision : ★★★☆☆                                                      │
│  Affichage : "Métrage estimé : ~1.50m (veste sans manches, taille M)" │
│  Marques : Ma Petite Mercerie, patrons indie, gratuits...              │
├─────────────────────────────────────────────────────────────────────────┤
│  NIVEAU 3 : Estimation générique                                        │
│  ───────────────────────────────                                        │
│  Source : Formules par catégorie (haut, bas, robe, veste...)           │
│  Précision : ★★☆☆☆                                                      │
│  Affichage : "Métrage estimé : ~2.00m (vérifiez le type de vêtement)" │
│  Cas : Type non détecté, patron très atypique                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Intégration avec la recherche de tissus

### 6.1 Filtre intelligent

Quand l'utilisateur clique "Chercher des tissus compatibles", la recherche s'ouvre avec un filtre basé sur le calcul :

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 Recherche : Tissus pour Veste sans manches M                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Filtre actif :                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ☑️ Quantité suffisante pour votre projet                  │  │
│  │    (masquer les tissus insuffisants)                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  125 tissus trouvés                                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🧵 Lin bleu marine                      My Little Coupon│    │
│  │    140cm × 4.5m dispo                                   │    │
│  │    ✅ Suffisant (besoin: 1.65m)                         │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ 🧵 Coton écru                          The Fabric Sales │    │
│  │    150cm × 3.2m dispo                                   │    │
│  │    ✅ Suffisant (besoin: 1.55m)                         │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ 🧵 Velours bordeaux                              Recovo │    │
│  │    110cm × 1.5m dispo                                   │    │
│  │    ❌ Insuffisant (besoin: 2m)                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Logique de filtrage

```typescript
function isTextileSufficient(
  textile: Textile,
  calculation: YardageCalculation
): boolean {
  const widthCm = textile.width;  // Largeur du tissu
  const availableMeters = textile.quantity;
  
  // Trouver le métrage nécessaire pour cette largeur
  const neededMeters = calculation.yardageByWidth[widthCm] 
    ?? interpolateYardage(calculation.yardageByWidth, widthCm);
  
  return availableMeters >= neededMeters;
}
```

---

## 7. Modèle de données

### 7.1 Résultat d'analyse

```typescript
interface PatternAnalysisResult {
  // Métadonnées extraites
  detectedBrand: string | null;
  detectedName: string | null;
  detectedGarmentType: GarmentType | null;
  
  // Pièces du patron (si détectées)
  pieces: ExtractedPiece[];
  
  // Tailles
  availableSizes: string[] | null;
  isSingleSize: boolean;
  sizeFormat: 'US' | 'EU' | 'letters' | 'unknown';
  
  // Tableau de métrage
  hasYardageTable: boolean;
  yardageTable: YardageTable | null;
  
  // Niveau de précision
  precisionLevel: 1 | 2 | 3;
  confidence: number;  // 0-1
  
  // Ce qui doit être demandé à l'utilisateur
  missingInfo: MissingInfoType[];
}

interface ExtractedPiece {
  id: string;
  name: string;              // "Devant", "Dos", "Manche"
  quantity: number;          // 2
  cutInstruction: string;    // "2X dans le tissu principal"
  onFold: boolean;           // true si "sur le pli"
}

type MissingInfoType = 
  | 'garment_type'      // Type non détecté avec certitude
  | 'size'              // Toujours demandé
  | 'quantity'          // Toujours demandé
  | 'fabric_width';     // Si pas de tableau et pas encore choisi
```

### 7.2 Calcul de métrage

```typescript
interface YardageCalculationInput {
  // Depuis l'analyse
  patternAnalysis: PatternAnalysisResult;
  
  // Depuis l'utilisateur
  garmentType: GarmentType;    // Confirmé ou saisi
  selectedSize: string;
  quantity: number;
  modifiers: {
    directional: boolean;      // +10%
    patternMatching: boolean;  // +20%
    safetyMargin: number;      // % (défaut 10%)
  };
  
  // Optionnel
  knownFabricWidthCm?: number;
}

interface YardageCalculationResult {
  // Input résumé
  garmentType: GarmentType;
  size: string;
  quantity: number;
  
  // Niveau de précision
  precisionLevel: 1 | 2 | 3;
  source: 'extracted_table' | 'formula_specific' | 'formula_generic';
  
  // Résultat
  mode: 'single_width' | 'multi_width';
  
  // Si largeur connue
  singleResult?: {
    fabricWidthCm: number;
    baseYardage: number;
    withModifiers: number;
    recommended: number;
  };
  
  // Si largeur inconnue (défaut)
  multiResults?: {
    fabricWidthCm: number;
    baseYardage: number;
    withModifiers: number;
    recommended: number;
  }[];
  
  // Pour le filtre de recherche
  yardageByWidth: Record<number, number>;  // {110: 2.0, 140: 1.65, 150: 1.55}
}
```

### 7.3 Table Supabase : Patrons importés

```sql
CREATE TABLE deadstock.imported_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  
  -- Métadonnées
  name TEXT NOT NULL,
  brand TEXT,
  garment_type TEXT,
  
  -- Fichier
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'image')),
  file_size_bytes INTEGER,
  page_count INTEGER,
  
  -- Analyse
  analysis_result JSONB,
  precision_level INTEGER CHECK (precision_level IN (1, 2, 3)),
  confidence FLOAT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT imported_patterns_owner CHECK (
    user_id IS NOT NULL OR session_id IS NOT NULL
  )
);

-- RLS
ALTER TABLE deadstock.imported_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own patterns" ON deadstock.imported_patterns
  FOR ALL USING (user_id = auth.uid());
```

---

## 8. Élément Board : Calcul patron

### 8.1 Structure de données

```typescript
interface PatternCalculationElement {
  type: 'pattern_calculation';
  data: {
    // Référence patron
    patternId?: string;        // Si importé
    patternName: string;
    patternBrand?: string;
    
    // Configuration
    garmentType: GarmentType;
    selectedSize: string;
    quantity: number;
    modifiers: {
      directional: boolean;
      patternMatching: boolean;
      safetyMargin: number;
    };
    
    // Résultat
    precisionLevel: 1 | 2 | 3;
    calculationMode: 'single_width' | 'multi_width';
    
    // Si tissu connu
    knownFabric?: {
      widthCm: number;
      yardageNeeded: number;
    };
    
    // Si tissu inconnu - tableau de référence
    yardageByWidth: Record<number, number>;
    
    // Lien avec un tissu choisi (optionnel)
    linkedTextileId?: string;
  };
}
```

### 8.2 Affichage sur le board

```
┌─────────────────────────────────┐
│ 📐 Veste sans manches           │
├─────────────────────────────────┤
│ Taille M • ×1                   │
│                                 │
│ 110cm → 2.00m                   │
│ 140cm → 1.65m  ←── lié         │
│ 150cm → 1.55m                   │
│                                 │
│ ⓘ Estimation                   │
│ [🔍 Chercher]                   │
└─────────────────────────────────┘
        │
        │ lien
        ▼
┌─────────────────────────────────┐
│ 🧵 Lin bleu marine              │
│ 140cm × 4.5m                    │
│ ✅ Suffisant (1.65m)            │
└─────────────────────────────────┘
```

---

## 9. Prompt IA adaptatif

### 9.1 Prompt générique

```typescript
const PATTERN_ANALYSIS_PROMPT = `
Tu analyses un patron de couture PDF. Extrais TOUTES les informations disponibles.

INFORMATIONS À EXTRAIRE :

1. IDENTIFICATION
   - Nom du patron
   - Marque (Burda, Simplicity, Ma Petite Mercerie, etc.)
   - Type de vêtement (robe, veste, pantalon, jupe, top...)

2. TAILLES
   - Tailles disponibles
   - Format : US (8, 10, 12...), EU (36, 38, 40...), ou lettres (S, M, L, XL)
   - Taille unique ?

3. PIÈCES DU PATRON (si visibles)
   - Nom de chaque pièce
   - Quantité à couper
   - Sur le pli ou non

4. TABLEAU DE MÉTRAGE (CRUCIAL - si présent)
   - Tailles en lignes
   - Largeurs tissu en colonnes
   - Valeurs de métrage
   - Unité (mètres ou yards)
   - Annotations (with nap, etc.)

5. AUTRES ÉLÉMENTS
   - Carré de test (dimensions)
   - QR code / lien tutoriel
   - Instructions particulières

FORMAT JSON :
{
  "brand": "Ma Petite Mercerie",
  "name": "Veste sans manches",
  "garmentType": "vest",
  "sizes": {
    "available": ["S", "M", "L", "XL"],
    "format": "letters",
    "isSingleSize": false
  },
  "pieces": [
    {"id": "A", "name": "Devant", "quantity": 2, "onFold": false},
    {"id": "B", "name": "Dos", "quantity": 1, "onFold": true}
  ],
  "yardageTable": null,  // ou objet si présent
  "hasYardageTable": false,
  "testSquareCm": 3,
  "hasTutorialLink": true,
  "confidence": 0.85
}

RÈGLES :
- Ne jamais inventer de données
- Si pas de tableau de métrage, mettre hasYardageTable: false
- Indiquer le niveau de confiance
`;
```

### 9.2 Prompt spécifique marque (exemple Simplicity)

```typescript
const SIMPLICITY_PROMPT = `
${PATTERN_ANALYSIS_PROMPT}

CONTEXTE SPÉCIFIQUE - PATRON SIMPLICITY/McCALL'S/BUTTERICK/VOGUE :

Ces marques ont une structure standardisée :
- Tableau de métrage généralement page 2-3 des instructions
- Format : tailles US (8, 10, 12, 14, 16, 18, 20, 22, 24)
- Largeurs tissu : 45" (115cm) et 60" (150cm)
- Unités : yards (convertir en mètres : 1 yard = 0.9144m)
- Vues identifiées par lettres (A, B, C)
- Annotations ** et *** pour le sens du tissu

Le tableau ressemble souvent à :
       | 45" | 60"
Size 8 | 2¼  | 1⅞
Size 10| 2⅜  | 2
...

Convertis les fractions : ¼=0.25, ⅜=0.375, ½=0.5, ⅝=0.625, ¾=0.75, ⅞=0.875
`;
```

---

## 10. Limites et contraintes

### 10.1 Limites techniques

| Contrainte | Valeur | Justification |
|------------|--------|---------------|
| Taille fichier max | 20 Mo | Limite Supabase Storage |
| Pages PDF analysées | 3 premières | Coût API Vision |
| Formats supportés | PDF, JPG, PNG | Standards courants |
| Langues | FR, EN, DE, ES | Patrons les plus courants |

### 10.2 Ce qui fonctionne bien

- ✅ Patrons commerciaux avec tableau de métrage clair
- ✅ Patrons indie avec page de couverture structurée
- ✅ PDFs propres générés par logiciel (Illustrator, etc.)

### 10.3 Ce qui fonctionne moins bien

- ⚠️ Photos de patrons papier
- ⚠️ PDFs scannés de mauvaise qualité
- ⚠️ Patrons sans aucune info structurée
- ❌ Formats propriétaires (Seamly2D, Valentina, CLO3D)

---

## 11. Architecture DDD Light

### 11.1 Structure des fichiers (conforme ADR-005)

```
src/features/
├── pattern/                              # NOUVEAU MODULE PATTERN
│   ├── domain/
│   │   ├── types.ts                      # Types, Entities, Value Objects
│   │   ├── garmentFormulas.ts            # Constantes métrage par vêtement
│   │   └── brandTemplates.ts             # Templates marques (Burda, etc.)
│   │
│   ├── application/
│   │   ├── calculateYardage.ts           # Use Case : calcul métrage
│   │   ├── analyzePattern.ts             # Use Case : analyse IA patron
│   │   └── queries.ts                    # Server queries
│   │
│   ├── infrastructure/
│   │   ├── patternRepository.ts          # CRUD imported_patterns
│   │   └── visionService.ts              # Appel Claude Vision API
│   │
│   ├── actions/
│   │   └── patternActions.ts             # Server Actions
│   │
│   └── components/
│       ├── PatternImportModal.tsx        # Modal principal (partagé)
│       ├── PatternUploader.tsx           # Zone drag & drop
│       ├── PatternAnalysisResult.tsx     # Affichage analyse
│       ├── PatternConfigForm.tsx         # Form config utilisateur
│       ├── YardageResult.tsx             # Résultat calcul
│       ├── YardageTable.tsx              # Tableau multi-largeurs
│       └── ManualPatternForm.tsx         # Saisie sans fichier
│
├── boards/
│   └── components/
│       ├── AddElementMenu.tsx            # Modifié : ajout bouton "Patron"
│       └── PatternCalculationCard.tsx    # NOUVEAU : carte élément board
│
└── search/
    ├── domain/
    │   └── types.ts                      # Modifié : ajout YardageSearchFilter
    └── components/
        ├── SearchFilters.tsx             # Modifié : ajout bouton "📐"
        └── YardageFilterBadge.tsx        # NOUVEAU : badge filtre actif
```

### 11.2 Intégration avec modules existants

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RÉUTILISATION ARCHITECTURE EXISTANTE                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  EXISTANT (boards)                    NOUVEAU (pattern)                 │
│  ──────────────────                   ─────────────────                 │
│                                                                         │
│  features/boards/                     features/pattern/                 │
│    ├── context/BoardContext.tsx         ├── application/               │
│    │     └── dispatch({ type:           │     └── calculateYardage.ts  │
│    │         'ADD_ELEMENT',             │                              │
│    │         payload: {...}             │                              │
│    │       })                           │                              │
│    │           ▲                        │                              │
│    │           │                        │                              │
│    └── components/                      └── components/                │
│          └── AddElementMenu.tsx              └── PatternImportModal    │
│                │                                   │                   │
│                └───────────────────────────────────┘                   │
│                        onAddToBoard(data)                              │
│                                                                         │
│  EXISTANT (search)                    NOUVEAU (pattern)                 │
│  ──────────────────                   ─────────────────                 │
│                                                                         │
│  features/search/                     features/pattern/                 │
│    └── domain/types.ts                  └── components/                │
│          └── YardageSearchFilter           └── PatternImportModal      │
│                 ▲                                  │                    │
│                 │                                  │                    │
│    └── components/SearchFilters.tsx               │                    │
│                └──────────────────────────────────┘                    │
│                      onApplyFilter(data)                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.3 Pattern existant : ElementType (boards)

Le module boards utilise déjà un type `calculation`. On va l'enrichir :

```typescript
// src/features/boards/domain/types.ts - EXISTANT

// ElementType inclut déjà 'calculation'
export type ElementType = 'textile' | 'palette' | 'inspiration' | 'calculation' | 'note';

// CalculationElementData EXISTANT (pour Journey) :
export interface CalculationElementData {
  calculationId?: string;
  summary: string;
  garmentType: string;
  size: string;
  variations?: Record<string, string>;
  result: {
    baseYardage: number;
    totalYardage: number;
    recommended: number;
  };
}
```

On crée un **nouveau type** dans le module pattern pour plus de clarté :

```typescript
// src/features/pattern/domain/types.ts - NOUVEAU

export interface PatternCalculationElementData {
  // Source
  source: 'pattern_import' | 'manual';
  
  // Référence patron (si importé)
  patternId?: string;
  patternName: string;
  patternBrand?: string;
  
  // Configuration
  garmentType: GarmentType;
  selectedSize: string;
  quantity: number;
  modifiers: YardageModifiers;
  
  // Résultat
  precisionLevel: 1 | 2 | 3;
  yardageByWidth: Record<number, number>;  // {110: 2.0, 140: 1.65}
  
  // Lien tissu (optionnel)
  linkedTextileId?: string;
}
```

### 11.4 Server Actions pattern (conforme ADR-017)

```typescript
// src/features/pattern/actions/patternActions.ts

'use server';

import { calculateYardage } from '../application/calculateYardage';
import { analyzePattern } from '../application/analyzePattern';
import { patternRepository } from '../infrastructure/patternRepository';
import { getOrCreateSessionId } from '@/lib/session';

export async function analyzePatternAction(formData: FormData) {
  const sessionId = await getOrCreateSessionId();
  const file = formData.get('file') as File;
  
  // Use Case orchestration
  const analysis = await analyzePattern(file, sessionId);
  
  return { success: true, data: analysis };
}

export async function calculateYardageAction(config: PatternConfig) {
  // Use Case direct (pas de DB nécessaire)
  const result = calculateYardage(config);
  
  return { success: true, data: result };
}

export async function savePatternAction(
  analysis: PatternAnalysisResult,
  config: PatternConfig
) {
  const sessionId = await getOrCreateSessionId();
  
  // Repository pour persistence
  const saved = await patternRepository.save({
    sessionId,
    analysis,
    config,
  });
  
  return { success: true, data: saved };
}
```

---

## 12. Roadmap d'implémentation

### Phase 1 : MVP (3-4 sessions)

#### Session A : Domain + Infrastructure
- [ ] Créer `src/features/pattern/domain/types.ts`
- [ ] Créer `src/features/pattern/domain/garmentFormulas.ts`
- [ ] Créer `src/features/pattern/application/calculateYardage.ts`
- [ ] Créer `src/features/pattern/infrastructure/patternRepository.ts`
- [ ] SQL : Table `imported_patterns` (via interface Supabase)
- [ ] Régénérer types Supabase

#### Session B : Composants UI
- [ ] Créer `src/features/pattern/components/PatternImportModal.tsx`
- [ ] Créer `src/features/pattern/components/PatternUploader.tsx`
- [ ] Créer `src/features/pattern/components/PatternConfigForm.tsx`
- [ ] Créer `src/features/pattern/components/YardageResult.tsx`
- [ ] Créer `src/features/pattern/components/ManualPatternForm.tsx`
- [ ] Créer `src/features/pattern/actions/patternActions.ts`

#### Session C : Intégration Board
- [ ] Créer `src/features/boards/components/PatternCalculationCard.tsx`
- [ ] Modifier `src/features/boards/components/AddElementMenu.tsx`
- [ ] Tester flux complet Board → Modal → Element

#### Session D : Intégration Search + API Vision
- [ ] Ajouter `YardageSearchFilter` dans `src/features/search/domain/types.ts`
- [ ] Modifier `SearchFilters.tsx` (bouton "J'ai un patron")
- [ ] Créer `YardageFilterBadge.tsx`
- [ ] Créer `src/features/pattern/infrastructure/visionService.ts`
- [ ] Créer `src/features/pattern/application/analyzePattern.ts`
- [ ] Tester extraction IA

### Phase 2 : Templates marques (2 sessions)

- [ ] Créer `src/features/pattern/domain/brandTemplates.ts`
- [ ] SQL : Table `pattern_brand_templates`
- [ ] Seed marques principales
- [ ] Prompts spécifiques par marque
- [ ] Détection automatique de la marque
- [ ] Amélioration taux d'extraction

### Phase 3 : Avancé (future)

- [ ] Historique des patrons importés
- [ ] Lien calcul ↔ tissu sur le board
- [ ] Bibliothèque de patrons

---

## 12. Questions résolues

| Question | Décision |
|----------|----------|
| Existe-t-il un standard pour les patrons PDF ? | Non, extraction IA nécessaire |
| Comment gérer les patrons sans tableau ? | Formules internes + participation utilisateur |
| Largeur tissu obligatoire ? | Non, calcul multi-largeurs par défaut |
| Priorité tissu connu vs recherche ? | Recherche par défaut (contexte Deadstock) |

---

## 13. Références

- ASTM D6673 (retiré 2019) - Standard industriel CAD
- [Understanding Sewing Patterns - The Sewing Directory](https://www.thesewingdirectory.co.uk/understanding-sewing-patterns/)
- [How to Read a Sewing Pattern - The Daily Sew](https://thedailysew.com/blog/2024/02/how-to-read-a-sewing-pattern/)
- Exemples analysés : Veste Matelassée (anonyme), Veste Sans Manches (Ma Petite Mercerie)

---

**Document rédigé par :** Claude + Thomas  
**Dernière mise à jour :** 05/01/2026
