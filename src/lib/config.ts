// Configuration constants for the application

export const VALIDATION_RULES = {
  // Price validation rules
  FORBIDDEN_PRICE: 99.99, // Demo rule to show error handling
  MIN_PRICE: 0,
  MAX_PRICE: 999999.99,

  // Quantity validation rules
  MIN_QUANTITY: 0,
  MAX_QUANTITY: 999999,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MIN_PAGE_SIZE: 1,
  MAX_PAGE_SIZE: 100,
} as const;

export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300, // milliseconds for search input debounce
  DEFAULT_PAGE: 1,
} as const;

export const API_DEFAULTS = {
  DEFAULT_SORT_FIELD: 'id' as const,
  DEFAULT_SORT_ORDER: 'asc' as const,
  DEFAULT_SEARCH_FIELD: 'name' as const,
} as const;