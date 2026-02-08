import { TrendingUp, TrendingDown, Minus, Star } from "lucide-react";
import type { RankingEntry } from "@/lib/sanity.types";
import { cn } from "@/lib/utils";

interface RankingsTableProps {
  entries: RankingEntry[];
  className?: string;
}

function TrendIndicator({ trend }: { trend?: string }) {
  if (!trend) return null;

  const indicators = {
    up: <TrendingUp className="w-4 h-4 text-success" />,
    down: <TrendingDown className="w-4 h-4 text-error" />,
    steady: <Minus className="w-4 h-4 text-muted" />,
    new: <Star className="w-4 h-4 text-primary" />,
  };

  return indicators[trend as keyof typeof indicators] || null;
}

export function RankingsTable({ entries, className }: RankingsTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/10 border-b-2 border-border">
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wide font-semibold text-secondary">
              Rank
            </th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wide font-semibold text-secondary">
              Team
            </th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wide font-semibold text-secondary">
              Record
            </th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wide font-semibold text-secondary hidden md:table-cell">
              Conference
            </th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wide font-semibold text-secondary hidden sm:table-cell">
              Prev
            </th>
            <th className="text-center px-4 py-3 text-xs uppercase tracking-wide font-semibold text-secondary">
              Trend
            </th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {entries.map((entry, index) => (
            <tr
              key={index}
              className="border-b border-border hover:bg-muted/5 transition-colors"
            >
              {/* Rank */}
              <td className="px-4 py-3 font-mono font-bold tabular-nums">
                {entry.rank}
              </td>

              {/* Team */}
              <td className="px-4 py-3 font-medium">{entry.team}</td>

              {/* Record */}
              <td className="px-4 py-3 font-mono tabular-nums">
                {entry.record}
              </td>

              {/* Conference */}
              <td className="px-4 py-3 text-secondary hidden md:table-cell">
                {entry.conference || "—"}
              </td>

              {/* Previous Rank */}
              <td className="px-4 py-3 font-mono tabular-nums text-muted hidden sm:table-cell">
                {entry.previousRank || "NR"}
              </td>

              {/* Trend */}
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  <TrendIndicator trend={entry.trend} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
