/**
 * GradientButton
 * Primary CTA button using the NummyGo amber→orange gradient.
 * Wraps shadcn Button with brand styling and scale micro-animation.
 */
import * as React from 'react';
import { cn } from '@nummygo/shared/ui';

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Renders as an anchor tag */
  asChild?: false;
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'rounded-full px-7 py-3.5',
        'bg-gradient-to-r from-amber-500 to-orange-600',
        'text-white font-semibold text-sm',
        'shadow-lg shadow-orange-900/40',
        'hover:shadow-xl hover:shadow-orange-900/60 hover:scale-105',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100',
        'transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
GradientButton.displayName = 'GradientButton';

export { GradientButton };
