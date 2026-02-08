'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  completed: boolean;
  createdAt: string;
}

interface Article {
  id: string;
  headline: string;
  published: boolean;
  editCount: number;
  createdAt: string;
  conversation: {
    homeTeam: string;
    awayTeam: string;
    sport: string;
  };
}

interface DashboardProps {
  conversations: Conversation[];
  articles: Article[];
}

export function Dashboard({ conversations: initialConversations, articles: initialArticles }: DashboardProps) {
  const [showNewConversationForm, setShowNewConversationForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    sport: 'football',
    homeTeam: '',
    awayTeam: '',
    location: '',
    gameDate: new Date().toISOString().split('T')[0],
  });

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pressbox/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          gameDate: new Date(formData.gameDate).toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to create conversation');

      const { conversation } = await response.json();
      router.push(`/pressbox/conversation/${conversation.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create conversation');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Press Box AI</h1>
              <p className="text-muted-foreground">
                Voice-to-article generation for game recaps
              </p>
            </div>

            <button
              onClick={() => setShowNewConversationForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Conversation
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* New Conversation Form */}
        {showNewConversationForm && (
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Start New Conversation</h2>

            <form onSubmit={handleCreateConversation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sport</label>
                  <select
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-background"
                    required
                  >
                    <option value="football">Football</option>
                    <option value="basketball">Basketball</option>
                    <option value="soccer">Soccer</option>
                    <option value="baseball">Baseball</option>
                    <option value="lacrosse">Lacrosse</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Game Date</label>
                  <input
                    type="date"
                    value={formData.gameDate}
                    onChange={(e) => setFormData({ ...formData, gameDate: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-background"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Home Team</label>
                  <input
                    type="text"
                    value={formData.homeTeam}
                    onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                    placeholder="Wake Forest"
                    className="w-full p-2 border rounded-lg bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Away Team</label>
                  <input
                    type="text"
                    value={formData.awayTeam}
                    onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                    placeholder="Chapel Hill"
                    className="w-full p-2 border rounded-lg bg-background"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Location (Optional)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Wake Forest High School"
                  className="w-full p-2 border rounded-lg bg-background"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Start Interview'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowNewConversationForm(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recent Conversations */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent Conversations
          </h2>

          {initialConversations.length === 0 ? (
            <div className="bg-muted/50 border-2 border-dashed rounded-lg p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No conversations yet</p>
              <button
                onClick={() => setShowNewConversationForm(true)}
                className="text-primary hover:underline"
              >
                Start your first conversation
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {initialConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => router.push(`/pressbox/conversation/${conv.id}`)}
                  className="bg-card border rounded-lg p-4 hover:border-primary transition-colors text-left"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">
                        {conv.homeTeam} vs {conv.awayTeam}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {conv.sport} • {new Date(conv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs",
                        conv.completed
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      )}
                    >
                      {conv.completed ? 'Complete' : 'In Progress'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Articles */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Articles
          </h2>

          {initialArticles.length === 0 ? (
            <div className="bg-muted/50 border-2 border-dashed rounded-lg p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No articles generated yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {initialArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => router.push(`/pressbox/article/${article.id}`)}
                  className="bg-card border rounded-lg p-4 hover:border-primary transition-colors text-left"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{article.headline}</h3>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs",
                        article.published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {article.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {article.conversation.homeTeam} vs {article.conversation.awayTeam} •{' '}
                    {article.editCount} edits •{' '}
                    {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
