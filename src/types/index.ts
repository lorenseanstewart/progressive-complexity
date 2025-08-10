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

export interface ProductUpdate {
  id: number;
  field: keyof Pick<Product, 'price' | 'quantity' | 'name'>;
  value: string | number;
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

export interface SearchParams {
  searchTerm?: string;
  searchField?: keyof Product;
}

export interface ProductsResponse {
  data: Product[];
  pagination: PaginationParams;
  totals: ProductTotals;
  params: QueryParams;
}

export interface ProductTotals {
  totalPrice: number;
  totalQuantity: number;
  grandTotal: number;
  averagePrice: number;
  productCount: number;
}

export interface QueryParams extends SortParams, SearchParams {
  page: number;
  limit: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

// Form Data types
export interface ProductFormData {
  price?: string;
  quantity?: string;
  name?: string;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: keyof Product;
  message: string;
  value?: any;
}

// Event types for HTMX integration
export interface HtmxEvent extends CustomEvent {
  detail: {
    elt: HTMLElement;
    xhr: XMLHttpRequest;
    target: HTMLElement;
    requestConfig: HtmxRequestConfig;
  };
}

export interface HtmxRequestConfig {
  path: string;
  verb: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  target: string;
  swap: 'innerHTML' | 'outerHTML' | 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';
  values?: Record<string, any>;
}

// Component Props types
export interface TableProps {
  products: Product[];
  pagination: PaginationParams;
  sortParams: SortParams;
  searchParams: SearchParams;
}

export interface ProductRowProps {
  product: Product;
  index: number;
  isOptimistic?: boolean;
}

export interface TotalsSummaryProps {
  totals: ProductTotals;
  isOob?: boolean;
}

export interface TableHeaderProps {
  field: keyof Product;
  label: string;
  searchable?: boolean;
  sortable?: boolean;
  currentSort?: SortParams;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys];

export type Nullable<T> = T | null | undefined;

// Store types for client-side state
export interface StoreState {
  products: Map<number, Product>;
  optimisticUpdates: Map<number, Partial<Product>>;
  pendingRequests: Set<string>;
  errors: Map<string, ApiError>;
}

export interface StoreActions {
  updateProduct: (id: number, updates: Partial<Product>) => void;
  setOptimisticUpdate: (id: number, updates: Partial<Product>) => void;
  clearOptimisticUpdate: (id: number) => void;
  addPendingRequest: (requestId: string) => void;
  removePendingRequest: (requestId: string) => void;
  setError: (key: string, error: ApiError) => void;
  clearError: (key: string) => void;
}

// Type guards
export function isProduct(obj: any): obj is Product {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.price === 'number' &&
    typeof obj.quantity === 'number'
  );
}

export function isApiError(obj: any): obj is ApiError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.code === 'string' &&
    typeof obj.message === 'string'
  );
}

export function isValidationError(obj: any): obj is ValidationError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.field === 'string' &&
    typeof obj.message === 'string'
  );
}

// Constants with type safety
export const PRODUCT_FIELDS = ['id', 'name', 'price', 'quantity', 'category'] as const;
export type ProductField = typeof PRODUCT_FIELDS[number];

export const SORT_ORDERS = ['asc', 'desc'] as const;
export type SortOrder = typeof SORT_ORDERS[number];

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type HttpMethod = typeof HTTP_METHODS[number];

// Branded types for extra type safety
export type ProductId = number & { readonly brand: unique symbol };
export type Price = number & { readonly brand: unique symbol };
export type Quantity = number & { readonly brand: unique symbol };

// Helper functions to create branded types
export function toProductId(id: number): ProductId {
  return id as ProductId;
}

export function toPrice(price: number): Price {
  if (price < 0) throw new Error('Price cannot be negative');
  return price as Price;
}

export function toQuantity(quantity: number): Quantity {
  if (quantity < 0) throw new Error('Quantity cannot be negative');
  if (!Number.isInteger(quantity)) throw new Error('Quantity must be an integer');
  return quantity as Quantity;
}