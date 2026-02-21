import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/users/[id]/ban
 * Ban a user from the community. Sets bannedAt timestamp.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: admin, error } = await requireAdmin(request);
  if (error) return Response.json({ error: error.message }, { status: error.status });

  const { id: userId } = await params;

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, bannedAt: true },
  });

  if (!target) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  if (target.role === 'ADMIN') {
    return Response.json({ error: 'Cannot ban an admin' }, { status: 400 });
  }

  if (target.bannedAt) {
    return Response.json({ error: 'User is already banned' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { bannedAt: new Date() },
    }),
    prisma.adminAuditLog.create({
      data: {
        adminUserId: admin!.id,
        action: 'USER_BANNED',
        targetType: 'USER',
        targetId: userId,
      },
    }),
  ]);

  return Response.json({ success: true });
}
