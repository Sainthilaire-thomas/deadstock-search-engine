# ADR 005 : Light DDD Architecture

**Date** : 28 décembre 2024  
**Statut** : ✅ Accepté  
**Décideurs** : Thomas  
**Tags** : `architecture`, `ddd`, `structure`, `scalability`

---

## Contexte

Lors du développement de Phase 1 Tuning MVP, une incohérence architecturale est apparue :
- `app/` à la racine (Next.js)
- `src/features/` avec tuning et normalization
- Scripts appelant directement Supabase sans use cases

**Problèmes identifiés** :
1. Mélange de patterns (scripts procéduraux + features DDD)
2. Duplication de logique entre CLI et future interface web
3. Pas de séparation claire Domain/Application/Infrastructure
4. Dette technique pour scaling futur (cron jobs, queues)

**Question posée** : Quelle architecture adopter pour le long terme ?

---

## Décision

**Adopter une architecture Light DDD** avec structure features cohérente.

**Principe** : Hybrid Domain-Driven Design adapté pour solo dev
- ✅ Séparation Domain / Application / Infrastructure
- ✅ Use Cases réutilisables (CLI, Web UI, Cron, Queues)
- ✅ Entities avec business rules
- ✅ Repositories pour abstraction DB
- ❌ Pas d'Aggregates complexes (overkill MVP)
- ❌ Pas de Bounded Contexts stricts (1 seul projet)

---

## Structure Adoptée

```
src/
├── features/                    # Business features
│   ├── tuning/
│   │   ├── domain/              # Entities, Value Objects, Rules
│   │   │   ├── DictionaryMapping.ts
│   │   │   └── UnknownTerm.ts
│   │   ├── application/         # Use Cases (orchestration)
│   │   │   ├── approveMapping.ts
│   │   │   ├── getUnknowns.ts
│   │   │   └── rejectUnknown.ts
│   │   └── infrastructure/      # DB, External APIs
│   │       ├── dictionaryRepo.ts
│   │       └── unknownsRepo.ts
│   │
│   ├── normalization/
│   │   ├── domain/
│   │   │   └── ValueObjects.ts  # MaterialType, Color, Pattern
│   │   ├── application/
│   │   │   └── normalizeTextile.ts
│   │   └── infrastructure/
│   │       └── normalizationService.ts
│   │
│   └── scraping/
│       ├── domain/
│       │   └── Textile.ts
│       ├── application/
│       │   └── scrapeAndSaveTextiles.ts
│       └── infrastructure/
│           ├── textileRepo.ts
│           └── adapters/
│               └── MyLittleCouponAdapter.ts
│
├── app/                         # Next.js UI (Server/Client Components)
│   └── admin/tuning/
│       ├── page.tsx             # Server Component
│       ├── actions.ts           # Server Actions → Use Cases
│       └── components/
│
└── shared/                      # Code partagé
    └── infrastructure/
        └── supabase/
```

---

## Rationale

### Pourquoi Light DDD plutôt que Simple Layered ?

**Avantages Long-Terme** :
1. **Réutilisabilité** : Use cases appelés par CLI, Web, Cron, Queues
2. **Testabilité** : Business logic isolée dans Domain
3. **Maintenabilité** : Séparation claire des responsabilités
4. **Évolutivité** : Facile d'ajouter features (TFS scraper, analytics, etc.)

**Exemple Concret** :
```typescript
// Use Case unique, utilisé partout
scrapeAndSaveTextiles()
  ↑
  ├─ CLI Script (npx tsx scripts/...)
  ├─ Web Button (/admin/scraping)
  ├─ Vercel Cron (tous les jours 9h)
  └─ Queue Worker (BullMQ + Redis)
```

### Pourquoi "Light" et pas DDD Complet ?

**Compromis Solo Dev** :
- ❌ Pas d'Aggregates (complexité > bénéfice pour MVP)
- ❌ Pas de Domain Events (pas de microservices)
- ❌ Pas de Bounded Contexts stricts (1 monolithe)
- ✅ Garde l'essentiel : Entities, Use Cases, Repositories

**Overhead Réduit** :
- Temps implémentation : +20% vs procédural
- Bénéfice maintenabilité : +200%
- Courbe apprentissage : Acceptable

---

## Conséquences

### Positives ✅

1. **Code Base Propre**
   - Business logic centralisée dans Domain
   - Use cases clairs et testables
   - Infrastructure interchangeable

2. **Scaling Path**
   - Ajout features : Créer nouveau dossier `features/X`
   - Ajout sources scraping : Nouveau adapter
   - Migration DB : Changer repos, use cases inchangés

3. **Collaboration Future**
   - Onboarding dev : Structure claire
   - Documentation : Chaque layer a un rôle défini
   - Code review : Violations architecture visibles

4. **Patterns Réutilisables**
   - Adapter Pattern (scrapers sources multiples)
   - Repository Pattern (abstraction DB)
   - Use Case Pattern (orchestration)

### Négatives ❌

1. **Overhead Initial**
   - +20% temps développement MVP
   - Courbe apprentissage DDD concepts

2. **Over-Engineering Risk**
   - Peut être trop pour certaines features simples
   - Nécessite discipline pour pas sur-architecturer

3. **Boilerplate**
   - Plus de fichiers (Entities, Repos, Use Cases)
   - Mappers DB ↔ Domain

### Mitigations

**Overhead** : Accepté car investissement long-terme  
**Over-Engineering** : Guideline "use cases seulement si réutilisés"  
**Boilerplate** : Templates/snippets VS Code

---

## Implémentation

### Migration Réalisée

**Phase 1 - Structure** :
```powershell
# Déplacer app/ dans src/
Move-Item app src/app

# Créer structure features
New-Item src/features/scraping/domain -ItemType Directory
New-Item src/features/scraping/application -ItemType Directory
New-Item src/features/scraping/infrastructure -ItemType Directory
```

**Phase 2 - Domain Entities** :
- `Textile` (business rules validation)
- `DictionaryMapping` (confidence 0-1, term non vide)
- `UnknownTerm` (workflow approval/reject)

**Phase 3 - Use Cases** :
- `scrapeAndSaveTextiles()` orchestration scraping
- `approveMapping()` validation humaine
- `normalizeTextile()` normalisation FR→EN

**Phase 4 - Repositories** :
- `textileRepo` (save, findBySourceUrl)
- `dictionaryRepo` (getByCategory, save)
- `unknownsRepo` (findAll, logOrIncrement)

**Phase 5 - Adapters** :
- `MyLittleCouponAdapter` (fetch, transform)

---

## Exemples

### Use Case Pattern

**Avant (Procédural)** :
```typescript
// Script appelle DB directement
const { data } = await supabase.from('textiles').insert(textile);
```

**Après (Light DDD)** :
```typescript
// Script appelle Use Case
const result = await scrapeAndSaveTextiles(10);

// Use Case orchestration
export async function scrapeAndSaveTextiles(limit) {
  const products = await adapter.fetchProducts(limit);
  
  for (const product of products) {
    const normalized = await normalizeTextile(product);
    const textile = new Textile(...); // Business rules
    await textileRepo.save(textile);  // Infrastructure
  }
}
```

### Repository Pattern

**Mapping DB ↔ Domain** :
```typescript
// Repository masque détails Supabase
export const textileRepo = {
  async save(textile: Textile) {
    const row = this.toDatabase(textile);
    await supabase.from('textiles').upsert(row);
  },
  
  toDatabase(textile: Textile) {
    return { name: textile.name, ... };
  },
  
  toDomain(row: any): Textile {
    return new Textile(row.id, row.name, ...);
  }
};
```

---

## Métriques Succès

### Court Terme (Phase 1)
- ✅ Architecture cohérente (app + features dans src/)
- ✅ Use cases réutilisés (CLI + Web UI)
- ✅ Zero duplication logique scraping

### Moyen Terme (Phase 2-3)
- 🎯 Ajout TFS scraper : <2h (nouveau adapter only)
- 🎯 Vercel Cron setup : <30min (use case exists)
- 🎯 Tests unitaires : >80% coverage Domain

### Long Terme (Phase 4+)
- 🎯 Onboarding nouveau dev : <1 jour
- 🎯 Migration PostgreSQL → autre DB : <1 semaine
- 🎯 Features additionnelles : architecture claire

---

## Alternatives Considérées

### Option A : Simple Layered (Rejetée)

```
src/
├── controllers/
├── services/
└── repositories/
```

**Rejet** : Pas assez de séparation business logic / infrastructure

---

### Option B : DDD Complet (Rejetée)

```
src/
├── domain/
│   ├── textiles/
│   │   ├── aggregates/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   └── domain-events/
```

**Rejet** : Over-engineering pour solo dev MVP

---

### Option C : Feature-Based Simple (Rejetée)

```
features/tuning/
├── tuning.service.ts
├── tuning.controller.ts
└── tuning.repo.ts
```

**Rejet** : Pas de séparation Domain/Application claire

---

## Révision Future

### Triggers Révision

1. **Équipe grandit** (>2 devs)
   → Évaluer DDD complet avec Bounded Contexts

2. **Microservices envisagés**
   → Ajouter Domain Events, CQRS

3. **Complexité business explose**
   → Ajouter Aggregates, Specifications

### Critères Validation

- Architecture supporte features multiples ? ✅
- Code réutilisé entre CLI/Web/Cron ? ✅
- Onboarding <1 jour ? ✅
- Ajout feature <1 semaine ? ✅

---

## Références

- **DDD Patterns** : Eric Evans "Domain-Driven Design"
- **Light DDD** : Vladimir Khorikov "Domain-Driven Design in Practice"
- **Next.js + DDD** : Khalil Stemmler blog
- **Layered Architecture** : Martin Fowler "Patterns of Enterprise Application Architecture"

---

## Historique

- **2024-12-28** : Décision initiale, migration complète
- **Status** : ✅ Accepté et implémenté
