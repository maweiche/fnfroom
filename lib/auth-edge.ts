import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'change-me-to-a-secure-random-string-in-production'
);

export type Role = 'ADMIN' | 'COACH' | 'WRITER' | 'PLAYER' | 'FAN';

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

/**
 * Verify and decode a JWT token (Edge runtime compatible)
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}
