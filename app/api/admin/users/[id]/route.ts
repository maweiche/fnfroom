import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { NextRequest } from 'next/server';

/**
 * GET /api/admin/users/[id]
 * Get user details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  const { id: userId } = await params;

  const userDetails = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      schoolName: true,
      primarySport: true,
      verifiedAt: true,
      playerId: true,
      writerStyleNotes: true,
      createdAt: true,
      updatedAt: true,
      player: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          school: { select: { name: true } },
        },
      },
    },
  });

  if (!userDetails) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return Response.json({ data: userDetails });
}

/**
 * PATCH /api/admin/users/[id]
 * Update user
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: admin, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { email, name, role, schoolName, primarySport, password, verified } = body;

    const updateData: any = {};

    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          id: { not: userId },
        },
      });

      if (existingUser) {
        return Response.json(
          { error: 'Email already taken by another user' },
          { status: 409 }
        );
      }

      updateData.email = email.toLowerCase();
    }

    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (schoolName !== undefined) updateData.schoolName = schoolName;
    if (primarySport !== undefined) updateData.primarySport = primarySport;

    // Update password if provided
    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    // Handle verification status
    if (verified !== undefined) {
      updateData.verifiedAt = verified ? new Date() : null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        schoolName: true,
        primarySport: true,
        verifiedAt: true,
        updatedAt: true,
      },
    });

    // Create audit log
    const { createAuditLog } = await import('@/lib/admin-auth');
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'USER_UPDATED',
      targetType: 'USER',
      targetId: userId,
      changes: body,
      notes: `Updated user: ${updatedUser.email}`,
    });

    return Response.json({ data: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return Response.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Soft delete user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: admin, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  try {
    const { id: userId } = await params;

    // Prevent self-deletion
    if (userId === admin!.id) {
      return Response.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Create audit log
    const { createAuditLog } = await import('@/lib/admin-auth');
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'USER_DELETED',
      targetType: 'USER',
      targetId: userId,
      notes: `Deleted user: ${deletedUser.email} (${deletedUser.role})`,
    });

    return Response.json({ data: deletedUser });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return Response.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
}
