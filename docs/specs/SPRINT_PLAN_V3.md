# SPRINT PLAN - Boards & Admin Enhancement

**Version** : 3.0
**Date** : 14 Janvier 2026
**Contexte** : Post-MVP Phase 1, préparation Phase 2

---

## Vue d'Ensemble

```
SPRINTS BOARDS                          SPRINTS ADMIN
──────────────                          ─────────────

Sprint B1: Color Picker LAB ✅          Sprint A1: Coverage par source
Sprint B2: Recherche contextuelle ✅    Sprint A2: Filtres unknowns
Sprint B3: Indicateurs stock ✅         Sprint A3: Edit dictionary
Sprint B4: Potentiel Discovery          Sprint A4: Stock coverage dashboard
Sprint B5: Scraping guidé               Sprint A5: Scraping jobs UI
Sprint B6: Fusion contraintes           Sprint A6: Quality alerts

── NOUVEAU : Attributs Comportementaux & AI ──

Sprint B7: Attributs déduits + AI       Sprint A7: Tuning déduction & AI
```

---

## SPRINTS BOARDS (Recherche Contextuelle)

### Sprint B1 : Color Picker avec Distance LAB ✅ TERMINÉ
**Durée estimée** : 4h
**Dépendances** : Aucune
**Status** : ✅ Complété

---

### Sprint B2 : Recherche Contextuelle Basique ✅ TERMINÉ
**Durée estimée** : 5h
**Dépendances** : B1
**Status** : ✅ Complété

---

### Sprint B3 : Indicateurs Stock et Suffisance ✅ TERMINÉ
**Durée estimée** : 3h
**Dépendances** : B2
**Status** : ✅ Complété

---

### Sprint B4 : Estimation Potentiel Discovery
**Durée estimée** : 4h
**Dépendances** : B3

#### B4.1 - Fonction mapping couleur → tags Discovery (1h)
```
Fichier : src/features/admin/services/colorTagMapping.ts

- [ ] getColorTagsForSite(siteId, targetColor): ColorTagMapping
- [ ] Requête dictionary_mappings pour termes
- [ ] Requête site_profiles.global_analysis.allTags
- [ ] Matching intelligent (includes, lowercase)
- [ ] Retour avec estimatedCount
```

#### B4.2 - API endpoint estimation potentiel (1h)
```
Fichier : src/app/api/search/potential/route.ts

- [ ] GET avec query params (colors[])
- [ ] Pour chaque site avec Discovery :
    - Estimer potentiel par couleur
    - Soustraire déjà scrappés
- [ ] Retour array PotentialEstimate[]
```

#### B4.3 - Composant PotentialSourcesCard (1.5h)
```
Fichier : src/features/boards/components/PotentialSourcesCard.tsx

- [ ] Tableau sources avec potentiel estimé
- [ ] Affichage tags Discovery utilisés
- [ ] Date dernière Discovery (fraîcheur)
- [ ] Bouton "Importer" par source (disabled pour l'instant)
```

#### B4.4 - Intégration panneau recherche (30min)
```
- [ ] Section "Potentiel non importé" dans ContextualSearchPanel
- [ ] Chargement async après résultats stock
- [ ] Collapse par défaut si résultats suffisants
```

**Livrable** : Affichage potentiel Discovery dans recherche contextuelle

---

### Sprint B5 : Scraping Guidé Utilisateur
**Durée estimée** : 6h
**Dépendances** : B4, A5

#### B5.1 - Table scraping_jobs (45min)
```
Fichier : database/migrations/028_scraping_jobs.sql

- [ ] CREATE TABLE scraping_jobs
- [ ] Colonnes: id, site_id, type, status, priority, config, results...
- [ ] Index sur status, site_id
- [ ] Fonction update_timestamp trigger
```

#### B5.2 - Service scraping guidé (2h)
```
Fichier : src/features/admin/services/guidedScrapingService.ts

- [ ] Interface GuidedScrapingRequest
- [ ] Fonction requestGuidedScraping(request)
- [ ] Création job avec config tags
- [ ] Fonction executeGuidedScraping(jobId)
- [ ] Filtrage produits par tags
- [ ] Sauvegarde avec pipeline existant
```

#### B5.3 - API endpoints scraping guidé (1h)
```
Fichier : src/app/api/scraping/guided/route.ts

- [ ] POST créer job scraping guidé
- [ ] Validation requête
- [ ] Retour jobId + status initial

Fichier : src/app/api/scraping/jobs/[jobId]/route.ts

- [ ] GET status job
- [ ] Retour progress et résultats
```

#### B5.4 - Composant GuidedScrapingButton (1.5h)
```
Fichier : src/features/boards/components/GuidedScrapingButton.tsx

- [ ] Bouton "Importer" avec état loading
- [ ] Polling status job
- [ ] Progress bar pendant import
- [ ] Notification succès/erreur
- [ ] Refresh résultats après completion
```

#### B5.5 - Intégration panneau (45min)
```
- [ ] Activer boutons dans PotentialSourcesCard
- [ ] Gestion état multi-imports simultanés
- [ ] Mise à jour compteurs après import
```

**Livrable** : Import à la demande depuis recherche contextuelle

---

### Sprint B6 : Fusion Contraintes Multiples
**Durée estimée** : 4h
**Dépendances** : B5

#### B6.1 - Contexte contraintes board (1h)
```
Fichier : src/features/boards/context/ConstraintsContext.tsx

- [ ] Provider avec state contraintes actives
- [ ] Actions: setColorConstraint, setQuantityConstraint, clearAll
- [ ] Fusion automatique des contraintes
- [ ] Persistence dans URL ou localStorage
```

#### B6.2 - Recherche textile similaire (1.5h)
```
Fichier : src/features/boards/components/elements/TextileElement.tsx

- [ ] Bouton "Trouver similaires"
- [ ] Extraction contraintes: fiber, color, weave
- [ ] Appel recherche contextuelle avec contraintes matière
```

#### B6.3 - UI contraintes actives (1h)
```
Fichier : src/features/boards/components/ActiveConstraints.tsx

- [ ] Affichage chips contraintes actives
- [ ] Bouton × pour supprimer chaque contrainte
- [ ] "Tout effacer"
- [ ] Preview du filtre SQL résultant
```

#### B6.4 - Tests E2E flow complet (30min)
```
- [ ] Test: Palette → couleur → recherche → ajout board
- [ ] Test: Calcul → toggle filtre → résultats filtrés
- [ ] Test: Textile → similaires → résultats
```

**Livrable** : Recherche contextuelle complète avec fusion contraintes

---

### Sprint B7 : Attributs Comportementaux & Affinage AI 🆕
**Durée estimée** : 19h
**Dépendances** : B6, A7.1-A7.3
**Priorité** : P2

> **Objectif** : Permettre aux designers de filtrer par propriétés comportementales (drape, stretch, opacity) via déduction automatique, puis affiner avec analyse AI des images.

#### B7.1 - Table et seed règles de déduction (3h)
```
Fichier : database/migrations/030_deduction_rules.sql

- [ ] CREATE TABLE deduction_rules
      - id, fiber_match[], weave_match[], weight_match[]
      - composition_contains[], target_attribute, output_value
      - confidence, priority, is_active, notes
- [ ] CREATE TABLE image_analyses (cache AI)
      - textile_id, image_url, sheen, texture, opacity, drape
      - *_confidence, model_version, analyzed_at
- [ ] Index pour lookup rapide
- [ ] Seed ~20 règles initiales (viscose→fluid, elastane→stretch, etc.)
```

#### B7.2 - Service de déduction (3h)
```
Fichier : src/features/normalization/services/attributeDeductionService.ts

- [ ] Interface DeductionInput { fiber, weave, weight, composition }
- [ ] Interface DeducedAttribute { attribute, value, confidence, rule_id }
- [ ] Fonction loadActiveRules(): DeductionRule[]
- [ ] Fonction matchesConditions(input, rule): boolean
- [ ] Fonction deduceAttributes(input): DeducedAttribute[]
- [ ] Fonction deduplicateByAttribute(results): DeducedAttribute[]
- [ ] Tests unitaires avec cas concrets
```

#### B7.3 - Intégration scraping + vue matérialisée (2h)
```
Fichier : src/features/admin/infrastructure/scrapingRepo.ts

- [ ] Appeler deduceAttributes() après normalisation
- [ ] Sauvegarder dans textile_attributes avec source='deduction'

Fichier : database/migrations/031_textiles_search_deduced.sql

- [ ] ALTER textiles_search ADD drape, stretch, opacity, weight_class
- [ ] Pivoter depuis textile_attributes WHERE source='deduction'
- [ ] REFRESH MATERIALIZED VIEW
```

#### B7.4 - UI filtres attributs déduits (3h)
```
Fichier : src/components/search/DeducedFilters.tsx

- [ ] Composant FilterChip avec confidence indicator
- [ ] Filtres: Drape (fluid/moderate/structured)
- [ ] Filtres: Stretch (none/2-way/4-way)
- [ ] Filtres: Opacity (sheer/semi-sheer/opaque)
- [ ] Filtres: Weight (light/medium/heavy)
- [ ] Tooltip "Estimé avec X% de confiance"

Fichier : src/components/search/Filters.tsx

- [ ] Intégrer DeducedFilters dans panneau existant
- [ ] Section "Propriétés estimées" pliable
```

#### B7.5 - API affinage AI (4h)
```
Fichier : src/app/api/search/ai-refine/route.ts

- [ ] POST handler avec validation Zod
- [ ] Input: textile_ids[] (max 50), criteria { sheen, texture, opacity }
- [ ] Vérifier cache image_analyses avant appel AI
- [ ] Appeler Claude Vision pour images non cachées
- [ ] Parser réponse JSON, calculer match_score
- [ ] Sauvegarder en cache
- [ ] Retour: results[] triés par match_score

Fichier : src/features/ai/services/imageAnalysisService.ts

- [ ] Fonction analyzeTextileImage(imageUrl): ImageAnalysis
- [ ] Prompt optimisé pour extraction sheen/texture/opacity/drape
- [ ] Fonction calculateMatchScore(analysis, criteria): number
- [ ] Gestion erreurs et timeouts
```

#### B7.6 - UI "Affiner avec AI" (4h)
```
Fichier : src/features/search/components/AIRefinePanel.tsx

- [ ] Bouton "🔮 Affiner avec AI" (apparaît si < 50 résultats)
- [ ] Modal de sélection critères:
      - Brillance: matte / subtle / shiny / peu importe
      - Texture: lisse / grain fin / texturé / peu importe
      - Transparence: opaque / semi / sheer / peu importe
- [ ] Affichage coût estimé (nb images × 0.015€)
- [ ] Progress bar pendant analyse
- [ ] Résultats avec match score et badges

Fichier : src/features/search/components/AIRefineResultCard.tsx

- [ ] Affichage textile avec score match (ex: 94%)
- [ ] Badges vert/orange selon match critères
- [ ] Tooltip détail par critère analysé
```

**Livrable** : Filtres comportementaux + affinage AI sur sélection réduite

---

## SPRINTS ADMIN (Amélioration Qualité)

### Sprint A1 : Coverage par Source
**Durée estimée** : 2h
**Dépendances** : Aucune

#### A1.1 - Query coverage par site (45min)
```
Fichier : src/features/admin/infrastructure/qualityRepo.ts

- [ ] Fonction getCoverageBySource(): CoverageBySource[]
- [ ] GROUP BY site_id avec COUNT attributs
- [ ] Calcul % coverage par attribut par source
```

#### A1.2 - UI breakdown par source (1h15)
```
Fichier : src/app/admin/tuning/quality/page.tsx

- [ ] Section "Coverage par source"
- [ ] Tableau : Source | fiber | color | width | ...
- [ ] Barres de progression colorées
- [ ] Tri par colonne
```

**Livrable** : Dashboard qualité avec breakdown par source

---

### Sprint A2 : Filtres Unknowns Avancés
**Durée estimée** : 2h
**Dépendances** : Aucune

#### A2.1 - API filtres unknowns (45min)
```
Fichier : src/app/api/admin/unknowns/route.ts

- [ ] Query params: source, category, minOccurrences
- [ ] Filtrage SQL correspondant
- [ ] Pagination
```

#### A2.2 - UI filtres (1h15)
```
Fichier : src/app/admin/tuning/page.tsx

- [ ] Dropdown filtre source
- [ ] Dropdown filtre catégorie
- [ ] Slider occurrences minimum
- [ ] Bouton reset filtres
- [ ] URL sync (query params)
```

**Livrable** : Filtres avancés sur page unknowns

---

### Sprint A3 : Edit/Delete Dictionary
**Durée estimée** : 3h
**Dépendances** : Aucune

#### A3.1 - API CRUD mappings (1h)
```
Fichier : src/app/api/admin/dictionary/[id]/route.ts

- [ ] PUT update mapping
- [ ] DELETE suppression mapping
- [ ] Validation données
- [ ] Audit log (qui a modifié quoi)
```

#### A3.2 - Modal édition mapping (1.5h)
```
Fichier : src/features/admin/components/EditMappingModal.tsx

- [ ] Form: source_term, locale, category, translations
- [ ] Validation
- [ ] Preview du changement
- [ ] Boutons Save / Cancel / Delete
```

#### A3.3 - Intégration page dictionary (30min)
```
Fichier : src/app/admin/dictionary/page.tsx

- [ ] Bouton edit par ligne
- [ ] Bouton delete avec confirmation
- [ ] Refresh après modification
```

**Livrable** : Gestion complète du dictionnaire

---

### Sprint A4 : Stock Coverage Dashboard
**Durée estimée** : 3h
**Dépendances** : A1

#### A4.1 - Query stock coverage (45min)
```
Fichier : src/features/admin/infrastructure/qualityRepo.ts

- [ ] Fonction getStockCoverage(): StockCoverage
- [ ] COUNT(*) vs COUNT(attribute) sur textiles_search
- [ ] Par attribut: fiber, color, width, pattern, weave
```

#### A4.2 - Distinction Discovery vs Stock (1h)
```
Fichier : src/app/admin/tuning/quality/page.tsx

- [ ] Section "Discovery Coverage" (existant)
- [ ] Section "Stock Coverage" (nouveau)
- [ ] Explication de la différence
- [ ] Indicateurs de gap (Discovery vs Stock)
```

#### A4.3 - Alertes coverage critique (1h15)
```
- [ ] Highlight rouge si coverage < 20%
- [ ] Suggestion action (enrichir dictionnaire, re-scraper)
- [ ] Lien vers filtres unknowns correspondants
```

**Livrable** : Dashboard avec Discovery + Stock coverage

---

### Sprint A5 : Scraping Jobs UI
**Durée estimée** : 4h
**Dépendances** : B5 (table scraping_jobs)

#### A5.1 - API liste jobs (45min)
```
Fichier : src/app/api/admin/scraping/jobs/route.ts

- [ ] GET liste paginée
- [ ] Filtres: status, type, site_id
- [ ] Tri par date
```

#### A5.2 - Page jobs admin (2h)
```
Fichier : src/app/admin/jobs/page.tsx (enrichir existant)

- [ ] Tableau jobs avec colonnes: type, site, status, progress, date
- [ ] Badges status colorés
- [ ] Détails config au clic
- [ ] Pagination
```

#### A5.3 - Détail job avec résultats (1h15)
```
Fichier : src/app/admin/jobs/[jobId]/page.tsx

- [ ] Affichage config complète
- [ ] Résultats détaillés (saved, skipped, errors)
- [ ] Timeline d'exécution
- [ ] Bouton re-run si failed
```

**Livrable** : Gestion complète des jobs scraping

---

### Sprint A6 : Quality Alerts
**Durée estimée** : 3h
**Dépendances** : A4

#### A6.1 - Définition seuils alertes (30min)
```
Fichier : src/features/admin/config/qualityThresholds.ts

- [ ] Seuils par attribut (fiber > 80%, color > 70%, width > 30%)
- [ ] Niveaux: ok, warning, critical
- [ ] Messages associés
```

#### A6.2 - Composant AlertBanner (1h)
```
Fichier : src/features/admin/components/QualityAlertBanner.tsx

- [ ] Affichage alertes actives
- [ ] Icône + message + action suggérée
- [ ] Dismiss temporaire
- [ ] Lien vers page concernée
```

#### A6.3 - Intégration dashboard admin (1h)
```
Fichier : src/app/admin/page.tsx

- [ ] Section alertes en haut
- [ ] Check automatique au chargement
- [ ] Historique alertes résolues
```

#### A6.4 - Webhook/notification (optionnel) (30min)
```
- [ ] Endpoint pour check programmatique
- [ ] Intégration future Slack/email
```

**Livrable** : Système d'alertes qualité proactif

---

### Sprint A7 : Tuning Déduction & Monitoring AI 🆕
**Durée estimée** : 19h
**Dépendances** : A4, B7.1
**Priorité** : P2

> **Objectif** : Permettre à l'admin de gérer les règles de déduction, valider les résultats, et monitorer les coûts AI.

#### A7.1 - Page liste règles de déduction (3h)
```
Fichier : src/app/admin/tuning/deduction/page.tsx

- [ ] Tableau règles avec colonnes:
      - Nom, Conditions, Résultat, Confidence, Utilisations, Status
- [ ] Toggle activer/désactiver par règle
- [ ] Bouton [+ Nouvelle règle]
- [ ] Tri et filtres par target_attribute
- [ ] Stats: nb textiles affectés par règle
```

#### A7.2 - Éditeur de règle (4h)
```
Fichier : src/features/admin/components/DeductionRuleEditor.tsx

- [ ] Form conditions:
      - Fiber: checkboxes multi-select
      - Weave: checkboxes multi-select
      - Weight: checkboxes (light/medium/heavy/any)
      - Composition contains: input texte
- [ ] Form résultat:
      - Attribut cible: dropdown (drape/stretch/opacity/weight_class)
      - Valeur: dropdown dynamique selon attribut
      - Confidence: slider 0.5-1.0
      - Priorité: input number
- [ ] Preview: "Cette règle s'appliquerait à X textiles"
- [ ] Validation avant save
```

#### A7.3 - Testeur de règle interactif (2h)
```
Fichier : src/app/admin/tuning/deduction/test/page.tsx

- [ ] Input: fiber, weave, weight, composition (texte libre)
- [ ] Bouton [Tester]
- [ ] Output: liste attributs déduits avec règle source
- [ ] Highlight règles en conflit
- [ ] Lien vers éditeur de règle
```

#### A7.4 - Dashboard qualité déduction (3h)
```
Fichier : src/app/admin/tuning/deduction/quality/page.tsx

- [ ] Couverture par attribut déduit:
      - Drape: X% (Y/Z textiles)
      - Stretch: X% (Y/Z textiles)
      - Opacity: X% (Y/Z textiles)
- [ ] Distribution des confidences (barres)
- [ ] Liste textiles sans déduction possible
- [ ] Suggestions: "Ajouter règle pour fiber=X + weave=Y"
- [ ] Alertes conflits entre règles
```

#### A7.5 - Monitoring analyses AI (2h)
```
Fichier : src/app/admin/tuning/ai-monitoring/page.tsx

- [ ] Stats globales:
      - Total images analysées
      - Images en cache (%)
      - Coût total ce mois
      - Coût moyen par image
- [ ] Graphique utilisation par jour/semaine
- [ ] Tableau comparaison AI vs Déduction:
      - Accord: X%
      - Désaccords: liste avec liens
- [ ] Bouton "Purger cache" (si images changées)
```

#### A7.6 - Interface validation manuelle (3h)
```
Fichier : src/app/admin/tuning/deduction/validate/page.tsx

- [ ] File de textiles à valider (low confidence ou random sample)
- [ ] Pour chaque textile:
      - Image + infos de base
      - Déductions actuelles avec confidence
      - Boutons [✅ Correct] [❌ Incorrect → dropdown correction]
- [ ] Stats: X validés aujourd'hui, Y% corrects
- [ ] Export corrections pour améliorer règles

Fichier : src/features/admin/services/validationService.ts

- [ ] Fonction saveValidation(textile_id, attribute, is_correct, correction?)
- [ ] Fonction getValidationStats(): ValidationStats
- [ ] Fonction suggestRuleImprovements(): RuleSuggestion[]
```

#### A7.7 - Alertes et suggestions automatiques (2h)
```
Fichier : src/features/admin/services/deductionAlertService.ts

- [ ] Détection conflits entre règles
- [ ] Détection gaps de couverture
- [ ] Génération suggestions nouvelles règles basées sur:
      - Combinaisons fiber+weave fréquentes sans règle
      - Corrections manuelles récurrentes

Fichier : src/features/admin/components/DeductionAlertBanner.tsx

- [ ] Affichage alertes déduction
- [ ] Lien vers action corrective
- [ ] Dismiss avec raison
```

**Livrable** : Gestion complète des règles de déduction + monitoring AI

---

## Architecture Tuning Mise à Jour

```
/admin/tuning/
│
├── /attributes              # Attributs PHYSIQUES (classification)
│   ├── /dictionary          # dictionary_mappings (fiber, color, pattern)
│   ├── /unknowns            # unknown_terms
│   └── /quality             # Coverage par source
│
├── /extraction              # Attributs COMMERCIAUX (dimensions, prix)
│   ├── /rules               # extraction_rules (width, weight, price)
│   ├── /sale-type           # Détection sale_type par site
│   └── /quality             # Taux extraction par source
│
└── /deduction               # Attributs COMPORTEMENTAUX (drape, stretch) 🆕
    ├── /rules               # deduction_rules
    ├── /test                # Testeur interactif
    ├── /validate            # Validation manuelle
    ├── /ai-monitoring       # Stats et coûts AI
    └── /quality             # Coverage et conflits
```

---

## Ordre d'Exécution Recommandé

### Phase 1 : Fondations (Sprints parallélisables) ✅ EN COURS
```
Semaine 1:
├── B1: Color Picker LAB (4h)           ✅ TERMINÉ
├── A1: Coverage par source (2h)        ← Quick win
└── A2: Filtres unknowns (2h)           ← Quick win
```

### Phase 2 : Recherche Contextuelle Core ✅ EN COURS
```
Semaine 2:
├── B2: Recherche contextuelle (5h)     ✅ TERMINÉ
├── B3: Indicateurs stock (3h)          ✅ TERMINÉ
└── A3: Edit dictionary (3h)            ← Indépendant
```

### Phase 3 : Enrichissement
```
Semaine 3:
├── B4: Potentiel Discovery (4h)        ← Après B3
├── A4: Stock coverage (3h)             ← Après A1
└── A5: Jobs UI (4h)                    ← Prérequis B5
```

### Phase 4 : Scraping Guidé
```
Semaine 4:
├── B5: Scraping guidé (6h)             ← Après B4, A5
├── B6: Fusion contraintes (4h)         ← Après B5
└── A6: Quality alerts (3h)             ← Après A4
```

### Phase 5 : Attributs Comportementaux 🆕
```
Semaine 5-6:
├── B7.1-B7.3: Déduction base (8h)      ← Après B6
├── A7.1-A7.3: Admin règles (9h)        ← Parallèle B7.1-B7.3
└── B7.4: UI filtres déduits (3h)       ← Après B7.3
```

### Phase 6 : Affinage AI 🆕
```
Semaine 7:
├── B7.5-B7.6: API + UI AI (8h)         ← Après B7.4
├── A7.4-A7.5: Dashboard qualité (5h)   ← Après A7.3
└── A7.6-A7.7: Validation + alertes (5h) ← Après A7.5
```

---

## Résumé Effort

| Sprint | Durée | Priorité | Dépendances | Status |
|--------|-------|----------|-------------|--------|
| **BOARDS** |
| B1: Color Picker LAB | 4h | P1 | - | ✅ |
| B2: Recherche contextuelle | 5h | P1 | B1 | ✅ |
| B3: Indicateurs stock | 3h | P1 | B2 | ✅ |
| B4: Potentiel Discovery | 4h | P2 | B3 | 🔲 |
| B5: Scraping guidé | 6h | P2 | B4, A5 | 🔲 |
| B6: Fusion contraintes | 4h | P2 | B5 | 🔲 |
| **B7: Attributs déduits + AI** | **19h** | **P2** | **B6** | 🆕 |
| **Sous-total Boards** | **45h** |
| **ADMIN** |
| A1: Coverage par source | 2h | P1 | - | 🔲 |
| A2: Filtres unknowns | 2h | P1 | - | 🔲 |
| A3: Edit dictionary | 3h | P1 | - | 🔲 |
| A4: Stock coverage | 3h | P2 | A1 | 🔲 |
| A5: Jobs UI | 4h | P2 | B5.1 | 🔲 |
| A6: Quality alerts | 3h | P3 | A4 | 🔲 |
| **A7: Tuning déduction & AI** | **19h** | **P2** | **A4, B7.1** | 🆕 |
| **Sous-total Admin** | **36h** |
| **TOTAL** | **81h** | | |

---

## Dépendances Sprint B7/A7

```
B7.1 Table deduction_rules ──┐
                             ├──→ B7.2 Service déduction ──→ B7.3 Vue matérialisée
A7.1 Liste règles ───────────┘                                      │
                                                                     ▼
A7.2 Éditeur règle ──→ A7.3 Testeur                          B7.4 Filtres UI
                                                                     │
                                                                     ▼
                                                    B7.5 API AI ──→ B7.6 UI AI
                                                         │
                                                         ▼
                                                    A7.5 Monitoring AI
                                                         │
                                                         ▼
A7.4 Dashboard qualité ──→ A7.6 Validation ──→ A7.7 Alertes
```

---

## Critères de Validation

### Sprint B1 ✅
- [x] `hexToLab('#8B0000')` retourne valeurs LAB correctes
- [x] `findMatchingColors('#8B0000')` retourne 'burgundy' en premier
- [x] Composant affiche barres de confiance

### Sprint B2 ✅
- [x] Clic sur couleur palette ouvre panneau
- [x] Résultats affichent tissus de la bonne couleur
- [x] Bouton "Ajouter au board" fonctionne

### Sprint B3 ✅
- [x] Badge vert si stock suffisant
- [x] Badge orange si stock insuffisant
- [x] Compteur "X/Y suffisants" affiché

### Sprint B4 ✓
- [ ] Potentiel estimé affiché par source
- [ ] Tags Discovery visibles
- [ ] Boutons "Importer" présents (désactivés)

### Sprint B5 ✓
- [ ] Clic "Importer" crée job scraping
- [ ] Progress bar pendant exécution
- [ ] Nouveaux tissus apparaissent dans résultats

### Sprint B6 ✓
- [ ] Contraintes couleur + métrage fusionnées
- [ ] "Trouver similaires" sur textile fonctionne
- [ ] Reset contraintes efface tous les filtres

### Sprint B7 ✓ 🆕
- [ ] Règles de déduction appliquées au scraping
- [ ] Filtres drape/stretch/opacity fonctionnels
- [ ] Bouton "Affiner avec AI" visible si < 50 résultats
- [ ] Analyse AI retourne scores de correspondance
- [ ] Cache AI évite re-analyse des mêmes images

### Sprint A7 ✓ 🆕
- [ ] Liste règles avec stats d'utilisation
- [ ] Éditeur de règle avec preview
- [ ] Testeur interactif fonctionne
- [ ] Dashboard affiche couverture par attribut déduit
- [ ] Monitoring AI affiche coûts et cache hits
- [ ] Validation manuelle enregistre corrections

---

## Notes Techniques

### Performance
- Cache résultats recherche par contrainte (SWR/React Query)
- Debounce sur changements contraintes
- Pagination serveur pour résultats
- **Cache AI** dans table `image_analyses` pour éviter re-analyse

### UX
- Loading states sur tous les boutons async
- Optimistic updates où possible
- Notifications toast pour feedback
- **Confidence indicators** sur attributs déduits (tooltip)
- **Coût estimé** affiché avant analyse AI

### Sécurité
- Validation Zod sur toutes les APIs
- Rate limiting sur scraping guidé
- Audit log modifications dictionary
- **Rate limiting** sur API AI (max 50 images/requête)

### Coûts AI
- Claude Sonnet : ~$0.015/image
- Budget estimé : ~$5-10/mois si cache efficace
- Monitoring coûts dans dashboard admin

---

## Résumé Fonctionnel

> **À l'issue de ces sprints, les designers pourront rechercher des tissus directement depuis leur board en cliquant sur une couleur de palette (matching intelligent via distance colorimétrique LAB) ou sur un tissu existant (recherche de similaires), avec filtrage automatique par stock suffisant basé sur leur calcul de métrage, et possibilité d'importer à la demande des tissus supplémentaires depuis les sources Discovery non encore scrappées.**
>
> **🆕 De plus, ils pourront filtrer par propriétés comportementales (drape, stretch, opacity) estimées automatiquement via règles de déduction, puis affiner leur sélection finale avec une analyse AI des images qui évalue brillance, texture et transparence réelle — tandis que les admins disposeront d'outils complets pour gérer les règles de déduction, valider les résultats, et monitorer les coûts AI.**

---

## Valeur Différenciante

| Fonctionnalité | Concurrents | Deadstock |
|----------------|-------------|-----------|
| Filtres fiber/color/pattern | ✅ Tous | ✅ |
| Filtres drape/stretch/opacity | ❌ Aucun | ✅ (déduction) |
| Affinage AI sur images | ❌ Aucun | ✅ (on-demand) |
| Confidence scores | ❌ Aucun | ✅ |
| Coût AI transparent | N/A | ✅ |

**Deadstock devient la première plateforme textile avec filtres comportementaux.**
