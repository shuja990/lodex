import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/about',
    '/contact', 
    '/how-it-works',
    '/pricing',
    '/for-shippers',
    '/for-carriers',
    '/download',
    '/post-load',
    '/auth'
  ];

  // API routes that don't require authentication
  const publicApiRoutes = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/seed/admin'
  ];

  // Check if it's a public route
  if (publicRoutes.some(route => pathname.startsWith(route)) || 
      publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    // Redirect to auth page for dashboard routes
    if (pathname.startsWith('/dashboard')) {
      const url = new URL('/auth', request.url);
      return NextResponse.redirect(url);
    }
    
    // Return 401 for API routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const url = new URL('/auth', request.url);
    return NextResponse.redirect(url);
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-email', decoded.email);
    requestHeaders.set('x-user-role', decoded.role);

    // Role-based route protection
    if (pathname.startsWith('/dashboard')) {
      const userRole = decoded.role;
      
      // Admin dashboard
      if (pathname.startsWith('/dashboard/admin') && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // Shipper dashboard
      if (pathname.startsWith('/dashboard/shipper') && userRole !== 'shipper') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // Carrier dashboard
      if (pathname.startsWith('/dashboard/carrier') && !['carrier', 'driver'].includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Redirect to role-specific dashboard if accessing generic dashboard
      if (pathname === '/dashboard') {
        switch (userRole) {
          case 'admin':
            return NextResponse.redirect(new URL('/dashboard/admin', request.url));
          case 'shipper':
            return NextResponse.redirect(new URL('/dashboard/shipper', request.url));
          case 'carrier':
          case 'driver':
            return NextResponse.redirect(new URL('/dashboard/carrier', request.url));
          default:
            return NextResponse.redirect(new URL('/auth', request.url));
        }
      }
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch {
    // Invalid token - redirect to auth
    if (pathname.startsWith('/dashboard')) {
      const url = new URL('/auth', request.url);
      return NextResponse.redirect(url);
    }
    
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const url = new URL('/auth', request.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};