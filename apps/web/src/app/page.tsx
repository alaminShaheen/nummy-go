'use client';

import Image from 'next/image';
import Link from 'next/link';
import PlatformNavbar from '@/components/PlatformNavbar';
import VendorSearchBar from '@/components/VendorSearchBar';
import BenefitCard from '@/components/BenefitCard';

/* ─── Benefit data ──────────────────────────────── */

const CUSTOMER_BENEFITS = [
  {
    icon: '🍽️',
    title: 'Browse Local Menus',
    description: 'Discover hidden gems and local favourites near you. Explore curated menus from top-rated vendors in your neighbourhood.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Order Tracking',
    description: 'Know exactly where your order is — from kitchen to your doorstep. Get live updates at every stage.',
  },
  {
    icon: '🚀',
    title: 'Fast Pickup & Delivery',
    description: 'Skip the wait. Place your order online and pick it up in minutes, or have it delivered fast.',
  },
];

const VENDOR_BENEFITS = [
  {
    icon: '🏪',
    title: 'Free Online Storefront',
    description: 'Get your restaurant online in minutes. Beautiful, mobile-ready menu pages — no design skills needed.',
    accent: 'indigo' as const,
  },
  {
    icon: '📋',
    title: 'Order Management Dashboard',
    description: 'Accept, manage, and track orders in real time. Streamline your kitchen workflow effortlessly.',
    accent: 'indigo' as const,
  },
  {
    icon: '📊',
    title: 'Business Analytics',
    description: 'Understand your customers with powerful insights. Track sales, popular items, and peak hours.',
    accent: 'indigo' as const,
  },
];

/* ─── Page ──────────────────────────────────────── */

export default function PlatformLandingPage() {
  return (
    <>
      <PlatformNavbar />

      <main>
        {/* ── Hero ────────────────────────────── */}
        <section
          id="hero"
          className="relative min-h-screen flex items-center overflow-hidden"
        >
          {/* Ambient glow blobs */}
          <div
            className="glow-amber animate-pulse-glow"
            style={{ top: '-10%', left: '-5%' }}
            aria-hidden="true"
          />
          <div
            className="glow-indigo animate-pulse-glow"
            style={{ bottom: '5%', right: '-5%', animationDelay: '1.5s' }}
            aria-hidden="true"
          />

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 pt-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Copy */}
              <div className="flex flex-col gap-6">
                {/* Platform badge */}
                <div className="inline-flex w-fit items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-xs font-semibold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" aria-hidden="true" />
                  Food Ordering Platform
                </div>

                {/* Headline */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                  Discover{' '}
                  <span className="gradient-text">Local</span>
                  <br />
                  Restaurants,
                  <br />
                  <span className="text-slate-200">Order Instantly.</span>
                </h1>

                {/* Sub-text */}
                <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                  NummyGo connects food lovers with the best local vendors.
                  Search, order, and enjoy — all in one place.
                </p>

                {/* Search bar */}
                <VendorSearchBar
                  size="large"
                  placeholder="Search for restaurants by name…"
                  className="max-w-lg"
                />

                {/* Quick stats */}
                <div className="flex gap-8 pt-4 border-t border-white/5">
                  {[
                    { label: 'Vendors', value: '50+' },
                    { label: 'Orders Placed', value: '10k+' },
                    { label: 'Avg. Delivery', value: '25 min' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-2xl font-black gradient-text">{value}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Hero image collage */}
              <div className="relative hidden lg:flex justify-center items-center">
                {/* Outer glow ring */}
                <div
                  className="absolute w-80 h-80 rounded-full animate-pulse-glow"
                  style={{
                    background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)',
                    filter: 'blur(30px)',
                  }}
                  aria-hidden="true"
                />

                {/* Main large card */}
                <div className="gradient-border-card relative w-72 h-72 overflow-hidden shadow-2xl shadow-amber-900/30 animate-float">
                  <Image
                    src="/images/burger.png"
                    alt="Delicious burger from a local vendor"
                    fill
                    className="object-cover"
                    sizes="288px"
                    priority
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)',
                    }}
                    aria-hidden="true"
                  />
                </div>

                {/* Floating mini card 1 */}
                <div
                  className="gradient-border-card absolute -top-6 -right-4 w-36 h-36 overflow-hidden shadow-xl shadow-indigo-900/30 animate-float-delayed"
                >
                  <Image
                    src="/images/pasta.png"
                    alt="Fresh pasta dish"
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)' }}
                    aria-hidden="true"
                  />
                </div>

                {/* Floating mini card 2 */}
                <div
                  className="gradient-border-card absolute -bottom-4 -left-6 w-32 h-32 overflow-hidden shadow-xl shadow-indigo-900/30 animate-float"
                  style={{ animationDelay: '2s' }}
                >
                  <Image
                    src="/images/dessert.png"
                    alt="Chocolate dessert"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)' }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32"
            style={{ background: 'linear-gradient(to bottom, transparent, #0D1117)' }}
            aria-hidden="true"
          />
        </section>

        {/* ── Divider ─────────────────────────── */}
        <div
          className="h-px mx-auto max-w-5xl"
          style={{ background: 'linear-gradient(to right, transparent, rgba(251,191,36,0.3), transparent)' }}
          aria-hidden="true"
        />

        {/* ── Customer Benefits ───────────────── */}
        <section id="customer-benefits" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
              For Customers
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100">
              Why <span className="gradient-text">Order</span> with NummyGo?
            </h2>
            <p className="text-slate-500 mt-3 max-w-md mx-auto">
              The simplest way to discover and order from restaurants near you.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CUSTOMER_BENEFITS.map((benefit, i) => (
              <BenefitCard
                key={benefit.title}
                {...benefit}
                accent="amber"
                delay={i * 120}
              />
            ))}
          </div>
        </section>

        {/* ── Divider ─────────────────────────── */}
        <div
          className="h-px mx-auto max-w-5xl"
          style={{ background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.2), transparent)' }}
          aria-hidden="true"
        />

        {/* ── Vendor Benefits ─────────────────── */}
        <section id="vendor-benefits" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4">
              For Vendors
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100">
              Grow Your <span className="gradient-text">Restaurant</span> Online
            </h2>
            <p className="text-slate-500 mt-3 max-w-md mx-auto">
              Everything you need to bring your kitchen online and reach more customers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VENDOR_BENEFITS.map((benefit, i) => (
              <BenefitCard
                key={benefit.title}
                {...benefit}
                delay={i * 120}
              />
            ))}
          </div>
        </section>

        {/* ── Divider ─────────────────────────── */}
        <div
          className="h-px mx-auto max-w-5xl"
          style={{ background: 'linear-gradient(to right, transparent, rgba(251,191,36,0.15), transparent)' }}
          aria-hidden="true"
        />

        {/* ── CTA Section ─────────────────────── */}
        <section id="cta" className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full animate-pulse-glow"
            style={{
              background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl font-black mb-4">
              Ready to <span className="gradient-text">Get Started?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
              Whether you&apos;re hungry or want to grow your restaurant — NummyGo has you covered.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/vendor/login"
                id="cta-vendor-signup"
                className="
                  inline-flex items-center gap-2
                  px-8 py-4 rounded-full
                  bg-gradient-to-r from-amber-500 to-orange-600
                  text-white font-bold text-base
                  shadow-lg shadow-orange-900/40
                  hover:shadow-xl hover:shadow-orange-900/60
                  hover:scale-105
                  transition-all duration-200
                "
              >
                Start Your Free Vendor Profile
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>

            <p className="text-slate-600 text-sm mt-6">
              Looking for food? Use the search bar above to find vendors near you.
            </p>
          </div>
        </section>

        {/* ── Footer ──────────────────────────── */}
        <footer className="py-10 px-4 text-center border-t border-white/5">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()}&nbsp;
            <span className="gradient-text font-semibold">nummyGo</span>
            &nbsp;· Built with ❤️ for local restaurants
          </p>
        </footer>
      </main>
    </>
  );
}
