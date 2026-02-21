'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Pin, Lock, Unlock, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ReplyCard } from '@/components/community/reply-card';
import { ReplyForm } from '@/components/community/reply-form';

interface Author {
  id: string;
  name: string;
  displayName: string | null;
  role: string;
}

interface Thread {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  locked: boolean;
  viewCount: number;
  postCount: number;
  createdAt: string;
  author: Author;
  category: {
    id: string;
    name: string;
    slug: string;
    sport: string | null;
  };
}

interface Reply {
  id: string;
  body: string;
  editedAt: string | null;
  createdAt: string;
  author: Author;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'ADMIN') return <span className="text-[10px] font-semibold uppercase bg-[#E6BC6A]/20 text-[#E6BC6A] px-1.5 py-0.5 rounded">Staff</span>;
  if (role === 'WRITER') return <span className="text-[10px] font-semibold uppercase bg-primary/20 text-primary px-1.5 py-0.5 rounded">Writer</span>;
  if (role === 'COACH') return <span className="text-[10px] font-semibold uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Coach</span>;
  return null;
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
      {initials}
    </div>
  );
}

export default function ThreadDetailPage() {
  const params = useParams();
  const threadId = params.threadId as string;
  const categorySlug = params.category as string;
  const { user, token } = useAuth();

  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [nextReplyCursor, setNextReplyCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const authToken = token || localStorage.getItem('authToken');

  const fetchThread = useCallback(async (replyCursor?: string) => {
    const queryParams = new URLSearchParams({ replyLimit: '30' });
    if (replyCursor) queryParams.set('replyCursor', replyCursor);

    const res = await fetch(`/api/community/threads/${threadId}?${queryParams}`);
    if (!res.ok) return null;
    return res.json() as Promise<{ data: Thread; replies: Reply[]; nextReplyCursor: string | null }>;
  }, [threadId]);

  useEffect(() => {
    fetchThread().then((result) => {
      if (result) {
        setThread(result.data);
        setReplies(result.replies);
        setNextReplyCursor(result.nextReplyCursor);
      }
      setLoading(false);
    });
  }, [fetchThread]);

  const handleLoadMoreReplies = async () => {
    if (!nextReplyCursor || loadingMore) return;
    setLoadingMore(true);
    const result = await fetchThread(nextReplyCursor);
    if (result) {
      setReplies((prev) => [...prev, ...result.replies]);
      setNextReplyCursor(result.nextReplyCursor);
    }
    setLoadingMore(false);
  };

  const handleReplyAdded = (reply: Reply) => {
    setReplies((prev) => [...prev, reply]);
    if (thread) {
      setThread({ ...thread, postCount: thread.postCount + 1 });
    }
  };

  const handleReplyDeleted = (replyId: string) => {
    setReplies((prev) => prev.filter((r) => r.id !== replyId));
    if (thread) {
      setThread({ ...thread, postCount: Math.max(0, thread.postCount - 1) });
    }
  };

  const handleReplyEdited = (replyId: string, newBody: string) => {
    setReplies((prev) =>
      prev.map((r) => (r.id === replyId ? { ...r, body: newBody, editedAt: new Date().toISOString() } : r))
    );
  };

  const handleTogglePin = async () => {
    if (!thread || !authToken) return;
    const res = await fetch(`/api/community/threads/${threadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ pinned: !thread.pinned }),
    });
    if (res.ok) {
      setThread({ ...thread, pinned: !thread.pinned });
    }
  };

  const handleToggleLock = async () => {
    if (!thread || !authToken) return;
    const res = await fetch(`/api/community/threads/${threadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ locked: !thread.locked }),
    });
    if (res.ok) {
      setThread({ ...thread, locked: !thread.locked });
    }
  };

  const handleDeleteThread = async () => {
    if (!authToken) return;
    const res = await fetch(`/api/community/threads/${threadId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (res.ok) {
      window.location.href = `/community/${categorySlug}`;
    }
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

  if (!thread) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12 text-muted">Thread not found</div>
        </div>
      </div>
    );
  }

  const authorName = thread.author.displayName || thread.author.name;
  const canDelete = user?.id === thread.author.id || isAdmin;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted mb-6">
          <Link href="/community" className="hover:text-foreground transition-colors">
            Community
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/community/${categorySlug}`} className="hover:text-foreground transition-colors">
            {thread.category.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{thread.title}</span>
        </nav>

        {/* Thread OP */}
        <div className="bg-card border border-border rounded-lg p-5 md:p-6">
          <div className="flex items-start gap-3">
            <InitialsAvatar name={authorName} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">{authorName}</span>
                <RoleBadge role={thread.author.role} />
                <span className="text-xs text-muted">{timeAgo(thread.createdAt)}</span>
              </div>

              <h1 className="text-xl md:text-2xl font-display font-bold text-foreground mb-3">
                {thread.pinned && <Pin className="w-4 h-4 text-[#E6BC6A] inline mr-1.5" />}
                {thread.locked && <Lock className="w-4 h-4 text-muted inline mr-1.5" />}
                {thread.title}
              </h1>

              <div className="text-sm text-secondary whitespace-pre-wrap">{thread.body}</div>
            </div>
          </div>

          {/* Admin controls */}
          {(isAdmin || canDelete) && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
              {isAdmin && (
                <>
                  <button
                    onClick={handleTogglePin}
                    className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
                  >
                    <Pin className="w-3.5 h-3.5" />
                    {thread.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={handleToggleLock}
                    className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
                  >
                    {thread.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {thread.locked ? 'Unlock' : 'Lock'}
                  </button>
                </>
              )}
              {canDelete && (
                <button
                  onClick={handleDeleteThread}
                  className="flex items-center gap-1 text-xs text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {/* Replies */}
        <div className="mt-6">
          <h2 className="text-sm font-medium text-muted mb-4">
            {thread.postCount} {thread.postCount === 1 ? 'Reply' : 'Replies'}
          </h2>

          {replies.length > 0 && (
            <div className="bg-card border border-border rounded-lg px-4 md:px-5">
              {replies.map((reply) => (
                <ReplyCard
                  key={reply.id}
                  reply={reply}
                  currentUserId={user?.id || null}
                  isAdmin={isAdmin}
                  token={authToken}
                  onDeleted={handleReplyDeleted}
                  onEdited={handleReplyEdited}
                />
              ))}
            </div>
          )}

          {nextReplyCursor && (
            <div className="text-center mt-4">
              <button
                onClick={handleLoadMoreReplies}
                disabled={loadingMore}
                className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                {loadingMore ? 'Loading...' : 'Load more replies'}
              </button>
            </div>
          )}
        </div>

        {/* Reply Form */}
        <div className="mt-6">
          {thread.locked ? (
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <Lock className="w-5 h-5 text-muted mx-auto mb-2" />
              <p className="text-sm text-muted">This thread is locked.</p>
            </div>
          ) : user && authToken ? (
            <ReplyForm
              threadId={threadId}
              token={authToken}
              onReplyAdded={handleReplyAdded}
            />
          ) : (
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <p className="text-sm text-muted">
                <Link href={`/register?redirect=/community/${categorySlug}/${threadId}`} className="text-primary hover:underline">
                  Sign up
                </Link>{' '}
                or{' '}
                <Link href={`/login?redirect=/community/${categorySlug}/${threadId}`} className="text-primary hover:underline">
                  sign in
                </Link>{' '}
                to reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
