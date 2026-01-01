# 📅 PHASES - Roadmap Détaillée (Version 2.0)

**Dernière MAJ** : 28 décembre 2024

**Durée Totale** : 18 mois

**Phases** : 6 phases majeures

---

## 🎯 Vue d'Ensemble

```
Phase 1: MVP Search Engine            [M1-M3] ✅ EN COURS
Phase 2: Design Tools Essentiels      [M4-M6]
Phase 3: Marketplace & Pro Tools       [M6-M9]
Phase 4: Collaboration & Business      [M9-M12]
Phase 5: Impact & Community            [M12-M15]
Phase 6: Advanced & Scale              [M15-M18]
```

---

## 🏗️ PHASE 1 : MVP Search Engine

**Durée** : 12 semaines

**Mois** : M1-M3

**Statut** : 🚧 En cours (95% complété)

**Focus** : Moteur de recherche textile deadstock fiable

### Objectifs Détaillés

1. **Scraping Multi-Sources**
   * My Little Coupon (Shopify API) ✅
   * The Fabric Sales (REST API custom)
   * Extraire : nom, type, composition, quantité, prix, URL, images
2. **Normalisation Données**
   * Mapping FR→EN automatique
   * Dictionnaire materials, colors, patterns
   * Interface admin tuning ✅
   * Quality normalization >85%
3. **Base de Données**
   * Tables : textiles, unknown_terms, dictionary_mappings ✅
   * Index recherche full-text
   * Système unités (m, kg, yards)
4. **Interface Recherche**
   * Page recherche simple
   * Filtres : type, composition, couleur, quantité, prix
   * Tri résultats
   * Affichage grille/liste
5. **Déploiement**
   * Vercel (frontend) ✅
   * Supabase (backend + DB) ✅
   * Cron scraping quotidien

### Livrables

* [X] Architecture Light DDD complète
* [X] Scripts scraping MLC fonctionnel
* [ ] Scraper TFS opérationnel
* [X] Base données avec 10+ textiles
* [X] Interface admin tuning avec images
* [ ] Interface recherche publique
* [X] Documentation technique

### KPIs

* 2-3 sources actives
* >500 textiles en base
* Taux succès scraping >90%
* Quality normalization >85%
* Recherche <500ms

---

## 🎨 PHASE 2 : Design Tools Essentiels

**Durée** : 8 semaines

**Mois** : M4-M6

**Focus** : Accompagner le parcours design avec outils professionnels

### Objectifs Détaillés

1. **Calculateur Métrage Intelligent**
   * Input : Patron (taille, pièces) + quantité unités
   * Calcul métrage exact + marges couture/erreur
   * Prise en compte sens tissu, motifs répétés
   * Support formats : robe, jupe, pantalon, chemise
2. **🆕 Import Patron PDF/Image** ⭐ KILLER FEATURE
   * Upload patron PDF (Vogue, Burda, perso)
   * IA extrait pièces + dimensions automatiquement
   * OCR dimensions
   * Calcul métrage instantané
   * Magic moment différenciateur
3. **Solutions Alternatives Tissu Insuffisant**
   * Tissu pas assez de métrage disponible ?
   * Propose 3-5 équivalents proches
   * Matching : matière + couleur + texture + prix
   * Scoring similarité
4. **Nuancier Interactif**
   * Explorer gamme couleurs (roue chromatique)
   * Filtrer textiles par nuance
   * Palettes harmonieuses (complémentaires, analogues)
   * Tendances couleurs saison
5. **Trouver Tissu Assorti**
   * Input : Tissu déjà choisi/acheté
   * Output : Textiles coordonnés (couleur/matière)
   * Suggestions combinaisons (ex: coton + lin coordonnés)
   * Preview visuelle combinaisons
6. **Mood Board & Collections**
   * Créer collections textiles (nommer, organiser)
   * Drag & drop textiles
   * Visualiser combinaisons
   * Partager avec clients (lien public)
   * Export présentation (PDF/image)

### Livrables

* [ ] Calculateur métrage fonctionnel (5+ types vêtements)
* [ ] 🆕 Import patron PDF/image avec IA OCR
* [ ] Système suggestions alternatives (ML model)
* [ ] Nuancier interactif roue chromatique
* [ ] Feature "trouver assorti" avec scoring
* [ ] Mood board tool avec partage

### KPIs

* Utilisation calculateur >60% users premium
* Taux succès import patron >85%
* Satisfaction suggestions alternatives >70%
* Mood boards créés : 100+/mois
* Partages mood boards : 50+/mois

---

## 💼 PHASE 3 : Marketplace & Pro Tools

**Durée** : 12 semaines

**Mois** : M6-M9

**Focus** : Workflow complet designer + sourcing avancé

### Objectifs

1. **Marketplace Inversée**
   * Designers postent besoins textiles spécifiques
   * Formulaire structuré : matière, couleur, quantité, budget, délai
   * Matching automatique avec inventaire existant
   * Notifications fournisseurs (email + in-app)
   * Contact direct designer ↔ fournisseur (chat/email)
   * Tracking demandes : en cours, matched, complétées
2. **🆕 Réservation Temporaire 72h** ⭐
   * Designer trouve tissu mais hésite
   * Bouton "Réserver 72h" bloque stock
   * Countdown visible
   * Évite frustration rupture pendant réflexion
   * Système gestion réservations côté fournisseur
   * Notifications expiration (24h avant)
3. **🆕 Générateur Devis Instantané** ⭐
   * Sélection textiles projet
   * Input : Infos client, deadlines
   * PDF devis pro automatique
   * Logo + branding designer
   * Métrage détaillé par textile
   * Prix breakdown clair (textiles + main d'œuvre si fournie)
   * Conditions générales
   * Envoi direct client (email)
4. **Gestion Projets Design**
   * Créer projet : nom, type (collection/pièce unique), client
   * Associer textiles + accessoires
   * Calculer coûts totaux (textiles + accessoires + MO)
   * Notes & documentation (mood board, specs)
   * Deadlines & milestones
5. **🆕 Timeline Kanban Visuelle**
   * Colonnes personnalisables : Inspiration → Design → Sourcing → Production → Delivery
   * Drag & drop textiles entre colonnes
   * Cartes textiles avec preview image
   * Deadlines automatiques par colonne
   * Alertes retards (email + notif)
   * Vue d'ensemble tous projets (dashboard)
6. **Modération & Trust**
   * Review demandes marketplace avant publication
   * Système rating fournisseurs (intégrité)
   * Anti-spam automatique (ML)
   * Signalement contenus inappropriés

### Livrables

* [ ] Interface post demande marketplace
* [ ] Système matching demande ↔ inventaire (scoring algorithm)
* [ ] 🆕 Réservation 72h fonctionnelle (countdown + notifs)
* [ ] 🆕 Générateur devis PDF branded (templates personnalisables)
* [ ] Gestion projets complète (CRUD projects)
* [ ] 🆕 Timeline Kanban drag & drop (React Beautiful DnD)
* [ ] Dashboard modération admin

### KPIs

* 50+ demandes postées M9
* Taux match demande-inventaire >40%
* 30+ réservations actives simultanément
* 100+ devis générés/mois
* 50+ projets actifs
* Satisfaction projets >80%
* Taux conversion demande → achat : 25%+

---

## 🤝 PHASE 4 : Collaboration & Business Tools

**Durée** : 12 semaines

**Mois** : M9-M12

**Focus** : Professionnalisation + workflow studios

### Objectifs

1. **🆕 Collaboration Équipe** ⭐
   * Designer invite assistant/stagiaire/collègue (email)
   * Partage projets spécifiques
   * Permissions granulaires :
     - View (lecture seule)
     - Edit (modifier projets)
     - Buy (passer commandes)
     - Admin (gérer équipe)
   * Commentaires sur textiles/projets
   * Mentions @user
   * Historique modifications (audit log)
   * Workflow studios design (approval flows)
2. **🆕 Comparateur Prix Deadstock vs Neuf** ⭐
   * Afficher prix deadstock actuel
   * Base de données prix textiles neufs (scraping/API)
   * Calculer prix équivalent neuf
   * Afficher économie (€ et %)
   * Impact CO2 économisé (kg)
   * Graphique visuel comparaison
   * Argument commercial client ("Économie 57%")
3. **🆕 Simulateur Coût Projet Complet**
   * Input : Type vêtement, quantité, complexité
   * Estimer automatiquement :
     - Textiles (choisis ou moyennes marché par catégorie)
     - Accessoires (boutons, zip, doublure - base de données prix)
     - Main d'œuvre (heures estimées × taux horaire fourni)
     - Frais généraux (%, optionnel)
     - Marge souhaitée (%, optionnel)
   * Output : Prix de vente conseillé
   * Breakdown détaillé coûts
   * Viabilité projet (marge vs industrie)
   * Export PDF simulation
4. **Historique & Réappro Avancé**
   * Tous achats historisés automatiquement
   * Filtres : date, fournisseur, projet, textile
   * Analyse dépenses par projet
   * Graphiques dépenses mensuelles
   * Alertes stocks bas (pour designers avec stock perso)
   * Suggestions réapprovisionnement automatique
   * 🆕 Alertes restocks favoris (push notifs)
5. **Reviews & Ratings Fournisseurs**
   * Après achat : inviter à noter
   * Noter qualité produit (1-5⭐)
   * Noter service (délai, communication, emballage)
   * Upload photos produit reçu vs attendu
   * Commentaire textuel
   * Reviews agrégées par fournisseur
   * Scores moyens affichés (trust badges)
   * Modération reviews (anti-spam)

### Livrables

* [ ] 🆕 Système collaboration équipe (invitations, roles, permissions)
* [ ] 🆕 Comparateur prix avec calcul économies + CO2
* [ ] 🆕 Simulateur coûts complet (base données prix accessoires)
* [ ] Historique achats enrichi (analytics, graphiques)
* [ ] Système reviews fournisseurs (notation + photos)
* [ ] Alertes restocks intelligentes (email + push)

### KPIs

* 30+ équipes actives (studios/marques)
* Users collaborateurs : 100+
* Utilisation comparateur >70% users
* 200+ simulations coûts/mois
* 100+ reviews publiées
* Taux renouvellement premium >75%
* NPS >50

---

## 🌱 PHASE 5 : Impact Environnemental & Communauté

**Durée** : 12 semaines

**Mois** : M12-M15

**Focus** : Durabilité mesurée + communauté active

### Objectifs

1. **Calculateur Impact Environnemental**
   * Base de données impact textile neuf (CO2, eau, chemicals)
   * Sources : Higg Index, études scientifiques
   * CO2 économisé vs textile neuf (kg CO2e)
   * Eau économisée (litres)
   * Déchets évités (kg textiles)
   * Méthodologie transparente (docs publics)
   * Impact par projet
   * Impact cumulé utilisateur
2. **🆕 Générateur Certificats Durabilité** ⭐
   * PDF branded pour client final designer
   * Template personnalisable (couleurs, logo)
   * Contenu :
     - Nom projet/collection
     - Textiles deadstock utilisés (liste détaillée)
     - Impact CO2 économisé (kg)
     - Eau économisée (litres)
     - Badges éco-responsables ("100% deadstock", "50 kg CO2 saved")
   * Graphiques visuels impact
   * QR code vers landing page projet
   * Export PDF/PNG
   * Outil marketing designer ("Prouvez votre démarche")
3. **Dashboard Impact Personnel**
   * Impact cumulé utilisateur depuis inscription
   * Graphiques évolution mensuelle
   * Comparaison vs moyenne communauté
   * Badges achievements :
     - "First ton CO2 saved"
     - "Water warrior - 10K liters"
     - "Deadstock pioneer - 50 projects"
   * Leaderboard communauté (opt-in)
   * Partage social (Twitter, LinkedIn, Instagram)
   * Gamification (points, niveaux)
4. **Feed Tendances & Inspiration**
   * Tendances textiles durables (trimestre/saison)
   * Palettes couleurs saison (Pantone, WGSN inspirées)
   * Showcases projets designers (portfolio public opt-in)
   * Études de cas détaillées (process créatif)
   * Interviews designers (vidéo/texte)
   * Best practices sourcing deadstock
   * Blog SEO (articles invités)
5. **Communauté & Networking**
   * Discord/Forum dédié designers durables
   * Channels : #inspiration, #help, #showcases, #marketplace
   * Partage projets réalisés (photos, descriptions)
   * Feedback communauté
   * Mise en relation designers ↔ fournisseurs
   * Events virtuels (webinars, workshops)
   * Meetups locaux (Paris, Lyon, etc.)

### Livrables

* [ ] Calculateur CO2/eau intégré (base données Higg Index)
* [ ] 🆕 Générateur certificats PDF (templates personnalisables)
* [ ] Dashboard impact utilisateur (graphiques, badges)
* [ ] Système badges/achievements (15+ badges)
* [ ] Feed tendances actif (2+ articles/semaine)
* [ ] Communauté lancée (Discord + forum)
* [ ] 20+ showcases projets designers
* [ ] 5+ events virtuels organisés

### KPIs

* Impact communiqué : 100+ tonnes CO2, 1M+ litres eau
* Engagement features impact >60%
* 300+ certificats générés/mois
* 500+ membres communauté actifs
* 100+ projets showcasés
* 10+ events avec 50+ participants chacun
* Satisfaction communauté >80%
* Retention M12 >70%

---

## 🚀 PHASE 6 : Advanced Features & Scale

**Durée** : 12 semaines

**Mois** : M15-M18

**Focus** : Features avancées + scaling infrastructure

### Objectifs

1. **🆕 Bibliothèque Échantillons Personnelle**
   * Designer scanne/photo échantillons physiques reçus
   * OCR extraction metadata (composition si visible)
   * Tag manuel : projet, fournisseur, date réception, notes
   * Recherche organisée : "échantillon rouge projet été 2024"
   * Organisation librairie physique optimisée
   * QR codes générés pour étiquettes physiques
   * Lien échantillon → textile marketplace (si match)
   * Historique échantillons commandés
2. **🆕 Intégration Stocks Propres**
   * Designer indexe stock personnel (chutes, restes projets précédents)
   * Formulaire ajout manuel : textile, quantité, localisation physique
   * Import CSV/Excel (pour stocks importants)
   * Photos stock perso
   * Recherche mixte : marketplace publique + stock personnel
   * Priorisation stock perso dans résultats
   * Message : "Vous avez déjà 2m de ce tissu en stock !"
   * Alertes utilisation stock avant achat neuf
   * Gestion inventaire (tracking usage, mise à jour quantités)
3. **🆕 Groupage Commandes (Buy Together)**
   * Textile nécessite quantité minimum (ex: 50m) > besoin individuel
   * Plateforme propose groupage entre designers
   * Board "Groupage en cours" : textiles + quantité recherchée
   * Designers rejoignent groupage
   * Atteinte objectif → commande groupée lancée
   * Coordination livraison (centrale puis dispatch)
   * Shipping costs partagés
   * Chat groupe participants
4. **🆕 Marketplace Accessoires Deadstock**
   * Extension au-delà textiles :
     - Boutons vintage/deadstock
     - Fermetures éclair
     - Rubans, dentelles
     - Fournitures mercerie durables
   * Scraping sources accessoires
   * Recherche dédiée accessoires
   * Matching accessoires ↔ textiles (suggestions auto)
   * One-stop-shop complet designer
5. **Historique Prix & Tendances Marché**
   * Tracking prix textiles over time (12 mois)
   * Graphique évolution prix par catégorie
   * Alertes prix : "Soie au prix le plus bas depuis 6 mois"
   * Prédiction tendances (ML sur historique)
   * Meilleur moment pour acheter (scoring)
   * Analyse saisonnalité (ex: laine moins chère été)
6. **API Publique & Intégrations**
   * REST API complète documentée (OpenAPI)
   * Endpoints : search, filters, details, projects
   * Authentication OAuth2 + API keys
   * Rate limiting par tier (Starter/Pro/Enterprise)
   * Webhooks événements (nouveau textile matching critères)
   * SDKs : JavaScript, Python
   * Intégrations tierces :
     - Adobe Creative Suite (plugin)
     - Figma (plugin recherche textiles)
     - Notion (database sync)
     - Zapier/Make
7. **Optimisations Performance & Scale**
   * CDN assets (Cloudflare)
   * Redis caching layer
   * Database query optimization (indexes, partitioning)
   * Search ElasticSearch/Algolia (full-text perf)
   * Load testing (10K+ concurrent users)
   * Auto-scaling infrastructure
   * Monitoring APM (Datadog/New Relic)
   * Uptime >99.9%

### Livrables

* [ ] 🆕 Bibliothèque échantillons (scan + tag + search)
* [ ] 🆕 Stock personnel (ajout + search mixte)
* [ ] 🆕 Groupage commandes (board + chat + coordination)
* [ ] 🆕 Marketplace accessoires (3+ sources)
* [ ] Historique prix (tracking + graphiques + alertes)
* [ ] API publique documentée (OpenAPI spec)
* [ ] 2+ intégrations tierces (Adobe/Figma)
* [ ] Webhooks fonctionnels
* [ ] Infrastructure scalable (load testing passed)
* [ ] Monitoring complet (dashboard admin)

### KPIs

* 100+ designers utilisent bibliothèque échantillons
* 50+ designers indexent stock perso
* 10+ groupages commandes réussis
* 1000+ accessoires catalogués
* 15+ clients API actifs (€5K MRR API)
* 2+ intégrations tierces live
* Uptime >99.9%
* Search latency p95 <200ms
* Page load <2s
* 2000+ designers actifs
* €25K MRR total
* €200K+ GMV facilité
* 200+ tonnes CO2 économisées (impact cumulé)

---

## 📊 Récapitulatif Timeline

| Phase | Mois      | Focus Principal                 | Livrables Clés                                             | Killer Features ⭐              |
| ----- | --------- | ------------------------------- | ---------------------------------------------------------- | ------------------------------ |
| 1     | M1-M3     | MVP Search                      | 2-3 sources, tuning, interface                             | Interface admin tuning         |
| 2     | M4-M6     | Design Tools                    | Calculateur, nuancier, mood board                          | Import patron PDF ⭐            |
| 3     | M6-M9     | Marketplace & Pro               | Marketplace inversée, projets, timeline                    | Réserve 72h, Devis pro ⭐       |
| 4     | M9-M12    | Collaboration & Business        | Équipe, comparateur prix, simulateur                       | Collaboration, Comparateur ⭐   |
| 5     | M12-M15   | Impact & Community              | CO2 tracker, certificats, communauté                       | Certificats durabilité ⭐       |
| 6     | M15-M18   | Advanced & Scale                | Échantillons, stock perso, accessoires, API                | Biblio échantillons, API ⭐     |

---

## 🎯 Milestones Majeures

### M3 : MVP Launch ✅
* 2-3 sources, interface tuning, 50+ beta users, quality >85%

### M6 : Design Tools Complete
* Calculateur + import patron, nuancier, mood board, 200+ users

### M9 : Marketplace & Workflow
* Marketplace inversée, devis pro, projets + timeline, 500+ users

### M12 : Professional Platform
* Collaboration équipe, simulateur coûts, reviews, €10K MRR

### M15 : Impact & Community
* Certificats durabilité, communauté active 500+, €15K MRR

### M18 : Scale & Maturity
* 2000+ designers, 15+ sources, API, €25K MRR, reconnaissance secteur

---

## 🎯 Métriques Succès Globales (M18)

### Usage
* 2000+ designers actifs
* 10,000+ recherches/jour
* 500+ projets actifs
* 70%+ retention M6

### Business
* €25K MRR
* €200K+ GMV facilité
* 30%+ conversion free → premium
* <10% churn mensuel

### Impact
* 200+ tonnes CO2 économisées
* 2M+ litres eau économisés
* 50K+ kg textiles sauvés
* 1000+ projets durables créés

### Quality
* 15+ sources agrégées
* 50,000+ textiles catalogués
* Quality normalization >95%
* Uptime >99.9%
* NPS >50

---

## 📝 Notes Planification

### Flexibilité
* Phases 4-6 sont modulables selon feedback et priorités business
* Phases 1-3 sont critiques et séquentielles (foundations)
* Features peuvent être déplacées entre phases si nécessaire

### Parallélisation
* Certaines features peuvent se développer en parallèle (ex: Impact + API)
* Veille à ne pas surcharger roadmap (solo dev limitations)

### Ressources
* Phases 1-3 : Solo dev possible (focus produit)
* Phases 4-6 : Considérer aide/freelance pour accélération (design, dev, content)

### Ajustements
* Review après chaque phase : metrics, feedback users
* Pivot possible si certaines features ne trouvent pas product-market fit
* Prioriser features avec meilleur ratio impact/effort

---

**Prochaine Action** : Finaliser Phase 1 (MVP Search Engine) → M3  
**Next Review** : Fin Phase 1 - Planification détaillée Phase 2
