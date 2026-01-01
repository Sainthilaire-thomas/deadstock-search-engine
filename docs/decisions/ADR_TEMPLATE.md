# ADR [NUMBER]: [TITRE DE LA DÉCISION]

**Date** : [YYYY-MM-DD]

**Statut** : [Proposé | Accepté | Rejeté | Déprécié | Remplacé par ADR-XXX]

**Décideurs** : [Noms ou rôles]

**Contexte Phase** : [Phase du projet concernée]

---

## Contexte

Décrivez le contexte dans lequel cette décision doit être prise. Quel problème essayons-nous de résoudre ? Quelles sont les contraintes ?

**Exemple** :
"Nous devons choisir une architecture de base de données pour le MVP. Le projet nécessite de stocker des informations sur des textiles provenant de multiples sources avec des formats hétérogènes. Nous avons besoin d'une recherche performante et d'une flexibilité pour l'évolution future."

---

## Décision

Quelle est la décision prise ?

**Exemple** :
"Nous allons utiliser une approche hybride pour la base de données : commencer avec un schéma simplifié (table `textiles` unique) pour le MVP, avec une architecture permettant une migration progressive vers un modèle normalisé (tables séparées `materials`, `stock_lots`, `suppliers`) lors de phases ultérieures."

---

## Options Considérées

Liste des alternatives évaluées.

### Option 1 : [NOM OPTION]

**Description** : Brève description de l'option

**Avantages** :

* Avantage 1
* Avantage 2
* Avantage 3

**Inconvénients** :

* Inconvénient 1
* Inconvénient 2
* Inconvénient 3

**Coût/Complexité** : [Faible | Moyen | Élevé]

---

### Option 2 : [NOM OPTION]

**Description** : Brève description de l'option

**Avantages** :

* Avantage 1
* Avantage 2

**Inconvénients** :

* Inconvénient 1
* Inconvénient 2

**Coût/Complexité** : [Faible | Moyen | Élevé]

---

### Option 3 : [NOM OPTION] (Si applicable)

...

---

## Rationale (Justification)

Pourquoi cette décision spécifique ? Quels sont les critères de sélection ?

**Exemple** :
"L'option hybride (Option 2) a été choisie pour les raisons suivantes :

1. **Time-to-Market** : Le schéma simplifié permet de développer et lancer le MVP rapidement (gain de 2-3 semaines vs schéma normalisé complexe)
2. **Suffisance pour MVP** : Pour valider le concept avec 2 sources et 500+ textiles, la dénormalisation est acceptable et performante
3. **Path d'évolution clair** : L'architecture prévoit explicitement la migration future, avec des champs et une structure permettant la transition
4. **Réduction du risque** : Évite l'over-engineering avant validation du concept. Si le produit ne trouve pas son marché, moins de temps perdu sur architecture complexe.

Les options rejetées :

* Option 1 (Normalisée dès MVP) : Over-engineering prématuré, complexité non justifiée
* Option 3 (Fully dénormalisée sans plan) : Tech debt trop importante, refactoring futur très coûteux"

---

## Conséquences

### Positives

* Conséquence positive 1
* Conséquence positive 2

### Négatives

* Conséquence négative 1 (et comment on la mitigue)
* Conséquence négative 2 (et comment on la mitigue)

### Neutres

* Impact neutre 1
* Impact neutre 2

---

## Implémentation

Comment cette décision sera-t-elle mise en œuvre ?

**Actions Concrètes** :

* [ ] Action 1 (responsable, deadline)
* [ ] Action 2 (responsable, deadline)
* [ ] Action 3 (responsable, deadline)

**Fichiers Affectés** :

* `database/schema.sql`
* `lib/supabase-client.ts`
* Autres fichiers si applicable

---

## Validation

Comment saurons-nous que cette décision est bonne ?

**Critères de Succès** :

* Critère mesurable 1
* Critère mesurable 2
* Critère mesurable 3

**Métriques à Surveiller** :

* Métrique 1 : [Valeur cible]
* Métrique 2 : [Valeur cible]

**Conditions de Révision** :

* Si [condition], alors reconsidérer cette décision
* Review prévu à [date/phase]

---

## Références

### Documents Liés

* `docs/project/PROJECT_OVERVIEW.md` (section X)
* `docs/state/TECH_STACK.md`
* Autres ADRs : ADR-XXX

### Ressources Externes

* Lien 1 : [Article ou documentation]
* Lien 2 : [Best practices]

### Discussions

* Chat IA session [date] : [lien ou résumé]
* Éventuellement : GitHub discussion, Slack thread, etc.

---

## Notes Additionnelles

Toute autre information pertinente qui ne rentre pas dans les sections précédentes.

---

## Historique des Révisions

| Date       | Changement             | Auteur |
| ---------- | ---------------------- | ------ |
| YYYY-MM-DD | Création initiale     | [Nom]  |
| YYYY-MM-DD | Mise à jour section X | [Nom]  |

---

**Template Version** : 1.0

**Inspiré de** : Architecture Decision Records (ADR) standard
