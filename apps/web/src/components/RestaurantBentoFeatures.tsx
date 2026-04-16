'use client';

import { useTheme } from '@/lib/themes';

/* ═══════════════════════════════════════════════════
   Animated SVG Icons — Kitchen / restaurant themed
═══════════════════════════════════════════════════ */

function WokIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <style>{`
        .wok-flame-1 { animation: wokFlicker 0.35s 0s ease-in-out infinite alternate; transform-origin: 26px 40px; }
        .wok-flame-2 { animation: wokFlicker 0.3s 0.1s ease-in-out infinite alternate; transform-origin: 26px 38px; }
        .wok-steam   { animation: wokSteam 1.8s ease-in-out infinite; }
        .wok-food    { animation: wokBubble 1.2s ease-in-out infinite alternate; }
        @keyframes wokFlicker {
          0%   { transform: scaleY(1) scaleX(0.95); }
          100% { transform: scaleY(1.25) scaleX(1.08); }
        }
        @keyframes wokSteam {
          0%   { opacity:0; transform: translateY(0) scaleX(1); }
          40%  { opacity: 0.5; }
          100% { opacity:0; transform: translateY(-12px) scaleX(1.6); }
        }
        @keyframes wokBubble {
          0%   { transform: scale(1); }
          100% { transform: scale(1.05); }
        }
      `}</style>
      {/* Flames */}
      <ellipse className="wok-flame-1" cx="26" cy="42" rx="7" ry="5" fill="#ea580c" opacity="0.9" />
      <ellipse className="wok-flame-2" cx="26" cy="40" rx="4" ry="3.5" fill="#fbbf24" opacity="0.95" />

      {/* Wok body */}
      <path d="M10 28 Q10 40 26 40 Q42 40 42 28" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
      <path d="M8 26 Q8 16 26 16 Q44 16 44 26" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
      <ellipse cx="26" cy="26" rx="18" ry="10" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

      {/* Food */}
      <g className="wok-food">
        <circle cx="21" cy="24" r="2.5" fill="#f97316" opacity="0.9" />
        <circle cx="27" cy="22" r="2" fill="#84cc16" opacity="0.85" />
        <circle cx="31" cy="25" r="2.5" fill="#f59e0b" opacity="0.9" />
        <circle cx="24" cy="27" r="1.5" fill="#ef4444" opacity="0.8" />
      </g>

      {/* Handle */}
      <path d="M42 24 L50 20" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 24 L4 28" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />

      {/* Steam */}
      <path className="wok-steam" d="M22 16 Q21 10 22 4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path className="wok-steam" d="M30 14 Q29 8 30 2" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" fill="none" style={{ animationDelay: '0.6s' }} />
    </svg>
  );
}

function ChefHatIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <style>{`
        .chef-hat { animation: chefBounce 3s ease-in-out infinite; transform-origin: 26px 30px; }
        .chef-star-1 { animation: chefSparkle 2s 0s ease-in-out infinite; }
        .chef-star-2 { animation: chefSparkle 2s 0.5s ease-in-out infinite; }
        .chef-star-3 { animation: chefSparkle 2s 1s ease-in-out infinite; }
        @keyframes chefBounce {
          0%,100% { transform: rotate(-2deg) translateY(0); }
          50%     { transform: rotate(2deg) translateY(-3px); }
        }
        @keyframes chefSparkle {
          0%,100% { opacity:0; transform: scale(0); }
          50%     { opacity:1; transform: scale(1); }
        }
      `}</style>
      <g className="chef-hat">
        {/* Hat brim */}
        <rect x="12" y="32" width="28" height="6" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
        {/* Hat body */}
        <path d="M16 32 Q14 20 26 16 Q38 20 36 32Z" fill="white" stroke="#e2e8f0" strokeWidth="1" />
        {/* Cloud puff shape */}
        <ellipse cx="26" cy="18" rx="8" ry="7" fill="white" stroke="#e2e8f0" strokeWidth="1" />
        <ellipse cx="18" cy="22" rx="5" ry="5" fill="white" stroke="#e2e8f0" strokeWidth="1" />
        <ellipse cx="34" cy="22" rx="5" ry="5" fill="white" stroke="#e2e8f0" strokeWidth="1" />
        {/* Hat stripe */}
        <rect x="12" y="29" width="28" height="3" rx="0" fill="#f59e0b" opacity="0.4" />
        {/* Pleat lines */}
        <path d="M22 32 V20" stroke="#e2e8f0" strokeWidth="0.75" opacity="0.6" />
        <path d="M26 32 V16" stroke="#e2e8f0" strokeWidth="0.75" opacity="0.6" />
        <path d="M30 32 V20" stroke="#e2e8f0" strokeWidth="0.75" opacity="0.6" />
      </g>
      {/* Sparkles */}
      <path className="chef-star-1" d="M8 14 L9 11 L10 14 L13 15 L10 16 L9 19 L8 16 L5 15Z" fill="#fbbf24" />
      <path className="chef-star-2" d="M42 10 L43 8 L44 10 L46 11 L44 12 L43 14 L42 12 L40 11Z" fill="#f59e0b" />
      <path className="chef-star-3" d="M40 38 L41 36 L42 38 L44 39 L42 40 L41 42 L40 40 L38 39Z" fill="#fbbf24" opacity="0.7" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <style>{`
        .dash-bar-1 { animation: dashBar 2s 0s ease-in-out infinite alternate; transform-origin: bottom; }
        .dash-bar-2 { animation: dashBar 2s 0.3s ease-in-out infinite alternate; transform-origin: bottom; }
        .dash-bar-3 { animation: dashBar 2s 0.6s ease-in-out infinite alternate; transform-origin: bottom; }
        .dash-ping  { animation: dashPing 1.5s ease-out infinite; }
        @keyframes dashBar {
          0%   { transform: scaleY(0.6); }
          100% { transform: scaleY(1); }
        }
        @keyframes dashPing {
          0%   { r: 3; opacity: 1; }
          100% { r: 9; opacity: 0; }
        }
      `}</style>
      {/* Card bg */}
      <rect x="4" y="8" width="44" height="36" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
      {/* Header row */}
      <rect x="8" y="12" width="20" height="4" rx="2" fill="#1e293b" />
      <circle className="dash-ping" cx="42" cy="14" r="3" fill="#f59e0b" />
      <circle cx="42" cy="14" r="3" fill="#f59e0b" />
      {/* Bars */}
      <rect className="dash-bar-1" x="11" y="24" width="6" height="14" rx="2" fill="#f59e0b" />
      <rect className="dash-bar-2" x="22" y="20" width="6" height="18" rx="2" fill="#6366f1" />
      <rect className="dash-bar-3" x="33" y="28" width="6" height="10" rx="2" fill="#f97316" />
      {/* X axis */}
      <line x1="8" y1="38" x2="44" y2="38" stroke="#334155" strokeWidth="1" />
    </svg>
  );
}

function StorefrontIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <style>{`
        .store-sign { animation: storeSignGlow 2s ease-in-out infinite alternate; }
        .store-open { animation: storeOpen 3s ease-in-out infinite; }
        @keyframes storeSignGlow {
          0%   { filter: drop-shadow(0 0 3px #f59e0b66); }
          100% { filter: drop-shadow(0 0 10px #f59e0bcc); }
        }
        @keyframes storeOpen {
          0%,100% { transform-origin:left; transform: perspective(60px) rotateY(0deg); }
          50%     { transform-origin:left; transform: perspective(60px) rotateY(-25deg); }
        }
      `}</style>
      {/* Building */}
      <rect x="8" y="16" width="36" height="28" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
      {/* Roof */}
      <path d="M5 18 L26 6 L47 18Z" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
      {/* Awning */}
      <rect x="10" y="16" width="32" height="6" rx="0" fill="#f59e0b" opacity="0.85" />
      <path d="M10 22 Q14 26 18 22 Q22 26 26 22 Q30 26 34 22 Q38 26 42 22" stroke="#ea580c" strokeWidth="1" fill="none" />
      {/* Door */}
      <rect className="store-open" x="20" y="30" width="12" height="14" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1" />
      <circle cx="29" cy="37" r="1" fill="#f59e0b" />
      {/* Windows */}
      <rect x="10" y="26" width="8" height="7" rx="1" fill="#1e40af" opacity="0.6" stroke="#3b82f6" strokeWidth="0.8" />
      <rect x="34" y="26" width="8" height="7" rx="1" fill="#1e40af" opacity="0.6" stroke="#3b82f6" strokeWidth="0.8" />
      {/* Sign */}
      <rect className="store-sign" x="18" y="8" width="16" height="5" rx="2" fill="#f59e0b" />
      <text x="26" y="12.5" fill="#000" fontSize="4" fontWeight="bold" textAnchor="middle" fontFamily="system-ui">OPEN</text>
    </svg>
  );
}

function GrowthIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <style>{`
        .growth-line { stroke-dasharray: 80; stroke-dashoffset: 80; animation: growthDraw 2s ease-out infinite; }
        .growth-coin { animation: growthCoin 2s ease-in-out infinite; }
        @keyframes growthDraw {
          0%   { stroke-dashoffset: 80; opacity: 0; }
          20%  { opacity: 1; }
          80%  { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.3; }
        }
        @keyframes growthCoin {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%     { transform: translateY(-6px) rotate(15deg); }
        }
      `}</style>
      {/* Axes */}
      <line x1="8" y1="44" x2="46" y2="44" stroke="#334155" strokeWidth="1.5" />
      <line x1="8" y1="8" x2="8" y2="44" stroke="#334155" strokeWidth="1.5" />
      {/* Grid */}
      <line x1="8" y1="32" x2="46" y2="32" stroke="#1e293b" strokeWidth="1" />
      <line x1="8" y1="20" x2="46" y2="20" stroke="#1e293b" strokeWidth="1" />
      {/* Growth line */}
      <polyline className="growth-line" points="10,42 18,36 24,30 30,22 38,14 44,10" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Area fill */}
      <polygon points="10,44 10,42 18,36 24,30 30,22 38,14 44,10 44,44" fill="url(#growthGrad)" opacity="0.2" />
      <defs>
        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Coin */}
      <g className="growth-coin">
        <circle cx="44" cy="10" r="6" fill="#f59e0b" />
        <text x="44" y="13.5" fill="#000" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="system-ui">$</text>
      </g>
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <style>{`
        .globe-spin-y { animation: spinY 8s linear infinite; transform-origin: 26px 26px; }
        @keyframes spinY { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
      `}</style>
      <circle cx="26" cy="26" r="22" stroke="#475569" strokeWidth="0.5" fill="none" />
      <circle cx="26" cy="26" r="24" stroke="#334155" strokeWidth="0.5" fill="none" />
      <g className="globe-spin-y">
        <circle cx="26" cy="26" r="16" stroke="#f1f5f9" strokeWidth="1.5" fill="none" />
        <ellipse cx="26" cy="26" rx="8" ry="16" stroke="#f1f5f9" strokeWidth="1" fill="none" />
        <ellipse cx="26" cy="26" rx="16" ry="6" stroke="#f1f5f9" strokeWidth="1" fill="none" />
        <line x1="26" y1="10" x2="26" y2="42" stroke="#f1f5f9" strokeWidth="1" />
      </g>
    </svg>
  );
}

function GlobeBackground() {
  return (
    <div className="absolute -right-12 sm:right-[-10%] top-[-25%] bottom-[-25%] w-[250px] sm:w-[450px] pointer-events-none opacity-[0.35] mix-blend-screen overflow-hidden z-0">
      <div className="absolute inset-0 rounded-full overflow-hidden"
        style={{ maskImage: 'radial-gradient(ellipse at center, white 55%, transparent 72%)', WebkitMaskImage: 'radial-gradient(ellipse at center, white 55%, transparent 72%)' }}>
        <div className="absolute inset-[-100%] globe-spin-bg" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0',
        }}></div>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 35% 35%, transparent 0%, rgba(19,25,31,0.85) 65%, rgba(19,25,31,1) 100%)'
        }}></div>
      </div>
      <style>{`
        @keyframes slowSpin { 0% { transform: rotate(0deg) scale(1.1); } 100% { transform: rotate(360deg) scale(1.2); } }
        .globe-spin-bg { animation: slowSpin 60s linear infinite; }
      `}</style>
    </div>
  );
}

/* ─── Bento card variants ───────────────────────────────────── */

interface BentoCardProps {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: React.ReactNode;
  size?: 'default' | 'wide' | 'tall';
  accentColor?: string;
  delay?: number;
  backgroundGraphic?: React.ReactNode;
}

function BentoCard({ icon, eyebrow, title, body, size = 'default', accentColor = '#f59e0b', delay = 0, backgroundGraphic }: BentoCardProps) {
  const isWide = size === 'wide';
  const isTall = size === 'tall';
  const { theme } = useTheme();

  return (
    <div
      data-reveal
      style={{
        transitionDelay: `${delay}ms`,
        background: theme.card.bg,
        border: `1px solid ${theme.card.border}`,
        backdropFilter: 'blur(20px)',
        boxShadow: theme.card.shadow,
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
      } as React.CSSProperties}
      className={`group relative rounded-2xl overflow-hidden cursor-default flex flex-col justify-center gap-4 ${isWide ? 'md:col-span-2' : 'md:col-span-1'} ${isTall ? 'md:row-span-2 p-6 md:p-10' : 'md:row-span-1 p-6 md:p-7'}`}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = `${accentColor}40`;
        el.style.transform = 'translateY(-4px)';
        el.style.boxShadow = theme.card.hoverShadow;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = theme.card.border;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = theme.card.shadow;
      }}
    >
      {/* Background Graphic */}
      {backgroundGraphic}

      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
        style={{ background: `radial-gradient(ellipse at top left, ${accentColor}12, transparent 70%)` }}
        aria-hidden="true"
      />
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-8 right-8 h-[1px] pointer-events-none z-0"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}44, transparent)` }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div className="relative z-10 flex-shrink-0">{icon}</div>

      {/* Text */}
      <div className="relative z-10 flex flex-col gap-2 max-w-[85%] sm:max-w-md">
        <p className="text-[10px] font-bold uppercase tracking-[2.5px]" style={{ color: accentColor }}>
          {eyebrow}
        </p>
        <h3 className={`font-black leading-tight ${isTall ? 'text-2xl' : 'text-xl'}`} style={{ color: theme.text.primary }}>
          {title}
        </h3>
        <div className={`leading-relaxed ${isTall ? 'text-[15px]' : 'text-sm'}`} style={{ color: theme.text.secondary }}>
          {body}
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────── */

export default function RestaurantBentoFeatures() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3 md:auto-rows-[200px]">
      {/* 1 — Wide: Dashboard */}
      <BentoCard
        size="wide"
        icon={<DashboardIcon />}
        eyebrow="Order Management"
        title="Your Kitchen Command Centre"
        body="Accept, prep, decline, and close orders in a single real-time dashboard. Instant WebSocket pushes mean zero refresh required — the kitchen stays in sync, always."
        accentColor="#f59e0b"
        delay={0}
      />

      {/* 2 — Tall: Chef / Menu */}
      <BentoCard
        size="tall"
        icon={<ChefHatIcon />}
        eyebrow="Menu Builder"
        title="Build a Menu That Sells"
        body="Add dishes, assign categories, attach photos, and publish price changes in seconds. Your storefront reflects every update instantly — no cache-busting needed."
        accentColor="#818cf8"
        delay={100}
      />

      {/* 3 — Default: Storefront */}
      <BentoCard
        icon={<StorefrontIcon />}
        eyebrow="Branded Storefront"
        title="Your Own Digital Front Door"
        body="A stunning, mobile-first storefront at nummygo.com/your-name — live in minutes, with your branding, menu, and business hours."
        accentColor="#f59e0b"
        delay={200}
      />

      {/* 4 — Default: Flexible Pricing */}
      <BentoCard
        icon={<WokIcon />}
        eyebrow="Made For Your Kitchen"
        title="Grow At Your Own Pace"
        body="Start small with a digital menu, or track live orders from day one. Mix and match only what you need, without expensive contracts."
        accentColor="#ea580c"
        delay={300}
      />

      {/* 5 — Default: Growth */}
      <BentoCard
        icon={<GrowthIcon />}
        eyebrow="Business Growth"
        title="Unrivaled Local Discovery"
        body="Position your restaurant directly in front of highly-engaged, local diners actively seeking authentic culinary experiences in your exact neighborhood."
        accentColor="#f59e0b"
        delay={400}
      />

      {/* 6 — Wide: Global / Cloud Access with Spinning Globe Background */}
      <BentoCard
        size="wide"
        icon={<GlobeIcon />}
        backgroundGraphic={<GlobeBackground />}
        eyebrow="Access Anywhere"
        title="Unrestricted Global Mobility"
        body="Monitor kitchen operations, adapt to sudden inventory changes, and review performance metrics securely from any device, ensuring total operational control from anywhere in the world."
        accentColor="#f8fafc"
        delay={500}
      />
    </div>
  );
}
