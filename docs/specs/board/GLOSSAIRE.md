
# Glossaire Deadstock Search Engine

**Version:** 1.1

**Date:** 05/01/2026

**Statut:** Validé

---

## Vue d'ensemble

Ce glossaire définit les concepts fondamentaux de l'application Deadstock Search Engine. Il sert de référence pour maintenir une cohérence dans le développement, la documentation et l'interface utilisateur.

---

## Architecture conceptuelle

```
┌─────────────────────────────────────────────────────────────────┐
│                         EXPLORATION                              │
│                                                                 │
│   Recherche    Inspirations    Favoris    Calcul                │
│       │             │            │          │                   │
│       └─────────────┴────────────┴──────────┘                   │
│                         │                                       │
│                         ▼                                       │
│                 ┌───────────────┐                               │
│                 │    BOARDS     │                               │
│                 │  (pivot UX)   │                               │
│                 └───────┬───────┘                               │
│                         │                                       │
│                         ▼                                       │
│                  Cristallisation                                │
│                   (Zone → Projet)                               │
│                         │                                       │
└─────────────────────────┼───────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────┐
│                         ▼                                       │
│                      PROJETS                                    │
│                         │                                       │
│                    RÉALISATION                                  │
│                                                                 │
│              Projets    Collections    Commandes                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Niveau EXPLORATION

### Tissu

**Définition :** Un produit textile disponible sur une source de vente.

**Attributs :**

* Nom
* Source (site d'origine)
* Prix (€/m)
* Quantité disponible
* Matière (normalisée)
* Couleur (normalisée)
* Image
* URL source

**Exemple :** "Lin bleu lavande - My Little Coupon - 15€/m - 3m disponibles"

---

### Favori

**Définition :** Un tissu sauvegardé dans la bibliothèque personnelle de l'utilisateur pour consultation ultérieure.

**Caractéristiques :**

* Stockage long terme
* Indépendant des boards
* Peut être envoyé vers un board à tout moment

**Différence avec Board :** Les favoris sont une bibliothèque passive, le board est un espace de travail actif.

---

### Palette

**Définition :** Un ensemble de couleurs cohérentes créé par l'utilisateur.

**Attributs :**

* Nom (optionnel)
* 3 à 7 couleurs (codes hex)
* Source (extraite d'image ou créée manuellement)

**Exemple :** Palette "Provence" : #E8D4B8, #8B4513, #DEB887, #F5DEB3

---

### Inspiration

**Définition :** Une référence visuelle ajoutée par l'utilisateur pour nourrir sa réflexion créative.

**Types :**

* Image uploadée
* Image depuis URL
* Capture d'écran
* Croquis

**Attributs :**

* Image
* Légende (optionnelle)
* Tags (optionnels)
* Palette extraite (auto)

---

### Calcul

**Définition :** Une estimation de métrage pour un ou plusieurs vêtements.

**Attributs :**

* Type de vêtement
* Taille
* Quantité
* Variations (longueur, manches, doublure...)
* Largeur tissu
* Marge de sécurité
* Résultat (métrage recommandé)

**Exemple :** "Robe midi M × 1 = 2.8m recommandés (marge 10% incluse)"

---

### Note

**Définition :** Texte libre pour annoter, commenter, capturer une idée.

**Caractéristiques :**

* Texte riche (gras, italique, listes)
* Peut être attachée à un élément ou libre sur le board

**Exemple :** "Essayer avec des boutons dorés, demander avis cliente"

---

## Niveau BOARD

### Board

**Définition :** Espace de réflexion visuel où l'utilisateur accumule, organise et fait mûrir ses idées créatives.

**Caractéristiques :**

* Créé par l'utilisateur selon SA logique (pièce, collection, client, thème...)
* Contient des éléments (tissus, palettes, inspirations, calculs, notes)
* Organisation libre avec zones optionnelles
* Collaboratif (Phase 2)

**Cycle de vie :**

1. Création (explicite ou au premier ajout d'élément)
2. Exploration (accumulation d'éléments)
3. Maturation (organisation, annotation)
4. Cristallisation (transformation de zones en projets)
5. Archivage (consultation, historique)

**Exemples d'usage :**

| Utilisateur              | Logique        | Boards                    |
| ------------------------ | -------------- | ------------------------- |
| Créatrice indépendante | Par pièce     | "Robe été", "Top lin"   |
| Marque                   | Par collection | "Collection AH26"         |
| Artisan                  | Par client     | "Mme Dupont", "M. Martin" |

---

### Élément

**Définition :** Unité de contenu atomique sur un board.

**Types d'éléments :**

* 🧵 Tissu (depuis recherche ou favoris)
* 🎨 Palette (depuis inspirations)
* 📷 Inspiration (image)
* 📐 Calcul (depuis calculateur)
* 📝 Note (texte libre)

**Attributs communs :**

* Position (x, y) sur le board
* Taille (largeur, hauteur)
* z-index (superposition)
* Zone d'appartenance (optionnel)

**Règle importante :** Un élément appartient à **une seule zone** à la fois. Pour utiliser le même tissu dans plusieurs zones (ex: veste ET chemise), l'utilisateur doit **dupliquer** l'élément.

---

### Zone

**Définition :** Regroupement spatial d'éléments liés sur un board, représentant une intention créative cohérente.

**Caractéristiques :**

* Optionnel (le board peut n'avoir aucune zone)
* Nommé par l'utilisateur
* Délimité visuellement (couleur, bordure)
* Redimensionnable (poignées de resize)
* **Cristallisable** → peut devenir un projet

**États d'une zone :**

| État            | Description                 | Visuel                                                      |
| ---------------- | --------------------------- | ----------------------------------------------------------- |
| `active`       | Zone de travail normale     | Border dashed, bg color/15%, bouton "Cristalliser"          |
| `crystallized` | Zone transformée en projet | Border solid, bg color/5%, badge "Projet", lien vers projet |

**Exemples de zones :**

* "Veste" (tissus + palette + calcul pour une veste)
* "Chemise" (tissus + notes pour une chemise)
* "À valider avec cliente"
* "Inspirations couleur"

---

### Tag

**Définition :** Étiquette pour catégoriser et filtrer les éléments ou boards.

**Format :** #mot-clé

**Exemples :** #été2026, #urgent, #client-dupont, #lin, #bleu

---

## Niveau RÉALISATION

### Projet

**Définition :** Intention de réalisation concrète avec un livrable défini, créée à partir d'une  **zone cristallisée** .

**Attributs :**

* Nom
* Type (pièce unique, ensemble)
* Statut (brouillon, en cours, terminé)
* Pièces à réaliser
* Tissus sélectionnés (snapshot au moment de la cristallisation)
* Calculs validés
* Contraintes (deadline, budget, client)
* Board source (référence)
* Zone source (référence)

**Exemple :** Projet "Veste Lin Mme Martin" - 1 pièce - Deadline 15/02

**Relation avec la zone source :**

* Le projet contient une **copie snapshot** des éléments
* Les modifications de la zone source n'affectent PAS le projet
* La zone reste visible sur le board (marquée "cristallisée")

---

### Pièce

**Définition :** Un vêtement ou accessoire unique au sein d'un projet.

**Attributs :**

* Type de vêtement (robe, pantalon, veste...)
* Taille
* Variations (longueur, manches...)
* Tissu assigné
* Métrage nécessaire
* Statut (à faire, en cours, terminé)

---

### Ensemble

**Définition :** Projet comportant plusieurs pièces coordonnées pour une même occasion ou client.

**Exemple :** "Tenue mariage Sophie" comprenant :

* Robe principale
* Veste assortie
* Ceinture

---

### Collection

**Définition :** Regroupement thématique de plusieurs projets liés.

**Caractéristiques :**

* Cohérence visuelle (palette partagée)
* Cohérence commerciale (même saison/ligne)
* Peut naître de plusieurs zones cristallisées du même board
* Ou de projets indépendants liés après coup

**Attributs :**

* Nom
* Saison (optionnel)
* Description
* Palette de référence
* Projets inclus

**Exemple :** Collection "Provence AH26" - 12 pièces - 4 projets

---

### Commande

**Définition :** Achat effectif de tissu(s) pour un projet.

**Attributs :**

* Tissu commandé
* Quantité
* Prix
* Source
* Date
* Statut (commandé, expédié, reçu)
* Projet associé

---

## Cristallisation

### Définition

**Cristallisation :** Action de transformer une **zone** d'un board en **projet** concret.

### Caractéristiques clés

| Aspect                        | Règle                                     |
| ----------------------------- | ------------------------------------------ |
| **Périmètre MVP**     | Zone → Projet uniquement                  |
| **Éléments**          | Dupliqués (snapshot), pas référencés   |
| **Zone après**         | Reste visible, marquée "cristallisée"    |
| **Projet indépendant** | Modifications zone ≠ modifications projet |

### Processus (Wizard 4 étapes)

1. **Périmètre** : Zone pré-sélectionnée, confirmation des éléments
2. **Type de projet** : Nom, type (pièce unique/ensemble), client, deadline
3. **Contenu** : Validation des pièces, association tissu/pièce, calculs
4. **Confirmation** : Récapitulatif, création du projet

### Exemple visuel

```
AVANT cristallisation :
┌─────────────────────┐
│ Zone "Veste"        │
│ [ACTIVE]            │
│                     │
│  🎨 Palette bleu    │
│  🧵 Tissu lin       │
│  📊 Calcul 2.5m     │
│                     │
│  [⚡ Cristalliser]  │
└─────────────────────┘

APRÈS cristallisation :
┌─────────────────────┐
│ Zone "Veste"        │
│ [CRISTALLISÉE]      │──────> PROJET "Veste Lin"
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │       (copie des éléments)
│  🎨 Palette bleu    │
│  🧵 Tissu lin       │
│  📊 Calcul 2.5m     │
│                     │
│  [Voir projet →]    │
└─────────────────────┘
```

### Règles importantes

1. **Un élément = une zone** : Pour utiliser le même tissu dans plusieurs projets, le dupliquer dans chaque zone
2. **Snapshot figé** : Le projet garde les données au moment de la cristallisation
3. **Non destructif** : La zone reste consultable après cristallisation
4. **Filtrable** : L'utilisateur peut filtrer les zones actives / cristallisées

---

## Relations entre concepts

```
Favori ←──────────────────────────────────┐
   │                                      │
   │ [Envoyer au board]                   │
   ▼                                      │
Élément ──────▶ Zone ──────▶ Projet ──────┤
   ▲              │    cristallisation    │
   │              │              │        │
Recherche         │              ▼        │
Inspirations      │         Collection    │
Calcul            │              │        │
Note              │              ▼        │
                  │          Commande     │
                  │              │        │
                  │              ▼        │
                  └───────▶ Archivage ────┘
```

---

## Évolutions prévues

### Phase 2

* **Board collaboratif** : Partage et édition multi-utilisateurs
* **Commentaires** : Discussion sur les éléments
* **Historique** : Versioning des boards
* **Cristallisation board entier** : Tout le board → projet
* **Cristallisation sélection** : Éléments sélectionnés → projet
* **Gestion modifications post-cristallisation** : Versioning des projets

### Phase 3

* **Templates** : Boards pré-configurés par type de projet
* **IA** : Suggestions de tissus basées sur le contenu du board
* **Import** : Pinterest, images en lot

---

**Document maintenu par :** Équipe Produit

**Dernière mise à jour :** 05/01/2026
