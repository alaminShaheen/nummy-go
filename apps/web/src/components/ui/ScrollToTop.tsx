'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp } from 'lucide-react';
import { cn } from '@nummygo/shared/ui';

export function ScrollToTop() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | Document;
      const scrollY = target instanceof Document ? window.scrollY : (target as HTMLElement).scrollTop;
      setShow(scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Fallback: listen on <main> layout wrapper or dashboard wrappers if they absorb the scroll
    const mainNode = document.querySelector('main');
    if (mainNode) mainNode.addEventListener('scroll', handleScroll, { passive: true });

    const dashboardMain = document.getElementById('dashboard-main');
    if (dashboardMain) dashboardMain.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (mainNode) mainNode.removeEventListener('scroll', handleScroll);
      if (dashboardMain) dashboardMain.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainNode = document.querySelector('main');
    if (mainNode) mainNode.scrollTo({ top: 0, behavior: 'smooth' });
    const dashboardMain = document.getElementById('dashboard-main');
    if (dashboardMain) dashboardMain.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!pathname) return null;

  // Exclude pages: Landing page, Checkout page, and Customer tracking page
  if (pathname === '/' || pathname.startsWith('/checkout') || pathname.startsWith('/track')) {
    return null;
  }

  if (!show) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed right-6 sm:right-10 z-[100] p-4 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-indigo-400 hover:text-white shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 group animate-in fade-in zoom-in-50 slide-in-from-bottom flex items-center justify-center backdrop-blur-md",
        // Elevate slightly higher on tenant pages for mobile nav, and on storefronts to clear the CartFab
        pathname.startsWith('/tenant') ? "bottom-20 sm:bottom-12" : "bottom-28 sm:bottom-24"
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp size={24} strokeWidth={3} className="transition-transform group-hover:-translate-y-1 drop-shadow-md" />
    </button>
  );
}
