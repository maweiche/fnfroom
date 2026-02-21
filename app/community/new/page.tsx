'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  sport: string | null;
}

function NewThreadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);

  useEffect(() => {
    fetch('/api/community/categories')
      .then((res) => res.json())
      .then(({ data }) => {
        setCategories(data);
        if (!categoryId && data.length > 0) {
          setCategoryId(data[0].id);
        }
      });
  }, [categoryId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/register?redirect=/community/new`);
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }
    if (body.length < 10) {
      setError('Body must be at least 10 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/community/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ title, body, categoryId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create thread');
      }

      const { data: thread } = await res.json();
      const cat = categories.find((c) => c.id === categoryId);
      router.push(`/community/${cat?.slug || 'general'}/${thread.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted mb-6">
          <Link href="/community" className="hover:text-foreground transition-colors">
            Community
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">New Thread</span>
        </nav>

        <h1 className="text-2xl font-display font-bold text-foreground mb-6">
          Start a Discussion
        </h1>

        <div className="bg-card border border-border rounded-lg p-5 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Title
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="What's on your mind?"
                disabled={loading}
              />
              <p className="text-xs text-muted mt-1">{title.length}/200</p>
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-foreground mb-2">
                Body
              </label>
              <textarea
                id="body"
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={10000}
                rows={8}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Share your thoughts..."
                disabled={loading}
              />
              <p className="text-xs text-muted mt-1">{body.length}/10000</p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/community"
                className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Thread'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewThreadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted text-sm">Loading...</div>}>
      <NewThreadForm />
    </Suspense>
  );
}
