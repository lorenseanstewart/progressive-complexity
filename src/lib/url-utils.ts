export interface UrlParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  searchTerm?: string;
  [key: string]: string | number | undefined;
}

export function buildUrl(params: UrlParams): string {
  const baseUrl =
    typeof window !== 'undefined' && window.location?.href
      ? window.location.href
      : 'http://localhost/';

  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.pathname + url.search;
}

export function buildUrlFromBase(basePath: string, params: UrlParams): string {
  const url = new URL(basePath, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.pathname + url.search;
}

export function buildDeleteUrl(productId: number, params: UrlParams): string {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.set(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  return `/api/products/${productId}${queryString ? '?' + queryString : ''}`;
}

export function getUrlParams(url: string | URL): UrlParams {
  const urlObj = typeof url === 'string' ? new URL(url) : url;
  const params: UrlParams = {};

  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}