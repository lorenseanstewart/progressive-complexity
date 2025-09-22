// Type guards and validation utilities
import type { Product, SortOrder } from '../types';

// Type predicate for Product validation
export function isValidProduct(obj: unknown): obj is Product {
  if (!obj || typeof obj !== 'object') return false;

  const product = obj as Record<string, unknown>;

  return (
    typeof product.id === 'number' &&
    typeof product.name === 'string' &&
    typeof product.price === 'number' &&
    typeof product.quantity === 'number' &&
    typeof product.category === 'string' &&
    product.price >= 0 &&
    product.quantity >= 0
  );
}

// Type predicate for SortOrder
export function isValidSortOrder(value: unknown): value is SortOrder {
  return value === 'asc' || value === 'desc';
}

// Type predicate for Product field names
export function isProductField(field: unknown): field is keyof Product {
  const validFields: (keyof Product)[] = ['id', 'name', 'price', 'quantity', 'category', 'description'];
  return typeof field === 'string' && validFields.includes(field as keyof Product);
}

// Safe type assertion with validation
export function assertProduct(obj: unknown): Product {
  if (!isValidProduct(obj)) {
    throw new Error('Invalid product data structure');
  }
  return obj;
}

// Safe element casting with validation
export function getTypedElement<T extends HTMLElement>(
  selector: string,
  expectedType: { new(): T }
): T | null {
  if (typeof document === 'undefined') return null;

  const element = document.querySelector(selector);
  if (!element) return null;

  if (!(element instanceof expectedType)) {
    console.warn(`Element ${selector} is not of expected type ${expectedType.name}`);
    return null;
  }

  return element as T;
}

// Safe number parsing with validation
export function parseNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

// Safe integer parsing with validation
export function parseInteger(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

// Validate and sanitize search terms
export function sanitizeSearchTerm(term: unknown): string {
  if (typeof term !== 'string') return '';

  // Remove potentially dangerous characters while preserving search functionality
  return term
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .slice(0, 100); // Limit length
}

// Type-safe property access
export function getProperty<T, K extends keyof T>(
  obj: T,
  key: K
): T[K] | undefined {
  try {
    return obj[key];
  } catch {
    return undefined;
  }
}