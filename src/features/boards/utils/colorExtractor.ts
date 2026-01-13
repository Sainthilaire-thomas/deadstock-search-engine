// src/features/boards/utils/colorExtractor.ts
// Utilitaire pour extraire des palettes de couleurs depuis des images
// + Génération d'harmonies couleurs

import ColorThief from 'colorthief';

// ============================================
// CONVERSION HELPERS
// ============================================

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
 * Convertit un code HEX en RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error('Invalid hex color');
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ];
}

/**
 * Convertit RGB en HSL
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return [h * 360, s * 100, l * 100];
}

/**
 * Convertit HSL en RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Convertit HSL en HEX
 */
function hslToHex(h: number, s: number, l: number): string {
  return rgbToHex(hslToRgb(h, s, l));
}

// ============================================
// COLOR EXTRACTION FROM IMAGES
// ============================================

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

// ============================================
// COLOR HARMONIES
// ============================================

export interface ColorHarmonies {
  /** Couleur de base */
  base: string;
  /** Couleur opposée sur le cercle chromatique (180°) */
  complementary: string;
  /** Couleurs adjacentes (±30°) */
  analogous: [string, string];
  /** Couleurs à 120° d'écart */
  triadic: [string, string];
  /** Couleurs à 150° d'écart (complémentaire divisé) */
  splitComplementary: [string, string];
  /** Couleurs à 90° d'écart */
  tetradic: [string, string, string];
}

/**
 * Génère les harmonies de couleurs pour une couleur de base
 * @param baseColor Code HEX de la couleur de base
 * @returns Object avec toutes les harmonies
 */
export function generateHarmonies(baseColor: string): ColorHarmonies {
  const rgb = hexToRgb(baseColor);
  const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  
  // Helper pour normaliser la teinte (0-360)
  const normalizeHue = (hue: number): number => ((hue % 360) + 360) % 360;
  
  return {
    base: baseColor,
    
    // Complémentaire : +180°
    complementary: hslToHex(normalizeHue(h + 180), s, l),
    
    // Analogues : ±30°
    analogous: [
      hslToHex(normalizeHue(h - 30), s, l),
      hslToHex(normalizeHue(h + 30), s, l)
    ],
    
    // Triadique : +120° et +240°
    triadic: [
      hslToHex(normalizeHue(h + 120), s, l),
      hslToHex(normalizeHue(h + 240), s, l)
    ],
    
    // Split-complémentaire : +150° et +210°
    splitComplementary: [
      hslToHex(normalizeHue(h + 150), s, l),
      hslToHex(normalizeHue(h + 210), s, l)
    ],
    
    // Tétradique (carré) : +90°, +180°, +270°
    tetradic: [
      hslToHex(normalizeHue(h + 90), s, l),
      hslToHex(normalizeHue(h + 180), s, l),
      hslToHex(normalizeHue(h + 270), s, l)
    ]
  };
}

/**
 * Génère des variations de luminosité d'une couleur
 * @param baseColor Code HEX de la couleur de base
 * @param count Nombre de variations (3-7)
 * @returns Array de codes HEX du plus clair au plus foncé
 */
export function generateShades(baseColor: string, count: number = 5): string[] {
  const rgb = hexToRgb(baseColor);
  const [h, s] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  
  const shades: string[] = [];
  const step = 80 / (count - 1); // De 90% à 10% de luminosité
  
  for (let i = 0; i < count; i++) {
    const lightness = 90 - (i * step);
    shades.push(hslToHex(h, s, Math.max(10, Math.min(90, lightness))));
  }
  
  return shades;
}

/**
 * Suggère des couleurs complémentaires pour construire une palette
 * @param baseColor Code HEX de la couleur de base
 * @returns Array de 5 couleurs suggérées pour une palette harmonieuse
 */
export function suggestPaletteFromColor(baseColor: string): string[] {
  const harmonies = generateHarmonies(baseColor);
  
  // Palette suggérée : base + 2 analogues + complémentaire + neutre
  const rgb = hexToRgb(baseColor);
  const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  
  // Couleur neutre basée sur la teinte de base mais très désaturée
  const neutral = hslToHex(h, Math.min(10, s), l > 50 ? 25 : 75);
  
  return [
    baseColor,
    harmonies.analogous[0],
    harmonies.analogous[1],
    harmonies.complementary,
    neutral
  ];
}

/**
 * Calcule le contraste entre deux couleurs (WCAG)
 * @param color1 Code HEX
 * @param color2 Code HEX
 * @returns Ratio de contraste (1:1 à 21:1)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Détermine si le texte devrait être clair ou foncé sur un fond donné
 * @param backgroundColor Code HEX du fond
 * @returns 'light' ou 'dark'
 */
export function getTextColorForBackground(backgroundColor: string): 'light' | 'dark' {
  const rgb = hexToRgb(backgroundColor);
  // Calcul de luminosité perçue
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 128 ? 'dark' : 'light';
}
