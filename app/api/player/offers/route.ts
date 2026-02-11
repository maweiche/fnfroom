import { getUserFromToken, getTokenFromHeader, isPlayer } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * GET /api/player/offers
 * Get player's college offers
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = getTokenFromHeader(authHeader);

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserFromToken(token);

  if (!user || !isPlayer(user)) {
    return Response.json(
      { error: 'Forbidden - Player access required' },
      { status: 403 }
    );
  }

  try {
    const offers = await prisma.collegeOffer.findMany({
      where: { playerId: user.playerId! },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ data: offers });
  } catch (error: any) {
    console.error('Error fetching offers:', error);
    return Response.json(
      { error: 'Failed to fetch offers', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/player/offers
 * Player adds a college offer (unverified)
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = getTokenFromHeader(authHeader);

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserFromToken(token);

  if (!user || !isPlayer(user)) {
    return Response.json(
      { error: 'Forbidden - Player access required' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { collegeName, collegeDivision, offerType, offerDate, sport } = body;

    // Validate required fields
    if (!collegeName || !collegeDivision || !offerType || !sport) {
      return Response.json(
        {
          error: 'Missing required fields: collegeName, collegeDivision, offerType, sport',
        },
        { status: 400 }
      );
    }

    // Validate offer type
    const validOfferTypes = ['OFFER', 'INTEREST', 'VERBAL_COMMIT', 'SIGNED'];
    if (!validOfferTypes.includes(offerType)) {
      return Response.json(
        {
          error: `Invalid offerType. Must be one of: ${validOfferTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate division
    const validDivisions = ['D1', 'D2', 'D3', 'NAIA', 'JUCO'];
    if (!validDivisions.includes(collegeDivision)) {
      return Response.json(
        {
          error: `Invalid collegeDivision. Must be one of: ${validDivisions.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Create offer (unverified by default)
    const offer = await prisma.collegeOffer.create({
      data: {
        playerId: user.playerId!,
        collegeName,
        collegeDivision,
        offerType,
        offerDate: offerDate ? new Date(offerDate) : null,
        sport,
        verified: false, // Always starts unverified
      },
    });

    return Response.json(
      {
        data: offer,
        message: 'Offer submitted. It will appear on your profile once verified by an administrator.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating offer:', error);
    return Response.json(
      { error: 'Failed to create offer', details: error.message },
      { status: 500 }
    );
  }
}
