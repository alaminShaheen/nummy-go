/**
 * apps/web/src/components/ui/index.ts
 *
 * NummyGo design-system barrel export.
 * Custom components and re-exports of shadcn primitives.
 * Import from '@/components/ui' throughout the web app.
 */

// Re-export shadcn/ui components from shared package
export {
  cn,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  badgeVariants,
  Button,
  buttonVariants,
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Separator,
  Skeleton,
  VendorCard,
} from '@nummygo/shared/ui';
export type { InputProps, VendorCardProps } from '@nummygo/shared/ui';

// Custom NummyGo components
export { GradientButton } from './GradientButton';
export type { GradientButtonProps } from './GradientButton';

export { GlossButton } from './GlossButton';
export type { GlossButtonProps } from './GlossButton';

export { GlassCard } from './GlassCard';
export type { GlassCardProps } from './GlassCard';

export { NummyGoBadge } from './NummyGoBadge';
export type { NummyGoBadgeProps } from './NummyGoBadge';

export { StatusBadge } from './StatusBadge';
export * from './InlineEditableField';
export type { StatusBadgeProps, OrderStatus } from './StatusBadge';

export { SectionLabel } from './SectionLabel';
export type { SectionLabelProps } from './SectionLabel';

export { GradientDivider } from './GradientDivider';
export type { GradientDividerProps } from './GradientDivider';

// Custom form components
export { BrandInput } from './BrandInput';
export type { BrandInputProps } from './BrandInput';
export { FormField } from './FormField';
export type { FormFieldProps } from './FormField';
export { FormCard } from './FormCard';
export { ImageDropzone } from './ImageDropzone';
export { TagsInput } from './TagsInput';
export { BrandSwitch } from './BrandSwitch';
export { AddressAutocomplete } from './AddressAutocomplete';
