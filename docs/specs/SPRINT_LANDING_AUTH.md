# SPRINT L&A - Landing Page & Authentification

**Version** : 2.0 (Révisé - Basé sur l'existant)  
**Date** : 14 Janvier 2026  
**Priorité** : P0 (Bloquant pour Phase 2)  
**Durée estimée** : 12-15h

---

## 🎯 Objectifs

1. **Landing Page Commerciale** : Convertir les visiteurs en utilisateurs
2. **Système d'Authentification** : Supabase Auth avec email/password + OAuth
3. **Gestion des Rôles** : Utiliser la table `users.role` existante (free/premium/pro/admin)
4. **Protection des Routes** : Middleware + guards

---

## ✅ Ce Qui Existe Déjà (Pas de Changement)

### Structure Routes - On garde `(main)` !
```
src/app/
├── (main)/              # ✅ GARDE TEL QUEL
│   ├── layout.tsx       # Layout existant
│   ├── page.tsx         # À transformer en redirect ou garder
│   ├── search/          # ✅ Existant
│   ├── favorites/       # ✅ Existant  
│   ├── boards/          # ✅ Existant
│   ├── journey/         # ✅ Existant
│   └── textiles/        # ✅ Existant
├── admin/               # ✅ Existant (protéger avec role='admin')
└── api/                 # ✅ Existant
```

### Base de Données - Tables Prêtes !
```sql
-- ✅ deadstock.users EXISTE avec role !
CREATE TABLE deadstock.users (
  id uuid REFERENCES auth.users(id),
  email text NOT NULL UNIQUE,
  full_name text,
  role text DEFAULT 'free' CHECK (role IN ('free', 'premium', 'pro', 'admin')),
  created_at, updated_at
);

-- ✅ user_favorites EXISTE avec user_id !
-- ✅ boards a déjà user_id + session_id (fallback)
-- ✅ projects a déjà user_id + session_id
-- ✅ imported_patterns a déjà user_id + session_id
```

---

## 📐 Architecture Cible (Additions Seulement)

```
src/app/
├── page.tsx                    # 🆕 Landing commerciale (NOUVEAU)
├── pricing/page.tsx            # 🆕 Page tarifs (NOUVEAU)
│
├── (auth)/                     # 🆕 Groupe routes auth (NOUVEAU)
│   ├── layout.tsx              
│   ├── login/page.tsx          
│   ├── signup/page.tsx         
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
│
├── (main)/                     # ✅ EXISTANT - Pas de changement
│   └── ...
│
├── admin/                      # ✅ EXISTANT - Juste ajouter protection
│   └── ...
│
└── api/
    └── auth/
        └── callback/route.ts   # 🆕 OAuth callback (NOUVEAU)
```

### Pas de Migration de Routes !
La structure `(main)` reste identique. On ajoute simplement :
- Landing à la racine
- Routes auth
- Middleware de protection

---

## 🗂️ Sprints Détaillés

### Sprint L1 : Landing Page Commerciale
**Durée** : 5-6h  
**Dépendances** : Aucune

#### L1.1 - Structure et Hero Section (1.5h)
```
Fichier : src/app/page.tsx (NOUVEAU - racine)

Note : Le fichier src/app/(main)/page.tsx existe peut-être déjà.
On crée une NOUVELLE landing à la racine src/app/page.tsx

- [ ] Layout responsive (mobile-first)
- [ ] Navigation sticky avec CTA
- [ ] Hero section :
    - Headline : "Trouvez le textile deadstock parfait"
    - Sous-titre : Value prop cascade 3 niveaux
    - CTA primaire : "Commencer gratuitement"
    - CTA secondaire : "Voir la démo"
    - Visual : Mockup interface recherche
- [ ] Animation subtle (fade-in au scroll)
```

#### L1.2 - Sections Problème/Solution (1h)
```
Fichier : src/app/page.tsx (suite)

- [ ] Section "Le problème" :
    - Pain points designers (icônes + texte)
    - Stats : "10+ sites à parcourir", "70% temps perdu"
- [ ] Section "Notre solution" :
    - 3 cartes cascade (DB → Live → Marketplace)
    - Illustrations/icônes par niveau
```

#### L1.3 - Features & How It Works (1h)
```
- [ ] Section Features (grille 2x3) :
    - Recherche multi-sources
    - Boards design
    - Calculateur métrage
    - Favoris & alertes
    - Impact tracking
    - Export pro
- [ ] Section "Comment ça marche" (3 étapes)
```

#### L1.4 - Social Proof & CTA Final (1h)
```
- [ ] Section métriques :
    - "268+ textiles indexés"
    - "4 sources agrégées"
    - "-70% temps sourcing"
- [ ] Témoignages (placeholders pour l'instant)
- [ ] CTA final avec email capture
- [ ] Footer (liens, légal, réseaux)
```

#### L1.5 - Page Pricing (1h)
```
Fichier : src/app/pricing/page.tsx (NOUVEAU)

- [ ] Tableau comparatif 4 tiers (aligné sur users.role) :
    | Feature          | Free | Premium | Pro    | Enterprise |
    |------------------|------|---------|--------|------------|
    | Recherches/jour  | 10   | ∞       | ∞      | ∞          |
    | Résultats        | 50   | Tous    | Tous   | Tous       |
    | Projets          | 1    | ∞       | ∞      | ∞          |
    | Smart Discovery  | ❌   | 3/jour  | ∞      | ∞          |
    | Équipe           | ❌   | ❌      | 5      | ∞          |
    | Prix             | 0€   | 19€/m   | 49€/m  | Sur devis  |
- [ ] Toggle mensuel/annuel (-20%)
- [ ] CTA par tier
- [ ] FAQ pricing
```

**Livrable** : Landing page complète et page pricing

---

### Sprint L2 : Setup Supabase Auth
**Durée** : 2-3h  
**Dépendances** : Aucune (parallélisable avec L1)

#### L2.1 - Configuration Supabase Auth (1h)
```
Dashboard Supabase → Authentication :

- [ ] Activer Email/Password provider
- [ ] Configurer templates emails :
    - Confirmation inscription (FR)
    - Reset password (FR)
    - Magic link (optionnel)
- [ ] Activer OAuth providers :
    - [ ] Google (prioritaire)
- [ ] Configurer redirect URLs :
    - http://localhost:3000/api/auth/callback
    - https://[ton-domaine]/api/auth/callback (prod)
- [ ] Configurer Site URL
```

#### L2.2 - Enrichir table users existante (30min)
```
Fichier : database/migrations/030_extend_users.sql

La table deadstock.users EXISTE DÉJÀ avec role.
On ajoute juste les champs de limites :

ALTER TABLE deadstock.users
ADD COLUMN IF NOT EXISTS searches_today INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS searches_reset_at DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS live_searches_today INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Trigger reset quotidien (optionnel)
CREATE OR REPLACE FUNCTION reset_daily_searches()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.searches_reset_at < CURRENT_DATE THEN
    NEW.searches_today := 0;
    NEW.live_searches_today := 0;
    NEW.searches_reset_at := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### L2.3 - Trigger création user automatique (30min)
```
Fichier : database/migrations/031_user_creation_trigger.sql

-- Créer automatiquement un user dans deadstock.users
-- quand quelqu'un s'inscrit via auth.users

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO deadstock.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

#### L2.4 - Client Supabase Auth (45min)
```
Fichier : src/lib/supabase/auth.ts (NOUVEAU)

- [ ] Helper signUp(email, password, fullName?)
- [ ] Helper signIn(email, password)
- [ ] Helper signInWithOAuth(provider)
- [ ] Helper signOut()
- [ ] Helper resetPassword(email)
- [ ] Helper getUser() (côté client)
- [ ] Helper getServerUser() (côté serveur avec cookies)
```

**Livrable** : Supabase Auth configuré, table users enrichie

---

### Sprint L3 : Pages Authentification
**Durée** : 4-5h  
**Dépendances** : L2

#### L3.1 - Layout Auth (30min)
```
Fichier : src/app/(auth)/layout.tsx

- [ ] Layout centré, minimal
- [ ] Logo + tagline
- [ ] Background subtle (gradient ou pattern)
- [ ] Responsive mobile
```

#### L3.2 - Page Inscription (1.5h)
```
Fichier : src/app/(auth)/signup/page.tsx

- [ ] Form avec validation (react-hook-form + zod) :
    - Email (validation format)
    - Password (min 8 chars, 1 majuscule, 1 chiffre)
    - Confirm password
    - Checkbox CGU
- [ ] Boutons OAuth (Google, GitHub)
- [ ] Séparateur "ou"
- [ ] Lien vers login
- [ ] Gestion erreurs (email déjà utilisé, etc.)
- [ ] Loading state sur submit
- [ ] Redirect vers confirmation email
```

#### L3.3 - Page Connexion (1h)
```
Fichier : src/app/(auth)/login/page.tsx

- [ ] Form email/password
- [ ] Boutons OAuth
- [ ] Checkbox "Se souvenir de moi"
- [ ] Lien "Mot de passe oublié"
- [ ] Lien vers signup
- [ ] Gestion erreurs (credentials invalides)
- [ ] Redirect vers app après succès
```

#### L3.4 - Pages Password Reset (1h)
```
Fichier : src/app/(auth)/forgot-password/page.tsx
- [ ] Form email uniquement
- [ ] Message succès (check your email)
- [ ] Rate limiting message

Fichier : src/app/(auth)/reset-password/page.tsx
- [ ] Form nouveau password + confirm
- [ ] Validation token URL
- [ ] Redirect vers login après succès
```

#### L3.5 - Callback OAuth (30min)
```
Fichier : src/app/api/auth/callback/route.ts

- [ ] Exchange code for session
- [ ] Création user_profile si nouveau
- [ ] Redirect vers app ou erreur
```

**Livrable** : Flow auth complet fonctionnel

---

### Sprint L4 : Protection Routes & Middleware
**Durée** : 2-3h  
**Dépendances** : L3

#### L4.1 - Middleware Auth (1h)
```
Fichier : src/middleware.ts (NOUVEAU ou enrichir existant)

- [ ] Pattern matcher pour routes :
    
    PROTÉGÉES (auth required) :
    - /(main)/* → redirect login si non auth
    
    ADMIN (auth + role) :
    - /admin/* → redirect si role !== 'admin'
    
    PUBLIQUES :
    - / (landing)
    - /pricing
    - /(auth)/*
    - /api/auth/*

- [ ] Refresh session automatique
- [ ] Redirect vers login si non auth
- [ ] Redirect vers /search si déjà auth (sur /(auth)/*)
```

#### L4.2 - Context Auth Client (1h)
```
Fichier : src/features/auth/context/AuthContext.tsx (NOUVEAU)

- [ ] Provider avec state user + role
- [ ] Hook useAuth() retourne { user, role, isLoading, signOut }
- [ ] Sync avec Supabase onAuthStateChange
- [ ] Loading state initial
```

#### L4.3 - Composants Auth UI (30min)
```
Fichier : src/features/auth/components/UserMenu.tsx (NOUVEAU)
- [ ] Avatar + dropdown
- [ ] Affichage role actuel (badge)
- [ ] Liens : Profil, Paramètres, Déconnexion

Fichier : src/features/auth/components/AuthGuard.tsx (NOUVEAU)
- [ ] HOC pour protection composants inline
- [ ] Fallback loading
```

#### L4.4 - Intégration Layout (main) (30min)
```
Fichier : src/app/(main)/layout.tsx (MODIFIER)

- [ ] Wrapper avec AuthProvider
- [ ] Ajouter UserMenu dans header/navbar existante
- [ ] Garder FavoritesProvider existant
```

**Livrable** : Routes protégées, middleware fonctionnel

---

### Sprint L5 : Intégration Limites par Rôle
**Durée** : 2h  
**Dépendances** : L4

#### L5.1 - Service Limites Utilisateur (45min)
```
Fichier : src/features/auth/services/limitsService.ts (NOUVEAU)

- [ ] Constantes limites par role (aligné sur users.role) :
    const ROLE_LIMITS = {
      free: { searchesPerDay: 10, resultsLimit: 50, projects: 1, liveSearches: 0 },
      premium: { searchesPerDay: Infinity, resultsLimit: Infinity, projects: Infinity, liveSearches: 3 },
      pro: { searchesPerDay: Infinity, resultsLimit: Infinity, projects: Infinity, liveSearches: Infinity },
      admin: { searchesPerDay: Infinity, resultsLimit: Infinity, projects: Infinity, liveSearches: Infinity },
    }
    
- [ ] Fonction checkSearchLimit(userId): { allowed: boolean, remaining: number }
- [ ] Fonction incrementSearchCount(userId)
- [ ] Fonction canUseLiveSearch(userId): boolean
```

#### L5.2 - Intégration API Search (45min)
```
Fichier : src/app/api/search/route.ts (MODIFIER)

- [ ] Récupérer user depuis session (optionnel si non auth)
- [ ] Si auth : vérifier limite recherches
- [ ] Si auth : incrémenter compteur
- [ ] Si free : limiter résultats à 50
- [ ] Header X-Searches-Remaining dans response
```

#### L5.3 - UI Feedback Limites (30min)
```
Fichier : src/components/search/SearchLimitBanner.tsx (NOUVEAU)

- [ ] Banner "X recherches restantes" (free users)
- [ ] CTA "Passer à Premium" quand < 3 restantes
- [ ] Toast quand limite atteinte
```

**Livrable** : Système de limites fonctionnel par role

---

## 📊 Résumé Effort (Révisé)

| Sprint | Durée | Priorité | Dépendances |
|--------|-------|----------|-------------|
| L1: Landing Page | 5-6h | P0 | - |
| L2: Setup Supabase Auth | 2-3h | P0 | - |
| L3: Pages Auth | 3-4h | P0 | L2 |
| L4: Protection Routes | 2-3h | P0 | L3 |
| L5: Limites Rôles | 2h | P1 | L4 |
| **TOTAL** | **14-18h** | | |

**Gain vs V1** : ~4-6h économisées grâce à l'existant !

---

## 🔄 Ordre d'Exécution Recommandé

```
Jour 1 (7h) :
├── L1.1-L1.3 : Landing Hero + Features (3.5h)
├── L2.1-L2.3 : Config Supabase + Migrations (2h)
└── L1.4-L1.5 : Social Proof + Pricing (2h)

Jour 2 (7h) :
├── L2.4 : Client Auth helpers (0.75h)
├── L3.1-L3.5 : Pages Auth complètes (3.5h)
├── L4.1-L4.4 : Middleware + Context + UI (2.5h)
└── L5.1-L5.3 : Limites par rôle (2h)
```

---

## ✅ Critères de Validation

### Sprint L1 ✔
- [ ] Landing accessible à `/` (racine)
- [ ] `/search` toujours accessible via `/(main)/search`
- [ ] Responsive mobile/desktop
- [ ] CTA mènent vers `/signup`
- [ ] Page `/pricing` avec tiers alignés sur `users.role`

### Sprint L2 ✔
- [ ] Signup email fonctionne
- [ ] Email confirmation reçu
- [ ] User créé dans `deadstock.users` automatiquement (trigger)
- [ ] OAuth Google fonctionne

### Sprint L3 ✔
- [ ] Flow complet : inscription → email → confirmation → login
- [ ] Login → redirect vers `/search`
- [ ] Reset password flow complet
- [ ] Erreurs affichées clairement

### Sprint L4 ✔
- [ ] `/search` redirige vers login si non connecté
- [ ] `/login` redirige vers `/search` si déjà connecté
- [ ] `/admin` redirige si `role !== 'admin'`
- [ ] UserMenu affiche avatar et role
- [ ] Déconnexion fonctionne

### Sprint L5 ✔
- [ ] Free user voit "10 recherches restantes"
- [ ] Après 10 recherches → message upgrade
- [ ] Résultats limités à 50 (free)
- [ ] Premium/Pro/Admin → pas de limites

---

## 🎨 Design Guidelines Landing

### Palette (cohérente avec l'app existante)
```css
--primary: #2563eb;        /* Blue 600 - CTA */
--primary-dark: #1d4ed8;   /* Blue 700 - Hover */
--secondary: #10b981;      /* Emerald 500 - Eco/Success */
--background: #fafafa;     /* Gray 50 */
--text: #1f2937;           /* Gray 800 */
```

### Composants
- Utiliser les composants `src/components/ui/*` existants (shadcn/ui)
- Icons : Lucide React (déjà utilisé dans le projet)
- Tailwind CSS (déjà configuré)

---

## 🔐 Sécurité

### Checklist Sécurité Auth
- [ ] HTTPS obligatoire en production
- [ ] CSRF protection (Supabase natif)
- [ ] Rate limiting sur endpoints auth
- [ ] Validation Zod sur tous les inputs
- [ ] Secure cookies (httpOnly, sameSite)
- [ ] Password requirements (min 8 chars)

### RLS Policies Existantes à Vérifier
```sql
-- La table users a déjà une FK vers auth.users
-- Vérifier que les policies RLS sont en place :

-- users : un user ne voit que son profil
CREATE POLICY "Users can view own profile"
ON deadstock.users FOR SELECT
USING (auth.uid() = id);

-- boards : déjà user_id, vérifier policy
CREATE POLICY "Users can view own boards"
ON deadstock.boards FOR SELECT
USING (auth.uid() = user_id OR session_id = current_setting('app.session_id', true));

-- favorites : table user_favorites existe déjà avec user_id
-- La table favorites (avec session_id) peut rester pour le fallback
```

---

## 📝 Notes Techniques

### Cohabitation Sessions Anonymes / Auth

Tu as actuellement un système de sessions anonymes (cookies HTTP-only).
**Stratégie de transition douce** :

1. **Phase actuelle** : Les deux systèmes cohabitent
   - `session_id` pour users non connectés
   - `user_id` pour users connectés
   
2. **Dans boards, favorites, etc.** :
   ```typescript
   // Prioriser user_id si connecté, sinon session_id
   const userId = user?.id;
   const sessionId = getSessionId();
   
   if (userId) {
     // Requête avec user_id
   } else {
     // Fallback session_id (comportement actuel)
   }
   ```

3. **Migration optionnelle future** :
   - Proposer aux users de "récupérer" leurs favoris/boards de session
   - Associer session_id → user_id lors du signup

### Gestion Rôles sans Paiement (MVP)

Pour l'instant, pas de Stripe. Les rôles sont gérés manuellement :
- `free` : par défaut à l'inscription
- `premium`/`pro` : flag manuel en DB (pour beta testers)
- `admin` : flag manuel pour toi

```sql
-- Passer un user en premium manuellement
UPDATE deadstock.users SET role = 'premium' WHERE email = 'beta@tester.com';
```

### Alignement Terminologie

```
PRODUCT_VISION         Table users.role      Sprint
─────────────────      ──────────────────    ──────
Free                   'free'                ✅
Premium (19€/m)        'premium'             ✅
Studio (49€/m)         'pro'                 ✅ (renommé)
Enterprise             Pas en DB encore      Future
Admin                  'admin'               ✅
```

---

## 🚀 Post-Sprint : Prochaines Étapes

Après ce sprint, tu seras prêt pour :
1. **Phase 2 : Smart Discovery** (recherche live - feature premium)
2. **Sprint Stripe** : Paiement et gestion abonnements
3. **Sprint Onboarding** : Wizard première utilisation
4. **Sprint Migration Sessions** : Convertir sessions → users

---

**Sprint créé** : 14 Janvier 2026  
**Version** : 2.0 (Révisé - basé sur existant)  
**Estimation totale** : 14-18h (2 jours dev)  
**Bloquant pour** : Toute feature premium Phase 2+
