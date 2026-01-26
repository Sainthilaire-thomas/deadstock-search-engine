# SPRINT - Migration Images vers Supabase Storage

**Version** : 1.0  
**Date** : 26 Janvier 2026  
**Priorité** : 🔴 CRITIQUE - Bloquant pour les performances

---

## 📋 Contexte

### Problème Identifié

L'audit de performance du 26 janvier 2026 a révélé que la page `/boards` prend **5-6 secondes** à charger. L'investigation a montré que :

| Board | Éléments | Taille element_data |
|-------|----------|---------------------|
| Chemise automne | 14 | **5.10 MB** |
| Collection automne | 15 | **5.10 MB** |
| Robe été | 11 | **2.55 MB** |
| Chemise | 5 | 1.7 KB |
| Pantalon | 4 | 1.4 KB |
| **TOTAL** | **49** | **~13 MB** |

**Cause racine** : Les images (inspirations, patterns, silhouettes) sont stockées en **base64** directement dans `element_data`, causant :
- 13 MB transférés à chaque navigation vers `/boards`
- Impossible de mettre en cache (pas d'URL)
- Pas de CDN
- Base de données gonflée

### Solution

Migrer le stockage des images vers **Supabase Storage** :
- Stocker les fichiers dans un bucket dédié
- Ne garder que les **URLs** dans `element_data`
- Bénéficier du CDN Supabase et du cache navigateur

### Gains Attendus

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| Taille requête `/boards` | 13 MB | ~5 KB | **-99.96%** |
| Temps `/boards` | 5-6s | 200-400ms | **-95%** |
| Cache images | ❌ Impossible | ✅ CDN + navigateur | ∞ |

---

## 🎯 Objectifs du Sprint

1. ✅ Créer l'infrastructure Supabase Storage pour Deadstock
2. ✅ Modifier les composants d'upload pour utiliser Storage
3. ✅ Optimiser les images à l'upload (resize, WebP)
4. ✅ Nettoyer les données existantes (reset boards de test)
5. ✅ Optimiser la requête de listing des boards

---

## 📦 Sprint IMG-1 : Infrastructure Storage

**Durée estimée** : 1h30  
**Dépendances** : Aucune

### IMG-1.1 - Créer le bucket Supabase (15min)

**Dans Supabase Dashboard** → Storage → New Bucket

```
Nom : deadstock-boards
Public : ✅ Oui (pour les URLs publiques)
File size limit : 10 MB
Allowed MIME types : image/*, application/pdf
```

### IMG-1.2 - Configurer les policies RLS (15min)

**SQL à exécuter dans Supabase SQL Editor** :

```sql
-- Policy : Lecture publique
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'deadstock-boards');

-- Policy : Upload pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deadstock-boards' 
  AND auth.role() = 'authenticated'
);

-- Policy : Delete ses propres fichiers
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'deadstock-boards'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### IMG-1.3 - Utilitaire d'upload optimisé (1h)

**Fichier** : `src/lib/storage/imageUpload.ts`

```typescript
import { createClient } from '@/lib/supabase/client';

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.85;
const THUMBNAIL_WIDTH = 400;

interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  size: number;
}

/**
 * Upload une image vers Supabase Storage avec optimisation
 */
export async function uploadImage(
  file: File | Blob,
  userId: string,
  options?: {
    generateThumbnail?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<UploadResult> {
  const supabase = createClient();
  const maxWidth = options?.maxWidth ?? MAX_WIDTH;
  const maxHeight = options?.maxHeight ?? MAX_HEIGHT;
  const quality = options?.quality ?? QUALITY;

  // 1. Optimiser l'image
  const { blob: optimizedBlob, width, height } = await optimizeImage(
    file,
    maxWidth,
    maxHeight,
    quality
  );

  // 2. Générer un nom unique
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const extension = 'webp';
  const filename = `${userId}/${timestamp}-${randomId}.${extension}`;

  // 3. Upload vers Storage
  const { data, error } = await supabase.storage
    .from('deadstock-boards')
    .upload(filename, optimizedBlob, {
      contentType: 'image/webp',
      cacheControl: '31536000', // 1 an
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // 4. Obtenir l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('deadstock-boards')
    .getPublicUrl(filename);

  // 5. Générer thumbnail si demandé
  let thumbnailUrl: string | undefined;
  if (options?.generateThumbnail) {
    thumbnailUrl = await uploadThumbnail(file, userId, supabase);
  }

  return {
    url: publicUrl,
    thumbnailUrl,
    width,
    height,
    size: optimizedBlob.size,
  };
}

/**
 * Upload depuis une URL externe (Unsplash, etc.)
 */
export async function uploadFromUrl(
  imageUrl: string,
  userId: string,
  options?: {
    generateThumbnail?: boolean;
  }
): Promise<UploadResult> {
  // Télécharger l'image
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  
  const blob = await response.blob();
  return uploadImage(blob, userId, options);
}

/**
 * Upload un PDF (sans optimisation)
 */
export async function uploadPdf(
  file: File,
  userId: string
): Promise<{ url: string; size: number }> {
  const supabase = createClient();

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const filename = `${userId}/pdf-${timestamp}-${randomId}.pdf`;

  const { data, error } = await supabase.storage
    .from('deadstock-boards')
    .upload(filename, file, {
      contentType: 'application/pdf',
      cacheControl: '31536000',
    });

  if (error) {
    throw new Error(`PDF upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('deadstock-boards')
    .getPublicUrl(filename);

  return {
    url: publicUrl,
    size: file.size,
  };
}

// ============================================
// Fonctions utilitaires internes
// ============================================

async function optimizeImage(
  file: File | Blob,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculer les nouvelles dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      width = Math.round(width);
      height = Math.round(height);

      // Dessiner sur canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir en WebP
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, width, height });
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/webp',
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

async function uploadThumbnail(
  file: File | Blob,
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  const { blob } = await optimizeImage(file, THUMBNAIL_WIDTH, THUMBNAIL_WIDTH, 0.7);

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const filename = `${userId}/thumb-${timestamp}-${randomId}.webp`;

  const { error } = await supabase.storage
    .from('deadstock-boards')
    .upload(filename, blob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
    });

  if (error) {
    throw new Error(`Thumbnail upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('deadstock-boards')
    .getPublicUrl(filename);

  return publicUrl;
}
```

**Livrable** : Utilitaires d'upload fonctionnels et testés

---

## 📦 Sprint IMG-2 : Migration des Composants

**Durée estimée** : 3h  
**Dépendances** : IMG-1

### IMG-2.1 - Modifier ImageUploadModal (45min)

**Fichier** : `src/features/boards/components/ImageUploadModal.tsx`

**Changements** :
- [ ] Importer `uploadImage` et `uploadFromUrl`
- [ ] Remplacer la conversion base64 par upload Storage
- [ ] Stocker l'URL dans `element_data.imageUrl`
- [ ] Supprimer le code base64

**Structure element_data après** :
```typescript
interface InspirationElementData {
  imageUrl: string;      // URL Supabase Storage (plus de base64)
  caption?: string;
  source?: string;
  colors?: string[];     // Couleurs extraites
}
```

### IMG-2.2 - Modifier UnsplashImagePicker (30min)

**Fichier** : `src/features/boards/components/UnsplashImagePicker.tsx`

**Changements** :
- [ ] Utiliser `uploadFromUrl` au lieu de garder l'URL Unsplash directe
- [ ] Stocker la version optimisée dans Storage
- [ ] Conserver l'attribution Unsplash dans les métadonnées

### IMG-2.3 - Modifier PdfModal (30min)

**Fichier** : `src/features/boards/components/PdfModal.tsx`

**Changements** :
- [ ] Utiliser `uploadPdf` au lieu de base64
- [ ] Stocker l'URL dans `element_data.url`
- [ ] Garder `thumbnailUrl` pour la preview (générer côté client ou placeholder)

**Structure element_data après** :
```typescript
interface PdfElementData {
  url: string;           // URL Supabase Storage
  thumbnailUrl?: string; // Première page en image (optionnel)
  name: string;
  pageCount?: number;
}
```

### IMG-2.4 - Modifier PatternModal (30min)

**Fichier** : `src/features/boards/components/PatternModal.tsx`

**Changements** :
- [ ] Upload fichier vers Storage
- [ ] Générer thumbnail si c'est une image
- [ ] Stocker URLs dans `element_data`

### IMG-2.5 - Modifier SilhouetteModal (30min)

**Fichier** : `src/features/boards/components/SilhouetteModal.tsx`

**Changements** :
- [ ] Upload fichier vers Storage
- [ ] Stocker URL dans `element_data.url`

### IMG-2.6 - Mettre à jour les éléments d'affichage (15min)

**Fichiers** :
- `src/features/boards/components/elements/ImageElement.tsx`
- `src/features/boards/components/elements/PdfElement.tsx`
- etc.

**Changements** :
- [ ] S'assurer qu'ils gèrent les URLs (déjà le cas normalement)
- [ ] Retirer tout code legacy de décodage base64

**Livrable** : Tous les uploads utilisent Supabase Storage

---

## 📦 Sprint IMG-3 : Nettoyage et Optimisation Listing

**Durée estimée** : 1h30  
**Dépendances** : IMG-2

### IMG-3.1 - Nettoyer les boards existants (15min)

**Option A - Reset complet** (recommandé pour l'instant) :

```sql
-- Supprimer tous les éléments avec données base64 volumineuses
DELETE FROM deadstock.board_elements 
WHERE LENGTH(element_data::text) > 10000;

-- Ou supprimer tous les boards de test
DELETE FROM deadstock.board_zones;
DELETE FROM deadstock.board_elements;
DELETE FROM deadstock.boards;
```

**Option B - Script de migration** (si on veut garder les boards) :
À implémenter plus tard si nécessaire.

### IMG-3.2 - Optimiser la requête listBoardsWithPreview (30min)

**Fichier** : `src/features/boards/infrastructure/boardsRepository.ts`

**Avant** :
```typescript
const { data, error } = await supabase
  .from('boards')
  .select(`
    *,
    board_elements (
      id,
      element_type,
      element_data    // ← Charge 13 MB !
    ),
    board_zones (id)
  `)
```

**Après** :
```typescript
export async function listBoardsWithPreview(userId: string): Promise<BoardWithPreview[]> {
  const supabase = createAdminClient();

  // Requête légère : counts seulement, pas de element_data
  const { data, error } = await supabase
    .from('boards')
    .select(`
      *,
      board_elements (count),
      board_zones (count)
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('listBoardsWithPreview error:', error);
    throw error;
  }

  return (data || []).map((row) => {
    const board = mapBoardFromRow(row as BoardRow);
    const elementCount = (row.board_elements as { count: number }[])?.[0]?.count ?? 0;
    const zoneCount = (row.board_zones as { count: number }[])?.[0]?.count ?? 0;

    return {
      ...board,
      previewUrl: row.cover_image_url || null,
      elementCount,
      zoneCount,
    };
  });
}
```

### IMG-3.3 - Auto-set cover_image_url (30min)

**Fichier** : `src/features/boards/infrastructure/elementsRepository.ts`

Quand on ajoute un élément de type `inspiration`, `silhouette`, ou `pattern` avec une image :

```typescript
export async function createElement(/* ... */): Promise<BoardElement> {
  // ... création de l'élément ...

  // Auto-set cover si c'est le premier élément image et pas de cover
  const imageTypes = ['inspiration', 'silhouette', 'pattern'];
  if (imageTypes.includes(input.elementType)) {
    const imageUrl = extractImageUrl(input.elementData);
    if (imageUrl) {
      await maybeSetBoardCover(boardId, imageUrl, userId);
    }
  }

  return element;
}

async function maybeSetBoardCover(
  boardId: string,
  imageUrl: string,
  userId: string
): Promise<void> {
  const supabase = createAdminClient();
  
  // Ne set que si pas déjà de cover
  const { error } = await supabase
    .from('boards')
    .update({ cover_image_url: imageUrl })
    .eq('id', boardId)
    .eq('user_id', userId)
    .is('cover_image_url', null);

  // Ignorer l'erreur si déjà une cover (expected)
}
```

### IMG-3.4 - Supprimer les logs de timing (15min)

**Fichier** : `src/features/boards/infrastructure/boardsRepository.ts`

Retirer les `console.time` / `console.timeEnd` ajoutés pendant le debug.

**Livrable** : Page `/boards` charge en < 500ms

---

## 📦 Sprint IMG-4 : Suppression fonction extractPreviewUrl (optionnel)

**Durée estimée** : 15min  
**Dépendances** : IMG-3

Si `cover_image_url` est toujours utilisé, on peut supprimer la fonction `extractPreviewUrl` qui n'est plus nécessaire.

---

## ✅ Critères de Validation

### IMG-1 ✓
- [ ] Bucket `deadstock-boards` créé
- [ ] Policies RLS configurées
- [ ] Test manuel : upload une image via Supabase Dashboard

### IMG-2 ✓
- [ ] Créer une inspiration → URL Storage (pas base64)
- [ ] Ajouter image Unsplash → URL Storage
- [ ] Ajouter PDF → URL Storage
- [ ] Ajouter Pattern → URL Storage
- [ ] Les éléments existants s'affichent toujours

### IMG-3 ✓
- [ ] `/boards` charge en < 500ms
- [ ] Les counts sont corrects
- [ ] La cover s'affiche
- [ ] Logs de timing supprimés

---

## 📊 Récapitulatif Effort

| Sprint | Durée | Priorité |
|--------|-------|----------|
| IMG-1 : Infrastructure Storage | 1h30 | P0 |
| IMG-2 : Migration composants | 3h | P0 |
| IMG-3 : Nettoyage + listing | 1h30 | P0 |
| IMG-4 : Cleanup code (optionnel) | 15min | P2 |
| **TOTAL** | **~6h** | |

---

## 🔗 Liens avec autres Sprints

### Sprints bloqués par IMG (à reporter)
- **PERF-2** (Journey lazy load) : Peut commencer après IMG
- **PERF-3** (React optimizations) : Impact mineur vs IMG

### Sprints indépendants (peuvent continuer)
- **A1-A3** (Admin improvements) : Pas impactés
- **B4-B6** (Recherche contextuelle avancée) : Pas impactés

---

## 📝 Notes Techniques

### Pourquoi WebP ?
- 25-35% plus petit que JPEG à qualité égale
- Support navigateur > 95%
- Transparence supportée (comme PNG)

### Pourquoi 1200px max ?
- Suffisant pour affichage board (éléments ~300px)
- Bon compromis taille/qualité
- Peut être zoomé sans pixellisation visible

### Structure des fichiers dans Storage
```
deadstock-boards/
├── {userId}/
│   ├── 1706234567890-abc123.webp      # Image principale
│   ├── thumb-1706234567890-abc123.webp # Thumbnail
│   ├── pdf-1706234567890-def456.pdf   # PDF
│   └── ...
```

### Migration future des données existantes
Si besoin de migrer les boards existants (pas le cas actuellement) :
1. Script Node.js qui parcourt les `board_elements`
2. Pour chaque élément avec base64 : decode → upload → update URL
3. À faire en batch pour éviter timeout

---

**Prochaine étape** : Exécuter IMG-1.1 (création bucket) puis IMG-1.2 (policies)
