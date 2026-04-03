interface BenefitCardProps {
  /** Emoji or icon character */
  icon: string;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Accent colour for the icon glow — 'amber' or 'indigo' */
  accent?: 'amber' | 'indigo';
  /** Animation delay in ms for stagger effect */
  delay?: number;
}

export default function BenefitCard({
  icon,
  title,
  description,
  accent = 'amber',
  delay = 0,
}: BenefitCardProps) {
  const glowColor =
    accent === 'amber'
      ? 'rgba(251, 191, 36, 0.15)'
      : 'rgba(129, 140, 248, 0.15)';

  return (
    <div
      className="benefit-card group animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon with glow */}
      <div className="relative mb-4">
        <span className="text-3xl">{icon}</span>
        <div
          className="absolute -inset-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle, ${glowColor}, transparent 70%)` }}
          aria-hidden="true"
        />
      </div>

      <h3 className="text-lg font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
