import type { Price, Quantity } from '../types';

export interface CurrencyFormatOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatCurrency(
  value: number | Price,
  options: CurrencyFormatOptions = {}
): string {
  const {
    locale = "en-US",
    currency = "USD",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;
  
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
}

export function parseNumber(input: string | null | undefined): number {
  if (input == null) return 0;
  let s: string = String(input).trim();
  if (!s) return 0;
  
  // Remove thousands separators and spaces
  s = s.replace(/\s|,/g, "");
  
  // If using decimal comma and no dot
  if (!s.includes(".") && s.includes(",")) {
    s = s.replace(",", ".");
  }
  
  const n: number = Number.parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

export function formatQuantity(value: number | Quantity): string {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
}

export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
