import { requireAdmin, createAuditLog } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * PATCH /api/admin/games/[id]
 * Update game scores, status, and other fields
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  const { id } = await params;
  const body = await request.json();

  const game = await prisma.game.findUnique({ where: { id } });
  if (!game) {
    return Response.json({ error: 'Game not found' }, { status: 404 });
  }

  const updateData: Record<string, any> = {};
  const changes: Record<string, { from: any; to: any }> = {};

  if (body.homeScore !== undefined) {
    const val = body.homeScore === null ? null : parseInt(body.homeScore);
    changes.homeScore = { from: game.homeScore, to: val };
    updateData.homeScore = val;
  }

  if (body.awayScore !== undefined) {
    const val = body.awayScore === null ? null : parseInt(body.awayScore);
    changes.awayScore = { from: game.awayScore, to: val };
    updateData.awayScore = val;
  }

  if (body.status !== undefined) {
    changes.status = { from: game.status, to: body.status };
    updateData.status = body.status;
  }

  if (body.gameTime !== undefined) {
    changes.gameTime = { from: game.gameTime, to: body.gameTime || null };
    updateData.gameTime = body.gameTime || null;
  }

  if (Object.keys(updateData).length === 0) {
    return Response.json({ error: 'No fields to update' }, { status: 400 });
  }

  const updated = await prisma.game.update({
    where: { id },
    data: updateData,
    include: {
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true } },
    },
  });

  await createAuditLog({
    adminUserId: user!.id,
    action: 'UPDATE_GAME',
    targetType: 'GAME',
    targetId: id,
    changes,
  });

  return Response.json({
    data: {
      id: updated.id,
      date: updated.date,
      sport: updated.sport,
      homeTeam: updated.homeTeam?.name || 'Unknown',
      awayTeam: updated.awayTeam?.name || 'Unknown',
      homeScore: updated.homeScore,
      awayScore: updated.awayScore,
      status: updated.status,
      source: updated.source,
      gender: updated.gender,
      gameTime: updated.gameTime,
      isConference: updated.isConference,
    },
  });
}
