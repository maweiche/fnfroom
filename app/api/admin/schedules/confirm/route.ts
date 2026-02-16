import { requireAdmin, createAuditLog } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { findOrCreateSchool } from '@/lib/school-utils';
import { type ExtractedSchedule } from '@/lib/schedule-extractor';
import { NextRequest } from 'next/server';

/**
 * POST /api/admin/schedules/confirm
 * Accept the (possibly admin-edited) extracted schedule and create Game records.
 */
export async function POST(request: NextRequest) {
  const { user: admin, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  try {
    const schedule: ExtractedSchedule = await request.json();

    if (!schedule.teamName || !schedule.games?.length) {
      return Response.json(
        { error: 'Invalid schedule: team name and games are required' },
        { status: 400 }
      );
    }

    // Resolve host school
    const hostSchool = await findOrCreateSchool(
      schedule.teamName,
      schedule.city,
      {
        classification: schedule.classification || undefined,
        conference: schedule.conference || undefined,
      }
    );

    const schoolsCreated: string[] = [];
    if (hostSchool.created) {
      schoolsCreated.push(hostSchool.name);
    }

    // Resolve all opponent schools (deduplicate by name)
    const opponentMap = new Map<string, { id: string; name: string }>();
    for (const game of schedule.games) {
      if (!opponentMap.has(game.opponent)) {
        const opponent = await findOrCreateSchool(
          game.opponent,
          game.opponentCity
        );
        opponentMap.set(game.opponent, { id: opponent.id, name: opponent.name });
        if (opponent.created) {
          schoolsCreated.push(opponent.name);
        }
      }
    }

    // Create games — no transaction needed, duplicates are skipped on re-upload
    let gamesCreated = 0;
    let gamesSkipped = 0;
    const skippedReasons: string[] = [];

    for (const game of schedule.games) {
      const opponent = opponentMap.get(game.opponent)!;

      const homeTeamId = game.isHome ? hostSchool.id : opponent.id;
      const awayTeamId = game.isHome ? opponent.id : hostSchool.id;

      // Append T12:00:00Z to avoid timezone-shifting the date
      const gameDate = new Date(`${game.date}T12:00:00Z`);

      const existing = await prisma.game.findFirst({
        where: {
          date: gameDate,
          sport: schedule.sport,
          homeTeamId,
          awayTeamId,
          deletedAt: null,
        },
      });

      if (existing) {
        gamesSkipped++;
        skippedReasons.push(
          `${game.date}: ${game.opponent} (already exists)`
        );
        continue;
      }

      await prisma.game.create({
        data: {
          date: gameDate,
          sport: schedule.sport,
          gender: schedule.gender || null,
          homeTeamId,
          awayTeamId,
          gameTime: game.time || null,
          isConference: game.isConference,
          status: 'Scheduled',
          source: 'ScheduleUpload',
        },
      });

      gamesCreated++;
    }

    // Audit log
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'SCHEDULE_UPLOADED',
      targetType: 'SCHEDULE',
      targetId: hostSchool.id,
      changes: {
        teamName: schedule.teamName,
        sport: schedule.sport,
        gamesCreated,
        gamesSkipped,
        schoolsCreated,
      },
      notes: `Uploaded ${schedule.sport} schedule for ${schedule.teamName}: ${gamesCreated} games created, ${gamesSkipped} skipped`,
    });

    return Response.json({
      data: {
        gamesCreated,
        gamesSkipped,
        schoolsCreated,
        skippedReasons,
        hostSchool: { id: hostSchool.id, name: hostSchool.name },
      },
    });
  } catch (err: any) {
    console.error('Schedule confirm error:', err);
    return Response.json(
      { error: 'Failed to save schedule', details: err.message },
      { status: 500 }
    );
  }
}
