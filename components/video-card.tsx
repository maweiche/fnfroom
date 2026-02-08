"use client";

import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { SportTag } from "./sport-tag";
import { formatDate } from "@/lib/utils";
import type { Video } from "@/lib/sanity.types";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const playbackId = video.video?.asset?.playbackId;
  const thumbnailUrl = playbackId
    ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop`
    : null;

  const videoTypeLabels = {
    highlights: "Highlights",
    "game-film": "Game Film",
    interview: "Interview",
    feature: "Feature",
  };

  return (
    <Link href={`/video/${video.slug.current}`} className="group block">
      <article className="overflow-hidden rounded-lg bg-card shadow-card hover:shadow-card-hover transition-shadow duration-200 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
          {thumbnailUrl && (
            <Image
              src={thumbnailUrl}
              alt={video.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors duration-200">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Play className="w-8 h-8 text-navy-header ml-1" fill="currentColor" />
            </div>
          </div>
          {/* Duration Badge (if available) */}
          {video.video?.asset?.status === "ready" && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
              Video
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <SportTag sport={video.sport} />
            <span className="text-xs text-muted">
              {videoTypeLabels[video.type]}
            </span>
          </div>

          <h3 className="text-lg font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-150">
            {video.title}
          </h3>

          {video.description && (
            <p className="text-sm text-secondary line-clamp-2 mb-3 flex-1">
              {video.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-2 text-sm text-secondary mt-auto">
            {video.contributor && (
              <>
                <span className="font-medium">{video.contributor.name}</span>
                <span>•</span>
              </>
            )}
            <time dateTime={video.publishDate}>
              {formatDate(video.publishDate)}
            </time>
          </div>

          {/* Player Tags */}
          {video.playerTags && video.playerTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {video.playerTags.slice(0, 3).map((player) => (
                <span
                  key={player}
                  className="text-xs px-2 py-1 bg-muted/20 text-muted rounded"
                >
                  {player}
                </span>
              ))}
              {video.playerTags.length > 3 && (
                <span className="text-xs px-2 py-1 text-muted">
                  +{video.playerTags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
