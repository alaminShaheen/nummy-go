'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/trpc/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import {
  LayoutDashboard,
  UserCog,
  UtensilsCrossed,
  LogOut,
  Flame,
} from 'lucide-react';
import { useTheme } from '@/lib/themes';

// ── Page label map ───────────────────────────────────────────────────────────

const PAGE_META: Record<string, { label: string; icon: React.ElementType }> = {
  '/tenant/dashboard': { label: 'Live Orders', icon: LayoutDashboard },
  '/tenant/editprofile': { label: 'Store Settings', icon: UserCog },
  '/tenant/menu': { label: 'Menu Builder', icon: UtensilsCrossed },
};

// ── DashboardTopBar ──────────────────────────────────────────────────────────

interface DashboardTopBarProps {
  pathname: string;
  onToggleSidebar?: () => void;
}

export function DashboardTopBar({ pathname }: DashboardTopBarProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: tenant } = trpc.tenant.me.useQuery(undefined, { staleTime: Infinity });
  const { theme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const page = PAGE_META[pathname];
  const PageIcon = page?.icon;
  const user = session?.user;
  const avatarImage = tenant?.logoUrl || user?.image;
  const displayName = tenant?.name || user?.name || user?.email || 'Partner';
  const initials = displayName[0]?.toUpperCase() || 'V';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await authClient.signOut();
    /* Optional: invalidate TRPC locally, but usually hard redirect handles it */
    // await utils.tenant.me.invalidate(); 
    // await utils.vendor.storefront.invalidate();
    router.push('/tenant/login');
  };

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 h-14 shrink-0"
      style={{
        background: theme.navbar.bg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${theme.navbar.border}`,
      }}
      aria-label="Dashboard top bar"
    >
      {/* ── Left: Global Platform Escape Hatch ── */}
      <div className="flex items-center gap-2 min-w-0">
        <Link
          href="/"
          title="Return to nummyGo Platform"
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
              <PageIcon className="h-4 w-4 shrink-0" style={{ color: theme.text.secondary }} aria-hidden="true" />
            )}
            <span className="text-sm font-semibold truncate hidden sm:block" style={{ color: theme.text.primary }}>
              {page.label}
            </span>
          </div>
        )}
      </div>

      {/* ── Right: Mobile Profile / Sign Out (Hidden on large screens because Sidebar handles it) ── */}
      <div ref={mobileMenuRef} className="relative sm:hidden flex items-center">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={mobileMenuOpen}
          aria-label={`Account menu for ${displayName}`}
          className="
            relative flex flex-col items-center px-1.5 pt-1 pb-1 rounded-full
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60
            transition-transform duration-200 hover:scale-105
          "
        >
          <Avatar className="auth-avatar-ring h-8 w-8 block">
            {avatarImage ? <AvatarImage src={avatarImage} alt={displayName} /> : null}
            <AvatarFallback className="text-amber-400 text-xs font-bold" style={{ background: '#1a2130' }}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>

        {mobileMenuOpen && (
          <div
            role="menu"
            aria-label="Account options"
            className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl overflow-hidden shadow-xl shadow-black/20 animate-slide-up py-2"
            style={{
              background: theme.surface,
              border: `1px solid ${theme.card.border}`,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.card.border}` }}>
              <div className="flex items-center gap-3">
                <Avatar className="auth-avatar-ring h-9 w-9 flex-shrink-0 block">
                  {avatarImage ? <AvatarImage src={avatarImage} alt={displayName} /> : null}
                  <AvatarFallback className="text-amber-400 text-xs font-bold" style={{ background: theme.surface }}>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold truncate" style={{ color: theme.text.primary }}>{displayName}</span>
                  <span className="text-[10px] truncate" style={{ color: theme.text.muted }}>{user?.email}</span>
                </div>
              </div>
            </div>

            <div className="py-1">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                tabIndex={0}
              >
                <LogOut size={16} aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
