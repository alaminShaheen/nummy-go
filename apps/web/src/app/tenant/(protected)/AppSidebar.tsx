'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { authClient } from '@/lib/auth-client';
import {
  LayoutDashboard,
  UtensilsCrossed,
  UserCog,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── CSS variable: change this one value to resize sidebar everywhere ─────────
const SIDEBAR_WIDTH = 256; // px  → keep in sync with layout.tsx var(--sidebar-w)

// ── Nav items config ─────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  external?: boolean;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Live Orders',       href: '/tenant/dashboard',   icon: LayoutDashboard },
  { label: 'Store Settings',    href: '/tenant/editprofile', icon: UserCog },
  { label: 'Menu Builder',      href: '/tenant/menu',        icon: UtensilsCrossed },
];

// ── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer' : undefined}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
        'transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50',
        isActive
          ? [
              'bg-gradient-to-r from-amber-500/15 to-orange-500/10',
              'border border-amber-500/25',
              'text-amber-400',
              'shadow-sm shadow-amber-500/10',
            ]
          : [
              'border border-transparent',
              'text-slate-400',
              'hover:text-slate-100 hover:bg-white/[0.05]',
            ]
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
        )}
        aria-hidden="true"
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.external && (
        <ExternalLink className="h-3 w-3 text-slate-600 group-hover:text-indigo-400 transition-colors" aria-hidden="true" />
      )}
    </Link>
  );
}

// ── AppSidebar ───────────────────────────────────────────────────────────────

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: tenant } = trpc.tenant.me.useQuery(undefined, { staleTime: Infinity });

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/tenant/login');
  };

  const storefrontHref = tenant?.slug ? `/${tenant.slug}` : '#';
  const userInitial = session?.user?.name?.[0]?.toUpperCase() ?? session?.user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <aside
      aria-label="Restaurant dashboard navigation"
      className="fixed inset-y-0 left-0 z-30 flex flex-col"
      style={{
        width: SIDEBAR_WIDTH,
        background: '#111820',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* ── Brand header ── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.07]">
        {/* Tenant logo */}
        <div className="relative shrink-0">
          {tenant?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenant.logoUrl}
              alt={tenant.name ?? 'Restaurant'}
              className="w-10 h-10 rounded-full object-cover auth-avatar-ring"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg auth-avatar-ring"
              style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}
              aria-hidden="true"
            >
              🍽️
            </div>
          )}
          {/* Live dot */}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2"
            style={{ borderColor: '#111820' }}
            title="Online"
          />
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-100 truncate leading-tight">
            {tenant?.name ?? <span className="text-slate-500">Loading…</span>}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Restaurant Dashboard</p>
        </div>
      </div>

      {/* ── Nav links ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main navigation">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
          />
        ))}

        {/* Storefront — external link */}
        <div className="pt-2 mt-2 border-t border-white/[0.06]">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Public
          </p>
          <NavLink
            item={{ label: 'My Storefront', href: storefrontHref, icon: ExternalLink, external: true }}
            isActive={false}
          />
        </div>
      </nav>

      {/* ── Footer — user + sign out ── */}
      <div className="border-t border-white/[0.07] px-3 py-4">
        <div className="flex items-center gap-2.5">
          {/* User avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}
            aria-hidden="true"
          >
            {userInitial}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {session?.user?.name ?? 'Vendor'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {session?.user?.email ?? ''}
            </p>
          </div>

          <button
            onClick={handleSignOut}
            title="Sign out"
            aria-label="Sign out"
            className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
