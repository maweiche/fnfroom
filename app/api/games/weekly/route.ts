import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");

    // Default to today if no date provided
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    // Get the current week's date range (Sunday to Saturday)
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Calculate start of week (Sunday)
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(targetDate.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculate end of week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDateStr = endOfWeek.toISOString().split('T')[0];

    // Fetch scheduled games for the week
    const games = await prisma.$queryRaw<Array<{
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
    }>>`
      SELECT * FROM games_with_schools
      WHERE status = 'Scheduled'
      AND date >= ${startDate}::date
      AND date <= ${endDateStr}::date
      ORDER BY date ASC, sport, gender
    `;

    // Transform to match expected format
    const formattedGames = games.map(game => ({
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
    }));

    return Response.json({
      startDate,
      endDate: endDateStr,
      totalGames: formattedGames.length,
      games: formattedGames,
    });
  } catch (error) {
    console.error("Error fetching weekly games:", error);
    return Response.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
