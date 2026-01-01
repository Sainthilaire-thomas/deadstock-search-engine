# 🏗️ DÉCISION ARCHITECTURE : Blanche + Deadstock

**Date** : 27 décembre 2025  
**Question** : Comment gérer rationnellement Blanche et Deadstock ensemble ?

---

## 🎯 Résumé Exécutif

**RECOMMANDATION** : **Option 3 - Hybride** (Repos séparés + Supabase partagée)

**Pourquoi** :
- ✅ Simplicité développement (adapté solo dev)
- ✅ Économie $25/mois (une Supabase au lieu de deux)
- ✅ Synergies possibles (auth partagé, vues cross-schema)
- ✅ Flexibilité future (migration monorepo possible)
- ✅ Zéro complexité inutile

---

## 📊 Comparaison Options

| Aspect | Option 1: Séparation | Option 2: Monorepo | **Option 3: Hybride** ✅ |
|--------|---------------------|-------------------|----------------------|
| **Repos Git** | 2 repos séparés | 1 monorepo | 2 repos séparés |
| **Vercel** | 2 projets | 1-2 projets | 2 projets |
| **Supabase** | 2 instances | 1 instance | **1 instance** |
| **Schémas DB** | Séparés | Séparés | **Séparés (public, deadstock)** |
| **Code partagé** | Dupliqué | Packages | Dupliqué (OK pour MVP) |
| **Complexité** | Faible | **Élevée** | **Faible** |
| **Coût/mois** | $50-70 | $25-45 | **$25-45** |
| **Adapté solo** | ✅ Oui | ❌ Non | **✅ Oui** |
| **Synergies** | ❌ Difficiles | ✅ Faciles | **✅ Possibles** |

---

## 🏗️ Architecture Recommandée (Option 3)

### Repositories

```
📁 blanche-ecommerce/           (Repo GitHub 1)
   ├── .git/
   ├── src/
   ├── package.json
   └── vercel.json

📁 deadstock-search-engine/     (Repo GitHub 2)
   ├── .git/
   ├── src/
   ├── scripts/
   ├── docs/
   ├── package.json
   └── vercel.json
```

**Lien** : Aucun lien Git (totalement indépendants)

---

### Vercel Déploiements

```
🚀 Vercel Projet 1: "blanche-ecommerce"
   URL: blanche.vercel.app
   Repo: github.com/thomas/blanche-ecommerce

🚀 Vercel Projet 2: "deadstock-search-engine"
   URL: deadstock-search.vercel.app
   Repo: github.com/thomas/deadstock-search-engine
```

**Déploiements** : Indépendants (bug dans l'un n'affecte pas l'autre)

---

### Supabase Partagée ⭐

```
💾 Instance Supabase: lnkxfyfkwnfvxaxnbah.supabase.co

Schémas:
├── public/                     ← Blanche (products, orders, etc.)
├── deadstock/                  ← Deadstock (textiles, scraping_logs)
└── auth/                       ← Auth partagé (users communs)

Storage:
├── blanche-products/           ← Images Blanche
└── deadstock-textiles/         ← Images Deadstock
```

**Avantage clé** : $25/mois économisé + synergies possibles

---

## 💰 Coûts Comparés

### Option 1 (Séparation Complète)
```
Supabase Blanche:    $25/mois
Supabase Deadstock:  $25/mois
Vercel:              $0-20/mois
─────────────────────────────
TOTAL:               $50-70/mois
```

### Option 3 (Hybride) ✅
```
Supabase Partagée:   $25/mois
Vercel:              $0-20/mois
─────────────────────────────
TOTAL:               $25-45/mois
                     
ÉCONOMIE:            $25/mois ($300/an) 💰
```

---

## 🔗 Synergies Possibles (Futur)

### 1. Auth Partagé
```typescript
// User peut se connecter aux DEUX apps
// auth.users (table partagée)

// Blanche: Client e-commerce
// Deadstock: Utilisateur premium API
```

### 2. Vues Cross-Schema
```sql
-- Afficher deadstock textiles dans Blanche
CREATE VIEW public.available_deadstock AS
SELECT * FROM deadstock.textiles WHERE available = true;
```

### 3. Blanche Vend Ses Deadstock
```sql
-- Blanche peut insérer dans deadstock.textiles
INSERT INTO deadstock.textiles 
  (name, supplier_name, source_platform)
VALUES 
  ('Chute soie', 'Blanche', 'blanche_internal');
```

---

## ✅ Ce Qui Ne Change Pas (Statut Actuel)

**Bonne nouvelle** : Tu fais déjà Option 3 ! 🎉

- ✅ Deadstock dans son propre repo
- ✅ Supabase partagée avec schéma `deadstock` séparé
- ✅ Variables env partagées (`.env.local`)
- ✅ Code autonome

**Action** : Continuer exactement comme maintenant ! 👍

---

## 📋 Prochaines Actions (Quand Phase 1 Complète)

### 1. Préparer Déploiement Deadstock
- [ ] Push code sur GitHub
- [ ] Créer projet Vercel "deadstock-search-engine"
- [ ] Configurer variables env (mêmes clés Supabase)
- [ ] Premier deploy

### 2. Domaines (Plus Tard)
**Option A** : Sous-domaines Blanche
- `blanche.com` (site)
- `search.blanche.com` (deadstock)

**Option B** : Domaine séparé
- `blanche.com`
- `deadstock-fabrics.com`

**Décision** : Phase 2 (après validation MVP)

---

## 🔄 Migration Future (Si Besoin)

### Vers Monorepo (Phase 4+)

**Quand** :
- Si code dupliqué >30%
- Si équipe grandit (>2 devs)
- Si synergies très fortes

**Effort** : 1-2 jours de migration

**Outils** : Turborepo, pnpm workspaces

---

### Vers Package NPM (Phase 4+)

**Quand** :
- Si Blanche veut embedder UI Deadstock
- Si besoin versioning

**Effort** : 1 jour

**Résultat** :
```typescript
// Dans Blanche
import { TextileSearch } from '@blanche/deadstock';

<TextileSearch />
```

---

## 🎯 Recommandation Finale

### ✅ Adopter Option 3 (Hybride)

**Structure** :
- 2 repos Git séparés
- 2 projets Vercel séparés  
- 1 Supabase partagée (schémas séparés)
- Code dupliqué acceptable pour MVP

**Avantages Clés** :
1. Simple à gérer (solo dev)
2. Économie $300/an
3. Synergies possibles
4. Migration facile si besoin

**Ce Qui Change** :
- Rien ! Tu fais déjà ça 😊

---

## 📞 Questions ?

### Q1: Et si Deadstock devient énorme ?
**R**: Migration instance Supabase séparée facile (export/import)

### Q2: Code dupliqué pas un problème ?
**R**: Non pour MVP. Si >30% dupliqué → package npm interne

### Q3: Peut-on changer plus tard ?
**R**: Oui ! Migration monorepo ou séparation complète possibles

---

## ✅ Validation Décision

**Je recommande** : Option 3 (Hybride)

**Es-tu d'accord Thomas ?**
- [ ] Oui, on continue comme ça
- [ ] Non, je préfère Option 1 (séparation complète)
- [ ] Non, je préfère Option 2 (monorepo)
- [ ] J'ai des questions

---

**Voir ADR complet** : `docs/decisions/ADR_003_multi_project_architecture.md`
