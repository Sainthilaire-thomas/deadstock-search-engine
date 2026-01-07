# ADR-021: Demand-Driven Indexation

**Date**: 2026-01-06
**Status**: Proposé (À implémenter Phase 2+)
**Auteur**: Thomas

---

## Contexte

Les utilisateurs peuvent avoir des besoins de recherche non satisfaits par les textiles déjà en base.

## Décision

Implémenter un système "demand-driven" en deux niveaux :

### Niveau 1 : Recherche initiale

- Interroge les textiles déjà scrappés en base
- Rapide (< 100ms)

### Niveau 2 : Recherche étendue

- Déclenchée si < 10 résultats
- Re-scrape les sources en temps réel
- Cherche nouveautés/mises à jour depuis dernier scraping

### Traitement termes inconnus

1. **Détection** : Terme non trouvé dans le dictionnaire
2. **LLM** : Suggestion automatique avec score de confiance
3. **Remontée admin** : Si confiance < 90%, notification pour validation

## Bénéfices

| Aspect       | Avant                | Après                 |
| ------------ | -------------------- | ---------------------- |
| Scraping     | Planifié aveugle    | Ciblé selon besoins   |
| UX           | "Pas de résultat"   | "On cherche pour vous" |
| Dictionnaire | Enrichi manuellement | Enrichi par usage      |

## Implémentation requise

- [ ] Tracking des recherches utilisateurs
- [ ] API scraping temps réel
- [ ] Intégration LLM (Claude) pour termes inconnus
- [ ] Dashboard admin monitoring recherches
- [ ] Notifications temps réel (WebSocket ou polling)

## Documents liés

- `SPEC_DEMAND_DRIVEN_INDEXATION.md` - Spécification complète

---

**Priorité** : Phase 2+ (après MVP)
