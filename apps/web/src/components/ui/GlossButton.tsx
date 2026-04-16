/**
 * GlossButton
 * Glass/ghost-style secondary button for the nummyGo auth/login page.
 * Used for secondary actions: "About Us", "Google Sign-in", vendor edit links.
 */
import * as React from 'react';
import { cn } from '@/components/ui';
import { useTheme } from '@/lib/themes';

export interface GlossButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

const GlossButton = React.forwardRef<HTMLButtonElement, GlossButtonProps>(
  ({ className, children, disabled, style, ...props }, ref) => {
    const { theme } = useTheme();
    const isLight = theme.name === 'light';
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'group inline-flex items-center justify-center gap-2',
          'rounded-full px-7 py-3.5',
          'font-semibold text-sm',
          'hover:border-amber-400/30 hover:text-amber-400',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-all duration-200',
          className
        )}
        style={{
          border: `1px solid ${isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.10)'}`,
          color: isLight ? theme.text.secondary : '#cbd5e1',
          background: isLight ? 'rgba(255,255,255,0.60)' : 'transparent',
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
GlossButton.displayName = 'GlossButton';

export { GlossButton };
