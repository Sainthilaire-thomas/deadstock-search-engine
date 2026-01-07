
# NEXT_STEPS.md - Prochaines Étapes

**Dernière mise à jour** : 6 janvier 2026

**Dernière session** : 17 (Extraction Patterns)

---

## Priorité Immédiate (Session 18)

### 1. Exécuter ADR-020 : Dictionnaire EN (~1h)

**Contexte** : 600 unknowns de TFS causés par absence de dictionnaire anglais.

**Actions** :

```sql
-- 1. Seed dictionnaire EN (~150 termes)
INSERT INTO deadstock.dictionary_mappings (source_term, source_locale, target_term, ...)
VALUES 
  ('cotton', 'en', 'cotton', 'fiber', ...),
  ('silk', 'en', 'silk', 'fiber', ...),
  ('blue', 'en', 'blue', 'color', ...),
  ...

-- 2. Cleanup unknowns EN existants
DELETE FROM deadstock.unknown_terms 
WHERE source_platform LIKE '%thefabricsales%'
  AND term IN (SELECT source_term FROM dictionary_mappings WHERE source_locale = 'en');

-- 3. Ajouter stopwords
INSERT INTO deadstock.dictionary_mappings (source_term, source_locale, target_term, category_id, is_stopword)
VALUES ('fabric', 'en', NULL, 'fiber', true), ...
```

**Résultat attendu** : Unknowns TFS 600 → <50

---

### 2. Tester Extraction sur TFS (~30min)

**Contexte** : Valider que les patterns fonctionnent aussi pour une source EN.

**Actions** :

1. Lancer discovery sur `thefabricsales.com`
2. Vérifier patterns détectés (body_html EN différent)
3. Scraper quelques produits
4. Valider extraction dimensions

**Patterns attendus TFS** :

* Width: `Width: 150cm` dans body_html
* Weight: `Weight: 150gr/m2` dans body_html
* Length: N/A (vendu au mètre linéaire)

---

### 3. Dashboard Qualité Unifié (~2h)

**Contexte** : Vue centralisée des métriques de qualité des données.

**Page** : `/admin/tuning/quality`

**Sections** :

1. **Score Global** : Moyenne pondérée toutes sources
2. **Par Dimension** : % couverture material/color/pattern/length/width/weight
3. **Par Source** : Détail par site
4. **Alertes** : Sources avec problèmes

**Maquette** :

```
┌─────────────────────────────────────────────────────────────────┐
│ Qualité des Données                               [Actualiser] │
├─────────────────────────────────────────────────────────────────┤
│ SCORE GLOBAL: 87%                                              │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│ │ Matière     │ │ Couleur     │ │ Largeur     │ │ Poids       ││
│ │ 95%    ✅   │ │ 88%    ✅   │ │ 76%    ⚠️   │ │ 82%    ✅   ││
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
│                                                                 │
│ PAR SOURCE                                                      │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ mylittlecoupon.fr  │ 98% │ ████████████████████░░ │ ✅    │  │
│ │ thefabricsales.com │ 72% │ ██████████████░░░░░░░░ │ ⚠️    │  │
│ └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Court Terme (Sessions 19-20)

### 4. Toggle Patterns UI

Permettre à l'admin d'activer/désactiver les patterns depuis l'interface.

**Fichiers** :

* Server action `toggleExtractionPattern(patternId, enabled)`
* Modifier `ExtractionPatternsCard` pour être interactif
* Option re-scrape après modification

### 5. Test Pattern Live

Interface pour tester un regex sur les produits samples avant activation.

**UI** :

* Input regex
* Sélection source (tags/title/body_html)
* Preview sur 10 produits
* Bouton "Ajouter comme pattern"

### 6. LLM Suggestions Unknowns (ADR-004)

Ajouter suggestions LLM pour les unknowns avec bouton approve/reject.

**Flow** :

1. Unknown sans suggestion → Bouton "Demander suggestion"
2. Appel API Claude/GPT
3. Affichage suggestion avec confidence
4. Admin approve → Ajout dictionnaire

---

## Moyen Terme (Phase 2)

### 7. Extraction Composition

Détecter "100% coton", "80% viscose 20% elasthanne".

**Storage** : `composition JSONB`

```json
{
  "fibers": [
    {"fiber": "viscose", "percentage": 80},
    {"fiber": "elastane", "percentage": 20}
  ]
}
```

### 8. Re-scraping Ciblé

Après modification patterns, re-scraper uniquement les produits affectés.

### 9. API Professionnelle

Exposer une API REST pour intégrations tierces.

---

## Long Terme (Phase 3)

### 10. Multi-tenant

Isolation par workspace/organisation.

### 11. Reverse Marketplace

Designers postent demandes, suppliers répondent.

### 12. AI Design Assistant

Suggestions de tissus basées sur le projet.

---

## Backlog Technique

| Item                       | Priorité | Effort |
| -------------------------- | --------- | ------ |
| Dark mode complet          | Low       | 2h     |
| Tests unitaires extraction | Medium    | 3h     |
| Pagination discovery       | Low       | 1h     |
| Export CSV textiles        | Medium    | 2h     |
| Logs scraping persistants  | Low       | 2h     |

---

## Métriques de Succès Session 18

| Métrique          | Cible              |
| ------------------ | ------------------ |
| Unknowns TFS       | <50 (vs 600)       |
| Extraction TFS     | >70% dimensions    |
| Dashboard qualité | Page fonctionnelle |

---

## Notes pour Prochaine Session

1. **Commencer par** seed dictionnaire EN (quick win)
2. **Ne pas oublier** les stopwords ("fabric", "colour", etc.)
3. **Tester** scraping TFS après seed
4. **Si temps** commencer dashboard qualité
