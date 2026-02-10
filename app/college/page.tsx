import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp, Award, Users, Calendar } from "lucide-react";
import { CollegeHero } from "./college-hero";
import { CollegeUpdateCard } from "./college-update-card";
import { ComingSoonDialog } from "@/components/coming-soon-dialog";

export const metadata: Metadata = {
  title: "College Corner - NC Prep Athletes Making the Jump | Friday Night Film Room",
  description:
    "Track NC high school athletes making an impact at the college level. Basketball, football, and lacrosse updates from former prep stars now playing Division I, II, and III.",
};

export const revalidate = 300; // Revalidate every 5 minutes

interface CollegeUpdate {
  id: string;
  playerName: string;
  position: string;
  college: string;
  division: string;
  sport: "basketball" | "football" | "lacrosse";
  highSchool: string;
  classYear: string;
  stats: string;
  value: number;
  perGameValue: number | null;
  gamesPlayed: number | null;
  updatedAt: string;
}

async function getCollegeUpdates(): Promise<CollegeUpdate[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/college/updates?limit=10`, {
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      return data.updates || [];
    }
  } catch (error) {
    console.error("Failed to fetch college updates:", error);
  }
  return [];
}

export default async function CollegeCornerPage() {
  const collegeUpdates = await getCollegeUpdates();
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <CollegeHero />

      {/* Filters Section */}
      <section className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-secondary">
              Tracking:
            </span>
            <button className="px-3 py-1.5 text-sm font-medium rounded bg-primary/10 text-primary border border-primary/20">
              All Sports
            </button>
            <button className="px-3 py-1.5 text-sm font-medium rounded hover:bg-muted/20 text-secondary">
              Basketball
            </button>
            <button className="px-3 py-1.5 text-sm font-medium rounded hover:bg-muted/20 text-secondary">
              Football
            </button>
            <button className="px-3 py-1.5 text-sm font-medium rounded hover:bg-muted/20 text-secondary">
              Lacrosse
            </button>
          </div>
        </div>
      </section>

      {/* Recent Updates */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Recent Updates
            </h2>
            <Link
              href="/college/all"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collegeUpdates.length > 0 ? (
              collegeUpdates.slice(0, 3).map((update) => {
                const cardUpdate = {
                  ...update,
                  update: `Recent performance: ${update.stats}`,
                  gameDate: new Date().toISOString().split('T')[0],
                  image: null,
                };
                return <CollegeUpdateCard key={update.id} update={cardUpdate} />;
              })
            ) : (
              <div className="col-span-full text-center py-12 bg-card rounded-lg border border-border">
                <p className="text-muted">No college updates available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Players Section */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Top Performers This Week
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collegeUpdates.length > 0 ? (
              collegeUpdates.slice(0, 6).map((player, i) => (
                <div
                  key={player.id}
                  className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-mono text-xl font-bold text-primary tabular-nums">
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {player.playerName}
                    </h3>
                    <p className="text-sm text-secondary truncate">
                      {player.college}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold text-foreground tabular-nums">
                      {player.value}
                    </div>
                    <div className="text-xs text-muted">
                      {player.sport === "basketball"
                        ? "PTS"
                        : player.sport === "football"
                          ? "YDS"
                          : "G"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 bg-card rounded-lg border border-border">
                <p className="text-muted">No top performers data available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Know a player we should track?
            </h2>
            <p className="text-secondary mb-8">
              Help us keep tabs on NC prep athletes making an impact at the
              college level. Send us updates and we&apos;ll feature them in
              College Corner.
            </p>
            <ComingSoonDialog
              variant="college"
              trigger={
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-dark font-semibold rounded-lg hover:opacity-90 transition-opacity">
                  Submit a Player
                  <ArrowRight className="w-4 h-4" />
                </button>
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
