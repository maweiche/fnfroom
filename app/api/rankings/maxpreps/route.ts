import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sport = searchParams.get("sport");
    const season = searchParams.get("season") || "24-25";
    const state = searchParams.get("state") || "NC";
    const limit = parseInt(searchParams.get("limit") || "25");

    if (!sport) {
      return Response.json(
        { error: "Sport parameter is required" },
        { status: 400 }
      );
    }

    // Use the rankings_with_schools view
    const rankings = await prisma.$queryRaw<
      Array<{
        id: string;
        rank: number;
        maxpreps_school_name: string;
        matched_school_name: string | null;
        city: string | null;
        classification: string | null;
        conference: string | null;
        sport: string;
        season: string;
        rating: number | null;
        strength: number | null;
        wins: number;
        losses: number;
        ties: number;
        movement: string | null;
        last_updated: string | null;
      }>
    >`
      SELECT * FROM rankings_with_schools
      WHERE sport = ${sport}
        AND season = ${season}
        AND state = ${state}
      ORDER BY rank ASC
      LIMIT ${limit}
    `;

    return Response.json({
      sport,
      season,
      state,
      lastUpdated: rankings[0]?.last_updated || null,
      totalTeams: rankings.length,
      rankings: rankings.map((r) => ({
        rank: r.rank,
        school: r.matched_school_name || r.maxpreps_school_name,
        city: r.city,
        classification: r.classification,
        conference: r.conference,
        record: `${r.wins}-${r.losses}${r.ties > 0 ? `-${r.ties}` : ""}`,
        wins: r.wins,
        losses: r.losses,
        ties: r.ties,
        rating: r.rating,
        strength: r.strength,
        movement: r.movement,
      })),
    });
  } catch (error) {
    console.error("Error fetching MaxPreps rankings:", error);
    return Response.json(
      { error: "Failed to fetch rankings" },
      { status: 500 }
    );
  }
}
