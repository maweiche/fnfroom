import { getUserFromToken, getTokenFromHeader } from './auth';

const BOARD_ROLES = ['ADMIN', 'WRITER', 'COACH'] as const;

/**
 * Require board-eligible role (ADMIN, WRITER, or verified COACH) for API routes.
 * Returns { user, error }.
 */
export async function requireBoardUser(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = getTokenFromHeader(authHeader);

  if (!token) {
    return {
      error: { message: 'Unauthorized - No token provided', status: 401 },
      user: null,
    };
  }

  const user = await getUserFromToken(token);

  if (!user) {
    return {
      error: { message: 'Unauthorized - Invalid token', status: 401 },
      user: null,
    };
  }

  if (!BOARD_ROLES.includes(user.role as any)) {
    return {
      error: { message: 'Forbidden - Board access requires ADMIN, WRITER, or COACH role', status: 403 },
      user: null,
    };
  }

  // Coaches must be verified
  if (user.role === 'COACH' && !user.verifiedAt) {
    return {
      error: { message: 'Forbidden - Coach account not yet verified', status: 403 },
      user: null,
    };
  }

  return { user, error: null };
}
