import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/users/[id]/unban
 * Unban a user. Clears bannedAt timestamp.
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
    select: { id: true, bannedAt: true },
  });

  if (!target) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  if (!target.bannedAt) {
    return Response.json({ error: 'User is not banned' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { bannedAt: null },
    }),
    prisma.adminAuditLog.create({
      data: {
        adminUserId: admin!.id,
        action: 'USER_UNBANNED',
        targetType: 'USER',
        targetId: userId,
      },
    }),
  ]);

  return Response.json({ success: true });
}
