import { PAGE_SIZE, getProducts, getAllTotals, type ProductWithCurrency } from "./store";
import type { 
  ProductTotals,
  SortOrder,
  Product,
  PaginationParams
} from '../types';

export interface ApiParams {
  page: number;
  pageSize: number;
  sort: keyof Product | 'subtotal';
  sortDir: SortOrder;
  searchTerm: string;
  searchField?: keyof Product;
}

export interface TableDataResponse {
  data: ProductWithCurrency[];
  total: number;
  totals: ProductTotals;
  pagination: PaginationParams;
}

export function parseApiParams(request: Request): ApiParams {
  const url = new URL(request.url);
  const page: number = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const pageSize: number = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || String(PAGE_SIZE), 10)));
  const sort = (url.searchParams.get("sortBy") || "id") as keyof Product | 'subtotal';
  const sortDir = (url.searchParams.get("sortOrder") || "asc") as SortOrder;
  const searchTerm: string = url.searchParams.get("searchTerm") || "";
  const searchField = url.searchParams.get("searchField") as keyof Product | undefined;
  return { 
    page, 
    pageSize, 
    sort, 
    sortDir, 
    searchTerm,
    searchField: searchField || 'name'
  };
}

export function getTableData(params: ApiParams): TableDataResponse {
  const { data, total } = getProducts({
    page: params.page,
    pageSize: params.pageSize,
    sort: params.sort === 'subtotal' ? 'price' : params.sort,
    sortDir: params.sortDir,
    searchField: params.searchField || "name",
    searchTerm: params.searchTerm || undefined,
  });
  
  const totals = getAllTotals();
  const totalPages = Math.ceil(total / params.pageSize);
  
  const pagination: PaginationParams = {
    page: params.page,
    limit: params.pageSize,
    total,
    totalPages,
    hasNext: params.page < totalPages,
    hasPrev: params.page > 1
  };

  return { 
    data, 
    total, 
    totals,
    pagination
  };
}

