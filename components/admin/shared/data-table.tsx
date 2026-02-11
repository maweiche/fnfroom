"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  className,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison = aVal < bVal ? -1 : 1;
        return sortDirection === "asc" ? comparison : -comparison;
      })
    : data;

  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/10 border-b-2 border-border">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "text-left px-4 py-3 text-xs uppercase tracking-wide font-semibold text-secondary",
                  column.sortable && "cursor-pointer select-none hover:text-foreground",
                  column.className
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && (
                    <span className="text-muted">
                      {sortKey === column.key ? (
                        sortDirection === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm">
          {sortedData.map((row, index) => (
            <tr
              key={index}
              className={cn(
                "border-b border-border transition-colors",
                onRowClick
                  ? "cursor-pointer hover:bg-primary/5"
                  : "hover:bg-muted/5"
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-3 font-mono tabular-nums",
                    column.className
                  )}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
          {sortedData.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-muted"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
