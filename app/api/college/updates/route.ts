import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sport = searchParams.get("sport");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Fetch college players with their recent stats
    const collegeUpdates = await prisma.$queryRaw<
      Array<{
        player_id: string;
        first_name: string;
        last_name: string;
        position: string | null;
        high_school: string | null;
        college_name: string;
        college_division: string | null;
        college_class_year: string | null;
        sport: string;
        season: string;
        stat_type: string;
        value: number;
        per_game_value: number | null;
        games_played: number | null;
        updated_at: string;
      }>
    >`
      SELECT DISTINCT ON (p.id, ps.sport)
        p.id as player_id,
        p.first_name,
        p.last_name,
        p.position,
        p.maxpreps_school_name as high_school,
        p.college_name,
        p.college_division,
        p.college_class_year,
        ps.sport,
        ps.season,
        ps.stat_type,
        ps.value,
        ps.per_game_value,
        ps.games_played,
        p.updated_at
      FROM players p
      INNER JOIN player_stats ps ON p.id = ps.player_id
      WHERE p.college_name IS NOT NULL
        ${sport ? prisma.$queryRawUnsafe(`AND ps.sport = '${sport}'`) : prisma.$queryRawUnsafe("")}
        AND ps.season = '24-25'
      ORDER BY p.id, ps.sport, ps.value DESC, p.updated_at DESC
      LIMIT ${limit}
    `;

    // Transform to match expected format
    const formattedUpdates = collegeUpdates.map((update) => ({
      id: update.player_id,
      playerName: `${update.first_name} ${update.last_name}`,
      position: update.position || "N/A",
      college: update.college_name,
      division: update.college_division || "Division I",
      sport: update.sport.toLowerCase(),
      highSchool: update.high_school || "NC",
      classYear: update.college_class_year || "2024",
      stats: formatStats(update),
      value: update.value,
      perGameValue: update.per_game_value,
      gamesPlayed: update.games_played,
      updatedAt: update.updated_at,
    }));

    return Response.json({
      totalUpdates: formattedUpdates.length,
      updates: formattedUpdates,
    });
  } catch (error) {
    console.error("Error fetching college updates:", error);
    return Response.json(
      { error: "Failed to fetch college updates" },
      { status: 500 }
    );
  }
}

function formatStats(update: {
  stat_type: string;
  value: number;
  per_game_value: number | null;
  games_played: number | null;
  sport: string;
}): string {
  const statLabel = update.stat_type.toUpperCase();
  const total = update.value;
  const perGame = update.per_game_value ? ` (${update.per_game_value.toFixed(1)}/game)` : "";

  // Sport-specific formatting
  if (update.sport === "basketball") {
    if (update.stat_type === "points") {
      return `${total} PTS${perGame}`;
    } else if (update.stat_type === "rebounds") {
      return `${total} REB${perGame}`;
    } else if (update.stat_type === "assists") {
      return `${total} AST${perGame}`;
    }
  } else if (update.sport === "football") {
    if (update.stat_type === "rushing_yards") {
      return `${total} YDS${perGame}`;
    } else if (update.stat_type === "passing_yards") {
      return `${total} YDS${perGame}`;
    }
  } else if (update.sport === "lacrosse") {
    if (update.stat_type === "goals") {
      return `${total} G${perGame}`;
    } else if (update.stat_type === "assists") {
      return `${total} A${perGame}`;
    }
  }

  return `${total} ${statLabel}${perGame}`;
}
