# Glossaire Deadstock Search Engine

**Version:** 2.0

**Date:** 15/01/2026

**Statut:** Validé

---

## Vue d'ensemble

Ce glossaire définit les concepts fondamentaux de l'application Deadstock Search Engine. Il sert de référence pour maintenir une cohérence dans le développement, la documentation et l'interface utilisateur.

---

## Architecture conceptuelle

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         BOARD                                   │
│              (Projet Global - Vue d'ensemble)                   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Zones (futurs Projets d'Achat)                         │   │
│   │  ├── Zone "Veste" : patron, calcul, tissus, palette     │   │
│   │  ├── Zone "Manteau" : patron, calcul, tissus            │   │
│   │  └── Zone "Chemise" : patron, calcul, tissus            │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   + Éléments libres : inspirations, notes, liens...             │
│                                                                 │
│   Opérations Board : création éléments, organisation,           │
│                      recherche contextuelle, modals basiques    │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   "Approfondir"    Cristallisation    Suivi futur
          │                │                │
          ▼                ▼                ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    JOURNEY      │ │ PROJET D'ACHAT  │ │   RÉALISATION   │
│  (Mode Focus)   │ │ (Zone figée)    │ │   (Phase 3+)    │
│                 │ │                 │ │                 │
│ Patron avancé   │ │ Patron validé   │ │ Commande        │
│ Calcul détaillé │ │ Calcul validé   │ │ Livraison       │
│ Comparateur     │ │ Tissus choisis  │ │ Fabrication     │
│ tissus          │ │                 │ │ Impact éco      │
└────────┬────────┘ └─────────────────┘ └─────────────────┘
         │
         │ Élément enrichi
         ▼
   Retour au Board
```

---

## Concepts Fondamentaux

### Board

**Définition :** Espace de travail visuel représentant un **projet global** (collection, client, thème). Le Board offre une vue d'ensemble et permet d'organiser tous les éléments d'un projet pouvant déboucher sur plusieurs projets d'achat.

**Rôle principal :**
- Vue d'ensemble d'un projet créatif complet
- Organisation spatiale des éléments
- Création et gestion des éléments via le menu latéral
- Opérations basiques via modals (import, calcul rapide, recherche contextuelle)
- Cristallisation des zones en projets d'achat

**Caractéristiques :**
- Contient des **Zones** (futurs projets d'achat) et des **Éléments libres**
- Menu latéral avec outils de création (48px, icônes)
- Opérations basiques dans les modals
- Recherche contextuelle basée sur contraintes des éléments sélectionnés

**Ce que le Board NE fait PAS :**
- Fonctions avancées nécessitant un focus (→ Journey)
- Suivi post-achat (→ Réalisation, Phase 3+)

**Exemples d'usage :**

| Utilisateur            | Logique        | Board                              | Zones                              |
|------------------------|----------------|------------------------------------|------------------------------------|
| Créatrice indépendante | Par client     | "Projet Mme Martin"                | Veste, Chemise, Jupe               |
| Marque                 | Par collection | "Collection AH26"                  | Look 1, Look 2, Look 3             |
| Étudiante              | Par projet     | "Projet diplôme"                   | Pièce principale, Accessoires      |

---

### Journey

**Définition :** Mode focus permettant d'**approfondir un élément** du Board avec des fonctions étendues non disponibles dans les modals.

**Rôle principal :**
- Travailler en détail sur un élément spécifique
- Fonctions avancées nécessitant un écran dédié
- Enrichir l'élément qui retourne ensuite au Board

**Exemples de fonctions Journey :**

| Élément Board        | Modal (basique)              | Journey (étendu)                      |
|----------------------|------------------------------|---------------------------------------|
| 📄 Patron            | Upload PDF, aperçu           | Découpe pièces, disposition optimisée |
| 📏 Calcul            | 1 vêtement, résultat rapide  | Multi-vêtements, variations, breakdown|
| 🧵 Tissus            | Recherche rapide, ajout      | Comparateur détaillé, specs techniques|
| 📷 Inspiration       | Import, palette auto         | Palettes multiples, harmonies         |

**Flux typique :**
1. Designer travaille sur le Board (vue globale)
2. Clique "Approfondir" sur un élément
3. Accède au mode Journey (focus étendu)
4. Travaille en détail sur l'élément
5. Retourne au Board avec l'élément enrichi

**Ce que le Journey NE fait PAS :**
- Vue d'ensemble (→ Board)
- Organisation spatiale (→ Board)
- Cristallisation (→ Board)

---

### Zone

**Définition :** Regroupement spatial d'éléments sur un Board représentant un **futur projet d'achat** (ex: une veste, un manteau, une chemise).

**Caractéristiques :**
- Optionnel (le Board peut n'avoir aucune zone)
- Nommé par l'utilisateur
- Délimité visuellement (couleur, bordure)
- **Cristallisable** → devient un Projet d'Achat

**Contenu typique d'une zone :**
- 📄 Patron (ou silhouette)
- 📏 Calcul de métrage
- 🧵 Tissu(s) sélectionné(s)
- 🎨 Palette de couleurs
- 📝 Notes

**États d'une zone :**

| État           | Description                  | Visuel                                         |
|----------------|------------------------------|------------------------------------------------|
| `active`       | Zone de travail en cours     | Border dashed, bg color/15%, [Cristalliser]    |
| `crystallized` | Zone transformée en projet   | Border solid, bg color/5%, [Voir projet →]     |

---

### Élément

**Définition :** Unité de contenu atomique sur un Board. Peut être travaillé en mode basique (modal) ou approfondi (Journey).

**Types d'éléments :**

| Type          | Icône | Description                           | Modal (basique)        | Journey (étendu)           |
|---------------|-------|---------------------------------------|------------------------|----------------------------|
| `textile`     | 🧵    | Tissu depuis recherche/favoris        | Ajout, note            | Comparateur                |
| `palette`     | 🎨    | Ensemble de couleurs                  | Création, extraction   | Harmonies, export          |
| `inspiration` | 📷    | Image de référence                    | Upload, URL            | Multi-extraction           |
| `calculation` | 📏    | Calcul de métrage                     | Vêtement unique        | Multi-vêtements détaillé   |
| `note`        | 📝    | Texte libre                           | Édition simple         | Markdown complet           |
| `video`       | 🎬    | Vidéo YouTube/Vimeo                   | URL, preview           | -                          |
| `link`        | 🔗    | Lien web avec preview                 | URL, og:meta           | -                          |
| `pdf`         | 📄    | Document PDF                          | Upload, aperçu         | -                          |
| `pattern`     | ✂️    | Patron de couture                     | Upload, infos base     | Découpe, disposition       |
| `silhouette`  | 👤    | Croquis de mode                       | Upload, catégorie      | -                          |

**Attributs communs :**
- Position (x, y) sur le Board
- Taille (largeur, hauteur)
- z-index (superposition)
- Zone d'appartenance (optionnel)

**Règle importante :** Un élément appartient à **une seule zone** à la fois. Pour utiliser le même tissu dans plusieurs zones, l'utilisateur doit **dupliquer** l'élément.

---

### Projet d'Achat

**Définition :** Résultat de la **cristallisation** d'une zone. Contient tout le nécessaire pour passer commande : patron validé, calcul métrage validé, tissu(s) sélectionné(s).

**Attributs :**
- Nom
- Statut (brouillon, prêt à commander, commandé, terminé)
- Patron validé (snapshot)
- Calcul validé (snapshot)
- Tissus sélectionnés (snapshot avec prix au moment de la cristallisation)
- Contraintes (deadline, budget, client)
- Références : Board source, Zone source

**Relation avec la zone source :**
- Le projet contient une **copie snapshot** des éléments
- Les modifications de la zone source n'affectent PAS le projet
- La zone reste visible sur le Board (marquée "cristallisée")

**Différence avec "Projet Global" (Board) :**

| Concept          | Board (Projet Global)              | Projet d'Achat                    |
|------------------|------------------------------------|-----------------------------------|
| Périmètre        | Collection entière, thème, client  | Une pièce spécifique              |
| Contenu          | Multiples zones + éléments libres  | Patron + Calcul + Tissus figés    |
| État             | Évolutif, modifiable               | Snapshot figé                     |
| Action suivante  | Cristalliser les zones             | Passer commande                   |

---

### Cristallisation

**Définition :** Action de transformer une **zone** du Board en **projet d'achat** concret, prêt pour la commande.

**Processus :**
1. Designer complète une zone (patron + calcul + tissus)
2. Clique "Cristalliser" sur la zone
3. Wizard de validation (4 étapes)
4. Création du projet d'achat (snapshot)
5. Zone marquée "cristallisée" sur le Board

**Caractéristiques clés :**

| Aspect                  | Règle                                      |
|-------------------------|--------------------------------------------|
| **Périmètre MVP**       | Zone → Projet d'achat uniquement           |
| **Éléments**            | Dupliqués (snapshot), pas référencés       |
| **Zone après**          | Reste visible, marquée "cristallisée"      |
| **Projet indépendant**  | Modifications zone ≠ modifications projet  |

**Exemple visuel :**

```
AVANT cristallisation :
┌─────────────────────┐
│ Zone "Veste"        │
│ [ACTIVE]            │
│                     │
│  ✂️ Patron Burda    │
│  📏 Calcul 2.5m     │
│  🧵 Lin bleu MLC    │
│  🎨 Palette marine  │
│                     │
│  [⚡ Cristalliser]  │
└─────────────────────┘

APRÈS cristallisation :
┌─────────────────────┐
│ Zone "Veste"        │
│ [CRISTALLISÉE]      │──────► PROJET D'ACHAT
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │        "Veste Lin Mme Martin"
│  ✂️ Patron Burda    │        
│  📏 Calcul 2.5m     │        Prêt à commander :
│  🧵 Lin bleu MLC    │        - Lin bleu 2.5m @ 15€/m
│  🎨 Palette marine  │        - Total : 37.50€
│                     │
│  [Voir projet →]    │
└─────────────────────┘
```

---

## Concepts Secondaires

### Tissu

**Définition :** Un produit textile disponible sur une source de vente.

**Attributs :**
- Nom
- Source (site d'origine)
- Prix (€/m ou prix coupon)
- Quantité disponible
- Matière (normalisée)
- Couleur (normalisée)
- Image
- URL source

**Exemple :** "Lin bleu lavande - My Little Coupon - 15€/m - 3m disponibles"

---

### Favori

**Définition :** Un tissu sauvegardé dans la bibliothèque personnelle pour consultation ultérieure.

**Caractéristiques :**
- Stockage long terme
- Indépendant des Boards
- Peut être envoyé vers un Board à tout moment

**Différence avec Board :** Les favoris sont une bibliothèque passive, le Board est un espace de travail actif.

---

### Palette

**Définition :** Un ensemble de couleurs cohérentes.

**Attributs :**
- Nom (optionnel)
- 3 à 10 couleurs (codes hex)
- Source (extraite d'image ou créée manuellement)

**Exemple :** Palette "Provence" : #E8D4B8, #8B4513, #DEB887, #F5DEB3

---

### Calcul

**Définition :** Une estimation de métrage pour un ou plusieurs vêtements.

**Deux niveaux :**

| Niveau    | Où            | Fonctionnalités                                    |
|-----------|---------------|---------------------------------------------------|
| Basique   | Modal Board   | 1 vêtement, taille, résultat rapide               |
| Étendu    | Journey       | Multi-vêtements, variations, modificateurs tissu  |

**Attributs (niveau étendu) :**
- Type(s) de vêtement
- Taille(s)
- Quantité(s)
- Variations (longueur, manches, doublure...)
- Largeur tissu
- Modificateurs (directionnel, raccord, stretch)
- Marge de sécurité
- Breakdown détaillé
- Résultat (métrage recommandé)

---

### Note

**Définition :** Texte libre pour annoter, commenter, capturer une idée.

**Caractéristiques :**
- Texte simple (Board modal)
- Texte riche Markdown (Journey si implémenté)
- Peut être attachée à une zone ou libre sur le Board

---

## Relations entre concepts

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│    EXPLORATION                                                   │
│    ├── Recherche ────────┐                                       │
│    ├── Favoris ──────────┼──────► Élément sur Board              │
│    └── Recherche         │                                       │
│        contextuelle ─────┘                                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│    BOARD (Projet Global)                                         │
│    │                                                             │
│    ├── Éléments libres (inspirations, notes...)                  │
│    │                                                             │
│    └── Zones (futurs projets d'achat)                            │
│        ├── Zone A ──► [Cristalliser] ──► Projet d'Achat A        │
│        ├── Zone B ──► [Cristalliser] ──► Projet d'Achat B        │
│        └── Zone C ──► [En cours...]                              │
│                                                                  │
│    Élément ──► [Approfondir] ──► JOURNEY ──► Élément enrichi     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│    RÉALISATION (Phase 3+)                                        │
│    │                                                             │
│    └── Projet d'Achat                                            │
│        ├── Commande                                              │
│        ├── Livraison                                             │
│        ├── Fabrication                                           │
│        └── Impact écologique                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Évolutions prévues

### Phase 2 (en cours)

**Board :**
- Resize des éléments
- Multi-sélection et alignement
- Undo/Redo
- Export/Import

**Journey :**
- Calculateur multi-vêtements détaillé
- Comparateur de tissus avancé
- Éditeur de patron (disposition pièces)

**Cristallisation :**
- Wizard 4 étapes
- Snapshot des éléments
- Liaison Board → Projet d'Achat

### Phase 3

- **Réalisation** : Suivi commandes, livraison, fabrication
- **Impact** : Calcul CO2 et eau économisés
- **Collaboration** : Boards partagés multi-utilisateurs

### Phase 4+

- **Templates** : Boards pré-configurés par type de projet
- **IA** : Suggestions de tissus basées sur le contenu du Board
- **Import** : Pinterest, images en lot

---

## Glossaire rapide

| Terme              | Définition courte                                              |
|--------------------|----------------------------------------------------------------|
| **Board**          | Espace de travail = projet global (vue d'ensemble)             |
| **Zone**           | Regroupement d'éléments = futur projet d'achat                 |
| **Élément**        | Unité atomique sur un Board (tissu, palette, calcul...)        |
| **Journey**        | Mode focus pour approfondir un élément                         |
| **Cristallisation**| Action de transformer une zone en projet d'achat               |
| **Projet d'Achat** | Zone cristallisée, prête pour commande                         |
| **Favori**         | Tissu sauvegardé (bibliothèque passive)                        |

---

**Document maintenu par :** Équipe Produit

**Dernière mise à jour :** 15/01/2026
