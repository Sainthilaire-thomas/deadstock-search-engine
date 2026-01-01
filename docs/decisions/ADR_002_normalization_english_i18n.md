# ADR 002: Normalisation des Données en Anglais + i18n Layer

**Date** : 27 décembre 2025  
**Statut** : Accepté  
**Décideurs** : Thomas (Product Owner & Dev)  
**Contexte Phase** : Phase 0 - Conception  
**Supersedes** : Décision initiale de normalisation en français

---

## Contexte

Le moteur de recherche deadstock agrège des textiles depuis des sources multilingues :
- **My Little Coupon** : Français
- **The Fabric Sales** : Anglais
- **Futures sources** : Italien (EVA, Nona Source), Espagnol, Allemand, etc.

**Question initiale** : Dans quelle langue normaliser les données en base de données ?
- Option A : Français (langue principale marché MVP)
- Option B : Anglais (standard international)

**Décision initiale** : Normalisation en français avec mapping EN/FR → FR

**Révision** : Après réflexion, changement vers normalisation en anglais

---

## Décision

**Nous adoptons la normalisation en ANGLAIS avec i18n layer pour traductions.**

### Architecture

```
┌─────────────────────────────────────────────┐
│ Sources Multilingues                         │
│ - My Little Coupon (FR)                      │
│ - The Fabric Sales (EN)                      │
│ - Future: Nona Source (FR), EVA (IT)...     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ NORMALISATION       │
         │ → Tout vers ANGLAIS │
         │                     │
         │ "coton" → "cotton"  │
         │ "soie" → "silk"     │
         │ "bleu" → "blue"     │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ PostgreSQL Database │
         │ (ANGLAIS immuable)  │
         │                     │
         │ material_type: "cotton" │
         │ color: "navy blue"  │
         │ pattern: "floral"   │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ API / Backend       │
         │ Retourne données EN │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ i18n Layer          │
         │ (Frontend)          │
         │                     │
         │ FR: "coton"         │
         │ EN: "cotton"        │
         │ ES: "algodón"       │
         │ IT: "cotone"        │
         │ DE: "Baumwolle"     │
         └─────────────────────┘
```

### Données Normalisées (Exemples)

**En Base de Données** (ANGLAIS) :
```json
{
  "material_type": "cotton",
  "color": "navy blue",
  "pattern": "floral",
  "composition": {"cotton": 80, "polyester": 20}
}
```

**Affichage Frontend** (selon locale) :
- 🇫🇷 FR : "Coton, Bleu marine, Fleuri"
- 🇬🇧 EN : "Cotton, Navy blue, Floral"
- 🇪🇸 ES : "Algodón, Azul marino, Floral"
- 🇮🇹 IT : "Cotone, Blu marino, Floreale"

---

## Options Considérées

### Option 1 : Normalisation en Français

**Description** : Toutes les données normalisées en français

```sql
material_type: "coton"
color: "bleu marine"
pattern: "fleuri"
```

**Avantages** :
- Marché principal MVP est français
- Sources principales parlent français
- Pas de traduction FR pour affichage FR

**Inconvénients** :
- ❌ Pas standard international
- ❌ Scale difficile (sources IT, ES → FR artificiel)
- ❌ API pas friendly pour clients internationaux
- ❌ Doublons potentiels ("coton" vs "cotton" si erreur normalisation)
- ❌ Recherche moins intuitive pour non-francophones

**Coût/Complexité** : Moyen au début, Élevé au scale

---

### Option 2 : Normalisation en Anglais (CHOISI)

**Description** : Toutes les données normalisées en anglais, traductions via i18n

```sql
material_type: "cotton"
color: "navy blue"
pattern: "floral"
```

**Avantages** :
- ✅ Standard international textile/mode
- ✅ Scale naturel (toutes langues → EN)
- ✅ API-friendly (clients du monde entier)
- ✅ Pas de doublons (un seul standard)
- ✅ Recherche intuitive multilingue
- ✅ Database propre et professionnelle
- ✅ Futures intégrations facilitées

**Inconvénients** :
- Ajout layer i18n frontend (mais nécessaire de toute façon)
- Sources FR nécessitent mapping FR → EN (acceptable)

**Coût/Complexité** : Moyen initial, Faible au scale

---

### Option 3 : Multi-langue en DB

**Description** : Stocker toutes les langues en JSONB

```sql
material_type: {"en": "cotton", "fr": "coton", "es": "algodón"}
```

**Avantages** :
- Pas de traduction frontend nécessaire

**Inconvénients** :
- ❌ Complexité DB massive
- ❌ Requêtes compliquées
- ❌ Taille DB x5
- ❌ Maintenance traductions en DB (cauchemar)
- ❌ Over-engineering extrême

**Coût/Complexité** : Très élevé

---

## Rationale (Justification)

### Pourquoi Anglais ?

**1. Standard International Textile**
- Industrie textile communique en anglais globalement
- Terminologie standard reconnue mondialement
- Documentation technique textile en anglais
- Foires internationales (Première Vision, etc.) en anglais

**2. Scale International Évident**

**Phase 1** (MVP) :
- MLC (FR) : "coton" → normalize → "cotton"
- TFS (EN) : "cotton" → passthrough → "cotton"

**Phase 2-3** (Extension) :
- EVA (IT) : "cotone" → normalize → "cotton"
- Beglarian (FR) : "coton" → normalize → "cotton"
- Fabric House (DE) : "Baumwolle" → normalize → "cotton"

**Résultat** : Database cohérente, zéro doublon, scaling linéaire

**3. API-First Architecture**

Phase 4+ : API publique pour designers/marques
```json
GET /api/textiles?material=cotton&color=blue

// Clients attendent réponse EN (standard)
{
  "textiles": [
    {
      "material_type": "cotton",
      "color": "navy blue"
    }
  ]
}
```

Clients peuvent implémenter leur propre i18n avec les données EN.

**4. Recherche Multilingue Facilitée**

Avec normalisation EN + i18n layer :
- User FR tape "coton" → traduit "cotton" → search DB
- User EN tape "cotton" → search DB direct
- User ES tape "algodón" → traduit "cotton" → search DB

Avec normalisation FR :
- User EN tape "cotton" → traduit "coton" → search DB (contre-intuitif)
- Nécessite traduction inverse (EN→FR) pour tous

**5. Maintenance Simplifiée**

**Normalisation EN** :
- 1 dictionnaire FR→EN (30 entrées matériaux)
- 1 dictionnaire IT→EN (30 entrées)
- 1 dictionnaire ES→EN (30 entrées)
- Total : ~100 mappings

**Normalisation FR** :
- 1 dictionnaire EN→FR
- 1 dictionnaire IT→FR
- 1 dictionnaire ES→FR
- 1 dictionnaire DE→FR
- Pas naturel, artificiel

**6. Standard Développeurs**

- Code reviews : développeurs internationaux comprennent "cotton"
- Documentation : code en anglais, données en anglais = cohérence
- Open source futur : contribution internationale facilitée

### Pourquoi i18n Layer ?

**Séparation des Préoccupations** :
- **Database** : Données factuelles immuables (EN)
- **Business Logic** : Traitement données (EN)
- **Presentation** : Affichage selon locale user (FR/EN/ES/IT)

**Flexibilité** :
- Ajouter langue = ajouter fichier traduction (5 min)
- Pas de migration DB
- Pas de reprocessing scrapers

**Best Practice** :
- Standard industrie (next-intl, i18next)
- Utilisé par tous les sites internationaux
- React/Next.js natif

---

## Conséquences

### Positives

**Court Terme (Phase 1)** :
- ✅ Code normalisation propre (FR→EN, EN→passthrough)
- ✅ Database professionnelle et standard
- ✅ Aucun doublon de données
- ✅ Recherche performante (1 seul terme par concept)

**Moyen Terme (Phase 2-4)** :
- ✅ Ajout nouvelles sources trivial (IT→EN, ES→EN)
- ✅ API publique naturelle (clients attendent EN)
- ✅ Pas de refactoring DB nécessaire
- ✅ Traductions frontend ajoutées incrémentalement

**Long Terme (Phase 7+)** :
- ✅ Expansion internationale facilitée
- ✅ Partenariats API standardisés
- ✅ Open source possible (code international)
- ✅ Recrutement développeurs facilité (standard)

**UX** :
- ✅ Users FR voient "Coton" (traduit)
- ✅ Users EN voient "Cotton" (natif)
- ✅ Users ES voient "Algodón" (traduit)
- ✅ Recherche fonctionne dans toutes langues

### Négatives (et Mitigation)

**1. Layer i18n Nécessaire**
- **Impact** : +1 semaine développement Phase 1 pour setup i18n
- **Mitigation** :
  - next-intl très simple à setup (1 jour max)
  - Nécessaire de toute façon pour interface multilingue
  - Investissement rentabilisé dès Phase 2

**2. Mapping FR→EN à Maintenir**
- **Impact** : Dictionnaire FR→EN à créer et maintenir
- **Mitigation** :
  - Liste courte (~50 termes max)
  - Créé une fois, rarement modifié
  - Documenté dans code (TypeScript types)
  - Même effort que n'importe quelle normalisation

**3. Scraping MLC Plus Complexe**
- **Impact** : Parsing FR + normalisation EN (vs FR direct)
- **Mitigation** :
  - Fonction `normalizeMaterial(text, 'fr')` encapsule logique
  - Testable unitairement
  - Réutilisable pour futures sources FR

### Neutres

- DB légèrement moins "intuitive" pour dev FR (mais standard pro)
- Tests doivent vérifier normalisation EN (vs FR)
- Documentation doit expliquer choix (ce ADR)

---

## Implémentation

### Actions Immédiates

- [x] **Mettre à jour SCRAPING_PLAN.md** (fait)
  - Section normalisation → anglais
  - Mapping FR/EN → EN
  - Exemples mis à jour
  
- [ ] **Créer dictionnaires normalisation** (Phase 1)
  - `common/dictionaries/materials.ts`
  - `common/dictionaries/colors.ts`
  - `common/dictionaries/patterns.ts`
  
- [ ] **Implémenter fonctions normalisation** (Phase 1)
  - `normalizeMaterial(text, sourceLang)`
  - `normalizeColor(text, sourceLang)`
  - `normalizePattern(text, sourceLang)`
  
- [ ] **Setup i18n Frontend** (Phase 1)
  - Install next-intl
  - Créer `locales/fr.json`, `locales/en.json`
  - Traduire matériaux, couleurs, patterns

### Fichiers à Créer

```
src/
├── lib/
│   └── normalization/
│       ├── dictionaries/
│       │   ├── materials.ts      # FR→EN, IT→EN, ES→EN
│       │   ├── colors.ts         # FR→EN, IT→EN, ES→EN
│       │   └── patterns.ts       # FR→EN, IT→EN, ES→EN
│       │
│       ├── normalize.ts          # Fonctions normalization
│       └── types.ts              # SourceLang = 'fr'|'en'|'it'|'es'
│
└── locales/
    ├── fr.json                   # Traductions FR
    ├── en.json                   # Traductions EN (passthrough)
    ├── es.json                   # Traductions ES (Phase 3)
    └── it.json                   # Traductions IT (Phase 3)
```

### Exemple Dictionnaire

```typescript
// lib/normalization/dictionaries/materials.ts
export const materialDictionary = {
  fr: {
    'coton': 'cotton',
    'soie': 'silk',
    'laine': 'wool',
    'lin': 'linen',
    'viscose': 'viscose',
    // ... complete
  },
  en: {
    'cotton': 'cotton', // passthrough
    'silk': 'silk',
    // ...
  },
  it: {
    'cotone': 'cotton',
    'seta': 'silk',
    // ... Phase 2+
  }
};
```

### Exemple i18n

```json
// locales/fr.json
{
  "materials": {
    "cotton": "Coton",
    "silk": "Soie",
    "wool": "Laine"
  },
  "colors": {
    "white": "Blanc",
    "black": "Noir",
    "navy blue": "Bleu marine"
  }
}
```

---

## Validation

### Critères de Succès

**Phase 1** :
- ✅ Tous matériaux/couleurs/patterns en DB sont EN
- ✅ Interface FR affiche correctement "Coton", "Soie"
- ✅ Interface EN affiche correctement "Cotton", "Silk"
- ✅ Recherche fonctionne dans les 2 langues

**Phase 2-3** :
- ✅ Ajout source italienne : mapping IT→EN fonctionne
- ✅ Ajout traduction ES sans migration DB

### Métriques

- **Couverture normalisation** : >95% matériaux correctement mappés
- **Couverture traductions** : 100% termes DB traduits FR/EN
- **Performance** : Recherche <200ms (normalisation pas d'impact)

### Conditions de Révision

**Révision obligatoire si** :
- Normalisation EN cause problèmes utilisateurs FR
- Performance traductions impacte UX
- Clients API demandent autre format

**Probabilité révision** : Très faible (décision solidement architecturée)

---

## Références

### Documents Liés

- `docs/project/SCRAPING_PLAN.md` (Section Normalisation mise à jour)
- `docs/decisions/ADR_001_database_architecture.md`
- `docs/state/TECH_STACK.md`

### Standards Industrie

- [ISO 639 Language Codes](https://www.iso.org/iso-639-language-codes.html)
- [Textile Industry Standard Terminology](https://textilelearner.net/)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [i18next Best Practices](https://www.i18next.com/)

### Exemples Industrie

- **Zalando** : DB en anglais, i18n 17 langues
- **ASOS** : DB en anglais, i18n 12 langues
- **Farfetch** : DB en anglais, i18n 9 langues

---

## Notes Additionnelles

### Retours Anticipés

**"Pourquoi pas multilingue en DB ?"**
→ Complexité exponentielle, maintenance cauchemar, over-engineering

**"Et si users français veulent rechercher 'coton' ?"**
→ i18n layer traduit "coton" → "cotton" avant query DB. Transparent pour user.

**"Performance des traductions ?"**
→ Dictionnaires en mémoire, lookup O(1), zéro impact performance

### Évolutions Futures

**Phase 7+ : Machine Learning**
- Auto-détection langue source
- Amélioration mappings avec ML
- Suggestions traductions manquantes

**Long Terme : API Traduction**
- Offrir API traduction aux clients
- Exemple : `GET /api/translate/materials?term=cotton&to=fr` → "Coton"

---

## Historique des Révisions

| Date | Changement | Auteur |
|------|-----------|--------|
| 2025-12-27 | Création ADR - Décision normalisation EN + i18n | Thomas |

---

**Statut Final** : ✅ **ACCEPTÉ**  
**Impact** : Architecture fondamentale (database + frontend)  
**Prochaine Action** : Implémenter dictionnaires et fonctions normalisation Phase 1
