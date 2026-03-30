/**
 * packages/shared/src/ui/Button.tsx
 *
 * Reusable Button component following the shadcn/ui pattern.
 * Uses `class-variance-authority` (cva) for type-safe variant management
 * and `tailwind-merge` to safely merge Tailwind classes without conflicts.
 *
 * Usage:
 *   import { Button } from '@nummygo/shared/ui';
 *   <Button variant="outline" size="sm" onClick={...}>Place Order</Button>
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

// ── Variant definitions ────────────────────────────────────────────────────
// cva generates a className string based on props.
// Add/edit variants here to extend the design system.

const buttonVariants = cva(
  // Base styles applied to every button
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-md text-sm font-medium',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
  ].join(' '),
  {
    variants: {
      /** Visual style of the button. */
      variant: {
        default:
          'bg-slate-900 text-white hover:bg-slate-700 focus-visible:ring-slate-900',
        destructive:
          'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
        outline:
          'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-slate-400',
        secondary:
          'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400',
        ghost:
          'text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400',
        link:
          'text-slate-900 underline-offset-4 hover:underline focus-visible:ring-slate-400',
      },
      /** Size preset. */
      size: {
        sm:      'h-8  px-3 text-xs',
        default: 'h-10 px-4 text-sm',
        lg:      'h-12 px-6 text-base',
        icon:    'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  }
);

// ── Component ──────────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Renders a loading spinner and disables the button. */
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isLoading ?? disabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          // Simple CSS spinner – no extra icon library needed
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
