# Session 21 - ADR-026 Complete: Dual Pricing Display

**Date** : 9 Janvier 2026  
**Durée** : ~3 heures  
**Focus** : Affichage dual pricing pour produits hybrid + Page détail textile

---

## 🎯 Objectifs de la Session

1. ✅ Implémenter ADR-026 Part 1 : Détection sale_type au Discovery
2. ✅ Implémenter ADR-026 Part 2 : Affichage dans Admin UI
3. ✅ Implémenter ADR-026 Part 3 : Dual pricing dans search UI
4. ✅ Bonus : Créer page détail textile `/textiles/[id]`

---

## 📋 Travail Réalisé

### Part 1 : Sale Type Detection at Discovery

**Fichier créé** : `src/features/admin/utils/saleTypeDetector.ts`

Algorithme de détection basé sur :
- Présence de variants multiples
- Option "Cutting" dans option3 (Nona Source)
- Patterns de longueur dans options
- Variation de prix entre variants

**Résultat test Nona Source** :
```
Type détecté : hybrid
Confiance : 95%
Preuves : hasCuttingOption=true, hasLengthInOptions=true
```

**Intégration** : `discoveryService.ts` appelle `detectSaleType()` et stocke dans `site_profiles.sale_type_detection`

### Part 2 : SaleTypeCard Component

**Fichier créé** : `src/features/admin/components/SaleTypeCard.tsx`

Affiche :
- Type de vente détecté avec icône
- Niveau de confiance (badge coloré)
- Preuves détaillées
- Recommandations pour le scraping

**Intégration** : Ajouté dans `/admin/discovery/[siteSlug]/page.tsx`

### Part 3 : PriceDisplay Component

**Fichier créé** : `src/components/search/PriceDisplay.tsx`

Affichage conditionnel selon `sale_type` :

| Type | Affichage |
|------|-----------|
| `hybrid` | Box verte "Coupon Xm → Y€" + "À la coupe → Z€/m" + économie calculée |
| `fixed_length` | "Prix Y€" + "Coupon Xm (Z€/m)" |
| `cut_to_order` | "✂️ Prix Z€/m" |

**Calcul économie** :
```typescript
const savings = (pricePerMeter - couponPricePerMeter) / pricePerMeter * 100;
// Exemple Nona: 18€/m coupe vs 0.28€/m coupon = -84%
```

### Part 4 : Page Détail Textile

**Fichier créé** : `src/app/(main)/textiles/[id]/page.tsx`

Features :
- Image principale grande + 4 miniatures
- Badge "2 options d'achat" pour hybrid
- Card prix avec même logique que PriceDisplay
- Caractéristiques (fiber, color, pattern, weave, width, weight)
- Description HTML sanitized
- Boutons FavoriteButton + AddToBoardButton
- Lien externe "Voir sur [source]"

**Problème rencontré** : 404 sur la page
- **Cause** : Client Supabase server ne spécifiait pas le schema `deadstock`
- **Solution** : Ajout `.schema('deadstock')` dans la requête

---

## 🐛 Problèmes Résolus

### 1. Page Textile 404

**Symptôme** : `/textiles/[id]` retournait 404 même avec fichier créé

**Investigation** :
- Terminal montrait `200` mais browser `404`
- Query sur `textiles_search` ne trouvait pas les IDs

**Cause racine** : `createClient()` dans `server.ts` n'avait pas `db: { schema: 'deadstock' }`

**Fix** : Ajout `.schema('deadstock')` dans la query de la page

### 2. Props AddToBoardButton

**Erreur TypeScript** : `image_url` n'existe pas dans le type

**Fix** : Mapper vers les props attendues :
```typescript
textile={{
  id: textile.id,
  name: textile.name,
  imageUrl: textile.image_url,      // snake_case → camelCase
  price: textile.price,
  source: textile.source_url,
  availableQuantity: textile.quantity_value,
  material: textile.fiber,
  color: textile.color,
}}
```

### 3. Mapping price vs price_value

**Problème** : Vue utilise `price`, TypeScript utilise `price_value`

**Workaround** : `(textile as any).price ?? textile.price_value`

---

## 📊 Résultats Visuels

### Search Grid - Hybrid Products
```
┌─────────────────────────────────────┐
│  T24A11329 | Cotton &...            │
│  Cotton                             │
│  Quantité                      57m  │
│  ┌─────────────────────────────┐    │
│  │ 2 options d'achat           │    │
│  │ 📦 Coupon 57m    171€ (3€/m)│    │
│  │ ✂️  À la coupe    12.00€/m  │    │
│  │ 💰 -75% en coupon           │    │
│  └─────────────────────────────┘    │
│  Source: www.nona-source.com        │
└─────────────────────────────────────┘
```

### Search Grid - Cut to Order
```
┌─────────────────────────────────────┐
│  Siren Mushroom...                  │
│  White                              │
│  Quantité                    1unit  │
│  ✂️ Prix                  1.39€/m   │
│  Source: thefabricsales.com         │
└─────────────────────────────────────┘
```

### Search Grid - Fixed Length
```
┌─────────────────────────────────────┐
│  (Chute) COTON JEA...               │
│  Quantité                       3m  │
│  Prix                      34.30EUR │
│  Coupon 3m              (11.43€/m)  │
│  Source: my_little_coupon           │
└─────────────────────────────────────┘
```

---

## 📁 Fichiers Créés/Modifiés

### Créés
| Fichier | Description |
|---------|-------------|
| `src/features/admin/utils/saleTypeDetector.ts` | Détection sale_type au Discovery |
| `src/features/admin/components/SaleTypeCard.tsx` | Affichage sale_type Admin |
| `src/components/search/PriceDisplay.tsx` | Dual pricing component |
| `src/app/(main)/textiles/[id]/page.tsx` | Page détail textile |

### Modifiés
| Fichier | Modification |
|---------|--------------|
| `src/features/admin/services/discoveryService.ts` | Intégration saleTypeDetector |
| `src/app/admin/discovery/[siteSlug]/page.tsx` | Ajout SaleTypeCard |
| `src/components/search/TextileGrid.tsx` | Utilise PriceDisplay |

---

## ⚠️ Points d'Attention pour Session Suivante

### 1. "1unit" pour cut_to_order
Affichage "Quantité: 1unit" pas clair → devrait dire "Vente au mètre"

### 2. Caractéristiques vides
Certains textiles n'affichent pas fiber/color dans la page détail. À investiguer si :
- Données manquantes dans `textile_attributes`
- Problème de mapping dans la vue `textiles_search`
- Bug d'affichage

### 3. Schema Supabase
Le fix `.schema('deadstock')` est local à la page textile. Idéalement, configurer dans `server.ts` :
```typescript
db: { schema: 'deadstock' }
```

---

## 📈 Métriques Session

| Métrique | Valeur |
|----------|--------|
| Fichiers créés | 4 |
| Fichiers modifiés | 3 |
| Bugs résolus | 3 |
| ADR implémentés | 1 (ADR-026 complet) |
| MVP Progress | 92% → 95% |

---

## 🚀 Prochaines Priorités

1. **Quick fixes** : "1unit" → "Vente au mètre", caractéristiques vides
2. **Scraping scale** : 500+ produits par source
3. **Filtre sale_type** dans la recherche
4. **Commit** tout le travail ADR-026

---

## 💡 Learnings

1. **Supabase multi-schema** : Toujours vérifier que le client spécifie le bon schema
2. **Props TypeScript** : Attention aux différences snake_case vs camelCase entre DB et composants
3. **Vue matérialisée** : Les colonnes peuvent avoir des noms différents des tables sources
4. **Next.js cache** : Supprimer `.next` si comportement bizarre après création de fichiers

---

**Status** : ✅ Session complétée avec succès  
**ADR-026** : ✅ Implémenté complètement  
**MVP Progress** : 92% → 95%
