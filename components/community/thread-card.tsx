'use client';

import Link from 'next/link';
import { Pin, Lock, MessageSquare, Eye } from 'lucide-react';

interface ThreadCardProps {
  thread: {
    id: string;
    title: string;
    pinned: boolean;
    locked: boolean;
    viewCount: number;
    postCount: number;
    lastPostAt: string | null;
    createdAt: string;
    author: {
      id: string;
      name: string;
      displayName: string | null;
      role: string;
    };
  };
  categorySlug: string;
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

export function ThreadCard({ thread, categorySlug }: ThreadCardProps) {
  const authorName = thread.author.displayName || thread.author.name;
  const activityTime = thread.lastPostAt || thread.createdAt;

  return (
    <Link
      href={`/community/${categorySlug}/${thread.id}`}
      className="block bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        {/* Indicators */}
        <div className="flex flex-col items-center gap-1 pt-1 min-w-[20px]">
          {thread.pinned && <Pin className="w-4 h-4 text-[#E6BC6A]" />}
          {thread.locked && <Lock className="w-4 h-4 text-muted" />}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{thread.title}</h3>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted">
            <span className="text-secondary">{authorName}</span>
            <RoleBadge role={thread.author.role} />
            <span>&middot;</span>
            <span>{timeAgo(activityTime)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted shrink-0">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {thread.postCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {thread.viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
