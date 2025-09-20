// Pagination constants
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Sort constants
export const DEFAULT_SORT_BY = 'id';
export const DEFAULT_SORT_ORDER = 'asc';

// UI constants
export const DEBOUNCE_DELAY = 300; // milliseconds
export const SWAP_DELAY = 500; // milliseconds for HTMX swap animations

// Table state defaults
export const TABLE_DEFAULTS = {
  page: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  sortBy: DEFAULT_SORT_BY,
  sortOrder: DEFAULT_SORT_ORDER,
  searchTerm: '',
} as const;

// Re-export the PAGE_SIZE for backward compatibility
export { PAGE_SIZE } from './store';