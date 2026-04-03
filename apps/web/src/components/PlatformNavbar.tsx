'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

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
          <span className="text-xl font-black tracking-tight gradient-text">
            nummyGo
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/vendor/login"
            id="vendor-login-btn"
            className="
              inline-flex items-center gap-2
              px-5 py-2.5 rounded-full
              bg-gradient-to-r from-amber-500 to-orange-600
              text-white font-semibold text-sm
              shadow-lg shadow-orange-900/30
              hover:shadow-xl hover:shadow-orange-900/50
              hover:scale-105
              transition-all duration-200
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Vendor Login
          </Link>
        </div>
      </nav>
    </header>
  );
}
