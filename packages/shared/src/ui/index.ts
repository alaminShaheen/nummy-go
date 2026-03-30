/**
 * packages/shared/src/ui/index.ts
 *
 * Barrel export for all shared UI components.
 * Import from '@nummygo/shared/ui' in frontend apps.
 */

export { Button, buttonVariants }          from './Button';
export type { ButtonProps }                from './Button';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
}                                          from './Card';

export { Badge, badgeVariants, OrderStatusBadge } from './Badge';
export type { BadgeProps }                 from './Badge';

export { cn }                              from './utils';
