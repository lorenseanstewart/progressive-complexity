// Core domain types with comprehensive type safety

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SortParams {
  sortBy: keyof Product | 'subtotal';
  sortOrder: 'asc' | 'desc';
}

export interface ProductTotals {
  totalPrice: number;
  totalQuantity: number;
  grandTotal: number;
  averagePrice: number;
  productCount: number;
}

// Type aliases for better readability
export type SortOrder = 'asc' | 'desc';