// src/types/colorthief.d.ts
// Type declarations for colorthief module

declare module 'colorthief' {
  type RGBColor = [number, number, number];

  export default class ColorThief {
    /**
     * Get the dominant color from an image
     * @param img HTML Image element or image source
     * @param quality Quality setting (1 = best, 10 = fastest). Default: 10
     * @returns RGB color array [r, g, b]
     */
    getColor(img: HTMLImageElement | null, quality?: number): RGBColor;

    /**
     * Get a color palette from an image
     * @param img HTML Image element or image source
     * @param colorCount Number of colors to return (2-256). Default: 10
     * @param quality Quality setting (1 = best, 10 = fastest). Default: 10
     * @returns Array of RGB color arrays [[r, g, b], ...]
     */
    getPalette(
      img: HTMLImageElement | null,
      colorCount?: number,
      quality?: number
    ): RGBColor[];
  }
}
