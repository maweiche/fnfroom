/**
 * Press Box AI - Generate Article Route
 * POST: Generate article from conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/pressbox-auth';
import { generateArticle } from '@/lib/pressbox-claude';
import { z } from 'zod';

const GenerateSchema = z.object({
  conversationId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestBody = await req.json();
    const { conversationId } = GenerateSchema.parse(requestBody);

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

    // Check if conversation has enough content
    const transcript = conversation.transcript as Array<{
      role: string;
      content: string;
      timestamp: string;
    }>;

    if (transcript.length < 10) {
      return NextResponse.json(
        { error: 'Conversation needs at least 10 turns before generating article' },
        { status: 400 }
      );
    }

    // Mark conversation complete
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { completed: true },
    });

    // Generate article with Claude Opus
    const { headline, body } = await generateArticle(
      transcript,
      conversation.sport,
      conversation.homeTeam,
      conversation.awayTeam,
      user.writerStyleNotes
    );

    // Create article
    const article = await prisma.article.create({
      data: {
        conversationId,
        userId: user.id,
        headline,
        bodyMarkdown: body,
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: 'Failed to generate article' },
      { status: 500 }
    );
  }
}

// Configure for longer execution (article generation takes time)
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max
