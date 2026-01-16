
# Parcours Designer : De l'Exploration à la Production

**Version** : 1.0

**Date** : 16 Janvier 2026

**Statut** : Document de référence fonctionnelle

---

## 1. Vue d'Ensemble

Ce document décrit le parcours complet d'un designer utilisant Deadstock Search Engine, depuis l'exploration initiale jusqu'à la production du vêtement. Il sert de référence pour les spécifications techniques.

### Philosophie Clé

> **Le Board est l'espace de travail unique.** Le designer y fait tout : explorer, organiser, modifier, décider. Le "Projet" n'est qu'un marqueur d'intention qui devient autonome uniquement au moment de la commande.

### Deux Vues Complémentaires

L'application offre **deux façons de voir les mêmes éléments** :

| Vue               | Description                  | Usage                                                 |
| ----------------- | ---------------------------- | ----------------------------------------------------- |
| **Board**   | Vue spatiale, globale        | Organiser visuellement, explorer, créer              |
| **Journey** | Vue séquentielle, par phase | Suivre l'avancement, gérer les projets par maturité |

```
┌─────────────────────────────────────────────────────────────────┐
│                         BOARD                                   │
│            (Vue spatiale - Organisation libre)                  │
│                                                                 │
│    ┌─────────┐     ┌─────────┐     ┌─────────┐                │
│    │ Veste   │     │ Chemise │     │ Pantalon│                │
│    │ [Cmd]   │     │ [Brouil]│     │ [Actif] │                │
│    └─────────┘     └─────────┘     └─────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Même données, vue différente
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        JOURNEY                                  │
│          (Vue séquentielle - Par phase de maturité)            │
│                                                                 │
│  BROUILLONS          COMMANDÉS           TERMINÉS              │
│  ───────────         ──────────          ─────────             │
│  📋 Chemise          ✓ Veste             ✓ Robe été            │
│  📋 Pantalon                             ✓ Top lin             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Les Phases du Parcours

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   EXPLORATION        INTENTION         ENGAGEMENT        RÉALISATION   │
│   ───────────        ─────────         ──────────        ────────────  │
│                                                                         │
│   Board libre    →   Cristallisation  →  Commande    →   Production    │
│                      (Brouillon)         (Figé)                        │
│                                                                         │
│   ∞ modifications    ∞ modifications     0 modification   Suivi        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Phase 1 : Exploration (Board Libre)

### 3.1 Description

Le designer explore librement, sans engagement. Il cherche des tissus, crée des palettes, teste des idées, organise visuellement ses réflexions.

### 3.2 Actions Possibles

| Action                 | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| Rechercher des tissus  | Via la recherche principale ou contextuelle             |
| Ajouter aux favoris    | Sauvegarder des tissus intéressants                    |
| Créer un board        | Espace de travail visuel                                |
| Ajouter des éléments | Tissus, palettes, notes, inspirations, calculs          |
| Créer des zones       | Regrouper des éléments par thème (Veste, Chemise...) |
| Organiser              | Déplacer, redimensionner, renommer                     |
| Supprimer              | Retirer ce qui ne convient plus                         |

### 3.3 Éléments Disponibles

| Type            | Description                       | Données                         |
| --------------- | --------------------------------- | -------------------------------- |
| `textile`     | Tissu depuis favoris ou recherche | Référence, source, prix, image |
| `palette`     | Palette de couleurs               | Couleurs hex, noms               |
| `note`        | Note textuelle                    | Contenu texte                    |
| `inspiration` | Image d'inspiration               | Image, source, description       |
| `calculation` | Calcul de métrage                | Type vêtement, taille, métrage |
| `pattern`     | Patron PDF                        | Fichier, pièces, métrage       |
| `silhouette`  | Silhouette/croquis                | Image, notes                     |
| `video`       | Vidéo référence                | URL, description                 |
| `link`        | Lien externe                      | URL, titre, description          |
| `pdf`         | Document PDF                      | Fichier, description             |

### 3.4 État des Zones

* **Zone active** : Bordure pointillée, fond coloré 15%
* Peut contenir 0 ou plusieurs éléments
* Entièrement modifiable (déplacer, redimensionner, renommer, supprimer)

### 3.5 Sortie de Phase

Le designer peut rester indéfiniment en exploration. Quand il a une direction claire pour une zone, il peut la  **cristalliser** .

---

## 4. Phase 2 : Intention (Projet Brouillon)

### 4.1 Description

Le designer a une intention : "Cette zone va devenir un vêtement réel". Il cristallise la zone, ce qui crée un  **Projet en mode Brouillon** .

**Important** : Le projet brouillon n'est PAS une copie figée. C'est un **marqueur** qui "regarde" la zone en temps réel.

### 4.2 Déclencheur : Cristallisation

```
Clic "Cristalliser" sur une zone
        │
        ▼
┌─────────────────────────────┐
│  Dialog Cristallisation     │
│                             │
│  Nom du projet : [______]   │
│  Type : ○ Pièce unique      │
│         ○ Ensemble          │
│         ○ Collection        │
│                             │
│  [Annuler]  [Créer projet]  │
└─────────────────────────────┘
        │
        ▼
Projet créé avec status = "draft"
Zone marquée comme cristallisée
```

### 4.3 Ce qui est Créé

```
PROJET (en base de données)
├── id: uuid
├── name: "Veste Lin Printemps"
├── project_type: "single_piece"
├── status: "draft"              ← BROUILLON
├── source_board_id: uuid
├── source_zone_id: uuid         ← Lien vers la zone
├── created_at: timestamp
├── ordered_at: null             ← Pas encore commandé
├── snapshot: null               ← Pas encore de copie
└── session_id: uuid
```

### 4.4 Comportement en Mode Brouillon

#### Sur le Board

| Action                            | Possible ? | Effet sur le Projet                      |
| --------------------------------- | ---------- | ---------------------------------------- |
| Déplacer la zone                 | ✅         | Les éléments contenus suivent          |
| Redimensionner la zone            | ✅         | Éléments qui sortent sont "détachés" |
| Renommer la zone                  | ✅         | Aucun (nom du projet indépendant)       |
| Ajouter un élément dans la zone | ✅         | Automatiquement rattaché au projet      |
| Retirer un élément de la zone   | ✅         | Automatiquement détaché du projet      |
| Modifier un élément             | ✅         | Le projet voit la modification           |
| Supprimer un élément            | ✅         | Disparaît du projet                     |
| Supprimer la zone                 | ⚠️       | Demande confirmation, supprime le projet |

#### Lecture du Projet

Quand on consulte le projet (page Journey), les données sont lues **en temps réel** depuis la zone :

```
Affichage Projet "Veste Lin"
        │
        ▼
Requête: getElementsInZone(source_zone_id)
        │
        ▼
Retourne les éléments ACTUELS de la zone
(pas une copie, l'état live)
```

#### Visuel de la Zone Cristallisée (Brouillon)

```
┌─────────────────────────────────┐
│ ● Veste          📋 Brouillon  │  ← Header avec badge
├─────────────────────────────────┤
│                                 │
│   🧵 Tissu lin écru            │
│   📊 Calcul 2.5m               │
│   🎨 Palette beige/bleu        │
│                                 │
├─────────────────────────────────┤
│  [Voir projet]  [Commander]     │  ← Actions
└─────────────────────────────────┘

Style : Bordure solide, fond coloré 10%, badge "Brouillon"
```

### 4.5 Scénario : Changement d'Avis

```
Jour 1 : Cristallisation
─────────────────────────
Zone "Veste" contient :
├── 🧵 Tissu lin écru (12€/m)
├── 📊 Calcul 2.5m
└── 🎨 Palette beige

→ Projet "Veste Lin" créé (brouillon)


Jour 5 : Le designer change d'avis
──────────────────────────────────
Actions sur le board :
1. Drag le tissu lin HORS de la zone
2. Recherche contextuelle → trouve tissu laine
3. Drag le tissu laine DANS la zone
4. Double-clic sur calcul → modifie 2.5m → 2.8m

Zone "Veste" contient maintenant :
├── 🧵 Tissu laine gris (18€/m)  ← Nouveau
├── 📊 Calcul 2.8m               ← Modifié
└── 🎨 Palette beige

Le projet "Veste Lin" voit automatiquement :
├── Tissu laine gris (pas le lin)
├── 2.8m (pas 2.5m)
└── Palette beige
```

### 4.6 Durée de la Phase

**Illimitée.** Le designer peut rester en brouillon aussi longtemps qu'il veut (jours, semaines, mois). Aucune pression, aucune perte de données.

### 4.7 Sortie de Phase

Quand le designer est prêt, il  **passe commande** . C'est le seul moment où les données sont figées.

---

## 5. Phase 3 : Engagement (Commande Passée)

### 5.1 Description

Le designer a finalisé ses choix et passe commande du tissu. C'est le **point de non-retour** : les données sont figées dans un snapshot.

### 5.2 Déclencheur : Passer Commande

```
Clic "Commander" sur la zone ou dans le projet
        │
        ▼
┌─────────────────────────────────────────┐
│  Passer Commande                        │
│                                         │
│  Récapitulatif :                        │
│  ┌─────────────────────────────────┐    │
│  │ 🧵 Tissu laine gris             │    │
│  │    Source : Nona Source         │    │
│  │    Prix : 18€/m                 │    │
│  │    Quantité : [2.8] m           │    │
│  │    Sous-total : 50.40€          │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Fournisseur : [_______________]        │
│  Réf. commande : [_______________]      │
│  Notes : [_________________________]    │
│                                         │
│  ⚠️ Une fois commandé, le projet sera  │
│     figé et ne pourra plus être modifié │
│                                         │
│  [Annuler]        [Confirmer commande]  │
└─────────────────────────────────────────┘
```

### 5.3 Ce qui se Passe

```
1. SNAPSHOT créé
   ├── Copie des éléments textiles (avec prix du jour)
   ├── Copie des calculs
   ├── Copie des palettes
   ├── Détails de commande (fournisseur, référence, notes)
   └── Total calculé

2. PROJET mis à jour
   ├── status: "draft" → "ordered"
   ├── ordered_at: now()
   └── snapshot: { ... données figées ... }

3. ZONE mise à jour (optionnel)
   └── Marqueur visuel "Commandé ✓"
```

### 5.4 Structure du Snapshot

```json
{
  "textiles": [
    {
      "textile_id": "abc-123",
      "name": "Tissu laine gris chiné",
      "source": "Nona Source",
      "source_url": "https://...",
      "price_per_meter": 18.00,
      "image_url": "https://...",
      "quantity_ordered": 2.8,
      "subtotal": 50.40,
      "attributes": {
        "fiber": "wool",
        "color": "gray",
        "width": 140
      }
    }
  ],
  "calculations": [
    {
      "garment_type": "jacket",
      "size": "M",
      "total_meters": 2.8,
      "fabric_width": 140,
      "seam_allowance": 1.5
    }
  ],
  "palettes": [
    {
      "colors": ["#D4C4A8", "#4A5568", "#2D3748"]
    }
  ],
  "order_details": {
    "supplier": "Nona Source",
    "order_reference": "NS-2026-1234",
    "order_date": "2026-01-20T14:30:00Z",
    "estimated_delivery": "2026-01-27",
    "notes": "Demander échantillon avant envoi complet"
  },
  "totals": {
    "fabric_cost": 50.40,
    "shipping": 8.00,
    "total": 58.40
  }
}
```

### 5.5 Comportement Après Commande

#### Sur le Board

| Action                  | Possible ?        | Détail                                        |
| ----------------------- | ----------------- | ---------------------------------------------- |
| Déplacer la zone       | ✅ Oui            | Zone seule (éléments figés à l'intérieur) |
| Redimensionner la zone  | ❌ Non            | Taille figée                                  |
| Modifier les éléments | ❌ Non            | Contenu figé                                  |
| Supprimer la zone       | ⚠️ Avec warning | Projet conservé, zone disparaît du board     |
| Mode réduit            | ✅ Oui            | Toggle pour minimiser l'espace occupé         |

#### Mode Réduit (Toggle)

Une zone commandée peut être **réduite** pour libérer de l'espace sur le board tout en restant visible :

```
MODE NORMAL                          MODE RÉDUIT
─────────────                        ───────────

┌─────────────────────────────┐      ┌─────────────────────┐
│ 🔒 Veste        ✓ Commandé │      │ 🔒 Veste ✓ 58€  [↗]│
├─────────────────────────────┤      └─────────────────────┘
│                             │    
│   🧵 Tissu laine gris      │      (Clic sur [↗] = agrandir)
│   📊 2.8m                  │    
│   💰 58.40€                │    
│                             │    
│   Commandé le 20/01/2026   │    
│                             │    
├─────────────────────────────┤    
│  [Voir projet]         [▼] │    
└─────────────────────────────┘    

[▼] = Réduire    [↗] = Agrandir
```

**Avantages du mode réduit :**

* Libère de l'espace pour les projets actifs
* Garde une trace visuelle des projets commandés
* Accès rapide aux infos essentielles (nom, statut, montant)
* Un clic pour voir le détail si besoin

#### Visuel de la Zone Commandée

```
┌─────────────────────────────────┐
│ 🔒 Veste            ✓ Commandé │  ← Header avec cadenas
├─────────────────────────────────┤
│                                 │
│   🧵 Tissu laine gris          │
│   📊 2.8m                      │
│   🎨 Palette                   │
│                                 │
│   Commandé le 20/01/2026       │
│   Total : 58.40€               │
│                                 │
├─────────────────────────────────┤
│  [Voir projet]                  │
└─────────────────────────────────┘

Style : Bordure solide, fond grisé, badge "Commandé", cadenas
```

#### Lecture du Projet

Après commande, le projet lit le  **snapshot figé** , plus la zone :

```
Affichage Projet "Veste Lin"
        │
        ▼
Requête: project.snapshot
        │
        ▼
Retourne les données FIGÉES
(indépendant de l'état actuel de la zone)
```

### 5.6 Sortie de Phase

Quand le designer reçoit le tissu, il passe en phase Production.

---

## 6. Phase 4 : Réalisation (Production)

### 6.1 Description

Le tissu est reçu. Le designer peut maintenant produire le vêtement. Cette phase est principalement du **suivi** et de la  **documentation** .

### 6.2 Étapes

```
COMMANDÉ ──► EN ATTENTE ──► EXPÉDIÉ ──► REÇU ──► EN PRODUCTION ──► TERMINÉ
                │              │          │            │              │
                │              │          │            │              │
            Confirmation   Tracking   Réception    Début          Vêtement
            fournisseur    colis      tissu        confection     fini
```

### 6.3 Actions Disponibles

| Action                  | Description              |
| ----------------------- | ------------------------ |
| Marquer "Expédié"     | Le fournisseur a envoyé |
| Ajouter tracking        | Numéro de suivi colis   |
| Marquer "Reçu"         | Tissu en main            |
| Ajouter photos          | Photos du tissu reçu    |
| Marquer "En production" | Confection commencée    |
| Ajouter notes           | Journal de production    |
| Marquer "Terminé"      | Vêtement fini           |
| Ajouter photos finales  | Photos du vêtement      |

### 6.4 Timeline du Projet

```
PROJET "Veste Lin Printemps"
════════════════════════════════════════════════════════════

📅 12/01/2026 - Créé
   Zone "Veste" cristallisée

📅 15/01/2026 - Modifié  
   Tissu changé : lin → laine
   Métrage ajusté : 2.5m → 2.8m

📅 20/01/2026 - Commandé ✓
   Fournisseur : Nona Source
   Réf : NS-2026-1234
   Total : 58.40€

📅 22/01/2026 - Expédié
   Tracking : COLISSIMO-ABC123

📅 27/01/2026 - Reçu ✓
   📷 [Photo tissu reçu]
   Note : "Qualité conforme, belle main"

📅 28/01/2026 - En production
   Note : "Coupe commencée"

📅 05/02/2026 - Terminé ✓
   📷 [Photos vêtement fini]
   Note : "Client satisfait"

════════════════════════════════════════════════════════════
```

### 6.5 Données de Suivi (Optionnel - Phase Future)

```
PROJECT_TRACKING
├── shipping_carrier: "Colissimo"
├── tracking_number: "ABC123"
├── shipped_at: timestamp
├── received_at: timestamp
├── received_photos: [urls]
├── received_notes: "Qualité OK"
├── production_started_at: timestamp
├── production_notes: [{ date, note }]
├── completed_at: timestamp
├── completed_photos: [urls]
└── completed_notes: "Client satisfait"
```

---

## 7. Cas Particuliers

### 7.1 Plusieurs Tissus dans un Projet

Un projet peut contenir plusieurs textiles (tissu principal + doublure + passepoil...).

```
Zone "Veste"
├── 🧵 Tissu laine gris (extérieur) - 2.8m
├── 🧵 Tissu viscose (doublure) - 2.2m
├── 🧵 Biais satin (finitions) - 3m
└── 📊 Calcul détaillé

→ Commande peut être :
   - Un seul fournisseur (tout chez Nona)
   - Plusieurs fournisseurs (laine chez Nona, viscose chez MLC)
```

### 7.2 Projet Ensemble (Plusieurs Pièces)

```
Zone "Tailleur"
├── Sous-zone "Veste"
│   ├── 🧵 Tissu laine
│   └── 📊 Calcul 2.8m
├── Sous-zone "Pantalon"
│   ├── 🧵 Même tissu laine
│   └── 📊 Calcul 2.2m
└── 📊 Total : 5.0m

→ Un seul projet, une seule commande, même tissu partagé
```

### 7.3 Projet Collection

```
Board "Collection AH26"
├── Zone "Manteau" → Projet "Manteau AH26"
├── Zone "Robe" → Projet "Robe AH26"  
├── Zone "Top" → Projet "Top AH26"
└── 🎨 Palette partagée (hors zones)

→ Chaque zone = un projet indépendant
→ Commandes séparées possibles
→ Lien visuel par le board
```

### 7.4 Annulation / Modification Post-Commande

**Principe** : Une fois commandé, le projet est figé DANS L'APPLICATION.

Si dans la réalité le designer annule sa commande ou la modifie :

* Il peut ajouter une note explicative
* Il peut créer un nouveau projet (re-cristalliser)
* L'ancien projet reste en historique (ou peut être archivé)

**Pas de "dé-cristallisation"** : trop complexe, risque de perte de données.

### 7.5 Suppression

| Élément                         | Brouillon                              | Commandé                                 |
| --------------------------------- | -------------------------------------- | ----------------------------------------- |
| Supprimer un élément de la zone | ✅ Disparaît du projet                | ❌ Impossible                             |
| Supprimer la zone                 | ⚠️ Supprime le projet (confirmation) | ⚠️ Zone supprimable, projet conservé   |
| Supprimer le projet               | ✅ Zone redevient "active"             | ⚠️ Avec confirmation (données perdues) |

---

## 8. Récapitulatif des États

### 8.1 États du Projet

| État         | Code              | Description                      | Modifiable ?       |
| ------------- | ----------------- | -------------------------------- | ------------------ |
| Brouillon     | `draft`         | Intention, données live         | ✅ Oui (via board) |
| Commandé     | `ordered`       | Commande passée, snapshot figé | ❌ Non             |
| Expédié     | `shipped`       | En cours de livraison            | ❌ Non             |
| Reçu         | `received`      | Tissu en main                    | ❌ Non             |
| En production | `in_production` | Confection en cours              | ❌ Non             |
| Terminé      | `completed`     | Vêtement fini                   | ❌ Non             |
| Archivé      | `archived`      | Projet clôturé                 | ❌ Non             |

### 8.2 États de la Zone

| État                      | Visuel                 | Déplaçable       | Redimensionnable | Éléments modifiables | Mode réduit |
| -------------------------- | ---------------------- | ------------------ | ---------------- | ---------------------- | ------------ |
| Active                     | Bordure pointillée    | ✅ Seule           | ✅               | ✅                     | ❌           |
| Cristallisée (brouillon)  | Bordure solide + badge | ✅ Avec éléments | ✅               | ✅                     | ❌           |
| Cristallisée (commandée) | Bordure solide + 🔒    | ✅ Seule           | ❌               | ❌                     | ✅           |

---

## 9. Interfaces Utilisateur

### 9.1 Board - Zone Active

```
┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐
┆ ● Veste                      ┆
┆                              ┆
┆   (zone vide ou avec         ┆
┆    éléments libres)          ┆
┆                              ┆
┆                [Cristalliser]┆
└┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘
```

### 9.2 Board - Zone Brouillon

```
┌─────────────────────────────────┐
│ ● Veste          📋 Brouillon  │
├─────────────────────────────────┤
│                                 │
│   🧵 Tissu laine gris          │
│   📊 2.8m                      │
│   🎨 Palette                   │
│                                 │
├─────────────────────────────────┤
│  [Voir projet]     [Commander] │
└─────────────────────────────────┘
```

### 9.3 Board - Zone Commandée

```
┌─────────────────────────────────┐
│ 🔒 Veste            ✓ Commandé │
├─────────────────────────────────┤
│                                 │
│   🧵 Tissu laine gris          │
│   📊 2.8m                      │
│   💰 58.40€                    │
│                                 │
│   Commandé le 20/01/2026       │
│                                 │
├─────────────────────────────────┤
│  [Voir projet]                  │
└─────────────────────────────────┘
```

### 9.4 Page Projet - Brouillon

```
┌─────────────────────────────────────────────────────────┐
│  ← Retour au board                                      │
│                                                         │
│  VESTE LIN PRINTEMPS                    📋 Brouillon   │
│  Pièce unique                                           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ℹ️ Ce projet est en brouillon. Les             │   │
│  │  modifications sur le board sont reflétées ici. │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  TISSUS                                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🧵 Tissu laine gris chiné                       │   │
│  │    Nona Source • 18€/m • 2.8m nécessaires       │   │
│  │    Sous-total : 50.40€                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  CALCUL MÉTRAGE                                        │
│  Veste taille M • Largeur 140cm • Marge 1.5cm         │
│  Total : 2.8m                                          │
│                                                         │
│  PALETTE                                               │
│  [■][■][■] Beige / Gris / Anthracite                  │
│                                                         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              [Passer commande →]                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 9.5 Page Projet - Commandé

```
┌─────────────────────────────────────────────────────────┐
│  ← Retour au board                                      │
│                                                         │
│  VESTE LIN PRINTEMPS                      ✓ Commandé   │
│  Pièce unique                                           │
│                                                         │
│  COMMANDE                                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Fournisseur : Nona Source                      │   │
│  │  Référence : NS-2026-1234                       │   │
│  │  Date : 20/01/2026                              │   │
│  │  Total : 58.40€                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  TISSUS COMMANDÉS                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🧵 Tissu laine gris chiné                       │   │
│  │    18€/m × 2.8m = 50.40€                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  TIMELINE                                              │
│  ● 12/01 Créé                                          │
│  ● 20/01 Commandé                                      │
│  ○ En attente de livraison                             │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [Marquer comme expédié]  [Marquer comme reçu]  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Vue Journey (Navigation par Phase)

### 10.1 Description

La vue Journey offre une **navigation séquentielle** des projets, organisée par phase de maturité. Elle complète la vue Board (spatiale) en permettant au designer de :

* Voir tous ses projets regroupés par statut
* Suivre l'avancement global de sa production
* Accéder rapidement aux projets nécessitant une action

### 10.2 Organisation

```
┌─────────────────────────────────────────────────────────────────┐
│  JOURNEY                                        [+ Nouveau]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📋 BROUILLONS (3)                                    [Voir →] │
│  ├── Chemise lin         Board: Collection AH26                │
│  ├── Pantalon velours    Board: Collection AH26                │
│  └── Robe soirée         Board: Commande Marie                 │
│                                                                 │
│  📦 COMMANDÉS (2)                                     [Voir →] │
│  ├── Veste laine         58€  •  En attente livraison          │
│  └── Top soie            42€  •  Expédié (tracking)            │
│                                                                 │
│  ✓ REÇUS (1)                                          [Voir →] │
│  └── Manteau cachemire   Reçu le 10/01  •  En production       │
│                                                                 │
│  🎉 TERMINÉS (5)                                      [Voir →] │
│  └── 5 projets terminés ce mois                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 10.3 Colonnes / Filtres

| Filtre               | Statuts inclus                 | Description                               |
| -------------------- | ------------------------------ | ----------------------------------------- |
| **Brouillons** | `draft`                      | Projets en cours de définition           |
| **Commandés** | `ordered`,`shipped`        | Commandes passées, en attente            |
| **Reçus**     | `received`,`in_production` | Tissu en main, production possible        |
| **Terminés**  | `completed`                  | Projets finalisés                        |
| **Archivés**  | `archived`                   | Projets clôturés (masqués par défaut) |

### 10.4 Informations Affichées par Statut

#### Brouillon

```
┌─────────────────────────────────────────────────┐
│ 📋 Chemise lin                                  │
│    Board: Collection AH26 • Zone: Chemise       │
│    2 tissus • 3.5m total • ~85€ estimé          │
│    Créé il y a 3 jours                          │
│                                    [Voir] [Cmd] │
└─────────────────────────────────────────────────┘
```

#### Commandé

```
┌─────────────────────────────────────────────────┐
│ 📦 Veste laine                     ⏳ En attente│
│    Nona Source • Réf: NS-2026-1234              │
│    58.40€ • Commandé le 20/01                   │
│                        [Voir] [Marquer expédié] │
└─────────────────────────────────────────────────┘
```

#### Reçu

```
┌─────────────────────────────────────────────────┐
│ ✓ Manteau cachemire               🧵 En prod.  │
│    Reçu le 10/01 • 245€                         │
│    Note: "Coupe en cours"                       │
│                       [Voir] [Marquer terminé]  │
└─────────────────────────────────────────────────┘
```

### 10.5 Actions depuis Journey

| Action            | Disponible pour       | Effet                                       |
| ----------------- | --------------------- | ------------------------------------------- |
| Voir projet       | Tous                  | Ouvre la page détail du projet             |
| Voir sur board    | Tous                  | Navigue vers le board, sélectionne la zone |
| Commander         | Brouillons            | Ouvre le formulaire de commande             |
| Marquer expédié | Commandés            | Change statut →`shipped`                 |
| Marquer reçu     | Commandés/Expédiés | Change statut →`received`                |
| Marquer terminé  | Reçus/En prod        | Change statut →`completed`               |
| Archiver          | Terminés             | Change statut →`archived`                |

### 10.6 Lien Board ↔ Journey

Les deux vues sont **synchronisées** :

```
Action sur BOARD                    Effet sur JOURNEY
────────────────                    ─────────────────
Cristalliser une zone        →      Nouveau projet dans "Brouillons"
Passer commande              →      Projet passe dans "Commandés"
Supprimer zone commandée     →      Projet reste dans Journey

Action sur JOURNEY                  Effet sur BOARD
──────────────────                  ────────────────
Marquer reçu                 →      Badge zone mis à jour
Archiver projet              →      Zone peut être supprimée/masquée
```

---

## 11. Glossaire

| Terme                     | Définition                                                  |
| ------------------------- | ------------------------------------------------------------ |
| **Board**           | Espace de travail visuel où le designer organise ses idées |
| **Zone**            | Rectangle sur le board regroupant des éléments par thème  |
| **Élément**       | Objet sur le board (textile, palette, calcul, note...)       |
| **Cristallisation** | Action de transformer une zone en projet (intention)         |
| **Projet**          | Entité représentant une intention de création             |
| **Brouillon**       | État du projet avant commande (données live)               |
| **Snapshot**        | Copie figée des données au moment de la commande           |
| **Commandé**       | État du projet après passage de commande (figé)           |

---

## 12. Questions Ouvertes (Phase Future)

1. **Multi-fournisseurs** : Comment gérer une commande split entre plusieurs sources ?
2. **Budget** : Ajouter un suivi budget prévisionnel vs réel ?
3. **Notifications** : Rappels de suivi commande ?
4. **Export** : Générer un bon de commande PDF ?
5. **Historique** : Garder trace des modifications en brouillon ?
6. **Collaboration** : Partager un projet avec un client ?

---

**Document de référence pour les spécifications techniques.**

**Toute modification de ce parcours doit être validée avant implémentation.**
