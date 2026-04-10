'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Skeleton } from '@/components/ui';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';
import { AppSidebar } from './AppSidebar';
import { DashboardTopBar } from './DashboardTopBar';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  const isOnboardingPage = pathname === '/tenant/onboarding';

  const { isLoading: isOnboardingLoading, isReady: isOnboardingReady } =
    useOnboardingGuard();

  // ── Auth gate ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace('/tenant/login');
    }
  }, [session, isPending, router]);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isPending || (!isOnboardingPage && isOnboardingLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D1117' }}>
        <div className="space-y-4 w-64 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto bg-white/5" />
          <Skeleton className="h-4 w-40 mx-auto bg-white/5" />
          <Skeleton className="h-3 w-32 mx-auto bg-white/5" />
        </div>
      </div>
    );
  }

  if (!session?.user) return null;
  if (!isOnboardingPage && !isOnboardingReady) return null;

  // ── Onboarding: no sidebar ─────────────────────────────────────────────────
  if (isOnboardingPage) {
    return <>{children}</>;
  }

  // ── Protected: sidebar + main ──────────────────────────────────────────────
  return (
    <div
      className="flex min-h-screen"
      style={{ background: '#0D1117', color: '#f1f5f9' }}
    >
      {/* Fixed sidebar */}
      <AppSidebar />

      {/* Main content — offset by sidebar width */}
      <div
        className="flex flex-col flex-1 min-w-0"
        style={{ marginLeft: 'var(--sidebar-w, 256px)' }}
        id="dashboard-main"
      >
        {/* Sticky top bar */}
        <DashboardTopBar pathname={pathname} />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
