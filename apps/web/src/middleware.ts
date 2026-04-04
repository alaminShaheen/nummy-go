import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authClientVanilla } from '@/lib/auth-client-vanilla';

// Use vanilla client (not React client) for middleware
// Middleware runs in edge runtime without React context

// Routes that require tenant authentication
const tenantProtectedRoutes = ['/tenant/onboarding', '/tenant/dashboard'];

// Routes that should redirect if already authenticated
const tenantAuthRoutes = ['/tenant/login'];

// Customer routes (if needed for future)
const customerProtectedRoutes: string[] = [];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check route types
  const isTenantProtectedRoute = tenantProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isTenantAuthRoute = tenantAuthRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isCustomerProtectedRoute = customerProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Skip middleware for public routes
  if (!isTenantProtectedRoute && !isTenantAuthRoute && !isCustomerProtectedRoute) {
    return NextResponse.next();
  }

  try {
    // Use better-auth vanilla client to get session
    const session = await authClientVanilla.getSession({
      fetchOptions: {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      },
    });

    const isAuthenticated = !!session?.data?.user;
    const userRole = session?.data?.user?.role || 'customer';

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
