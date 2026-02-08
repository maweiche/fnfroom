import Link from "next/link";
import Image from "next/image";
import { SportTag } from "./sport-tag";
import { urlFor } from "@/sanity/lib/image";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/lib/sanity.types";

interface ArticleCardProps {
  article: Article;
  priority?: boolean;
}

export function ArticleCard({ article, priority = false }: ArticleCardProps) {
  const imageUrl = article.featuredImage
    ? urlFor(article.featuredImage).width(800).height(450).url()
    : null;

  // Use excerpt if available, otherwise truncate body text
  const excerpt = article.excerpt || "";

  return (
    <Link
      href={`/${article.sport}/${article.slug.current}`}
      className="group block"
    >
      <article className="overflow-hidden rounded-lg bg-card shadow-card hover:shadow-card-hover transition-shadow duration-200 h-full flex flex-col">
        {/* Featured Image */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={article.featuredImage?.alt || article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority={priority}
            />
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <SportTag sport={article.sport} className="mb-2" />

          <h3 className="text-lg font-semibold line-clamp-2 mb-3 group-hover:text-primary transition-colors duration-150">
            {article.title}
          </h3>

          {excerpt && (
            <p className="text-sm text-secondary line-clamp-2 mb-3 flex-1">
              {excerpt}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-2 text-sm text-secondary mt-auto">
            <span className="font-medium">{article.author.name}</span>
            <span>•</span>
            <time dateTime={article.publishDate}>
              {formatDate(article.publishDate)}
            </time>
          </div>
        </div>
      </article>
    </Link>
  );
}
