import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * GET /api/admin/rosters
 * Query rosters with filters
 */
export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  const searchParams = request.nextUrl.searchParams;
  const schoolId = searchParams.get('schoolId');
  const sport = searchParams.get('sport');
  const season = searchParams.get('season');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

  const where: any = {};

  if (schoolId) where.schoolId = schoolId;
  if (sport) where.sport = sport;
  if (season) where.season = season;

  const [rosters, total] = await Promise.all([
    prisma.roster.findMany({
      where,
      include: {
        school: { select: { name: true, city: true } },
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
          },
        },
      },
      orderBy: [{ season: 'desc' }, { sport: 'asc' }],
      take: limit,
      skip: offset,
    }),
    prisma.roster.count({ where }),
  ]);

  return Response.json({
    data: rosters,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
}

/**
 * POST /api/admin/rosters
 * Create roster entry
 */
export async function POST(request: NextRequest) {
  const { user: admin, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  try {
    const body = await request.json();
    const {
      schoolId,
      playerId,
      sport,
      season,
      jerseyNumber,
      position,
      grade,
      status,
    } = body;

    // Validate required fields
    if (!schoolId || !playerId || !sport || !season) {
      return Response.json(
        { error: 'Missing required fields: schoolId, playerId, sport, season' },
        { status: 400 }
      );
    }

    // Check for existing roster entry
    const existing = await prisma.roster.findUnique({
      where: {
        schoolId_playerId_sport_season: {
          schoolId,
          playerId,
          sport,
          season,
        },
      },
    });

    if (existing) {
      return Response.json(
        { error: 'Player already on this roster' },
        { status: 409 }
      );
    }

    // Create roster entry
    const roster = await prisma.roster.create({
      data: {
        schoolId,
        playerId,
        sport,
        season,
        jerseyNumber: jerseyNumber || null,
        position: position || null,
        grade: grade || null,
        status: status || 'ACTIVE',
        managedBy: admin!.id,
      },
      include: {
        school: { select: { name: true } },
        player: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log
    const { createAuditLog } = await import('@/lib/admin-auth');
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'ROSTER_ENTRY_CREATED',
      targetType: 'ROSTER',
      targetId: roster.id,
      notes: `Added ${roster.player.firstName} ${roster.player.lastName} to ${roster.school.name} ${sport} roster`,
    });

    return Response.json({ data: roster }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating roster entry:', error);
    return Response.json(
      { error: 'Failed to create roster entry', details: error.message },
      { status: 500 }
    );
  }
}
