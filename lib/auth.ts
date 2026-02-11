import { SignJWT, jwtVerify } from 'jose';
import { compare, hash } from 'bcrypt';
import { prisma } from './prisma';

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
 * Generate a JWT token for a user session
 */
export async function generateToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7-day sessions
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12); // 12 rounds for good security/performance balance
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return compare(password, passwordHash);
}

/**
 * Create a new user account (admin only)
 */
export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role: Role;
  schoolName?: string;
  primarySport?: string;
}) {
  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      role: data.role,
      schoolName: data.schoolName,
      primarySport: data.primarySport,
      verifiedAt: data.role === 'ADMIN' ? new Date() : null, // Auto-verify admins
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      schoolName: true,
      primarySport: true,
      verifiedAt: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Authenticate a user with email and password
 */
export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      verifiedAt: true,
    },
  });

  if (!user) {
    return null; // User not found
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return null; // Invalid password
  }

  // Check if coach is verified
  if (user.role === 'COACH' && !user.verifiedAt) {
    throw new Error('ACCOUNT_NOT_VERIFIED');
  }

  const token = await generateToken({
    userId: user.id,
    email: user.email,
    role: user.role as Role,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
    },
  };
}

/**
 * Get user from token (for protected API routes)
 */
export async function getUserFromToken(token: string) {
  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      schoolName: true,
      primarySport: true,
      verifiedAt: true,
      writerStyleNotes: true, // For Press Box AI
      playerId: true, // For player account linking
    },
  });

  return user;
}

/**
 * Extract token from Authorization header
 */
export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Verify admin role
 */
export function isAdmin(user: { role: string }): boolean {
  return user.role === 'ADMIN';
}

/**
 * Verify coach is verified
 */
export function isVerifiedCoach(user: { role: string; verifiedAt: Date | null }): boolean {
  return user.role === 'COACH' && user.verifiedAt !== null;
}

/**
 * Verify user is a player with linked account
 */
export function isPlayer(user: { role: string; playerId: string | null }): boolean {
  return user.role === 'PLAYER' && user.playerId !== null;
}

/**
 * Check if user has one of the allowed roles
 */
export function requireRole(user: any, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(user.role as Role);
}

/**
 * Verify user is a writer
 */
export function isWriter(user: { role: string }): boolean {
  return user.role === 'WRITER';
}
