'use client';

import { useState } from 'react';

interface ReplyFormProps {
  threadId: string;
  token: string;
  onReplyAdded: (reply: any) => void;
}

export function ReplyForm({ threadId, token, onReplyAdded }: ReplyFormProps) {
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || posting) return;
    setPosting(true);

    const res = await fetch(`/api/community/threads/${threadId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body: trimmed }),
    });

    if (res.ok) {
      const { data } = await res.json();
      onReplyAdded(data);
      setBody('');
    }
    setPosting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a reply..."
        maxLength={10000}
        rows={3}
        className="w-full bg-background border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-muted">{body.length}/10000</span>
        <button
          type="submit"
          disabled={!body.trim() || posting}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {posting ? 'Posting...' : 'Reply'}
        </button>
      </div>
    </form>
  );
}
