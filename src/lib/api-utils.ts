import { PAGE_SIZE, getProducts, getAllTotals } from "./store";

export interface ApiParams {
  page: number;
  pageSize: number;
  sort: string;
  sortDir: "asc" | "desc";
  searchTerm: string;
}

export function parseApiParams(request: Request): ApiParams {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("limit") || String(PAGE_SIZE));
  const sort = (url.searchParams.get("sortBy") || "id") as any;
  const sortDir = (url.searchParams.get("sortOrder") || "asc") as "asc" | "desc";
  const searchTerm = url.searchParams.get("searchTerm") || "";

  return { page, pageSize, sort, sortDir, searchTerm };
}

export function getTableData(params: ApiParams) {
  const { data, total } = getProducts({
    page: params.page,
    pageSize: params.pageSize,
    sort: params.sort,
    sortDir: params.sortDir,
    searchField: "name",
    searchTerm: params.searchTerm || undefined,
  });
  const totals = getAllTotals();

  return { data, total, totals };
}