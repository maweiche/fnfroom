import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Beer, Trophy, Clock, MapPin } from "lucide-react";
import { BeerCoolerHero } from "../../components/beer-cooler/beer-cooler-hero";
import { BeerLeagueCard } from "../../components/beer-cooler/beer-league-card";
import { ComingSoonDialog } from "@/components/coming-soon-dialog";
import { STANDINGS, CURRENT_SEASON } from "@/data/triad-lacrosse-standings";
import { getArticlesByCategory } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";

export const metadata: Metadata = {
  title: "Beer Cooler - Triad Lacrosse League | Friday Night Film Room",
  description:
    "Coverage of the Triad Adult Lacrosse League. Game recaps, standings, and stories from Greensboro-Winston-Salem's premier adult lax league.",
};

export const revalidate = 0; // Disable caching during development

const SPORT_COLORS = {
  lacrosse: "#1e3a5f",
};

export default async function BeerCoolerPage() {
  // Fetch beer cooler articles from Sanity (adult league only)
  const beerCoolerArticles = await getArticlesByCategory("beer-cooler");

  // Debug logging
  console.log("Beer Cooler Articles Found:", beerCoolerArticles.length);
  if (beerCoolerArticles.length > 0) {
    console.log("First article:", beerCoolerArticles[0]);
  }

  // Transform articles to beer league update format
  const beerLeagueUpdates = beerCoolerArticles.map((article, index) => ({
    id: article._id,
    title: article.title,
    slug: article.slug.current,
    league: "Triad Adult Lacrosse League",
    sport: "lacrosse" as const,
    location: "Triad, NC",
    recap: article.excerpt || article.title,
    stats: "", // Can be added to article metadata if needed
    gameDate: article.publishDate,
    image: article.featuredImage
      ? urlFor(article.featuredImage).width(800).height(450).url()
      : null,
    photographer: article.featuredImage?.photographer || null,
    featured: index === 0, // First article is featured
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <BeerCoolerHero />

      {/* League Info Banner */}
      <section className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#1e3a5f" }}
              />
              <span className="font-medium text-foreground">
                Triad Adult Lacrosse League
              </span>
            </div>
            <span className="text-muted">•</span>
            <div className="flex items-center gap-1 text-secondary">
              <MapPin className="w-4 h-4" />
              Greensboro-Winston-Salem
            </div>
            <span className="text-muted">•</span>
            <span className="text-secondary">2025-26 Season</span>
          </div>
        </div>
      </section>
      

      {/* Featured Story */}
      {beerLeagueUpdates.length > 0 && beerLeagueUpdates.filter((u) => u.featured).map((update) => (
        <section key={update.id} className="py-12 bg-card-gold">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                  Featured Story
                </span>
              </div>
              <Link href={`/beer-cooler/${update.slug}`} className="group block">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {update.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-secondary mb-6">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {update.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(update.gameDate + "T12:00:00").toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium text-white"
                    style={{
                      backgroundColor:
                        SPORT_COLORS[update.sport as keyof typeof SPORT_COLORS],
                    }}
                  >
                    {update.sport.toUpperCase()}
                  </span>
                </div>
                {update.image && (
                  <div className="mb-6">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden group-hover:opacity-90 transition-opacity">
                      <Image
                        src={update.image}
                        alt={update.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {update.photographer && (
                      <p className="text-xs text-muted mt-2">
                        Photo by {update.photographer}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-lg text-foreground leading-relaxed mb-6">
                  {update.recap}
                </p>
                {update.stats && (
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <p className="font-mono text-sm font-semibold text-foreground tabular-nums">
                      {update.stats}
                    </p>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </section>
      ))}

      {/* League Standings Preview */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Current Standings
            </h2>
            <span className="text-sm text-secondary">{CURRENT_SEASON}</span>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/10 border-b border-border">
                  <tr className="text-xs uppercase tracking-wide font-semibold text-secondary">
                    <th className="text-left p-3">Rank</th>
                    <th className="text-left p-3">Team</th>
                    <th className="text-center p-3">W-L</th>
                    <th className="text-center p-3">GF</th>
                    <th className="text-center p-3">GA</th>
                  </tr>
                </thead>
                <tbody className="font-mono tabular-nums text-sm">
                  {STANDINGS.map((team) => (
                    <tr key={team.rank} className="border-b border-border hover:bg-muted/5">
                      <td className="p-3 font-bold">{team.rank}</td>
                      <td className="p-3 font-sans">{team.team}</td>
                      <td className="p-3 text-center">{team.wins}-{team.losses}</td>
                      <td className="p-3 text-center text-success">{team.gf}</td>
                      <td className="p-3 text-center text-error">{team.ga}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Updates */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Recent Games
            </h2>
          </div>

          {beerLeagueUpdates.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {beerLeagueUpdates.map((update) => (
                <BeerLeagueCard key={update.id} update={update} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-secondary">No beer cooler articles found. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Submit Your Game */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Beer className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Got a Story for Us?
            </h2>
            <p className="text-secondary mb-8">
              Score a hat trick? Make an impossible save? We want to hear about
              your best Triad Lacrosse moments. Submit your game recaps and
              player highlights for a chance to be featured.
            </p>
            <ComingSoonDialog
              variant="beer-cooler"
              trigger={
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-dark font-semibold rounded-lg hover:opacity-90 transition-opacity">
                  Submit Your Game
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
