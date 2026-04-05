/**
 * SectionLabel
 * Amber uppercase eyebrow label used before section headings.
 * Example: "Fresh Today", "The Restaurant", "Now Taking Orders"
 */
import * as React from 'react';
import { cn } from '@/components/ui';

export interface SectionLabelProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

function SectionLabel({ children, className, ...props }: SectionLabelProps) {
  return (
    <p
      className={cn(
        'text-xs font-semibold uppercase tracking-[0.2em] text-amber-400',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export { SectionLabel };
