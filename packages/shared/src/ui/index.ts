/**
 * packages/shared/src/ui/index.ts
 *
 * Barrel export for all shared UI components.
 * Import from '@nummygo/shared/ui' in frontend apps.
 */

export { Button, buttonVariants } from './Button';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from './Card';

export { Badge, badgeVariants } from './Badge';
export type { BadgeProps } from './Badge';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Separator } from './Separator';

export { Avatar, AvatarImage, AvatarFallback } from './Avatar';

export { Skeleton } from './Skeleton';

export { cn } from './utils';

