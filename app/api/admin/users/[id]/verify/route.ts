import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * POST /api/admin/users/[id]/verify
 * Verify a coach account
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
    const { id: userId } = await params;

    // Get user to verify they're a coach
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, verifiedAt: true },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'COACH') {
      return Response.json(
        { error: 'Only coach accounts need verification' },
        { status: 400 }
      );
    }

    if (user.verifiedAt) {
      return Response.json(
        { error: 'User is already verified' },
        { status: 400 }
      );
    }

    // Verify the coach
    const verifiedUser = await prisma.user.update({
      where: { id: userId },
      data: { verifiedAt: new Date() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        verifiedAt: true,
      },
    });

    // Create audit log
    const { createAuditLog } = await import('@/lib/admin-auth');
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'COACH_VERIFIED',
      targetType: 'USER',
      targetId: userId,
      notes: `Verified coach: ${verifiedUser.email}`,
    });

    return Response.json({ data: verifiedUser });
  } catch (error: any) {
    console.error('Error verifying user:', error);
    return Response.json(
      { error: 'Failed to verify user', details: error.message },
      { status: 500 }
    );
  }
}
