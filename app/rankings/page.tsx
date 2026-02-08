import Link from "next/link";
import type { Metadata } from "next";
import { SportTag } from "@/components/sport-tag";
import { getLatestRankingsBySport } from "@/sanity/lib/fetch";
import { sportLabels } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Rankings | Friday Night Film Room",
  description:
    "Weekly team rankings for North Carolina high school basketball, football, and lacrosse.",
};

export default async function RankingsPage() {
  const latestRankings = await getLatestRankingsBySport();

  const sports = [
    {
      sport: "basketball" as const,
      name: sportLabels.basketball,
      rankings: latestRankings.basketball,
    },
    {
      sport: "football" as const,
      name: sportLabels.football,
      rankings: latestRankings.football,
    },
    {
      sport: "lacrosse" as const,
      name: sportLabels.lacrosse,
      rankings: latestRankings.lacrosse,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Team Rankings
          </h1>
          <p className="text-lg text-secondary">
            Weekly rankings for North Carolina high school sports
          </p>
        </div>

        {/* Sport Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sports.map(({ sport, name, rankings }) => (
            <Link
              key={sport}
              href={`/rankings/${sport}`}
              className="block group"
            >
              <div className="p-6 bg-card border border-border rounded-lg hover:shadow-card transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <SportTag sport={sport} />
                  {rankings && (
                    <span className="text-xs text-muted">
                      Week {rankings.week}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {name}
                </h2>

                {rankings ? (
                  <div>
                    <div className="mb-3">
                      <div className="text-sm text-secondary mb-1">
                        Current #1
                      </div>
                      <div className="text-lg font-semibold">
                        {rankings.entries[0]?.team || "—"}
                      </div>
                      <div className="text-sm text-muted font-mono">
                        {rankings.entries[0]?.record || ""}
                      </div>
                    </div>
                    <div className="text-sm text-muted">
                      Updated{" "}
                      {new Date(rankings.publishDate).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-secondary">
                    Rankings return during season
                  </div>
                )}

                <div className="mt-4 text-sm text-primary font-medium group-hover:underline">
                  View full rankings →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Description */}
        <div className="mt-12 p-6 bg-muted/10 border border-border rounded-lg">
          <h3 className="font-semibold mb-2">About Our Rankings</h3>
          <p className="text-sm text-secondary">
            Our weekly rankings are compiled by our editorial staff based on
            team performance, strength of schedule, and head-to-head results.
            Rankings are updated every week during the season.
          </p>
        </div>
      </div>
    </div>
  );
}
