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

export function HeroGrid({ featuredArticle, featuredVideoPlaybackId }: HeroGridProps) {
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
          {/* Mux Video Player - Top Right */}
          <div className="relative rounded-lg overflow-hidden shadow-card bg-black flex-1 min-h-[250px]">
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

          {/* Games of the Week Card - Bottom Right */}
          <GamesOfWeekCard />
        </div>
      </div>
    </section>
  );
}

// Games of the Week Card Component (Placeholder)
function GamesOfWeekCard() {
  // Placeholder game data
  const games = [
    {
      id: 1,
      homeTeam: "Green Hope",
      awayTeam: "Cary",
      sport: "basketball",
      date: "Feb 10",
      time: "7:00 PM",
      venue: "Green Hope HS",
    },
    {
      id: 2,
      homeTeam: "Cardinal Gibbons",
      awayTeam: "Millbrook",
      sport: "basketball",
      date: "Feb 11",
      time: "6:30 PM",
      venue: "Cardinal Gibbons",
    },
  ];

  return (
    <div className="rounded-lg bg-card-mint border-l-4 border-l-primary p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-xl">Games of the Week</h3>
        <Link
          href="/schedule"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {games.map((game) => (
          <div
            key={game.id}
            className="pb-4 border-b border-border/50 last:border-0 last:pb-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-sm">
                {game.homeTeam} <span className="text-muted font-normal">vs</span> {game.awayTeam}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{game.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{game.time}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-secondary">
              <MapPin className="w-3 h-3" />
              <span>{game.venue}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
