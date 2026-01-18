# SPRINT UI-1 & I18N-1 - Preview Images & Internationalisation

**Version** : 1.1  
**Date** : 18 Janvier 2026  
**Contexte** : Post-MVP Phase 1, préparation scale international  
**Statut** : UI-1 ✅ COMPLÉTÉ | I18N-1 📋 PRÉPARÉ

---

## RÉSUMÉ EXÉCUTIF

| Sprint | Status | Durée réelle | Notes |
|--------|--------|--------------|-------|
| **UI-1: Preview Images** | ✅ Complété | ~2h | Auto-extraction fonctionnelle |
| **I18N-1: Internationalisation** | 📋 Préparé | - | Docs et fichiers prêts |
| **Bonus: Navigation Header** | ✅ Complété | ~30min | Fix retour board |

---

## SPRINT UI-1 : Preview Images sur Cartes Board ✅

**Objectif** : Afficher une image représentative sur chaque carte Board dans la page `/boards`

**Stratégie** : Hybrid (auto-extraction + choix manuel futur)
- Par défaut : première image trouvée dans les éléments du board
- Option future : l'utilisateur pourra définir manuellement une couverture

---

### UI-1.1 : Schema Database ✅

**Migration** : `032_add_board_cover_image.sql`

```sql
ALTER TABLE deadstock.boards 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT DEFAULT NULL;

COMMENT ON COLUMN deadstock.boards.cover_image_url IS 
  'URL de l''image de couverture du board. NULL = auto-extraction depuis les éléments du board.';
```

**Types TypeScript mis à jour** dans `src/features/boards/domain/types.ts` :

```typescript
// Interface Board - ajout coverImageUrl
export interface Board {
  id: string;
  userId: string | null;
  sessionId: string | null;
  name: string | null;
  description: string | null;
  status: BoardStatus;
  coverImageUrl: string | null;  // ← NOUVEAU
  createdAt: Date;
  updatedAt: Date;
}

// Nouveau type pour la liste avec preview
export interface BoardWithPreview extends Board {
  previewUrl: string | null;  // URL finale (cover ou auto-extrait)
  elementCount: number;
  zoneCount: number;
}

// BoardRow - ajout cover_image_url
export interface BoardRow {
  // ... autres champs
  cover_image_url: string | null;  // ← NOUVEAU
}
```

**Critères de validation** :
- [x] Migration exécutée sans erreur
- [x] Colonne `cover_image_url` visible dans Supabase
- [x] Types TypeScript mis à jour
- [x] Types Supabase régénérés (`npx supabase gen types`)

---

### UI-1.2 : Auto-extraction Preview ✅

**Fichier** : `src/features/boards/infrastructure/boardsRepository.ts`

**Nouvelles fonctions ajoutées** :

```typescript
// Liste les boards avec preview auto-extraite
export async function listBoardsWithPreview(userId: string): Promise<BoardWithPreview[]>

// Extrait l'URL de preview selon priorité
function extractPreviewUrl(
  coverImageUrl: string | null,
  elements: Array<{ element_type: string; element_data: Record<string, unknown> }>
): string | null

// Met à jour l'image de couverture
export async function updateBoardCoverImage(
  boardId: string,
  coverImageUrl: string | null,
  userId: string
): Promise<Board | null>
```

**Logique d'extraction (priorité)** :
1. `cover_image_url` explicite (si défini par l'utilisateur)
2. Premier élément `inspiration` avec `imageUrl`
3. Premier élément `textile` avec `snapshot.imageUrl`
4. Premier élément `silhouette` avec `url`
5. Premier élément `pattern` avec `thumbnailUrl` ou `url` (si image)

**Critères de validation** :
- [x] Boards avec `cover_image_url` retournent cette URL
- [x] Boards sans cover mais avec inspiration retournent l'image
- [x] Boards vides retournent `previewUrl: null`

---

### UI-1.3 : Page Boards avec Preview ✅

**Fichier** : `src/app/(main)/boards/page.tsx`

**Modifications** :
- Import de `listBoardsWithPreviewAction` au lieu de `listBoardsAction`
- Import de `BoardWithPreview` type
- Composant `BoardCard` intégré avec support Image Next.js
- Badges compteurs (éléments, zones) sur les cartes
- Effet hover avec zoom sur l'image

**Fichier** : `src/features/boards/actions/boardActions.ts`

**Nouvelles actions** :
```typescript
export async function listBoardsWithPreviewAction(): Promise<ActionResult<BoardWithPreview[]>>
export async function updateBoardCoverImageAction(boardId: string, coverImageUrl: string | null): Promise<ActionResult<Board>>
```

**Configuration Next.js** : `next.config.ts`

```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' },
    { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },  // ← AJOUTÉ
  ],
},
```

**Critères de validation** :
- [x] Page `/boards` affiche les previews
- [x] Boards avec images montrent la première image
- [x] Boards vides montrent l'icône placeholder
- [x] Compteurs éléments/zones visibles
- [x] Hover effect fonctionnel

---

### UI-1.4 : Menu "Définir couverture" 📋 (Reporté)

**Statut** : Non implémenté dans cette session - fonctionnalité future

L'auto-extraction fonctionne bien, le menu contextuel pour choisir manuellement une couverture sera ajouté dans un sprint ultérieur.

---

## BONUS : Fix Navigation Header ✅

**Problème identifié** : Le bouton "Retour à [Board]" s'affichait sur la page `/boards` alors qu'il ne devrait apparaître que sur `/search` et `/favorites`.

**Solution appliquée** :

### MainHeader.tsx

```typescript
// Lien "Mes Projets" - maintenant visible même dans un board
{!isOnBoardsList && (
  <Link href="/boards" ...>
    <LayoutGrid className="w-4 h-4" />
    Mes Projets
  </Link>
)}

// "Retour à [Board]" - masqué sur /boards
{activeBoard && !isOnBoardPage && !isOnBoardsList && (
  <Link href={activeBoard.returnPath} ...>
    <ArrowLeft className="w-4 h-4" />
    Retour à "{activeBoard.name}"
  </Link>
)}
```

### SharedBoardHeader.tsx

```typescript
// Flèche retour supprimée - navigation via header global "Mes Projets"
{/* Ancien code supprimé :
<Link href="/boards">
  <Button variant="ghost" size="icon">
    <ArrowLeft className="w-4 h-4" />
  </Button>
</Link>
*/}
```

**Comportement final** :
- **Sur un board** : "Mes Projets" visible dans le header → retour à la liste
- **Sur /search ou /favorites** : "Retour à [Board]" + "Mes Projets" visibles
- **Sur /boards** : Seulement "Chercher des tissus" (on y est déjà)

---

## SPRINT I18N-1 : Internationalisation 📋 PRÉPARÉ

**Statut** : Documents et fichiers prêts, implémentation à faire en prochaine session

### Livrables préparés

| Fichier | Description | Statut |
|---------|-------------|--------|
| `GLOSSAIRE_V3_i18n.md` | Mapping terminologique complet | ✅ Créé |
| `i18n/config.ts` | Configuration locales | ✅ Créé |
| `i18n/request.ts` | next-intl server config | ✅ Créé |
| `i18n/navigation.ts` | Links typés + routes | ✅ Créé |
| `i18n/index.ts` | Exports centralisés | ✅ Créé |
| `i18n/middleware.example.ts` | Exemple middleware | ✅ Créé |
| `i18n/messages/fr.json` | Traductions FR (~200 clés) | ✅ Créé |
| `i18n/messages/en.json` | Traductions EN (~200 clés) | ✅ Créé |

### Changements terminologiques prévus

| Avant | Après FR | Après EN |
|-------|----------|----------|
| Mes Boards | Mes Projets | My Projects |
| Nouveau board | Nouveau projet | New project |
| Board / Journey | Canvas / Parcours | Canvas / Journey |
| Projet d'Achat | Commande | Order |

### Prochaine session I18N

1. `npm install next-intl`
2. Copier `i18n/` dans `src/`
3. Configurer `next.config.ts`
4. Créer `src/middleware.ts`
5. Migrer les textes hardcodés
6. Ajouter `LocaleSwitcher` dans header

---

## Fichiers Modifiés (Session)

```
database/migrations/
└── 032_add_board_cover_image.sql        ✅ Créé

src/features/boards/
├── domain/types.ts                       ✅ Modifié (Board, BoardWithPreview, BoardRow)
├── infrastructure/boardsRepository.ts    ✅ Modifié (+listBoardsWithPreview, +extractPreviewUrl, +updateBoardCoverImage)
└── actions/boardActions.ts               ✅ Modifié (+listBoardsWithPreviewAction, +updateBoardCoverImageAction)

src/app/(main)/boards/page.tsx            ✅ Modifié (utilise preview, nouvelle BoardCard)

src/features/navigation/components/
└── MainHeader.tsx                        ✅ Modifié (fix navigation)

src/features/boards/components/
└── SharedBoardHeader.tsx                 ✅ Modifié (suppression flèche retour)

next.config.ts                            ✅ Modifié (+images.unsplash.com)

src/lib/supabase/database.types.ts        ✅ Régénéré (npx supabase gen types)
```

---

## Commits Suggérés

```bash
git add .
git commit -m "feat(boards): add preview images to board cards

- Add cover_image_url column to boards table (migration 032)
- Add BoardWithPreview type and listBoardsWithPreview repository function
- Auto-extract preview from inspiration/textile/silhouette/pattern elements
- Update boards page with image previews and element/zone counters
- Add images.unsplash.com to Next.js remote patterns
- Fix header navigation: show 'Mes Projets' in board view, hide return button on /boards
- Remove back arrow from SharedBoardHeader (use global nav instead)"
```

---

## Prochaines Étapes

### Priorité 1 : Sprint I18N-1 (4h)
- Installer next-intl
- Migrer les textes vers clés i18n
- Tester FR ↔ EN

### Priorité 2 : Sprint UI-1.4 (45min)
- Menu contextuel "Définir comme couverture"
- Option "Retirer la couverture"

### Priorité 3 : Sprints B4-B6 (SPRINT_PLAN.md)
- B4: Potentiel Discovery
- B5: Scraping guidé
- B6: Fusion contraintes

---

## Références

- [GLOSSAIRE_V3_i18n.md](./GLOSSAIRE_V3_i18n.md) - Mapping terminologique
- [ADR-009](../docs/decisions/ADR_009_internationalization_strategy.md) - Stratégie i18n
- [SPRINT_PLAN.md](./SPRINT_PLAN.md) - Plan sprints B1-B6, A1-A6
- [next-intl docs](https://next-intl-docs.vercel.app/) - Documentation officielle
