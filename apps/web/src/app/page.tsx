/**
 * apps/web/src/app/page.tsx
 * NummyGo platform landing page — the root "/" route.
 */
import PlatformNavbar from '@/components/PlatformNavbar';
import VendorSearchBar from '@/components/VendorSearchBar';
import BenefitCard from '@/components/BenefitCard';
import { SectionLabel, GradientButton, GradientDivider } from '@/components/ui';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CUSTOMER_BENEFITS = [
  {
    icon: '🚀',
    title: 'Order in Seconds',
    description: 'Browse local restaurants, add to cart, and place your order — all without creating an account.',
    accent: 'amber' as const,
    delay: 0,
  },
  {
    icon: '🍽️',
    title: 'Local Favourites',
    description: 'Discover hidden gems in your neighbourhood serving freshly prepared meals every day.',
    accent: 'amber' as const,
    delay: 100,
  },
  {
    icon: '⚡',
    title: 'Real-Time Updates',
    description: 'Track your order status live — from kitchen to your door, every step of the way.',
    accent: 'amber' as const,
    delay: 200,
  },
];

const VENDOR_BENEFITS = [
  {
    icon: '📊',
    title: 'Manage Orders',
    description: 'Accept, prepare, and track all your orders in one clean dashboard built for kitchens.',
    accent: 'indigo' as const,
    delay: 0,
  },
  {
    icon: '🏪',
    title: 'Your Own Storefront',
    description: 'Get a beautiful, branded page at nummygo.com/your-name — ready in minutes.',
    accent: 'indigo' as const,
    delay: 100,
  },
  {
    icon: '📈',
    title: 'Grow Your Business',
    description: 'Reach new customers in your area with zero upfront cost. Only pay when you earn.',
    accent: 'indigo' as const,
    delay: 200,
  },
];

export default function PlatformHome() {
  return (
    <>
      <PlatformNavbar />

      <main>
        {/* ── Hero ─────────────────────────────────── */}
        <section
          id="hero"
          className="relative min-h-screen flex items-center overflow-hidden"
        >
          {/* Ambient glow blobs */}
          <div className="glow-amber" style={{ top: '-10%', left: '-5%' }} aria-hidden="true" />
          <div className="glow-indigo" style={{ bottom: '5%', right: '-5%' }} aria-hidden="true" />

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

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 pt-36">
            <div className="flex flex-col items-center text-center gap-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
                Local Food, Delivered Fast
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight max-w-4xl">
                Find Your{' '}
                <span className="gradient-text">Neighbourhood</span>
                <br />
                Restaurant
              </h1>

              {/* Sub-text */}
              <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
                Freshly prepared meals from local restaurants, delivered to your door or
                ready for pickup. Discover what&apos;s cooking near you.
              </p>

              {/* Search bar */}
              <div className="w-full max-w-2xl">
                <VendorSearchBar size="large" placeholder="Search for a restaurant near you…" />
              </div>

              {/* Quick links */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
                <span>Popular near you:</span>
                {['the-golden-fork', 'sushi-express', 'pizza-palace'].map((slug) => (
                  <Link
                    key={slug}
                    href={`/${slug}`}
                    className="text-amber-400/80 hover:text-amber-400 transition-colors"
                  >
                    {slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-40"
            style={{ background: 'linear-gradient(to bottom, transparent, #0D1117)' }}
            aria-hidden="true"
          />
        </section>

        <GradientDivider accent="amber" />

        {/* ── Customer Benefits ────────────────── */}
        <section id="customer-benefits" className="relative py-24 px-4 sm:px-6 lg:px-8">
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            aria-hidden="true"
          />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <SectionLabel className="mb-3">For Customers</SectionLabel>
              <h2 className="text-4xl font-black text-slate-100">
                Eat Well, Every Day
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {CUSTOMER_BENEFITS.map((b) => (
                <BenefitCard key={b.title} {...b} />
              ))}
            </div>
          </div>
        </section>

        <GradientDivider accent="indigo" />

        {/* ── Vendor Benefits ──────────────────── */}
        <section id="vendor-benefits" className="relative py-24 px-4 sm:px-6 lg:px-8">
          <div
            className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            aria-hidden="true"
          />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <SectionLabel className="mb-3">For Restaurants</SectionLabel>
              <h2 className="text-4xl font-black text-slate-100">
                Grow Your Restaurant
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {VENDOR_BENEFITS.map((b) => (
                <BenefitCard key={b.title} {...b} />
              ))}
            </div>

            {/* Vendor CTA */}
            <div className="text-center mt-12">
              <Link href="/tenant/login">
                <GradientButton className="text-base px-8 py-4">
                  Join NummyGo as a Vendor
                  <ArrowRight size={18} aria-hidden="true" />
                </GradientButton>
              </Link>
              <p className="text-slate-500 text-sm mt-4">
                Free to start · No upfront fees · Setup in minutes
              </p>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────── */}
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
