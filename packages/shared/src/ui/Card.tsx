/**
 * packages/shared/src/ui/Card.tsx
 *
 * Composable Card primitive following the shadcn/ui composition pattern.
 * Sub-components (CardHeader, CardTitle, CardContent, CardFooter) are
 * exported separately so consumers can assemble layouts freely.
 *
 * Usage:
 *   import { Card, CardHeader, CardTitle, CardContent } from '@nummygo/shared/ui';
 *
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Order #123</CardTitle>
 *     </CardHeader>
 *     <CardContent>…details…</CardContent>
 *   </Card>
 */

import * as React from 'react';
import { cn } from './utils';

// ── Card ───────────────────────────────────────────────────────────────────

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

// ── CardHeader ─────────────────────────────────────────────────────────────

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

// ── CardTitle ──────────────────────────────────────────────────────────────

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-tight tracking-tight text-slate-900', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

// ── CardDescription ────────────────────────────────────────────────────────

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-slate-500', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

// ── CardContent ────────────────────────────────────────────────────────────

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

// ── CardFooter ─────────────────────────────────────────────────────────────

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
