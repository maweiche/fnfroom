"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Sport } from "@/lib/utils";
import { CollapsibleSection } from "./collapsible-section";

export interface GameRow {
  id: string;
  date: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeTeamName: string | null;
  homeTeamKey: string | null;
  awayTeamName: string | null;
  awayTeamKey: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string | null;
  gameTime: string | null;
  isConference: boolean;
  overtime: boolean;
}

interface TeamScheduleProps {
  games: GameRow[];
  schoolId: string;
  sport: Sport;
}

function formatGameDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getResult(
  game: GameRow,
  schoolId: string
): { type: "win" | "loss" | "tie" | "scheduled"; label: string } {
  if (game.status !== "Final") {
    return { type: "scheduled", label: game.gameTime || "TBD" };
  }

  const isHome = game.homeTeamId === schoolId;
  const teamScore = isHome ? game.homeScore : game.awayScore;
  const oppScore = isHome ? game.awayScore : game.homeScore;

  if (teamScore === null || oppScore === null) {
    return { type: "scheduled", label: "—" };
  }

  if (teamScore > oppScore) {
    return { type: "win", label: `W ${teamScore}-${oppScore}` };
  } else if (teamScore < oppScore) {
    return { type: "loss", label: `L ${teamScore}-${oppScore}` };
  }
  return { type: "tie", label: `T ${teamScore}-${oppScore}` };
}

function GameRowItem({
  game,
  schoolId,
  sport,
}: {
  game: GameRow;
  schoolId: string;
  sport: Sport;
}) {
  const isHome = game.homeTeamId === schoolId;
  const opponentName = isHome ? game.awayTeamName : game.homeTeamName;
  const opponentKey = isHome ? game.awayTeamKey : game.homeTeamKey;
  const prefix = isHome ? "vs" : "@";
  const result = getResult(game, schoolId);
  const dateStr = formatGameDate(game.date);

  const borderColor =
    result.type === "win"
      ? "border-l-success"
      : result.type === "loss"
        ? "border-l-error"
        : "border-l-border";

  const scoreColor =
    result.type === "win"
      ? "text-success"
      : result.type === "loss"
        ? "text-error"
        : "text-muted";

  return (
    <div
      className={cn(
        "border-l-2 px-4 py-3 flex items-center gap-3 min-h-[44px]",
        borderColor
      )}
    >
      {/* Date */}
      <span className="text-xs text-muted w-12 flex-shrink-0 font-mono tabular-nums">
        {dateStr}
      </span>

      {/* Prefix + Opponent */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-xs text-muted flex-shrink-0">{prefix}</span>
        {opponentKey ? (
          <Link
            href={`/${sport}/teams/${opponentKey}`}
            className="text-sm font-medium text-foreground hover:text-primary truncate transition-colors"
          >
            {opponentName || "Unknown"}
          </Link>
        ) : (
          <span className="text-sm font-medium text-foreground truncate">
            {opponentName || "Unknown"}
          </span>
        )}
        {game.isConference && (
          <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded flex-shrink-0 uppercase">
            Conf
          </span>
        )}
      </div>

      {/* Score / Time */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span
          className={cn(
            "text-sm font-mono tabular-nums font-semibold",
            scoreColor
          )}
        >
          {result.label}
        </span>
        {game.overtime && result.type !== "scheduled" && (
          <span className="text-[10px] text-muted font-semibold">OT</span>
        )}
      </div>
    </div>
  );
}

export function TeamSchedule({ games, schoolId, sport }: TeamScheduleProps) {
  const upcoming = games
    .filter((g) => g.status === "Scheduled")
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const results = games
    .filter((g) => g.status === "Final")
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  const totalGames = games.length;

  return (
    <CollapsibleSection title="Schedule" badge={totalGames} defaultOpen>
      {totalGames === 0 ? (
        <div className="text-center py-10">
          <Calendar className="w-8 h-8 text-muted mx-auto mb-3" />
          <p className="text-secondary text-sm">
            No games scheduled yet for this season.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
                Upcoming
              </h3>
              <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
                {upcoming.map((g) => (
                  <GameRowItem
                    key={g.id}
                    game={g}
                    schoolId={schoolId}
                    sport={sport}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
                Results
              </h3>
              <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
                {results.map((g) => (
                  <GameRowItem
                    key={g.id}
                    game={g}
                    schoolId={schoolId}
                    sport={sport}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </CollapsibleSection>
  );
}
