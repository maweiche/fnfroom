import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * POST /api/admin/players/claims/[id]/reject
 * Reject player claim request
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
    const { id: claimId } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return Response.json(
        { error: 'Missing required field: reason' },
        { status: 400 }
      );
    }

    // Get claim request
    const claim = await prisma.playerClaimRequest.findUnique({
      where: { id: claimId },
      include: {
        player: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!claim) {
      return Response.json({ error: 'Claim request not found' }, { status: 404 });
    }

    if (claim.status !== 'PENDING') {
      return Response.json(
        { error: `Claim already ${claim.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Update claim request status
    const rejectedClaim = await prisma.playerClaimRequest.update({
      where: { id: claimId },
      data: {
        status: 'REJECTED',
        reviewedBy: admin!.id,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });

    // Create audit log
    const { createAuditLog } = await import('@/lib/admin-auth');
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'PLAYER_CLAIM_REJECTED',
      targetType: 'CLAIM',
      targetId: claimId,
      changes: {
        reason,
      },
      notes: `Rejected player claim for ${claim.player.firstName} ${claim.player.lastName}: ${reason}`,
    });

    return Response.json({
      data: {
        id: rejectedClaim.id,
        status: rejectedClaim.status,
        rejectionReason: rejectedClaim.rejectionReason,
      },
    });
  } catch (error: any) {
    console.error('Error rejecting claim:', error);
    return Response.json(
      { error: 'Failed to reject claim', details: error.message },
      { status: 500 }
    );
  }
}
