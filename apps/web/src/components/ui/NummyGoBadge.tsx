/**
 * NummyGoBadge
 * Brand-styled badge for menu item labels ("Popular", "New", "Chef's Pick").
 * Uses the same filled color design in both light and dark mode.
 */
import * as React from 'react';
import { Badge } from '@/components/ui';
import { cn } from '@/components/ui';

export function getBadgeStyle(text: string | null | undefined): string {
  if (!text) return 'bg-black/50 border border-white/10 backdrop-blur-md text-white/50 hover:text-white/80';
  const lower = text.toLowerCase();

  if (lower.includes('spicy') || lower.includes('hot')) {
    return 'bg-gradient-to-r from-rose-600 to-red-500 text-white border-transparent';
  }
  if (lower.includes('vegan') || lower.includes('healthy') || lower.includes('gf') || lower.includes('gluten')) {
    return 'bg-emerald-700 text-white border-transparent';
  }
  if (lower.includes('chef') || lower.includes('signature')) {
    return 'bg-slate-700 text-white border-slate-600';
  }
  if (lower.includes('new') || lower.includes('fresh')) {
    return 'bg-indigo-600 text-white border-transparent';
  }
  if (lower.includes('promo') || lower.includes('deal') || lower.includes('save') || lower.includes('%')) {
    return 'bg-gradient-to-r from-amber-500 to-amber-600 text-black border-transparent';
  }

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
        'uppercase tracking-wider text-[10px] font-bold',
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
