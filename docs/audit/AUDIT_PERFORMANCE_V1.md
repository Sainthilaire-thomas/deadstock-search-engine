# Audit de Performance - Deadstock Search Engine

**Date** : 18 Janvier 2026  
**Version** : 1.0  
**Statut** : En cours

---

## 📊 Résumé Exécutif

| Métrique | Valeur | Objectif | Statut |
|----------|--------|----------|--------|
| LCP (Largest Contentful Paint) | 1.09-1.19s | <2.5s | ✅ Bon |
| CLS (Cumulative Layout Shift) | 0 | <0.1 | ✅ Excellent |
| INP (Interaction to Next Paint) | 8ms | <200ms | ✅ Excellent |
| Navigation inter-pages | 27ms - 1473ms | <300ms | 🔴 Variable |

**Verdict global** : Les Core Web Vitals sont bons, mais la **navigation entre pages est lente et inconsistante**.

---

## 📈 Mesures de Navigation (Baseline)

### Temps mesurés

| # | Navigation | Temps | Verdict |
|---|------------|-------|---------|
| 1 | Navigation simple (cached) | 28ms | ✅ |
| 2 | Navigation standard | 390ms | 🟠 |
| 3 | Navigation standard | 377ms | 🟠 |
| 4 | Navigation simple (cached) | 27ms | ✅ |
| 5 | Navigation standard | 236ms | 🟢 |
| 6 | Navigation vers Board | **1394ms** | 🔴 |
| 7 | Navigation standard | 132ms | ✅ |
| 8 | Navigation vers Board | **1473ms** | 🔴 |

### Statistiques

- **Minimum** : 27ms
- **Maximum** : 1473ms
- **Médiane** : ~300ms
- **Écart-type** : Très élevé (variabilité problématique)

### Pattern identifié

Les navigations vers les pages **Board** (`/boards/[boardId]`) sont systématiquement les plus lentes (~1.4s).

---

## 🔴 Problèmes Identifiés

### 1. Layout `'use client'` au niveau racine

**Fichier** : `src/app/(main)/layout.tsx`

```typescript
'use client';  // ⚠️ PROBLÈME MAJEUR
```

**Impact** :
- Désactive le Server-Side Rendering pour tout le layout
- Force un re-render complet à chaque navigation
- Tous les providers se réinitialisent

**Estimation** : +200-400ms par navigation

---

### 2. Middleware avec `getUser()` (appel réseau)

**Fichier** : `middleware.ts`

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

**Impact** :
- Appel API Supabase à **chaque navigation**
- Bloque la navigation pendant la vérification

**Estimation** : +150-300ms par navigation

---

### 3. Double vérification Auth

Le middleware ET l'AuthContext font tous deux `getUser()` :

```
Navigation
    ↓
Middleware: await getUser() ───► Supabase API (~200ms)
    ↓
AuthContext: await getUser() ───► Supabase API (~200ms) ⚠️ DOUBLON
```

**Estimation** : +200ms (appel redondant)

---

### 4. Pages avec `force-dynamic`

**Fichiers concernés** :
- `src/app/(main)/boards/page.tsx`
- `src/app/(main)/favorites/page.tsx`
- `src/app/(main)/home/page.tsx`
- `src/app/(main)/search/page.tsx`

```typescript
export const dynamic = 'force-dynamic';
```

**Impact** :
- Désactive le **prefetch** automatique de Next.js
- Force un Server-Side Rendering complet à chaque visite
- Empêche la mise en cache

**Log confirmant** : `navigateDynamicallyWithNoPrefetch`

---

### 5. Modals toujours montés dans le DOM

**Fichier** : `src/features/boards/components/CanvasModals.tsx`

Les modals (ImageUploadModal, VideoModal, etc.) sont rendus même quand fermés :

```typescript
<CanvasModals>
  <ImageUploadModal />  // ← Rendu même si isOpen=false
  <UnsplashImagePicker />
  ...
</CanvasModals>
```

**Impact** : Re-renders inutiles à chaque changement d'état du Board

---

### 6. Handlers de clic lents

**Logs observés** :
```
[Violation] 'mousedown' handler took 186ms
[Violation] 'mouseup' handler took 213ms
```

**Impact** : Délai perceptible avant le début de la navigation

---

## 🛠️ Plan d'Action Recommandé

### Phase 1 : Quick Wins (30 min) - Gain estimé : -300ms

#### 1.1 Optimiser le Middleware

Remplacer `getUser()` par `getSession()` :

```typescript
// AVANT (appel réseau obligatoire)
const { data: { user } } = await supabase.auth.getUser();

// APRÈS (lecture JWT locale, appel réseau seulement si refresh nécessaire)
const { data: { session } } = await supabase.auth.getSession();
const user = session?.user ?? null;
```

#### 1.2 Skip auth pour routes publiques

Éviter l'initialisation Supabase si non nécessaire :

```typescript
// Routes publiques sans auth check
const publicRoutes = ["/", "/pricing"];
if (publicRoutes.includes(pathname)) {
  return response; // Skip Supabase entièrement
}
```

---

### Phase 2 : Lazy Loading Modals (1h) - Gain estimé : -100ms

#### 2.1 Conditionner le rendu des modals

```typescript
// AVANT
<ImageUploadModal isOpen={isOpen} ... />

// APRÈS
{isOpen && <ImageUploadModal ... />}
```

#### 2.2 Utiliser React.lazy pour les modals lourds

```typescript
const ImageUploadModal = React.lazy(() => 
  import('./ImageUploadModal')
);
```

---

### Phase 3 : Architecture Layout (2h) - Gain estimé : -200ms

#### 3.1 Séparer Server/Client dans le layout

```
layout.tsx (Server Component)
  └── MainHeader (Server avec parties Client)
  └── Providers.tsx (Client - wrapper unique)
       └── children
```

#### 3.2 Éviter le double appel getUser

Passer l'info user du middleware à l'AuthContext via cookie ou header.

---

### Phase 4 : Supprimer force-dynamic (1h) - Gain estimé : Prefetch activé

Implémenter le pattern "Static Shell + Dynamic Data" :

```typescript
// Page statique
export default function BoardsPage() {
  return (
    <Suspense fallback={<BoardsSkeleton />}>
      <BoardsContent />
    </Suspense>
  );
}

// Données dynamiques dans un composant séparé
async function BoardsContent() {
  const boards = await getBoards();
  return <BoardsGrid boards={boards} />;
}
```

---

## 📁 Fichiers à Modifier

| Fichier | Action | Priorité |
|---------|--------|----------|
| `middleware.ts` | Remplacer getUser par getSession | 🔴 P1 |
| `src/app/(main)/layout.tsx` | Séparer Server/Client | 🟠 P2 |
| `src/features/auth/context/AuthContext.tsx` | Éviter double getUser | 🟠 P2 |
| `src/features/boards/components/CanvasModals.tsx` | Lazy load modals | 🟠 P2 |
| `src/app/(main)/boards/page.tsx` | Supprimer force-dynamic | 🟡 P3 |
| `src/app/(main)/home/page.tsx` | Supprimer force-dynamic | 🟡 P3 |
| `src/app/(main)/search/page.tsx` | Supprimer force-dynamic | 🟡 P3 |
| `src/app/(main)/favorites/page.tsx` | Supprimer force-dynamic | 🟡 P3 |

---

## 📋 Checklist de Validation Post-Optimisation

### Mesures à refaire après chaque phase

- [ ] Navigation Home → Boards : objectif <200ms
- [ ] Navigation Boards → Board individuel : objectif <400ms
- [ ] Navigation Board → Journey : objectif <100ms
- [ ] Navigation Search → Textile detail : objectif <200ms

### Outils de mesure

```javascript
// Script de mesure à utiliser dans la console
const originalPushState = history.pushState;
history.pushState = function() {
  console.time('🚀 Navigation');
  originalPushState.apply(this, arguments);
};

new MutationObserver((mutations, obs) => {
  console.timeEnd('🚀 Navigation');
}).observe(document.body, { childList: true, subtree: true });

console.log('✅ Monitoring activé');
```

---

## 🎯 Objectifs de Performance

| Métrique | Actuel | Objectif | Amélioration |
|----------|--------|----------|--------------|
| Navigation standard | ~300ms | <200ms | -33% |
| Navigation Board | ~1400ms | <500ms | -64% |
| Handlers mousedown | ~190ms | <50ms | -74% |

---

## 📝 Notes pour la Prochaine Session

### Tests à effectuer

1. Mesurer spécifiquement Home → Search
2. Mesurer Search → Textile detail
3. Mesurer Board → Journey (toggle vue)
4. Profiler le BoardCanvas avec React DevTools

### Questions à investiguer

1. Pourquoi les handlers de clic sont-ils si lents (~190ms) ?
2. Le BoardContext fait-il des appels API au mount ?
3. Y a-t-il des useEffect qui se déclenchent en cascade ?

---

## 📚 Ressources

- [Next.js App Router Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Supabase Auth Best Practices](https://supabase.com/docs/guides/auth/server-side)
- [React Profiler](https://react.dev/reference/react/Profiler)

---

**Prochaine étape** : Implémenter Phase 1 (middleware optimisé) et remesurer.
