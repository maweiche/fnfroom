import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Beer } from "lucide-react";
import { getArticleBySlug, getArticlesByCategory } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import { PortableTextRenderer } from "@/components/portable-text";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found | Friday Night Film Room",
    };
  }

  const imageUrl = article.featuredImage
    ? urlFor(article.featuredImage).width(1200).height(630).url()
    : null;

  return {
    title: `${article.title} | Beer Cooler | Friday Night Film Room`,
    description:
      article.seoDescription || article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      type: "article",
      publishedTime: article.publishDate,
      authors: [article.author.name],
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function BeerCoolerArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  // Verify article exists and is a beer-cooler category article
  const BEER_COOLER_CATEGORY = "beer-cooler";
  if (!article || (article.category as string | undefined) !== BEER_COOLER_CATEGORY) {
    notFound();
  }

  const imageUrl = article.featuredImage
    ? urlFor(article.featuredImage).width(1000).height(750).url()
    : null;

  // Get related beer cooler articles
  const relatedArticles = (await getArticlesByCategory("beer-cooler"))
    .filter((a) => a._id !== article._id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <Link
            href="/beer-cooler"
            className="inline-flex items-center gap-2 text-sm text-secondary hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Beer Cooler
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative aspect-[4/3] w-full bg-gradient-to-br from-slate-700 to-slate-900">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={article.featuredImage?.alt || article.title}
            fill
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto max-w-4xl">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-4">
              <Beer className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                Beer Cooler
              </span>
              <span className="text-warm-cream">•</span>
              <span className="text-sm text-warm-cream/90">
                Triad Adult Lacrosse League
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              {article.title}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-warm-cream/90">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium">{article.author.name}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={article.publishDate}>
                  {formatDate(article.publishDate)}
                </time>
              </div>
            </div>

            {/* Photographer credit */}
            {article.featuredImage?.photographer && (
              <p className="text-xs text-warm-cream/70 mt-3">
                Photo by {article.featuredImage.photographer}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            {/* Excerpt/Intro */}
            {article.excerpt && (
              <p className="text-lg md:text-xl text-secondary leading-relaxed mb-8 pb-8 border-b border-border">
                {article.excerpt}
              </p>
            )}

            {/* Article Body */}
            <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary prose-blockquote:text-secondary">
              {article.body && <PortableTextRenderer content={article.body} />}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium bg-muted/20 text-secondary rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            <div className="mt-12 p-6 bg-card border border-border rounded-lg">
              <div className="flex gap-4">
                {article.author.photo && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={urlFor(article.author.photo).width(64).height(64).url()}
                      alt={article.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    {article.author.name}
                  </p>
                  <p className="text-sm text-secondary mb-2">
                    {article.author.role}
                  </p>
                  {article.author.shortBio && (
                    <p className="text-sm text-secondary leading-relaxed">
                      {article.author.shortBio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-12 bg-card/30 border-t border-border">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              More from Beer Cooler
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((related) => {
                const relatedImageUrl = related.featuredImage
                  ? urlFor(related.featuredImage).width(800).height(450).url()
                  : null;

                return (
                  <Link
                    key={related._id}
                    href={`/beer-cooler/${related.slug.current}`}
                    className="group block"
                  >
                    <article className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
                      {/* Sport Badge */}
                      <div className="h-1 bg-lacrosse" />

                      {/* Image */}
                      {relatedImageUrl && (
                        <div className="relative w-full aspect-video">
                          <Image
                            src={relatedImageUrl}
                            alt={related.featuredImage?.alt || related.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="p-6 flex-1 flex flex-col">
                        {/* Title */}
                        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {related.title}
                        </h3>

                        {/* Excerpt */}
                        {related.excerpt && (
                          <p className="text-sm text-secondary line-clamp-2 mb-3 flex-1">
                            {related.excerpt}
                          </p>
                        )}

                        {/* Date */}
                        <time className="text-xs text-muted">
                          {formatDate(related.publishDate)}
                        </time>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
