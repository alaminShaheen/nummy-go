'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { ClipboardList, Pencil, LogOut, LogIn, User, CookingPot, ShoppingCart, Search } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/trpc/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { GradientButton } from '@/components/ui';
import VendorSearchBar from '@/components/VendorSearchBar';
import { useCart } from '@/hooks/useCart';
import CartDrawer from '@/components/CartDrawer';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/lib/themes';



// ─── Pill link (auth cluster) — uses globals.css .auth-pill-link ──────────────
interface PillLinkProps { href: string; icon: React.ReactNode; label: string; id: string; }
function PillLink({ href, icon, label, id }: PillLinkProps) {
  return (
    <Link href={href} id={id} aria-label={label} className="auth-pill-link">
      <span className="auth-pill-link__icon" aria-hidden="true">{icon}</span>
      <span>{label}</span>
      <span className="auth-pill-link__bar" aria-hidden="true" />
    </Link>
  );
}

function PillDivider() {
  const { theme } = useTheme();
  return <span aria-hidden="true" className="h-4 w-px flex-shrink-0" style={{ background: theme.card.border }} />;
}

// ─── Main unified Navbar ──────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();

  // "Menu" anchor is shown on storefront pages only: any /{slug} path
  // that doesn't belong to a reserved top-level segment.
  const RESERVED = new Set(['tenant', 'customer', 'cart', 'api']);
  const firstSeg = pathname.split('/')[1] ?? '';
  const isSlugPage = !!firstSeg && !RESERVED.has(firstSeg);
  const isOnboarding = pathname === '/tenant/onboarding';
  const isSearchPage = pathname === '/search';
  const { data: session, isPending } = authClient.useSession();
  const { data: tenant } = trpc.tenant.me.useQuery(undefined, {
    enabled: !!session?.user,
    staleTime: Infinity,
  });

  const slug = tenant?.slug ?? '';
  const ordersHref = '/tenant/dashboard';
  const profileHref = slug ? `/${slug}` : '/';

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Scroll-aware glass
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (e: PointerEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [mobileMenuOpen]);

  const handleMobileKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setMobileMenuOpen(false);
  }, []);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/'; } } });
  };

  const user = session?.user;
  const initials = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  const displayName = user?.name || user?.email || 'User';
  const role = (user as { role?: string })?.role || 'vendor';
  const isLoggedIn = !isPending && !!user;

  const { totalItems: cartItemCount } = useCart();
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const showNavCartIcon = cartItemCount > 0 && !isSlugPage;

  return (
    <>
      <header
        id="navbar"
        className={`
        fixed top-0 left-0 right-0 z-40
        transition-all duration-300
        ${scrolled ? 'border-b shadow-lg shadow-black/20' : 'bg-transparent'}
      `}
        style={scrolled ? {
          background: theme.navbar.bg,
          borderColor: theme.navbar.border,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } : {}}
        aria-label="Site navigation"
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

          {/* ── Logo (always visible) ── */}
          <Link
            href="/"
            id="nav-logo"
            aria-label="nummyGo — go to homepage"
            className="flex items-center gap-2 rounded-lg
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
          >
            <span className="text-2xl" aria-hidden="true">🔥</span>
            <span className="text-xl font-black tracking-tight gradient-text">nummyGo</span>
          </Link>

          {/* ── Desktop Center Search (hidden on landing + search page) ── */}
          {pathname !== '/' && !isSearchPage && (
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <VendorSearchBar size="default" placeholder="What are you hungry for?..." className="w-full" />
            </div>
          )}

          {/* ── Right side ── */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* ── Theme Toggle ── */}
            <ThemeToggle />

            {/* ── Mobile Search Icon (visible on non-search pages) ── */}
            {pathname !== '/' && !isSearchPage && (
            <Link
              href="/search"
              aria-label="Search restaurants"
              className="
                md:hidden relative p-2 rounded-full
                hover:border-amber-400/30
                text-slate-400 hover:text-amber-400
                transition-all duration-200
              "
              style={{ border: `1px solid ${theme.card.border}` }}
            >
              <Search size={17} />
            </Link>
            )}

            {/* ── Cart icon (visible on non-slug pages when cart has items) ── */}
            {showNavCartIcon && (
              <button
                id="nav-cart"
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                aria-label={`View cart – ${cartItemCount} items`}
                className="
                relative p-2 rounded-full
                hover:border-amber-400/30
                text-slate-400 hover:text-amber-400
                transition-all duration-200
              "
                style={{ border: `1px solid ${theme.card.border}` }}
              >
                <ShoppingCart size={17} />
                <span
                  className="
                  absolute -top-1 -right-1
                  min-w-[18px] h-[18px] px-1
                  flex items-center justify-center
                  rounded-full
                  bg-gradient-to-r from-amber-500 to-orange-600
                  text-[10px] font-black text-white leading-none
                "
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              </button>
            )}


            {/* ══════════════════════════════════════════
              AUTHENTICATED  — auth cluster
              Shown when user is logged in
          ══════════════════════════════════════════ */}
            {isLoggedIn && (
              <div className="flex items-center gap-2">

                {/* ── DESKTOP (sm+) ── */}
                <div className="hidden sm:flex items-center gap-2" role="navigation" aria-label="Partner actions">

                  {/* Gradient-border pill */}
                  <div
                    className="p-px rounded-full flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(251,191,36,0.55) 0%, rgba(249,115,22,0.55) 50%, rgba(129,140,248,0.55) 100%)',
                    }}
                  >
                    <div
                      className="flex items-center rounded-full"
                      style={{
                        background: theme.navbar.pill,
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                      }}
                    >
                      {!isOnboarding && (
                        <>
                          <PillLink href={ordersHref} id="nav-vendor-portal" icon={<ClipboardList size={15} />} label="Manage Store" />
                          <PillDivider />
                          <PillLink href={profileHref} id="nav-edit-profile" icon={<CookingPot size={15} />} label="My Shop" />
                          <PillDivider />
                        </>
                      )}

                      {/* Avatar + role badge */}
                      <div className="relative px-2 py-1.5 flex-shrink-0">
                        <Avatar className="auth-avatar-ring h-8 w-8 block">
                          {user!.image ? <AvatarImage src={user!.image} alt={displayName} /> : null}
                          <AvatarFallback className="text-amber-400 text-xs font-bold" style={{ background: theme.surface }}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          aria-label={`Role: ${role}`}
                          className="
                          absolute -bottom-0.5 left-1/2 -translate-x-1/2
                          px-1.5 py-px rounded-full
                          text-[9px] font-bold uppercase tracking-wider leading-none
                          bg-gradient-to-r from-amber-500 to-orange-600
                          text-white shadow-sm select-none pointer-events-none whitespace-nowrap
                        "
                        >
                          {role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sign out */}
                  <button
                    id="nav-signout"
                    type="button"
                    onClick={handleLogout}
                    aria-label="Sign out"
                    title="Sign out"
                    className="
                    flex items-center gap-1.5 px-3 py-2 rounded-full
                    hover:text-rose-400
                    hover:border-rose-500/25
                    hover:bg-rose-500/8
                    transition-all duration-200
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60
                  "
                    style={{ color: theme.text.muted, border: `1px solid transparent` }}
                  >
                    <LogOut size={15} aria-hidden="true" />
                    <span className="text-sm font-medium hidden lg:block">Sign out</span>
                  </button>
                </div>

                {/* ── MOBILE (below sm) — avatar → dropdown ── */}
                <div ref={mobileMenuRef} className="relative sm:hidden">
                  <button
                    id="nav-mobile-avatar"
                    type="button"
                    onClick={() => setMobileMenuOpen((o) => !o)}
                    onKeyDown={handleMobileKeyDown}
                    aria-haspopup="menu"
                    aria-expanded={mobileMenuOpen}
                    aria-label={`Account menu for ${displayName}`}
                    className="
                    relative flex flex-col items-center px-1.5 pt-1 pb-1 rounded-full
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60
                    transition-transform duration-200 hover:scale-105
                  "
                  >
                    <Avatar className="auth-avatar-ring h-9 w-9 block">
                      {user!.image ? <AvatarImage src={user!.image} alt={displayName} /> : null}
                      <AvatarFallback className="text-amber-400 text-xs font-bold" style={{ background: '#1a2130' }}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      aria-hidden="true"
                      className="
                      absolute -bottom-0 px-1.5 py-px rounded-full
                      text-[8px] font-bold uppercase tracking-wider leading-none
                      bg-gradient-to-r from-amber-500 to-orange-600
                      text-white shadow-sm select-none pointer-events-none
                    "
                    >
                      {role}
                    </span>
                  </button>

                  {/* Mobile dropdown */}
                  {mobileMenuOpen && (
                    <div
                      role="menu"
                      aria-label="Account options"
                      onKeyDown={handleMobileKeyDown}
                      className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl overflow-hidden border border-white/8 shadow-xl shadow-black/40 animate-slide-up py-2"
                      style={{ background: 'rgba(19,25,31,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                    >
                      <div className="px-4 py-3 border-b border-white/8">
                        <div className="flex items-center gap-3">
                          <Avatar className="auth-avatar-ring h-9 w-9 flex-shrink-0 block">
                            {user!.image ? <AvatarImage src={user!.image} alt={displayName} /> : null}
                            <AvatarFallback className="text-amber-400 text-xs font-bold" style={{ background: '#1a2130' }}>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-100 truncate">{user!.name || 'User'}</p>
                            <p className="text-xs text-slate-400 truncate">{user!.email}</p>
                          </div>
                        </div>
                      </div>
                      {!isOnboarding && (
                        <div className="py-1">
                          <Link href={ordersHref} role="menuitem" id="nav-mobile-vendor-portal" onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-amber-400 hover:bg-white/5 transition-colors duration-150 focus-visible:outline-none focus-visible:bg-white/5">
                            <ClipboardList size={15} aria-hidden="true" className="text-slate-500" /> Manage Store
                          </Link>
                          <Link href={profileHref} role="menuitem" id="nav-mobile-profile" onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-amber-400 hover:bg-white/5 transition-colors duration-150 focus-visible:outline-none focus-visible:bg-white/5">
                            <User size={15} aria-hidden="true" className="text-slate-500" /> My Shop
                          </Link>
                        </div>
                      )}
                      <div aria-hidden="true" className="mx-4 my-1 h-px bg-white/8" />
                      <div className="py-1">
                        <button role="menuitem" id="nav-mobile-signout" type="button" onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/8 transition-colors duration-150 focus-visible:outline-none focus-visible:bg-rose-500/8">
                          <LogOut size={15} aria-hidden="true" /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
              GUEST  — shown when not logged in
              (and session check is complete)
          ══════════════════════════════════════════ */}
            {!isPending && !user && (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/tenant/login" id="nav-vendor-login">
                  <GradientButton className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm shadow-orange-900/30 font-medium">
                    <LogIn size={15} aria-hidden="true" className="sm:w-4 sm:h-4 w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Partner Login</span>
                    <span className="sm:hidden">Login</span>
                  </GradientButton>
                </Link>
              </div>
            )}

            {/* Loading state: subtle pulse while session resolves */}
            {isPending && (
              <div className="h-8 w-32 rounded-full bg-white/5 animate-pulse" aria-hidden="true" />
            )}

          </div>
        </nav>

      </header>

      {/* Cart Drawer (rendered from Navbar so it's accessible on every page) */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </>
  );
}

