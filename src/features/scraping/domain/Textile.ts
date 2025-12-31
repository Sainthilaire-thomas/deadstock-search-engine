/**
 * Domain Entity: Textile
 * 
 * Représente un textile avec ses règles métier
 */

export class Textile {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public materialType: string | null,
    public color: string | null,
    public composition: Record<string, number> | null,
    public quantityValue: number,
    public quantityUnit: string,
    public priceValue: number,
    public priceCurrency: string,
    public sourcePlatform: string,
    public sourceUrl: string,
    public sourceProductId: string,
    public supplierName: string | null,
    public available: boolean,
    public imageUrl: string | null,
    public rawData: any,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {
    this.validate();
  }
  
  /**
   * Business Rules: Validation
   */
  private validate(): void {
    if (this.name.trim().length === 0) {
      throw new Error('Textile name cannot be empty');
    }
    
    if (this.priceValue < 0) {
      throw new Error('Price cannot be negative');
    }
    
    if (this.quantityValue <= 0) {
      throw new Error('Quantity must be positive');
    }
    
    if (!this.sourceUrl || !this.sourceUrl.startsWith('http')) {
      throw new Error('Source URL must be a valid URL');
    }
  }
  
  /**
   * Business Query: Est-ce un textile disponible ?
   */
  isAvailable(): boolean {
    return this.available;
  }
  
  /**
   * Business Query: A-t-il une image ?
   */
  hasImage(): boolean {
    return this.imageUrl !== null && this.imageUrl.length > 0;
  }
  
  /**
   * Business Query: Est-ce normalisé ?
   */
  isNormalized(): boolean {
    return this.materialType !== null && this.materialType !== 'unknown';
  }
}
