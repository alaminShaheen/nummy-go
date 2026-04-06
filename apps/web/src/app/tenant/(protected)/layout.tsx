'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Skeleton } from '@/components/ui';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  // Skip onboarding guard on the onboarding page itself to avoid redirect loops
  const isOnboardingPage = pathname === '/tenant/onboarding';

  const { isLoading: isOnboardingLoading, isReady: isOnboardingReady } =
    useOnboardingGuard();

  // ── Auth gate ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace('/tenant/login');
    }
  }, [session, isPending, router]);

  // Show skeleton while auth session or onboarding status is resolving
  if (isPending || (!isOnboardingPage && isOnboardingLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-64 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-40 mx-auto" />
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  // Auth check failed — render nothing while redirect happens
  if (!session?.user) return null;

  // Onboarding redirect pending — render nothing to prevent flash
  if (!isOnboardingPage && !isOnboardingReady) return null;

  return <>{children}</>;
}
