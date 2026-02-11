import { getUserFromToken, getTokenFromHeader, isPlayer } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncPlayerToSanity } from '@/lib/sanity-player-sync';
import { NextRequest } from 'next/server';

/**
 * GET /api/player/profile
 * Get authenticated player's profile data
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
    const player = await prisma.player.findUnique({
      where: { id: user.playerId! },
      include: {
        school: true,
        stats: {
          orderBy: [{ season: 'desc' }, { statType: 'asc' }],
        },
        offers: {
          orderBy: { createdAt: 'desc' },
        },
        rosters: {
          include: {
            school: { select: { name: true } },
          },
          orderBy: [{ season: 'desc' }, { sport: 'asc' }],
        },
      },
    });

    if (!player) {
      return Response.json({ error: 'Player profile not found' }, { status: 404 });
    }

    return Response.json({ data: player });
  } catch (error: any) {
    console.error('Error fetching player profile:', error);
    return Response.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/player/profile
 * Update player's editable fields
 */
export async function PATCH(request: NextRequest) {
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
    const {
      bio,
      heightFeet,
      heightInches,
      weight,
      jerseyNumber,
      socialTwitter,
      socialInstagram,
      socialHudl,
    } = body;

    // Only allow updating player-editable fields
    const updateData: any = {};

    if (bio !== undefined) updateData.bio = bio;
    if (heightFeet !== undefined) updateData.heightFeet = heightFeet;
    if (heightInches !== undefined) updateData.heightInches = heightInches;
    if (weight !== undefined) updateData.weight = weight;
    if (jerseyNumber !== undefined) updateData.jerseyNumber = jerseyNumber;
    if (socialTwitter !== undefined) updateData.socialTwitter = socialTwitter;
    if (socialInstagram !== undefined) updateData.socialInstagram = socialInstagram;
    if (socialHudl !== undefined) updateData.socialHudl = socialHudl;

    const updatedPlayer = await prisma.player.update({
      where: { id: user.playerId! },
      data: updateData,
      include: {
        school: { select: { name: true } },
      },
    });

    // Sync to Sanity if linked
    if (updatedPlayer.sanityProfileId) {
      try {
        await syncPlayerToSanity(user.playerId!);
      } catch (err) {
        console.error('Failed to sync to Sanity:', err);
        // Don't fail the request if Sanity sync fails
      }
    }

    return Response.json({ data: updatedPlayer });
  } catch (error: any) {
    console.error('Error updating player profile:', error);
    return Response.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    );
  }
}
