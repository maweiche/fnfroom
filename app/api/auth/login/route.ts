import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 *
 * Body: { email: string, password: string }
 * Returns: { token: string, user: object }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const result = await authenticateUser(email, password);

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'ACCOUNT_NOT_VERIFIED') {
      return NextResponse.json(
        { error: 'Your account has not been verified yet. Please contact an administrator.' },
        { status: 403 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
