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
            <video src="/motion_logo.mp4" className="w-full h-full" autoPlay muted loop />
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
