import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require tenant authentication
const tenantProtectedRoutes = ['/tenant/onboarding', '/tenant/dashboard'];

// Routes that should redirect if already authenticated
const tenantAuthRoutes = ['/tenant/login'];

// Customer routes (if needed for future)
const customerProtectedRoutes: string[] = [];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check route types
  const isTenantProtectedRoute = tenantProtectedRoutes.some((route) => pathname.startsWith(route));
  const isTenantAuthRoute = tenantAuthRoutes.some((route) => pathname.startsWith(route));
  const isCustomerProtectedRoute = customerProtectedRoutes.some((route) => pathname.startsWith(route));

  // Skip middleware for public routes
  if (!isTenantProtectedRoute && !isTenantAuthRoute && !isCustomerProtectedRoute) {
    return NextResponse.next();
  }

  // Get the API worker URL from environment
  const apiUrl = process.env.NEXT_PUBLIC_API_WORKER_URL || 'http://localhost:8787';

  try {
    // Validate session by calling better-auth on the API worker
    const sessionResponse = await fetch(`${apiUrl}/api/auth/get-session`, {
      headers: {
        // Forward the cookie header to validate session
        cookie: request.headers.get('cookie') || '',
      },
    });

    const session = sessionResponse.ok ? await sessionResponse.json() : null;
    const isAuthenticated = !!session?.user;
    const userRole = session?.user?.role || 'customer';

    // === Tenant-specific routes ===

    // Tenant protected route without authentication → redirect to tenant login
    if (isTenantProtectedRoute && !isAuthenticated) {
      const loginUrl = new URL('/tenant/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Tenant protected route with wrong role → redirect to customer page
    if (isTenantProtectedRoute && isAuthenticated && userRole !== 'tenant') {
      return NextResponse.redirect(new URL('/customer', request.url));
    }

    // Tenant auth route when already authenticated as tenant → redirect to onboarding
    if (isTenantAuthRoute && isAuthenticated && userRole === 'tenant') {
      return NextResponse.redirect(new URL('/tenant/onboarding', request.url));
    }

    // === Customer-specific routes (future) ===

    // Customer protected routes logic can go here when needed

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware auth check failed:', error);

    // On error, redirect to appropriate login based on route
    if (isTenantProtectedRoute) {
      const loginUrl = new URL('/tenant/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Allow access for non-protected routes on error
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
