import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { syncPlayerToSanity } from '@/lib/sanity-player-sync';
import { NextRequest } from 'next/server';

/**
 * POST /api/admin/offers/[id]/verify
 * Verify college offer
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
    const { id: offerId } = await params;

    // Get offer details
    const offer = await prisma.collegeOffer.findUnique({
      where: { id: offerId },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            sanityProfileId: true,
          },
        },
      },
    });

    if (!offer) {
      return Response.json({ error: 'Offer not found' }, { status: 404 });
    }

    if (offer.verified) {
      return Response.json(
        { error: 'Offer is already verified' },
        { status: 400 }
      );
    }

    // Verify the offer
    const verifiedOffer = await prisma.collegeOffer.update({
      where: { id: offerId },
      data: {
        verified: true,
        verifiedBy: admin!.id,
        verifiedAt: new Date(),
      },
      include: {
        player: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Sync to Sanity if player has linked profile
    if (offer.player.sanityProfileId) {
      try {
        await syncPlayerToSanity(offer.playerId);
      } catch (err) {
        console.error('Failed to sync to Sanity:', err);
        // Don't fail the request if Sanity sync fails
      }
    }

    // Create audit log
    const { createAuditLog } = await import('@/lib/admin-auth');
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'OFFER_VERIFIED',
      targetType: 'OFFER',
      targetId: offerId,
      changes: {
        college: verifiedOffer.collegeName,
        division: verifiedOffer.collegeDivision,
        type: verifiedOffer.offerType,
      },
      notes: `Verified ${verifiedOffer.offerType} from ${verifiedOffer.collegeName} for ${verifiedOffer.player.firstName} ${verifiedOffer.player.lastName}`,
    });

    return Response.json({ data: verifiedOffer });
  } catch (error: any) {
    console.error('Error verifying offer:', error);
    return Response.json(
      { error: 'Failed to verify offer', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/offers/[id]/verify
 * Reject/Delete college offer
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
    const { id: offerId } = await params;

    const offer = await prisma.collegeOffer.findUnique({
      where: { id: offerId },
      include: {
        player: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!offer) {
      return Response.json({ error: 'Offer not found' }, { status: 404 });
    }

    await prisma.collegeOffer.delete({
      where: { id: offerId },
    });

    // Create audit log
    const { createAuditLog } = await import('@/lib/admin-auth');
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'OFFER_REJECTED',
      targetType: 'OFFER',
      targetId: offerId,
      notes: `Rejected offer from ${offer.collegeName} for ${offer.player.firstName} ${offer.player.lastName}`,
    });

    return Response.json({ data: { id: offerId, deleted: true } });
  } catch (error: any) {
    console.error('Error deleting offer:', error);
    return Response.json(
      { error: 'Failed to delete offer', details: error.message },
      { status: 500 }
    );
  }
}
