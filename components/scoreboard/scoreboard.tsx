import { prisma } from "@/lib/prisma";
import { ScoreboardTicker } from "./scoreboard-ticker";
import type { ScoreboardGame } from "./scoreboard-types";

async function getScoreboardGames(): Promise<ScoreboardGame[]> {
  try {
    // Use Eastern time since this is a NC sports site
    const now = new Date();
    const eastern = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const y = eastern.getFullYear();
    const m = String(eastern.getMonth() + 1).padStart(2, "0");
    const d = String(eastern.getDate()).padStart(2, "0");
    const today = `${y}-${m}-${d}`;

    const weekAgo = new Date(eastern);
    weekAgo.setDate(eastern.getDate() - 7);
    const weekAgoStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, "0")}-${String(weekAgo.getDate()).padStart(2, "0")}`;

    const weekAhead = new Date(eastern);
    weekAhead.setDate(eastern.getDate() + 7);
    const weekAheadStr = `${weekAhead.getFullYear()}-${String(weekAhead.getMonth() + 1).padStart(2, "0")}-${String(weekAhead.getDate()).padStart(2, "0")}`;

    const games = await prisma.$queryRaw<
      Array<{
        id: string;
        date: string;
        sport: string;
        status: string | null;
        home_score: number | null;
        away_score: number | null;
        game_time: string | null;
        overtime: boolean;
        home_name: string | null;
        home_key: string | null;
        away_name: string | null;
        away_key: string | null;
      }>
    >`
      SELECT
        g.id,
        g.date::text,
        g.sport,
        g.status,
        g.home_score,
        g.away_score,
        g.game_time,
        g.overtime,
        hs.name AS home_name,
        hs.key AS home_key,
        aws.name AS away_name,
        aws.key AS away_key
      FROM games g
      LEFT JOIN schools hs ON g.home_team_id = hs.id
      LEFT JOIN schools aws ON g.away_team_id = aws.id
      WHERE g.deleted_at IS NULL
        AND (
          (g.date >= ${weekAgoStr}::date AND g.date <= ${today}::date AND LOWER(g.status) = 'final')
          OR
          (g.date >= ${today}::date AND g.date <= ${weekAheadStr}::date AND LOWER(g.status) = 'scheduled')
        )
      ORDER BY
        CASE WHEN g.date::text = ${today} THEN 0 ELSE 1 END,
        g.date DESC,
        g.sport
      LIMIT 30
    `;

    return games.map((g) => ({
      id: g.id,
      date: g.date,
      sport: g.sport,
      status: g.status,
      homeTeam: { name: g.home_name, key: g.home_key },
      awayTeam: { name: g.away_name, key: g.away_key },
      homeScore: g.home_score,
      awayScore: g.away_score,
      gameTime: g.game_time,
      overtime: g.overtime,
    }));
  } catch (error) {
    console.error("Scoreboard fetch error:", error);
    return [];
  }
}

export async function Scoreboard() {
  const games = await getScoreboardGames();

  if (games.length === 0) return null;

  return (
    <div className="w-full bg-background/80 backdrop-blur-md border-b border-border/50">
      <ScoreboardTicker games={games} />
    </div>
  );
}
