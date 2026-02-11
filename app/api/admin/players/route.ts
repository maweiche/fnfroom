import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * GET /api/admin/players
 * List/search players with filters
 */
export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search');
  const sport = searchParams.get('sport');
  const schoolId = searchParams.get('schoolId');
  const hasSanityProfile = searchParams.get('hasSanityProfile');
  const hasAccount = searchParams.get('hasAccount');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  const where: any = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (schoolId) {
    where.schoolId = schoolId;
  }

  if (hasSanityProfile === 'true') {
    where.sanityProfileId = { not: null };
  } else if (hasSanityProfile === 'false') {
    where.sanityProfileId = null;
  }

  if (hasAccount === 'true') {
    where.accountUser = { isNot: null };
  } else if (hasAccount === 'false') {
    where.accountUser = null;
  }

  const [players, total] = await Promise.all([
    prisma.player.findMany({
      where,
      include: {
        school: { select: { name: true, city: true } },
        accountUser: { select: { id: true, email: true } },
        stats: {
          select: { sport: true, season: true },
          distinct: ['sport', 'season'],
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: limit,
      skip: offset,
    }),
    prisma.player.count({ where }),
  ]);

  return Response.json({
    data: players,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
}

/**
 * POST /api/admin/players
 * Create new player manually
 */
export async function POST(request: NextRequest) {
  const { user: admin, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      schoolId,
      position,
      city,
      state,
      maxprepsProfileUrl,
      collegeName,
      collegeDivision,
      collegeClassYear,
      bio,
      heightFeet,
      heightInches,
      weight,
      jerseyNumber,
      socialTwitter,
      socialInstagram,
      socialHudl,
    } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return Response.json(
        { error: 'Missing required fields: firstName, lastName' },
        { status: 400 }
      );
    }

    // Create player
    const newPlayer = await prisma.player.create({
      data: {
        firstName,
        lastName,
        schoolId: schoolId || null,
        position: position || null,
        city: city || null,
        state: state || 'NC',
        maxprepsProfileUrl: maxprepsProfileUrl || null,
        collegeName: collegeName || null,
        collegeDivision: collegeDivision || null,
        collegeClassYear: collegeClassYear || null,
        bio: bio || null,
        heightFeet: heightFeet || null,
        heightInches: heightInches || null,
        weight: weight || null,
        jerseyNumber: jerseyNumber || null,
        socialTwitter: socialTwitter || null,
        socialInstagram: socialInstagram || null,
        socialHudl: socialHudl || null,
      },
      include: {
        school: { select: { name: true } },
      },
    });

    // Create audit log
    const { createAuditLog } = await import('@/lib/admin-auth');
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'PLAYER_CREATED',
      targetType: 'PLAYER',
      targetId: newPlayer.id,
      notes: `Created player: ${firstName} ${lastName}`,
    });

    return Response.json({ data: newPlayer }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating player:', error);
    return Response.json(
      { error: 'Failed to create player', details: error.message },
      { status: 500 }
    );
  }
}
