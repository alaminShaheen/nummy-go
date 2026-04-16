'use client';

/**
 * packages/shared/src/ui/FormField.tsx
 *
 * A brand-styled form field wrapper built on the shadcn Label primitive.
 * Renders a label, optional hint, optional error, and slots children (inputs).
 *
 * Usage:
 *   <FormField id="name" label="Restaurant Name" required error={errors.name}>
 *     <BrandInput id="name" value={value} onChange={onChange} />
 *   </FormField>
 */

import * as React from 'react';
import { cn } from '@nummygo/shared/ui';
import { useTheme } from '@/lib/themes';

/** Inline alert circle SVG — avoids adding lucide-react to the shared package */
function ErrorIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export interface FormFieldProps {
  /** The id of the associated input element — used for htmlFor */
  id: string;
  label: string;
  required?: boolean;
  /** Shown below the input in rose-400 when truthy */
  error?: string;
  /** Shown below the input in slate-500 when no error */
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * FormField — wraps an input with label, hint, and error message.
 * Styled to match the nummyGo dark brand system.
 */
export function FormField({
  id,
  label,
  required,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  const { theme } = useTheme();

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {/* Label */}
      <label
        htmlFor={id}
        className={cn(
          "text-sm font-medium cursor-pointer transition-colors",
          theme.name === 'light' ? 'text-slate-600' : 'text-slate-400'
        )}
      >
        {label}
        {required && (
          <span className="text-amber-400 ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {/* Input slot */}
      {children}

      {/* Hint — only when no error */}
      {hint && !error && (
        <p className={cn(
          "text-xs leading-relaxed transition-colors",
          theme.name === 'light' ? 'text-slate-400' : 'text-slate-600'
        )}>{hint}</p>
      )}

      {/* Error */}
      {error && (
        <p
          role="alert"
          aria-live="polite"
          className={cn(
            "text-xs flex items-center gap-1 leading-relaxed transition-colors",
            theme.name === 'light' ? 'text-rose-600' : 'text-rose-400'
          )}
        >
          <ErrorIcon />
          {error}
        </p>
      )}
    </div>
  );
}
