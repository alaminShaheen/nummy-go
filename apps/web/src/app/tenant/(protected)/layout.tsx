'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Skeleton } from '@/components/ui';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';
import { AppSidebar } from './AppSidebar';
import { DashboardTopBar } from './DashboardTopBar';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/themes';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open for Desktop

  // Auto-collapse if loading on a mobile viewport
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const isOnboardingPage = pathname === '/tenant/onboarding';

  const { isLoading: isOnboardingLoading, isReady: isOnboardingReady } =
    useOnboardingGuard();

  // ── Auth gate ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace(`/tenant/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [session, isPending, router, pathname]);

  const { theme } = useTheme();

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isPending || (!isOnboardingPage && isOnboardingLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.bg }}>
        <div className="space-y-4 w-64 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" style={{ background: theme.card.border }} />
          <Skeleton className="h-4 w-40 mx-auto" style={{ background: theme.card.border }} />
          <Skeleton className="h-3 w-32 mx-auto" style={{ background: theme.card.border }} />
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
      style={{ background: theme.bg, color: theme.text.primary }}
    >
      {/* Responsive sidebar or bottom nav */}
      <AppSidebar isExpanded={isSidebarOpen} onToggle={() => setIsSidebarOpen(prev => !prev)} />

      {/* Main content — full width mobile, offset depends on sidebar open state on desktop lg+ */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 transition-all duration-300 pb-16 sm:pb-0",
          isSidebarOpen ? "sm:ml-[256px]" : "sm:ml-[64px]"
        )}
        id="dashboard-main"
      >
        {/* Sticky top bar */}
        <DashboardTopBar pathname={pathname} onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
