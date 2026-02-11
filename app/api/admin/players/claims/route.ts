import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * GET /api/admin/players/claims
 * List pending player claim requests
 */
export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || 'PENDING';
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  const where: any = {};

  if (status) {
    where.status = status;
  }

  const [claims, total] = await Promise.all([
    prisma.playerClaimRequest.findMany({
      where,
      include: {
        player: {
          include: {
            school: { select: { name: true } },
            accountUser: { select: { id: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.playerClaimRequest.count({ where }),
  ]);

  return Response.json({
    data: claims,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
}
