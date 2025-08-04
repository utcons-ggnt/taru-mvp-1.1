import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  requiresOnboarding?: boolean;
  requiresAssessment?: boolean;
  [key: string]: unknown;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes
  const dashboardRoutes = [
    '/dashboard/student',
    '/dashboard/parent', 
    '/dashboard/teacher',
    '/dashboard/admin'
  ];

  // Check if the current path starts with any dashboard route
  const isDashboardRoute = dashboardRoutes.some(route => pathname.startsWith(route));

  if (isDashboardRoute) {
    // Get auth token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify token
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const decoded = payload as DecodedToken;
      
      // Check if user requires onboarding
      if (decoded.requiresOnboarding) {
        if (decoded.role === 'student') {
          return NextResponse.redirect(new URL('/student-onboarding', request.url));
        } else if (decoded.role === 'parent') {
          return NextResponse.redirect(new URL('/parent-onboarding', request.url));
        }
      }

      // Check if student requires diagnostic assessment
      if (decoded.requiresAssessment && decoded.role === 'student') {
        return NextResponse.redirect(new URL('/diagnostic-assessment', request.url));
      }

      // Check role-based access
      if (pathname.startsWith('/dashboard/student') && decoded.role !== 'student') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (pathname.startsWith('/dashboard/parent') && decoded.role !== 'parent') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (pathname.startsWith('/dashboard/teacher') && decoded.role !== 'teacher') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (pathname.startsWith('/dashboard/admin') && decoded.role !== 'organization' && decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url));
      }

    } catch (error) {
      // Invalid token, redirect to login
      console.error('Invalid token in middleware:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Check if user is trying to access onboarding pages or diagnostic assessment
  const protectedRoutes = ['/student-onboarding', '/parent-onboarding', '/diagnostic-assessment'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify token
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const decoded = payload as DecodedToken;
      
      // Check if user is accessing the correct onboarding page for their role
      if (pathname.startsWith('/student-onboarding') && decoded.role !== 'student') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (pathname.startsWith('/parent-onboarding') && decoded.role !== 'parent') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (pathname.startsWith('/diagnostic-assessment') && decoded.role !== 'student') {
        return NextResponse.redirect(new URL('/login', request.url));
      }

    } catch (error) {
      // Invalid token, redirect to login
      console.error('Invalid token in middleware:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/student-onboarding',
    '/parent-onboarding',
    '/diagnostic-assessment',
    '/subject-selection'
  ]
};