'use client';

import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/trpc/client';
import {
  LayoutDashboard,
  UserCog,
  UtensilsCrossed,
  ExternalLink,
  ChevronRight,
  Flame,
} from 'lucide-react';

// ── Page label map ───────────────────────────────────────────────────────────

const PAGE_META: Record<string, { label: string; icon: React.ElementType }> = {
  '/tenant/dashboard': { label: 'Live Orders', icon: LayoutDashboard },
  '/tenant/editprofile': { label: 'Store Settings', icon: UserCog },
  '/tenant/menu': { label: 'Menu Builder', icon: UtensilsCrossed },
};

// ── DashboardTopBar ──────────────────────────────────────────────────────────

interface DashboardTopBarProps {
  pathname: string;
}

export function DashboardTopBar({ pathname }: DashboardTopBarProps) {
  const { data: session } = authClient.useSession();
  const { data: tenant } = trpc.tenant.me.useQuery(undefined, { staleTime: Infinity });

  const page = PAGE_META[pathname];
  const PageIcon = page?.icon;
  const user = session?.user;
  const avatarImage = tenant?.logoUrl || user?.image;
  const displayName = tenant?.name || user?.name || user?.email || 'Vendor';
  const initials = displayName[0]?.toUpperCase() || 'V';

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 h-14 shrink-0"
      style={{
        background: 'rgba(13,17,23,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
      aria-label="Dashboard top bar"
    >
      {/* ── Left: Global Platform Escape Hatch ── */}
      <div className="flex items-center gap-2 min-w-0">
        <Link
          href="/"
          title="Return to NummyGo Platform"
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-br from-amber-500/5 to-orange-600/5 hover:from-amber-500/10 hover:to-orange-600/10 border border-amber-500/10 hover:border-amber-400/30 transition-all shrink-0 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]"
        >
          <Flame className="h-4 w-4 text-amber-500 group-hover:text-amber-400 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] transition-all" />
          <span className="text-sm font-black tracking-tight gradient-text">
            nummyGo
          </span>
        </Link>
        <div className="h-4 w-px bg-white/10 mx-1 shrink-0" aria-hidden="true" />
        {page && (
          <div className="flex items-center gap-2">
            {PageIcon && (
              <PageIcon className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
            )}
            <span className="text-sm font-semibold text-slate-200 truncate">
              {page.label}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
