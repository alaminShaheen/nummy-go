/**
 * StatusBadge
 * Premium order status pill badge with colour-coded dot indicator.
 * Compact, polished, and consistent across all status states.
 */
import * as React from 'react';
import { cn } from '@/components/ui';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

interface StatusConfig {
  label: string;
  dotColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  glow?: boolean;
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: 'Received',
    dotColor: 'bg-blue-400',
    textColor: 'text-blue-300',
    bgColor: 'bg-blue-500/8',
    borderColor: 'border-blue-500/20',
  },
  accepted: {
    label: 'Confirmed',
    dotColor: 'bg-indigo-400',
    textColor: 'text-indigo-300',
    bgColor: 'bg-indigo-500/8',
    borderColor: 'border-indigo-500/20',
  },
  preparing: {
    label: 'Preparing',
    dotColor: 'bg-amber-400',
    textColor: 'text-amber-300',
    bgColor: 'bg-amber-500/8',
    borderColor: 'border-amber-500/20',
    glow: true,
  },
  ready: {
    label: 'Ready',
    dotColor: 'bg-emerald-400',
    textColor: 'text-emerald-300',
    bgColor: 'bg-emerald-500/8',
    borderColor: 'border-emerald-500/20',
    glow: true,
  },
  completed: {
    label: 'Completed',
    dotColor: 'bg-slate-400',
    textColor: 'text-slate-400',
    bgColor: 'bg-slate-500/8',
    borderColor: 'border-slate-500/15',
  },
  cancelled: {
    label: 'Cancelled',
    dotColor: 'bg-rose-400',
    textColor: 'text-rose-400',
    bgColor: 'bg-rose-500/8',
    borderColor: 'border-rose-500/20',
  },
};

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: OrderStatus | string;
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const key = status as OrderStatus;
  const config = STATUS_CONFIG[key] ?? STATUS_CONFIG.completed;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border',
        config.bgColor,
        config.borderColor,
        config.textColor,
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          config.dotColor,
          config.glow && 'animate-pulse shadow-[0_0_6px_currentColor]',
        )}
      />
      {config.label}
    </span>
  );
}

export { StatusBadge };
