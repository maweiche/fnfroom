"use client";

import type { ScoreboardGame } from "./scoreboard-types";

const sportAccentColors: Record<string, string> = {
  basketball: "bg-[hsl(27,65%,53%)]",
  football: "bg-[hsl(145,33%,27%)]",
  lacrosse: "bg-[hsl(213,52%,25%)]",
};

const sportLabels: Record<string, string> = {
  basketball: "BBall",
  football: "FB",
  lacrosse: "LAX",
};

const sportTextColors: Record<string, string> = {
  basketball: "text-[hsl(27,65%,53%)]",
  football: "text-[hsl(145,33%,27%)]",
  lacrosse: "text-[hsl(213,52%,40%)]",
};

function getSportAccent(sport: string) {
  return sportAccentColors[sport.toLowerCase()] ?? "bg-primary";
}

function getSportLabel(sport: string) {
  return sportLabels[sport.toLowerCase()] ?? sport;
}

function getSportTextColor(sport: string) {
  return sportTextColors[sport.toLowerCase()] ?? "text-primary";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function isToday(dateStr: string) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return dateStr === `${y}-${m}-${d}`;
}

function formatDate(dateStr: string) {
  if (isToday(dateStr)) return null;
  const parts = dateStr.split("-");
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  return `${MONTHS[month - 1]} ${day}`;
}

function shortenName(name: string | null): string | null {
  if (!name) return null;
  return name
    .replace(/ High School$/i, "")
    .replace(/ HS$/i, "")
    .replace(/ School$/i, "");
}

function TeamRow({
  name,
  score,
  isWinner,
  isFinal,
}: {
  name: string | null;
  score: number | null;
  isWinner: boolean;
  isFinal: boolean;
}) {
  const short = shortenName(name);
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        className={`truncate ${
          isFinal
            ? isWinner
              ? "font-semibold text-foreground"
              : "text-muted"
            : "text-foreground"
        }`}
      >
        {short ?? <span className="italic">TBD</span>}
      </span>
      {isFinal && (
        <span
          className={`font-mono tabular-nums flex-shrink-0 ${
            isWinner ? "font-bold text-primary" : "text-muted"
          }`}
        >
          {score ?? "-"}
        </span>
      )}
    </div>
  );
}

export function ScoreboardCard({ game }: { game: ScoreboardGame }) {
  const isFinal = game.status?.toLowerCase() === "final";
  const accent = getSportAccent(game.sport);
  const sportLabel = getSportLabel(game.sport);
  const sportColor = getSportTextColor(game.sport);
  const today = isToday(game.date);

  const homeWins =
    isFinal &&
    game.homeScore != null &&
    game.awayScore != null &&
    game.homeScore > game.awayScore;
  const awayWins =
    isFinal &&
    game.homeScore != null &&
    game.awayScore != null &&
    game.awayScore > game.homeScore;

  return (
    <div className="w-[180px] md:w-[200px] flex-shrink-0 snap-start rounded-lg border border-border/30 bg-card/60 backdrop-blur-sm overflow-hidden">
      {/* Sport accent bar */}
      <div className={`h-[2px] ${accent}`} />

      <div className="px-2.5 py-1.5 flex flex-col gap-0.5 text-[11px] md:text-xs">
        {isFinal ? (
          <>
            <TeamRow
              name={game.awayTeam.name}
              score={game.awayScore}
              isWinner={awayWins}
              isFinal
            />
            <TeamRow
              name={game.homeTeam.name}
              score={game.homeScore}
              isWinner={homeWins}
              isFinal
            />
            <div className="flex items-center justify-between mt-0.5">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-semibold ${sportColor}`}>
                  {sportLabel}
                </span>
                <span className="text-[10px] text-muted">
                  {today ? (
                    <span className="font-semibold text-primary">TODAY</span>
                  ) : (
                    formatDate(game.date)
                  )}
                </span>
              </div>
              <span className="text-[10px] font-semibold tracking-wide uppercase text-muted">
                FINAL
                {game.overtime && <span className="text-warning">/OT</span>}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="truncate text-foreground font-medium">
                {shortenName(game.awayTeam.name) ?? (
                  <span className="italic text-muted">TBD</span>
                )}
              </span>
              <span className="text-muted text-[10px]">vs</span>
              <span className="truncate text-foreground font-medium">
                {shortenName(game.homeTeam.name) ?? (
                  <span className="italic text-muted">TBD</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-semibold ${sportColor}`}>
                  {sportLabel}
                </span>
                <span className="text-[10px] text-muted">
                  {today ? (
                    <span className="font-semibold text-primary">TODAY</span>
                  ) : (
                    formatDate(game.date)
                  )}
                </span>
              </div>
              <span className="font-mono text-[10px] text-primary font-medium">
                {game.gameTime ?? <span className="text-muted">TBD</span>}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
