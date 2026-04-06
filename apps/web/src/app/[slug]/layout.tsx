'use client';

import { Skeleton } from '@/components/ui';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isReady } = useOnboardingGuard({ onlyIfAuthenticated: true });

  // Only show skeleton for logged-in users whose tenant data is still loading.
  // Non-authenticated customers see the storefront immediately.
  if (isLoading) {
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

  // If redirect is pending (un-onboarded vendor), render nothing to prevent flash
  if (!isReady) return null;

  return <>{children}</>;
}
