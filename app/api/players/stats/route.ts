import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sport = searchParams.get("sport");
    const season = searchParams.get("season") || "24-25";
    const statType = searchParams.get("statType");
    const state = searchParams.get("state") || "NC";
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query dynamically based on filters
    let query = "SELECT * FROM players_with_stats WHERE 1=1";
    if (sport) query += ` AND sport = '${sport}'`;
    if (season) query += ` AND season = '${season}'`;
    if (statType) query += ` AND stat_type = '${statType}'`;
    if (state) query += ` AND state = '${state}'`;
    query += ` ORDER BY value DESC LIMIT ${limit}`;

    // Use the players_with_stats view
    const players = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        first_name: string;
        last_name: string;
        full_name: string;
        city: string | null;
        state: string | null;
        position: string | null;
        maxpreps_school_name: string | null;
        matched_school_name: string | null;
        classification: string | null;
        conference: string | null;
        sport: string;
        season: string;
        stat_type: string;
        value: number;
        per_game_value: number | null;
        games_played: number | null;
        national_rank: number | null;
        state_rank: number | null;
      }>
    >(query);

    return Response.json({
      totalPlayers: players.length,
      players: players.map((p) => ({
        id: p.id,
        name: p.full_name,
        firstName: p.first_name,
        lastName: p.last_name,
        city: p.city,
        state: p.state,
        position: p.position,
        school: p.matched_school_name || p.maxpreps_school_name,
        classification: p.classification,
        conference: p.conference,
        sport: p.sport,
        season: p.season,
        statType: p.stat_type,
        value: p.value,
        perGameValue: p.per_game_value,
        gamesPlayed: p.games_played,
        nationalRank: p.national_rank,
        stateRank: p.state_rank,
      })),
    });
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return Response.json(
      { error: "Failed to fetch player stats" },
      { status: 500 }
    );
  }
}
