'use client';

/* ─── Steaming pot SVG icon ─────────────────────────────────── */
function SteamingPotIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <style>{`
        .pot-steam-1 { animation: potSteam 2s 0s ease-in-out infinite; }
        .pot-steam-2 { animation: potSteam 2s 0.4s ease-in-out infinite; }
        .pot-steam-3 { animation: potSteam 2s 0.8s ease-in-out infinite; }
        @keyframes potSteam {
          0%   { opacity:0; transform: translateY(0) scaleX(1); }
          30%  { opacity:0.7; }
          100% { opacity:0; transform: translateY(-10px) scaleX(1.5); }
        }
        .pot-body { animation: potWobble 3s ease-in-out infinite; }
        @keyframes potWobble {
          0%,100% { transform: rotate(0deg); }
          25%     { transform: rotate(1deg); }
          75%     { transform: rotate(-1deg); }
        }
      `}</style>
      {/* Steam wisps */}
      <g>
        <path className="pot-steam-1" d="M14 12 Q13 9 14 6" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path className="pot-steam-2" d="M20 11 Q19 8 20 5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path className="pot-steam-3" d="M26 12 Q25 9 26 6" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </g>
      {/* Pot body */}
      <g className="pot-body">
        <rect x="8" y="17" width="24" height="16" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
        <rect x="6" y="15" width="28" height="4" rx="2" fill="#334155" stroke="#f59e0b" strokeWidth="1" />
        <path d="M6 15 H34" stroke="#f59e0b" strokeWidth="0.5" opacity="0.4" />
        {/* Handle left */}
        <path d="M8 21 Q3 21 3 25 Q3 29 8 29" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Handle right */}
        <path d="M32 21 Q37 21 37 25 Q37 29 32 29" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Lid knob */}
        <circle cx="20" cy="14" r="2" fill="#f59e0b" />
        {/* Food dots */}
        <circle cx="15" cy="24" r="1.5" fill="#f97316" opacity="0.8" />
        <circle cx="20" cy="26" r="1.5" fill="#ea580c" opacity="0.8" />
        <circle cx="25" cy="23" r="1.5" fill="#f97316" opacity="0.8" />
      </g>
    </svg>
  );
}

/* ─── Rocket icon (animated boost) ─────────────────────────── */
function RocketIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <style>{`
        .rocket-body { animation: rocketLaunch 3s ease-in-out infinite; transform-origin: center; }
        .rocket-flame { animation: rocketFlame 0.25s ease-in-out infinite alternate; transform-origin: top; }
        @keyframes rocketLaunch {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-5px); }
        }
        @keyframes rocketFlame {
          0%   { transform: scaleY(1) scaleX(0.9); opacity: 0.9; }
          100% { transform: scaleY(1.4) scaleX(1.1); opacity: 0.6; }
        }
      `}</style>
      <g className="rocket-body">
        {/* Body */}
        <path d="M20 5 C20 5 30 12 30 22 L20 28 L10 22 C10 12 20 5 20 5Z" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
        {/* Window */}
        <circle cx="20" cy="18" r="4" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
        <circle cx="20" cy="18" r="2" fill="#fbbf24" opacity="0.3" />
        {/* Fins */}
        <path d="M10 22 L5 30 L12 27Z" fill="#475569" stroke="#64748b" strokeWidth="1" />
        <path d="M30 22 L35 30 L28 27Z" fill="#475569" stroke="#64748b" strokeWidth="1" />
        {/* Exhaust */}
        <path className="rocket-flame" d="M16 28 Q20 38 24 28" fill="#f97316" opacity="0.85" />
        <path className="rocket-flame" d="M17.5 28 Q20 34 22.5 28" fill="#fbbf24" opacity="0.9" />
      </g>
    </svg>
  );
}

/* ─── Live pulse tracker icon ───────────────────────────────── */
function LiveTrackerIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <style>{`
        .tracker-ring-1 { animation: trackerPulse 2s 0s ease-out infinite; }
        .tracker-ring-2 { animation: trackerPulse 2s 0.5s ease-out infinite; }
        .tracker-ring-3 { animation: trackerPulse 2s 1s ease-out infinite; }
        .tracker-dot    { animation: trackerBlink 1.2s ease-in-out infinite; }
        @keyframes trackerPulse {
          0%   { r: 6; opacity: 0.8; }
          100% { r: 18; opacity: 0; }
        }
        @keyframes trackerBlink {
          0%,100% { opacity:1; }
          50%     { opacity:0.4; }
        }
      `}</style>
      {/* Background map roads (simplified) */}
      <rect x="4" y="4" width="32" height="32" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
      <path d="M4 20 H36" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M20 4 V36" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M4 12 H16 M24 12 H36" stroke="#1e293b" strokeWidth="1" opacity="0.5" />
      {/* Pulse rings */}
      <circle className="tracker-ring-1" cx="20" cy="20" r="6" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.8" />
      <circle className="tracker-ring-2" cx="20" cy="20" r="6" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.6" />
      <circle className="tracker-ring-3" cx="20" cy="20" r="6" stroke="#f59e0b" strokeWidth="0.8" fill="none" opacity="0.4" />
      {/* Center dot */}
      <circle className="tracker-dot" cx="20" cy="20" r="4" fill="#f59e0b" />
      <circle cx="20" cy="20" r="2" fill="#fbbf24" />
    </svg>
  );
}

/* ─── Props ─────────────────────────────────────────────────── */
interface CustomerCardProps {
  icon: 'rocket' | 'pot' | 'tracker';
  label: string;
  title: string;
  body: string;
  accent: 'amber' | 'indigo';
  delay?: number;
}

const iconMap: Record<CustomerCardProps['icon'], React.ReactNode> = {
  rocket:  <RocketIcon />,
  pot:     <SteamingPotIcon />,
  tracker: <LiveTrackerIcon />,
};

export default function AnimatedCustomerCard({ icon, label, title, body, accent, delay = 0 }: CustomerCardProps) {
  const borderColor = accent === 'amber' ? 'rgba(251,191,36,0.2)' : 'rgba(129,140,248,0.2)';
  const glowColor   = accent === 'amber' ? 'rgba(251,191,36,0.12)' : 'rgba(129,140,248,0.12)';
  const labelColor  = accent === 'amber' ? '#f59e0b' : '#818cf8';

  return (
    <div
      data-reveal
      className="group relative rounded-2xl p-7 overflow-hidden cursor-default"
      style={{
        transitionDelay: `${delay}ms`,
        background: 'rgba(19,25,31,0.7)',
        border: `1px solid rgba(255,255,255,0.06)`,
        backdropFilter: 'blur(16px)',
        transition: 'border-color 0.4s, transform 0.4s, box-shadow 0.4s',
      } as React.CSSProperties}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = borderColor;
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
        (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 48px -12px rgba(0,0,0,0.5)`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Hover glow bg */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${glowColor}, transparent 70%)` }}
        aria-hidden="true"
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-8 right-8 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${labelColor}55, transparent)` }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div className="relative z-10 mb-5">
        {iconMap[icon]}
      </div>

      {/* Label */}
      <p className="relative z-10 text-[10px] font-bold uppercase tracking-[2.5px] mb-2" style={{ color: labelColor }}>
        {label}
      </p>

      {/* Title */}
      <h3 className="relative z-10 text-xl font-black text-slate-100 mb-3 leading-tight">
        {title}
      </h3>

      {/* Body */}
      <p className="relative z-10 text-sm text-slate-400 leading-relaxed">
        {body}
      </p>
    </div>
  );
}
