# CONTEXT_SUMMARY.md - Résumé pour Prochaine Session

**Projet** : Deadstock Textile Search Engine

**Dernière session** : 16 (5 janvier 2026)

**Prochaine session** : 17

---

## Rappel Projet

**Vision** : Moteur de recherche SaaS pour aider les designers de mode indépendants à sourcer des tissus deadstock depuis plusieurs fournisseurs (My Little Coupon, The Fabric Sales, Recovo, etc.).

**Différenciation** : Seul agrégateur multi-sources avec outils de design intégrés (boards de réalisation, calcul métrages).

---

## Où On En Est

### MVP Phase 1 : 87% Complete

**Modules terminés :**

* ✅ Search (filtres matière/couleur/pattern)
* ✅ Favorites (sync instantanée)
* ✅ Board (canvas drag-drop, notes, palettes)
* ✅ Admin Sites (discovery + scraping)
* ✅ Cristallisation (règles + migration)

**Module en cours :**

* ⚠️ Admin Tuning (70%) - Problème critique identifié

---

## Problème Critique Identifié (Session 16)

### Le Constat

```
~600 "unknown terms" pour The Fabric Sales
Termes comme "blue", "cotton", "wool" marqués inconnus
```

### La Cause

* The Fabric Sales = source ANGLAISE
* Dictionnaire = entrées FRANÇAISES uniquement
* Normalisation cherche "blue" → pas trouvé → unknown

### La Solution (ADR-020 créé)

```typescript
// Chaque site a maintenant sourceLocale
{ domain: 'mylittlecoupon.fr', sourceLocale: 'fr' }
{ domain: 'thefabricsales.com', sourceLocale: 'en' }

// Dictionnaire avec entrées par locale
FR: "coton" → "cotton"
EN: "cotton" → "cotton" (passthrough)
```

---

## Documents Créés Session 16

| Document                               | Contenu                                 |
| -------------------------------------- | --------------------------------------- |
| `SPEC_ADMIN_DATA_TUNING_COMPLETE.md` | Spec exhaustive workflow tuning admin   |
| `ADR_020_SCRAPER_SOURCE_LOCALE.md`   | Architecture multi-locale dictionnaires |
| `SESSION_16_ADMIN_TUNING_LOCALE.md`  | Note de session                         |

---

## Ce Qui Reste à Faire

### Immédiat (Session 17)

**1. Exécuter ADR-020** (~30 min)

```sql
-- Migration
ALTER TABLE sites ADD COLUMN source_locale TEXT DEFAULT 'fr';
UPDATE sites SET source_locale = 'en' WHERE domain = 'thefabricsales.com';

-- Seed dict EN (~150 termes)
INSERT INTO dictionary_mappings (source_term, source_locale, translations, category_id)
VALUES ('cotton', 'en', '{"en": "cotton"}', fiber_category_id), ...

-- Cleanup unknowns EN
DELETE FROM unknown_terms WHERE source_platform = 'thefabricsales.com' 
  AND term IN (SELECT source_term FROM dictionary_mappings WHERE source_locale = 'en');
```

**2. Extraction dimensions** (ADR-019, ~2h)

* Détecter longueur dans tags ("3M", "5 mètres")
* Détecter largeur dans body_html ("Laize 150cm", "Width: 140cm")

**3. Dashboard qualité** (~1h)

* Métriques par dimension (fiber 80%, color 55%, etc.)
* Alertes sources problématiques

### Court Terme

* LLM suggestions pour unknowns
* Batch processing unknowns
* Browser dictionnaire

---

## Architecture Clé

### Pipeline Normalisation

```
Scraper(site.sourceLocale)
    ↓
Extract terms
    ↓
Lookup dictionary WHERE source_locale = site.sourceLocale
    ↓
Found → translations['en']
Not found → Log unknown WITH sourceLocale
```

### Tables Concernées

```sql
sites (+ source_locale TEXT)
dictionary_mappings (source_term, source_locale, translations JSONB)
unknown_terms (term, source_locale, category, status)
textiles (source_locale pour traçabilité)
```

---

## Fichiers à Modifier (Session 17)

| Fichier                                                               | Modification                         |
| --------------------------------------------------------------------- | ------------------------------------ |
| `database/migrations/XXX.sql`                                       | Migration sourceLocale + seed EN     |
| `src/features/admin/services/scrapingService.ts`                    | Passer sourceLocale à normalisation |
| `src/features/normalization/infrastructure/normalizationService.ts` | Filtrer par sourceLocale             |
| `src/features/normalization/infrastructure/dictionaryCache.ts`      | Cache par locale                     |

---

## Métriques Cibles

| Métrique              | Actuel | Cible Post-Session 17 |
| ---------------------- | ------ | --------------------- |
| Unknowns TFS           | ~600   | <50                   |
| Couverture dict EN     | 0%     | 90%                   |
| Textiles avec longueur | 15%    | 80%                   |
| Textiles avec largeur  | 0%     | 40%                   |

---

## Questions Ouvertes

1. **LLM fallback** : temps réel ou suggestions batch ?
2. **Pattern storage** : JSONB dans SiteProfile ou table séparée ?
3. **Re-scraping** : automatique après ajout mappings ou manuel ?

---

## Commandes Utiles

```powershell
# Lancer le dev server
npm run dev

# Voir les unknowns en base
# (via Supabase Dashboard ou SQL)
SELECT term, source_platform, occurrences 
FROM deadstock.unknown_terms 
WHERE status = 'pending' 
ORDER BY occurrences DESC;

# Compter par source
SELECT source_platform, COUNT(*) 
FROM deadstock.unknown_terms 
WHERE status = 'pending' 
GROUP BY source_platform;
```

---

## Liens Rapides

* [ADR-020 Source Locale](https://claude.ai/mnt/project/ADR_020_SCRAPER_SOURCE_LOCALE.md)
* [SPEC Admin Tuning](https://claude.ai/mnt/project/SPEC_ADMIN_DATA_TUNING_COMPLETE.md)
* [Database Architecture](https://claude.ai/mnt/project/DATABASE_ARCHITECTURE.md)
* [Session 16 Notes](https://claude.ai/mnt/project/SESSION_16_ADMIN_TUNING_LOCALE.md)
