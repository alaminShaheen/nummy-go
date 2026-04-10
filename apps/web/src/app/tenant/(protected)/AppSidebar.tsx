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
  PanelLeftClose,
  PanelLeftOpen,
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
  { label: 'Live Orders', href: '/tenant/dashboard', icon: LayoutDashboard },
  { label: 'Store Settings', href: '/tenant/editprofile', icon: UserCog },
  { label: 'Menu Builder', href: '/tenant/menu', icon: UtensilsCrossed },
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

interface AppSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isExpanded, onToggle }: AppSidebarProps) {
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
    <>
      {/* ── Sidebar Panel (Rail or Expanded) ── */}
      <aside
        aria-label="Restaurant dashboard navigation"
        data-expanded={isExpanded}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out hidden sm:flex",
          isExpanded ? "w-64" : "w-16"
        )}
        style={{
          background: '#111820',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* ── Brand header ── */}
        <div className="flex items-center px-4 py-5 border-b border-white/[0.07] min-h-[81px]">
          {/* Tenant logo */}
          <div className="relative shrink-0">
            {tenant?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.logoUrl}
                alt={tenant.name ?? 'Restaurant'}
                className="w-8 h-8 rounded-full object-cover auth-avatar-ring transition-all"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm auth-avatar-ring transition-all"
                style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}
                aria-hidden="true"
              >
                🍽️
              </div>
            )}
            {/* Live dot */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 transition-all"
              style={{ borderColor: '#111820' }}
              title="Online"
            />
          </div>

          {/* Name - only visible when expanded */}
          <div className={cn(
            "ml-3 flex-1 min-w-0 transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0 hidden"
          )}>
            <p className="text-sm font-bold text-slate-100 truncate leading-tight">
              {tenant?.name ?? <span className="text-slate-500">Loading…</span>}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Dashboard</p>
          </div>
        </div>

        {/* ── Nav links ── */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2" aria-label="Main navigation">
          {isExpanded && (
            <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Navigation
            </p>
          )}
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isExpanded ? item.label : undefined}
                className={cn(
                  'group flex items-center rounded-lg transition-all duration-200 min-h-[40px]',
                  isExpanded ? 'px-3 py-2 gap-3' : 'justify-center p-2 mx-auto w-10',
                  isActive
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                )}
              >
                <item.icon
                  className={cn(
                    'shrink-0',
                    isExpanded ? 'w-4 h-4' : 'w-5 h-5',
                    isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                  )}
                  aria-hidden="true"
                />
                {isExpanded && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </Link>
            );
          })}

          {/* Storefront — external link */}
          <div className="pt-2 mt-2 border-t border-white/[0.06]">
            {isExpanded && (
              <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Public
              </p>
            )}
            <Link
              href={storefrontHref}
              title={!isExpanded ? "My Storefront" : undefined}
              target="_blank"
              className={cn(
                'group flex items-center rounded-lg transition-all duration-200 min-h-[40px] text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]',
                isExpanded ? 'px-3 py-2 gap-3' : 'justify-center p-2 mx-auto w-10'
              )}
            >
              <ExternalLink className={cn('shrink-0 text-slate-500 group-hover:text-slate-300', isExpanded ? 'w-4 h-4' : 'w-5 h-5')} aria-hidden="true" />
              {isExpanded && <span className="text-sm font-medium truncate">My Shop</span>}
            </Link>
          </div>
        </nav>

        {/* ── Footer — user + sign out ── */}
        <div className="border-t border-white/[0.07] p-2 space-y-2">
          <div className={cn("flex items-center", isExpanded ? "gap-2.5 px-2" : "justify-center")}>
            {/* User avatar */}
            <div
              className={cn("rounded-full flex items-center justify-center shrink-0 text-xs font-bold", isExpanded ? "w-8 h-8" : "w-10 h-10")}
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}
              aria-hidden="true"
            >
              {userInitial}
            </div>

            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {session?.user?.name ?? 'Vendor'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {session?.user?.email ?? ''}
                </p>
              </div>
            )}

            {isExpanded && (
              <button
                onClick={handleSignOut}
                title="Sign out"
                aria-label="Sign out"
                className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Toggle Sidebar Button */}
          <button
            onClick={onToggle}
            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            className={cn(
              "flex items-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all rounded-lg w-full min-h-[40px] mt-2",
              isExpanded ? "justify-start px-3 py-2 gap-3" : "justify-center p-2 mx-auto w-10"
            )}
          >
            {isExpanded ? (
              <PanelLeftClose className="w-5 h-5 shrink-0" />
            ) : (
              <PanelLeftOpen className="w-5 h-5 shrink-0" />
            )}
            {isExpanded && <span className="text-sm font-medium">Collapse</span>}
          </button>

          {!isExpanded && (
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="flex items-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all rounded-lg min-h-[40px] justify-center p-2 mx-auto w-10 mt-2"
            >
              <LogOut className="w-5 h-5 shrink-0" />
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation Bar (< sm) ── */}
      <nav className="sm:hidden fixed bottom-0 z-50 w-full h-16 flex items-center justify-around px-2 border-t"
        style={{ background: '#111820', borderColor: 'rgba(255,255,255,0.07)' }}
        aria-label="Mobile navigation"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]")} aria-hidden="true" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}

        {/* Mobile Profile / Settings link */}
        <Link
          href={`/${tenant?.slug ?? '#'}`}
          target="_blank"
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ExternalLink className="w-5 h-5" aria-hidden="true" />
          <span className="text-[10px] font-medium leading-none">Store</span>
        </Link>
      </nav>
    </>
  );
}
