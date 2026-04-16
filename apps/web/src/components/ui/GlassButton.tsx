/**
 * GlassButton
 * Theme-aware thin wrapper around the shared Button (variant="glass").
 * Applies light/dark border and background via useTheme() inline styles.
 *
 * Usage:
 *   <GlassButton onClick={...}>Cancel</GlassButton>
 */
'use client';

import * as React from 'react';
import { Button, type ButtonProps } from '@nummygo/shared/ui';
import { useTheme } from '@/lib/themes';

export interface GlassButtonProps extends Omit<ButtonProps, 'variant'> {}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, style, ...props }, ref) => {
    const { theme } = useTheme();
    const isLight = theme.name === 'light';

    return (
      <Button
        ref={ref}
        variant="glass"
        className={className}
        style={{
          border: `1px solid ${isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.10)'}`,
          color: isLight ? theme.text.secondary : '#cbd5e1',
          background: isLight ? 'rgba(255,255,255,0.60)' : 'transparent',
          ...style,
        }}
        {...props}
      />
    );
  }
);
GlassButton.displayName = 'GlassButton';

export { GlassButton };
