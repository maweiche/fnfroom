import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Calculate standings from games table
    const standings = await prisma.$queryRaw<
      Array<{
        school_id: string;
        team: string;
        wins: string;
        losses: string;
        gf: string;
        ga: string;
      }>
    >`
      SELECT
        s.id as school_id,
        s.name as team,
        COUNT(*) FILTER (WHERE
          (g.home_team_id = s.id AND g.home_score > g.away_score) OR
          (g.away_team_id = s.id AND g.away_score > g.home_score)
        )::text as wins,
        COUNT(*) FILTER (WHERE
          (g.home_team_id = s.id AND g.home_score < g.away_score) OR
          (g.away_team_id = s.id AND g.away_score < g.home_score)
        )::text as losses,
        COALESCE(SUM(CASE WHEN g.home_team_id = s.id THEN g.home_score ELSE g.away_score END), 0)::text as gf,
        COALESCE(SUM(CASE WHEN g.home_team_id = s.id THEN g.away_score ELSE g.home_score END), 0)::text as ga
      FROM schools s
      LEFT JOIN games g ON (g.home_team_id = s.id OR g.away_team_id = s.id)
        AND g.sport = 'Lacrosse'
        AND g.status = 'Final'
      WHERE s.classification LIKE '%Adult%'
      GROUP BY s.id, s.name
      ORDER BY wins::int DESC, (COALESCE(SUM(CASE WHEN g.home_team_id = s.id THEN g.home_score ELSE g.away_score END), 0) - COALESCE(SUM(CASE WHEN g.home_team_id = s.id THEN g.away_score ELSE g.home_score END), 0)) DESC
    `;

    // Transform and add rank
    const formattedStandings = standings.map((team, index) => ({
      rank: index + 1,
      team: team.team,
      wins: parseInt(team.wins),
      losses: parseInt(team.losses),
      gf: parseInt(team.gf),
      ga: parseInt(team.ga),
    }));

    return Response.json({
      season: "2025-26",
      standings: formattedStandings,
    });
  } catch (error) {
    console.error("Error fetching adult lacrosse standings:", error);
    return Response.json(
      { error: "Failed to fetch standings" },
      { status: 500 }
    );
  }
}
