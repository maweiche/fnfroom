/**
 * Press Box AI Authentication
 * Extends existing auth system to support WRITER role
 */

import { NextRequest } from 'next/server';
import { getUserFromToken, getTokenFromHeader } from '@/lib/auth';

export async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  const token = getTokenFromHeader(authHeader);
  if (!token) return null;

  const user = await getUserFromToken(token);

  // Only allow writers and admins
  if (user && (user.role === 'WRITER' || user.role === 'ADMIN')) {
    return user;
  }

  return null;
}
