import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * POST /api/players/claim
 * Public endpoint for players to submit claim requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, requestedEmail, requestedBy, verificationInfo } = body;

    // Validate required fields
    if (!playerId || !requestedEmail || !requestedBy || !verificationInfo) {
      return Response.json(
        {
          error: 'Missing required fields: playerId, requestedEmail, requestedBy, verificationInfo',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestedEmail)) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if player exists
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        accountUser: { select: { id: true, email: true } },
        claimRequest: { select: { id: true, status: true } },
      },
    });

    if (!player) {
      return Response.json({ error: 'Player not found' }, { status: 404 });
    }

    // Check if player already has an account
    if (player.accountUser) {
      return Response.json(
        { error: 'This player profile is already claimed' },
        { status: 409 }
      );
    }

    // Check if there's already a pending claim request
    if (player.claimRequest && player.claimRequest.status === 'PENDING') {
      return Response.json(
        {
          error: 'A claim request for this player is already pending review',
          claimId: player.claimRequest.id,
        },
        { status: 409 }
      );
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: requestedEmail.toLowerCase() },
    });

    if (existingUser) {
      return Response.json(
        { error: 'This email is already registered' },
        { status: 409 }
      );
    }

    // Create claim request
    const claimRequest = await prisma.playerClaimRequest.create({
      data: {
        playerId,
        requestedEmail: requestedEmail.toLowerCase(),
        requestedBy,
        verificationInfo,
        status: 'PENDING',
      },
      include: {
        player: {
          select: {
            firstName: true,
            lastName: true,
            school: { select: { name: true } },
          },
        },
      },
    });

    return Response.json(
      {
        data: {
          claimId: claimRequest.id,
          status: claimRequest.status,
          message: 'Claim request submitted successfully. An administrator will review it soon.',
          player: {
            name: `${claimRequest.player.firstName} ${claimRequest.player.lastName}`,
            school: claimRequest.player.school?.name,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating claim request:', error);
    return Response.json(
      { error: 'Failed to submit claim request', details: error.message },
      { status: 500 }
    );
  }
}
