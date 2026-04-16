'use client';

import Image from 'next/image';
import { GradientDivider, Button } from '@/components/ui';
import { ChevronDown } from 'lucide-react';
import type { SocialLinks } from '@nummygo/shared/models/types';
import SocialLinksRow from '@/components/SocialLinksRow';
import { useTheme } from '@/lib/themes';

interface VendorProfileHeaderProps {
  name: string;
  description?: string | null;
  tags?: string[] | null;
  logoUrl?: string | null;
  acceptsOrders: boolean;
  socialLinks?: SocialLinks | null;
  estimatedPrepTime?: number;
}

export default function VendorProfileHeader({
  name,
  description,
  tags,
  logoUrl,
  acceptsOrders,
  socialLinks,
  estimatedPrepTime = 20,
}: VendorProfileHeaderProps) {
  const { theme } = useTheme();
  const isLight = theme.name === 'light';
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20">
      <div
        className="relative -mt-24 sm:-mt-32 md:-mt-40 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row gap-8 items-start md:items-center justify-between"
        style={{
          background: theme.card.bg,
          border: `1px solid ${theme.card.border}`,
        }}
      >
        <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-start sm:items-center max-w-3xl">
          {/* Logo Identity Block */}
          {logoUrl ? (
             <div
               className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-lg shrink-0"
               style={{ border: `2px solid ${theme.card.border}`, background: theme.surface }}
             >
               <Image src={logoUrl} alt={`${name} logo`} fill className="object-cover" />
             </div>
          ) : (
             <div
               className="flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-2xl shadow-lg shrink-0"
               style={{ border: `2px solid ${theme.card.border}`, background: theme.surface }}
             >
               <span className="text-3xl sm:text-4xl font-black" style={{ color: theme.text.muted }}>
                 {name.charAt(0).toUpperCase()}
               </span>
             </div>
          )}

          {/* Texts & Tags */}
          <div className="flex flex-col gap-3">
             <div className="flex flex-col gap-1 items-start">
               {/* Status Badge */}
               <div className="flex items-center gap-2">
                 <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] sm:text-xs font-semibold uppercase tracking-widest ${
                    acceptsOrders 
                      ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-500'
                 }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${acceptsOrders ? 'bg-amber-400 animate-pulse' : 'bg-red-500'}`} />
                    {acceptsOrders ? 'Taking Orders' : 'Closed'}
                 </div>
                 
                 {acceptsOrders && (
                   <div
                     className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold"
                     style={{
                       background: isLight ? 'rgba(15,23,42,0.06)' : 'rgba(30,41,59,0.80)',
                       border: `1px solid ${theme.card.border}`,
                       color: theme.text.secondary,
                     }}
                   >
                     <span>🕒</span>
                     {estimatedPrepTime} min prep
                   </div>
                 )}
               </div>
               
               <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none mt-1" style={{ color: theme.text.primary }}>
                 {name}
               </h2>
             </div>
             
             {description ? (
               <p className="text-sm sm:text-base leading-relaxed line-clamp-2 md:line-clamp-none max-w-2xl" style={{ color: theme.text.secondary }}>
                 {description}
               </p>
             ) : (
               <p className="text-sm max-w-2xl" style={{ color: theme.text.muted }}>
                 Freshly prepared meals crafted with love by local chefs.
               </p>
             )}

             {/* Tags row */}
             <div className="flex gap-2 flex-wrap mt-1">
               {(tags?.length ? tags : ['🍔 Burgers', '🍝 Pasta', '🍣 Sushi']).map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium backdrop-blur-sm"
                    style={{
                      background: isLight ? 'rgba(109,40,217,0.08)' : 'rgba(99,102,241,0.10)',
                      border: `1px solid ${isLight ? 'rgba(109,40,217,0.18)' : 'rgba(99,102,241,0.20)'}`,
                      color: isLight ? '#7C3AED' : '#a5b4fc',
                    }}
                  >
                     {t}
                  </span>
               ))}
             </div>

             {/* Social Links — after tags */}
             {socialLinks && <SocialLinksRow links={socialLinks} size="md" />}
          </div>
        </div>

        <div className="flex flex-row justify-center md:justify-end md:flex-col gap-3 w-full md:w-auto mt-6 md:mt-0">
          <Button variant="gradient"
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-8 uppercase tracking-widest text-xs"
          >
            Explore Menu
            <ChevronDown size={16} strokeWidth={3} className="animate-bounce" />
          </Button>
        </div>
      </div>
      
      {/* Visual Divider bleeding gently downwards from the block */}
      <div className="max-w-4xl mx-auto mt-12 mb-8 hidden md:block">
        <GradientDivider accent="amber" className="opacity-50" />
      </div>
    </div>
  );
}
