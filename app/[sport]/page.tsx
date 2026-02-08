import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HeroArticle } from "@/components/hero-article";
import { ArticleCard } from "@/components/article-card";
import { sportLabels, type Sport } from "@/lib/utils";
import {
  getFeaturedArticleBySport,
  getArticlesBySport,
} from "@/sanity/lib/fetch";

interface SportHubPageProps {
  params: Promise<{
    sport: string;
  }>;
}

// Validate sport parameter
function isValidSport(sport: string): sport is Sport {
  return ["basketball", "football", "lacrosse"].includes(sport);
}

export async function generateMetadata({
  params,
}: SportHubPageProps): Promise<Metadata> {
  const { sport } = await params;

  if (!isValidSport(sport)) {
    return {
      title: "Sport Not Found",
    };
  }

  const sportName = sportLabels[sport];

  return {
    title: `${sportName} | Friday Night Film Room`,
    description: `Latest ${sportName.toLowerCase()} news, game recaps, and analysis from North Carolina high schools.`,
  };
}

export default async function SportHubPage({ params }: SportHubPageProps) {
  const { sport } = await params;

  // Validate sport
  if (!isValidSport(sport)) {
    notFound();
  }

  const sportName = sportLabels[sport];

  // Fetch featured article and all articles for this sport in parallel
  const [featuredArticle, articles] = await Promise.all([
    getFeaturedArticleBySport(sport),
    getArticlesBySport(sport),
  ]);

  // Filter out featured article from the articles list to avoid duplication
  const displayArticles = featuredArticle
    ? articles.filter((article) => article._id !== featuredArticle._id)
    : articles;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Featured Article Section */}
        {featuredArticle ? (
          <section className="mb-12">
            <HeroArticle article={featuredArticle} />
          </section>
        ) : (
          <section className="mb-12">
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
              <div className="text-center px-6">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {sportName}
                </h1>
                <p className="text-lg text-secondary">
                  Latest coverage from North Carolina high schools
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - Article Feed */}
          <div className="lg:col-span-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Latest {sportName} Articles
            </h2>

            {displayArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayArticles.map((article, index) => (
                  <ArticleCard
                    key={article._id}
                    article={article}
                    priority={index < 4}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-card border border-border rounded-lg">
                <p className="text-secondary mb-4">
                  No {sportName.toLowerCase()} articles published yet.
                </p>
                <p className="text-sm text-muted">
                  Check back soon for the latest coverage, or{" "}
                  <a
                    href="/studio"
                    className="text-primary hover:underline font-medium"
                  >
                    create your first article
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-20 space-y-8">
              {/* Rankings Placeholder */}
              <div className="p-6 bg-card border border-border rounded-lg">
                <h3 className="text-lg font-bold mb-4">
                  {sportName} Rankings
                </h3>
                <p className="text-sm text-secondary mb-4">
                  Team rankings coming soon
                </p>
                <a
                  href="/rankings"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  View All Rankings →
                </a>
              </div>

              {/* Video Section Placeholder */}
              <div className="p-6 bg-card border border-border rounded-lg">
                <h3 className="text-lg font-bold mb-4">Latest Videos</h3>
                <p className="text-sm text-secondary mb-4">
                  Video highlights coming soon
                </p>
                <a
                  href="/video"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  View All Videos →
                </a>
              </div>

              {/* About This Sport */}
              <div className="p-6 bg-primary/10 border border-primary/20 rounded-lg">
                <h3 className="text-lg font-bold mb-3">
                  About {sportName} Coverage
                </h3>
                <p className="text-sm text-secondary">
                  In-depth coverage of North Carolina high school {sportName.toLowerCase()}{" "}
                  including game recaps, player spotlights, recruiting updates,
                  and weekly rankings.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
