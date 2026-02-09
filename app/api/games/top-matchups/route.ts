import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "2");

    // Get the current week's date range (Sunday to Saturday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

    // Calculate start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculate end of week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startDateStr = startOfWeek.toISOString().split('T')[0];
    const endDateStr = endOfWeek.toISOString().split('T')[0];

    const scheduledGames = await prisma.$queryRaw<Array<{
      id: string;
      date: string;
      sport: string;
      gender: string | null;
      home_team: string;
      home_city: string;
      home_classification: string;
      away_team: string;
      away_city: string;
      away_classification: string;
      status: string;
    }>>`
      SELECT * FROM games_with_schools
      WHERE status = 'Scheduled'
      AND date >= ${startDateStr}::date
      AND date <= ${endDateStr}::date
      ORDER BY date ASC
    `;

    // For each team in scheduled games, calculate their winning percentage
    const teamStats = new Map<string, { wins: number; total: number; winPct: number }>();

    // Get all teams from scheduled games
    const teamNames = new Set<string>();
    scheduledGames.forEach(game => {
      teamNames.add(game.home_team);
      teamNames.add(game.away_team);
    });

    // Calculate records for each team
    for (const teamName of teamNames) {
      const teamGames = await prisma.$queryRaw<Array<{
        home_team: string;
        away_team: string;
        home_score: number;
        away_score: number;
        status: string;
      }>>`
        SELECT home_team, away_team, home_score, away_score, status
        FROM games_with_schools
        WHERE status = 'Final'
        AND (home_team = ${teamName} OR away_team = ${teamName})
      `;

      let wins = 0;
      let total = 0;

      teamGames.forEach(game => {
        if (game.home_score !== null && game.away_score !== null) {
          total++;
          if (game.home_team === teamName && game.home_score > game.away_score) {
            wins++;
          } else if (game.away_team === teamName && game.away_score > game.home_score) {
            wins++;
          }
        }
      });

      const winPct = total > 0 ? wins / total : 0;
      teamStats.set(teamName, { wins, total, winPct });
    }

    // Score each game by combined win percentage of both teams
    const scoredGames = scheduledGames.map(game => {
      const homeStats = teamStats.get(game.home_team) || { wins: 0, total: 0, winPct: 0 };
      const awayStats = teamStats.get(game.away_team) || { wins: 0, total: 0, winPct: 0 };

      // Combined score: average win percentage + bonus for total games played
      const combinedWinPct = (homeStats.winPct + awayStats.winPct) / 2;
      const experienceBonus = (homeStats.total + awayStats.total) / 100; // Small bonus for teams with more games
      const score = combinedWinPct + experienceBonus;

      return {
        ...game,
        homeRecord: `${homeStats.wins}-${homeStats.total - homeStats.wins}`,
        awayRecord: `${awayStats.wins}-${awayStats.total - awayStats.wins}`,
        matchupScore: score,
      };
    });

    // Sort by matchup score (highest first) and take top N
    const topGames = scoredGames
      .sort((a, b) => b.matchupScore - a.matchupScore)
      .slice(0, limit)
      .map(game => ({
        id: game.id,
        date: game.date,
        sport: game.sport,
        gender: game.gender,
        homeTeam: {
          name: game.home_team,
          city: game.home_city,
          classification: game.home_classification,
          record: game.homeRecord,
        },
        awayTeam: {
          name: game.away_team,
          city: game.away_city,
          classification: game.away_classification,
          record: game.awayRecord,
        },
        status: game.status,
      }));

    return Response.json({
      games: topGames,
    });
  } catch (error) {
    console.error("Error fetching top matchups:", error);
    return Response.json(
      { error: "Failed to fetch top matchups" },
      { status: 500 }
    );
  }
}
