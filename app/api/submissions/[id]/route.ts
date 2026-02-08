import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getTokenFromHeader } from '@/lib/auth';

/**
 * GET /api/submissions/:id
 * Get submission details with extraction results and validation errors
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15+, params is a Promise
    const { id } = await params;

    // Authenticate user
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get submission with validation errors
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            schoolName: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check authorization (user can only access their own submissions, or admins can access all)
    if (submission.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get validation errors
    const validationErrors = await prisma.validationError.findMany({
      where: { submissionId: id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      submission: {
        id: submission.id,
        sport: submission.sport,
        status: submission.status,
        imageUrl: submission.imageUrl,
        imageAssetId: submission.imageAssetId,
        rawAiResponse: submission.rawAiResponse,
        processingTimeMs: submission.processingTimeMs,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        user: submission.user,
      },
      validationErrors: validationErrors.map((error) => ({
        id: error.id,
        errorCode: error.errorCode,
        errorMessage: error.errorMessage,
        fieldPath: error.fieldPath,
        overridden: error.overridden,
        overrideReason: error.overrideReason,
      })),
    });
  } catch (error) {
    console.error('Submission fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/submissions/:id
 * Update extracted game data (manual corrections)
 *
 * Body: { gameData: BasketballGame }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15+, params is a Promise
    const { id } = await params;

    // Authenticate user
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get submission
    const submission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (submission.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const { gameData } = await request.json();

    if (!gameData) {
      return NextResponse.json(
        { error: 'gameData is required' },
        { status: 400 }
      );
    }

    // Update submission
    const updated = await prisma.submission.update({
      where: { id },
      data: {
        rawAiResponse: gameData as any,
      },
    });

    return NextResponse.json({
      submission: {
        id: updated.id,
        rawAiResponse: updated.rawAiResponse,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error('Submission update error:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/submissions/:id
 * Delete a submission
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15+, params is a Promise
    const { id } = await params;

    // Authenticate user
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get submission
    const submission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (submission.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete submission (cascade will delete validation errors)
    await prisma.submission.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submission deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
