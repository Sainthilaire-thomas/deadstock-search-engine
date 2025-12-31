/**
 * Domain: Normalization Value Objects
 * 
 * Value Objects pour les types de matériaux, couleurs, etc.
 */

/**
 * Value Object: MaterialType
 * Représente un type de matériau normalisé
 */
export class MaterialType {
  constructor(public readonly value: string) {
    if (value.trim().length === 0) {
      throw new Error('Material type cannot be empty');
    }
    
    // Normaliser en lowercase
    this.value = value.toLowerCase().trim();
  }
  
  equals(other: MaterialType): boolean {
    return this.value === other.value;
  }
  
  toString(): string {
    return this.value;
  }
  
  /**
   * Vérifier si c'est une matière naturelle
   */
  isNatural(): boolean {
    const naturalMaterials = [
      'cotton', 'silk', 'wool', 'linen', 'cashmere', 
      'mohair', 'alpaca', 'hemp', 'jute'
    ];
    return naturalMaterials.includes(this.value);
  }
  
  /**
   * Vérifier si c'est une matière synthétique
   */
  isSynthetic(): boolean {
    const syntheticMaterials = [
      'polyester', 'nylon', 'acrylic', 'spandex', 
      'elastane', 'lycra', 'rayon'
    ];
    return syntheticMaterials.includes(this.value);
  }
}

/**
 * Value Object: Color
 * Représente une couleur normalisée
 */
export class Color {
  constructor(public readonly value: string) {
    if (value.trim().length === 0) {
      throw new Error('Color cannot be empty');
    }
    
    // Normaliser en lowercase
    this.value = value.toLowerCase().trim();
  }
  
  equals(other: Color): boolean {
    return this.value === other.value;
  }
  
  toString(): string {
    return this.value;
  }
}

/**
 * Value Object: Pattern
 * Représente un motif normalisé
 */
export class Pattern {
  constructor(public readonly value: string) {
    if (value.trim().length === 0) {
      throw new Error('Pattern cannot be empty');
    }
    
    // Normaliser en lowercase
    this.value = value.toLowerCase().trim();
  }
  
  equals(other: Pattern): boolean {
    return this.value === other.value;
  }
  
  toString(): string {
    return this.value;
  }
  
  /**
   * Vérifier si c'est un motif géométrique
   */
  isGeometric(): boolean {
    const geometricPatterns = [
      'stripes', 'checks', 'polka dots', 'geometric', 
      'chevron', 'zigzag'
    ];
    return geometricPatterns.includes(this.value);
  }
  
  /**
   * Vérifier si c'est un motif naturel
   */
  isNatural(): boolean {
    const naturalPatterns = [
      'floral', 'paisley', 'animal print', 'leaf', 'botanical'
    ];
    return naturalPatterns.includes(this.value);
  }
}
