// src/lib/storage/imageUpload.ts

import { createClient } from '@/lib/supabase/client';

const BUCKET_NAME = 'deadstock-boards';
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.85;
const THUMBNAIL_WIDTH = 400;

export interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  size: number;
}

/**
 * Upload une image vers Supabase Storage avec optimisation automatique
 * - Redimensionne à max 1200px
 * - Convertit en WebP
 * - Génère optionnellement un thumbnail
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
  const filename = `${userId}/${timestamp}-${randomId}.webp`;

  // 3. Upload vers Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, optimizedBlob, {
      contentType: 'image/webp',
      cacheControl: '31536000', // 1 an
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  // 4. Obtenir l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
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
 * Upload une image depuis une URL externe (Unsplash, etc.)
 * Télécharge, optimise et re-upload vers Storage
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
 * Upload un PDF vers Storage (sans optimisation)
 */
export async function uploadPdf(
  file: File,
  userId: string
): Promise<{ url: string; size: number; name: string }> {
  const supabase = createClient();

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  // Garder le nom original pour référence
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${userId}/pdf-${timestamp}-${randomId}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, file, {
      contentType: 'application/pdf',
      cacheControl: '31536000',
    });

  if (error) {
    console.error('PDF upload error:', error);
    throw new Error(`PDF upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filename);

  return {
    url: publicUrl,
    size: file.size,
    name: file.name,
  };
}

/**
 * Supprime un fichier du Storage
 */
export async function deleteFile(fileUrl: string): Promise<boolean> {
  const supabase = createClient();
  
  // Extraire le path depuis l'URL
  // URL format: https://xxx.supabase.co/storage/v1/object/public/deadstock-boards/userId/filename.webp
  const urlParts = fileUrl.split(`${BUCKET_NAME}/`);
  if (urlParts.length !== 2) {
    console.warn('Invalid file URL format:', fileUrl);
    return false;
  }
  
  const filePath = urlParts[1];
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    return false;
  }

  return true;
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
      // Libérer l'URL
      URL.revokeObjectURL(img.src);
      
      // Calculer les nouvelles dimensions en préservant le ratio
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
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
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
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
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
    .from(BUCKET_NAME)
    .upload(filename, blob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
    });

  if (error) {
    console.error('Thumbnail upload error:', error);
    throw new Error(`Thumbnail upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filename);

  return publicUrl;
}
