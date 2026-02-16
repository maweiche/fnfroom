import { requireAdmin, createAuditLog } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { findOrCreateSchool } from '@/lib/school-utils';
import { type ExtractedRoster } from '@/lib/roster-extractor';
import { NextRequest } from 'next/server';

/**
 * POST /api/admin/rosters/confirm
 * Accept the (possibly admin-edited) extracted roster and create Player + Roster records.
 */
export async function POST(request: NextRequest) {
  const { user: admin, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  try {
    const roster: ExtractedRoster = await request.json();

    if (!roster.schoolName || !roster.players?.length) {
      return Response.json(
        { error: 'Invalid roster: school name and players are required' },
        { status: 400 }
      );
    }

    // Resolve school
    const school = await findOrCreateSchool(roster.schoolName);

    // Filter out dropped seniors
    const activePlayers = roster.players.filter((p) => !p.dropped);
    const droppedSeniors = roster.players.filter((p) => p.dropped).length;

    let playersCreated = 0;
    let playersUpdated = 0;
    let rosterEntriesCreated = 0;

    for (const player of activePlayers) {
      // Match existing player by firstName + lastName + schoolId (case-insensitive)
      const existing = await prisma.player.findFirst({
        where: {
          firstName: { equals: player.firstName.trim(), mode: 'insensitive' },
          lastName: { equals: player.lastName.trim(), mode: 'insensitive' },
          schoolId: school.id,
        },
        select: {
          id: true,
          heightFeet: true,
          heightInches: true,
          weight: true,
          position: true,
          jerseyNumber: true,
        },
      });

      let playerId: string;

      if (existing) {
        // Backfill null fields only — never overwrite existing data
        const updates: Record<string, any> = {};
        if (existing.heightFeet == null && player.heightFeet != null) {
          updates.heightFeet = player.heightFeet;
        }
        if (existing.heightInches == null && player.heightInches != null) {
          updates.heightInches = player.heightInches;
        }
        if (existing.weight == null && player.weight != null) {
          updates.weight = player.weight;
        }
        if (existing.position == null && player.position != null) {
          updates.position = player.position;
        }
        if (existing.jerseyNumber == null && player.jerseyNumber != null) {
          updates.jerseyNumber = player.jerseyNumber;
        }

        if (Object.keys(updates).length > 0) {
          await prisma.player.update({
            where: { id: existing.id },
            data: updates,
          });
          playersUpdated++;
        }

        playerId = existing.id;
      } else {
        // Create new player
        const newPlayer = await prisma.player.create({
          data: {
            firstName: player.firstName.trim(),
            lastName: player.lastName.trim(),
            schoolId: school.id,
            state: 'NC',
            position: player.position || null,
            heightFeet: player.heightFeet ?? null,
            heightInches: player.heightInches ?? null,
            weight: player.weight ?? null,
            jerseyNumber: player.jerseyNumber || null,
          },
        });
        playerId = newPlayer.id;
        playersCreated++;
      }

      // Upsert roster entry on unique constraint [schoolId, playerId, sport, season]
      await prisma.roster.upsert({
        where: {
          schoolId_playerId_sport_season: {
            schoolId: school.id,
            playerId,
            sport: roster.sport,
            season: roster.targetSeason,
          },
        },
        update: {
          jerseyNumber: player.jerseyNumber || null,
          position: player.position || null,
          grade: player.progressedGrade || null,
          status: 'ACTIVE',
        },
        create: {
          schoolId: school.id,
          playerId,
          sport: roster.sport,
          season: roster.targetSeason,
          jerseyNumber: player.jerseyNumber || null,
          position: player.position || null,
          grade: player.progressedGrade || null,
          status: 'ACTIVE',
        },
      });
      rosterEntriesCreated++;
    }

    // Audit log
    await createAuditLog({
      adminUserId: admin!.id,
      action: 'ROSTER_UPLOADED',
      targetType: 'ROSTER',
      targetId: school.id,
      changes: {
        schoolName: roster.schoolName,
        sport: roster.sport,
        season: roster.targetSeason,
        playersCreated,
        playersUpdated,
        rosterEntriesCreated,
        droppedSeniors,
      },
      notes: `Uploaded ${roster.sport} roster for ${roster.schoolName}: ${playersCreated} new, ${playersUpdated} updated, ${droppedSeniors} seniors dropped`,
    });

    return Response.json({
      data: {
        playersCreated,
        playersUpdated,
        rosterEntriesCreated,
        droppedSeniors,
        schoolCreated: school.created,
        school: { id: school.id, name: school.name },
      },
    });
  } catch (err: any) {
    console.error('Roster confirm error:', err);
    return Response.json(
      { error: 'Failed to save roster', details: err.message },
      { status: 500 }
    );
  }
}
