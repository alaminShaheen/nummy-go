/**
 * GradientDivider
 * Amber or indigo gradient horizontal rule — replaces the inline
 * `<div className="h-px …" style={…}>` pattern used throughout.
 */
import * as React from 'react';
import { cn } from '@/components/ui';

export interface GradientDividerProps extends React.ComponentProps<'div'> {
  /** Colour of the gradient accent */
  accent?: 'amber' | 'indigo';
}

function GradientDivider({ accent = 'amber', className, ...props }: GradientDividerProps) {
  const gradient =
    accent === 'amber'
      ? 'linear-gradient(to right, transparent, rgba(251,191,36,0.3), transparent)'
      : 'linear-gradient(to right, transparent, rgba(99,102,241,0.2), transparent)';

  return (
    <div
      aria-hidden="true"
      className={cn('h-px mx-auto max-w-5xl', className)}
      style={{ background: gradient }}
      {...props}
    />
  );
}

export { GradientDivider };
