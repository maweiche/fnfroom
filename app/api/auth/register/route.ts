import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(30, 'Display name must be at most 30 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, displayName } = RegisterSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        displayName,
        role: 'FAN',
        verifiedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        displayName: true,
        schoolName: true,
      },
    });

    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
    });

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        displayName: user.displayName,
        schoolName: user.schoolName,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
