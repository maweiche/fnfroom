import { NextResponse } from "next/server";
import { getPlayers } from "@/sanity/lib/fetch";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch both Sanity editorial players and database players
    const [sanityPlayers, dbPlayerCount] = await Promise.all([
      getPlayers(),
      prisma.player.count(),
    ]);

    return NextResponse.json({
      editorial: sanityPlayers,
      databaseCount: dbPlayerCount,
      message: "Use /api/players/stats for player statistics from the database"
    });
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}
