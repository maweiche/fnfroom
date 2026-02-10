import { prisma } from "@/lib/prisma";
import { UpcomingGamesClient } from "./upcoming-games-client";

interface Game {
  id: string;
  date: string;
  sport: string;
  gender: string | null;
  homeTeam: {
    name: string;
    city: string;
    classification: string;
  };
  awayTeam: {
    name: string;
    city: string;
    classification: string;
  };
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  source: string | null;
}

async function getUpcomingGames(): Promise<Game[]> {
  try {
    // Get the current week's date range (Sunday to Saturday)
    const targetDate = new Date();
    const dayOfWeek = targetDate.getDay();

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
    return games.map(game => ({
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
  } catch (error) {
    console.error("Error fetching weekly games:", error);
    return [];
  }
}

export async function UpcomingGames() {
  const games = await getUpcomingGames();

  return <UpcomingGamesClient games={games} />;
}
