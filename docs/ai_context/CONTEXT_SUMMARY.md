
# Contexte Projet - Deadstock Search Engine

**Pour:** Assistant IA (Claude)
**Mise à jour:** 04/01/2026 - Session 12

---

## 🎯 Vision Produit

Deadstock Search Engine est une plateforme SaaS B2B pour designers textiles indépendants. Elle agrège des tissus deadstock (fins de série, invendus) depuis plusieurs sources et offre des outils de conception créative.

**Proposition de valeur unique:** Recherche unifiée multi-sources + outils de conception intégrés (boards, calcul métrage, palettes).

---

## 🏗️ Architecture Actuelle

### Stack Technique

* **Framework:** Next.js 16.1.1 (App Router)
* **Database:** Supabase (PostgreSQL, schema `deadstock`)
* **Auth:** Session-based (cookie 90 jours) - pas d'auth utilisateur MVP
* **State:** React Context (BoardContext, FavoritesContext)
* **UI:** Tailwind CSS + shadcn/ui + Lucide icons

### Modules Principaux

```
/admin          → Gestion sources, scraping, monitoring
/search         → Recherche textiles avec filtres
/favorites      → Validation des tissus sélectionnés
/boards         → ⭐ Nouveau pivot UX central
```

---

## 🔄 Pivot UX Session 11-12

**Avant (Journey):** Parcours linéaire 9 étapes rigide
**Après (Boards):** Board comme espace de travail flexible

Le Board est maintenant le **pivot central** de l'expérience :

* Espace visuel pour organiser idées
* Agrège tissus, notes, palettes, calculs
* Zones pour regroupement thématique
* Cristallisation future en "Projet" finalisé

---

## 📊 État des Modules

| Module           | Statut      | Notes                                   |
| ---------------- | ----------- | --------------------------------------- |
| Admin            | ✅ 100%     | Discovery, config, scraping, monitoring |
| Scraping         | ✅ 100%     | Pipeline complet avec LLM extraction    |
| Search           | ✅ 100%     | Full-text, filtres, grille              |
| Favorites        | ✅ 100%     | Session-based, optimistic updates       |
| **Boards** | ✅ 100%     | Canvas, éléments, zones, drag & drop  |
| Normalisation    | 🔄 60%      | Matière 80%, couleur 40%               |
| Journey          | ⏸️ Legacy | Sera supprimé, remplacé par Boards    |

---

## 🗃️ Structure Base de Données

### Tables Clés

```sql
-- Boards (nouveau)
boards (id, session_id, name, status, timestamps)
board_elements (id, board_id, element_type, element_data JSONB, position, size)
board_zones (id, board_id, name, color, position, size)

-- Existant
textiles (id, name, source, price, material_type, color, ...)
favorites (id, session_id, textile_id, timestamps)
sites, site_profiles, scraping_jobs, discovery_jobs
```

### Types d'Éléments Board

```typescript
type ElementType = 'textile' | 'note' | 'palette' | 'calculation' | 'inspiration';
```

---

## 🔑 Patterns de Code

### Server Actions Pattern

```typescript
'use server';
export async function actionName(input): Promise<ActionResult<T>> {
  const sessionId = await getOrCreateSessionId();
  // ... logic
  revalidatePath('/path');
  return { success: true, data };
}
```

### Repository Pattern

```typescript
import { createAdminClient } from '@/lib/supabase/admin';
export async function getData() {
  const supabase = createAdminClient(); // Bypass RLS
  const { data, error } = await supabase.from('table').select('*');
  return data.map(mapFromRow);
}
```

### Context Pattern (Boards)

```typescript
const { elements, zones, addNote, moveElement, addZone } = useBoard();
// Optimistic updates pour drag & drop fluide
```

---

## 📁 Fichiers Importants

### Configuration

* `src/features/journey/config/steps.ts` - Étapes sidebar (inclut Boards)
* `src/types/database.types.ts` - Types générés Supabase

### Boards

* `src/features/boards/context/BoardContext.tsx` - State management
* `src/features/boards/components/BoardCanvas.tsx` - Canvas interactif
* `src/features/boards/components/AddToBoardButton.tsx` - Intégration favoris/search

### Intégrations

* `src/features/favorites/components/FavoritesGrid.tsx` - Avec bouton board
* `src/components/search/TextileGrid.tsx` - Avec bouton board

---

## ⚠️ Points d'Attention

1. **Session-based auth** : Pas d'utilisateur, juste `session_id` cookie
2. **Schema `deadstock`** : Toutes les tables dans ce schema, pas `public`
3. **Admin client** : Utiliser `createAdminClient()` qui bypass RLS
4. **Types JSONB** : Cast via `as unknown as Type` ou `JSON.parse(JSON.stringify())`
5. **Boards legacy** : `/journey` existe encore mais sera supprimé

---

## 🚀 Prochaines Priorités

1. **Tissu depuis favoris** : Sélecteur dans panel board
2. **Cristallisation** : Board → Projet (wizard 4 étapes)
3. **Nettoyage journey** : Supprimer code obsolète
4. **Redimensionnement** : Zones et éléments

---

## 📚 Documents de Référence

| Document                                 | Contenu                                                |
| ---------------------------------------- | ------------------------------------------------------ |
| `SPEC_BOARD_MODULE.md`                 | Spécifications techniques boards                      |
| `ARCHITECTURE_UX_BOARD_REALISATION.md` | Vision UX complète                                    |
| `GLOSSAIRE.md`                         | Terminologie (Board, Zone, Élément, Cristallisation) |
| `MIGRATION_JOURNEY_TO_BOARD.md`        | Plan de migration                                      |
| `SESSION_12_BOARD_MODULE.md`           | Détails implémentation                               |
