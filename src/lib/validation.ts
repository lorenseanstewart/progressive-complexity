import type { 
  Product, 
  ValidationResult, 
  ValidationError,
  ProductFormData,
  Price,
  Quantity
} from '../types';

export class ValidationService {
  private static readonly MIN_PRICE = 0.01;
  private static readonly MAX_PRICE = 999999.99;
  private static readonly MIN_QUANTITY = 0;
  private static readonly MAX_QUANTITY = 9999;
  private static readonly MIN_NAME_LENGTH = 3;
  private static readonly MAX_NAME_LENGTH = 100;

  static validatePrice(value: number | string): ValidationResult {
    const errors: ValidationError[] = [];
    const price = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(price)) {
      errors.push({
        field: 'price',
        message: 'Price must be a valid number',
        value
      });
    } else if (price < this.MIN_PRICE) {
      errors.push({
        field: 'price',
        message: `Price must be at least $${this.MIN_PRICE}`,
        value: price
      });
    } else if (price > this.MAX_PRICE) {
      errors.push({
        field: 'price',
        message: `Price must not exceed $${this.MAX_PRICE}`,
        value: price
      });
    } else if (price === 99.99) {
      // Demo error case
      errors.push({
        field: 'price',
        message: 'Price cannot be $99.99 (demo error)',
        value: price
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateQuantity(value: number | string): ValidationResult {
    const errors: ValidationError[] = [];
    const quantity = typeof value === 'string' ? parseInt(value, 10) : value;

    if (isNaN(quantity)) {
      errors.push({
        field: 'quantity',
        message: 'Quantity must be a valid integer',
        value
      });
    } else if (quantity < this.MIN_QUANTITY) {
      errors.push({
        field: 'quantity',
        message: `Quantity cannot be negative`,
        value: quantity
      });
    } else if (quantity > this.MAX_QUANTITY) {
      errors.push({
        field: 'quantity',
        message: `Quantity must not exceed ${this.MAX_QUANTITY}`,
        value: quantity
      });
    } else if (!Number.isInteger(quantity)) {
      errors.push({
        field: 'quantity',
        message: 'Quantity must be a whole number',
        value: quantity
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateProductName(name: string): ValidationResult {
    const errors: ValidationError[] = [];
    const trimmedName = name.trim();

    if (!trimmedName) {
      errors.push({
        field: 'name',
        message: 'Product name is required',
        value: name
      });
    } else if (trimmedName.length < this.MIN_NAME_LENGTH) {
      errors.push({
        field: 'name',
        message: `Product name must be at least ${this.MIN_NAME_LENGTH} characters`,
        value: name
      });
    } else if (trimmedName.length > this.MAX_NAME_LENGTH) {
      errors.push({
        field: 'name',
        message: `Product name must not exceed ${this.MAX_NAME_LENGTH} characters`,
        value: name
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateProduct(product: Partial<Product>): ValidationResult {
    const errors: ValidationError[] = [];

    if (product.price !== undefined) {
      const priceValidation = this.validatePrice(product.price);
      errors.push(...priceValidation.errors);
    }

    if (product.quantity !== undefined) {
      const quantityValidation = this.validateQuantity(product.quantity);
      errors.push(...quantityValidation.errors);
    }

    if (product.name !== undefined) {
      const nameValidation = this.validateProductName(product.name);
      errors.push(...nameValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateFormData(formData: ProductFormData): ValidationResult {
    const errors: ValidationError[] = [];

    if (formData.price !== undefined) {
      const priceValidation = this.validatePrice(formData.price);
      errors.push(...priceValidation.errors);
    }

    if (formData.quantity !== undefined) {
      const quantityValidation = this.validateQuantity(formData.quantity);
      errors.push(...quantityValidation.errors);
    }

    if (formData.name !== undefined) {
      const nameValidation = this.validateProductName(formData.name);
      errors.push(...nameValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitizePrice(value: number | string): Price | null {
    const validation = this.validatePrice(value);
    if (!validation.isValid) return null;
    
    const price = typeof value === 'string' ? parseFloat(value) : value;
    return Math.round(price * 100) / 100 as Price;
  }

  static sanitizeQuantity(value: number | string): Quantity | null {
    const validation = this.validateQuantity(value);
    if (!validation.isValid) return null;
    
    const quantity = typeof value === 'string' ? parseInt(value, 10) : value;
    return quantity as Quantity;
  }

  static getErrorMessage(errors: ValidationError[]): string {
    if (errors.length === 0) return '';
    return errors.map(e => e.message).join(', ');
  }

  static getFieldErrors(errors: ValidationError[], field: keyof Product): ValidationError[] {
    return errors.filter(e => e.field === field);
  }
}

// Export convenience functions
export const validatePrice = ValidationService.validatePrice.bind(ValidationService);
export const validateQuantity = ValidationService.validateQuantity.bind(ValidationService);
export const validateProductName = ValidationService.validateProductName.bind(ValidationService);
export const validateProduct = ValidationService.validateProduct.bind(ValidationService);
export const validateFormData = ValidationService.validateFormData.bind(ValidationService);
export const sanitizePrice = ValidationService.sanitizePrice.bind(ValidationService);
export const sanitizeQuantity = ValidationService.sanitizeQuantity.bind(ValidationService);
export const getErrorMessage = ValidationService.getErrorMessage.bind(ValidationService);
export const getFieldErrors = ValidationService.getFieldErrors.bind(ValidationService);