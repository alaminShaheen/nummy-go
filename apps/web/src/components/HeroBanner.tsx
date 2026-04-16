'use client';

import Image from 'next/image';
import { useTheme } from '@/lib/themes';


interface HeroBannerProps {
  promotionalHeading?: string | null;
  heroImageUrl?: string | null;
}

export default function HeroBanner({
  promotionalHeading,
  heroImageUrl,
}: HeroBannerProps) {
  const { theme } = useTheme();
  return (
    <section
      id="hero"
      className="relative min-h-[450px] md:min-h-[550px] pb-52 pt-28 md:pt-36 flex items-start overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: theme.bg,
        backgroundImage: heroImageUrl ? `url(${heroImageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay when hero image is set */}
      {heroImageUrl && (
         <div className="absolute inset-0 z-0" style={{ background: `${theme.bg}cc` }} />
      )}
      {/* Ambient glow blobs */}
      <div className="glow-amber" style={{ top: '-10%', left: '-5%' }} aria-hidden="true" />
      <div className="glow-indigo" style={{ bottom: '15%', right: '-5%' }} aria-hidden="true" />

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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Left: Headline Only */}
          <div className="flex flex-col gap-4 max-w-2xl">
            {promotionalHeading ? (
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white drop-shadow-lg break-words">
                {promotionalHeading.split(' ').map((word, i, arr) => {
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
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white drop-shadow-lg break-words">
                Your{' '}
                <span className="gradient-text">Neighbourhood</span>
                <br />
                Flavours.
              </h1>
            )}
          </div>

          {/* Right: Glossy hero image collage (Visible only if NO heroImageUrl is provided) */}
          {!heroImageUrl && (
            <div className="relative hidden lg:flex justify-center items-center opacity-80">
              <div
                className="absolute w-72 h-72 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                }}
                aria-hidden="true"
              />
              <div className="gradient-border-card relative w-64 h-64 overflow-hidden shadow-2xl shadow-amber-900/30">
                <Image
                  src="/images/burger.png"
                  alt="Signature smash burger"
                  fill
                  className="object-cover"
                  sizes="256px"
                  priority
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)' }} />
              </div>
              <div
                className="gradient-border-card absolute -top-4 -right-4 w-32 h-32 overflow-hidden shadow-xl shadow-indigo-900/30"
                style={{ transform: 'rotate(6deg)' }}
              >
                <Image src="/images/pasta.png" alt="Truffle pasta" fill className="object-cover" sizes="128px" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
              </div>
              <div
                className="gradient-border-card absolute -bottom-4 -left-4 w-28 h-28 overflow-hidden shadow-xl shadow-indigo-900/30"
                style={{ transform: 'rotate(-8deg)' }}
              >
                <Image src="/images/dessert.png" alt="Chocolate lava cake" fill className="object-cover" sizes="112px" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom fade — blends seamlessly into page background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40"
        style={{ background: `linear-gradient(to bottom, transparent, ${theme.bg})` }}
        aria-hidden="true"
      />
    </section>
  );
}
