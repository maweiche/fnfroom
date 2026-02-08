/**
 * Press Box AI - Conversation Routes
 * POST: Create new conversation
 * GET: Retrieve conversation(s)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/pressbox-auth';
import { z } from 'zod';

const CreateConversationSchema = z.object({
  sport: z.enum(['football', 'basketball', 'soccer', 'baseball', 'lacrosse']),
  homeTeam: z.string().min(1, 'Home team is required'),
  awayTeam: z.string().min(1, 'Away team is required'),
  gameDate: z.string().datetime(),
  location: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = CreateConversationSchema.parse(body);

    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        sport: data.sport,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        gameDate: new Date(data.gameDate),
        location: data.location,
        transcript: [],
      },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Create conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      // Get specific conversation
      const conversation = await prisma.conversation.findFirst({
        where: { id, userId: user.id },
      });

      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ conversation });
    }

    // List user's conversations
    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
