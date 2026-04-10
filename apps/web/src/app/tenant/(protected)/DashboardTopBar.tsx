'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/trpc/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import {
  Bell,
  LogOut,
  LayoutDashboard,
  UserCog,
  UtensilsCrossed,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Page label map ───────────────────────────────────────────────────────────

const PAGE_META: Record<string, { label: string; icon: React.ElementType }> = {
  '/tenant/dashboard':   { label: 'Dashboard',    icon: LayoutDashboard },
  '/tenant/editprofile': { label: 'Edit Profile',  icon: UserCog },
  '/tenant/menu':        { label: 'Menu Builder',  icon: UtensilsCrossed },
};

// ── DashboardTopBar ──────────────────────────────────────────────────────────

interface DashboardTopBarProps {
  pathname: string;
}

export function DashboardTopBar({ pathname }: DashboardTopBarProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: tenant } = trpc.tenant.me.useQuery(undefined, { staleTime: Infinity });

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/tenant/login');
  };

  const page = PAGE_META[pathname];
  const PageIcon = page?.icon;
  const user = session?.user;
  const initials = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'V';
  const displayName = user?.name || user?.email || 'Vendor';

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
      {/* ── Left: Breadcrumb ── */}
      <div className="flex items-center gap-2 min-w-0">
        <Link
          href="/tenant/dashboard"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors shrink-0"
        >
          nummyGo
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-700 shrink-0" aria-hidden="true" />
        {page && (
          <div className="flex items-center gap-1.5">
            {PageIcon && (
              <PageIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" aria-hidden="true" />
            )}
            <span className="text-xs font-semibold text-slate-200 truncate">
              {page.label}
            </span>
          </div>
        )}
      </div>

      {/* ── Right: Actions cluster ── */}
      <div className="flex items-center gap-3 shrink-0">

        {/* Storefront quick-link */}
        {tenant?.slug && (
          <Link
            href={`/${tenant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
              'text-slate-400 hover:text-indigo-400',
              'border border-white/[0.07] hover:border-indigo-500/30',
              'hover:bg-indigo-500/[0.06]',
              'transition-all duration-200'
            )}
          >
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            View Storefront
          </Link>
        )}

        {/* User avatar + info pill */}
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-default"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Avatar className="h-6 w-6">
            {user?.image && <AvatarImage src={user.image} alt={displayName} />}
            <AvatarFallback
              className="text-[10px] font-bold text-amber-400"
              style={{ background: '#1a2130' }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-xs font-medium text-slate-300 truncate max-w-[120px]">
            {displayName}
          </span>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
          className={cn(
            'p-2 rounded-lg transition-all duration-200',
            'text-slate-500 hover:text-rose-400',
            'hover:bg-rose-500/10',
            'outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50'
          )}
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
