'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface ReplyCardProps {
  reply: {
    id: string;
    body: string;
    editedAt: string | null;
    createdAt: string;
    author: {
      id: string;
      name: string;
      displayName: string | null;
      role: string;
    };
  };
  currentUserId: string | null;
  isAdmin: boolean;
  token: string | null;
  onDeleted: (replyId: string) => void;
  onEdited: (replyId: string, newBody: string) => void;
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
    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
      {initials}
    </div>
  );
}

export function ReplyCard({ reply, currentUserId, isAdmin, token, onDeleted, onEdited }: ReplyCardProps) {
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(reply.body);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAuthor = currentUserId === reply.author.id;
  const canEdit = isAuthor;
  const canDelete = isAuthor || isAdmin;
  const authorName = reply.author.displayName || reply.author.name;

  const handleEdit = async () => {
    if (!editBody.trim() || saving) return;
    setSaving(true);

    const res = await fetch(`/api/community/replies/${reply.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body: editBody.trim() }),
    });

    if (res.ok) {
      onEdited(reply.id, editBody.trim());
      setEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);

    const res = await fetch(`/api/community/replies/${reply.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      onDeleted(reply.id);
    }
    setDeleting(false);
  };

  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-0">
      <InitialsAvatar name={authorName} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">{authorName}</span>
          <RoleBadge role={reply.author.role} />
          <span className="text-xs text-muted">{timeAgo(reply.createdAt)}</span>
          {reply.editedAt && <span className="text-xs text-muted italic">(edited)</span>}
        </div>

        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={3}
              className="w-full bg-background border border-border rounded-md p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                disabled={saving || !editBody.trim()}
                className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => { setEditing(false); setEditBody(reply.body); }}
                className="px-3 py-1 text-xs text-muted hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-secondary whitespace-pre-wrap">{reply.body}</p>
        )}

        {!editing && (canEdit || canDelete) && (
          <div className="flex gap-2 mt-2">
            {canEdit && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1 text-xs text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
