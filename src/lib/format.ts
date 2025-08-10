export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function parseNumber(input: string | null | undefined): number {
  if (input == null) return 0;
  let s = String(input).trim();
  if (!s) return 0;
  // Remove thousands separators and spaces
  s = s.replace(/\s|,/g, "");
  // If using decimal comma and no dot
  if (!s.includes(".") && s.includes(",")) {
    s = s.replace(",", ".");
  }
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}
