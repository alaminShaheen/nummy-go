/**
 * StatusBadge
 * Order status pill badge with colour-coded variants.
 * Used in customer/page.tsx OrderCard and any order management views.
 */
import * as React from 'react';
import { Badge } from '@/components/ui';
import { cn } from '@/components/ui';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending:   'bg-blue-500/20   text-blue-400   border-blue-500/30',
  accepted:  'bg-violet-500/20 text-violet-400 border-violet-500/30',
  preparing: 'bg-amber-500/20  text-amber-400  border-amber-500/30',
  ready:     'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  completed: 'bg-slate-500/20  text-slate-400  border-slate-500/30',
  cancelled: 'bg-red-500/20    text-red-400    border-red-500/30',
};

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: OrderStatus | string;
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const key = status as OrderStatus;
  const classes = STATUS_CLASSES[key] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  return (
    <Badge
      variant="outline"
      className={cn('capitalize text-xs font-semibold px-2.5', classes, className)}
      {...props}
    >
      {status}
    </Badge>
  );
}

export { StatusBadge };
