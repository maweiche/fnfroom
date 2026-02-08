import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getTokenFromHeader } from '@/lib/auth';
import type { BasketballGame } from '@/lib/basketball-validator';

/**
 * POST /api/submissions/:id/approve
 * Approve a submission and create a Game record
 *
 * Body: { gameData: BasketballGame } (optional, uses submission.rawAiResponse if not provided)
 */
export async function POST(
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

    // Check if submission is in valid state
    if (submission.status !== 'COMPLETED' && submission.status !== 'FAILED') {
      return NextResponse.json(
        { error: 'Submission must be completed or failed to approve' },
        { status: 400 }
      );
    }

    // Get game data (from request body or submission)
    const body = await request.json().catch(() => ({}));
    const gameData: BasketballGame = body.gameData || (submission.rawAiResponse as any);

    if (!gameData) {
      return NextResponse.json(
        { error: 'No game data available to approve' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!gameData.homeTeam || !gameData.awayTeam) {
      return NextResponse.json(
        { error: 'Game data must include homeTeam and awayTeam' },
        { status: 400 }
      );
    }

    // Calculate editable until (48 hours from now)
    const editableUntil = new Date();
    editableUntil.setHours(editableUntil.getHours() + 48);

    // Parse date (handle null)
    const gameDate = gameData.date ? new Date(gameData.date) : new Date();

    // Create Game record
    const game = await prisma.game.create({
      data: {
        submissionId: submission.id,
        date: gameDate,
        sport: submission.sport,
        homeScore: gameData.homeTeam.score,
        awayScore: gameData.awayTeam.score,
        status: 'Final',
        source: 'ScoreSnap',
        quarterScores: gameData.quarterScores as any,
        overtime: gameData.overtime || false,
        gameData: gameData as any,
        editableUntil,
        approvedBy: user.id,
      },
    });

    return NextResponse.json({
      game: {
        id: game.id,
        date: game.date,
        sport: game.sport,
        homeScore: game.homeScore,
        awayScore: game.awayScore,
        status: game.status,
        editableUntil: game.editableUntil,
        createdAt: game.createdAt,
      },
      submission: {
        id: submission.id,
        status: submission.status,
      },
    });
  } catch (error) {
    console.error('Submission approval error:', error);
    return NextResponse.json(
      { error: 'Failed to approve submission' },
      { status: 500 }
    );
  }
}
