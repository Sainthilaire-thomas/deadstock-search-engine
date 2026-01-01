# ADR-011: Admin-Driven Scraping Strategy

**Date**: 29 Décembre 2024  
**Status**: Proposed  
**Deciders**: Thomas, Claude  
**Context**: Phase 2 Multi-Sources Strategy

---

## Context

### Current Situation

**Approche actuelle** : Scraping opportuniste et aveugle
- Scraper sites "qui marchent" techniquement
- Fetch tous produits sans discrimination
- Pas de contrôle granulaire
- Pas de priorisation
- Maintenance non planifiée

### Problem Statement

> **"On ne peut pas négocier des APIs avec les plateformes tant qu'on n'a pas de traction, donc on doit scraper au début. Mais scraper au hasard n'est pas souhaitable pour construire une base de qualité."**

**Tensions identifiées** :
1. 🎯 **Quality vs Volume** : Beaucoup de produits bas qualité vs peu de produits haute qualité
2. ⚙️ **Control vs Automation** : Automatiser tout vs contrôler précisément
3. 📊 **Resources** : Bandwidth, rate limits, temps admin limités
4. 🔄 **Maintenance** : Comment garder data fraîche sans sur-scraper
5. 🤝 **Future Partnerships** : Besoin traction pour négocier APIs

---

## Decision

**Nous adoptons une stratégie Admin-Driven Intelligent Scraping** :

### Principe Central

> **"L'administrateur contrôle précisément quoi, quand, et comment scraper via une interface de gestion, permettant de construire une base qualitative sans gaspillage."**

### Composantes Clés

**1. Discovery Before Scraping**
- Analyser structure site avant scraping complet
- Identifier collections pertinentes
- Évaluer quality score
- Estimer coût/bénéfice

**2. Configuration Granulaire**
- Par site : refresh frequency, rate limits
- Par collection : max products, filters
- Par produit : critères qualité

**3. Preview Mode**
- Scraper échantillon (10 produits) first
- Admin review quality
- Décision : Continue ou Adjust

**4. Quality-First Approach**
- Filtres qualité appliqués
- Métriques suivies
- Alerts si dégradation

**5. Maintenance Contrôlée**
- Scheduled scraping configurable
- Pas de refresh aveugle
- Bulk operations pour efficiency

---

## Rationale

### Pourquoi Admin-Driven ?

**1. Quality > Quantity**
- 1,000 produits haute qualité > 10,000 produits médiocres
- Meilleure UX utilisateur final
- Meilleure démo pour partnerships

**2. Resource Efficiency**
- Éviter scraping inutile (mercerie, boutons, etc.)
- Respecter rate limits intelligemment
- Optimiser bandwidth

**3. Flexibility**
- S'adapter à chaque site (tous différents)
- Tester et ajuster config
- Évolution progressive

**4. Control**
- Admin voit ce qui est scrapé
- Décisions basées sur data
- Pas de "black box"

**5. Scalability Path**
```
MVP : Admin manuel → Prove quality approach
     ↓
Growth : Templates + Best practices
     ↓
Scale : Automation + AI recommendations
     ↓
Partnerships : Remplacer scraping par APIs
```

---

## Alternatives Considered

### Alternative 1 : Scraping Aveugle Massif

**Approche** :
- Scraper tous sites trouvés
- Fetch tous produits disponibles
- Filtrer post-scraping
- Automatiser tout

**Pros** :
- ✅ Volume élevé rapidement
- ✅ Pas d'effort admin
- ✅ Simple à implémenter

**Cons** :
- ❌ Beaucoup de bruit (non-textiles)
- ❌ Quality variable
- ❌ Rate limiting risks
- ❌ Bandwidth waste
- ❌ Maintenance nightmare

**Verdict** : ❌ Rejeté - Volume ≠ Value

---

### Alternative 2 : Fully Automated avec ML

**Approche** :
- ML identifie collections pertinentes
- Auto-config scraping optimal
- Auto-quality filtering
- Zero admin intervention

**Pros** :
- ✅ Scalable infiniment
- ✅ Pas d'effort admin
- ✅ Smart filtering

**Cons** :
- ❌ Complexité technique élevée
- ❌ ML training data needed
- ❌ Erreurs difficiles à debug
- ❌ Over-engineering pour MVP
- ❌ Perte de contrôle

**Verdict** : ⏳ Futur (Phase 4+) - Trop tôt maintenant

---

### Alternative 3 : API-First (Wait for Partnerships)

**Approche** :
- Ne pas scraper du tout
- Négocier APIs d'abord
- Build uniquement avec APIs officielles

**Pros** :
- ✅ Légal, stable
- ✅ Quality garantie
- ✅ Support officiel
- ✅ Pas de rate limits

**Cons** :
- ❌ Impossible sans traction
- ❌ Chicken-egg problem
- ❌ Lent (négociations longues)
- ❌ Pas de MVP possible

**Verdict** : ❌ Rejeté - Besoin traction first

---

### Alternative 4 : Hybrid Community-Driven

**Approche** :
- Designers soumettent sites
- Community vote priorités
- Scraping basé sur demande

**Pros** :
- ✅ Product-market fit assuré
- ✅ Community engagement
- ✅ Crowd-sourced curation

**Cons** :
- ❌ Besoin users first (chicken-egg)
- ❌ Lent au démarrage
- ❌ Quality control complexe

**Verdict** : ⏳ Futur (Phase 3) - Complément pas remplacement

---

## Decision : Admin-Driven (Hybrid Approach)

**Chosen** : Alternative 5 (pas listée ci-dessus)

**Admin-Driven Intelligent** = Meilleur des mondes :
- ✅ Quality control (vs aveugle)
- ✅ Flexibility (vs ML auto)
- ✅ Faisable maintenant (vs API-first)
- ✅ Human judgment (vs full auto)
- ⏳ Path to automation (templates → ML later)

---

## Consequences

### Positives

**1. Quality Database**
- High-quality products dès le début
- Meilleure démo partnerships
- Better UX pour early users

**2. Resource Efficiency**
- Pas de bandwidth waste
- Rate limits respectés
- Focus sur ROI élevé

**3. Learning Loop**
- Admin apprend ce qui marche
- Itération rapide
- Best practices émergent

**4. Scalability Path Clear**
```
Phase 1 : Admin manuel (MVP)
Phase 2 : Templates + presets
Phase 3 : Smart recommendations
Phase 4 : ML automation
Phase 5 : APIs partnerships
```

**5. Control Maintained**
- Admin voit toujours ce qui se passe
- Peut intervenir si problème
- Trust in data

---

### Negatives

**1. Time Investment**
- Admin doit configurer chaque site
- Pas "set and forget"
- Effort initial élevé

**Mitigation** :
- UI intuitive avec smart defaults
- Templates pour sites similaires
- Preview mode réduit erreurs

---

**2. Scalability Limit**
- Admin humain = bottleneck
- Max 50-100 sites raisonnables

**Mitigation** :
- Focus quality pas quantity (MVP)
- Path to automation claire
- Hire admin assistant si besoin

---

**3. Expertise Required**
- Admin doit comprendre scraping
- Décisions techniques nécessaires

**Mitigation** :
- Documentation extensive
- Tooltips/help contextuel
- Support chat

---

**4. Maintenance Burden**
- Sites changent (structure, URLs)
- Config doit être updated

**Mitigation** :
- Monitoring alerts
- Auto-detect changes (future)
- Scheduled reviews

---

## Implementation Plan

### Phase 1 : MVP Admin Interface (2 semaines)

**Week 1** :
- CRUD Sites
- Discovery basic (Shopify only)
- Manual scraping (one collection)

**Week 2** :
- Multi-collections
- Filters config
- Preview mode
- Jobs history

### Phase 2 : Production Ready (1 semaine)

- Real-time progress monitoring
- Dashboard stats
- Quality metrics
- Error handling robust

### Phase 3 : Scale Support (1 semaine)

- Scheduled scraping
- Bulk operations
- Templates/presets
- Smart recommendations

**Total : 4 semaines**

---

## Success Metrics

**MVP Success** (3 months) :
- 15 sites configured
- 5,000+ products high quality
- Quality score avg > 75%
- Admin time < 2h/week maintenance

**Growth Success** (6 months) :
- 50 sites active
- 20,000+ products
- Quality maintained > 75%
- 5+ partnerships discussions

**Scale Success** (12 months) :
- Replace scraping with APIs (50%+ products)
- Automation handles 80% config
- Admin intervention only edge cases

---

## Risks & Mitigations

### Risk 1 : Admin Bottleneck

**Scenario** : Trop de sites, admin overwhelmed

**Probability** : Medium  
**Impact** : High

**Mitigation** :
- Prioritization framework (quality score)
- Templates réduisent config time
- Hire assistant si > 30 sites
- Path to automation (Phase 3-4)

---

### Risk 2 : Sites Change Structure

**Scenario** : Shopify structure change, scraping breaks

**Probability** : Low  
**Impact** : High

**Mitigation** :
- Monitoring alerts
- Graceful degradation
- Fallback strategies
- Version adapters

---

### Risk 3 : Rate Limiting

**Scenario** : Sites bloquent malgré précautions

**Probability** : Medium  
**Impact** : Medium

**Mitigation** :
- Preview mode test limits
- Configurable delays
- Rotating IPs (if needed)
- Partnerships discussions

---

### Risk 4 : Quality Regression

**Scenario** : Quality score drop over time

**Probability** : Medium  
**Impact** : Medium

**Mitigation** :
- Trends tracking (dashboard)
- Alerts si drop > 10%
- Auto-suggest re-config
- Regular admin review

---

## Future Evolution

### Phase 4 : Automation (M6-M9)

**ML-Assisted Configuration** :
- Analyze successful configs
- Recommend optimal settings new sites
- Auto-detect collections relevance
- Predict quality score

### Phase 5 : Partnerships (M9-M12)

**API Transition** :
- Replace scraping with official APIs
- Maintain scraping pour long tail
- Hybrid approach : APIs + scraping

**Negotiations Arguments** :
```
"Nous avons:
- 10,000+ recherches/mois sur vos produits
- Traffic qualifié vers votre site
- Analytics sur demandes designers
  
En échange:
- API officielle
- Real-time updates
- Partnership visibility"
```

### Phase 6 : Community (M12+)

**User-Generated** :
- Designers submit sites
- Community votes priorities
- Crowdsourced curation
- Reviews & ratings

---

## References

### Related Documents
- SPECS/ADMIN_SCRAPING_MANAGEMENT.md (Functional Spec)
- ADR-009 Internationalization
- ADR-010 Dynamic Attributes

### External Resources
- Shopify API documentation
- Scrapy best practices
- Rate limiting strategies

---

## Stakeholders

**Primary** : Thomas (Admin, Product Owner)  
**Secondary** : Future designers (End users)  
**Tertiary** : Platforms partenaires

---

## Review & Approval

**Status** : ⏳ Awaiting Thomas Review

**Questions for Thomas** :
1. Admin time commitment acceptable ? (2h/week maintenance)
2. Quality > Volume priority confirmed ?
3. 4-week implementation timeline OK ?
4. Phase 4-5 vision aligned ?

---

**Decision Date** : TBD (After Thomas review)  
**Approved By** : TBD  
**Implementation Start** : TBD

---

_ADR-011 créé le 29 Décembre 2024_  
_Version 1.0 - Draft for Review_
