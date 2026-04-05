/**
 * NummyGoBadge
 * Brand-styled badge for menu item labels ("Popular", "New", "Chef's Pick").
 * Wraps shadcn Badge with NummyGo brand variants.
 */
import * as React from 'react';
import { Badge } from '@/components/ui';
import { cn } from '@/components/ui';

type NummyBadgeVariant = 'popular' | 'new' | 'chefs-pick' | 'vegan';

const VARIANT_CLASSES: Record<NummyBadgeVariant, string> = {
  'popular':    'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent',
  'new':        'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'chefs-pick': 'bg-white/[0.06] text-slate-300 border-white/10 backdrop-blur-sm',
  'vegan':      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

function inferVariant(text: string): NummyBadgeVariant {
  const lower = text.toLowerCase();
  if (lower.includes('popular')) return 'popular';
  if (lower.includes('new'))     return 'new';
  if (lower.includes('chef'))    return 'chefs-pick';
  if (lower.includes('vegan'))   return 'vegan';
  return 'popular';
}

export interface NummyGoBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: NummyBadgeVariant;
  label: string;
}

function NummyGoBadge({ label, variant, className, ...props }: NummyGoBadgeProps) {
  const resolvedVariant = variant ?? inferVariant(label);
  return (
    <Badge
      variant="outline"
      className={cn(
        'uppercase tracking-wider text-[10px] font-bold shadow-md',
        VARIANT_CLASSES[resolvedVariant],
        className
      )}
      {...props}
    >
      {label}
    </Badge>
  );
}

export { NummyGoBadge };
