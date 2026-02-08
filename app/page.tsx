import { HeroArticle } from "@/components/hero-article";
import { ArticleCard } from "@/components/article-card";
import {
  getFeaturedArticle,
  getLatestArticles,
} from "@/sanity/lib/fetch";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  // Fetch featured article and latest articles in parallel
  const [featuredArticle, latestArticles] = await Promise.all([
    getFeaturedArticle(),
    getLatestArticles(6),
  ]);

  // If there's a featured article, filter it out from latest articles
  const displayArticles = featuredArticle
    ? latestArticles.filter((article) => article._id !== featuredArticle._id)
    : latestArticles;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      {featuredArticle ? (
        <section className="mb-12">
          <HeroArticle article={featuredArticle} />
        </section>
      ) : (
        <section className="relative h-[500px] md:h-[600px] rounded-lg overflow-hidden bg-gradient-to-br from-navy-header to-slate-800 mb-12">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 p-6 md:p-8 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Welcome to Friday Night Film Room
            </h1>
            <p className="text-lg text-white/90 mb-4">
              NC High School Sports Coverage
            </p>
            <p className="text-sm text-white/70">
              Set up Sanity Studio at{" "}
              <a
                href="/studio"
                className="text-primary hover:underline font-medium"
              >
                /studio
              </a>{" "}
              to start publishing content
            </p>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      {displayArticles.length > 0 ? (
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map((article, index) => (
              <ArticleCard
                key={article._id}
                article={article}
                priority={index < 3}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Latest Articles
          </h2>
          <div className="p-8 text-center bg-card border border-border rounded-lg">
            <p className="text-secondary mb-4">
              No articles published yet. Get started by visiting{" "}
              <a
                href="/studio"
                className="text-primary hover:underline font-medium"
              >
                Sanity Studio
              </a>
            </p>
            <ol className="text-left max-w-md mx-auto text-sm text-muted space-y-2">
              <li>1. Set up your Sanity project and add credentials to .env.local</li>
              <li>2. Create a staff member for yourself</li>
              <li>3. Publish your first article</li>
              <li>4. Mark an article as "featured" to show it in the hero</li>
            </ol>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="bg-primary/10 border border-primary/20 rounded-lg p-6 md:p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Get NC prep sports news in your inbox
          </h2>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-primary-dark font-medium rounded-lg hover:opacity-90 transition-opacity duration-150"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
