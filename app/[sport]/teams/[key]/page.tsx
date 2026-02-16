import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { sportLabels, type Sport } from "@/lib/utils";
import { getSheetRankings } from "@/lib/sheets-rankings";
import { TeamHero } from "@/components/team/team-hero";
import { TeamQuickStats } from "@/components/team/team-quick-stats";
import { TeamSchedule, type GameRow } from "@/components/team/team-schedule";
import { TeamRoster, type RosterPlayer } from "@/components/team/team-roster";

interface TeamPageProps {
  params: Promise<{
    sport: string;
    key: string;
  }>;
}

function isValidSport(sport: string): sport is Sport {
  return ["basketball", "football", "lacrosse"].includes(sport);
}

function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // School year starts in August (month 7)
  if (month >= 7) {
    const start = year % 100;
    const end = (year + 1) % 100;
    return `${start}-${end.toString().padStart(2, "0")}`;
  }
  const start = (year - 1) % 100;
  const end = year % 100;
  return `${start}-${end.toString().padStart(2, "0")}`;
}

// --- DB row types ---

interface SchoolRow {
  id: string;
  key: string;
  name: string;
  city: string | null;
  classification: string | null;
  conference: string | null;
}

interface RankingRow {
  rank: number;
  wins: number | null;
  losses: number | null;
  ties: number;
  rating: number | null;
  movement: string | null;
  season: string;
}

interface RawGameRow {
  id: string;
  date: string;
  home_team_id: string | null;
  away_team_id: string | null;
  home_team_name: string | null;
  home_team_key: string | null;
  away_team_name: string | null;
  away_team_key: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string | null;
  game_time: string | null;
  is_conference: boolean;
  overtime: boolean;
}

interface RawRosterRow {
  jersey_number: string | null;
  first_name: string;
  last_name: string;
  position: string | null;
  grade: string | null;
  height_feet: number | null;
  height_inches: number | null;
  weight: number | null;
  college_name: string | null;
  college_division: string | null;
}

// --- Metadata ---

export async function generateMetadata({
  params,
}: TeamPageProps): Promise<Metadata> {
  const { sport, key } = await params;

  if (!isValidSport(sport)) {
    return { title: "Team Not Found" };
  }

  const school = await prisma.$queryRaw<SchoolRow[]>`
    SELECT id::text, key, name, city, classification, conference
    FROM schools WHERE key = ${key} LIMIT 1
  `;

  if (school.length === 0) {
    return { title: "Team Not Found" };
  }

  const s = school[0];
  const sportName = sportLabels[sport];
  const title = `${s.name} ${sportName} | Friday Night Film Room`;
  const description = `${s.name} ${sportName.toLowerCase()} — schedule, roster, and stats.${s.city ? ` ${s.city}, NC.` : ""}`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

// --- Page ---

export default async function TeamPage({ params }: TeamPageProps) {
  const { sport, key } = await params;

  if (!isValidSport(sport)) {
    notFound();
  }

  const season = getCurrentSeason();

  // 1. Get school
  const schools = await prisma.$queryRaw<SchoolRow[]>`
    SELECT id::text, key, name, city, classification, conference
    FROM schools WHERE key = ${key} LIMIT 1
  `;

  if (schools.length === 0) {
    notFound();
  }

  const school = schools[0];

  // 2. Parallel data fetch: ranking, games, roster, sheet rankings
  const [rankings, rawGames, rawRoster, sheetRankings] = await Promise.all([
    prisma.$queryRaw<RankingRow[]>`
      SELECT rank, wins, losses, ties, rating, movement, season
      FROM rankings_with_schools
      WHERE (matched_school_name = ${school.name} OR maxpreps_school_name = ${school.name})
        AND LOWER(sport) = LOWER(${sport})
      ORDER BY season DESC
      LIMIT 1
    `,

    prisma.$queryRaw<RawGameRow[]>`
      SELECT
        g.id::text,
        g.date::text,
        g.home_team_id::text as home_team_id,
        g.away_team_id::text as away_team_id,
        h.name as home_team_name,
        h.key as home_team_key,
        a.name as away_team_name,
        a.key as away_team_key,
        g.home_score,
        g.away_score,
        g.status,
        g.game_time,
        g.is_conference,
        g.overtime
      FROM games g
      LEFT JOIN schools h ON g.home_team_id = h.id
      LEFT JOIN schools a ON g.away_team_id = a.id
      WHERE (g.home_team_id = ${school.id}::uuid OR g.away_team_id = ${school.id}::uuid)
        AND LOWER(g.sport) = LOWER(${sport})
        AND g.deleted_at IS NULL
      ORDER BY g.date DESC
    `,

    prisma.$queryRaw<RawRosterRow[]>`
      SELECT
        r.jersey_number,
        p.first_name,
        p.last_name,
        COALESCE(r.position, p.position) as position,
        r.grade,
        p.height_feet,
        p.height_inches,
        p.weight,
        p.college_name,
        p.college_division
      FROM rosters r
      JOIN players p ON r.player_id = p.id
      WHERE r.school_id = ${school.id}::uuid
        AND LOWER(r.sport) = LOWER(${sport})
        AND r.season = ${season}
        AND r.status = 'ACTIVE'
      ORDER BY
        CASE r.grade WHEN 'SR' THEN 1 WHEN 'JR' THEN 2 WHEN 'SO' THEN 3 WHEN 'FR' THEN 4 ELSE 5 END,
        p.last_name ASC
    `,

    getSheetRankings(sport),
  ]);

  // --- Derived data ---

  // Use DB ranking first, fall back to sheet data
  const dbRanking = rankings.length > 0 ? rankings[0] : null;
  const sheetMatch = sheetRankings.find(
    (r) => r.team.toLowerCase() === school.name.toLowerCase()
  );
  const ranking = dbRanking ?? (sheetMatch
    ? {
        rank: sheetMatch.rank,
        wins: sheetMatch.wins,
        losses: sheetMatch.losses,
        ties: sheetMatch.ties,
        rating: sheetMatch.rating,
        movement: sheetMatch.movement,
        season: "",
      }
    : null);

  const games: GameRow[] = rawGames.map((g) => ({
    id: g.id,
    date: g.date,
    homeTeamId: g.home_team_id,
    awayTeamId: g.away_team_id,
    homeTeamName: g.home_team_name,
    homeTeamKey: g.home_team_key,
    awayTeamName: g.away_team_name,
    awayTeamKey: g.away_team_key,
    homeScore: g.home_score,
    awayScore: g.away_score,
    status: g.status,
    gameTime: g.game_time,
    isConference: g.is_conference,
    overtime: g.overtime,
  }));

  const rosterPlayers: RosterPlayer[] = rawRoster.map((r) => ({
    jerseyNumber: r.jersey_number,
    firstName: r.first_name,
    lastName: r.last_name,
    position: r.position,
    grade: r.grade,
    heightFeet: r.height_feet,
    heightInches: r.height_inches,
    weight: r.weight,
    collegeName: r.college_name,
    collegeDivision: r.college_division,
  }));

  // Compute records from games
  const completedGames = games.filter((g) => g.status === "Final");
  const conferenceGames = completedGames.filter((g) => g.isConference);

  function computeRecord(gameList: GameRow[]) {
    let w = 0,
      l = 0,
      t = 0;
    for (const g of gameList) {
      const isHome = g.homeTeamId === school.id;
      const teamScore = isHome ? g.homeScore : g.awayScore;
      const oppScore = isHome ? g.awayScore : g.homeScore;
      if (teamScore === null || oppScore === null) continue;
      if (teamScore > oppScore) w++;
      else if (teamScore < oppScore) l++;
      else t++;
    }
    return { w, l, t };
  }

  function formatRecord(r: { w: number; l: number; t: number }): string {
    return r.t > 0 ? `${r.w}-${r.l}-${r.t}` : `${r.w}-${r.l}`;
  }

  const overallFromGames = computeRecord(completedGames);
  const confFromGames = computeRecord(conferenceGames);

  // Use ranking data as fallback for overall record
  const overallRecord =
    completedGames.length > 0
      ? formatRecord(overallFromGames)
      : ranking && ranking.wins !== null && ranking.losses !== null
        ? formatRecord({
            w: ranking.wins,
            l: ranking.losses,
            t: ranking.ties,
          })
        : null;

  const conferenceRecord =
    conferenceGames.length > 0 ? formatRecord(confFromGames) : null;

  // Avg points
  let ppg: number | null = null;
  let oppPpg: number | null = null;
  if (completedGames.length > 0) {
    let totalScored = 0;
    let totalAllowed = 0;
    let counted = 0;
    for (const g of completedGames) {
      const isHome = g.homeTeamId === school.id;
      const teamScore = isHome ? g.homeScore : g.awayScore;
      const oppScore = isHome ? g.awayScore : g.homeScore;
      if (teamScore !== null && oppScore !== null) {
        totalScored += teamScore;
        totalAllowed += oppScore;
        counted++;
      }
    }
    if (counted > 0) {
      ppg = totalScored / counted;
      oppPpg = totalAllowed / counted;
    }
  }

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: `${school.name} ${sportLabels[sport]}`,
    sport: sportLabels[sport],
    ...(school.city && {
      location: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: school.city,
          addressRegion: "NC",
        },
      },
    }),
    memberOf: {
      "@type": "SportsOrganization",
      name: school.conference || "North Carolina High School Athletics",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen">
        <TeamHero
          name={school.name}
          sport={sport}
          city={school.city}
          classification={school.classification}
          conference={school.conference}
          record={overallRecord}
          rank={ranking?.rank ?? null}
        />

        <TeamQuickStats
          record={overallRecord}
          conferenceRecord={conferenceRecord}
          rank={ranking?.rank ?? null}
          ppg={ppg}
          oppPpg={oppPpg}
        />

        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 space-y-10">
          <TeamSchedule
            games={games}
            schoolId={school.id}
            sport={sport}
          />

          <TeamRoster players={rosterPlayers} season={season} />
        </div>
      </div>
    </>
  );
}
