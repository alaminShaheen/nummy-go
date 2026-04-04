/**
 * GlassCard
 * Glassmorphism card with gradient border for the NummyGo dark theme.
 * Wraps the .gradient-border-card + .glass CSS classes as a reusable component.
 */
import * as React from 'react';
import { cn } from '@nummygo/shared/ui';

export interface GlassCardProps extends React.ComponentProps<'div'> {
  /** Removes the gradient border decoration */
  plain?: boolean;
}

function GlassCard({ className, plain = false, ...props }: GlassCardProps) {
  return (
    <div
      data-slot="glass-card"
      className={cn(plain ? 'glass' : 'gradient-border-card', className)}
      {...props}
    />
  );
}

export { GlassCard };
