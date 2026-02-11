import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * GET /api/admin/players/[id]
 * Get player details with stats, offers, roster history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  const { id: playerId } = await params;

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      school: true,
      accountUser: {
        select: {
          id: true,
          email: true,
          name: true,
          verifiedAt: true,
        },
      },
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
      claimRequest: true,
    },
  });

  if (!player) {
    return Response.json({ error: 'Player not found' }, { status: 404 });
  }

  return Response.json({ data: player });
}

/**
 * PATCH /api/admin/players/[id]
 * Update player fields
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: admin, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  try {
    const { id: playerId } = await params;
    const body = await request.json();

    const {
      firstName,
      lastName,
      schoolId,
      position,
      city,
      state,
      maxprepsProfileUrl,
      collegeName,
      collegeDivision,
      collegeClassYear,
      bio,
      heightFeet,
      heightInches,
      weight,
      jerseyNumber,
      socialTwitter,
      socialInstagram,
      socialHudl,
    } = body;

    const updateData: any = {};

    // Only update fields that are provided
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (schoolId !== undefined) updateData.schoolId = schoolId;
    if (position !== undefined) updateData.position = position;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (maxprepsProfileUrl !== undefined) updateData.maxprepsProfileUrl = maxprepsProfileUrl;
    if (collegeName !== undefined) updateData.collegeName = collegeName;
    if (collegeDivision !== undefined) updateData.collegeDivision = collegeDivision;
    if (collegeClassYear !== undefined) updateData.collegeClassYear = collegeClassYear;
    if (bio !== undefined) updateData.bio = bio;
    if (heightFeet !== undefined) updateData.heightFeet = heightFeet;
    if (heightInches !== undefined) updateData.heightInches = heightInches;
    if (weight !== undefined) updateData.weight = weight;
    if (jerseyNumber !== undefined) updateData.jerseyNumber = jerseyNumber;
    if (socialTwitter !== undefined) updateData.socialTwitter = socialTwitter;
    if (socialInstagram !== undefined) updateData.socialInstagram = socialInstagram;
    if (socialHudl !== undefined) updateData.socialHudl = socialHudl;

    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: updateData,
      include: {
        school: { select: { name: true } },
      },
    });

    // Sync to Sanity if linked
    if (updatedPlayer.sanityProfileId) {
      try {
        const { syncPlayerToSanity } = await import('@/lib/sanity-player-sync');
        await syncPlayerToSanity(playerId);
      } catch (err) {
        console.error('Failed to sync to Sanity:', err);
        // Don't fail the request if Sanity sync fails
      }
    }

    // Create audit log
    const { createAuditLog } = await import('@/lib/admin-auth');
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'PLAYER_UPDATED',
      targetType: 'PLAYER',
      targetId: playerId,
      changes: body,
      notes: `Updated player: ${updatedPlayer.firstName} ${updatedPlayer.lastName}`,
    });

    return Response.json({ data: updatedPlayer });
  } catch (error: any) {
    console.error('Error updating player:', error);
    return Response.json(
      { error: 'Failed to update player', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/players/[id]
 * Delete player (hard delete - use carefully)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: admin, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  try {
    const { id: playerId } = await params;

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: { firstName: true, lastName: true },
    });

    if (!player) {
      return Response.json({ error: 'Player not found' }, { status: 404 });
    }

    // Delete player (will cascade to stats, offers, rosters)
    await prisma.player.delete({
      where: { id: playerId },
    });

    // Create audit log
    const { createAuditLog } = await import('@/lib/admin-auth');
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'PLAYER_DELETED',
      targetType: 'PLAYER',
      targetId: playerId,
      notes: `Deleted player: ${player.firstName} ${player.lastName}`,
    });

    return Response.json({ data: { id: playerId, deleted: true } });
  } catch (error: any) {
    console.error('Error deleting player:', error);
    return Response.json(
      { error: 'Failed to delete player', details: error.message },
      { status: 500 }
    );
  }
}
