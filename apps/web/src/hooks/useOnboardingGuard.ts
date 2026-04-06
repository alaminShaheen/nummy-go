'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/trpc/client';

interface OnboardingGuardOptions {
  /**
   * When true, the guard only activates for authenticated users.
   * Non-authenticated visitors see the page content normally.
   * Use this for public pages like vendor storefronts (`[slug]`).
   *
   * When false (default), the guard assumes the user must be authenticated
   * (handled by a parent auth layout) and always checks onboarding status.
   */
  onlyIfAuthenticated?: boolean;
}

/**
 * Reusable onboarding guard hook.
 *
 * Checks if the current logged-in user has completed tenant onboarding.
 * If not, redirects to `/tenant/onboarding`.
 *
 * Returns `isLoading` and `isReady` to prevent page-redirect glitches:
 * - Render a skeleton/loader while `isLoading` is true.
 * - Only render page content when `isReady` is true.
 */
export function useOnboardingGuard({
  onlyIfAuthenticated = false,
}: OnboardingGuardOptions = {}) {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const isLoggedIn = !!session?.user;

  // Only query tenant profile when the user is actually logged in
  const { data: tenant, isLoading: isTenantLoading } = trpc.tenant.me.useQuery(
    undefined,
    { enabled: isLoggedIn },
  );

  // For public pages: if user isn't logged in, the guard doesn't apply —
  // skip all loading states and let them see the page immediately.
  const isGuardActive = onlyIfAuthenticated ? isLoggedIn : true;

  // True while we're still fetching the data we need to make a decision
  const isLoading = isGuardActive
    ? isSessionPending || (isLoggedIn && isTenantLoading)
    : false;

  // True when we've confirmed the user needs to onboard
  const needsOnboarding =
    !isLoading && isGuardActive && isLoggedIn && !tenant?.onboardingCompleted;

  useEffect(() => {
    if (needsOnboarding) {
      router.replace('/tenant/onboarding');
    }
  }, [needsOnboarding, router]);

  return {
    /** True while session/tenant data is being fetched */
    isLoading,
    /** True when page content is safe to render (no loading, no redirect pending) */
    isReady: !isLoading && !needsOnboarding,
  };
}
