# ADR-027 : Boards Module - Roadmap & Améliorations Futures

**Date** : 10 Janvier 2026  
**Statut** : Accepté  
**Contexte** : Consolidation des améliorations identifiées lors des Sprints 1-5  
**Impact** : Module Boards

---

## Résumé Exécutif

Ce document consolide toutes les améliorations futures identifiées pour le module Boards, organisées par priorité et domaine fonctionnel.

---

## 1. État Actuel (Post-Sprint 5)

### Fonctionnalités Implémentées ✅

| Sprint | Fonctionnalité | Status |
|--------|----------------|--------|
| 1 | Design épuré, sidebar 48px icons-only | ✅ |
| 1 | Toggle Inspiration/Projet mode | ✅ |
| 1 | Persistence localStorage elements | ✅ |
| 2 | Mode immersif (header/footer masqués) | ✅ |
| 2 | PaletteElement avec swatches | ✅ |
| 3 | PaletteEditor modal (react-colorful) | ✅ |
| 3 | CRUD couleurs (max 10, validation HEX) | ✅ |
| 3 | Double-clic pour éditer | ✅ |
| 3 | Optimisation drag (1 POST par opération) | ✅ |
| 4 | Extraction couleurs depuis images (ColorThief) | ✅ |
| 4 | Upload fichier + URL pour extraction | ✅ |
| 5 | ImageUploadModal (upload/URL) | ✅ |
| 5 | ImageElement avec support CORS | ✅ |
| 5 | Bouton Image activé dans toolbar | ✅ |

---

## 2. Sprints Planifiés

### Sprint 6 : Resize des Éléments (P1)
**Effort estimé** : 3-4h

- [ ] Poignées de resize sur éléments sélectionnés (8 directions)
- [ ] Contraintes de taille minimum par type
- [ ] Curseurs adaptés selon la poignée
- [ ] Maintien ratio avec Shift
- [ ] Affichage dimensions pendant resize
- [ ] Persistance width/height en base

### Sprint 7 : Multi-sélection & Alignement (P1)
**Effort estimé** : 4-5h

- [ ] Sélection multiple (Shift+clic, rectangle de sélection)
- [ ] Déplacement groupé
- [ ] Outils d'alignement (gauche, centre, droite, haut, milieu, bas)
- [ ] Distribution égale (horizontal, vertical)
- [ ] Suppression groupée

### Sprint 8 : Undo/Redo (P2)
**Effort estimé** : 4h

- [ ] Historique des actions (stack)
- [ ] Ctrl+Z / Ctrl+Shift+Z
- [ ] Boutons undo/redo dans toolbar
- [ ] Limite d'historique (50 actions)

### Sprint 9 : Export/Import (P2)
**Effort estimé** : 3h

- [ ] Export board en PNG/PDF
- [ ] Export board en JSON (backup)
- [ ] Import board depuis JSON
- [ ] Partage par lien (lecture seule)

### Sprint 10 : Collaboration (P3)
**Effort estimé** : 8-10h

- [ ] Curseurs multi-utilisateurs temps réel
- [ ] Indicateur "X est en train de modifier..."
- [ ] Synchronisation Supabase Realtime
- [ ] Gestion des conflits

---

## 3. Améliorations par Domaine

### 3.1 Palettes de Couleurs

| Amélioration | Priorité | Effort | Description |
|--------------|----------|--------|-------------|
| Nombre couleurs configurable | P2 | 1h | Slider 3-10 couleurs lors extraction |
| Réorganisation drag & drop | P2 | 2h | Réordonner les couleurs de la palette |
| Extraction depuis textile | P2 | 1h | Extraire palette depuis image d'un tissu du board |
| Palettes suggérées | P3 | 3h | Variantes complémentaire, analogique, triadique |
| Export ASE/JSON | P3 | 2h | Télécharger palette pour Adobe/Figma |
| Palettes prédéfinies | P3 | 2h | Bibliothèque de palettes tendance/saison |

### 3.2 Images & Inspirations

| Amélioration | Priorité | Effort | Description |
|--------------|----------|--------|-------------|
| Compression images | P1 | 2h | Réduire images uploadées avant stockage base64 |
| Supabase Storage | P2 | 3h | Stocker images dans bucket au lieu de base64 |
| Lazy loading | P2 | 2h | Charger images au scroll pour performance |
| Drag & drop direct | P2 | 2h | Drop fichier directement sur canvas |
| Import Pinterest | P3 | 4h | Coller URL Pinterest, extraire image |
| Import multiple | P3 | 2h | Upload plusieurs images d'un coup |
| Galerie inspirations | P3 | 4h | Bibliothèque d'images réutilisables |

### 3.3 Éléments & Canvas

| Amélioration | Priorité | Effort | Description |
|--------------|----------|--------|-------------|
| Snap to grid | P2 | 2h | Alignement magnétique sur grille |
| Snap to elements | P2 | 3h | Guides d'alignement avec autres éléments |
| Groupement | P2 | 3h | Grouper plusieurs éléments ensemble |
| Verrouillage | P2 | 1h | Verrouiller position d'un élément |
| Duplication | P2 | 1h | Ctrl+D pour dupliquer élément |
| Copier/Coller | P2 | 2h | Ctrl+C/V entre boards |
| Layers panel | P3 | 4h | Liste des éléments avec réorganisation z-index |
| Templates | P3 | 4h | Boards pré-configurés par usage |

### 3.4 Zones

| Amélioration | Priorité | Effort | Description |
|--------------|----------|--------|-------------|
| Couleurs personnalisées | P2 | 1h | Picker couleur pour bordure zone |
| Auto-resize | P2 | 2h | Zone s'agrandit quand élément dépasse |
| Zones imbriquées | P3 | 4h | Zone dans une zone |
| Collapse/Expand | P3 | 2h | Réduire zone pour gagner de la place |

### 3.5 Notes

| Amélioration | Priorité | Effort | Description |
|--------------|----------|--------|-------------|
| Markdown complet | P2 | 2h | Support gras, italique, listes, liens |
| Checklist | P2 | 2h | Cases à cocher dans les notes |
| Mention @textile | P3 | 3h | Lier note à un textile du board |
| Voice-to-text | P4 | 4h | Dictée vocale pour créer notes |

### 3.6 Calculs

| Amélioration | Priorité | Effort | Description |
|--------------|----------|--------|-------------|
| Lien textile↔calcul | P1 | 2h | Associer calcul à un textile, afficher compatibilité |
| Recalcul auto | P2 | 2h | Mettre à jour si textile changé |
| Comparaison | P3 | 3h | Comparer plusieurs calculs côte à côte |

### 3.7 Performance

| Amélioration | Priorité | Effort | Description |
|--------------|----------|--------|-------------|
| Virtual canvas | P2 | 4h | Rendre uniquement éléments visibles |
| Debounce saves | P1 | 1h | Regrouper les sauvegardes (déjà fait partiellement) |
| Optimistic UI | P2 | 2h | Feedback immédiat avant confirmation serveur |
| Offline mode | P3 | 6h | Fonctionner sans connexion, sync au retour |

---

## 4. Priorisation Recommandée

### Phase 1 - Essentiels (Sprints 6-7)
1. ✅ Sprints 1-5 complets
2. Sprint 6 : Resize éléments
3. Sprint 7 : Multi-sélection + alignement
4. Compression images (éviter base64 trop lourds)
5. Lien textile↔calcul

### Phase 2 - Productivité (Sprints 8-9)
1. Sprint 8 : Undo/Redo
2. Sprint 9 : Export/Import
3. Snap to grid/elements
4. Markdown notes
5. Duplication/Copier-Coller

### Phase 3 - Avancé (Sprint 10+)
1. Sprint 10 : Collaboration temps réel
2. Supabase Storage pour images
3. Templates boards
4. Palettes suggérées
5. Import Pinterest

---

## 5. Décisions Techniques

### D1 : Stockage Images
**Décision** : Migrer vers Supabase Storage en Phase 2
**Justification** : Base64 fonctionne pour MVP mais ne scale pas (limite taille JSONB, performance)

### D2 : Collaboration
**Décision** : Utiliser Supabase Realtime
**Justification** : Déjà dans le stack, gère bien les conflits

### D3 : Export PDF
**Décision** : Utiliser html2canvas + jsPDF
**Justification** : Solutions éprouvées, pas de dépendance serveur

### D4 : Undo/Redo
**Décision** : Command Pattern avec stack locale
**Justification** : Simple, performant, pas besoin de persister l'historique

---

## 6. Métriques de Succès

| Métrique | Actuel | Cible Phase 2 | Cible Phase 3 |
|----------|--------|---------------|---------------|
| Éléments par board | ~10 | 50+ | 100+ |
| Temps chargement board | ~2s | <1s | <500ms |
| Taille max image | 5Mo base64 | 10Mo Storage | 20Mo Storage |
| Actions undo | 0 | 50 | 50 |
| Users simultanés | 1 | 1 | 5+ |

---

## 7. Références

- Sprint 1-3 : Design épuré, palettes, notes
- Sprint 4 : Color extraction (ColorThief)
- Sprint 5 : Image upload/inspiration
- ADR-024 : Textile Standard System
- GLOSSAIRE.md : Définitions Board, Zone, Élément

---

**Status** : Accepté  
**Prochaine action** : Sprint 6 - Resize des éléments  
**Auteur** : Thomas  
**Date** : 10 Janvier 2026
