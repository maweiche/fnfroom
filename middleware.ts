import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-edge';

/**
 * Middleware to protect routes based on user roles
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for login pages
  if (
    pathname === '/admin/login' ||
    pathname === '/pressbox/login' ||
    pathname === '/scoresnap/login' ||
    pathname === '/player/login'
  ) {
    return NextResponse.next();
  }

  // Redirect /admin to /admin/dashboard
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Extract token from Authorization header or cookie
  let token: string | null = null;

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Also check for token in cookie (for browser-based requests)
  // Admin login sets "auth_token", API login sets "token" — check auth_token first
  // so admin sessions survive pressbox logins (which overwrite the "token" cookie)
  if (!token) {
    token = request.cookies.get('auth_token')?.value
      || request.cookies.get('token')?.value
      || null;
  }

  // Verify token and get user payload
  const payload = token ? await verifyToken(token) : null;

  // ========================================
  // ADMIN ROUTES: /admin/*
  // ========================================
  if (pathname.startsWith('/admin')) {
    // Redirect to login if no token
    if (!payload) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check admin role
    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Allow access
    return NextResponse.next();
  }

  // ========================================
  // COACH ROUTES: /coach/*
  // ========================================
  if (pathname.startsWith('/coach')) {
    // Redirect to login if no token
    if (!payload) {
      return NextResponse.redirect(new URL('/scoresnap/login', request.url));
    }

    // Check coach role (note: verification check handled in API/pages)
    if (payload.role !== 'COACH') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Allow access (verification status checked in individual routes)
    return NextResponse.next();
  }

  // ========================================
  // PLAYER ROUTES: /player/profile
  // ========================================
  if (pathname.startsWith('/player/profile')) {
    // Redirect to login if no token
    if (!payload) {
      return NextResponse.redirect(new URL('/player/login', request.url));
    }

    // Check player role
    if (payload.role !== 'PLAYER') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Allow access
    return NextResponse.next();
  }

  // ========================================
  // WRITER ROUTES: /pressbox/*
  // ========================================
  if (pathname.startsWith('/pressbox')) {
    // Redirect to login if no token
    if (!payload) {
      return NextResponse.redirect(new URL('/pressbox/login', request.url));
    }

    // Check writer or admin role
    if (payload.role !== 'WRITER' && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Allow access
    return NextResponse.next();
  }

  // All other routes are public
  return NextResponse.next();
}

/**
 * Configure which routes this middleware applies to
 */
export const config = {
  matcher: [
    '/admin/:path*',
    '/coach/:path*',
    '/player/profile/:path*',
    '/pressbox/:path*',
  ],
};
