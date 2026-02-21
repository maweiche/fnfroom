"use client";

import { useState, useEffect, useCallback } from "react";
import { BoardPost } from "./board-post";

interface Author {
  id: string;
  name: string;
  role: string;
  schoolName: string | null;
}

interface Reply {
  id: string;
  body: string;
  author: Author;
  createdAt: string;
}

export interface Post {
  id: string;
  body: string;
  author: Author;
  replies: Reply[];
  createdAt: string;
}

function getToken() {
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match?.[1] || document.cookie.match(/(?:^|; )token=([^;]*)/)?.[1] || "";
}

export function BoardFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchPosts = useCallback(async (cursor?: string) => {
    const token = getToken();
    const params = new URLSearchParams({ limit: "20" });
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`/api/board/posts?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;
    return res.json() as Promise<{ data: Post[]; nextCursor: string | null }>;
  }, []);

  useEffect(() => {
    fetchPosts().then((result) => {
      if (result) {
        setPosts(result.data);
        setNextCursor(result.nextCursor);
      }
      setLoading(false);
    });

    // Decode current user from token
    try {
      const token = getToken();
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.userId);
      }
    } catch {}
  }, [fetchPosts]);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const result = await fetchPosts(nextCursor);
    if (result) {
      setPosts((prev) => [...prev, ...result.data]);
      setNextCursor(result.nextCursor);
    }
    setLoadingMore(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || posting) return;
    setPosting(true);

    const token = getToken();
    const res = await fetch("/api/board/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body: trimmed }),
    });

    if (res.ok) {
      const { data } = await res.json();
      setPosts((prev) => [data, ...prev]);
      setBody("");
    }
    setPosting(false);
  };

  const handleDelete = async (postId: string) => {
    const token = getToken();
    const res = await fetch(`/api/board/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  const handleReplyAdded = (postId: string, reply: Reply) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, replies: [...p.replies, reply] } : p
      )
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted text-sm">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compose */}
      <form onSubmit={handlePost} className="bg-card border border-border rounded-lg p-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share an update with the team..."
          maxLength={2000}
          rows={3}
          className="w-full bg-background border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted">
            {body.length}/2000
          </span>
          <button
            type="submit"
            disabled={!body.trim() || posting}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-muted text-sm">
          No posts yet. Be the first to share something.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <BoardPost
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onDelete={handleDelete}
              onReplyAdded={handleReplyAdded}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {nextCursor && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
