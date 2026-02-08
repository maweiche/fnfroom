/**
 * Press Box AI - Message Route
 * POST: Send message in conversation, get AI response
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/pressbox-auth';
import { buildInterviewPrompt, getConversationResponse } from '@/lib/pressbox-claude';
import { z } from 'zod';

const MessageSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1, 'Message cannot be empty'),
});

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, message } = MessageSchema.parse(body);

    // Fetch conversation
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: user.id },
      include: { user: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Add user message to transcript
    const transcript = conversation.transcript as Array<{
      role: string;
      content: string;
      timestamp: string;
    }>;

    transcript.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Get AI response
    const systemPrompt = buildInterviewPrompt(
      conversation.sport,
      user.writerStyleNotes,
      transcript.length
    );

    const messages = transcript.map(t => ({
      role: t.role as 'user' | 'assistant',
      content: t.content,
    }));

    const assistantMessage = await getConversationResponse(messages, systemPrompt);

    // Add assistant response to transcript
    transcript.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date().toISOString(),
    });

    // Save transcript (synchronous to prevent race conditions)
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { transcript },
    });

    return NextResponse.json({
      message: assistantMessage,
      turnCount: transcript.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Message error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
