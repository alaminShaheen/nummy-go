/**
 * packages/shared/src/ui/Badge.tsx
 *
 * Status badge component.  Particularly useful for showing OrderStatus values
 * with semantic colour coding (green = READY, red = CANCELLED, etc.).
 *
 * Usage:
 *   import { Badge, OrderStatusBadge } from '@nummygo/shared/ui';
 *
 *   // Generic badge
 *   <Badge variant="success">Active</Badge>
 *
 *   // Pre-configured for order status
 *   <OrderStatusBadge status="PREPARING" />
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';
import type { OrderStatus } from '../types';

// ── Variants ───────────────────────────────────────────────────────────────

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-slate-900 text-white',
        secondary:   'bg-slate-100 text-slate-700',
        outline:     'border border-slate-300 text-slate-700',
        success:     'bg-green-100 text-green-800',
        warning:     'bg-amber-100 text-amber-800',
        destructive: 'bg-red-100 text-red-800',
        info:        'bg-blue-100 text-blue-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// ── Component ──────────────────────────────────────────────────────────────

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

// ── OrderStatusBadge ───────────────────────────────────────────────────────

/** Maps an OrderStatus to the appropriate Badge variant + label. */
const STATUS_CONFIG: Record<
  OrderStatus,
  { variant: BadgeProps['variant']; label: string }
> = {
  PENDING:   { variant: 'info',        label: 'Pending'   },
  PREPARING: { variant: 'warning',     label: 'Preparing' },
  READY:     { variant: 'success',     label: 'Ready'     },
  DELIVERED: { variant: 'secondary',   label: 'Delivered' },
  CANCELLED: { variant: 'destructive', label: 'Cancelled' },
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const { variant, label } = STATUS_CONFIG[status];
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}

export { Badge, badgeVariants };
