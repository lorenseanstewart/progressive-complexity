// Import from centralized config
import { UI_CONSTANTS, PAGINATION, API_DEFAULTS } from './config';

// Pagination constants
export const DEFAULT_PAGE = UI_CONSTANTS.DEFAULT_PAGE;
export const DEFAULT_PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE;
export const MAX_PAGE_SIZE = PAGINATION.MAX_PAGE_SIZE;

// Sort constants
export const DEFAULT_SORT_BY = API_DEFAULTS.DEFAULT_SORT_FIELD;
export const DEFAULT_SORT_ORDER = API_DEFAULTS.DEFAULT_SORT_ORDER;

// UI constants
export const DEBOUNCE_DELAY = UI_CONSTANTS.DEBOUNCE_DELAY;
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