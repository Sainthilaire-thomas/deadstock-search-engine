# SPEC : Parcours Consumer Experience V0

**Projet** : Deadstock - "Du tissu oublié au vêtement unique"  
**Version** : 0.1  
**Date** : 20 Janvier 2026  
**Statut** : Draft

---

## Table des matières

1. [Vision & Positionnement](#1-vision--positionnement)
2. [Cible Utilisateur](#2-cible-utilisateur)
3. [Principes UX](#3-principes-ux)
4. [Architecture du Parcours](#4-architecture-du-parcours)
5. [Les 4 Portes d'Entrée](#5-les-4-portes-dentrée)
6. [Le Dressing Room Virtuel](#6-le-dressing-room-virtuel)
7. [Finalisation & Commande](#7-finalisation--commande)
8. [Modèle de Données](#8-modèle-de-données)
9. [Intégrations Techniques](#9-intégrations-techniques)
10. [Roadmap MVP](#10-roadmap-mvp)
11. [Métriques de Succès](#11-métriques-de-succès)

---

## 1. Vision & Positionnement

### 1.1 Le problème résolu

Des millions de mètres de tissus sont détruits chaque année faute de débouchés. Parallèlement, des vêtements identiques sont produits par milliards, créant une uniformité vestimentaire et un gaspillage environnemental massif.

**Le paradoxe actuel** : Les personnes qui voudraient un vêtement unique n'ont pas les compétences pour le créer, tandis que les tissus uniques restent inaccessibles au grand public.

### 1.2 La solution Deadstock Consumer

Permettre à **n'importe qui** d'obtenir un vêtement unique, confectionné dans un tissu sauvé du rebut, par un artisan local — **sans aucune compétence en couture requise**.

### 1.3 Proposition de valeur

| Sézane / Bash / Zara | Deadstock |
|---------------------|-----------|
| 50 000 exemplaires identiques | **1 seul exemplaire** |
| Fabriqué loin, anonymement | **Fabriqué près de chez toi, par un artisan** |
| Taille standard | **À tes mesures** |
| Tissu neuf produit pour | **Tissu sauvé du rebut** |
| Tu achètes ce qu'on te propose | **Tu crées ce que tu veux** |

### 1.4 Tagline

> **"Du tissu oublié au vêtement unique"**
> 
> Un tissu rare, un design choisi, un vêtement qui n'appartient qu'à toi.

---

## 2. Cible Utilisateur

### 2.1 Persona principal : Marie, 32 ans

**Profil**
- Urbaine, CSP+, sensible à l'environnement
- Achète régulièrement chez Sézane, Rouje, & Other Stories
- Fatiguée de "porter la même chose que tout le monde"
- Ne sait pas coudre et n'a pas le temps d'apprendre
- Active sur Instagram, suit des comptes mode

**Frustrations**
- "J'ai vu 3 filles avec la même robe que moi ce matin"
- "Le sur-mesure c'est pour les riches, non ?"
- "Je voudrais un truc unique mais je ne sais pas par où commencer"

**Motivations**
- Affirmer son style personnel
- Consommer de façon plus responsable
- Soutenir l'artisanat local
- Avoir une pièce "à histoire" dans son dressing

### 2.2 Ce que Marie n'est PAS

- Une couturière qui cherche du tissu
- Une militante éco qui veut "sauver la planète"
- Quelqu'un qui a du temps pour un processus complexe
- Une experte en mode qui connaît les matières

### 2.3 Personas secondaires

| Persona | Caractéristique | Besoin spécifique |
|---------|-----------------|-------------------|
| **Léa, 25 ans** | Jeune active, budget serré | Prix transparent, pas de mauvaise surprise |
| **Sophie, 45 ans** | Mère de famille, peu de temps | Processus rapide, guidé |
| **Emma, 28 ans** | Créative, suit les tendances | Personnalisation poussée, partage social |

---

## 3. Principes UX

### 3.1 Les 5 commandements

1. **Zéro jargon technique**
   - ❌ "Choisissez votre métrage de lin sergé"
   - ✅ "Ce tissu fluide est parfait pour l'été"

2. **Le visuel d'abord, les détails ensuite**
   - L'utilisateur voit le résultat final AVANT de comprendre le processus
   - Coup de cœur → puis explication

3. **Tuer les objections avant qu'elles n'arrivent**
   - Prix total visible dès le début (~150-250€)
   - Délai affiché partout (2-3 semaines)
   - "Pas plus cher qu'une robe Sézane"

4. **Rendre l'unicité tangible**
   - "Ce tissu : 3 mètres disponibles. Assez pour 1 seule robe."
   - Photo du rouleau réel, pas un rendu parfait
   - Compteur de stock visible

5. **Ludique > Procédural**
   - Pas un formulaire en 6 étapes
   - Un espace de jeu où on essaie, on swap, on compare
   - Inspiration Tinder/Instagram (swipe, like, save)

### 3.2 Le shift mental clé

| Mode Couturière (Creator) | Mode Lifestyle (Consumer) |
|---------------------------|---------------------------|
| "Quel patron ?" | "Quelle occasion ?" |
| "Quelle matière ?" | "Où vas-tu le porter ?" |
| "Combien de métrage ?" | "Comment tu te sens dedans ?" |
| Effort de projection | Immersion immédiate |
| Processus linéaire | Jeu de personnalisation |

### 3.3 Vocabulaire

| Terme technique | Terme Consumer |
|-----------------|----------------|
| Deadstock | Tissu unique / de créateur |
| Métrage | Quantité nécessaire |
| Patron | Modèle |
| Textile | Tissu |
| Fiber / Matière | "Doux", "Fluide", "Léger" |
| Weave / Armure | Texture |
| Artisan / Couturier | Créateur local |

---

## 4. Architecture du Parcours

### 4.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                      LANDING CONSUMER                               │
│                "Je veux un vêtement unique"                         │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┬───────────────┐
            ▼               ▼               ▼               ▼
    ┌───────────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐
    │ 🎨 BROWSE     │ │ 🔮 AIDE   │ │ 🔗 J'AI   │ │ 🔍 RECHERCHE  │
    │ Je scroll     │ │ MOI       │ │ VU UN     │ │ Je sais ce    │
    │ et je vois    │ │ Analyse   │ │ TRUC      │ │ que je veux   │
    │               │ │ mon style │ │ Web clip  │ │               │
    └───────┬───────┘ └─────┬─────┘ └─────┬─────┘ └───────┬───────┘
            │               │             │               │
            └───────────────┴──────┬──────┴───────────────┘
                                   │
                                   ▼
            ┌─────────────────────────────────────────────┐
            │           DRESSING ROOM VIRTUEL             │
            │   Essayage + Swap tissu + Comparaison       │
            └───────────────────────┬─────────────────────┘
                                    │
                                    ▼
            ┌─────────────────────────────────────────────┐
            │              FINALISATION                   │
            │   [Stock immédiat]  ou  [Personnalisé]      │
            └─────────────────────────────────────────────┘
```

### 4.2 Les 3 phases du parcours

| Phase | Objectif | Émotion visée |
|-------|----------|---------------|
| **DÉCOUVERTE** | Trouver l'inspiration | Émerveillement, désir |
| **JEU** | Personnaliser, essayer | Amusement, appropriation |
| **ACTION** | Commander | Confiance, excitation |

### 4.3 Structure des routes

```
/atelier                          # Landing Consumer
├── /browse                       # Feed de looks
├── /aide                         # Les 4 options d'aide
│   ├── /instagram               # Connexion Instagram
│   ├── /marques                 # Sélection marques préférées
│   ├── /inspirations            # Comptes à suivre
│   └── /quiz                    # Quiz rapide style
├── /clip                         # Web clipper / upload image
├── /recherche                    # Recherche par contexte
│   └── /avancee                 # Fallback technique (filtres)
├── /dressing                     # Dressing Room virtuel
│   └── /[lookId]                # Un look spécifique
├── /favoris                      # Mes looks sauvegardés
├── /commander                    # Finalisation
│   ├── /stock                   # Achat immédiat (styliste)
│   └── /personnalise            # Commande custom (artisan)
└── /mes-projets                  # Suivi commandes
```

---

## 5. Les 4 Portes d'Entrée

### 5.1 🎨 BROWSE — "Je scroll et je vois"

**Pour qui** : Utilisateur sans idée précise, mode flânerie

**Principe** : Feed de looks pré-générés façon Pinterest/Instagram

**Filtres disponibles**
- Type : Robes, Hauts, Pantalons, Jupes, Vestes
- Occasion : Quotidien, Soirée, Bureau, Événement
- Ambiance : Naturel, Minimaliste, Romantique, Audacieux
- Budget : Curseur 100€ - 300€

**Comportement**
- Scroll infini
- Coup de cœur → entre dans le Dressing Room avec ce look
- Social proof : nombre de "j'adore" affiché
- Chaque look = 1 modèle + 1 tissu pré-combinés

### 5.2 🔮 AIDE-MOI — "Analyse mon style"

**Pour qui** : Utilisateur qui veut des suggestions personnalisées

**4 méthodes proposées :**

| Méthode | Description | Complexité |
|---------|-------------|------------|
| **Instagram** | Connexion OAuth, analyse 50 posts | Haute |
| **Marques** | Sélection marques préférées → mapping style | Moyenne |
| **Inspirations** | 2-3 comptes Instagram à analyser | Moyenne |
| **Quiz** | 5 images, choix intuitif, 30 sec | Faible |

**Output commun** : Feed personnalisé + badge "Sélectionné pour toi"

### 5.3 🔗 J'AI VU UN TRUC — "Web Clipper"

**Pour qui** : Utilisateur qui a repéré un vêtement ailleurs

**Principe** : Analyser une référence externe pour proposer des alternatives uniques

**Input acceptés**
- URL de produit (Sézane, Zara, etc.)
- Upload image
- Extension navigateur (V2)

**Analyse effectuée**
- Vision IA : détection silhouette, couleur, style
- Matching avec modèles disponibles
- Sélection de tissus compatibles

**Bonus** : Suggestions de sites à explorer pour continuer à clipper

### 5.4 🔍 RECHERCHE — "Je sais ce que je veux"

**Pour qui** : Utilisateur avec une idée claire

#### Niveau 1 : Recherche par contexte (défaut)

**Critères**
- Type de vêtement : Robe, Haut, Pantalon, Jupe, Veste
- Occasion : Quotidien, Soirée, Bureau, Événement
- Ambiance : Naturel, Minimaliste, Romantique, Audacieux

**Mapping invisible** : Contexte → attributs techniques tissus

| Contexte | Tissus suggérés |
|----------|-----------------|
| Quotidien + Naturel | Lin lavé, coton texturé |
| Soirée + Audacieux | Viscose satinée, jacquard |
| Bureau + Minimaliste | Laine légère, coton structuré |

#### Niveau 2 : Recherche technique (fallback)

Accessible via "Mode expert" — Réutilise les filtres existants de la partie Creator :
- Matière (lin, coton, viscose, laine)
- Couleur (palette)
- Motif (uni, rayures, fleurs)
- Largeur, prix/mètre

---

## 6. Le Dressing Room Virtuel

### 6.1 Concept

Un **espace de jeu** où l'utilisateur peut :
- Voir un look (modèle + tissu) sur un mannequin
- Changer le tissu en un clic (swap)
- Changer le mannequin (morphologie)
- Comparer ses favoris
- Partager pour avoir des avis

**Inspirations UX** : Configurateur Tesla, The Sims, filtres Instagram

### 6.2 Fonctionnalités clés

#### Swap de tissu intelligent

L'utilisateur ne choisit pas parmi 200 tissus. On lui propose des **directions** :
- "Plus clair" → 3 suggestions dans les tons clairs
- "Plus chaud" → 3 suggestions tons chauds
- "Plus audacieux" → 3 suggestions couleurs vives
- "Avec motifs" → 3 suggestions à motifs compatibles

Chaque suggestion = regénération IA (~10 sec)

#### Choix du mannequin

Options de morphologie : S, M, L, XL
Permet de mieux se projeter

#### Essayage personnel (V2)

- Upload d'une photo de soi
- Génération du vêtement sur sa propre image
- Option premium ou après inscription

#### Swipe mode (mobile)

- ← Swipe gauche : tissu suivant
- → Swipe droite : sauvegarder en favoris
- ↑ Swipe haut : voir détails tissu
- ↓ Swipe bas : modèle suivant

### 6.3 Comparaison des favoris

- Vue côte à côte de 2-3 looks sauvegardés
- Partage par WhatsApp / lien / Instagram Story
- "Demande l'avis de tes amies"

---

## 7. Finalisation & Commande

### 7.1 Le choix : Stock vs Personnalisé

Après validation d'un look dans le Dressing Room :

| Option STOCK | Option PERSONNALISÉ |
|--------------|---------------------|
| Chez notre styliste partenaire | Fait pour toi par un artisan |
| Tissu signature | Tissu unique de ton choix |
| Expédié sous 48h | Prêt en 2-3 semaines |
| Tailles S/M/L | À tes mesures |
| ~165€ | ~185€ |

### 7.2 Parcours STOCK

Redirection vers le site du styliste partenaire avec :
- Produit pré-sélectionné
- Code promo Deadstock (tracking + avantage)

### 7.3 Parcours PERSONNALISÉ

**Étape 1 : Choix de la taille**
- Taille standard (36-48) avec ajustement possible
- OU Mensurations personnalisées (guide vidéo 2 min)

**Étape 2 : Choix de l'artisan**
- Recherche géolocalisée
- Profil : photo, spécialités, avis, délai moyen, tarif indicatif
- Sélection

**Étape 3 : Récapitulatif & Paiement**

| Ligne | Prix |
|-------|------|
| Tissu (2.5m de lin bleu) | 58,00 € |
| Patron (Robe Alix - Emma Duval) | 12,00 € |
| Confection (Marie-Claire) | 90,00 € |
| Frais de service Deadstock | 8,00 € |
| **TOTAL** | **168,00 €** |

Paiement Stripe sécurisé

### 7.4 Suivi de projet

Après commande, page "Mes projets" avec :
- Timeline : Commande → Tissu commandé → Tissu reçu → Confection → Essayage → Prêt
- Messages de l'artisan
- Date estimée de livraison
- Bouton "Contacter l'artisan"

---

## 8. Modèle de Données

### 8.1 Nouvelles tables

#### `patterns` (Modèles/Patrons)
```sql
- id, name, slug
- category (dress, top, pants, skirt, jacket)
- occasions[], styles[]
- difficulty (1-3), estimated_hours
- image_flat_url, image_worn_url
- pdf_url, price
- compatible_fibers[], compatible_weights[]
- yardage_by_size (JSONB)
- designer_id, source
```

#### `designers` (Stylistes partenaires)
```sql
- id, name, slug
- bio, avatar_url, website_url
- shop_url, commission_rate
```

#### `artisans` (Couturiers)
```sql
- id, name, slug, bio
- address, city, postal_code, latitude, longitude
- specialties[], categories_accepted[]
- hourly_rate, min_price, max_price
- avg_delay_days, rating, review_count
- email, phone
- is_verified, accepts_new_projects
```

#### `looks` (Combinaisons pré-générées)
```sql
- id
- pattern_id, textile_id
- image_url, image_mannequin_type
- like_count, view_count
- estimated_total_price
- is_featured
```

#### `consumer_projects` (Projets client)
```sql
- id, user_id
- pattern_id, textile_id, artisan_id, look_id
- visualization_url
- size_type, standard_size, custom_measurements
- status (draft → confirmed → in_production → ready → delivered)
- textile_price, pattern_price, artisan_price, total_price
- payment_status, payment_id
- ordered_at, estimated_ready_at, delivered_at
```

#### `artisan_reviews` (Avis)
```sql
- id, artisan_id, user_id, project_id
- rating (1-5), title, content
- photos (JSONB)
```

#### `user_style_profiles` (Profil style)
```sql
- id, user_id
- style_tags[], color_preferences[]
- instagram_analyzed, quiz_completed
- clipped_items (JSONB)
```

### 8.2 Relation avec l'existant

Les tables existantes (`textiles`, `textile_attributes`, `textiles_search`, `sites`) sont **réutilisées telles quelles**. Le module Consumer ajoute une couche par-dessus.

---

## 9. Intégrations Techniques

### 9.1 FASHN API — Génération d'images

**Usage** : Visualisation des looks (modèle + tissu sur mannequin)

**Coûts estimés MVP**
| Action | Coût unitaire | Volume/mois | Total |
|--------|--------------|-------------|-------|
| Pré-génération feed | $0.075 | 500 | $37 |
| Swap tissu temps réel | $0.075 | 2000 | $150 |
| Essayage perso | $0.075 | 500 | $37 |
| **TOTAL** | | | **~$225/mois** |

### 9.2 Instagram API — Analyse de style

**Usage** : Analyser le feed utilisateur pour suggérer des styles
**Alternative** : Demander 5 images manuellement

### 9.3 Vision AI — Analyse d'images clippées

**Usage** : Analyser les vêtements clippés (URL ou upload)
**Options** : Google Cloud Vision, OpenAI Vision, Claude Vision

### 9.4 Géolocalisation — Recherche artisans

**Options** : Google Maps Platform, Mapbox

### 9.5 Paiement — Stripe

Standard Checkout, puis Stripe Connect pour split payment (V2)

---

## 10. Roadmap MVP

### Phase 1 : Feed & Dressing Room (4 semaines)

| Semaine | Livrables |
|---------|-----------|
| 1-2 | Routes, layout, tables, seed 10 patterns, POC FASHN |
| 3-4 | Feed Browse, Dressing Room, swap tissu, favoris |

**Livrable** : Explorer des looks et swapper les tissus

### Phase 2 : Portes d'entrée (3 semaines)

| Semaine | Livrables |
|---------|-----------|
| 5 | Recherche par contexte + fallback technique |
| 6 | Web Clipper (upload + URL) |
| 7 | Quiz express + marques préférées |

**Livrable** : 4 portes d'entrée fonctionnelles

### Phase 3 : Commande (3 semaines)

| Semaine | Livrables |
|---------|-----------|
| 8 | Table artisans, annuaire géolocalisé, profils |
| 9 | Parcours commande, taille, Stripe |
| 10 | Suivi projet, notifications |

**Livrable** : Parcours complet de bout en bout

### Phase 4 : Polish (2 semaines)

Tests utilisateurs, ajustements UX, performance, analytics

**Total : 12 semaines**

---

## 11. Métriques de Succès

### Acquisition
- 1000 visiteurs/mois sur /atelier
- Taux rebond < 60%
- Temps moyen > 3 min

### Engagement
- 5000 looks vus/mois
- 1000 swaps tissu/mois
- 500 favoris sauvegardés
- 200 comptes créés

### Conversion
- Taux visite → favori > 10%
- Taux favori → commande > 5%
- 20 commandes/mois
- Panier moyen 150-200€

### Satisfaction
- NPS > 40
- Note artisans > 4.5/5
- Réclamations < 5%

---

## Annexes

### A. Glossaire

| Terme | Définition |
|-------|------------|
| **Look** | Combinaison modèle + tissu visualisée |
| **Pattern** | Modèle/patron de vêtement |
| **Artisan** | Couturier partenaire |
| **Designer** | Styliste créateur des patrons |
| **Consumer** | Utilisateur final sans compétence couture |
| **Creator** | Utilisateur designer/couturier (parcours existant) |
| **Dressing Room** | Espace d'essayage virtuel |
| **Swap** | Changer le tissu sur un look |
| **Clip** | Capturer une référence externe |

### B. Questions ouvertes

1. Modèle économique patrons : Affiliation ou licence ?
2. Commission artisans : Fixe ou pourcentage ?
3. Essayage "sur moi" : Gratuit ou premium ?
4. Extension navigateur : MVP ou V2 ?
5. Analyse Instagram : Faisable légalement ?

---

*Fin du document — Version 0.1 — 20 Janvier 2026*
