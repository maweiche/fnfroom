import { requireAdmin } from '@/lib/admin-auth';
import { linkSanityProfile } from '@/lib/sanity-player-sync';
import { NextRequest } from 'next/server';

/**
 * POST /api/admin/players/[id]/link-sanity
 * Link player to existing Sanity profile
 */
export async function POST(
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
    const { sanityProfileId } = body;

    if (!sanityProfileId) {
      return Response.json(
        { error: 'Missing required field: sanityProfileId' },
        { status: 400 }
      );
    }

    const player = await linkSanityProfile(playerId, sanityProfileId);

    // Create audit log
    const { createAuditLog } = await import('@/lib/admin-auth');
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'PLAYER_SANITY_LINKED',
      targetType: 'PLAYER',
      targetId: playerId,
      changes: { sanityProfileId },
      notes: `Linked player to Sanity profile: ${sanityProfileId}`,
    });

    return Response.json({
      data: {
        playerId: player.id,
        sanityProfileId: player.sanityProfileId,
        linked: true,
      },
    });
  } catch (error: any) {
    console.error('Error linking Sanity profile:', error);
    return Response.json(
      { error: 'Failed to link Sanity profile', details: error.message },
      { status: 500 }
    );
  }
}
