import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * PATCH /api/admin/rosters/[id]
 * Update roster entry
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
    const { id: rosterId } = await params;
    const body = await request.json();
    const { jerseyNumber, position, grade, status } = body;

    const updateData: any = {};

    if (jerseyNumber !== undefined) updateData.jerseyNumber = jerseyNumber;
    if (position !== undefined) updateData.position = position;
    if (grade !== undefined) updateData.grade = grade;
    if (status !== undefined) updateData.status = status;

    const updatedRoster = await prisma.roster.update({
      where: { id: rosterId },
      data: updateData,
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
      action: 'ROSTER_ENTRY_UPDATED',
      targetType: 'ROSTER',
      targetId: rosterId,
      changes: body,
      notes: `Updated roster entry for ${updatedRoster.player.firstName} ${updatedRoster.player.lastName}`,
    });

    return Response.json({ data: updatedRoster });
  } catch (error: any) {
    console.error('Error updating roster:', error);
    return Response.json(
      { error: 'Failed to update roster entry', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/rosters/[id]
 * Remove from roster
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
    const { id: rosterId } = await params;

    const roster = await prisma.roster.findUnique({
      where: { id: rosterId },
      include: {
        player: { select: { firstName: true, lastName: true } },
        school: { select: { name: true } },
      },
    });

    if (!roster) {
      return Response.json({ error: 'Roster entry not found' }, { status: 404 });
    }

    await prisma.roster.delete({
      where: { id: rosterId },
    });

    // Create audit log
    const { createAuditLog } = await import('@/lib/admin-auth');
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'ROSTER_ENTRY_DELETED',
      targetType: 'ROSTER',
      targetId: rosterId,
      notes: `Removed ${roster.player.firstName} ${roster.player.lastName} from ${roster.school.name} roster`,
    });

    return Response.json({ data: { id: rosterId, deleted: true } });
  } catch (error: any) {
    console.error('Error deleting roster entry:', error);
    return Response.json(
      { error: 'Failed to delete roster entry', details: error.message },
      { status: 500 }
    );
  }
}
