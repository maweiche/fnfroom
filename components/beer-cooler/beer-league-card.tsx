"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin, Clock } from "lucide-react";

const SPORT_COLORS = {
  lacrosse: "#1e3a5f",
};

type BeerLeagueUpdate = {
  id: string;
  title: string;
  league: string;
  sport: "lacrosse";
  location: string;
  recap: string;
  stats: string;
  gameDate: string;
  image: string | null;
  photographer: string | null;
  featured: boolean;
};

export function BeerLeagueCard({ update }: { update: BeerLeagueUpdate }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      {/* Sport Badge */}
      <div
        className="h-1"
        style={{
          backgroundColor: SPORT_COLORS[update.sport],
        }}
      />

      {/* Featured Image */}
      {update.image && (
        <div>
          <div className="relative w-full aspect-video">
            <Image
              src={update.image}
              alt={update.title}
              fill
              className="object-cover"
            />
          </div>
          {update.photographer && (
            <p className="text-xs text-muted px-4 pt-2">
              Photo by {update.photographer}
            </p>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <span
            className="text-xs px-2 py-1 rounded font-medium text-white"
            style={{
              backgroundColor: SPORT_COLORS[update.sport],
            }}
          >
            {update.sport.toUpperCase()}
          </span>
          <time className="text-xs text-muted flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(update.gameDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </time>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
          {update.title}
        </h3>

        {/* League & Location */}
        <div className="flex items-center gap-2 text-xs text-secondary mb-3">
          <span className="truncate">{update.league}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {update.location}
          </span>
        </div>

        {/* Recap */}
        <p className="text-sm text-foreground mb-4 line-clamp-3">
          {update.recap}
        </p>

        {/* Stats */}
        {update.stats && (
          <div className="p-3 rounded bg-muted/10 border border-border">
            <p className="font-mono text-xs font-semibold text-foreground tabular-nums">
              {update.stats}
            </p>
          </div>
        )}
      </div>
    </motion.article>
  );
}
