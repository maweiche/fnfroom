import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { SportTag } from "@/components/sport-tag";
import { AuthorCard } from "@/components/author-card";
import { ArticleCard } from "@/components/article-card";
import { PortableTextRenderer } from "@/components/portable-text";
import { formatDate } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import {
  getArticleBySlug,
  getRelatedArticles,
} from "@/sanity/lib/fetch";
import type { Sport } from "@/lib/sanity.types";

interface ArticlePageProps {
  params: Promise<{
    sport: Sport;
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  const imageUrl = article.featuredImage
    ? urlFor(article.featuredImage).width(1200).height(630).url()
    : undefined;

  return {
    title: `${article.title} | Friday Night Film Room`,
    description:
      article.seoDescription ||
      article.excerpt ||
      `Read about ${article.title} on Friday Night Film Room`,
    openGraph: {
      title: article.title,
      description: article.seoDescription || article.excerpt,
      type: "article",
      publishedTime: article.publishDate,
      authors: [article.author.name],
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.seoDescription || article.excerpt,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug, sport } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || article.sport !== sport) {
    notFound();
  }

  // Fetch related articles
  const relatedArticles = await getRelatedArticles(article.sport, article._id);

  const imageUrl = article.featuredImage
    ? urlFor(article.featuredImage).width(1920).height(1080).url()
    : null;

  return (
    <article className="min-h-screen">
      {/* Hero Section */}
      <header className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={article.featuredImage?.alt || article.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 container mx-auto px-4 pb-8">
          <SportTag sport={article.sport} className="mb-4" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight max-w-4xl">
            {article.title}
          </h1>
          <div className="flex items-center gap-3 text-white/90 text-sm">
            <span className="font-medium">{article.author.name}</span>
            <span>•</span>
            <time dateTime={article.publishDate}>
              {formatDate(article.publishDate)}
            </time>
          </div>
        </div>
        {article.featuredImage?.photographer && (
          <div className="absolute bottom-2 right-2 text-xs text-white/70">
            Photo: {article.featuredImage.photographer}
          </div>
        )}
      </header>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="prose prose-lg max-w-none">
              <PortableTextRenderer content={article.body} />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted/20 text-muted text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Card */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">About the Author</h2>
              <AuthorCard author={article.author} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="sticky top-20">
                <h2 className="text-xl font-bold mb-4">Related Articles</h2>
                <div className="flex flex-col gap-4">
                  {relatedArticles.map((related) => (
                    <ArticleCard key={related._id} article={related} />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
}
