import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  try {
    // Get counts for all major entities
    const [
      totalUsers,
      totalAdmins,
      totalCoaches,
      totalWriters,
      totalPlayers,
      totalFans,
      verifiedCoaches,
      pendingClaims,
      unverifiedOffers,
      totalPlayersDB,
      totalGames,
      totalSchools,
      recentActivity,
    ] = await Promise.all([
      // User counts
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { role: 'ADMIN', deletedAt: null } }),
      prisma.user.count({ where: { role: 'COACH', deletedAt: null } }),
      prisma.user.count({ where: { role: 'WRITER', deletedAt: null } }),
      prisma.user.count({ where: { role: 'PLAYER', deletedAt: null } }),
      prisma.user.count({ where: { role: 'FAN', deletedAt: null } }),

      // Verified coaches
      prisma.user.count({
        where: {
          role: 'COACH',
          verifiedAt: { not: null },
          deletedAt: null,
        },
      }),

      // Pending claims
      prisma.playerClaimRequest.count({
        where: { status: 'PENDING' },
      }),

      // Unverified offers
      prisma.collegeOffer.count({
        where: { verified: false },
      }),

      // Total players in database
      prisma.player.count(),

      // Total games
      prisma.game.count({ where: { deletedAt: null } }),

      // Total schools
      prisma.school.count(),

      // Recent admin activity (last 10 actions)
      prisma.adminAuditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          targetType: true,
          notes: true,
          createdAt: true,
          adminUserId: true,
        },
      }),
    ]);

    const stats = {
      users: {
        total: totalUsers,
        byRole: {
          admin: totalAdmins,
          coach: totalCoaches,
          writer: totalWriters,
          player: totalPlayers,
          fan: totalFans,
        },
        verifiedCoaches,
      },
      players: {
        total: totalPlayersDB,
        withAccounts: totalPlayers,
      },
      claims: {
        pending: pendingClaims,
      },
      offers: {
        unverified: unverifiedOffers,
      },
      games: {
        total: totalGames,
      },
      schools: {
        total: totalSchools,
      },
      recentActivity,
    };

    return Response.json({ data: stats });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return Response.json(
      { error: 'Failed to fetch statistics', details: error.message },
      { status: 500 }
    );
  }
}
