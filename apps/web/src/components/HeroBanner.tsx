import Image from 'next/image';
import Link from 'next/link';
import { GradientButton, GlossButton } from '@/components/ui';
import { ArrowRight, Pencil } from 'lucide-react';

interface HeroBannerProps {
  tenantName: string;
  acceptsOrders: boolean;
  promotionalHeading?: string | null;
  description?: string | null;
  tags?: string[] | null;
  heroImageUrl?: string | null;
  isVendorOwner?: boolean;
}

export default function HeroBanner({
  tenantName,
  acceptsOrders,
  promotionalHeading,
  description,
  tags,
  heroImageUrl,
  isVendorOwner
}: HeroBannerProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-[#0D1117] transition-all duration-300"
      style={{
				backgroundImage: heroImageUrl ? `url(${heroImageUrl})` : undefined,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
			}}
    >
      {/* Background layer mesh locking high fidelity overlay */}
      {heroImageUrl && (
         <div className="absolute inset-0 z-0 bg-[#0D1117]/85" />
      )}
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 pt-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div className={`inline-flex w-fit items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-widest ${
              acceptsOrders 
                ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${acceptsOrders ? 'bg-amber-400 animate-pulse' : 'bg-red-500'}`} aria-hidden="true" />
              {acceptsOrders ? 'Now Taking Orders' : 'Temporarily Closed'}
            </div>

            {/* Overtone Restaurant Name */}
            <span className="block font-semibold uppercase text-indigo-400 tracking-[0.2em] text-sm mt-2">
              {tenantName}
            </span>

            {/* Headline */}
            {promotionalHeading ? (
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white mb-2">
                {promotionalHeading.split(' ').map((word, i, arr) => {
                  // Highlight the middle word (or one of the middle words)
                  const targetIndex = arr.length > 2 ? Math.floor(arr.length / 2) : 1;
                  if (i === targetIndex && arr.length > 1) {
                    return (
                      <span key={i}>
                        <span className="gradient-text">{word}</span>{' '}
                      </span>
                    );
                  }
                  return (
                    <span key={i}>
                      {word}{i !== arr.length - 1 ? ' ' : ''}
                    </span>
                  );
                })}
              </h1>
            ) : (
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-2">
                Your{' '}
                <span className="gradient-text">Neighbourhood</span>
                <br />
                Flavours,
                <br />
                <span className="text-slate-200">Delivered Fast.</span>
              </h1>
            )}

            {/* Sub-text */}
            {description ? (
              <p className="text-slate-300 text-lg max-w-md leading-relaxed border-l-2 border-indigo-500/60 pl-4 py-1">
                {description}
              </p>
            ) : (
              <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                Freshly prepared meals crafted with love by local chefs. Order online,
                pick up in minutes or get it delivered right to your door.
              </p>
            )}

            {/* Tags (if any exist or default to some) */}
            <div className="flex gap-2 flex-wrap pb-1">
               {(tags?.length ? tags : ['🍔 Burgers', '🍝 Pasta', '🍣 Sushi']).map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full text-[12px] bg-white/5 border border-white/10 text-slate-300 backdrop-blur-sm shadow-xl"
                  >
                     {t}
                  </span>
               ))}
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap gap-4 pt-2">
              <GradientButton
                id="hero-cta-menu"
                onClick={() => { document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                Browse Menu
                <ArrowRight size={16} aria-hidden="true" />
              </GradientButton>
              <GlossButton
                id="hero-cta-info"
                onClick={() => { document.getElementById('vendor-info')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                About Us
              </GlossButton>
              {isVendorOwner && (
                <Link
                  href="/tenant/editprofile"
                  id="hero-cta-edit-profile"
                  className="
                    flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm
                    border border-indigo-500/50 text-indigo-300
                    bg-indigo-500/5 hover:bg-indigo-500/15 hover:border-indigo-400 hover:text-indigo-200
                    transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]
                  "
                >
                  <Pencil size={16} aria-hidden="true" />
                  Edit Profile
                </Link>
              )}
            </div>

            {/* Quick stats */}
            <div className="flex gap-8 pt-4 border-t border-white/5">
              {[
                { label: 'Dishes', value: '40+' },
                { label: 'Happy Customers', value: '2k+' },
                { label: 'Avg. Delivery', value: '25 min' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-2xl font-black gradient-text">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Glossy hero image collage */}
          <div className="relative hidden lg:flex justify-center items-center">
            {/* Outer glow ring */}
            <div
              className="absolute w-80 h-80 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)',
                filter: 'blur(30px)',
              }}
              aria-hidden="true"
            />

            {/* Main large card */}
            <div className="gradient-border-card relative w-72 h-72 overflow-hidden shadow-2xl shadow-amber-900/30">
              <Image
                src="/images/burger.png"
                alt="Signature smash burger"
                fill
                className="object-cover"
                sizes="288px"
                priority
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)' }}
                aria-hidden="true"
              />
            </div>

            {/* Floating mini card 1 */}
            <div
              className="gradient-border-card absolute -top-6 -right-4 w-36 h-36 overflow-hidden shadow-xl shadow-indigo-900/30"
              style={{ transform: 'rotate(6deg)' }}
            >
              <Image src="/images/pasta.png" alt="Truffle pasta" fill className="object-cover" sizes="144px" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)' }} aria-hidden="true" />
            </div>

            {/* Floating mini card 2 */}
            <div
              className="gradient-border-card absolute -bottom-4 -left-6 w-32 h-32 overflow-hidden shadow-xl shadow-indigo-900/30"
              style={{ transform: 'rotate(-8deg)' }}
            >
              <Image src="/images/dessert.png" alt="Chocolate lava cake" fill className="object-cover" sizes="128px" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)' }} aria-hidden="true" />
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
  );
}
