import { getUserFromToken, getTokenFromHeader } from './auth';

/**
 * Require any logged-in, non-banned user for community API routes.
 * Unlike board-auth.ts (ADMIN/WRITER/COACH only), this allows ALL roles including FAN.
 */
export async function requireCommunityUser(request: Request) {
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

  if ((user as any).bannedAt) {
    return {
      error: { message: 'Forbidden - Your account has been suspended', status: 403 },
      user: null,
    };
  }

  return { user, error: null };
}

/**
 * Optionally authenticate — returns user if logged in, null otherwise. No error on missing token.
 */
export async function optionalCommunityUser(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = getTokenFromHeader(authHeader);

  if (!token) return null;

  const user = await getUserFromToken(token);
  if (!user) return null;
  if ((user as any).bannedAt) return null;

  return user;
}
