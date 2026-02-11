import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { NextRequest } from 'next/server';

/**
 * GET /api/admin/users
 * List users with filters
 */
export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  const searchParams = request.nextUrl.searchParams;
  const role = searchParams.get('role');
  const verified = searchParams.get('verified');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  const where: any = {
    deletedAt: null,
  };

  if (role) {
    where.role = role;
  }

  if (verified === 'true') {
    where.verifiedAt = { not: null };
  } else if (verified === 'false') {
    where.verifiedAt = null;
  }

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        schoolName: true,
        primarySport: true,
        verifiedAt: true,
        playerId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.user.count({ where }),
  ]);

  return Response.json({
    data: users,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
}

/**
 * POST /api/admin/users
 * Create new user
 */
export async function POST(request: NextRequest) {
  const { user: admin, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  try {
    const body = await request.json();
    const { email, password, name, role, schoolName, primarySport } = body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return Response.json(
        { error: 'Missing required fields: email, password, name, role' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['ADMIN', 'COACH', 'WRITER', 'FAN'];
    if (!validRoles.includes(role)) {
      return Response.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return Response.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Auto-verify ADMIN and WRITER roles
    const verifiedAt = (role === 'ADMIN' || role === 'WRITER') ? new Date() : null;

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role,
        schoolName: role === 'COACH' ? schoolName : null,
        primarySport: role === 'COACH' ? primarySport : null,
        verifiedAt,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        schoolName: true,
        primarySport: true,
        verifiedAt: true,
        createdAt: true,
      },
    });

    // Create audit log
    const { createAuditLog } = await import('@/lib/admin-auth');
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'USER_CREATED',
      targetType: 'USER',
      targetId: newUser.id,
      changes: { role: newUser.role, email: newUser.email },
      notes: `Created ${role} user: ${email}`,
    });

    return Response.json({ data: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return Response.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
}
