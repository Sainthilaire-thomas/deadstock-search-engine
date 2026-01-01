# ADR 004: Système de Tuning Normalization (Dictionnaire + LLM Fallback)

**Date** : 27 décembre 2025

**Statut** : ✅ Approuvé

**Décideurs** : Thomas (Product Owner & Dev)

**Contexte Phase** : Phase 1 - MVP

---

## Contexte

### Problème Actuel

Après implémentation du premier scraper My Little Coupon, les quality scores sont suboptimaux :

**Données Production (10 textiles)** :

* **Quality score moyen** : ~70%
* **Materials détectés** : 80% (8/10)
* **Colors détectés** : 40% (4/10)

**Cause Racine** :

* Dictionnaires FR→EN incomplets (~20 matériaux, ~15 couleurs)
* Vocabulaire textile très riche : "lilas", "écru", "bouclette", "rayures"
* Chaque nouvelle source = nouveaux termes spécifiques

**Impact Business** :

* UX dégradée (beaucoup d'"unknown")
* Search inefficace (impossible filtrer par material/color inconnu)
* Analytics impossibles (combien de "cotton" si 30% unknown ?)
* Crédibilité professionnelle affectée

**Contraintes** :

* Solo dev (Thomas) → Solution doit être maintenable
* Budget limité → Pas de coûts récurrents élevés
* Scale prévu : 2-5 nouvelles sources (Phase 2-3) → Problème va s'amplifier

---

## Options Évaluées

### Option 1 : Dictionnaire Statique Pur

**Description** : Maintenance manuelle dictionnaires, pas d'IA

**Avantages** :

* ✅ Coût zéro ($0/mois)
* ✅ Contrôle total
* ✅ Déterministe (même input = même output)
* ✅ Latence nulle (1ms)
* ✅ Simple à implémenter

**Inconvénients** :

* ❌ Maintenance continue (enrichir manuellement chaque terme)
* ❌ Scaling difficile (5 sources × 100 termes = 500 mappings à créer)
* ❌ Long à atteindre coverage >95%
* ❌ Pas de suggestions intelligentes

**Verdict** : Viable pour MVP, mais insoutenable long-terme

---

### Option 2 : LLM Temps Réel 100%

**Description** : Chaque normalisation passe par Claude API, pas de dictionnaire

**Avantages** :

* ✅ Zero maintenance dictionnaire
* ✅ S'adapte automatiquement
* ✅ Comprend contexte textile riche
* ✅ Support multi-langue natif

**Inconvénients** :

* ❌ **Coût élevé** : $0.003 × 500 textiles × 30 jours = $45/mois
* ❌ **Latence** : +2-5s par textile (scraping 10× plus lent)
* ❌ **Non-déterministe** : Même input peut varier légèrement
* ❌ Dépendance API externe (single point of failure)

**Verdict** : Trop coûteux et lent pour production

---

### Option 3 : ML Model Custom

**Description** : Fine-tune un modèle spécialisé textile

**Avantages** :

* ✅ Coût ultra-bas après training ($5-10/mois)
* ✅ Rapide (50-100ms)
* ✅ Propriétaire (IP)

**Inconvénients** :

* ❌ **Setup complexe** : Dataset 10k+ exemples, training, hosting
* ❌ **Coût initial élevé** : $500-2000
* ❌ **Maintenance** : Re-training périodique
* ❌ Expertise ML nécessaire

**Verdict** : Prématuré pour MVP, envisageable Phase 6+ si volume justifie

---

### Option 4 : Crowdsourcing Utilisateurs

**Description** : Les users corrigent les unknowns via interface

**Avantages** :

* ✅ Coût zéro
* ✅ Expertise réelle designers
* ✅ Engagement community

**Inconvénients** :

* ❌ Besoin masse critique users (pas dispo MVP)
* ❌ Quality variable
* ❌ Spam/vandalism possible
* ❌ Long à démarrer

**Verdict** : Interessant Phase 4+, pas viable MVP

---

### Option 5 : Hybrid - Dictionnaire + LLM Fallback ✅

**Description** : Dictionnaire pour termes connus (fast path), LLM fallback pour unknowns (slow path)

**Architecture** :

```
1. Try Dictionnaire (exact + regex) → 85-95% coverage, 1ms, $0
   ↓ Miss?
2. LLM Fallback temps réel → 5-15% coverage, 2s, $0.003
   ↓
3. Log unknown pour review humaine asynchrone
   ↓
4. Supervision hebdomadaire : Humain + LLM enrichissent dictionnaire
   ↓
5. Tests non-régression avant déploiement
```

**Avantages** :

* ✅ **Coût optimisé** : $7/mois mois 1 → $2/mois mois 3 (vs $45/mois)
* ✅ **Latence acceptable** : 85% instantané, 15% lent (acceptable scraping background)
* ✅ **Quality haute** : LLM couvre 100% unknowns immédiatement
* ✅ **Auto-amélioration** : Coverage augmente automatiquement
* ✅ **Maintenable solo dev** : Review 30 min/semaine
* ✅ **Déterministe progressif** : Dict croît, LLM calls décroissent
* ✅ **Tests non-régression** : Zéro régression qualité

**Inconvénients** :

* ⚠️ Complexité système (dictionnaire + LLM + supervision)
* ⚠️ Dépendance API Claude (mitigation: fallback manual si API down)

**Verdict** : ✅ **Meilleur compromis** coût/qualité/maintenance

---

## Décision

### ✅ Adopter Option 5 : Dictionnaire + LLM Fallback + Supervision Asynchrone

**Architecture Retenue** :

#### A. Production (Scraping Temps Réel)

```typescript
function normalize(text: string) {
  // 1. Fast path: Dictionnaire
  const dictResult = tryDictionary(text);
  if (dictResult) return dictResult; // 85% des cas, 1ms, $0
  
  // 2. Slow path: LLM fallback
  const llmResult = await callClaude(text); // 15% des cas, 2s, $0.003
  logUnknown(text, llmResult); // Pour review
  return llmResult;
}
```

#### B. Supervision Asynchrone (1-2×/semaine)

1. Review unknowns accumulés (batch)
2. LLM suggère mappings en masse
3. Humain approve/reject/edit
4. Update dictionnaires
5. Tests non-régression
6. Deploy si OK

#### C. Amélioration Continue

* Coverage augmente automatiquement
* Coûts LLM décroissent naturellement
* Quality scores progressent

---

## Rationale Détaillée

### 1. Pourquoi Pas Dictionnaire Seul ?

**Problème MVP** : 70% quality inacceptable pour lancement

* Impossible filtrer par material/color si 30% unknown
* Users perdent confiance ("ce moteur ne comprend rien")

**Solution** : LLM fallback garantit 100% coverage immédiatement

* MVP lancé avec quality 95%+
* Enrichissement dictionnaire en parallèle

---

### 2. Pourquoi Pas LLM 100% ?

**Coût** : $45/mois insoutenable early-stage

* Budget alloué infrastructure : $50/mois total
* LLM seul = 90% du budget

**Latence** : Scraping 500 textiles = 16 minutes vs 2 minutes

* Quotidien = OK
* Mais scale 5 sources = 80 minutes (trop)

**Non-déterminisme** : Tests difficiles, analytics faussés

---

### 3. Pourquoi Hybrid = Sweet Spot ?

**Mois 1** :

* Coverage dictionnaire : 85%
* LLM fallback : 15%
* Coût : $7/mois
* Quality : 95%

**Mois 3** (après enrichissement) :

* Coverage dictionnaire : 97%
* LLM fallback : 3%
* Coût : $2/mois
* Quality : 98%

**ROI** :

* Investment initial : 6h dev (setup système)
* Économie mensuelle : $43/mois vs LLM pur
* ROI : Rentabilisé en 2 semaines

---

### 4. Supervision Humaine Essentielle

**Pourquoi pas auto-learning 100% ?**

* Risque erreurs propagées (garbage in, garbage out)
* Vocabulaire textile nuancé (ex: "écru" ≠ "beige" ≠ "cream")
* Humain apporte expertise métier

**Effort requis** :

* 30 min/semaine review 20-50 termes
* Acceptable solo dev

---

## Conséquences

### Positives ✅

1. **Quality Immédiate**
   * MVP launch avec 95%+ quality
   * Aucun unknown visible users
2. **Coûts Maîtrisés**
   * $7/mois → $2/mois (décroissant)
   * vs $45/mois LLM pur
3. **Maintenance Soutenable**
   * 30 min/semaine supervision
   * Pas de dette technique
4. **Scalabilité**
   * Nouvelles sources : Coverage temporairement baisse mais LLM couvre
   * Puis enrichissement progressif dictionnaire
5. **Déterminisme Croissant**
   * Plus dict croît, plus système devient prédictible
   * Tests/analytics fiables
6. **Learning Loop**
   * Système s'améliore automatiquement
   * LLM apprend de validations humaines (futur)

---

### Négatives ⚠️

1. **Complexité Système**
   * 3 composants : Dictionnaire + LLM + Supervision
   * vs Dictionnaire seul (simple)
   * **Mitigation** : Docs complètes, tests robustes
2. **Dépendance API Claude**
   * Si API down → Fallback manual temporaire
   * **Mitigation** : Retry logic, failover strategy
3. **Effort Setup Initial**
   * 6h dev vs 3h dictionnaire seul
   * **Acceptable** : Investment one-time
4. **Latence Variable**
   * 85% rapide (1ms), 15% lent (2s)
   * **Acceptable** : Scraping background, pas real-time

---

### Risques Identifiés

#### Risque 1 : Coûts LLM Explosent

**Scénario** : Coverage dict reste bas (70%), coûts ne baissent pas

**Probabilité** : Faible (pattern normal = coverage croît avec usage)

**Mitigation** :

* Monitoring coûts weekly
* Alert si >$15/mois
* Fallback mode "manual review" si budget dépassé

---

#### Risque 2 : LLM Suggestions Mauvaises

**Scénario** : LLM traduit "lilas" → "purple" mais devrait être "lilac"

**Probabilité** : Moyenne (nuances textile)

**Mitigation** :

* **Human review obligatoire** avant ajout dictionnaire
* Pas d'auto-apply sans validation
* Tests non-régression détectent regressions

---

#### Risque 3 : Maintenance Négligée

**Scénario** : Thomas oublie de review unknowns pendant 1 mois

**Probabilité** : Moyenne (solo dev busy)

**Impact** : Coverage dict stagne, coûts ne baissent pas

**Mitigation** :

* Email reminder hebdomadaire
* Dashboard visible stats unknowns
* Process léger (30 min max)

---

## Roadmap Implémentation

### Phase 1 : MVP Dictionnaire (Cette semaine - 4h)

**Objectif** : Quality 70% → 80% sans LLM

**Livrables** :

* Dictionnaire exact matches (JSON)
* Table `unknown_terms`
* Fonction normalize avec logging
* Script CLI review

**Résultat** : Fondations en place

---

### Phase 2 : LLM Fallback (Semaine 2 - 3h)

**Objectif** : Quality 80% → 95%

**Livrables** :

* Service `normalize-realtime.ts` avec LLM
* Claude API integration
* Enhanced logging
* Monitoring coûts

**Résultat** : 100% coverage

---

### Phase 3 : Interface Supervision (Semaine 2-3 - 1 jour)

**Objectif** : Workflow efficace

**Livrables** :

* Page `/admin/tuning`
* Batch LLM suggestions
* Approve/reject/edit
* Auto-update dictionnaire

**Résultat** : Review 50 termes en 20 min

---

### Phase 4 : Tests Non-Régression (Semaine 3 - 3h)

**Objectif** : Zéro régression

**Livrables** :

* Script `test-regression.ts`
* Snapshot system
* Change detection
* Rollback capability

**Résultat** : Confiance totale updates

---

### Phase 5 : Regex Patterns (Phase 3 projet - 2 jours)

**Objectif** : Coverage 95% → 98%

**Livrables** :

* Support regex dictionnaires
* UI création patterns
* Priority matching

---

### Phase 6 : Prompt Tuning (Phase 4+ - Continu)

**Objectif** : Amélioration continue

**Livrables** :

* Prompt editable UI
* A/B testing
* Analytics accuracy

---

## Métriques Succès

### Quality Scores

**Cibles Phase 1** :

* Overall quality : 95%+
* Materials detected : 95%+
* Colors detected : 90%+

**Cibles Mois 3** :

* Overall quality : 98%+
* Materials detected : 98%+
* Colors detected : 95%+

---

### Coûts

**Cibles** :

* Mois 1 : <$10/mois
* Mois 3 : <$3/mois
* Mois 6 : <$2/mois

---

### Maintenance

**Cibles** :

* Temps review : <30 min/semaine
* Unknowns backlog : <20 termes
* Response time unknowns : <7 jours

---

### Coverage Dictionnaire

**Cibles** :

* Mois 1 : 85%+
* Mois 3 : 95%+
* Mois 6 : 98%+

---

## Alternatives Futures

### Si Volume Justifie (Phase 6+)

**Option** : Migrer vers ML Model Custom

**Trigger** :

* Volume >5000 textiles/jour
* Coûts LLM >$50/mois malgré coverage élevé

**ROI** :

* Investment training : $1-2k
* Économie mensuelle : $40-50/mois
* Rentabilisé en 2-3 mois

---

### Si Community Grandit (Phase 4+)

**Option** : Ajouter crowdsourcing layer

**Trigger** :

* 500+ users actifs
* Engagement élevé

**Bénéfice** :

* Expertise collective designers
* Vocabulaire spécialisé (ex: "shibori", "ikat")

---

## Validation

### Critères Acceptation

**Cette décision est validée si** :

* ✅ Système implémenté et testé
* ✅ Quality scores >95%
* ✅ Coûts <$10/mois mois 1
* ✅ Maintenance <30 min/semaine
* ✅ Tests non-régression passent

**Révision nécessaire si** :

* ❌ Coûts >$20/mois après 3 mois
* ❌ Quality <90% malgré tuning
* ❌ Maintenance >2h/semaine

---

## Références

* **Architecture Technique** : `docs/technical/TUNING_SYSTEM.md`
* **Guide Workflow** : `docs/guides/tuning-workflow.md` (à créer)
* **Claude API Docs** : https://docs.anthropic.com/
* **Normalization Dictionary** : `src/lib/scraping/common/dictionaries/`

---

## Historique Révisions

| Date       | Version | Changements        |
| ---------- | ------- | ------------------ |
| 2025-12-27 | 1.0     | Décision initiale |

---

**Statut** : ✅ **APPROUVÉ**

**Prochaine Action** : Implémenter Phase 1 (dictionnaire MVP)

**Owner** : Thomas

**Révision** : Mois 3 (évaluer si objectifs atteints)
