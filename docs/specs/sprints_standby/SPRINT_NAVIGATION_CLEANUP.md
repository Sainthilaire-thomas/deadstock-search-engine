# Sprint Plan - Nettoyage & Navigation

**Date** : 18 Janvier 2026  
**Objectif** : Nettoyer les branches mortes puis implémenter la nouvelle navigation

---

## PARTIE 1 : AUDIT DES BRANCHES MORTES

### 1.1 Code Mort Identifié

#### 🔴 À SUPPRIMER (Certain)

| Chemin | Raison | Action |
|--------|--------|--------|
| `src/_backup/` | Backup explicite, code non utilisé | Supprimer le dossier |
| `src/_backup/favorites/` | Ancienne page favorites | Supprimer |
| `src/_backup/search/` | Ancienne page search | Supprimer |
| `src/components/textile/` | Dossier vide | Supprimer |
| `src/domains/pattern/constants/` | Structure abandonnée, pattern est dans features | Supprimer |
| `supabase_audit_*.txt` | Fichiers d'audit temporaires à la racine | Supprimer |

#### 🟡 À VÉRIFIER (Potentiellement mort)

| Chemin | Question | Vérification |
|--------|----------|--------------|
| `src/app/(main)/tools/yardage-calculator/` | Page standalone utilisée ? | Vérifier si accessible/utilisée |
| `src/features/journey/components/Sidebar.tsx` | Remplacé par JourneyNavigation ? | Vérifier les imports |
| `src/features/journey/components/SidebarStep.tsx` | Idem | Vérifier les imports |
| `src/features/favorites/utils/sessionManager.ts` | Encore utilisé après migration auth ? | Vérifier les imports |

#### 🟢 À GARDER (Mais réorganiser)

| Chemin | Status | Note |
|--------|--------|------|
| `src/app/(main)/textiles/` | ✅ Actif | Page détail textile |
| `src/app/(main)/textiles/[id]/` | ✅ Actif | Route dynamique |
| `src/features/pattern/` | ✅ Actif | Utilisé dans boards |

### 1.2 Documentation Morte

#### 🔴 À ARCHIVER (docs obsolètes)

| Chemin | Raison |
|--------|--------|
| `docs/ai_context/PROJECT_CONTEXT_COMPACT.md` | Remplacé par V2 |
| `docs/ai_context/PROJECT_CONTEXT_COMPACT_V2.md` | Remplacé par V3 |
| `docs/ai_context/PROJECT_CONTEXT_COMPACT_V3.md` | Remplacé par V4 |
| `docs/ai_context/PROJECT_CONTEXT_V4.md` | Remplacé par V4.1 |
| `docs/ai_context/PROJECT_CONTEXT_V4.1.md` | Remplacé par V4_2 |
| `docs/ai_context/NEXT_STEPS.md` | Obsolète |
| `docs/ai_context/NEXT_STEPS_MVP_DEMO.md` | Obsolète |
| `docs/ai_context/CONTEXT_SUMMARY.md` | Obsolète |
| `docs/project/PHASES.md` | Remplacé par V2 |
| `docs/project/PRODUCT_VISION.md` | Remplacé par V2.1 |
| `docs/specs/SPRINT_PLAN.md` | Multiples versions, garder la dernière |
| `docs/specs/SPRINT_PLAN_V2.1.md` | Idem |
| `docs/specs/SPRINT_PLAN_V2.2.md` | Idem |
| `docs/specs/BOARD_JOURNEY_SPRINTS.md` | Remplacé par V2.x |

**Recommandation** : Créer `docs/_archive/` et y déplacer les anciennes versions.

### 1.3 Résumé Quantitatif

```
CODE À SUPPRIMER
├── src/_backup/           ~3 fichiers
├── src/components/textile/ dossier vide
├── src/domains/           ~1 dossier
└── *.txt racine           ~4 fichiers
                           ─────────────
                           ~8 éléments

DOCS À ARCHIVER            ~20 fichiers markdown
```

---

## PARTIE 2 : SPRINT NETTOYAGE (N1)

### Sprint N1 : Nettoyage Code Mort
**Durée estimée** : 1h  
**Risque** : Faible (code explicitement mort)

#### N1.1 - Supprimer les backups (15min)

```bash
# Fichiers à supprimer
rm -rf src/_backup/
rm -rf src/components/textile/
rm -rf src/domains/
rm supabase_audit_*.txt
```

**Checklist** :
- [ ] Supprimer `src/_backup/`
- [ ] Supprimer `src/components/textile/` (dossier vide)
- [ ] Supprimer `src/domains/` (structure abandonnée)
- [ ] Supprimer `supabase_audit_*.txt` à la racine

#### N1.2 - Vérifier et nettoyer les imports orphelins (30min)

```bash
# Rechercher les imports cassés après suppression
npx tsc --noEmit
```

**Checklist** :
- [ ] Lancer `npx tsc --noEmit`
- [ ] Corriger les imports cassés si présents
- [ ] Vérifier que l'app démarre (`npm run dev`)

#### N1.3 - Archiver la documentation obsolète (15min)

```bash
# Créer le dossier archive
mkdir -p docs/_archive

# Déplacer les anciennes versions
mv docs/ai_context/PROJECT_CONTEXT_COMPACT.md docs/_archive/
mv docs/ai_context/PROJECT_CONTEXT_COMPACT_V2.md docs/_archive/
# ... etc
```

**Checklist** :
- [ ] Créer `docs/_archive/`
- [ ] Déplacer les docs obsolètes
- [ ] Mettre à jour les références si nécessaire

#### N1.4 - Commit nettoyage

```bash
git add -A
git commit -m "chore: cleanup dead code and archive obsolete docs"
```

---

## PARTIE 3 : SPRINT NAVIGATION (NAV1-NAV4)

### Vue d'Ensemble Architecture Cible

```
STRUCTURE ROUTES FINALE
├── / ........................ Landing (public)
├── /home .................... Hub de choix (après login) ⭐ NOUVEAU
├── /search .................. Recherche globale ⭐ NOUVEAU
├── /boards .................. Liste des projets
├── /boards/[boardId] ........ Board canvas
├── /boards/[boardId]/journey  Vue Journey
├── /favorites ............... Page favoris ⭐ NOUVEAU
├── /textiles/[id] ........... Détail textile
├── /settings ................ Paramètres
└── /admin/* ................. Administration (caché)
```

```
HEADER CONTEXTUEL
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]     [← Retour projet?]    [Recherche]          [Avatar] │
│                                  (si hors projet)       │      │
│                                                         ▼      │
│                                               ┌──────────────┐ │
│                                               │ Mon compte   │ │
│                                               │ Paramètres   │ │
│                                               │ ──────────── │ │
│                                               │ Admin (si)   │ │
│                                               │ ──────────── │ │
│                                               │ Déconnexion  │ │
│                                               └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

### Sprint NAV1 : Page Hub (/home)
**Durée estimée** : 2h  
**Dépendances** : N1

#### NAV1.1 - Créer la page /home (1h)

```
Fichier : src/app/(main)/home/page.tsx
```

**Contenu** :
- [ ] Titre "Que souhaitez-vous faire ?"
- [ ] Carte "Recherche" → description + CTA → /search
- [ ] Carte "Mes Projets" → description + compteur boards + CTA → /boards
- [ ] Design : 2 cartes côte à côte, égales, style épuré

```typescript
// Structure de la page
export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-12">
          Que souhaitez-vous faire ?
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Carte Recherche */}
          <HomeCard
            icon={<Search />}
            title="Rechercher des tissus"
            description="Explorez 268 tissus deadstock de 4 fournisseurs. Filtres avancés, multi-sources."
            features={["Accès direct", "Filtres avancés", "Multi-sources"]}
            href="/search"
            cta="Lancer une recherche"
          />
          
          {/* Carte Projets */}
          <HomeCard
            icon={<LayoutGrid />}
            title="Mes Projets"
            description="Créez un projet de design avec une approche circulaire. Moodboard, calcul métrage, recherche contextuelle."
            features={["Moodboard", "Calcul métrage", "Recherche contextuelle"]}
            href="/boards"
            cta="Voir mes projets"
            badge={boardsCount > 0 ? `${boardsCount} projet(s)` : undefined}
          />
        </div>
      </div>
    </div>
  );
}
```

#### NAV1.2 - Composant HomeCard (30min)

```
Fichier : src/app/(main)/home/components/HomeCard.tsx
```

**Checklist** :
- [ ] Props : icon, title, description, features, href, cta, badge?
- [ ] Style : Card avec hover effect
- [ ] Features en liste discrète
- [ ] CTA button en bas

#### NAV1.3 - Redirection après login (30min)

```
Fichier : src/middleware.ts (modifier)
```

**Checklist** :
- [ ] Après login réussi → redirect vers `/home` (au lieu de `/boards`)
- [ ] Si déjà connecté sur `/` → redirect vers `/home`

**Livrable** : Page hub fonctionnelle accessible après login

---

### Sprint NAV2 : Page Search (/search)
**Durée estimée** : 2h  
**Dépendances** : NAV1

#### NAV2.1 - Créer la page /search (45min)

```
Fichier : src/app/(main)/search/page.tsx
```

**Checklist** :
- [ ] Import SearchInterface existant
- [ ] Header avec titre
- [ ] Breadcrumb optionnel
- [ ] Métadonnées SEO

```typescript
import { SearchInterface } from '@/components/search/SearchInterface';

export const metadata = {
  title: 'Rechercher des tissus | Deadstock',
  description: 'Recherchez parmi 268 tissus deadstock de 4 fournisseurs'
};

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SearchInterface />
    </div>
  );
}
```

#### NAV2.2 - Adapter SearchInterface si nécessaire (45min)

```
Fichier : src/components/search/SearchInterface.tsx
```

**Checklist** :
- [ ] Vérifier que le composant fonctionne standalone
- [ ] Ajouter props optionnelles : `showHeader`, `onTextileSelect`
- [ ] S'assurer que FavoritesContext est disponible

#### NAV2.3 - Contexte de navigation (30min)

```
Fichier : src/features/navigation/context/NavigationContext.tsx ⭐ NOUVEAU
```

**Checklist** :
- [ ] State : `activeBoard: { id, name, returnPath } | null`
- [ ] Actions : `setActiveBoard`, `clearActiveBoard`
- [ ] Persistence : sessionStorage pour survie au refresh

```typescript
interface NavigationState {
  activeBoard: {
    id: string;
    name: string;
    returnPath: string;
  } | null;
}

const NavigationContext = createContext<{
  state: NavigationState;
  setActiveBoard: (board: NavigationState['activeBoard']) => void;
  clearActiveBoard: () => void;
}>();
```

**Livrable** : Page search fonctionnelle avec contexte navigation

---

### Sprint NAV3 : Page Favorites (/favorites)
**Durée estimée** : 1.5h  
**Dépendances** : NAV2

#### NAV3.1 - Créer la page /favorites (1h)

```
Fichier : src/app/(main)/favorites/page.tsx
```

**Checklist** :
- [ ] Import FavoritesGrid existant
- [ ] Header avec titre et compteur
- [ ] État vide si pas de favoris
- [ ] Lien vers /search si vide

```typescript
import { FavoritesGrid } from '@/features/favorites/components/FavoritesGrid';
import { useFavorites } from '@/features/favorites/context/FavoritesContext';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Mes Favoris</h1>
        <span className="text-muted-foreground">
          {favorites.length} tissu(s)
        </span>
      </div>
      
      {favorites.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <FavoritesGrid favorites={favorites} />
      )}
    </div>
  );
}
```

#### NAV3.2 - Composant EmptyFavorites (30min)

```
Fichier : src/app/(main)/favorites/components/EmptyFavorites.tsx
```

**Checklist** :
- [ ] Illustration ou icône
- [ ] Message explicatif
- [ ] CTA vers /search

**Livrable** : Page favoris fonctionnelle

---

### Sprint NAV4 : Header Global & Navigation
**Durée estimée** : 3h  
**Dépendances** : NAV1, NAV2, NAV3

#### NAV4.1 - Refactoring Layout Principal (1h)

```
Fichier : src/app/(main)/layout.tsx (modifier)
```

**Checklist** :
- [ ] Extraire le header actuel
- [ ] Créer composant `MainHeader`
- [ ] Intégrer NavigationContext provider

```typescript
export default function MainLayout({ children }) {
  return (
    <NavigationProvider>
      <FavoritesProvider>
        <div className="min-h-screen flex flex-col">
          <MainHeader />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </FavoritesProvider>
    </NavigationProvider>
  );
}
```

#### NAV4.2 - Composant MainHeader (1.5h)

```
Fichier : src/components/navigation/MainHeader.tsx ⭐ NOUVEAU
```

**Structure** :
```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]  [← Retour "Projet X"]?  [Recherche]?          [Avatar] │
└─────────────────────────────────────────────────────────────────┘
         │                        │
         └─ Si activeBoard        └─ Si pas dans /search
```

**Checklist** :
- [ ] Logo → lien vers /home
- [ ] Bouton retour projet (conditionnel, si activeBoard)
- [ ] Lien Recherche (conditionnel, si pas sur /search)
- [ ] UserMenu avec dropdown (existant à adapter)
- [ ] Responsive (hamburger sur mobile ?)

```typescript
function MainHeader() {
  const pathname = usePathname();
  const { state } = useNavigation();
  const { activeBoard } = state;
  
  const isInSearch = pathname === '/search';
  const isInBoard = pathname.startsWith('/boards/') && pathname !== '/boards';
  
  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/home" className="font-bold text-xl">
          Deadstock
        </Link>
        
        {/* Navigation centrale */}
        <div className="flex items-center gap-6">
          {/* Retour au projet actif */}
          {activeBoard && !isInBoard && (
            <Link 
              href={activeBoard.returnPath}
              className="flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à "{activeBoard.name}"
            </Link>
          )}
          
          {/* Lien Recherche (si pas déjà dessus) */}
          {!isInSearch && (
            <Link href="/search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Recherche
            </Link>
          )}
        </div>
        
        {/* User Menu */}
        <UserMenu />
      </nav>
    </header>
  );
}
```

#### NAV4.3 - Adapter UserMenu avec Admin (30min)

```
Fichier : src/features/auth/components/UserMenu.tsx (modifier)
```

**Checklist** :
- [ ] Ajouter lien Admin (conditionnel si user.role === 'admin')
- [ ] Séparateur avant Admin
- [ ] Icône Settings pour Admin

```typescript
{user?.role === 'admin' && (
  <>
    <DropdownMenuSeparator />
    <DropdownMenuItem asChild>
      <Link href="/admin">
        <Settings className="w-4 h-4 mr-2" />
        Administration
      </Link>
    </DropdownMenuItem>
  </>
)}
```

#### NAV4.4 - Intégrer setActiveBoard dans Board (30min)

```
Fichier : src/app/(main)/boards/[boardId]/layout.tsx (modifier)
```

**Checklist** :
- [ ] Au montage, appeler `setActiveBoard` avec infos du board
- [ ] Au démontage, appeler `clearActiveBoard`
- [ ] Stocker le path actuel comme `returnPath`

```typescript
useEffect(() => {
  if (board) {
    setActiveBoard({
      id: board.id,
      name: board.name,
      returnPath: pathname // /boards/[id] ou /boards/[id]/journey
    });
  }
  
  return () => clearActiveBoard();
}, [board, pathname]);
```

**Livrable** : Navigation complète fonctionnelle

---

## PARTIE 4 : SPRINT POLISH (NAV5)

### Sprint NAV5 : Finitions & Tests
**Durée estimée** : 2h  
**Dépendances** : NAV4

#### NAV5.1 - Modifier la Landing Page (45min)

```
Fichier : src/app/page.tsx (modifier)
```

**Checklist** :
- [ ] Si connecté → redirect vers /home
- [ ] Si non connecté → afficher landing avec 2 CTAs égaux
- [ ] CTA 1 : "Chercher des tissus" → /login puis /search
- [ ] CTA 2 : "Créer un projet" → /login puis /boards

#### NAV5.2 - Tests de navigation (45min)

**Scénarios à tester** :
- [ ] Login → arrive sur /home
- [ ] /home → clic Recherche → /search
- [ ] /home → clic Projets → /boards
- [ ] /boards → créer board → /boards/[id]
- [ ] Dans board → clic Recherche header → /search avec bouton retour
- [ ] /search → clic retour → revient au board
- [ ] /search → favoriser tissu → compteur badge
- [ ] Header → Avatar → Admin visible (si admin)
- [ ] Logo → toujours retour /home

#### NAV5.3 - Mobile responsive (30min)

**Checklist** :
- [ ] Header collapse sur mobile
- [ ] Navigation hamburger ou bottom tabs
- [ ] Page hub : cartes empilées sur mobile

---

## RÉSUMÉ EFFORT TOTAL

| Sprint | Durée | Priorité |
|--------|-------|----------|
| **NETTOYAGE** |
| N1: Cleanup code mort | 1h | P0 |
| **NAVIGATION** |
| NAV1: Page Hub (/home) | 2h | P1 |
| NAV2: Page Search (/search) | 2h | P1 |
| NAV3: Page Favorites (/favorites) | 1.5h | P1 |
| NAV4: Header Global | 3h | P1 |
| NAV5: Polish & Tests | 2h | P2 |
| **TOTAL** | **11.5h** | |

---

## ORDRE D'EXÉCUTION

```
Jour 1 (4h)
├── N1: Nettoyage (1h)
├── NAV1: Page Hub (2h)
└── NAV2: Page Search - début (1h)

Jour 2 (4h)
├── NAV2: Page Search - fin (1h)
├── NAV3: Page Favorites (1.5h)
└── NAV4: Header Global - début (1.5h)

Jour 3 (3.5h)
├── NAV4: Header Global - fin (1.5h)
└── NAV5: Polish & Tests (2h)
```

---

## CRITÈRES DE VALIDATION

### Sprint N1 ✓
- [ ] `npx tsc --noEmit` passe sans erreur
- [ ] `npm run dev` démarre correctement
- [ ] Pas de dossier `_backup` dans src/

### Sprint NAV1 ✓
- [ ] `/home` affiche 2 cartes égales
- [ ] Clic sur carte → navigation correcte
- [ ] Après login → arrivée sur `/home`

### Sprint NAV2 ✓
- [ ] `/search` affiche SearchInterface
- [ ] Recherche fonctionne (filtres, résultats)
- [ ] Favoris cliquables depuis résultats

### Sprint NAV3 ✓
- [ ] `/favorites` affiche la liste des favoris
- [ ] État vide avec CTA vers search
- [ ] Suppression favoris fonctionne

### Sprint NAV4 ✓
- [ ] Header visible sur toutes les pages (main)
- [ ] Logo → /home
- [ ] Bouton retour projet apparaît quand pertinent
- [ ] Admin visible dans menu si admin

### Sprint NAV5 ✓
- [ ] Tous les scénarios de test passent
- [ ] Mobile : navigation utilisable
- [ ] Pas de régression sur boards/journey

---

## NOTES TECHNIQUES

### Fichiers Clés à Créer

```
src/
├── app/(main)/
│   ├── home/
│   │   ├── page.tsx              ⭐ NOUVEAU
│   │   └── components/
│   │       └── HomeCard.tsx      ⭐ NOUVEAU
│   ├── search/
│   │   └── page.tsx              ⭐ NOUVEAU
│   └── favorites/
│       ├── page.tsx              ⭐ NOUVEAU
│       └── components/
│           └── EmptyFavorites.tsx ⭐ NOUVEAU
├── components/
│   └── navigation/
│       └── MainHeader.tsx        ⭐ NOUVEAU
└── features/
    └── navigation/
        └── context/
            └── NavigationContext.tsx ⭐ NOUVEAU
```

### Fichiers à Modifier

```
src/
├── app/(main)/layout.tsx         → Intégrer MainHeader
├── app/(main)/boards/[boardId]/layout.tsx → setActiveBoard
├── app/page.tsx                  → Landing avec redirect
├── features/auth/components/UserMenu.tsx → Ajouter Admin
└── middleware.ts                 → Redirect après login
```

---

## PROCHAINES ÉTAPES APRÈS NAVIGATION

Une fois la navigation en place :
1. Intégrer le bouton Search dans le header du Board (accès rapide)
2. Améliorer la recherche contextuelle (lien avec Search globale)
3. Implémenter les sprints B1-B6 (recherche contextuelle avancée)
