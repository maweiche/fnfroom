import Link from "next/link";
import Image from "next/image";
import MuxPlayer from "@mux/mux-player-react";
import { Calendar, MapPin, Clock } from "lucide-react";
import { SportTag } from "./sport-tag";
import { urlFor } from "@/sanity/lib/image";
import type { Article } from "@/lib/sanity.types";

interface HeroGridProps {
  featuredArticles?: Article[];
  featuredVideoPlaybackId?: string;
}

export async function HeroGrid({ featuredArticles = [], featuredVideoPlaybackId }: HeroGridProps) {
  // Fetch upcoming games for the week
  let weeklyGames: Array<{
    id: string;
    date: string;
    sport: string;
    gender: string | null;
    homeTeam: {
      name: string;
      city: string;
      classification: string;
    };
    awayTeam: {
      name: string;
      city: string;
      classification: string;
    };
    status: string;
  }> = [];

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/games/weekly`, {
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      weeklyGames = data.games || [];
    }
  } catch (error) {
    console.error("Failed to fetch weekly games:", error);
  }

  // Filter for Boys (Men's) games only
  const mensGames = weeklyGames.filter(game =>
    !game.gender || game.gender.toLowerCase() === "boys"
  );

  return (
    <section className="container mx-auto px-4 pt-0 pb-8 md:pb-12 flex-1 flex items-stretch">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* Left Column - 2 Featured Articles Stacked (2/3 width on desktop) */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {featuredArticles.slice(0, 2).reverse().map((article, index) => (
            <FeaturedArticleCard
              key={article._id}
              article={article}
              priority={index === 0}
            />
          ))}
        </div>

        {/* Right Column - Video Player + Games of Week */}
        <div className="flex flex-col gap-4 h-full">
          {/* Mux Video Player - Top Right (16:9 aspect ratio) */}
          <div className="relative rounded-lg overflow-hidden shadow-card bg-black aspect-video">
            {/* {featuredVideoPlaybackId ? (
              <MuxPlayer
                playbackId={featuredVideoPlaybackId}
                accentColor="#94d873"
                className="w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/60 text-sm">No featured video</p>
              </div>
            )} */}
            <video src="/motion_logo.mp4" className="w-full h-full" autoPlay muted loop playsInline  />
          </div>

          {/* Upcoming Men's Games Table - Bottom Right (takes remaining space) */}
          <div className="flex-1 min-h-0">
            <UpcomingMensGamesTable games={mensGames} />
          </div>
        </div>
      </div>
    </section>
  );
}

// Featured Article Card Component
interface FeaturedArticleCardProps {
  article: Article;
  priority?: boolean;
}

function FeaturedArticleCard({ article, priority = false }: FeaturedArticleCardProps) {
  return (
    <Link
      href={`/${article.sport}/${article.slug.current}`}
      className="relative overflow-hidden rounded-lg bg-black shadow-card hover:shadow-card-hover transition-shadow duration-200 group flex-1"
    >
      {article.featuredImage && (
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-black">
          <Image
            src={urlFor(article.featuredImage).width(1600).url()}
            alt={article.featuredImage.alt || article.title}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            priority={priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <SportTag sport={article.sport} />
            <h2 className="font-display font-bold text-xl md:text-2xl text-white mt-2 leading-tight line-clamp-2">
              {article.title}
            </h2>
            <div className="flex items-center gap-3 mt-3 text-sm text-white/90">
              <span className="font-medium">{article.author.name}</span>
              <span>•</span>
              <time>
                {new Date(article.publishDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}

// Upcoming Men's Games Table Component
interface UpcomingMensGamesTableProps {
  games: Array<{
    id: string;
    date: string;
    sport: string;
    gender: string | null;
    homeTeam: {
      name: string;
      city: string;
      classification: string;
    };
    awayTeam: {
      name: string;
      city: string;
      classification: string;
    };
    status: string;
  }>;
}

function UpcomingMensGamesTable({ games }: UpcomingMensGamesTableProps) {
  return (
    <div className="rounded-lg bg-card border border-border shadow-card h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
        <h3 className="font-display font-bold text-base text-foreground">Upcoming Games</h3>
        <Link
          href="/schedule"
          className="text-xs font-medium text-primary hover:text-primary/90 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Table Container with Scroll */}
      <div className="flex-1 overflow-y-auto">
        {games.length > 0 ? (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted/50 border-b border-border">
              <tr className="text-secondary uppercase tracking-wide">
                <th className="text-left px-4 py-2 font-medium">Date</th>
                <th className="text-left px-4 py-2 font-medium">Matchup</th>
                <th className="text-center px-4 py-2 font-medium">Sport</th>
                <th className="text-center px-4 py-2 font-medium">Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {games.slice(0, 10).map((game) => {
                const gameDate = new Date(game.date);
                const formattedDate = gameDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <tr
                    key={game.id}
                    className="hover:bg-muted/30 transition-colors duration-150"
                  >
                    {/* Date */}
                    <td className="px-4 py-3 text-secondary whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    {/* Matchup */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="font-medium text-foreground text-xs leading-tight">
                          {game.homeTeam.name}
                        </div>
                        <div className="text-[10px] text-muted">vs</div>
                        <div className="font-medium text-foreground text-xs leading-tight">
                          {game.awayTeam.name}
                        </div>
                      </div>
                    </td>

                    {/* Sport */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                        {game.sport}
                      </span>
                    </td>

                    {/* Classification */}
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-[10px] text-muted">
                        {game.homeTeam.classification} v {game.awayTeam.classification}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center h-full px-4 py-8">
            <p className="text-muted text-xs">No upcoming games scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
}
