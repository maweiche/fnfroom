'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, ChevronRight } from 'lucide-react';
import { ThreadCard } from '@/components/community/thread-card';

interface Author {
  id: string;
  name: string;
  displayName: string | null;
  role: string;
}

interface Thread {
  id: string;
  title: string;
  pinned: boolean;
  locked: boolean;
  viewCount: number;
  postCount: number;
  lastPostAt: string | null;
  createdAt: string;
  author: Author;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  sport: string | null;
  description: string | null;
}

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;

  const [threads, setThreads] = useState<Thread[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchThreads = useCallback(async (cursor?: string) => {
    const queryParams = new URLSearchParams({ category: categorySlug, limit: '20' });
    if (cursor) queryParams.set('cursor', cursor);

    const res = await fetch(`/api/community/threads?${queryParams}`);
    if (!res.ok) return null;
    return res.json() as Promise<{ data: Thread[]; category: Category; nextCursor: string | null }>;
  }, [categorySlug]);

  useEffect(() => {
    fetchThreads().then((result) => {
      if (result) {
        setThreads(result.data);
        setCategory(result.category);
        setNextCursor(result.nextCursor);
      }
      setLoading(false);
    });
  }, [fetchThreads]);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const result = await fetchThreads(nextCursor);
    if (result) {
      setThreads((prev) => [...prev, ...result.data]);
      setNextCursor(result.nextCursor);
    }
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12 text-muted text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12 text-muted">Category not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted mb-6">
          <Link href="/community" className="hover:text-foreground transition-colors">
            Community
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">{category.name}</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-sm text-muted mt-1">{category.description}</p>
            )}
          </div>
          <Link
            href={`/community/new?category=${category.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Thread
          </Link>
        </div>

        {threads.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted text-sm">No threads yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {threads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} categorySlug={categorySlug} />
            ))}
          </div>
        )}

        {nextCursor && (
          <div className="text-center mt-6">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              {loadingMore ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
