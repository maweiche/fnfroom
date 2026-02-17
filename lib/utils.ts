import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sport types supported by the platform
 */
export type Sport = "basketball" | "football" | "lacrosse";

/**
 * Sport display labels
 */
export const sportLabels: Record<Sport, string> = {
  basketball: "Basketball",
  football: "Football",
  lacrosse: "Lacrosse",
};

/**
 * Sport color mappings for design system
 */
export const sportColors: Record<Sport, string> = {
  basketball: "#F97316", // orange
  football: "#94d873",   // green (primary)
  lacrosse: "#3B82F6",   // blue
};

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string or date that can be parsed
 * @returns Formatted date string (e.g., "Feb 8, 2026")
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ? new Date(dateString + "T12:00:00")
    : new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
