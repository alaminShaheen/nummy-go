/**
 * GlossButton
 * Glass/ghost-style secondary button for the NummyGo dark theme.
 * Used for secondary actions: "About Us", "Google Sign-in", vendor edit links.
 */
import * as React from 'react';
import { cn } from '@nummygo/shared/ui';

export interface GlossButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const GlossButton = React.forwardRef<HTMLButtonElement, GlossButtonProps>(
  ({ className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'rounded-full px-7 py-3.5',
        'border border-white/10',
        'text-slate-300 font-semibold text-sm',
        'hover:border-amber-400/30 hover:text-amber-400',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
GlossButton.displayName = 'GlossButton';

export { GlossButton };
