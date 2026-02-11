import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { NextRequest } from 'next/server';

/**
 * POST /api/admin/players/claims/[id]/approve
 * Approve player claim request
 * Creates user account and links to player
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
    const { tempPassword } = body;

    // Get claim request
    const claim = await prisma.playerClaimRequest.findUnique({
      where: { id: claimId },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            accountUser: { select: { id: true } },
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

    if (claim.player.accountUser) {
      return Response.json(
        { error: 'Player already has a linked account' },
        { status: 400 }
      );
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: claim.requestedEmail.toLowerCase() },
    });

    if (existingUser) {
      return Response.json(
        { error: 'Email already in use by another account' },
        { status: 409 }
      );
    }

    // Generate temp password if not provided
    const password = tempPassword || `Player${Math.random().toString(36).slice(2, 10)}!`;
    const passwordHash = await hashPassword(password);

    // Create user account with PLAYER role
    const newUser = await prisma.user.create({
      data: {
        email: claim.requestedEmail.toLowerCase(),
        passwordHash,
        name: `${claim.player.firstName} ${claim.player.lastName}`,
        role: 'PLAYER',
        playerId: claim.playerId,
        verifiedAt: new Date(), // Auto-verify player accounts
      },
    });

    // Update claim request status
    await prisma.playerClaimRequest.update({
      where: { id: claimId },
      data: {
        status: 'APPROVED',
        reviewedBy: admin!.id,
        reviewedAt: new Date(),
      },
    });

    // Create audit log
    const { createAuditLog } = await import('@/lib/admin-auth');
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'PLAYER_CLAIM_APPROVED',
      targetType: 'CLAIM',
      targetId: claimId,
      changes: {
        playerId: claim.playerId,
        userId: newUser.id,
        email: claim.requestedEmail,
      },
      notes: `Approved player claim for ${claim.player.firstName} ${claim.player.lastName}`,
    });

    return Response.json({
      data: {
        claim: { id: claimId, status: 'APPROVED' },
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
        tempPassword: password, // Return temp password for admin to share with player
      },
    });
  } catch (error: any) {
    console.error('Error approving claim:', error);
    return Response.json(
      { error: 'Failed to approve claim', details: error.message },
      { status: 500 }
    );
  }
}
