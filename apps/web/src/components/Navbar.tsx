'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';

interface NavbarProps {
  cartCount?: number;
}

export default function Navbar({ cartCount = 0 }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      id="navbar"
      className={`
        fixed top-0 left-0 right-0 z-40
        transition-all duration-300
        ${scrolled
          ? 'glass border-b border-white/5 shadow-lg shadow-black/40'
          : 'bg-transparent'
        }
      `}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          id="nav-logo"
          className="flex items-center gap-2"
          aria-label="NummyGo Home"
        >
          <span className="text-2xl" aria-hidden="true">🔥</span>
          <span className="text-xl font-black tracking-tight gradient-text">nummyGo</span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Menu anchor link */}
          <a
            href="#menu"
            className="hidden sm:block text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors duration-200"
          >
            Menu
          </a>

          {/* Cart icon button */}
          <Link
            href="/cart"
            id="nav-cart-btn"
            aria-label={`Cart (${cartCount} items)`}
            className="
              relative flex items-center justify-center
              w-10 h-10 rounded-full
              bg-white/5 hover:bg-white/10
              border border-white/10 hover:border-amber-400/40
              transition-all duration-200
              group
            "
          >
            <ShoppingCart
              size={18}
              className="text-slate-300 group-hover:text-amber-400 transition-colors"
              aria-hidden="true"
            />
            {cartCount > 0 && (
              <span
                className="
                  absolute -top-1 -right-1
                  flex items-center justify-center
                  w-4 h-4 rounded-full
                  bg-gradient-to-br from-amber-400 to-orange-500
                  text-[10px] font-bold text-white shadow
                "
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
