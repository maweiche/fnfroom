import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Sport = "basketball" | "football" | "lacrosse";

export const sportColors = {
  basketball: "bg-basketball",
  football: "bg-football",
  lacrosse: "bg-lacrosse",
} as const;

export const sportLabels = {
  basketball: "Basketball",
  football: "Football",
  lacrosse: "Lacrosse",
} as const;

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}
