import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SportTag } from "@/components/sport-tag";
import { RankingsTable } from "@/components/rankings-table";
import { PortableTextRenderer } from "@/components/portable-text";
import { sportLabels, type Sport } from "@/lib/utils";
import { getRankingsBySport } from "@/sanity/lib/fetch";

interface RankingsSportPageProps {
  params: Promise<{
    sport: string;
  }>;
  searchParams: Promise<{
    season?: string;
  }>;
}

// Validate sport parameter
function isValidSport(sport: string): sport is Sport {
  return ["basketball", "football", "lacrosse"].includes(sport);
}

export async function generateMetadata({
  params,
}: RankingsSportPageProps): Promise<Metadata> {
  const { sport } = await params;

  if (!isValidSport(sport)) {
    return {
      title: "Rankings Not Found",
    };
  }

  const sportName = sportLabels[sport];

  return {
    title: `${sportName} Rankings | Friday Night Film Room`,
    description: `Weekly team rankings for North Carolina high school ${sportName.toLowerCase()}.`,
  };
}

export default async function RankingsSportPage({
  params,
  searchParams,
}: RankingsSportPageProps) {
  const { sport } = await params;
  const { season } = await searchParams;

  // Validate sport
  if (!isValidSport(sport)) {
    notFound();
  }

  const sportName = sportLabels[sport];

  // Fetch all rankings for this sport
  const allRankings = await getRankingsBySport(sport);

  if (allRankings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <SportTag sport={sport} className="mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold">
              {sportName} Rankings
            </h1>
          </div>

          <div className="p-8 text-center bg-card border border-border rounded-lg">
            <p className="text-lg text-secondary mb-4">
              No rankings published yet for {sportName.toLowerCase()}.
            </p>
            <p className="text-sm text-muted">
              Rankings will be posted weekly during the season. Check back soon!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get unique seasons
  const seasons = Array.from(
    new Set(allRankings.map((r) => r.season))
  ).sort((a, b) => b.localeCompare(a)); // Most recent first

  // Determine which season to display
  const displaySeason = season || seasons[0];

  // Get rankings for selected season (sorted by week desc)
  const seasonRankings = allRankings.filter((r) => r.season === displaySeason);
  const latestRankings = seasonRankings[0]; // Most recent week

  if (!latestRankings) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <SportTag sport={sport} className="mb-4" />
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {sportName} Rankings
              </h1>
              <p className="text-lg text-secondary">
                Week {latestRankings.week} • {latestRankings.season}
              </p>
            </div>

            {/* Season Selector */}
            {seasons.length > 1 && (
              <div>
                <label
                  htmlFor="season-select"
                  className="text-sm text-secondary mb-2 block"
                >
                  Select Season
                </label>
                <select
                  id="season-select"
                  className="px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={displaySeason}
                  onChange={(e) => {
                    const newSeason = e.target.value;
                    window.location.href = `/rankings/${sport}?season=${newSeason}`;
                  }}
                >
                  {seasons.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="text-sm text-muted mt-2">
            Updated {new Date(latestRankings.publishDate).toLocaleDateString()}
          </div>
        </div>

        {/* Editor's Note */}
        {latestRankings.editorsNote && (
          <div className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
            <h2 className="text-lg font-bold mb-3">Editor's Note</h2>
            <div className="prose prose-sm max-w-none">
              <PortableTextRenderer content={latestRankings.editorsNote} />
            </div>
          </div>
        )}

        {/* Rankings Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <RankingsTable entries={latestRankings.entries} />
        </div>

        {/* Week Navigation */}
        {seasonRankings.length > 1 && (
          <div className="mt-8 p-6 bg-muted/10 border border-border rounded-lg">
            <h3 className="font-semibold mb-3">Previous Weeks</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {seasonRankings.slice(1, 9).map((ranking) => (
                <a
                  key={ranking._id}
                  href={`#week-${ranking.week}`}
                  className="px-4 py-2 text-sm text-center bg-card border border-border rounded hover:border-primary transition-colors"
                >
                  Week {ranking.week}
                  <span className="block text-xs text-muted mt-1">
                    {new Date(ranking.publishDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
