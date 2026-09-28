export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num || 0);
}

export function formatNumber(value: number | string, unit?: string): string {
  const num = typeof value === "string" ? Number(value) : value;
  const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(num || 0);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export function formatDateShort(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}
