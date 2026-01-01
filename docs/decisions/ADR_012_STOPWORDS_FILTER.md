# ADR 012: Stopwords Filter System for Term Extraction

**Date** : 2024-12-31

**Statut** : Accepté

**Décideurs** : Thomas (Lead Dev) + Claude (AI Assistant)

**Contexte Phase** : Phase 1 MVP - Normalization System

---

## Contexte

Lors des tests de normalisation avec 100 produits réels de thefabricsales.com, nous avons découvert que le terme générique "fabric" était extrait comme un matériau dans 112 occurrences, polluant les résultats et créant des unknown_terms non pertinents.

**Problème identifié** :
```
Extracted: materials=1 → ["fabric"]
Result: material_type=null (fabric not in dictionary)
Unknown terms: fabric (×112)
```

Le terme "fabric" apparaît dans presque tous les titres de produits (ex: "Blue Cotton Fabric", "Silk Fabric", "Wool Blend Fabric") mais n'est pas un attribut pertinent - c'est un terme générique signifiant "tissu".

**Contraintes** :
- Ne pas polluer le dictionnaire avec des termes génériques
- Supporter multiple langues (fabric, tissu, tela, tessuto, stoff)
- Solution simple et maintenable
- Performance : filtrage rapide (<1ms)

---

## Décision

**Nous implémentons un système de STOPWORDS pour filtrer les termes génériques lors de l'extraction.**

Le système maintient une liste de termes à exclure par catégorie (materials, colors, patterns) et par langue, et les filtre automatiquement avant la normalisation.

```typescript
const STOPWORDS = {
  materials: [
    'fabric', 'textile', 'cloth', 'material',  // English
    'tissu', 'matière',                         // French
    'tela',                                     // Spanish
    'tessuto', 'materiale',                     // Italian
    'stoff', 'gewebe'                          // German
  ],
  colors: ['color', 'colour', 'couleur', 'colore', 'farbe'],
  patterns: ['pattern', 'motif', 'patrón', 'motivo', 'muster']
};
```

---

## Options Considérées

### Option 1 : Ajouter stopwords au dictionnaire avec flag

**Description** : Créer des entrées dictionary_mappings avec `is_stopword=true` flag

**Avantages** :
- Données centralisées en DB
- Éditable via admin interface
- Audit trail des changements

**Inconvénients** :
- Overhead DB pour lookup
- Complexité logique (positive + negative matching)
- Cache invalidation nécessaire
- Mélange concepts (normalization vs exclusion)

**Coût/Complexité** : Moyen

---

### Option 2 : Hardcoded stopwords list (CHOISI)

**Description** : Liste statique dans le code d'extraction

**Avantages** :
- Simple et rapide
- Pas de DB overhead
- Facile à maintenir (changements peu fréquents)
- Séparation claire des responsabilités
- Performance optimale

**Inconvénients** :
- Changements nécessitent redéploiement
- Pas d'UI admin pour éditer

**Coût/Complexité** : Faible

---

### Option 3 : Pas de filtrage (rejeter option)

**Description** : Laisser tous les termes passer, même génériques

**Avantages** :
- Aucune complexité ajoutée

**Inconvénients** :
- Pollution massive des unknown_terms
- Dégradation expérience admin
- Gaspillage ressources DB/temps humain
- Résultats normalization moins pertinents

**Coût/Complexité** : Faible mais impact qualité élevé

---

## Rationale (Justification)

**Option 2 (Hardcoded stopwords) choisie pour** :

### 1. Simplicité et Performance
- Lookup en mémoire : O(n) avec n < 10 termes par catégorie
- Pas de round-trip DB
- Pas de cache invalidation à gérer
- Code simple, maintenable

### 2. Changements peu fréquents
- Les stopwords sont stables (fabric, tissu, color, etc.)
- Pas besoin d'édition temps réel
- Changements = code review + commit (process normal)

### 3. Séparation des responsabilités
- **Dictionary** : Normalisation positive ("soie" → "silk")
- **Stopwords** : Exclusion négative ("fabric" → ignoré)
- Mélanger les deux complexifie la logique

### 4. Impact immédiat validé
```
Test avec stopwords:
- "fabric" occurrences: 112 → 0  ✅
- Unknown terms: -112 entrées  ✅
- Normalization rate: 85% → 99%  ✅
```

---

## Conséquences

### Positives

* ✅ Élimine 112 unknown_terms non pertinents
* ✅ Améliore taux normalisation de 85% → 99%
* ✅ Performance optimale (in-memory lookup)
* ✅ Code simple et lisible
* ✅ Support multilingue intégré

### Négatives

* ⚠️ Changements nécessitent redéploiement (mitigé par rareté des changements)
* ⚠️ Pas d'UI admin pour gérer stopwords (acceptable pour MVP)

### Neutres

* Fichier `extractTerms.ts` augmente de ~30 lignes
* Liste à maintenir à jour si nouveaux termes génériques détectés

---

## Implémentation

**Actions Concrètes** :

* [x] Définir STOPWORDS constante dans extractTerms.ts
* [x] Implémenter fonction `isStopword(term, category)`
* [x] Intégrer check dans extraction materials/colors/patterns
* [x] Tester avec 100 produits réels
* [x] Valider "fabric" ne pollue plus

**Fichiers Affectés** :
- `src/features/normalization/application/extractTerms.ts` (+30 lines)

**Code implémenté** :
```typescript
const STOPWORDS = {
  materials: ['fabric', 'textile', 'cloth', 'material', 'tissu', 'matière', 'tela', 'tessuto', 'materiale', 'stoff', 'gewebe'],
  colors: ['color', 'colour', 'couleur', 'colore', 'farbe'],
  patterns: ['pattern', 'motif', 'patrón', 'motivo', 'muster']
};

function isStopword(term: string, category: 'materials' | 'colors' | 'patterns'): boolean {
  const normalizedTerm = term.toLowerCase().trim();
  return STOPWORDS[category].some(stopword => 
    normalizedTerm === stopword || normalizedTerm === stopword + 's'
  );
}

// Dans extractTermsFromShopify():
if (materialTerm && !materials.includes(normalizedTag) && !isStopword(normalizedTag, 'materials')) {
  materials.push(normalizedTag);
}
```

---

## Validation

**Critères de Succès** :

* ✅ Terme "fabric" ne génère plus d'unknown_terms
* ✅ Taux de normalisation > 95%
* ✅ Performance extraction < 10ms par produit
* ✅ Support 5 langues (fr, en, es, it, de)

**Métriques à Surveiller** :

* Unknown terms count : Target < 5% des termes extraits
* Normalization rate : Target > 95%
* False positives (termes valides filtrés) : Target = 0

**Conditions de Révision** :

* Si nouveaux stopwords détectés fréquemment (>1/mois) → Considérer Option 1 (DB-driven)
* Si faux positifs détectés → Affiner liste stopwords
* Review après Phase 2 (5+ sources) pour valider liste complète

---

## Références

### Documents Liés

* `docs/sessions/SESSION_3_NORMALIZATION_SUCCESS.md`
* `src/features/normalization/application/extractTerms.ts`
* ADR-010: Dynamic Attribute System

### Ressources Externes

* [Stopwords in NLP - Wikipedia](https://en.wikipedia.org/wiki/Stop_word)
* [Lucene StopFilter](https://lucene.apache.org/core/8_0_0/core/org/apache/lucene/analysis/StopFilter.html)

### Discussions

* Session IA 31 Dec 2024 : Test normalisation 100 produits
* Découverte "fabric" pollution lors debug

---

## Notes Additionnelles

**Extensibilité future** :

Si besoin d'édition runtime des stopwords :
1. Créer table `stopwords` (term, category, locale)
2. Loader dans cache au démarrage
3. Invalider cache lors changements
4. UI admin pour CRUD

**Critère déclencheur** : Si >5 ajouts stopwords/mois

**Alternative patterns** :
- Regex-based exclusion pour patterns génériques
- Machine learning pour détecter stopwords automatiquement
- User feedback loop pour identifier nouveaux stopwords

---

## Historique des Révisions

| Date       | Changement                            | Auteur |
| ---------- | ------------------------------------- | ------ |
| 2024-12-31 | Création initiale                    | Thomas |
| 2024-12-31 | Implémentation et validation tests   | Thomas |

---

**Template Version** : 1.0

**Status** : ✅ Implemented & Validated
