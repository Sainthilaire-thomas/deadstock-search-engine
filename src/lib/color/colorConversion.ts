/**
 * Color Conversion Utilities
 * 
 * Converts between color spaces: HEX → RGB → XYZ → LAB
 * LAB is a perceptually uniform color space, ideal for color matching.
 * 
 * @see https://en.wikipedia.org/wiki/CIELAB_color_space
 */

// ============================================================================
// Types
// ============================================================================

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface XYZ {
  x: number;
  y: number;
  z: number;
}

export interface LAB {
  L: number; // Lightness: 0 (black) to 100 (white)
  a: number; // Green (-) to Red (+): roughly -128 to +128
  b: number; // Blue (-) to Yellow (+): roughly -128 to +128
}

// ============================================================================
// Constants
// ============================================================================

// D65 illuminant reference values (standard daylight)
const REF_X = 95.047;
const REF_Y = 100.0;
const REF_Z = 108.883;

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Convert HEX color to RGB
 * Supports both 3-char (#RGB) and 6-char (#RRGGBB) formats
 */
export function hexToRgb(hex: string): RGB {
  // Remove # if present
  let cleanHex = hex.replace(/^#/, '');
  
  // Expand 3-char to 6-char format
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map(char => char + char)
      .join('');
  }
  
  if (cleanHex.length !== 6) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  
  const num = parseInt(cleanHex, 16);
  
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

/**
 * Convert RGB to XYZ color space
 * Using sRGB to XYZ transformation matrix
 */
export function rgbToXyz(rgb: RGB): XYZ {
  // Normalize RGB values to 0-1 range
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;
  
  // Apply gamma correction (sRGB companding)
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  
  // Scale to 0-100 range
  r *= 100;
  g *= 100;
  b *= 100;
  
  // Apply sRGB to XYZ transformation matrix (D65 illuminant)
  return {
    x: r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
    y: r * 0.2126729 + g * 0.7151522 + b * 0.0721750,
    z: r * 0.0193339 + g * 0.1191920 + b * 0.9503041,
  };
}

/**
 * Convert XYZ to LAB color space
 * LAB is device-independent and perceptually uniform
 */
export function xyzToLab(xyz: XYZ): LAB {
  // Normalize by reference white (D65)
  let x = xyz.x / REF_X;
  let y = xyz.y / REF_Y;
  let z = xyz.z / REF_Z;
  
  // Apply LAB transformation function
  const f = (t: number) => {
    const delta = 6 / 29;
    const delta3 = delta * delta * delta;
    
    return t > delta3 
      ? Math.cbrt(t)
      : t / (3 * delta * delta) + 4 / 29;
  };
  
  x = f(x);
  y = f(y);
  z = f(z);
  
  return {
    L: 116 * y - 16,
    a: 500 * (x - y),
    b: 200 * (y - z),
  };
}

/**
 * Convert HEX directly to LAB (convenience function)
 */
export function hexToLab(hex: string): LAB {
  const rgb = hexToRgb(hex);
  const xyz = rgbToXyz(rgb);
  return xyzToLab(xyz);
}

/**
 * Convert LAB to XYZ
 */
export function labToXyz(lab: LAB): XYZ {
  const y = (lab.L + 16) / 116;
  const x = lab.a / 500 + y;
  const z = y - lab.b / 200;
  
  const delta = 6 / 29;
  const delta3 = delta * delta * delta;
  
  const f = (t: number) => {
    return t > delta 
      ? t * t * t 
      : 3 * delta * delta * (t - 4 / 29);
  };
  
  return {
    x: REF_X * f(x),
    y: REF_Y * f(y),
    z: REF_Z * f(z),
  };
}

/**
 * Convert XYZ to RGB
 */
export function xyzToRgb(xyz: XYZ): RGB {
  // Scale from 0-100 to 0-1
  const x = xyz.x / 100;
  const y = xyz.y / 100;
  const z = xyz.z / 100;
  
  // Apply XYZ to sRGB transformation matrix
  let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  let g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
  let b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
  
  // Apply inverse gamma correction
  const gamma = (c: number) => {
    return c > 0.0031308
      ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055
      : 12.92 * c;
  };
  
  r = gamma(r);
  g = gamma(g);
  b = gamma(b);
  
  // Convert to 0-255 and clamp
  return {
    r: Math.round(Math.max(0, Math.min(255, r * 255))),
    g: Math.round(Math.max(0, Math.min(255, g * 255))),
    b: Math.round(Math.max(0, Math.min(255, b * 255))),
  };
}

/**
 * Convert LAB to HEX
 */
export function labToHex(lab: LAB): string {
  const xyz = labToXyz(lab);
  const rgb = xyzToRgb(xyz);
  return rgbToHex(rgb);
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if a string is a valid HEX color
 */
export function isValidHex(hex: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

/**
 * Normalize HEX color to uppercase with #
 */
export function normalizeHex(hex: string): string {
  if (!isValidHex(hex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  
  let cleanHex = hex.replace(/^#/, '').toUpperCase();
  
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map(char => char + char)
      .join('');
  }
  
  return `#${cleanHex}`;
}
