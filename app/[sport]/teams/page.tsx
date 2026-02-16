import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SportTag } from "@/components/sport-tag";
import { sportLabels, type Sport } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getSheetRankings } from "@/lib/sheets-rankings";
import { TeamsGrid } from "./teams-grid";

interface TeamsPageProps {
  params: Promise<{
    sport: string;
  }>;
}

function isValidSport(sport: string): sport is Sport {
  return ["basketball", "football", "lacrosse"].includes(sport);
}

export async function generateMetadata({
  params,
}: TeamsPageProps): Promise<Metadata> {
  const { sport } = await params;

  if (!isValidSport(sport)) {
    return { title: "Teams Not Found" };
  }

  const sportName = sportLabels[sport];

  return {
    title: `${sportName} Teams | Friday Night Film Room`,
    description: `Browse North Carolina high school ${sportName.toLowerCase()} teams with records, rankings, and schedules.`,
  };
}

interface TeamRow {
  school_id: string;
  school_key: string | null;
  school_name: string;
  city: string | null;
  classification: string | null;
  conference: string | null;
  rank: number | null;
  wins: number | null;
  losses: number | null;
  ties: number | null;
  rating: number | null;
  season: string | null;
}

export default async function TeamsPage({ params }: TeamsPageProps) {
  const { sport } = await params;

  if (!isValidSport(sport)) {
    notFound();
  }

  const sportName = sportLabels[sport];

  // Fetch DB teams and sheet rankings in parallel
  const [rankedTeams, unrankedTeams, sheetRankings] = await Promise.all([
    prisma.$queryRaw<TeamRow[]>`
      SELECT DISTINCT ON (rws.maxpreps_school_name)
        COALESCE(s.id::text, rws.id::text) as school_id,
        s.key as school_key,
        COALESCE(rws.matched_school_name, rws.maxpreps_school_name) as school_name,
        rws.city,
        rws.classification,
        rws.conference,
        rws.rank,
        rws.wins,
        rws.losses,
        rws.ties,
        rws.rating,
        rws.season
      FROM rankings_with_schools rws
      LEFT JOIN schools s ON s.name = rws.matched_school_name
      WHERE LOWER(rws.sport) = LOWER(${sport})
      ORDER BY rws.maxpreps_school_name, rws.season DESC, rws.rank ASC
    `,
    prisma.$queryRaw<TeamRow[]>`
      SELECT DISTINCT
        s.id::text as school_id,
        s.key as school_key,
        s.name as school_name,
        s.city,
        s.classification,
        s.conference,
        NULL::int as rank,
        NULL::int as wins,
        NULL::int as losses,
        NULL::int as ties,
        NULL::float as rating,
        NULL::text as season
      FROM schools s
      WHERE (
        EXISTS (
          SELECT 1 FROM games g
          WHERE (g.home_team_id = s.id OR g.away_team_id = s.id)
            AND LOWER(g.sport) = LOWER(${sport})
            AND g.deleted_at IS NULL
        )
      )
      AND s.name NOT IN (
        SELECT COALESCE(rws.matched_school_name, rws.maxpreps_school_name)
        FROM rankings_with_schools rws
        WHERE LOWER(rws.sport) = LOWER(${sport})
      )
      ORDER BY s.name ASC
    `,
    getSheetRankings(sport),
  ]);

  // Build sheet lookup by lowercase team name
  const sheetMap = new Map(
    sheetRankings.map((r) => [r.team.toLowerCase(), r])
  );

  const teams = [
    ...rankedTeams.map((t) => {
      const sheet = sheetMap.get(t.school_name.toLowerCase());
      return {
        id: t.school_id,
        key: t.school_key,
        name: t.school_name,
        city: t.city,
        classification: t.classification,
        conference: t.conference,
        rank: sheet?.rank ?? t.rank,
        wins: sheet?.wins ?? t.wins ?? 0,
        losses: sheet?.losses ?? t.losses ?? 0,
        ties: sheet?.ties ?? t.ties ?? 0,
        rating: sheet?.rating ?? t.rating,
        season: t.season,
      };
    }),
    ...unrankedTeams.map((t) => {
      const sheet = sheetMap.get(t.school_name.toLowerCase());
      return {
        id: t.school_id,
        key: t.school_key,
        name: t.school_name,
        city: t.city,
        classification: t.classification,
        conference: t.conference,
        rank: sheet?.rank ?? null,
        wins: sheet?.wins ?? 0,
        losses: sheet?.losses ?? 0,
        ties: sheet?.ties ?? 0,
        rating: sheet?.rating ?? null,
        season: null,
      };
    }),
  ];

  // Sort: ranked teams first (by rank), then unranked alphabetically
  teams.sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank && !b.rank) return -1;
    if (!a.rank && b.rank) return 1;
    return a.name.localeCompare(b.name);
  });

  // Get unique classifications and conferences for filters
  const classifications = Array.from(
    new Set(teams.map((t) => t.classification).filter(Boolean))
  ).sort() as string[];

  const conferences = Array.from(
    new Set(teams.map((t) => t.conference).filter(Boolean))
  ).sort() as string[];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <SportTag sport={sport} className="mb-4" />
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
            {sportName} Teams
          </h1>
          <p className="text-secondary text-base md:text-lg">
            {teams.length} North Carolina high school{" "}
            {sportName.toLowerCase()} teams
          </p>
        </div>

        <TeamsGrid
          teams={teams}
          sport={sport}
          classifications={classifications}
          conferences={conferences}
        />
      </div>
    </div>
  );
}
