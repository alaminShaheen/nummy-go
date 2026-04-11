import Image from 'next/image';
import { GradientDivider, Button } from '@/components/ui';
import { ChevronDown } from 'lucide-react';
import type { SocialLinks } from '@nummygo/shared/models/types';
import SocialLinksRow from '@/components/SocialLinksRow';

interface VendorProfileHeaderProps {
  name: string;
  description?: string | null;
  tags?: string[] | null;
  logoUrl?: string | null;
  acceptsOrders: boolean;
  socialLinks?: SocialLinks | null;
}

export default function VendorProfileHeader({
  name,
  description,
  tags,
  logoUrl,
  acceptsOrders,
  socialLinks,
}: VendorProfileHeaderProps) {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20">
      <div 
        className="relative -mt-24 sm:-mt-32 md:-mt-40 bg-[rgba(19,25,31,0.65)] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row gap-8 items-start md:items-center justify-between"
      >
        <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-start sm:items-center max-w-3xl">
          {/* Logo Identity Block */}
          {logoUrl ? (
             <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-[0_0_20px_rgba(0,0,0,0.5)] shrink-0 bg-slate-900">
               <Image 
                 src={logoUrl} 
                 alt={`${name} logo`} 
                 fill 
                 className="object-cover" 
               />
             </div>
          ) : (
             <div className="flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-2 border-slate-700 bg-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.5)] shrink-0">
               <span className="text-3xl sm:text-4xl font-black text-slate-600">
                 {name.charAt(0).toUpperCase()}
               </span>
             </div>
          )}

          {/* Texts & Tags */}
          <div className="flex flex-col gap-3">
             <div className="flex flex-col gap-1 items-start">
               {/* Status Badge */}
               <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] sm:text-xs font-semibold uppercase tracking-widest ${
                  acceptsOrders 
                    ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-500'
               }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${acceptsOrders ? 'bg-amber-400 animate-pulse' : 'bg-red-500'}`} />
                  {acceptsOrders ? 'Taking Orders' : 'Closed'}
               </div>
               
               <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-100 tracking-tight leading-none mt-1">
                 {name}
               </h2>
             </div>
             
             {description ? (
               <p className="text-slate-400 text-sm sm:text-base leading-relaxed line-clamp-2 md:line-clamp-none max-w-2xl">
                 {description}
               </p>
             ) : (
               <p className="text-slate-500 text-sm max-w-2xl">
                 Freshly prepared meals crafted with love by local chefs.
               </p>
             )}

             {/* Tags row */}
             <div className="flex gap-2 flex-wrap mt-1">
               {(tags?.length ? tags : ['🍔 Burgers', '🍝 Pasta', '🍣 Sushi']).map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 backdrop-blur-sm"
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
          <Button 
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto h-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2"
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
