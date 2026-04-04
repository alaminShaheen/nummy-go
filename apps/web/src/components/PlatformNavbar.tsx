'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { GradientButton } from '@/components/ui';
import { LogIn } from 'lucide-react';

export default function PlatformNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      id="platform-navbar"
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
          id="platform-logo"
          className="flex items-center gap-2"
          aria-label="NummyGo Home"
        >
          <span className="text-2xl" aria-hidden="true">🔥</span>
          <span className="text-xl font-black tracking-tight gradient-text">nummyGo</span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link href="/tenant/login" id="vendor-login-btn">
            <GradientButton className="px-5 py-2.5 text-sm shadow-orange-900/30">
              <LogIn size={16} aria-hidden="true" />
              Vendor Login
            </GradientButton>
          </Link>
        </div>
      </nav>
    </header>
  );
}
