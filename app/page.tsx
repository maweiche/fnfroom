import { SportTag } from "@/components/sport-tag";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section - Placeholder */}
      <section className="relative h-[500px] md:h-[600px] rounded-lg overflow-hidden bg-gradient-to-br from-navy-header to-slate-800 mb-12">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 p-6 md:p-8 text-white">
          <SportTag sport="basketball" className="mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Welcome to Friday Night Film Room
          </h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium">NC High School Sports Coverage</span>
          </div>
        </div>
      </section>

      {/* Latest Articles - Placeholder Grid */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Latest Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <article
              key={i}
              className="overflow-hidden rounded-lg bg-card shadow-card hover:shadow-card-hover transition-shadow duration-200"
            >
              <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />
              <div className="p-4">
                <SportTag
                  sport={
                    i % 3 === 0
                      ? "basketball"
                      : i % 3 === 1
                        ? "football"
                        : "lacrosse"
                  }
                  className="mb-2"
                />
                <h3 className="text-lg font-semibold line-clamp-2 mb-3">
                  Article Headline Goes Here
                </h3>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <span>Author Name</span>
                  <span>•</span>
                  <time>Feb 7, 2026</time>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

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
