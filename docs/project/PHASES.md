# 📅 PHASES - Roadmap Détaillée

**Dernière MAJ** : 27 décembre 2025

**Durée Totale** : 13 mois

**Phases** : 12 phases + 1 phase de conception

---

## 🎯 Vue d'Ensemble

```
Phase 0: Conception                    [ACTUELLE]
Phase 1-3: MVP & Foundation            [Mois 1-3]
Phase 4-6: Monétisation & Scale        [Mois 4-6]
Phase 7-9: Advanced Features           [Mois 7-9]
Phase 10-12: Impact & AI               [Mois 10-13]
```

---

## 📋 PHASE 0 : Conception & Planification

**Durée** : 2-3 semaines (pré-développement)

**Statut** : 🚧 En cours (80% complété)

### Objectifs

* ✅ Spécifications fonctionnelles complètes
* ✅ Architecture technique définie
* 🚧 Design base de données finalisé
* ⏳ Maquettes/wireframes interface

### Livrables

* [X] Document spécifications fonctionnelles
* [X] Architecture technique Next.js/Supabase
* [ ] Schéma base de données avec migrations
* [ ] Wireframes interface recherche
* [ ] Plan de scraping Recovo + MLC

### Critères de Succès

* Documentation technique complète et validée
* Architecture approuvée et prête pour développement
* Design DB optimisé pour MVP et évolution future

---

## 🏗️ PHASE 1 : MVP - Data Aggregation Basique

**Durée** : 4 semaines

**Mois** : M1

**Focus** : Premier scraping + base de données + déploiement

### Objectifs Détaillés

1. **Scraping Recovo**
   * Parser page de listing textiles
   * Extraire : nom, type, composition, quantité, prix, URL
   * Stockage en base brut puis normalisé
2. **Scraping My Little Coupon**
   * Parser structure différente de Recovo
   * Même données cibles
   * Système de normalisation
3. **Base de Données**
   * Création tables : materials, suppliers, stock_lots
   * Index de recherche
   * Système unités (m, kg, yards, etc.)
4. **Interface Minimale**
   * Page de recherche simple
   * Liste de résultats
   * Filtres basiques (type, composition)
5. **Déploiement**
   * Vercel (frontend)
   * Supabase (backend + DB)
   * Cron scraping quotidien

### Livrables

* [ ] Scripts scraping Recovo + MLC fonctionnels
* [ ] Base données avec 500+ textiles
* [ ] Interface recherche déployée
* [ ] Documentation technique de scraping

### KPIs

* 2 sources actives
* > 500 textiles en base
  >
* Taux succès scraping >90%
* Recherche <500ms

---

## 📊 PHASE 2 : Standardisation & Qualité Données

**Durée** : 3 semaines

**Mois** : M1-M2

**Focus** : Normalisation robuste + validation données

### Objectifs

1. **Système de Normalisation**
   * Unités standardisées (m, m², kg)
   * Mapping terminologie (coton/cotton, etc.)
   * Détection et correction erreurs
2. **Qualité des Données**
   * Validation des champs requis
   * Détection doublons
   * Système de scoring qualité
   * Alertes données manquantes
3. **Search Enhancement**
   * Full-text search PostgreSQL
   * Synonymes textiles
   * Recherche floue (typos)

### Livrables

* [ ] Moteur de normalisation testé
* [ ] Système de validation automatique
* [ ] Documentation mapping terminologie
* [ ] Recherche avec synonymes

### KPIs

* Précision normalisation >95%
* Détection erreurs automatique >80%
* Temps recherche <300ms

---

## 🎨 PHASE 3 : UI/UX & Fonctionnalités Utilisateur

**Durée** : 3 semaines

**Mois** : M2-M3

**Focus** : Interface designer-friendly + features utilisateur

### Objectifs

1. **Interface Avancée**
   * Design professionnel
   * Filtres multi-critères
   * Tri résultats (prix, quantité, date)
   * Vue grille/liste
2. **Fonctionnalités Utilisateur**
   * Création compte
   * Favoris/wishlist
   * Historique recherches
   * Alertes nouveaux textiles
3. **Pages Détail**
   * Fiche textile complète
   * Lien vers source originale
   * Suggestions similaires

### Livrables

* [ ] Interface redesignée et responsive
* [ ] Système auth + profils utilisateurs
* [ ] Features favoris + alertes
* [ ] Pages détail textiles

### KPIs

* Time to first search <10s
* Bounce rate <40%
* Session duration >3min

---

## 💰 PHASE 4 : Monétisation - Freemium

**Durée** : 3 semaines

**Mois** : M4

**Focus** : Système premium + paiements

### Objectifs

1. **Tiers Gratuit/Premium**
   * Gratuit : 10 recherches/jour, résultats limités
   * Premium : illimité, alertes, export
2. **Intégration Paiements**
   * Stripe integration
   * Abonnements mensuels/annuels
   * Gestion billing
3. **Dashboard Premium**
   * Statistiques utilisation
   * Alertes personnalisées
   * Export CSV/Excel

### Livrables

* [ ] Système freemium implémenté
* [ ] Paiements Stripe fonctionnels
* [ ] Page pricing + checkout
* [ ] Dashboard utilisateur premium

### KPIs

* Conversion free → premium >5%
* Churn <10%/mois
* MRR objectif : €500 M4

---

## 🔌 PHASE 5 : API Professionnelle

**Durée** : 4 semaines

**Mois** : M5

**Focus** : API publique pour intégrations pro

### Objectifs

1. **REST API Publique**
   * Endpoints search, filters, details
   * Documentation OpenAPI
   * Rate limiting par tier
2. **Authentication & Sécurité**
   * API keys
   * OAuth2 (optionnel)
   * Monitoring usage
3. **Plans API**
   * Starter : 1K req/mois
   * Pro : 10K req/mois
   * Enterprise : illimité

### Livrables

* [ ] API REST complète documentée
* [ ] Dashboard API keys
* [ ] Système rate limiting
* [ ] Page API docs publique

### KPIs

* 5+ clients API à M6
* Uptime API >99.5%
* Latency p95 <500ms

---

## 🔄 PHASE 6 : Marketplace Inversé (Beta)

**Durée** : 4 semaines

**Mois** : M6

**Focus** : Designers peuvent poster besoins

### Objectifs

1. **Système de Demandes**
   * Designers postent besoins textiles
   * Formulaire structuré
   * Matching avec fournisseurs
2. **Notifications Fournisseurs**
   * Alertes demandes pertinentes
   * Contact direct designer
   * Tracking leads
3. **Modération**
   * Review demandes avant publication
   * Système de rating
   * Anti-spam

### Livrables

* [ ] Interface post demande
* [ ] Système matching demande-inventaire
* [ ] Notifications fournisseurs
* [ ] Dashboard modération

### KPIs

* 20+ demandes postées M6
* Taux de match >30%
* 5+ transactions facilitées

---

## 📈 PHASE 7 : Scale Data Sources

**Durée** : 5 semaines

**Mois** : M7-M8

**Focus** : Ajouter 3-5 nouvelles sources

### Objectifs

1. **Nouvelles Sources**
   * Identifier 3-5 plateformes majeures
   * Développer scrapers
   * Intégration base de données
2. **Système Multi-Source Robuste**
   * Gestion priorités sources
   * Fallback si source down
   * Détection changements structure
3. **Monitoring & Alertes**
   * Dashboard statut scrapers
   * Alertes breakages automatiques
   * Logs détaillés

### Livrables

* [ ] 5 sources actives minimum
* [ ] 2000+ textiles en base
* [ ] Monitoring dashboard scrapers
* [ ] Documentation ajout nouvelle source

### KPIs

* 5-7 sources agrégées
* Volume base x3
* Uptime scraping >95%

---

## 🤖 PHASE 8 : Features IA - Suggestions Design

**Durée** : 5 semaines

**Mois** : M8-M9

**Focus** : IA pour recommandations basées sur matériaux

### Objectifs

1. **Système de Recommandations**
   * Input : brief design ou image
   * Output : textiles compatibles
   * ML model basique (embeddings)
2. **Mood Board Generator**
   * Upload références visuelles
   * Suggestions textiles similaires
   * Combinaisons proposées
3. **Integration API IA**
   * Claude API ou autre LLM
   * Prompt engineering
   * Caching résultats

### Livrables

* [ ] Feature suggestions basée matériaux
* [ ] Mood board tool
* [ ] API interne IA
* [ ] Documentation features IA

### KPIs

* Utilisation features IA >40% users premium
* Satisfaction suggestions >70%

---

## 🌱 PHASE 9 : Impact Environnemental

**Durée** : 4 semaines

**Mois** : M9-M10

**Focus** : Mesure impact CO2/eau économisés

### Objectifs

1. **Calculateur Impact**
   * CO2 économisé vs textile neuf
   * Eau économisée
   * Déchets évités
2. **Badges & Gamification**
   * Impact cumulé utilisateur
   * Badges "Eco warrior"
   * Leaderboard communauté
3. **Reporting**
   * Dashboard impact personnel
   * Rapport trimestriel global
   * Données pour marketing

### Livrables

* [ ] Calculateur CO2/eau intégré
* [ ] Dashboard impact utilisateur
* [ ] Système de badges
* [ ] Rapport impact global Q1

### KPIs

* Impact communiqué : X tonnes CO2, Y litres eau
* Engagement features impact >50%

---

## 🚀 PHASE 10 : Optimisations Performance

**Durée** : 3 semaines

**Mois** : M10-M11

**Focus** : Speed, scale, reliability

### Objectifs

1. **Performance Database**
   * Index optimisés
   * Caching Redis
   * Query optimization
2. **Frontend Optimization**
   * Lazy loading
   * Image optimization
   * Bundle size reduction
3. **Infrastructure**
   * CDN pour assets
   * Load testing
   * Scaling strategy

### Livrables

* [ ] Recherche <200ms p95
* [ ] Page load <2s
* [ ] Infrastructure auto-scaling
* [ ] Documentation performance

### KPIs

* Search latency <200ms p95
* Page load <2s
* Uptime >99.9%

---

## 🔗 PHASE 11 : Intégrations & Partenariats

**Durée** : 4 semaines

**Mois** : M11-M12

**Focus** : Partenariats sources + intégrations tierces

### Objectifs

1. **Partenariats API Officiels**
   * Négocier accès API direct avec 2-3 fournisseurs
   * Remplacer scraping par API
   * Données temps réel
2. **Intégrations Outils Design**
   * Plugins Adobe/Figma (exploration)
   * Export vers outils métier
   * Webhooks pour intégrations
3. **Programme Partenaires**
   * Onboarding fournisseurs
   * Dashboard partenaire
   * Conditions commerciales

### Livrables

* [ ] 2+ partenariats API formels
* [ ] Plugin ou intégration tierce
* [ ] Programme partenaires documenté
* [ ] 3+ fournisseurs inscrits programme

### KPIs

* 2-3 API officielles actives
* Latency données temps réel <100ms
* 5+ partenaires inscrits

---

## 📚 PHASE 12 : Documentation & Community

**Durée** : 4 semaines

**Mois** : M12-M13

**Focus** : Scaling communauté + ressources éducatives

### Objectifs

1. **Centre de Ressources**
   * Guides mode durable
   * Best practices sourcing
   * Études de cas designers
2. **Communauté**
   * Forum/Discord designers
   * Showcase projets réalisés
   * Networking designers-fournisseurs
3. **Marketing de Contenu**
   * Blog SEO
   * Newsletter
   * Social media strategy

### Livrables

* [ ] Hub ressources (20+ articles)
* [ ] Communauté lancée (Discord/forum)
* [ ] 10+ études de cas
* [ ] Content marketing plan 6 mois

### KPIs

* 100+ membres communauté actifs
* Traffic organique blog >1K/mois
* 3+ mentions presse/blogs spécialisés

---

## 📊 Récapitulatif Timeline

| Phase | Mois    | Focus Principal | Livrables Clés      |
| ----- | ------- | --------------- | -------------------- |
| 0     | Pré-M1 | Conception      | Specs, Architecture  |
| 1     | M1      | MVP Data        | 2 sources, Interface |
| 2     | M1-M2   | Normalisation   | Qualité données    |
| 3     | M2-M3   | UI/UX           | Features utilisateur |
| 4     | M4      | Monétisation   | Freemium + Stripe    |
| 5     | M5      | API Pro         | API publique         |
| 6     | M6      | Marketplace     | Demandes designers   |
| 7     | M7-M8   | Scale Sources   | 5+ sources           |
| 8     | M8-M9   | IA              | Suggestions design   |
| 9     | M9-M10  | Impact          | CO2/eau tracking     |
| 10    | M10-M11 | Performance     | Speed + scale        |
| 11    | M11-M12 | Partenariats    | API officielles      |
| 12    | M12-M13 | Community       | Ressources + forum   |

---

## 🎯 Milestones Majeures

### M3 : MVP Launch

* 2 sources, interface fonctionnelle, 50+ beta users

### M6 : Monetization Live

* Freemium + API, premiers revenus, marketplace beta

### M9 : Feature Complete

* IA, impact tracking, 5+ sources, 500+ users

### M13 : Scale & Maturity

* 10+ sources, communauté active, reconnaissance secteur

---

## 📝 Notes Planification

### Flexibilité

* Phases 7-12 sont modulables selon feedback et priorités
* Phases 1-6 sont critiques et séquentielles

### Parallélisation Possible

* Phases 7-8 peuvent partiellement se chevaucher
* Phase 12 peut commencer dès M6 (content marketing)

### Ressources

* Phases 1-6 : solo dev possible
* Phases 7-12 : considérer aide/freelance pour accélération

---

**Prochaine Action** : Finaliser Phase 0, lancer Phase 1
