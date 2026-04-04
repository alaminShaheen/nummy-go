import * as React from 'react';
import { cn } from './utils';

function Avatar({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar"
      className={cn(
        'relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  src,
  alt = '',
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-slot="avatar-image"
      className={cn('aspect-square h-full w-full object-cover', className)}
      src={src}
      alt={alt}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold',
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
