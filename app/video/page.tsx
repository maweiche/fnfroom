"use client";

import { useState, useEffect } from "react";
import { VideoCard } from "@/components/video-card";
import { SportTag } from "@/components/sport-tag";
import type { Video } from "@/lib/sanity.types";
import type { Sport, VideoType } from "@/lib/sanity.types";

export default function VideoHubPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<Sport | "all">("all");
  const [typeFilter, setTypeFilter] = useState<VideoType | "all">("all");

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch("/api/videos");
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  const filteredVideos = videos.filter((video) => {
    const matchesSport = sportFilter === "all" || video.sport === sportFilter;
    const matchesType = typeFilter === "all" || video.type === typeFilter;
    return matchesSport && matchesType;
  });

  const sportOptions: Array<{ value: Sport | "all"; label: string }> = [
    { value: "all", label: "All Sports" },
    { value: "basketball", label: "Basketball" },
    { value: "football", label: "Football" },
    { value: "lacrosse", label: "Lacrosse" },
  ];

  const typeOptions: Array<{ value: VideoType | "all"; label: string }> = [
    { value: "all", label: "All Types" },
    { value: "highlights", label: "Highlights" },
    { value: "game-film", label: "Game Film" },
    { value: "interview", label: "Interviews" },
    { value: "feature", label: "Features" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Video Hub</h1>
        <p className="text-lg text-secondary">
          Game highlights, interviews, and features from North Carolina prep sports
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="sport-filter" className="text-sm text-secondary mb-2 block">
            Filter by Sport
          </label>
          <select
            id="sport-filter"
            className="w-full px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value as Sport | "all")}
          >
            {sportOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="type-filter" className="text-sm text-secondary mb-2 block">
            Filter by Type
          </label>
          <select
            id="type-filter"
            className="w-full px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as VideoType | "all")}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(sportFilter !== "all" || typeFilter !== "all") && (
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-secondary">Active filters:</span>
          {sportFilter !== "all" && (
            <SportTag
              sport={sportFilter as Sport}
              className="cursor-pointer"
              onClick={() => setSportFilter("all")}
            />
          )}
          {typeFilter !== "all" && (
            <span className="px-3 py-1 bg-muted/20 text-muted text-sm rounded-full cursor-pointer hover:bg-muted/30"
              onClick={() => setTypeFilter("all")}
            >
              {typeOptions.find((opt) => opt.value === typeFilter)?.label} ×
            </span>
          )}
          <button
            onClick={() => {
              setSportFilter("all");
              setTypeFilter("all");
            }}
            className="text-sm text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Video Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-secondary">Loading videos...</p>
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-card border border-border rounded-lg">
          <p className="text-secondary mb-4">
            {videos.length === 0
              ? "No videos published yet."
              : "No videos match your filters."}
          </p>
          {videos.length === 0 ? (
            <p className="text-sm text-muted">
              Upload videos through{" "}
              <a
                href="/studio"
                className="text-primary hover:underline font-medium"
              >
                Sanity Studio
              </a>
            </p>
          ) : (
            <button
              onClick={() => {
                setSportFilter("all");
                setTypeFilter("all");
              }}
              className="text-sm text-primary hover:underline font-medium"
            >
              Clear filters to see all videos
            </button>
          )}
        </div>
      )}
    </div>
  );
}
