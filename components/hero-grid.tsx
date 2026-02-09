import Link from "next/link";
import Image from "next/image";
import MuxPlayer from "@mux/mux-player-react";
import { Calendar, MapPin, Clock } from "lucide-react";
import { SportTag } from "./sport-tag";
import { urlFor } from "@/sanity/lib/image";
import type { Article } from "@/lib/sanity.types";

interface HeroGridProps {
  featuredArticle?: Article;
  featuredVideoPlaybackId?: string;
}

export async function HeroGrid({ featuredArticle, featuredVideoPlaybackId }: HeroGridProps) {
  // Fetch top matchups for Games of the Week
  let topGames: Array<{
    id: string;
    date: string;
    sport: string;
    gender: string | null;
    homeTeam: {
      name: string;
      city: string;
      classification: string;
      record: string;
    };
    awayTeam: {
      name: string;
      city: string;
      classification: string;
      record: string;
    };
    status: string;
  }> = [];

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/games/top-matchups?limit=5`, {
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      topGames = data.games || [];
    }
  } catch (error) {
    console.error("Failed to fetch top matchups:", error);
  }

  return (
    <section className="container mx-auto px-4 pt-0 pb-8 md:pb-12 flex-1 flex items-stretch">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* Featured Article - Large Left Column (2/3 width on desktop) */}
        {featuredArticle ? (
          <Link
            href={`/${featuredArticle.sport}/${featuredArticle.slug.current}`}
            className="md:col-span-2 relative overflow-hidden rounded-lg bg-card shadow-card hover:shadow-card-hover transition-shadow duration-200 group h-full"
          >
            {featuredArticle.featuredImage && (
              <div className="relative h-full min-h-[400px] md:min-h-[500px] overflow-hidden">
                <Image
                  src={urlFor(featuredArticle.featuredImage).width(1200).height(675).url()}
                  alt={featuredArticle.featuredImage.alt || featuredArticle.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <SportTag sport={featuredArticle.sport} />
                  <h2 className="font-display font-bold text-2xl md:text-4xl text-white mt-3 leading-tight">
                    {featuredArticle.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-4 text-sm text-white/90">
                    <span className="font-medium">{featuredArticle.author.name}</span>
                    <span>•</span>
                    <time>
                      {new Date(featuredArticle.publishDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </div>
            )}
          </Link>
        ) : (
          <div className="md:col-span-2 rounded-lg bg-muted/10 h-full min-h-[400px] md:min-h-[500px] flex items-center justify-center">
            <p className="text-muted">No featured article</p>
          </div>
        )}

        {/* Right Column - Video Player + Games of Week */}
        <div className="flex flex-col gap-4 h-full">
          {/* Mux Video Player - Top Right (16:9 aspect ratio) */}
          <div className="relative rounded-lg overflow-hidden shadow-card bg-black aspect-video">
            {featuredVideoPlaybackId ? (
              <MuxPlayer
                playbackId={featuredVideoPlaybackId}
                accentColor="#94d873"
                className="w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/60 text-sm">No featured video</p>
              </div>
            )}
          </div>

          {/* Games of the Week Card - Bottom Right (takes remaining space) */}
          <div className="flex-1 min-h-0">
            <GamesOfWeekCard games={topGames} />
          </div>
        </div>
      </div>
    </section>
  );
}

// Games of the Week Card Component
interface GamesOfWeekCardProps {
  games: Array<{
    id: string;
    date: string;
    sport: string;
    gender: string | null;
    homeTeam: {
      name: string;
      city: string;
      classification: string;
      record: string;
    };
    awayTeam: {
      name: string;
      city: string;
      classification: string;
      record: string;
    };
    status: string;
  }>;
}

function GamesOfWeekCard({ games }: GamesOfWeekCardProps) {
  return (
    <div className="rounded-lg bg-card-mint border-l-4 border-l-primary p-6 shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-xl text-foreground dark:text-white">Games of the Week</h3>
        <Link
          href="/schedule"
          className="text-sm font-medium text-primary hover:text-primary/90 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {games.length > 0 ? (
          games.map((game) => {
            const gameDate = new Date(game.date);
            const formattedDate = gameDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={game.id}
                className="pb-4 border-b border-border/30 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-sm leading-tight text-foreground dark:text-white">
                      {game.homeTeam.name}
                      <span className="text-[10px] text-muted dark:text-white/70 font-normal ml-1">
                        ({game.homeTeam.record})
                      </span>
                    </div>
                    <div className="text-muted dark:text-white/60 font-normal text-xs my-1">vs</div>
                    <div className="font-semibold text-sm leading-tight text-foreground dark:text-white">
                      {game.awayTeam.name}
                      <span className="text-[10px] text-muted dark:text-white/70 font-normal ml-1">
                        ({game.awayTeam.record})
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-primary/20 text-primary shrink-0">
                    {game.sport}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-secondary dark:text-white/70 mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </div>
                  {game.gender && (
                    <div className="flex items-center gap-1">
                      <span className="capitalize">{game.gender}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-secondary dark:text-white/70">
                  <MapPin className="w-3 h-3" />
                  <span>{game.homeTeam.city}</span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-muted dark:text-white/70 text-sm">No games scheduled this week</p>
        )}
      </div>
    </div>
  );
}
