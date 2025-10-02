import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 

// Ceil to two decimals and normalize representation
export function ceilToTwoDecimals(value: number): number {
  if (typeof value !== 'number' || !isFinite(value)) return value;
  if (Number.isInteger(value)) return value;
  const scaled = Math.ceil((value * 100) - 1e-10);
  return Number((scaled / 100).toFixed(2));
}