import Image from 'next/image';

export default function HeroBanner() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Ambient glow blobs */}
      <div
        className="glow-amber"
        style={{ top: '-10%', left: '-5%' }}
        aria-hidden="true"
      />
      <div
        className="glow-indigo"
        style={{ bottom: '5%', right: '-5%' }}
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
            {/* Badge */}
            <div className="inline-flex w-fit items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
              Now Taking Orders
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
              Your{' '}
              <span className="gradient-text">Neighbourhood</span>
              <br />
              Flavours,
              <br />
              <span className="text-slate-200">Delivered Fast.</span>
            </h1>

            {/* Sub-text */}
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Freshly prepared meals crafted with love by local chefs. Order online,
              pick up in minutes or get it delivered right to your door.
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#menu"
                id="hero-cta-menu"
                className="
                  inline-flex items-center gap-2
                  px-7 py-3.5 rounded-full
                  bg-gradient-to-r from-amber-500 to-orange-600
                  text-white font-semibold text-sm
                  shadow-lg shadow-orange-900/40
                  hover:shadow-xl hover:shadow-orange-900/60
                  hover:scale-105
                  transition-all duration-200
                "
              >
                Browse Menu
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
              <a
                href="#vendor-info"
                id="hero-cta-info"
                className="
                  inline-flex items-center gap-2
                  px-7 py-3.5 rounded-full
                  border border-white/10
                  text-slate-300 font-semibold text-sm
                  hover:border-amber-400/30 hover:text-amber-400
                  transition-all duration-200
                "
              >
                About Us
              </a>
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
              {/* Glossy overlay */}
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
              className="gradient-border-card absolute -top-6 -right-4 w-36 h-36 overflow-hidden shadow-xl shadow-indigo-900/30"
              style={{ transform: 'rotate(6deg)' }}
            >
              <Image
                src="/images/pasta.png"
                alt="Truffle pasta"
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
              className="gradient-border-card absolute -bottom-4 -left-6 w-32 h-32 overflow-hidden shadow-xl shadow-indigo-900/30"
              style={{ transform: 'rotate(-8deg)' }}
            >
              <Image
                src="/images/dessert.png"
                alt="Chocolate lava cake"
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
  );
}
