"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import MuxPlayer from "@mux/mux-player-react";
import { SportTag } from "@/components/sport-tag";
import { formatDate } from "@/lib/utils";
import type { Video } from "@/lib/sanity.types";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface VideoPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function VideoPage({ params }: VideoPageProps) {
  const { slug } = use(params);
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideo() {
      try {
        const response = await fetch(`/api/videos/${slug}`);
        if (!response.ok) {
          notFound();
        }
        const data = await response.json();
        setVideo(data);
      } catch (error) {
        console.error("Error fetching video:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    fetchVideo();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-secondary">Loading video...</p>
      </div>
    );
  }

  if (!video) {
    notFound();
  }

  const playbackId = video.video?.asset?.playbackId;

  const videoTypeLabels = {
    highlights: "Highlights",
    "game-film": "Game Film",
    interview: "Interview",
    feature: "Feature",
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Video Player */}
          <div className="mb-8">
            {playbackId ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <MuxPlayer
                  playbackId={playbackId}
                  streamType="on-demand"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            ) : (
              <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                <p className="text-secondary">Video not available</p>
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <SportTag sport={video.sport} />
              <span className="text-sm text-muted">
                {videoTypeLabels[video.type]}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {video.title}
            </h1>

            <div className="flex items-center gap-3 text-sm text-secondary mb-4">
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

            {video.description && (
              <p className="text-lg text-secondary leading-relaxed">
                {video.description}
              </p>
            )}

            {/* Player Tags */}
            {video.playerTags && video.playerTags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-secondary mb-2">
                  Featured Players
                </h3>
                <div className="flex flex-wrap gap-2">
                  {video.playerTags.map((player) => (
                    <span
                      key={player}
                      className="px-3 py-1 bg-muted/20 text-muted text-sm rounded-full"
                    >
                      {player}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contributor Card */}
          {video.contributor && (
            <div className="p-6 bg-card border border-border rounded-lg">
              <h3 className="text-lg font-bold mb-4">About the Videographer</h3>
              <div className="flex gap-4">
                {video.contributor.photo && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={urlFor(video.contributor.photo).width(128).height(128).url()}
                      alt={video.contributor.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-1">
                    {video.contributor.name}
                  </h4>
                  <p className="text-sm text-secondary">
                    {video.contributor.role === "contributing-videographer"
                      ? "Contributing Videographer"
                      : video.contributor.role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
