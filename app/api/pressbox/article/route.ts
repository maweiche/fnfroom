/**
 * Press Box AI - Article Routes
 * PATCH: Update article draft
 * PUT: Publish article
 * GET: Retrieve article(s)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/pressbox-auth';
import { z } from 'zod';

const UpdateArticleSchema = z.object({
  id: z.string().uuid(),
  headline: z.string().optional(),
  bodyMarkdown: z.string().optional(),
});

const PublishArticleSchema = z.object({
  id: z.string().uuid(),
  published: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, headline, bodyMarkdown } = UpdateArticleSchema.parse(body);

    const article = await prisma.article.findFirst({
      where: { id, userId: user.id },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        headline: headline ?? article.headline,
        bodyMarkdown: bodyMarkdown ?? article.bodyMarkdown,
        editCount: { increment: 1 },
      },
    });

    return NextResponse.json({ article: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Update article error:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, published } = PublishArticleSchema.parse(body);

    const article = await prisma.article.findFirst({
      where: { id, userId: user.id },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        published,
        publishedAt: published ? new Date() : null,
      },
    });

    return NextResponse.json({ article: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Publish article error:', error);
    return NextResponse.json(
      { error: 'Failed to publish article' },
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
      // Get specific article
      const article = await prisma.article.findFirst({
        where: { id, userId: user.id },
        include: {
          conversation: true,
        },
      });

      if (!article) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ article });
    }

    // List user's articles
    const articles = await prisma.article.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        conversation: {
          select: {
            homeTeam: true,
            awayTeam: true,
            sport: true,
            gameDate: true,
          },
        },
      },
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Get articles error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
