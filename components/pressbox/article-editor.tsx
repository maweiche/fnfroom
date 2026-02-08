'use client';

import { useState } from 'react';
import { Copy, Check, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ArticleEditorProps {
  article: {
    id: string;
    headline: string;
    bodyMarkdown: string;
    published: boolean;
    editCount: number;
  };
}

export function ArticleEditor({ article: initialArticle }: ArticleEditorProps) {
  const [headline, setHeadline] = useState(initialArticle.headline);
  const [body, setBody] = useState(initialArticle.bodyMarkdown);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(initialArticle.published);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/pressbox/article', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: initialArticle.id,
          headline,
          bodyMarkdown: body,
        }),
      });
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    const fullArticle = `# ${headline}\n\n${body}`;
    await navigator.clipboard.writeText(fullArticle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/pressbox/article', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: initialArticle.id,
          published: true,
        }),
      });
      setPublished(true);
    } catch (err) {
      console.error('Failed to publish:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/pressbox')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-sm text-muted-foreground">Saving...</span>
            )}
            {published && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Published
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Headline */}
        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">
            Headline
          </label>
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            onBlur={handleSave}
            className="w-full text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-3"
            placeholder="Enter headline..."
          />
        </div>

        {/* Body */}
        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">
            Article Body (Markdown)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onBlur={handleSave}
            className="w-full min-h-[500px] font-mono text-sm bg-muted/50 border border-border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
            placeholder="Write your article..."
          />
        </div>

        {/* Preview */}
        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">
            Preview
          </label>
          <div className="prose prose-sm max-w-none bg-muted/30 rounded-lg p-6 border">
            <h1 className="text-2xl font-bold mb-4">{headline}</h1>
            <div className="whitespace-pre-wrap">{body}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 border rounded-lg shadow-lg">
          <button
            onClick={handleCopy}
            className={cn(
              "flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
              copied
                ? "bg-green-100 text-green-800"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy to Clipboard
              </>
            )}
          </button>

          <button
            onClick={handlePublish}
            disabled={published}
            className={cn(
              "flex-1 py-3 rounded-lg font-medium transition-colors",
              published
                ? "bg-green-100 text-green-800 cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {published ? 'Published' : 'Mark as Published'}
          </button>
        </div>

        {/* Stats */}
        <div className="text-sm text-muted-foreground text-center">
          Edit count: {initialArticle.editCount} • Word count: {body.split(/\s+/).length}
        </div>
      </div>
    </div>
  );
}
