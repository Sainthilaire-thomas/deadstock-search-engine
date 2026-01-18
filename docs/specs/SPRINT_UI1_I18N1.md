# SPRINT UI-1 & I18N-1 - Preview Images & Internationalisation

**Version** : 1.0  
**Date** : 18 Janvier 2026  
**Contexte** : Post-MVP Phase 1, préparation scale international

---

## Vue d'Ensemble

```
SPRINT UI-1                              SPRINT I18N-1
─────────────                            ─────────────

UI-1.1: Schema cover_image               I18N-1.1: Setup next-intl
UI-1.2: Auto-extraction preview          I18N-1.2: Migration termes FR
UI-1.3: Composant BoardCard              I18N-1.3: Traductions EN
UI-1.4: Menu "Définir couverture"        I18N-1.4: Locale switching

Durée: 3h                                Durée: 4h
```

---

## SPRINT UI-1 : Preview Images sur Cartes Board

**Objectif** : Afficher une image représentative sur chaque carte Board dans la page `/boards`

**Stratégie** : Hybrid (auto-extraction + choix manuel)
- Par défaut : première image trouvée dans les éléments du board
- Option : l'utilisateur peut définir manuellement une couverture

---

### UI-1.1 : Schema Database (30min)

**Migration** : `032_add_board_cover_image.sql`

```sql
-- Ajouter colonne cover_image à la table boards
ALTER TABLE deadstock.boards 
ADD COLUMN cover_image_url TEXT DEFAULT NULL;

-- Commentaire explicatif
COMMENT ON COLUMN deadstock.boards.cover_image_url IS 
  'URL de l''image de couverture. NULL = auto-extraction depuis éléments.';

-- Index pour les requêtes de liste (optionnel, faible cardinalité)
-- CREATE INDEX idx_boards_has_cover ON deadstock.boards ((cover_image_url IS NOT NULL));
```

**Types TypeScript** :

```typescript
// src/features/boards/domain/types.ts

// Ajouter à l'interface Board existante
export interface Board {
  id: string;
  name: string;
  user_id: string;
  cover_image_url: string | null;  // ← NOUVEAU
  created_at: string;
  updated_at: string;
}

// Type pour la carte avec preview
export interface BoardWithPreview extends Board {
  preview_url: string | null;      // URL finale (cover_image_url ou auto-extrait)
  element_count: number;
  zone_count: number;
}
```

**Critères de validation** :
- [ ] Migration exécutée sans erreur
- [ ] Colonne `cover_image_url` visible dans Supabase
- [ ] Types TypeScript mis à jour

---

### UI-1.2 : Auto-extraction Preview (45min)

**Fichier** : `src/features/boards/infrastructure/boardsRepository.ts`

**Logique d'extraction** :
1. Si `cover_image_url` existe → utiliser directement
2. Sinon chercher le premier élément avec image :
   - `inspiration` avec `image_url`
   - `textile` avec image (via join)
   - `silhouette` avec `file_data`
   - `pattern` avec `file_data`

**Query optimisée** :

```typescript
// boardsRepository.ts

export async function getBoardsWithPreview(userId: string): Promise<BoardWithPreview[]> {
  const supabase = await createClient();
  
  // Query principale avec sous-requête pour preview
  const { data, error } = await supabase
    .schema('deadstock')
    .from('boards')
    .select(`
      id,
      name,
      user_id,
      cover_image_url,
      created_at,
      updated_at,
      board_elements (
        id,
        element_type,
        element_data
      ),
      board_zones (
        id
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  // Post-process pour extraire preview
  return (data || []).map(board => ({
    id: board.id,
    name: board.name,
    user_id: board.user_id,
    cover_image_url: board.cover_image_url,
    created_at: board.created_at,
    updated_at: board.updated_at,
    preview_url: extractPreviewUrl(board),
    element_count: board.board_elements?.length || 0,
    zone_count: board.board_zones?.length || 0,
  }));
}

/**
 * Extrait l'URL de preview d'un board
 * Priorité: cover_image_url > inspiration > textile > silhouette > pattern
 */
function extractPreviewUrl(board: BoardWithElements): string | null {
  // 1. Cover explicite
  if (board.cover_image_url) {
    return board.cover_image_url;
  }

  // 2. Chercher dans les éléments
  const elements = board.board_elements || [];
  
  // Priorité aux inspirations (images)
  const inspiration = elements.find(e => 
    e.element_type === 'inspiration' && 
    e.element_data?.image_url
  );
  if (inspiration) {
    return inspiration.element_data.image_url;
  }

  // Textiles avec image
  const textile = elements.find(e => 
    e.element_type === 'textile' && 
    e.element_data?.image_url
  );
  if (textile) {
    return textile.element_data.image_url;
  }

  // Silhouettes et patterns (base64 - à convertir si nécessaire)
  const mediaElement = elements.find(e => 
    ['silhouette', 'pattern'].includes(e.element_type) && 
    e.element_data?.file_data
  );
  if (mediaElement?.element_data?.file_data) {
    // Retourner data URL pour base64
    const mimeType = mediaElement.element_data.file_type || 'image/png';
    return `data:${mimeType};base64,${mediaElement.element_data.file_data}`;
  }

  // 3. Pas d'image trouvée
  return null;
}
```

**Critères de validation** :
- [ ] Boards avec `cover_image_url` retournent cette URL
- [ ] Boards sans cover mais avec inspiration retournent l'image
- [ ] Boards vides retournent `preview_url: null`

---

### UI-1.3 : Composant BoardCard avec Preview (1h)

**Fichier** : `src/features/boards/components/BoardCard.tsx`

```typescript
'use client';

import { Card } from '@/components/ui/card';
import { LayoutGrid, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { BoardWithPreview } from '../domain/types';

interface BoardCardProps {
  board: BoardWithPreview;
}

export function BoardCard({ board }: BoardCardProps) {
  const formattedDate = formatDistanceToNow(new Date(board.updated_at), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <Link href={`/boards/${board.id}`}>
      <Card className="group overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
        {/* Preview Image Area */}
        <div className="aspect-4/3 relative bg-muted">
          {board.preview_url ? (
            <Image
              src={board.preview_url}
              alt={board.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <LayoutGrid className="w-12 h-12 text-muted-foreground/40" />
            </div>
          )}
          
          {/* Overlay avec compteurs */}
          <div className="absolute bottom-2 right-2 flex gap-1">
            {board.element_count > 0 && (
              <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                {board.element_count} élément{board.element_count > 1 ? 's' : ''}
              </span>
            )}
            {board.zone_count > 0 && (
              <span className="bg-primary/80 text-white text-xs px-2 py-0.5 rounded-full">
                {board.zone_count} zone{board.zone_count > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Info Area */}
        <div className="p-4">
          <h3 className="font-medium truncate group-hover:text-primary transition-colors">
            {board.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Modifié {formattedDate}
          </p>
        </div>
      </Card>
    </Link>
  );
}
```

**Fichier** : `src/app/(main)/boards/page.tsx` (mise à jour)

```typescript
// Remplacer l'import et l'utilisation

import { BoardCard } from '@/features/boards/components/BoardCard';
import { getBoardsWithPreview } from '@/features/boards/infrastructure/boardsRepository';

export default async function BoardsPage() {
  const user = await getCurrentUser();
  const boards = await getBoardsWithPreview(user.id);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Mes Projets</h1>
          <p className="text-muted-foreground">
            Organisez vos idées et inspirations
          </p>
        </div>
        <NewBoardButton />
      </div>

      {boards.length === 0 ? (
        <EmptyBoardsState />
      ) : (
        <>
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            PROJETS ACTIFS ({boards.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

**Critères de validation** :
- [ ] Cartes affichent l'image de preview si disponible
- [ ] Cartes sans image affichent l'icône placeholder
- [ ] Compteurs éléments/zones visibles
- [ ] Hover effect fonctionnel

---

### UI-1.4 : Menu "Définir comme couverture" (45min)

**Fichier** : `src/features/boards/components/ElementContextMenu.tsx`

Ajouter une option dans le menu contextuel des éléments image :

```typescript
// Dans le menu contextuel existant ou nouveau composant

interface ElementContextMenuProps {
  element: BoardElement;
  onSetAsCover: (elementId: string) => void;
  // ... autres props
}

// Option à ajouter pour les éléments avec image
{hasImage(element) && (
  <DropdownMenuItem onClick={() => onSetAsCover(element.id)}>
    <ImageIcon className="w-4 h-4 mr-2" />
    Définir comme couverture
  </DropdownMenuItem>
)}

function hasImage(element: BoardElement): boolean {
  return ['inspiration', 'textile', 'silhouette', 'pattern'].includes(element.element_type)
    && (element.element_data?.image_url || element.element_data?.file_data);
}
```

**Action Server** : `src/features/boards/actions/boardActions.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function setBoardCoverImage(
  boardId: string, 
  imageUrl: string | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .schema('deadstock')
    .from('boards')
    .update({ cover_image_url: imageUrl })
    .eq('id', boardId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/boards');
  return { success: true };
}

export async function setBoardCoverFromElement(
  boardId: string,
  elementId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Récupérer l'élément pour extraire l'image
  const { data: element, error: fetchError } = await supabase
    .schema('deadstock')
    .from('board_elements')
    .select('element_type, element_data')
    .eq('id', elementId)
    .single();

  if (fetchError || !element) {
    return { success: false, error: 'Élément non trouvé' };
  }

  // Extraire l'URL de l'image
  let imageUrl: string | null = null;
  
  if (element.element_data?.image_url) {
    imageUrl = element.element_data.image_url;
  } else if (element.element_data?.file_data) {
    // Pour les fichiers base64, on stocke le data URL
    const mimeType = element.element_data.file_type || 'image/png';
    imageUrl = `data:${mimeType};base64,${element.element_data.file_data}`;
  }

  if (!imageUrl) {
    return { success: false, error: 'Cet élément n\'a pas d\'image' };
  }

  return setBoardCoverImage(boardId, imageUrl);
}
```

**Critères de validation** :
- [ ] Menu contextuel affiche "Définir comme couverture" sur éléments image
- [ ] Clic met à jour `cover_image_url` en base
- [ ] La carte Board affiche la nouvelle couverture
- [ ] Option "Retirer la couverture" disponible si cover définie

---

## SPRINT I18N-1 : Normalisation Terminologique & Internationalisation

**Objectif** : 
1. Normaliser les termes UI (Board → Projet, etc.)
2. Mettre en place l'infrastructure i18n avec next-intl
3. Préparer les traductions FR et EN

**Dépendances** : 
- Glossaire V3 (livré)
- Fichiers i18n (livrés)

---

### I18N-1.1 : Setup next-intl (1h)

#### Installation

```bash
npm install next-intl
```

#### Structure des fichiers

```
src/
├── i18n/
│   ├── config.ts           # ✅ Livré
│   ├── request.ts          # ✅ Livré  
│   ├── navigation.ts       # ✅ Livré
│   ├── index.ts            # ✅ Livré
│   └── messages/
│       ├── fr.json         # ✅ Livré
│       └── en.json         # ✅ Livré
│
├── middleware.ts           # À créer depuis exemple
└── app/
    └── [locale]/           # À créer (optionnel Phase 1)
```

#### Configuration Next.js

**Fichier** : `next.config.ts`

```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  // ... config existante
};

export default withNextIntl(nextConfig);
```

#### Middleware (simplifié pour Phase 1)

**Fichier** : `src/middleware.ts`

```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  // Phase 1: pas de préfixe locale dans l'URL
  localePrefix: 'never',
  localeDetection: true,
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

**Note Phase 1** : On utilise `localePrefix: 'never'` pour éviter de refactorer toutes les routes. Les URLs restent `/boards`, `/search`, etc. La locale est stockée dans un cookie.

#### Provider

**Fichier** : `src/app/layout.tsx` (mise à jour)

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**Critères de validation** :
- [ ] `npm install next-intl` réussi
- [ ] App démarre sans erreur
- [ ] `useTranslations()` fonctionne dans un composant test

---

### I18N-1.2 : Migration Termes FR (1h30)

**Objectif** : Remplacer les textes hardcodés par des clés de traduction

#### Mapping des changements

| Fichier | Avant | Après (clé i18n) |
|---------|-------|------------------|
| `/boards/page.tsx` | "Mes Boards" | `t('project.myProjects')` |
| `/boards/page.tsx` | "Nouveau board" | `t('project.newProject')` |
| `/boards/page.tsx` | "BOARDS ACTIFS" | `t('project.activeProjects')` |
| `ViewToggle.tsx` | "Board" | `t('views.canvas')` |
| `ViewToggle.tsx` | "Journey" | `t('views.journey')` |
| `BoardCard.tsx` | "Modifié le" | `t('project.lastModified')` |
| `SharedBoardHeader.tsx` | Labels divers | Clés correspondantes |

#### Exemple de migration

**Avant** :
```typescript
// src/app/(main)/boards/page.tsx
export default function BoardsPage() {
  return (
    <div>
      <h1>Mes Boards</h1>
      <p>Organisez vos idées et inspirations</p>
      <button>+ Nouveau board</button>
      <h2>BOARDS ACTIFS (3)</h2>
    </div>
  );
}
```

**Après** :
```typescript
// src/app/(main)/boards/page.tsx
import { useTranslations } from 'next-intl';

export default function BoardsPage() {
  const t = useTranslations('project');
  
  return (
    <div>
      <h1>{t('myProjects')}</h1>
      <p>{t('organizeIdeas')}</p>
      <button>+ {t('newProject')}</button>
      <h2>{t('activeProjects').toUpperCase()} (3)</h2>
    </div>
  );
}
```

#### Liste des fichiers à migrer (priorité haute)

1. **Navigation & Layout**
   - [ ] `src/app/(main)/layout.tsx` - Nav labels
   - [ ] `src/components/navigation/` - Si existant

2. **Boards Module**
   - [ ] `src/app/(main)/boards/page.tsx` - Page liste
   - [ ] `src/features/boards/components/BoardCard.tsx` - Carte
   - [ ] `src/features/boards/components/ViewToggle.tsx` - Toggle
   - [ ] `src/features/boards/components/SharedBoardHeader.tsx` - Header
   - [ ] `src/features/boards/components/BoardToolbar.tsx` - Tooltips

3. **Search Module**
   - [ ] `src/app/(main)/search/page.tsx` - Page recherche
   - [ ] `src/components/search/Filters.tsx` - Labels filtres
   - [ ] `src/components/search/SearchBar.tsx` - Placeholder

4. **Favorites Module**
   - [ ] `src/app/(main)/favorites/page.tsx` - Page favoris

#### Pattern de migration

```typescript
// 1. Import du hook
import { useTranslations } from 'next-intl';

// 2. Dans le composant (client) ou fonction (server)
const t = useTranslations('namespace');

// 3. Utilisation
<h1>{t('key')}</h1>
<p>{t('keyWithVariable', { count: 5 })}</p>

// Pour les composants serveur
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('namespace');
```

**Critères de validation** :
- [ ] Tous les textes UI principaux utilisent les clés i18n
- [ ] Aucun "Boards" hardcodé visible (remplacé par "Projets")
- [ ] App fonctionne identiquement en FR

---

### I18N-1.3 : Validation Traductions EN (30min)

**Objectif** : Vérifier que le fichier `en.json` est complet et cohérent

#### Checklist

- [ ] Toutes les clés de `fr.json` existent dans `en.json`
- [ ] Pas de texte français dans `en.json`
- [ ] Pluriels corrects (`{count, plural, =1 {...} other {...}}`)
- [ ] Variables identiques (`{date}`, `{count}`, etc.)

#### Script de validation (optionnel)

```typescript
// scripts/validate-i18n.ts
import fr from '../src/i18n/messages/fr.json';
import en from '../src/i18n/messages/en.json';

function getKeys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null
      ? getKeys(value, path)
      : [path];
  });
}

const frKeys = new Set(getKeys(fr));
const enKeys = new Set(getKeys(en));

// Clés manquantes en EN
const missingInEn = [...frKeys].filter(k => !enKeys.has(k));
if (missingInEn.length > 0) {
  console.error('Missing in en.json:', missingInEn);
}

// Clés supplémentaires en EN (erreur potentielle)
const extraInEn = [...enKeys].filter(k => !frKeys.has(k));
if (extraInEn.length > 0) {
  console.warn('Extra in en.json:', extraInEn);
}
```

**Critères de validation** :
- [ ] Script de validation passe sans erreur
- [ ] Relecture manuelle des traductions critiques

---

### I18N-1.4 : Locale Switching (1h)

**Objectif** : Permettre à l'utilisateur de changer de langue

#### Composant LocaleSwitcher

**Fichier** : `src/components/LocaleSwitcher.tsx`

```typescript
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    // Stocker la préférence dans un cookie
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    // Rafraîchir la page pour appliquer
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{localeFlags[locale as Locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={locale === loc ? 'bg-accent' : ''}
          >
            <span className="mr-2">{localeFlags[loc]}</span>
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### Intégration dans le Header

**Fichier** : `src/app/(main)/layout.tsx` ou header component

```typescript
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

// Dans le header, à côté du theme toggle
<div className="flex items-center gap-2">
  <LocaleSwitcher />
  <ThemeToggle />
  <UserMenu />
</div>
```

**Critères de validation** :
- [ ] Dropdown langue visible dans le header
- [ ] Changement de langue persiste (cookie)
- [ ] Tous les textes changent après switch
- [ ] Pas de flash/reload visible (smooth transition)

---

## Résumé des Livrables

### Sprint UI-1 : Preview Images (3h)

| Tâche | Durée | Fichiers |
|-------|-------|----------|
| UI-1.1 Schema | 30min | `032_add_board_cover_image.sql`, `types.ts` |
| UI-1.2 Auto-extraction | 45min | `boardsRepository.ts` |
| UI-1.3 BoardCard | 1h | `BoardCard.tsx`, `boards/page.tsx` |
| UI-1.4 Menu couverture | 45min | `ElementContextMenu.tsx`, `boardActions.ts` |

### Sprint I18N-1 : Internationalisation (4h)

| Tâche | Durée | Fichiers |
|-------|-------|----------|
| I18N-1.1 Setup | 1h | `next.config.ts`, `middleware.ts`, `layout.tsx` |
| I18N-1.2 Migration FR | 1h30 | ~15 fichiers composants |
| I18N-1.3 Validation EN | 30min | `en.json`, script validation |
| I18N-1.4 Locale Switch | 1h | `LocaleSwitcher.tsx`, header |

---

## Ordre d'Exécution Recommandé

### Session 1 : Preview Images (3h)

```
1. UI-1.1 : Migration database           [30min]
2. UI-1.2 : Repository avec extraction   [45min]
3. UI-1.3 : Composant BoardCard          [1h]
4. UI-1.4 : Menu contextuel              [45min]
   └── Test complet
```

### Session 2 : i18n (4h)

```
1. I18N-1.1 : Setup next-intl            [1h]
   └── Vérifier que l'app démarre
2. I18N-1.2 : Migration termes           [1h30]
   └── Boards module en priorité
3. I18N-1.3 : Validation EN              [30min]
4. I18N-1.4 : Locale switcher            [1h]
   └── Test FR ↔ EN
```

---

## Critères de Validation Finale

### Preview Images ✓

- [ ] Page `/boards` affiche les previews
- [ ] Boards avec images montrent la première image
- [ ] Boards vides montrent l'icône placeholder
- [ ] "Définir comme couverture" fonctionne
- [ ] Compteurs éléments/zones visibles

### Internationalisation ✓

- [ ] App démarre avec next-intl configuré
- [ ] "Mes Boards" → "Mes Projets" partout
- [ ] Toggle "Canvas / Parcours" (anciennement Board / Journey)
- [ ] Switcher de langue fonctionnel
- [ ] Changement FR ↔ EN sans erreur
- [ ] Cookie NEXT_LOCALE persiste la préférence

---

## Notes Techniques

### Performance Preview

- Les previews utilisent `next/image` avec lazy loading
- Base64 pour silhouettes/patterns (pas d'upload externe)
- Cache côté client pour éviter re-fetch

### i18n et SSR

- `getTranslations()` pour les Server Components
- `useTranslations()` pour les Client Components
- Messages injectés via `NextIntlClientProvider`

### Migration Progressive

Phase 1 (cette session) :
- Infrastructure i18n complète
- Termes principaux migrés
- Switcher fonctionnel

Phase 2 (future) :
- URLs avec locale prefix (`/fr/boards`, `/en/boards`)
- SEO multi-langues (hreflang)
- Traductions ES, IT, DE

---

## Références

- [GLOSSAIRE_V3_i18n.md](./GLOSSAIRE_V3_i18n.md) - Mapping terminologique
- [ADR-009](../docs/decisions/ADR_009_internationalization_strategy.md) - Stratégie i18n
- [next-intl docs](https://next-intl-docs.vercel.app/) - Documentation officielle
