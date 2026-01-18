# SPRINT UI-1 & I18N-1 - Preview Images & Internationalisation

**Version** : 1.2  
**Date** : 18 Janvier 2026  
**Contexte** : Post-MVP Phase 1, préparation scale international  
**Statut** : UI-1 ✅ COMPLÉTÉ | I18N-1 ✅ COMPLÉTÉ

---

## RÉSUMÉ EXÉCUTIF

| Sprint | Status | Durée réelle | Notes |
|--------|--------|--------------|-------|
| **UI-1: Preview Images** | ✅ Complété | ~2h | Auto-extraction fonctionnelle |
| **I18N-1: Internationalisation** | ✅ Complété | ~1h30 | Infrastructure + 2 pages migrées |
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

**Critères de validation** :
- [x] Migration exécutée sans erreur
- [x] Colonne `cover_image_url` visible dans Supabase
- [x] Types TypeScript mis à jour
- [x] Types Supabase régénérés

---

### UI-1.2 : Auto-extraction Preview ✅

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

**Critères de validation** :
- [x] Page `/boards` affiche les previews
- [x] Boards avec images montrent la première image
- [x] Boards vides montrent l'icône placeholder
- [x] Compteurs éléments/zones visibles
- [x] Hover effect fonctionnel

---

### UI-1.4 : Menu "Définir couverture" 📋 (Reporté)

**Statut** : Non implémenté - fonctionnalité future

---

## SPRINT I18N-1 : Internationalisation ✅ COMPLÉTÉ

**Objectif** : Mettre en place l'infrastructure i18n avec next-intl et migrer les premières pages

---

### I18N-1.1 : Installation et Configuration ✅

**Package installé** :
```bash
npm install next-intl
```

**Fichiers créés** :

| Fichier | Description | Status |
|---------|-------------|--------|
| `src/i18n/config.ts` | Configuration locales (fr, en) | ✅ |
| `src/i18n/request.ts` | next-intl server config | ✅ |
| `src/i18n/index.ts` | Exports centralisés | ✅ |
| `src/i18n/messages/fr.json` | Traductions FR (~80 clés) | ✅ |
| `src/i18n/messages/en.json` | Traductions EN (~80 clés) | ✅ |

**Fichiers modifiés** :

| Fichier | Modification | Status |
|---------|--------------|--------|
| `next.config.ts` | Ajout plugin `createNextIntlPlugin` | ✅ |
| `middleware.ts` | Ajout détection locale + cookie `NEXT_LOCALE` | ✅ |
| `src/app/layout.tsx` | Ajout `NextIntlClientProvider` | ✅ |

---

### I18N-1.2 : Composant LocaleSwitcher ✅

**Fichier** : `src/components/i18n/LocaleSwitcher.tsx`

**Fonctionnalités** :
- Affichage des drapeaux 🇫🇷 🇬🇧
- Changement de locale via cookie
- Reload automatique pour appliquer la nouvelle langue
- État visuel (locale active en surbrillance)

---

### I18N-1.3 : Migration MainHeader ✅

**Fichier** : `src/features/navigation/components/MainHeader.tsx`

**Textes migrés** :
- "Recherche" → `t('nav.search')`
- "Mes Projets" → `t('header.myProjects')`
- "Retour à {name}" → `t('header.returnTo', { name })`

---

### I18N-1.4 : Migration Page Boards ✅

**Fichier** : `src/app/(main)/boards/page.tsx`

**Textes migrés** :
| Français | English | Clé i18n |
|----------|---------|----------|
| Mes Projets | My Projects | `project.myProjects` |
| Nouveau projet | New project | `project.newProject` |
| Aucun projet | No projects | `project.noProjects` |
| Créez votre premier projet... | Create your first project... | `project.createFirst` |
| Projets (N) | Projects (N) | `project.plural` |
| X éléments | X elements | Dynamique |
| X zones | X zones | Dynamique |
| Modifié le... | Modified... | Dynamique |
| Archivés | Archived | Dynamique |

---

### I18N-1.5 : Critères de Validation ✅

- [x] `npm install next-intl` sans erreur
- [x] Structure `src/i18n/` créée
- [x] `next.config.ts` configuré avec plugin
- [x] `middleware.ts` gère la détection de locale
- [x] `NextIntlClientProvider` dans layout racine
- [x] `LocaleSwitcher` visible dans le header
- [x] Clic sur 🇬🇧 change la langue en anglais
- [x] Clic sur 🇫🇷 revient en français
- [x] Page `/boards` entièrement traduite
- [x] Dates formatées selon la locale (fr-FR / en-GB)

---

## BONUS : Fix Navigation Header ✅

**Comportement final** :
- **Sur un board** : "Mes Projets" visible dans le header → retour à la liste
- **Sur /search ou /favorites** : "Retour à [Board]" + "Mes Projets" visibles
- **Sur /boards** : Seulement "Chercher des tissus" (on y est déjà)

---

## Fichiers Modifiés (Session Complète)

```
# UI-1 (session précédente)
database/migrations/
└── 032_add_board_cover_image.sql        ✅

src/features/boards/
├── domain/types.ts                       ✅ (Board, BoardWithPreview, BoardRow)
├── infrastructure/boardsRepository.ts    ✅ (+listBoardsWithPreview, +extractPreviewUrl)
└── actions/boardActions.ts               ✅ (+listBoardsWithPreviewAction)

# I18N-1 (cette session)
src/i18n/
├── config.ts                             ✅ Créé
├── request.ts                            ✅ Créé
├── index.ts                              ✅ Créé
└── messages/
    ├── fr.json                           ✅ Créé (~80 clés)
    └── en.json                           ✅ Créé (~80 clés)

src/components/i18n/
└── LocaleSwitcher.tsx                    ✅ Créé

src/app/layout.tsx                        ✅ Modifié (NextIntlClientProvider)
src/app/(main)/boards/page.tsx            ✅ Modifié (getTranslations)

src/features/navigation/components/
└── MainHeader.tsx                        ✅ Modifié (useTranslations + LocaleSwitcher)

middleware.ts                             ✅ Modifié (détection locale)
next.config.ts                            ✅ Modifié (createNextIntlPlugin)
```

---

## Commit Suggéré

```bash
git add .
git commit -m "feat(i18n): add internationalization infrastructure with next-intl

- Install next-intl package
- Create src/i18n/ structure (config, request, messages)
- Add French and English translations (~80 keys each)
- Configure next.config.ts with next-intl plugin
- Update middleware.ts for locale detection and cookie storage
- Add NextIntlClientProvider to root layout
- Create LocaleSwitcher component with flag buttons
- Migrate MainHeader to use useTranslations
- Migrate /boards page to use getTranslations (Server Component)
- Support dynamic date formatting per locale (fr-FR / en-GB)

Locales supported: fr (default), en
Locale persistence: NEXT_LOCALE cookie (1 year)"
```

---

## Prochaines Étapes

### Priorité 1 : Migration pages restantes (2-3h)
- [ ] `/search` - Page recherche
- [ ] `/favorites` - Page favoris  
- [ ] `SharedBoardHeader.tsx` - Header board/journey
- [ ] `BoardToolbar.tsx` - Barre d'outils
- [ ] Filtres de recherche

### Priorité 2 : Sprint UI-1.4 (45min)
- [ ] Menu contextuel "Définir comme couverture"
- [ ] Option "Retirer la couverture"

### Priorité 3 : Sprints B4-B6 (SPRINT_PLAN.md)
- [ ] B4: Potentiel Discovery
- [ ] B5: Scraping guidé
- [ ] B6: Fusion contraintes

---

## Références

- [ADR-009](../docs/decisions/ADR_009_internationalization_strategy.md) - Stratégie i18n
- [SPRINT_PLAN.md](./SPRINT_PLAN.md) - Plan sprints B1-B6, A1-A6
- [next-intl docs](https://next-intl-docs.vercel.app/) - Documentation officielle
