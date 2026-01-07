# Next Steps - Deadstock Search Engine

**Dernière mise à jour:** 7 Janvier 2026 (Session 18)

---

## 🎯 Priorité Immédiate (Session 19)

### 1. Connecter API Recherche à Vue Matérialisée

**Fichier:** `src/features/search/infrastructure/textileRepository.ts`

```typescript
// AVANT (colonnes legacy)
async search(filters: SearchFilters): Promise<Textile[]> {
  let query = supabase.from('textiles').select('*');
  if (filters.materials) query = query.in('material_type', filters.materials);
  // ...
}

// APRÈS (vue matérialisée)
async search(filters: SearchFilters): Promise<Textile[]> {
  let query = supabase.from('textiles_search').select('*');
  if (filters.materials) query = query.in('fiber', filters.materials);
  // ...
}
```

**Tâches:**

* [ ] Modifier `search()` pour utiliser `textiles_search`
* [ ] Modifier `getAvailableFilters()` pour utiliser `textile_attributes`
* [ ] Tester performance

### 2. Filtres Dynamiques

**Fichier:** `src/features/search/infrastructure/textileRepository.ts`

```typescript
// APRÈS (dynamique)
async getAvailableFilters(): Promise<DynamicFilters> {
  const { data: categories } = await supabase
    .rpc('get_searchable_categories');
  
  const filters = await Promise.all(
    categories.map(async (cat) => {
      const { data } = await supabase
        .from('textile_attributes')
        .select('value')
        .eq('category_slug', cat.slug);
      return { slug: cat.slug, name: cat.name, values: [...new Set(data)] };
    })
  );
  
  return { categories: filters };
}
```

**Tâches:**

* [ ] Créer type `DynamicFilters`
* [ ] Modifier `getAvailableFilters()`
* [ ] Adapter `Filters.tsx` pour itérer sur catégories

### 3. Commit Migrations

```bash
git add database/migrations/021_create_textiles_search_materialized_view.sql
git add database/migrations/022_create_refresh_function.sql
git add docs/sessions/SESSION_18_TEXTILE_STANDARD_SYSTEM.md
git commit -m "feat(db): Vue matérialisée textiles_search + Session 18 notes"
```

---

## 📅 Court Terme (Sessions 20-21)

### 4. Dual-Write Scraping

**Fichier:** `src/features/admin/services/scrapingService.ts`

Modifier le scraping pour écrire dans `textile_attributes` en plus des colonnes legacy.

```typescript
// Après sauvegarde textile
await supabase.from('textile_attributes').upsert([
  { textile_id, category_slug: 'fiber', value: normalized.fiber, ... },
  { textile_id, category_slug: 'color', value: normalized.color, ... },
]);
```

**Tâches:**

* [ ] Modifier `saveProducts()` dans scrapingRepo
* [ ] Ajouter upsert `textile_attributes`
* [ ] Ajouter refresh vue après job

### 5. Refresh Vue Après Scraping

```typescript
// À la fin du scraping job
await supabase.rpc('refresh_textiles_search');
```

### 6. Clarifier quantity_value

**Migration:** Ajouter `sale_type`

```sql
ALTER TABLE deadstock.textiles 
ADD COLUMN sale_type TEXT DEFAULT 'fixed_length'
CHECK (sale_type IN ('fixed_length', 'cut_to_order', 'by_piece'));

UPDATE textiles SET sale_type = 'fixed_length' 
WHERE source_platform LIKE '%mylittlecoupon%';

UPDATE textiles SET sale_type = 'cut_to_order' 
WHERE source_platform LIKE '%thefabricsales%';
```

---

## 🗓️ Moyen Terme (Sessions 22+)

### 7. Interface Discovery Enrichie

Afficher le mapping standard ↔ extraction dans `/admin/discovery/[siteSlug]`

```
┌─────────────────────────────────────────────────────────────────┐
│ Mapping Standard Deadstock                                      │
├───────────┬───────────┬──────────┬────────────────┐            │
│ Standard  │ Status    │ Source   │ Coverage       │            │
├───────────┼───────────┼──────────┼────────────────┤            │
│ fiber ⭐  │ ✅ Mappé  │ tags     │ 85%            │            │
│ color ⭐  │ ✅ Mappé  │ tags     │ 80%            │            │
│ width     │ ✅ Mappé  │ body     │ 100%           │            │
│ length    │ ❌ N/A    │ —        │ Vente au mètre │            │
└───────────┴───────────┴──────────┴────────────────┘            │
```

### 8. Interface Tuning Patterns

```
/admin/tuning → Onglets [Dictionnaire] [Patterns]

Patterns (par site):
┌──────────┬────────────────┬──────────┬──────────┐
│ Attribut │ Pattern        │ Coverage │ Échecs   │
├──────────┼────────────────┼──────────┼──────────┤
│ width    │ /Width:(\d+)/  │ 100%     │ 0        │
│ weight   │ /(\d+)gsm/     │ 95%      │ 12       │
└──────────┴────────────────┴──────────┴──────────┘
```

### 9. Hiérarchie Catégories

Enrichir `attribute_categories` avec sous-catégories :

```
fiber
├── natural
│   ├── silk
│   ├── cotton
│   └── wool
└── synthetic
    ├── polyester
    └── nylon
```

---

## 🔮 Long Terme (Phase 2)

### 10. Authentification

* Supabase Auth
* Rôles admin/user
* Migration session_id → user_id

### 11. API Publique

* REST endpoints documentés
* Rate limiting
* API keys

### 12. Suppression Colonnes Legacy

* Retirer `material_type`, `color`, `pattern` de `textiles`
* Migrer `width_value`, `weight_value` vers `textile_attributes`
* Utiliser uniquement `textiles_search` pour requêtes

---

## ✅ Checklist Session 19

```
[ ] Modifier textileRepository.search() → textiles_search
[ ] Modifier textileRepository.getAvailableFilters() → textile_attributes
[ ] Créer type DynamicFilters
[ ] Adapter Filters.tsx pour catégories dynamiques
[ ] Tester recherche avec nouveaux filtres
[ ] Commit migrations 021, 022
[ ] Créer note SESSION_19
```

---

## 📊 Métriques Cibles

| Métrique             | Actuel | Cible Session 19 |
| --------------------- | ------ | ---------------- |
| API utilise vue mat.  | ❌     | ✅               |
| Filtres dynamiques    | ❌     | ✅               |
| Performance recherche | 2.8ms  | <5ms             |
| Dual-write scraping   | ❌     | 🔲 Session 20    |

---

## 🔗 Fichiers à Modifier

### Session 19

* `src/features/search/infrastructure/textileRepository.ts`
* `src/features/search/domain/types.ts`
* `src/components/search/Filters.tsx`

### Session 20

* `src/features/admin/infrastructure/scrapingRepo.ts`
* `src/features/admin/services/scrapingService.ts`
* `database/migrations/023_add_sale_type.sql`

---

**Prochaine session:** Connecter API à vue matérialisée
