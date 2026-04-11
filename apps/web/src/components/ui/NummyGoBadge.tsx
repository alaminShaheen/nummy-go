/**
 * NummyGoBadge
 * Brand-styled badge for menu item labels ("Popular", "New", "Chef's Pick").
 * Wraps shadcn Badge with NummyGo brand variants.
 */
import * as React from 'react';
import { Badge } from '@/components/ui';
import { cn } from '@/components/ui';

export function getBadgeStyle(text: string | null | undefined): string {
  if (!text) return 'bg-black/50 border border-white/10 backdrop-blur-md text-white/50 hover:text-white/80';
  const lower = text.toLowerCase();
  
  // Specific matchers
  if (lower.includes('spicy') || lower.includes('hot')) {
    return 'bg-gradient-to-r from-rose-600 to-red-500 text-white border-transparent';
  }
  if (lower.includes('vegan') || lower.includes('healthy') || lower.includes('gf') || lower.includes('gluten')) {
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
  if (lower.includes('chef') || lower.includes('signature')) {
    return 'bg-slate-800/80 text-white border-slate-700/50 backdrop-blur-md shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]';
  }
  if (lower.includes('new') || lower.includes('fresh')) {
    return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
  }
  if (lower.includes('promo') || lower.includes('deal') || lower.includes('save') || lower.includes('%')) {
    return 'bg-gradient-to-r from-amber-500 to-amber-600 text-black border-transparent shadow-[0_0_15px_rgba(245,158,11,0.3)]';
  }
  
  // Generic eye-catcher fallback (Popular, Must Try, etc)
  return 'bg-gradient-to-r from-orange-500 to-rose-500 text-white border-transparent';
}

export interface NummyGoBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
}

function NummyGoBadge({ label, className, ...props }: NummyGoBadgeProps) {
  const styleStr = getBadgeStyle(label);
  return (
    <Badge
      variant="outline"
      className={cn(
        'uppercase tracking-wider text-[10px] font-bold shadow-[0_0_20px_rgba(0,0,0,0.7)]',
        styleStr,
        className
      )}
      {...props}
    >
      {label}
    </Badge>
  );
}

export { NummyGoBadge };
