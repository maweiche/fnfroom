import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");

    // Fetch recent Adult League lacrosse games
    const games = await prisma.$queryRaw<
      Array<{
        id: string;
        date: string;
        sport: string;
        gender: string | null;
        home_team: string;
        home_city: string;
        home_classification: string;
        home_score: number | null;
        away_team: string;
        away_city: string;
        away_classification: string;
        away_score: number | null;
        status: string;
        source: string | null;
        created_at: string;
      }>
    >`
      SELECT * FROM games_with_schools
      WHERE sport = 'Lacrosse'
      AND (home_classification LIKE '%Adult%' OR away_classification LIKE '%Adult%')
      AND status = 'Final'
      ORDER BY date DESC
      LIMIT ${limit}
    `;

    // Transform to match expected format
    const formattedGames = games.map((game) => ({
      id: game.id,
      date: game.date,
      sport: game.sport,
      gender: game.gender,
      homeTeam: {
        name: game.home_team,
        city: game.home_city,
        classification: game.home_classification,
      },
      awayTeam: {
        name: game.away_team,
        city: game.away_city,
        classification: game.away_classification,
      },
      homeScore: game.home_score,
      awayScore: game.away_score,
      status: game.status,
      source: game.source,
      createdAt: game.created_at,
    }));

    return Response.json({
      totalGames: formattedGames.length,
      games: formattedGames,
    });
  } catch (error) {
    console.error("Error fetching adult lacrosse games:", error);
    return Response.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
