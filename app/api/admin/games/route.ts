import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * GET /api/admin/games
 * List games with school names resolved
 */
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  const searchParams = request.nextUrl.searchParams;
  const sport = searchParams.get('sport');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

  const where: any = {
    deletedAt: null,
  };

  if (sport) {
    where.sport = { equals: sport, mode: 'insensitive' };
  }

  if (status) {
    where.status = { equals: status, mode: 'insensitive' };
  }

  if (search) {
    where.OR = [
      { homeTeam: { name: { contains: search, mode: 'insensitive' } } },
      { awayTeam: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where,
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.game.count({ where }),
  ]);

  const data = games.map((g) => ({
    id: g.id,
    date: g.date,
    sport: g.sport,
    homeTeam: g.homeTeam?.name || 'Unknown',
    awayTeam: g.awayTeam?.name || 'Unknown',
    homeScore: g.homeScore,
    awayScore: g.awayScore,
    status: g.status,
    source: g.source,
    gender: g.gender,
    gameTime: g.gameTime,
    isConference: g.isConference,
  }));

  return Response.json({
    data,
    pagination: { total, limit, offset, hasMore: offset + limit < total },
  });
}
