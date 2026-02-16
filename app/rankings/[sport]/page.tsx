import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, Star } from "lucide-react";
import { SportTag } from "@/components/sport-tag";
import { sportLabels, type Sport } from "@/lib/utils";
import { getSheetRankings } from "@/lib/sheets-rankings";
import { prisma } from "@/lib/prisma";

interface RankingsSportPageProps {
  params: Promise<{
    sport: string;
  }>;
}

function isValidSport(sport: string): sport is Sport {
  return ["basketball", "football", "lacrosse"].includes(sport);
}

export async function generateMetadata({
  params,
}: RankingsSportPageProps): Promise<Metadata> {
  const { sport } = await params;

  if (!isValidSport(sport)) {
    return { title: "Rankings Not Found" };
  }

  const sportName = sportLabels[sport];

  return {
    title: `${sportName} Rankings | Friday Night Film Room`,
    description: `Weekly team rankings for North Carolina high school ${sportName.toLowerCase()}.`,
  };
}

export default async function RankingsSportPage({
  params,
}: RankingsSportPageProps) {
  const { sport } = await params;

  if (!isValidSport(sport)) {
    notFound();
  }

  const sportName = sportLabels[sport];

  const [rankings, schools] = await Promise.all([
    getSheetRankings(sport),
    prisma.$queryRaw<{ name: string; key: string }[]>`
      SELECT name, key FROM schools ORDER BY name
    `,
  ]);

  // Build a lookup: lowercase school name → key
  const schoolKeyMap = new Map<string, string>();
  for (const s of schools) {
    schoolKeyMap.set(s.name.toLowerCase(), s.key);
  }

  if (rankings.length === 0) {
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <SportTag sport={sport} className="mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {sportName} Rankings
          </h1>
          <p className="text-lg text-secondary">
            {rankings.length} teams ranked
          </p>
        </div>

        {/* Rankings Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/10 border-b-2 border-border">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide font-semibold text-secondary">
                  Rank
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide font-semibold text-secondary">
                  Team
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide font-semibold text-secondary hidden md:table-cell">
                  Location
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide font-semibold text-secondary">
                  Record
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide font-semibold text-secondary hidden md:table-cell">
                  Rating
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide font-semibold text-secondary hidden md:table-cell">
                  Strength
                </th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wide font-semibold text-secondary">
                  +/-
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rankings.map((entry) => {
                const schoolKey = schoolKeyMap.get(entry.team.toLowerCase());
                const teamCell = schoolKey ? (
                  <Link
                    href={`/${sport}/teams/${schoolKey}`}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {entry.team}
                  </Link>
                ) : (
                  <span className="font-medium">{entry.team}</span>
                );

                return (
                  <tr
                    key={entry.rank}
                    className="border-b border-border hover:bg-muted/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold tabular-nums">
                      {entry.rank}
                    </td>
                    <td className="px-4 py-3">{teamCell}</td>
                    <td className="px-4 py-3 text-secondary hidden md:table-cell">
                      {entry.location || "—"}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums">
                      {entry.record}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums hidden md:table-cell">
                      {entry.rating != null ? entry.rating.toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums hidden md:table-cell">
                      {entry.strength != null
                        ? entry.strength.toFixed(2)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {entry.movement === "up" && (
                          <>
                            <TrendingUp className="w-4 h-4 text-success" />
                            <span className="text-xs text-success font-mono">
                              {entry.movementValue}
                            </span>
                          </>
                        )}
                        {entry.movement === "down" && (
                          <>
                            <TrendingDown className="w-4 h-4 text-error" />
                            <span className="text-xs text-error font-mono">
                              {entry.movementValue}
                            </span>
                          </>
                        )}
                        {entry.movement === "steady" && (
                          <Minus className="w-4 h-4 text-muted" />
                        )}
                        {entry.movement === "new" && (
                          <Star className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
