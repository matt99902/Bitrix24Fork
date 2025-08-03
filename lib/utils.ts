import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: value >= 1000000 ? "compact" : "standard",
    compactDisplay: "short",
  }).format(value);
}

export function formatNumberWithCommas(x: string) {
  if (!x) return "";
  // Remove all non-digit characters (except dot for decimals)
  const parts = x.replace(/,/g, "").split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

// Remove commas for search
export function unformatNumber(x: string) {
  return x.replace(/,/g, "");
}
