import { ArticleCard } from "@/components/article-card";
import type { Article } from "@/lib/sanity.types";

interface RelatedContentProps {
  articles: Article[];
}

export function RelatedContent({ articles }: RelatedContentProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="p-4 md:p-6 bg-card border border-border rounded-lg">
      <h3 className="text-lg font-bold mb-4">Related Articles</h3>
      <div className="space-y-4">
        {articles.slice(0, 5).map((article) => (
          <ArticleCard key={article._id} article={article} listView />
        ))}
      </div>
    </div>
  );
}
