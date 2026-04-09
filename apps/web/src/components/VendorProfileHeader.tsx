import Image from 'next/image';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { GradientDivider } from '@/components/ui';

interface VendorProfileHeaderProps {
  name: string;
  description?: string | null;
  tags?: string[] | null;
  logoUrl?: string | null;
  acceptsOrders: boolean;
  isVendorOwner?: boolean;
}

export default function VendorProfileHeader({
  name,
  description,
  tags,
  logoUrl,
  acceptsOrders,
  isVendorOwner,
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto mt-2 md:mt-0">
          {isVendorOwner && (
            <Link
              href="/tenant/editprofile"
              className="
                flex items-center justify-center min-w-[140px] gap-2 px-6 py-3 rounded-xl font-semibold text-sm
                border border-indigo-500/50 text-indigo-300
                bg-indigo-500/5 hover:bg-indigo-500/15 hover:border-indigo-400 hover:text-indigo-200
                transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]
              "
            >
              <Pencil size={16} />
              Edit Profile
            </Link>
          )}
        </div>
      </div>
      
      {/* Visual Divider bleeding gently downwards from the block */}
      <div className="max-w-4xl mx-auto mt-12 mb-8 hidden md:block">
        <GradientDivider accent="amber" className="opacity-50" />
      </div>
    </div>
  );
}
