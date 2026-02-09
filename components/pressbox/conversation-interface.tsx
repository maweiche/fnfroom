'use client';

import { useState, useEffect, useRef } from 'react';
import { VoiceRecorder } from './voice-recorder';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ConversationInterfaceProps {
  conversationId: string;
  initialTranscript?: Message[];
  gameInfo: {
    homeTeam: string;
    awayTeam: string;
    sport: string;
  };
  token: string;
}

export function ConversationInterface({
  conversationId,
  initialTranscript = [],
  gameInfo,
  token
}: ConversationInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialTranscript);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTranscript = async (text: string) => {
    setError('');

    // Add user message optimistically
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {

      const response = await fetch('/api/pressbox/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId,
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      setError('Failed to get response. Try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {

      const response = await fetch('/api/pressbox/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate article');
      }

      const data = await response.json();
      router.push(`/pressbox/article/${data.article.id}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate article. Try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = messages.length >= 10;

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="mb-4 pb-4 border-b">
        <h1 className="text-2xl font-bold mb-1">
          {gameInfo.homeTeam} vs {gameInfo.awayTeam}
        </h1>
        <p className="text-sm text-muted-foreground capitalize">
          {gameInfo.sport} • {messages.length} turns
        </p>
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg mb-2">Ready to start your interview</p>
            <p className="text-sm">Click the microphone and tell me about the game</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "p-4 rounded-lg max-w-[80%]",
              msg.role === 'user'
                ? "bg-primary/10 ml-auto"
                : "bg-muted mr-auto"
            )}
          >
            <p className="text-xs font-medium mb-1 text-muted-foreground">
              {msg.role === 'user' ? 'You' : 'AI'}
            </p>
            <p className="text-sm">{msg.content}</p>
          </div>
        ))}

        {isLoading && (
          <div className="bg-muted p-4 rounded-lg mr-auto max-w-[80%]">
            <p className="text-sm text-muted-foreground">Thinking...</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="border-t pt-4 space-y-4">
        <VoiceRecorder
          onTranscript={handleTranscript}
          onError={setError}
          disabled={isLoading || isGenerating}
        />

        {canGenerate && (
          <button
            onClick={handleGenerate}
            disabled={isLoading || isGenerating}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? 'Generating Article...' : 'Generate Article'}
          </button>
        )}

        {!canGenerate && messages.length > 0 && (
          <p className="text-sm text-center text-muted-foreground">
            Continue the conversation (need {10 - messages.length} more turns to generate article)
          </p>
        )}
      </div>
    </div>
  );
}
