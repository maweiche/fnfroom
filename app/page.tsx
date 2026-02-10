import { HeroGrid } from "@/components/hero-grid";
import { ArticlesGrid } from "@/components/articles-grid";
import { VideoSpotlight } from "@/components/video-spotlight";
import { RankingsSnapshot } from "@/components/rankings-snapshot";
import { NewsletterCTA } from "@/components/newsletter-cta";
import {
  getFeaturedArticle,
  getLatestArticles,
  getLatestVideos,
  getFeaturedVideo,
  getLatestRankingsBySport,
} from "@/sanity/lib/fetch";
import type { Sport } from "@/lib/sanity.types";

export const revalidate = 60; // Disable cache during development (change to 60 for production)

export default async function HomePage() {
  // Fetch all data in parallel for maximum performance
  const [latestArticles, latestVideos, featuredVideo, rankingsData] = await Promise.all([
    getLatestArticles(11), // Get 11 articles: 2 for hero, 9 for grid
    getLatestVideos(6),
    getFeaturedVideo(),
    getLatestRankingsBySport(),
  ]);

  // Split articles: first 2 for hero, rest for grid
  const heroArticles = latestArticles.slice(0, 2);
  const displayArticles = latestArticles.slice(2);

  // Get video playback ID for hero background
  const heroVideoPlaybackId = featuredVideo?.video?.asset?.playbackId || "aBAAX02C6teTYmicbe00heMnhOro7GjDx00pAVQ02yIPSjo"

  // Transform rankings data for the snapshot component
  const rankings = Object.entries(rankingsData)
    .filter(([_, ranking]) => ranking !== null)
    .map(([sport, ranking]) => ({
      sport: sport as Sport,
      entries: ranking!.entries.map((entry) => ({
        rank: entry.rank,
        team: entry.team,
        record: entry.record,
        trend: entry.trend as "up" | "down" | "steady",
      })),
      lastUpdated: new Date(ranking!.publishDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));

  return (
    <div className="min-h-screen pt-4">
      {/* Hero Section - Title + Cards Fill Viewport */}
      <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 48px)' }}>
        {/* Hero Grid (1-2 Layout) - Featured Articles, Video, Games of Week */}
        <HeroGrid
          featuredArticles={heroArticles}
          featuredVideoPlaybackId={heroVideoPlaybackId}
        />
      </div>

      {/* Latest Articles Grid with Filters */}
      <ArticlesGrid
        articles={displayArticles}
        title="Latest News"
        priority
        showFilters={true}
      />

      {/* Video Spotlight Section */}
      {latestVideos.length > 0 && <VideoSpotlight videos={latestVideos} />}

      {/* Rankings Snapshot */}
      {rankings.length > 0 && <RankingsSnapshot rankings={rankings} />}

      {/* Newsletter CTA */}
      <NewsletterCTA />
    </div>
  );
}
