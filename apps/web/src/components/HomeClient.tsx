/**
 * apps/web/src/app/page.tsx
 * nummyGo platform landing page — animated with aurora orbs, ember particles,
 * scrolling ticker, animated SVG cards and bento features grid.
 */
'use client';

import { useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import VendorSearchBar from '@/components/VendorSearchBar';
import AnimatedCustomerCard from '@/components/AnimatedCustomerCard';
import RestaurantBentoFeatures from '@/components/RestaurantBentoFeatures';
import { GradientButton, GradientDivider, SectionLabel } from '@/components/ui';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Tenant } from '@nummygo/shared/models';

/* ─── Static data ───────────────────────────────────────────── */

const CUSTOMER_BENEFITS = [
  {
    icon: 'rocket' as const,
    label: 'Instant Access',
    title: 'Order in Seconds, Not Minutes',
    body: 'Browse the full menu, build your cart, and place your order without creating an account or downloading an app. Great food is just a few taps away.',
    accent: 'amber' as const,
    delay: 0,
  },
  {
    icon: 'pot' as const,
    label: 'Freshly Prepared',
    title: 'Discover Your Neighbourhood Kitchen',
    body: 'Every restaurant on nummyGo is a real local kitchen — not a ghost brand. Find the hidden gems your neighbours already love, one plate at a time.',
    accent: 'amber' as const,
    delay: 100,
  },
  {
    icon: 'tracker' as const,
    label: 'Live Tracking',
    title: 'Know Exactly Where Your Order Is',
    body: 'From the moment you checkout to the second your food arrives, real-time status updates keep you in the loop — no guessing, no refreshing.',
    accent: 'amber' as const,
    delay: 200,
  },
] as const;

const TICKER_NAMES: string[] = [
  '🔥 Spice Garden', '🍔 The Burger Joint', '🍣 Sakura Sushi', '🍝 Trattoria Milano',
  '🌮 El Fuego', '🍛 Bombay Palace', '🥗 The Green Bowl', '🍕 Napoli Express',
  '🍜 Pho 888', '🥩 Prime Cuts', '🧆 Falafel King', '🍱 Bento Box',
  '🥘 Authentic Dhakaiya', '🍲 Deshi Kitchen',
];

const POPULAR_NEAR_ME: Pick<Tenant, 'name' | 'slug'>[] = [
  { name: 'Authentic Dhakaiya', slug: 'authentic-dhakaiya' },
  { name: 'Deshi Kitchen', slug: 'deshi-kitchen' },
];

/* ─── Ember particle hook ───────────────────────────────────── */

function useEmbers(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const NUM = 45;
    const particles: HTMLDivElement[] = [];
    const colors = ['#f59e0b', '#ea580c', '#fbbf24', '#fb923c'];

    for (let i = 0; i < NUM; i++) {
      const el = document.createElement('div');
      const size = 2 + Math.random() * 3;
      const left = Math.random() * 100;
      const drift = (Math.random() - 0.5) * 70;
      const dur = 2.5 + Math.random() * 3.5;
      const delay = Math.random() * 5;
      const color = colors[Math.floor(Math.random() * colors.length)];

      el.style.cssText = `
        position:absolute; bottom:0; border-radius:50%; pointer-events:none;
        width:${size}px; height:${size}px; background:${color};
        box-shadow:0 0 ${size * 2}px ${color};
        left:${left}%;
        animation: nummyEmberRise ${dur}s ${delay}s ease-out infinite;
        --ember-drift: ${drift}px;
        opacity: 0;
      `;
      container.appendChild(el);
      particles.push(el);
    }
    return () => particles.forEach(p => p.remove());
  }, [containerRef]);
}

/* ─── Scroll-reveal hook ────────────────────────────────────── */

function useScrollReveal(selector: string) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = '1';
          (entry.target as HTMLElement).style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [selector]);
}

/* ─── Page ──────────────────────────────────────────────────── */

export default function PlatformHome() {
  const emberRef = useRef<HTMLDivElement>(null);
  useEmbers(emberRef);
  useScrollReveal('[data-reveal]');

  return (
    <>
      {/* Global keyframes */}
      <style>{`
        @keyframes nummyEmberRise {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.9; }
          70%  { opacity: 0.4; }
          100% { transform: translateY(-220px) translateX(var(--ember-drift)) scale(0.15); opacity: 0; }
        }
        @keyframes nummyOrbDrift1 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(70px,55px) scale(1.12); }
        }
        @keyframes nummyOrbDrift2 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(-55px,-70px) scale(1.08); }
        }
        @keyframes nummyOrbDrift3 {
          0%   { transform: translate(-50%,-50%) scale(1); }
          50%  { transform: translate(-44%,-56%) scale(1.18); }
          100% { transform: translate(-56%,-44%) scale(0.88); }
        }
        @keyframes nummyTicker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes nummyShimmer {
          0%   { left: -100%; }
          100% { left: 160%; }
        }
        @keyframes nummyFlamePulse {
          0%,100% { transform: scale(1); filter: drop-shadow(0 0 3px #f59e0b88); }
          50%     { transform: scale(1.18); filter: drop-shadow(0 0 10px #f59e0bcc); }
        }
        .nummy-orb-1 { animation: nummyOrbDrift1 13s ease-in-out infinite alternate; }
        .nummy-orb-2 { animation: nummyOrbDrift2 16s ease-in-out infinite alternate; }
        .nummy-orb-3 { animation: nummyOrbDrift3 11s ease-in-out infinite alternate; }
        .nummy-ticker-inner { animation: nummyTicker 32s linear infinite; }
        .nummy-ticker-inner:hover { animation-play-state: paused; }
        .nummy-search-shimmer { position: relative; overflow: hidden; }
        .nummy-search-shimmer::before {
          content:''; position:absolute; top:0; left:-100%; width:55%; height:100%;
          background: linear-gradient(90deg, transparent, rgba(245,158,11,0.1), transparent);
          animation: nummyShimmer 3.5s ease-in-out infinite;
          border-radius: 9999px; pointer-events: none; z-index: 10;
        }
        .nummy-flame-logo { animation: nummyFlamePulse 2.2s ease-in-out infinite; display: inline-block; }
        [data-reveal] { opacity: 0; transform: translateY(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
      `}</style>

      <Navbar />

      <main>
        {/* ══════════════════════════════════════════════
            HERO — Aurora + Embers + Shimmer search
        ══════════════════════════════════════════════ */}
        <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
          {/* Aurora orbs */}
          <div className="nummy-orb-1 absolute rounded-full pointer-events-none"
            style={{ width: 700, height: 700, top: '-18%', left: '-12%', background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)', filter: 'blur(90px)', opacity: 0.7 }}
            aria-hidden="true" />
          <div className="nummy-orb-2 absolute rounded-full pointer-events-none"
            style={{ width: 650, height: 650, bottom: '-20%', right: '-14%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', filter: 'blur(90px)', opacity: 0.65 }}
            aria-hidden="true" />
          <div className="nummy-orb-3 absolute rounded-full pointer-events-none"
            style={{ width: 400, height: 400, top: '50%', left: '50%', background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.5 }}
            aria-hidden="true" />

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)', backgroundSize: '50px 50px' }}
            aria-hidden="true" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 pt-40">
            <div className="flex flex-col items-center text-center gap-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
                Local Food, Delivered Fast
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] tracking-tight max-w-5xl break-words">
                Find Your{' '}
                <span className="gradient-text">Neighbourhood</span>
                <br />
                Restaurant
              </h1>

              {/* Subheadline */}
              <p className="text-slate-400 text-lg sm:text-xl max-w-xl leading-relaxed">
                Freshly prepared meals from local restaurants, delivered to your door or
                ready for pickup. Discover what&apos;s cooking near you.
              </p>

              {/* Search with shimmer */}
              <div className="nummy-search-shimmer w-full max-w-2xl rounded-full">
                <VendorSearchBar size="large" placeholder="Search for a restaurant near you…" />
              </div>

              {/* Popular links */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
                <span>Popular near you:</span>
                {POPULAR_NEAR_ME.map((v) => (
                  <Link key={v.slug} href={`/${v.slug}`}
                    className="text-amber-400/70 hover:text-amber-400 transition-colors underline-offset-2 hover:underline">
                    {v.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Ember particles */}
          <div ref={emberRef} className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(245,158,11,0.04), transparent)' }}
            aria-hidden="true" />

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #0D1117)' }}
            aria-hidden="true" />
        </section>

        {/* ══════════════════════════════════════════════
            TICKER STRIP
        ══════════════════════════════════════════════ */}
        <div className="relative overflow-hidden border-y"
          style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)', padding: '13px 0' }}>
          <div className="absolute top-0 left-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #0D1117, transparent)' }} />
          <div className="absolute top-0 right-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #0D1117, transparent)' }} />
          <div className="nummy-ticker-inner flex w-max" aria-hidden="true">
            {[...TICKER_NAMES, ...TICKER_NAMES].map((name, i) => (
              <div key={i} className="inline-flex items-center gap-2 px-8 text-[13px] font-semibold text-slate-500 whitespace-nowrap">
                {name}
                <span className="w-1 h-1 rounded-full bg-amber-500/40 inline-block" />
              </div>
            ))}
          </div>
        </div>

        <GradientDivider accent="amber" />

        {/* ══════════════════════════════════════════════
            CUSTOMER BENEFITS — Animated icon cards
        ══════════════════════════════════════════════ */}
        <section id="customer-benefits" className="relative py-28 px-4 sm:px-6 lg:px-8">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }}
            aria-hidden="true" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16" data-reveal>
              <SectionLabel className="mb-3">For Customers</SectionLabel>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-100">
                Eat Well, <span className="gradient-text">Every Day</span>
              </h2>
              <p className="text-slate-500 mt-3 text-base max-w-lg mx-auto">
                From first craving to last bite — we&apos;ve made the whole experience effortless, delightful, and deeply local.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {CUSTOMER_BENEFITS.map((b) => (
                <AnimatedCustomerCard key={b.title} {...b} />
              ))}
            </div>
          </div>
        </section>

        <GradientDivider accent="indigo" />

        {/* ══════════════════════════════════════════════
            RESTAURANT BENTO FEATURES
        ══════════════════════════════════════════════ */}
        <section id="vendor-benefits" className="relative py-28 px-4 sm:px-6 lg:px-8">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', filter: 'blur(50px)' }}
            aria-hidden="true" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16" data-reveal>
              <SectionLabel className="mb-3">For Restaurants</SectionLabel>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-100">
                Everything Your Kitchen{' '}
                <span style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Actually Needs
                </span>
              </h2>
              <p className="text-slate-500 mt-3 text-base max-w-lg mx-auto">
                One platform to run, grow, and showcase your restaurant — without the complexity, the middlemen, or the upfront cost.
              </p>
            </div>

            <RestaurantBentoFeatures />

            {/* CTA */}
            <div className="text-center mt-16" data-reveal>
              <Link href="/tenant/login">
                <GradientButton className="text-base px-10 py-4">
                  Open Your Kitchen on nummyGo
                  <ArrowRight size={18} aria-hidden="true" />
                </GradientButton>
              </Link>
              <p className="text-slate-600 text-sm mt-4">
                Free to start · No upfront fees · Your storefront live in minutes
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════ */}
        <footer className="py-10 px-4 text-center border-t border-white/5">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()}&nbsp;
            <span className="gradient-text font-semibold">
              <span className="nummy-flame-logo">🔥</span> nummyGo
            </span>
            &nbsp;· Built with ❤️ for local restaurants
          </p>
        </footer>
      </main>
    </>
  );
}
