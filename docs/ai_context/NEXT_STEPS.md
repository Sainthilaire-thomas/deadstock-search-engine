# Next Steps - Deadstock Search Engine

**Dernière mise à jour** : 9 Janvier 2026

**Après Session** : 21

---

## ✅ Accompli Session 21 (ADR-026 Complet)

### Part 1 - Sale Type Detection at Discovery

* [X] Créé `saleTypeDetector.ts` avec algorithme de détection
* [X] Intégré dans `discoveryService.ts`
* [X] Ajouté colonne `sale_type_detection` dans `site_profiles`
* [X] Testé sur Nona Source (95% confiance → hybrid)

### Part 2 - Display in Admin UI

* [X] Créé `SaleTypeCard.tsx` composant
* [X] Intégré dans page `/admin/discovery/[siteSlug]`
* [X] Affiche type détecté, confiance, preuves, recommandations

### Part 3 - Dual Pricing in Search UI

* [X] Créé `PriceDisplay.tsx` composant
* [X] Intégré dans `TextileGrid.tsx`
* [X] Affichage différencié selon sale_type :
  * `hybrid` : 2 options (coupon vert + coupe) avec économie calculée
  * `fixed_length` : Prix total + prix/m calculé
  * `cut_to_order` : Prix/m avec mention "Vente au mètre"

### Bonus - Page Détail Textile

* [X] Créé `/textiles/[id]/page.tsx`
* [X] Image principale + miniatures
* [X] Prix selon sale_type avec même logique que PriceDisplay
* [X] Caractéristiques (fiber, color, width, weight...)
* [X] Description HTML
* [X] Boutons Favoris + AddToBoard
* [X] Lien externe vers source

---

## 🎯 Priorité Immédiate (Session 22)

### 1. Quick Fixes

| Tâche                                             | Effort | Impact       |
| -------------------------------------------------- | ------ | ------------ |
| Fix "1unit" → "Vente au mètre" pour cut_to_order | 15min  | UX           |
| Investiguer caractéristiques vides (fiber/color)  | 30min  | Data Quality |
| Fix Supabase schema dans server.ts                 | 10min  | DX           |

### 2. Commit & Clean

```bash
git add .
git commit -m "feat(ADR-026): dual pricing display for hybrid products

- Add sale type detection at Discovery (saleTypeDetector.ts)
- Create SaleTypeCard component for Admin UI
- Create PriceDisplay component with dual pricing
- Add textile detail page /textiles/[id]
- Show coupon vs cutting prices with savings calculation
- Add FavoriteButton and AddToBoardButton to detail page"
```

---

## 📋 Backlog Priorisé

### P1 - Court Terme (Sessions 22-23)

#### 1.1 Scraping Scale

* [ ] Scraper 500+ produits Nona Source (2500+ disponibles)
* [ ] Scraper 500+ produits MLC (11000+ disponibles)
* [ ] Monitorer qualité données après gros import
* [ ] Refresh materialized view

#### 1.2 Filtres Recherche Améliorés

* [ ] Ajouter filtre par `sale_type` (Coupons / Vente au mètre / Tous)
* [ ] Ajouter filtre par `price_per_meter` range
* [ ] Ajouter filtre par `quantity_value` minimum

#### 1.3 UX Improvements

* [ ] Badge visuel "HYBRID" sur les cards pour identifier facilement
* [ ] Indicateur "Best deal" quand économie coupon > 20%
* [ ] Améliorer affichage caractéristiques vides

### P2 - Moyen Terme (Sessions 24-26)

#### 2.1 Admin Quality Dashboard

* [ ] Page `/admin/dashboard` avec métriques globales
* [ ] Qualité par source (% fiber, color, price_per_meter)
* [ ] Alertes si qualité dégradée après scraping
* [ ] Graphiques évolution dans le temps

#### 2.2 Interface Discovery Avancée

* [ ] Onglet "Extraction" dans `/admin/sites/[id]/configure`
* [ ] Toggle enable/disable patterns par attribut
* [ ] Preview couverture avant scraping
* [ ] Bouton "Test on 10 products"

#### 2.3 Authentification

* [ ] Intégration Supabase Auth
* [ ] Pages login/signup
* [ ] Protection routes admin
* [ ] Migration favoris anonymes → compte

### P3 - Long Terme (Phase 2)

| Feature                        | Notes                                       |
| ------------------------------ | ------------------------------------------- |
| Calculateur métrage intégré | YardageSearchFilter existe, UI à intégrer |
| Import patron PDF              | Killer feature - extraction dimensions IA   |
| Boards collaboratifs           | Partage entre utilisateurs                  |
| Marketplace inversée          | Designers postent besoins                   |
| Certificats durabilité        | Impact CO2/eau calculé                     |
| API publique                   | Pour partenaires/intégrateurs              |

---

## 🔧 Tâches Techniques en Attente

### Database

* [ ] Index sur `textiles.sale_type` si recherche fréquente
* [ ] Vérifier que `textiles_search` inclut bien `fiber`, `color` depuis `textile_attributes`
* [ ] Cleanup colonnes legacy si plus utilisées

### Code

* [ ] Ajouter `db: { schema: 'deadstock' }` dans `src/lib/supabase/server.ts`
* [ ] Mapper `price` → `price_value` dans `textileRepository.ts`
* [ ] Tests unitaires `saleTypeDetector.ts`
* [ ] Tests unitaires `variantAnalyzer.ts`

### DevOps

* [ ] Monitoring Supabase (usage, performance)
* [ ] Alertes si scraping échoue
* [ ] CI/CD avec tests

---

## 📝 Notes pour Prochaine Session

### Contexte à Charger

1. `PROJECT_CONTEXT_COMPACT.md` (v3.0)
2. `CURRENT_STATE.md`
3. `NEXT_STEPS.md`
4. `GLOSSAIRE.md` (si besoin termes métier)

### Questions Résolues Session 21

* ✅ Comment détecter le `sale_type` au Discovery ? → `saleTypeDetector.ts`
* ✅ Comment afficher les produits hybrid (2 prix) ? → `PriceDisplay.tsx`
* ✅ Page détail textile ? → `/textiles/[id]/page.tsx`

### Questions Ouvertes

1. Pourquoi certains textiles ont fiber/color vides dans la page détail ?
2. Faut-il re-scraper tous les textiles pour avoir des données cohérentes ?
3. Quelle source prioriser pour le prochain gros scraping (MLC ou Nona) ?

---

## 📊 Métriques de Succès MVP Phase 1

| Métrique            | Cible | Actuel | Status |
| -------------------- | ----- | ------ | ------ |
| Textiles en base     | 1000+ | 268    | 🟡 27% |
| Sources actives      | 3+    | 4      | ✅     |
| Search < 50ms        | <50ms | 2.8ms  | ✅     |
| Filtres fonctionnels | 5+    | 4      | 🟡     |
| Page détail         | ✅    | ✅     | ✅     |
| Favoris              | ✅    | ✅     | ✅     |
| Boards               | ✅    | ✅     | ✅     |

**Priorité #1** : Augmenter le nombre de textiles via scraping scale.
