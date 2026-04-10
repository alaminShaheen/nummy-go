/**
 * packages/shared/src/ui/BrandInput.tsx
 *
 * A brand-styled text input built on top of the shadcn Input primitive.
 * Applies NummyGo's dark-glass style (dark bg, amber focus ring, slate text)
 * while remaining fully compatible with existing Input props.
 *
 * Usage:
 *   <BrandInput id="name" value={value} onChange={e => setValue(e.target.value)} />
 *   <BrandInput prefix="nummygo.com/" id="slug" value={slug} onChange={…} />
 *
 * For a fully controlled convenience wrapper:
 *   <BrandInput id="name" value={value} onValueChange={setValue} />
 */

import * as React from 'react';
import { Input } from '@nummygo/shared/ui';
import { cn } from '@nummygo/shared/ui';

export interface BrandInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'prefix'> {
  /** Convenience controlled handler — receives the raw string value */
  onValueChange?: (value: string) => void;
  /** HTML onChange — still supported for raw event access */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Inline prefix rendered inside the input (text string or icon ReactNode) */
  prefix?: React.ReactNode;
  /** Optional right-side slot — useful for availability indicators */
  suffix?: React.ReactNode;
}

/**
 * BrandInput — shadcn Input with NummyGo dark-glass styling.
 * Supports optional prefix text and suffix slot (e.g. spinner / check icon).
 */
export const BrandInput = React.forwardRef<HTMLInputElement, BrandInputProps>(
  ({ className, prefix, suffix, onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Dynamic access avoids @cloudflare/workers-types DOM type pollution
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (e.target as any).value as string;
      onValueChange?.(value);
      onChange?.(e);
    };

    return (
      <div
        className={cn(
          "relative flex items-center w-full",
          "rounded-xl bg-white/[0.04] border border-white/10 transition-colors duration-200",
          "focus-within:border-amber-400/60 focus-within:bg-white/[0.06] focus-within:ring-0",
          className
        )}
      >
        {/* Prefix text */}
        {prefix && (
          <span
            className="pl-4 text-slate-500 text-sm select-none pointer-events-none whitespace-nowrap"
            aria-hidden="true"
          >
            {prefix}
          </span>
        )}

        <Input
          ref={ref}
          onChange={handleChange}
          className={cn(
            // Apply text and reset base input styles to blend into the wrapper
            'border-0 bg-transparent text-slate-100 shadow-none min-w-0 w-full',
            'placeholder:text-slate-600',
            'focus-visible:ring-0 focus-visible:border-transparent focus-visible:outline-none',
            'h-auto py-2.5',
            prefix ? 'pl-1' : 'pl-4',
            suffix ? 'pr-8' : 'pr-3',
          )}
          {...props}
        />

        {/* Suffix slot (e.g. availability indicator) */}
        {suffix && (
          <span className="absolute right-3 flex items-center pointer-events-none">{suffix}</span>
        )}
      </div>
    );
  },
);
BrandInput.displayName = 'BrandInput';
