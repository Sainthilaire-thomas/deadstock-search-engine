// src/features/boards/utils/colorExtractor.ts
// Utilitaire pour extraire des palettes de couleurs depuis des images

import ColorThief from 'colorthief';

/**
 * Convertit un tableau RGB en code HEX
 */
function rgbToHex(rgb: [number, number, number]): string {
  return '#' + rgb.map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Extrait une palette de couleurs depuis une URL d'image
 * @param imageUrl URL de l'image (doit être accessible CORS)
 * @param colorCount Nombre de couleurs à extraire (2-10)
 * @returns Promise<string[]> Array de codes HEX
 */
export async function extractColorsFromUrl(
  imageUrl: string, 
  colorCount: number = 5
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const palette = colorThief.getPalette(img, Math.min(10, Math.max(2, colorCount)));
        const hexColors = palette.map((rgb: [number, number, number]) => rgbToHex(rgb));
        resolve(hexColors);
      } catch (error) {
        reject(new Error('Erreur lors de l\'extraction des couleurs'));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Impossible de charger l\'image. Vérifiez l\'URL ou les permissions CORS.'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Extrait une palette de couleurs depuis un fichier image (File/Blob)
 * @param file Fichier image
 * @param colorCount Nombre de couleurs à extraire (2-10)
 * @returns Promise<string[]> Array de codes HEX
 */
export async function extractColorsFromFile(
  file: File,
  colorCount: number = 5
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier doit être une image'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          const palette = colorThief.getPalette(img, Math.min(10, Math.max(2, colorCount)));
          const hexColors = palette.map((rgb: [number, number, number]) => rgbToHex(rgb));
          resolve(hexColors);
        } catch (error) {
          reject(new Error('Erreur lors de l\'extraction des couleurs'));
        }
      };
      
      img.onerror = () => {
        reject(new Error('Impossible de lire l\'image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Extrait la couleur dominante depuis une URL d'image
 * @param imageUrl URL de l'image
 * @returns Promise<string> Code HEX de la couleur dominante
 */
export async function extractDominantColorFromUrl(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const dominantColor = colorThief.getColor(img);
        resolve(rgbToHex(dominantColor));
      } catch (error) {
        reject(new Error('Erreur lors de l\'extraction de la couleur dominante'));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Impossible de charger l\'image'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Extrait la couleur dominante depuis un fichier image
 * @param file Fichier image
 * @returns Promise<string> Code HEX de la couleur dominante
 */
export async function extractDominantColorFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier doit être une image'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          const dominantColor = colorThief.getColor(img);
          resolve(rgbToHex(dominantColor));
        } catch (error) {
          reject(new Error('Erreur lors de l\'extraction de la couleur dominante'));
        }
      };
      
      img.onerror = () => {
        reject(new Error('Impossible de lire l\'image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsDataURL(file);
  });
}
