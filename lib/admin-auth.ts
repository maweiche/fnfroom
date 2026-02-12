import { getUserFromToken, getTokenFromHeader, isAdmin } from './auth';

/**
 * Require admin role for API routes
 * Returns user if admin, otherwise returns error object
 */
export async function requireAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = getTokenFromHeader(authHeader);

  if (!token) {
    return {
      error: { message: 'Unauthorized - No token provided', status: 401 },
      user: null
    };
  }

  const user = await getUserFromToken(token);

  if (!user) {
    return {
      error: { message: 'Unauthorized - Invalid token', status: 401 },
      user: null
    };
  }

  if (!isAdmin(user)) {
    return {
      error: { message: 'Forbidden - Admin access required', status: 403 },
      user: null
    };
  }

  return { user, error: null };
}

/**
 * Create an audit log entry for admin actions
 */
export async function createAuditLog(params: {
  adminUserId: string;
  action: string;
  targetType: 'USER' | 'PLAYER' | 'GAME' | 'ROSTER' | 'SCHOOL' | 'OFFER' | 'CLAIM' | 'SCHEDULE';
  targetId: string;
  changes?: any;
  notes?: string;
}) {
  const { prisma } = await import('./prisma');

  return prisma.adminAuditLog.create({
    data: {
      adminUserId: params.adminUserId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      changes: params.changes || null,
      notes: params.notes || null,
    },
  });
}
