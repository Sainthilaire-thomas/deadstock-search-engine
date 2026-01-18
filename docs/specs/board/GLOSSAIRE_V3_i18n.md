# Glossaire Deadstock Search Engine - V3 i18n Ready

**Version:** 3.0  
**Date:** 18/01/2026  
**Statut:** Draft  
**Compatibilité:** next-intl, ADR-009

---

## Vue d'ensemble

Ce glossaire définit les concepts fondamentaux avec leurs traductions i18n.
Il sert de **source unique de vérité** pour :
- La documentation technique
- Les fichiers de traduction next-intl
- La cohérence UI cross-langues

---

## Structure des fichiers i18n (Compatible DDD Hybride)

L'i18n est une **infrastructure transversale** (cross-cutting concern), pas une feature métier.
Elle se place donc dans `src/i18n/` au même niveau que `src/lib/` et `src/features/`.

```
src/
├── i18n/                      # Infrastructure i18n (transversale)
│   ├── config.ts              # Configuration next-intl
│   ├── request.ts             # Locale detection (getRequestConfig)
│   ├── navigation.ts          # Typed navigation avec locale
│   └── messages/
│       ├── fr.json            # Traductions françaises
│       ├── en.json            # Traductions anglaises
│       └── es.json            # Traductions espagnoles (future)
│
├── lib/                       # Utilitaires partagés existants
│   ├── color/                 # Module couleur (B1)
│   ├── supabase/              # Client Supabase
│   └── utils.ts
│
├── features/                  # Feature modules DDD
│   ├── boards/
│   ├── search/
│   ├── favorites/
│   └── ...
│
└── middleware.ts              # Middleware i18n (locale routing)
```

### Justification architecturale

| Concern | Emplacement | Raison |
|---------|-------------|--------|
| i18n config | `src/i18n/` | Infrastructure transversale, convention next-intl |
| Color utils | `src/lib/color/` | Utilitaire partagé multi-features |
| Board logic | `src/features/boards/` | Feature métier avec domain propre |

L'i18n n'est PAS dans `src/features/` car :
- Ce n'est pas une feature métier (pas de domain, pas d'entités)
- Elle est consommée par TOUTES les features
- Elle suit les conventions du framework (next-intl)

---

## Concepts Fondamentaux

### 1. Project (Board)

**Clé technique:** `project` (anciennement `board`)

| Locale | Terme | Pluriel |
|--------|-------|---------|
| 🇫🇷 FR | Projet | Projets |
| 🇬🇧 EN | Project | Projects |
| 🇪🇸 ES | Proyecto | Proyectos |

**Définition:** Espace de travail visuel représentant un projet global (collection, client, thème).

**JSON i18n:**
```json
{
  "project": {
    "singular": "Projet",
    "plural": "Projets",
    "myProjects": "Mes Projets",
    "newProject": "Nouveau projet",
    "createProject": "Créer un projet",
    "deleteProject": "Supprimer le projet",
    "projectName": "Nom du projet",
    "emptyState": "Aucun projet",
    "emptyStateDescription": "Créez votre premier projet pour organiser vos idées"
  }
}
```

**Usage UI:**
- Navigation: "Mes Projets"
- Bouton: "+ Nouveau projet"
- Modal: "Créer un projet"
- Liste: "PROJETS ACTIFS (3)"

---

### 2. Zone

**Clé technique:** `zone`

| Locale | Terme | Pluriel |
|--------|-------|---------|
| 🇫🇷 FR | Zone | Zones |
| 🇬🇧 EN | Zone | Zones |
| 🇪🇸 ES | Zona | Zonas |

**Définition:** Regroupement spatial d'éléments représentant un futur projet d'achat.

**JSON i18n:**
```json
{
  "zone": {
    "singular": "Zone",
    "plural": "Zones",
    "createZone": "Créer une zone",
    "zoneName": "Nom de la zone",
    "crystallize": "Cristalliser",
    "crystallized": "Cristallisée",
    "active": "Active",
    "viewOrder": "Voir la commande"
  }
}
```

---

### 3. Order (Projet d'Achat)

**Clé technique:** `order` (anciennement `purchaseProject`)

| Locale | Terme | Pluriel |
|--------|-------|---------|
| 🇫🇷 FR | Commande | Commandes |
| 🇬🇧 EN | Order | Orders |
| 🇪🇸 ES | Pedido | Pedidos |

**Définition:** Zone cristallisée contenant tout le nécessaire pour passer commande.

**JSON i18n:**
```json
{
  "order": {
    "singular": "Commande",
    "plural": "Commandes",
    "prepareOrder": "Préparer la commande",
    "viewOrder": "Voir la commande",
    "orderReady": "Prête à commander",
    "orderDraft": "Brouillon",
    "orderPlaced": "Commandée",
    "orderComplete": "Terminée"
  }
}
```

---

### 4. Canvas / Journey Views

**Clés techniques:** `canvas`, `journey`

| Concept | FR | EN | ES |
|---------|----|----|-----|
| Canvas view | Canvas | Canvas | Lienzo |
| Journey view | Parcours | Journey | Recorrido |

**JSON i18n:**
```json
{
  "views": {
    "canvas": "Canvas",
    "journey": "Parcours",
    "switchToCanvas": "Vue Canvas",
    "switchToJourney": "Vue Parcours"
  }
}
```

**Note:** "Canvas" reste en anglais dans toutes les langues (terme technique universellement compris).

---

### 5. Element

**Clé technique:** `element`

| Locale | Terme | Pluriel |
|--------|-------|---------|
| 🇫🇷 FR | Élément | Éléments |
| 🇬🇧 EN | Element | Elements |
| 🇪🇸 ES | Elemento | Elementos |

**Types d'éléments:**

| Type technique | FR | EN | ES |
|----------------|----|----|-----|
| `textile` | Tissu | Textile | Tejido |
| `palette` | Palette | Palette | Paleta |
| `inspiration` | Inspiration | Inspiration | Inspiración |
| `calculation` | Calcul | Calculation | Cálculo |
| `note` | Note | Note | Nota |
| `video` | Vidéo | Video | Vídeo |
| `link` | Lien | Link | Enlace |
| `pdf` | Document PDF | PDF Document | Documento PDF |
| `pattern` | Patron | Pattern | Patrón |
| `silhouette` | Silhouette | Silhouette | Silueta |

**JSON i18n:**
```json
{
  "elements": {
    "singular": "Élément",
    "plural": "Éléments",
    "types": {
      "textile": "Tissu",
      "palette": "Palette",
      "inspiration": "Inspiration",
      "calculation": "Calcul",
      "note": "Note",
      "video": "Vidéo",
      "link": "Lien",
      "pdf": "Document PDF",
      "pattern": "Patron",
      "silhouette": "Silhouette"
    },
    "addElement": "Ajouter un élément",
    "deleteElement": "Supprimer",
    "duplicateElement": "Dupliquer",
    "deepen": "Approfondir"
  }
}
```

---

### 6. Search

**Clé technique:** `search`

| Locale | Terme |
|--------|-------|
| 🇫🇷 FR | Recherche |
| 🇬🇧 EN | Search |
| 🇪🇸 ES | Búsqueda |

**JSON i18n:**
```json
{
  "search": {
    "title": "Recherche",
    "placeholder": "Chercher des tissus...",
    "contextualSearch": "Recherche contextuelle",
    "findTextiles": "Trouver des tissus",
    "findSimilar": "Trouver des similaires",
    "noResults": "Aucun résultat",
    "resultsCount": "{count} tissu trouvé | {count} tissus trouvés",
    "filters": {
      "title": "Filtres",
      "material": "Matière",
      "color": "Couleur",
      "price": "Prix",
      "width": "Largeur",
      "pattern": "Motif",
      "weave": "Tissage",
      "source": "Source",
      "clearAll": "Effacer les filtres"
    }
  }
}
```

---

### 7. Favorites

**Clé technique:** `favorites`

| Locale | Terme | Pluriel |
|--------|-------|---------|
| 🇫🇷 FR | Favori | Favoris |
| 🇬🇧 EN | Favorite | Favorites |
| 🇪🇸 ES | Favorito | Favoritos |

**JSON i18n:**
```json
{
  "favorites": {
    "singular": "Favori",
    "plural": "Favoris",
    "myFavorites": "Mes Favoris",
    "addToFavorites": "Ajouter aux favoris",
    "removeFromFavorites": "Retirer des favoris",
    "emptyState": "Aucun favori",
    "emptyStateDescription": "Ajoutez des tissus à vos favoris pour les retrouver facilement"
  }
}
```

---

### 8. Textile (Tissu)

**Clé technique:** `textile`

| Locale | Terme | Pluriel |
|--------|-------|---------|
| 🇫🇷 FR | Tissu | Tissus |
| 🇬🇧 EN | Textile / Fabric | Textiles / Fabrics |
| 🇪🇸 ES | Tejido / Tela | Tejidos / Telas |

**JSON i18n:**
```json
{
  "textile": {
    "singular": "Tissu",
    "plural": "Tissus",
    "details": "Détails du tissu",
    "addToBoard": "Ajouter au projet",
    "viewSource": "Voir sur le site source",
    "attributes": {
      "material": "Matière",
      "color": "Couleur",
      "width": "Largeur",
      "pattern": "Motif",
      "weave": "Tissage",
      "price": "Prix",
      "pricePerMeter": "Prix au mètre",
      "available": "Disponible",
      "quantity": "Quantité"
    },
    "saleTypes": {
      "cutToOrder": "Coupe à la demande",
      "fixedLength": "Coupon",
      "hybrid": "Coupon ou coupe",
      "byPiece": "À la pièce"
    },
    "stock": {
      "sufficient": "Stock suffisant",
      "insufficient": "Stock insuffisant",
      "available": "{meters}m disponibles"
    }
  }
}
```

---

## Navigation Principale

**JSON i18n complet pour la navigation:**

```json
{
  "nav": {
    "search": "Recherche",
    "favorites": "Favoris",
    "projects": "Projets",
    "admin": "Administration"
  },
  "header": {
    "searchPlaceholder": "Chercher des tissus",
    "notifications": "Notifications",
    "settings": "Paramètres",
    "profile": "Profil"
  }
}
```

---

## Actions Communes

```json
{
  "actions": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "create": "Créer",
    "add": "Ajouter",
    "remove": "Retirer",
    "duplicate": "Dupliquer",
    "close": "Fermer",
    "confirm": "Confirmer",
    "back": "Retour",
    "next": "Suivant",
    "previous": "Précédent",
    "loading": "Chargement...",
    "search": "Rechercher",
    "filter": "Filtrer",
    "sort": "Trier",
    "reset": "Réinitialiser",
    "export": "Exporter",
    "import": "Importer",
    "share": "Partager"
  }
}
```

---

## États et Statuts

```json
{
  "states": {
    "active": "Actif",
    "inactive": "Inactif",
    "draft": "Brouillon",
    "ready": "Prêt",
    "inProgress": "En cours",
    "complete": "Terminé",
    "error": "Erreur",
    "loading": "Chargement",
    "empty": "Vide"
  }
}
```

---

## Messages d'erreur

```json
{
  "errors": {
    "generic": "Une erreur est survenue",
    "notFound": "Page non trouvée",
    "unauthorized": "Accès non autorisé",
    "networkError": "Erreur de connexion",
    "validationError": "Données invalides",
    "saveFailed": "Échec de l'enregistrement",
    "loadFailed": "Échec du chargement"
  }
}
```

---

## Architecture Conceptuelle (mise à jour)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        PROJET (Project)                         │
│              (Espace de travail global)                         │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Zones (futurs Commandes)                               │   │
│   │  ├── Zone "Veste" : patron, calcul, tissus, palette     │   │
│   │  ├── Zone "Manteau" : patron, calcul, tissus            │   │
│   │  └── Zone "Chemise" : patron, calcul, tissus            │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   + Éléments libres : inspirations, notes, liens...             │
│                                                                 │
│   Vues :                                                        │
│   ├── Canvas : organisation spatiale libre                      │
│   └── Parcours : navigation par type/phase                      │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
   Cristallisation                    Approfondir
          │                                 │
          ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│    COMMANDE     │               │    PARCOURS     │
│    (Order)      │               │   (Journey)     │
│                 │               │                 │
│ Patron validé   │               │ Patron avancé   │
│ Calcul validé   │               │ Calcul détaillé │
│ Tissus choisis  │               │ Comparateur     │
└─────────────────┘               └─────────────────┘
```

---

## Mapping Technique ↔ Utilisateur

| Clé technique | UI Français | UI English | Usage |
|---------------|-------------|------------|-------|
| `board` → `project` | Projet | Project | Navigation, titres |
| `purchaseProject` → `order` | Commande | Order | Zones cristallisées |
| `journey` | Parcours | Journey | Vue alternative |
| `canvas` | Canvas | Canvas | Vue principale |
| `element` | Élément | Element | Items sur projet |
| `zone` | Zone | Zone | Regroupements |
| `textile` | Tissu | Textile/Fabric | Produits |
| `favorites` | Favoris | Favorites | Bibliothèque |
| `search` | Recherche | Search | Exploration |
| `contextualSearch` | Recherche contextuelle | Contextual Search | Depuis projet |

---

## Implémentation next-intl

### 1. Configuration

```typescript
// src/i18n/config.ts
export const locales = ['fr', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español'
};
```

### 2. Usage dans les composants

```typescript
// Avec next-intl
import { useTranslations } from 'next-intl';

function ProjectList() {
  const t = useTranslations('project');
  
  return (
    <div>
      <h1>{t('myProjects')}</h1>
      <button>{t('newProject')}</button>
    </div>
  );
}
```

### 3. Fichier de traduction complet (FR)

Voir fichier séparé : `src/i18n/messages/fr.json`

---

## Migration depuis V2

### Changements terminologiques

| Avant (V2) | Après (V3) | Raison |
|------------|------------|--------|
| "Mes Boards" | "Mes Projets" | Plus naturel en FR |
| "Projet d'Achat" | "Commande" | Plus court, plus clair |
| "Board / Journey" toggle | "Canvas / Parcours" | Distinction claire des vues |

### Fichiers à modifier

1. `src/app/(main)/boards/` → Labels UI uniquement (routes restent)
2. `src/features/boards/components/` → Tous les textes hardcodés
3. `src/features/journey/components/` → Labels du toggle

---

## Checklist implémentation

### Phase 0 : Structure (1h)

- [ ] Créer `src/i18n/config.ts`
- [ ] Créer `src/i18n/messages/fr.json` (complet)
- [ ] Créer `src/i18n/messages/en.json` (stub)
- [ ] Configurer next-intl dans `next.config.js`

### Phase 1 : Migration textes (2h)

- [ ] Remplacer "Mes Boards" → `t('project.myProjects')`
- [ ] Remplacer "Nouveau board" → `t('project.newProject')`
- [ ] Remplacer toggle labels
- [ ] Remplacer textes search
- [ ] Remplacer textes favorites

### Phase 2 : Traductions EN (1h)

- [ ] Compléter `en.json`
- [ ] Tester locale switching
- [ ] Valider cohérence

---

## Références

- ADR-009: Internationalization Strategy
- next-intl documentation: https://next-intl-docs.vercel.app/
- GLOSSAIRE_V2.md (référence conceptuelle)

---

**Document maintenu par:** Équipe Produit  
**Dernière mise à jour:** 18/01/2026
