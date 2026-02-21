"use client";

import { useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import type { Post } from "./board-feed";

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

function getToken() {
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match?.[1] || document.cookie.match(/(?:^|; )token=([^;]*)/)?.[1] || "";
}

function relativeTime(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  ADMIN: { label: "Admin", className: "bg-[#E6BC6A]/15 text-[#E6BC6A]" },
  WRITER: { label: "Writer", className: "bg-muted/30 text-muted-foreground" },
  COACH: { label: "Coach", className: "bg-[#94d873]/15 text-[#94d873]" },
};

function RoleBadge({ role }: { role: string }) {
  const badge = ROLE_BADGE[role] || { label: role, className: "bg-muted/30 text-muted-foreground" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${badge.className}`}>
      {badge.label}
    </span>
  );
}

function AuthorLine({ author, time }: { author: Author; time: string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-foreground">{author.name}</span>
      <RoleBadge role={author.role} />
      {author.schoolName && (
        <span className="text-xs text-muted">{author.schoolName}</span>
      )}
      <span className="text-xs text-muted">{relativeTime(time)}</span>
    </div>
  );
}

export function BoardPost({
  post,
  currentUserId,
  onDelete,
  onReplyAdded,
}: {
  post: Post;
  currentUserId: string | null;
  onDelete: (id: string) => void;
  onReplyAdded: (postId: string, reply: Reply) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Decode role from token for admin check
  let currentUserRole = "";
  try {
    const token = getToken();
    if (token) {
      currentUserRole = JSON.parse(atob(token.split(".")[1])).role;
    }
  } catch {}

  const canDelete = currentUserId === post.author.id || currentUserRole === "ADMIN";

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = replyBody.trim();
    if (!trimmed || replying) return;
    setReplying(true);

    const token = getToken();
    const res = await fetch(`/api/board/posts/${post.id}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body: trimmed }),
    });

    if (res.ok) {
      const { data } = await res.json();
      onReplyAdded(post.id, data);
      setReplyBody("");
    }
    setReplying(false);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    onDelete(post.id);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Post header */}
      <div className="flex items-start justify-between gap-2">
        <AuthorLine author={post.author} time={post.createdAt} />
        {canDelete && (
          <button
            onClick={handleDelete}
            className={`p-1 rounded transition-colors ${
              confirmDelete
                ? "text-destructive bg-destructive/10"
                : "text-muted hover:text-destructive"
            }`}
            title={confirmDelete ? "Click again to confirm" : "Delete post"}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Post body */}
      <p className="text-sm text-foreground mt-2 whitespace-pre-wrap break-words">
        {post.body}
      </p>

      {/* Reply toggle */}
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {post.replies.length > 0
            ? `${post.replies.length} ${post.replies.length === 1 ? "reply" : "replies"}`
            : "Reply"}
        </button>
      </div>

      {/* Replies section */}
      {showReplies && (
        <div className="mt-3 border-t border-border pt-3 space-y-3">
          {post.replies.map((reply) => (
            <div key={reply.id} className="pl-3 border-l-2 border-border">
              <AuthorLine author={reply.author} time={reply.createdAt} />
              <p className="text-sm text-foreground mt-1 whitespace-pre-wrap break-words">
                {reply.body}
              </p>
            </div>
          ))}

          {/* Reply form */}
          <form onSubmit={handleReply} className="flex gap-2 mt-2">
            <input
              type="text"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write a reply..."
              maxLength={2000}
              className="flex-1 h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!replyBody.trim() || replying}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {replying ? "..." : "Reply"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
