import Link from "next/link";
import Image from "next/image";
import { SportTag } from "./sport-tag";
import { urlFor } from "@/sanity/lib/image";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/lib/sanity.types";

interface HeroArticleProps {
  article: Article;
}

export function HeroArticle({ article }: HeroArticleProps) {
  const imageUrl = article.featuredImage
    ? urlFor(article.featuredImage).width(1920).height(1080).url()
    : null;

  return (
    <Link href={`/${article.sport}/${article.slug.current}`}>
      <section className="relative h-[500px] md:h-[600px] rounded-lg overflow-hidden group cursor-pointer">
        {/* Background Image */}
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={article.featuredImage?.alt || article.title}
            fill
            sizes="100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 p-6 md:p-8 text-white max-w-4xl">
          <SportTag sport={article.sport} className="mb-4" />

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight group-hover:text-primary transition-colors duration-200">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-lg text-white/90 mb-4 line-clamp-2 hidden md:block">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center gap-3 text-sm">
            {article.author.photo && (
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                <Image
                  src={urlFor(article.author.photo).width(80).height(80).url()}
                  alt={article.author.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            )}
            <span className="font-medium">{article.author.name}</span>
            <span>•</span>
            <time dateTime={article.publishDate}>
              {formatDate(article.publishDate)}
            </time>
          </div>
        </div>
      </section>
    </Link>
  );
}
