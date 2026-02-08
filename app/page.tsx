import { CTAMarquee } from "@/components/cta-marquee";
import { Navigation } from "@/components/navigation";
import { HeroGrid } from "@/components/hero-grid";
import { UpcomingGames } from "@/components/upcoming-games";
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
  const [featuredArticle, latestArticles, latestVideos, featuredVideo, rankingsData] = await Promise.all([
    getFeaturedArticle(),
    getLatestArticles(9),
    getLatestVideos(6),
    getFeaturedVideo(),
    getLatestRankingsBySport(),
  ]);

  // If there's a featured article, filter it out from latest articles
  const displayArticles = featuredArticle
    ? latestArticles.filter((article) => article._id !== featuredArticle._id)
    : latestArticles;

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
    <div className="min-h-screen">
      {/* CTA Marquee Banner - Above Everything */}
      

      {/* Hero Section - Title + Cards Fill Viewport */}
      <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 48px)' }}>
        {/* Hero Grid (1-2 Layout) - Featured Article, Video, Games of Week */}
        <HeroGrid
          featuredArticle={featuredArticle ?? undefined}
          featuredVideoPlaybackId={heroVideoPlaybackId}
        />
      </div>

      {/* Upcoming Games Section */}
      <UpcomingGames />

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
