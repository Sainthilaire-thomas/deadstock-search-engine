
# Contexte Projet - Deadstock Search Engine

**Pour:** Assistant IA (Claude)
**Mise à jour:** 04/01/2026 - Session 13

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
/boards         → ⭐ Pivot UX central (complet)
```

---

## 🔄 Pivot UX Session 11-13

**Avant (Journey):** Parcours linéaire 9 étapes rigide
**Après (Boards):** Board comme espace de travail flexible

Le Board est maintenant le **pivot central** de l'expérience :

* Espace visuel pour organiser idées
* Agrège tissus, notes, palettes, calculs
* Zones pour regroupement thématique
* Ajout tissus depuis favoris via Sheet
* Cristallisation future en "Projet" finalisé

---

## 📊 État des Modules

| Module           | Statut      | Notes                                        |
| ---------------- | ----------- | -------------------------------------------- |
| Admin            | ✅ 100%     | Discovery, config, scraping, monitoring      |
| Scraping         | ✅ 100%     | Pipeline complet avec LLM extraction         |
| Search           | ✅ 100%     | Full-text, filtres, grille                   |
| Favorites        | ✅ 100%     | Refactorisé Session 13                      |
| **Boards** | ✅ 100%     | Canvas, éléments, zones, FavoritesSelector |
| Normalisation    | 🔄 60%      | Matière 80%, couleur 40%                    |
| Journey          | ⏸️ Legacy | Sera supprimé, remplacé par Boards         |

---

## 🗃️ Structure Base de Données

### Tables Clés

```sql
-- Boards
boards (id, session_id, name, status, timestamps)
board_elements (id, board_id, element_type, element_data JSONB, position, size)
board_zones (id, board_id, name, color, position, size)

-- Textiles & Favoris
textiles (id, name, source_platform, price_value, material_type, color, ...)
favorites (id, session_id, textile_id, timestamps)

-- Admin
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

### Repository Pattern (Unifié)

```typescript
// Un seul repository par entité (pas de doublon client/server)
import { createClient } from '@/lib/supabase/client';

const TEXTILE_COLUMNS = `id, name, material_type, color, price_value, ...`;

export async function getFavoritesBySession(sessionId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('favorites')
    .select(`id, textile:textiles(${TEXTILE_COLUMNS})`)
    .eq('session_id', sessionId);
  
  // Transformer si nécessaire (textile array → object)
  return data.map(item => ({
    ...item,
    textile: Array.isArray(item.textile) ? item.textile[0] : item.textile,
  }));
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
* `src/features/boards/components/BoardToolPanel.tsx` - Panel latéral scrollable
* `src/features/boards/components/FavoritesSelector.tsx` - Sheet ajout tissus
* `src/features/boards/components/AddToBoardButton.tsx` - Intégration favoris/search

### Favoris (Refactorisé)

* `src/features/favorites/infrastructure/favoritesRepository.ts` - Repository unifié
* `src/features/favorites/actions/favoriteActions.ts` - Server actions

---

## ⚠️ Points d'Attention

1. **Session-based auth** : Pas d'utilisateur, juste `session_id` cookie
2. **Schema `deadstock`** : Toutes les tables dans ce schema, pas `public`
3. **Admin client** : Utiliser `createAdminClient()` qui bypass RLS
4. **Types JSONB** : Cast via `as unknown as Type` ou transformer les arrays
5. **Repository unique** : Ne pas dupliquer client/server (source d'erreur)
6. **Colonnes textiles** : Utiliser `price_value`, `material_type`, `quantity_value` (pas les anciens noms)

---

## 🚀 Prochaines Priorités

1. ~~ **Tissu depuis favoris** ~~ ✅ Complété Session 13
2. **Cristallisation** : Board → Projet (wizard 4 étapes)
3. **Redimensionnement** : Zones et éléments
4. **Nettoyage journey** : Supprimer code obsolète

---

## 📚 Documents de Référence

| Document                                 | Contenu                               |
| ---------------------------------------- | ------------------------------------- |
| `SPEC_BOARD_MODULE.md`                 | Spécifications techniques boards     |
| `ARCHITECTURE_UX_BOARD_REALISATION.md` | Vision UX complète                   |
| `GLOSSAIRE.md`                         | Terminologie (Board, Zone, Élément) |
| `MIGRATION_JOURNEY_TO_BOARD.md`        | Plan de migration                     |
| `SESSION_13_FAVORITES_SELECTOR.md`     | Détails session 13                   |
