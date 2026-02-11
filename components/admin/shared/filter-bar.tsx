"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  className?: string;
}

export function FilterBar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-col md:flex-row gap-4", className)}>
      {/* Search input */}
      {onSearchChange && (
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}

      {/* Filter dropdowns */}
      {filters.map((filter) => (
        <div key={filter.label} className="flex-shrink-0">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
