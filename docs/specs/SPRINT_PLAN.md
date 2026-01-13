# SPRINT PLAN - Boards & Admin Enhancement

**Version** : 2.0
**Date** : 12 Janvier 2026
**Contexte** : Post-MVP Phase 1, préparation Phase 2

---

## Vue d'Ensemble

```
SPRINTS BOARDS                          SPRINTS ADMIN
──────────────                          ─────────────

Sprint B1: Color Picker LAB             Sprint A1: Coverage par source
Sprint B2: Recherche contextuelle       Sprint A2: Filtres unknowns
Sprint B3: Indicateurs stock            Sprint A3: Edit dictionary
Sprint B4: Potentiel Discovery          Sprint A4: Stock coverage dashboard
Sprint B5: Scraping guidé               Sprint A5: Scraping jobs UI
Sprint B6: Fusion contraintes           Sprint A6: Quality alerts
```

---

## SPRINTS BOARDS (Recherche Contextuelle)

### Sprint B1 : Color Picker avec Distance LAB
**Durée estimée** : 4h
**Dépendances** : Aucune

#### B1.1 - Utilitaires conversion couleur (1h)
```
Fichier : src/lib/color/colorConversion.ts

- [ ] Fonction hexToRgb(hex: string): RGB
- [ ] Fonction rgbToXyz(rgb: RGB): XYZ
- [ ] Fonction xyzToLab(xyz: XYZ): LAB
- [ ] Fonction hexToLab(hex: string): LAB (composition)
- [ ] Tests unitaires conversions
```

#### B1.2 - Table référence 16 couleurs (30min)
```
Fichier : src/lib/color/databaseColors.ts

- [ ] Constante DATABASE_COLORS avec hex + LAB pré-calculés
- [ ] Types ColorName, DatabaseColor
- [ ] Export pour réutilisation
```

#### B1.3 - Algorithme matching (1h)
```
Fichier : src/lib/color/colorMatching.ts

- [ ] Fonction labDistance(lab1, lab2): number
- [ ] Fonction findMatchingColors(hex, maxDistance, maxResults): ColorMatch[]
- [ ] Interface ColorMatch { color, distance, confidence }
- [ ] Tests avec exemples concrets (#8B0000 → burgundy)
```

#### B1.4 - Composant ColorMatchDisplay (1.5h)
```
Fichier : src/features/boards/components/ColorMatchDisplay.tsx

- [ ] Affichage couleur input avec preview
- [ ] Liste des matches avec barres de confiance
- [ ] Checkboxes pour sélection manuelle
- [ ] Props: hex, onColorsSelected, maxResults
```

**Livrable** : Utilitaires color matching fonctionnels + composant UI

---

### Sprint B2 : Recherche Contextuelle Basique
**Durée estimée** : 5h
**Dépendances** : B1

#### B2.1 - API endpoint recherche contextuelle (1.5h)
```
Fichier : src/app/api/search/contextual/route.ts

- [ ] POST handler avec validation Zod
- [ ] Extraction contraintes depuis request
- [ ] Query textiles_search avec filtres couleur
- [ ] Pagination et tri
- [ ] Response avec résultats + count
```

#### B2.2 - Hook useContextualSearch (1h)
```
Fichier : src/features/boards/hooks/useContextualSearch.ts

- [ ] State management (results, loading, error)
- [ ] Fonction search(constraints)
- [ ] Gestion pagination (loadMore)
- [ ] Cache des résultats par contrainte
```

#### B2.3 - Panneau résultats latéral (2h)
```
Fichier : src/features/boards/components/ContextualSearchPanel.tsx

- [ ] Layout panneau slide-in depuis droite
- [ ] Header avec résumé recherche
- [ ] Liste résultats avec TextileCard compact
- [ ] Bouton "Ajouter au board" par résultat
- [ ] État vide / loading / erreur
```

#### B2.4 - Intégration palette element (30min)
```
Fichier : src/features/boards/components/elements/PaletteElement.tsx

- [ ] Bouton recherche sous chaque couleur
- [ ] onClick → ouvre ContextualSearchPanel
- [ ] Passage du hex au panneau
```

**Livrable** : Recherche depuis palette fonctionnelle (sans filtre métrage)

---

### Sprint B3 : Indicateurs Stock et Suffisance
**Durée estimée** : 3h
**Dépendances** : B2

#### B3.1 - Logique suffisance stock (45min)
```
Fichier : src/features/search/utils/stockSufficiency.ts

- [ ] Fonction isStockSufficient(textile, neededMeters): SufficiencyResult
- [ ] Gestion des 4 sale_types
- [ ] Interface SufficiencyResult { sufficient, reason }
- [ ] Tests unitaires tous les cas
```

#### B3.2 - Composant StockSufficiencyBadge (45min)
```
Fichier : src/features/boards/components/StockSufficiencyBadge.tsx

- [ ] Affichage conditionnel ✅ / ⚠️
- [ ] Tooltip avec détail (X m dispo vs Y m requis)
- [ ] Props: textile, requiredMeters
```

#### B3.3 - Intégration dans résultats (1h)
```
Fichier : src/features/boards/components/ContextualSearchPanel.tsx

- [ ] Afficher badge suffisance sur chaque résultat
- [ ] Option toggle "Masquer insuffisants"
- [ ] Compteur "X suffisants / Y total"
```

#### B3.4 - Liaison avec calcul métrage (30min)
```
Fichier : src/features/boards/components/elements/CalculationElement.tsx

- [ ] Checkbox "Filtrer par stock suffisant"
- [ ] Emission du métrage calculé vers contexte board
- [ ] Sync avec recherche contextuelle active
```

**Livrable** : Indicateurs visuels de suffisance stock

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

## Ordre d'Exécution Recommandé

### Phase 1 : Fondations (Sprints parallélisables)
```
Semaine 1:
├── B1: Color Picker LAB (4h)           ← Prérequis B2-B6
├── A1: Coverage par source (2h)        ← Quick win
└── A2: Filtres unknowns (2h)           ← Quick win
```

### Phase 2 : Recherche Contextuelle Core
```
Semaine 2:
├── B2: Recherche contextuelle (5h)     ← Après B1
├── B3: Indicateurs stock (3h)          ← Après B2
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

---

## Résumé Effort

| Sprint | Durée | Priorité | Dépendances |
|--------|-------|----------|-------------|
| **BOARDS** |
| B1: Color Picker LAB | 4h | P1 | - |
| B2: Recherche contextuelle | 5h | P1 | B1 |
| B3: Indicateurs stock | 3h | P1 | B2 |
| B4: Potentiel Discovery | 4h | P2 | B3 |
| B5: Scraping guidé | 6h | P2 | B4, A5 |
| B6: Fusion contraintes | 4h | P2 | B5 |
| **Sous-total Boards** | **26h** |
| **ADMIN** |
| A1: Coverage par source | 2h | P1 | - |
| A2: Filtres unknowns | 2h | P1 | - |
| A3: Edit dictionary | 3h | P1 | - |
| A4: Stock coverage | 3h | P2 | A1 |
| A5: Jobs UI | 4h | P2 | B5.1 |
| A6: Quality alerts | 3h | P3 | A4 |
| **Sous-total Admin** | **17h** |
| **TOTAL** | **43h** | | |

---

## Critères de Validation

### Sprint B1 ✓
- [ ] `hexToLab('#8B0000')` retourne valeurs LAB correctes
- [ ] `findMatchingColors('#8B0000')` retourne 'burgundy' en premier
- [ ] Composant affiche barres de confiance

### Sprint B2 ✓
- [ ] Clic sur couleur palette ouvre panneau
- [ ] Résultats affichent tissus de la bonne couleur
- [ ] Bouton "Ajouter au board" fonctionne

### Sprint B3 ✓
- [ ] Badge vert si stock suffisant
- [ ] Badge orange si stock insuffisant
- [ ] Compteur "X/Y suffisants" affiché

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

---

## Notes Techniques

### Performance
- Cache résultats recherche par contrainte (SWR/React Query)
- Debounce sur changements contraintes
- Pagination serveur pour résultats

### UX
- Loading states sur tous les boutons async
- Optimistic updates où possible
- Notifications toast pour feedback

### Sécurité
- Validation Zod sur toutes les APIs
- Rate limiting sur scraping guidé
- Audit log modifications dictionary

---

## Résumé Fonctionnel

> **À l'issue de ces sprints, les designers pourront rechercher des tissus directement depuis leur board en cliquant sur une couleur de palette (matching intelligent via distance colorimétrique LAB) ou sur un tissu existant (recherche de similaires), avec filtrage automatique par stock suffisant basé sur leur calcul de métrage, et possibilité d'importer à la demande des tissus supplémentaires depuis les sources Discovery non encore scrappées — tandis que les admins disposeront d'outils améliorés pour prioriser le tuning du dictionnaire et surveiller la qualité des données par source.**
