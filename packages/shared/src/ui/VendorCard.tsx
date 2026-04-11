import * as React from 'react';
import { cn } from './utils';
import { Card, CardContent } from './Card';

export interface VendorCardProps extends React.ComponentProps<'button'> {
  /** Restaurant display name */
  name: string;
  /** URL-safe slug — used for navigation */
  slug: string;
  /** Optional address line */
  address?: string | null;
  /** Optional brand logo URL. When absent an initials avatar is rendered. */
  logoUrl?: string | null;
  /** Extra classes applied to the outer Card */
  className?: string;
}

/** Derive up to 2 initials from a restaurant name */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

/**
 * VendorCard
 *
 * A branded, clickable card for displaying a vendor / restaurant in search results.
 * Built on top of the shared shadcn `Card` primitive.
 *
 * Usage:
 * ```tsx
 * <VendorCard
 *   name="Pizza Palace"
 *   slug="pizza-palace"
 *   address="330 Point St, Mallonda"
 *   onClick={() => router.push('/pizza-palace')}
 * />
 * ```
 */
export function VendorCard({
  name,
  slug: _slug,
  address,
  logoUrl,
  className,
  ...buttonProps
}: VendorCardProps) {
  return (
    <button
      type="button"
      className={cn('w-full text-left group focus-visible:outline-none', className)}
      {...buttonProps}
    >
      <Card
        className={cn(
          // Reset shadcn defaults, apply nummyGo brand styles
          'vendor-card gap-0 py-0 ring-0 border-0 cursor-pointer',
          'rounded-2xl',
        )}
      >
        {/* Amber accent bar rendered via vendor-card::before in globals.css */}
        <CardContent className="flex flex-col items-center text-center gap-3 px-5 pt-8 pb-5">

          {/* Logo / Initials Avatar */}
          {logoUrl ? (
            // Brand logo
            <img
              src={logoUrl}
              alt={`${name} logo`}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
            />
          ) : (
            // System-generated initials avatar
            <div
              aria-hidden="true"
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 select-none"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}
            >
              {getInitials(name)}
            </div>
          )}

          {/* Restaurant name */}
          <h3 className="text-base font-semibold text-[#f1f5f9] leading-tight">
            {name}
          </h3>

          {/* Address */}
          {address && (
            <p className="text-xs text-[#475569] leading-snug line-clamp-2">
              {address}
            </p>
          )}
        </CardContent>

        {/* Arrow — bottom-right, shifts on hover via group */}
        <div className="flex justify-end px-5 pb-4">
          {/* Inline arrow SVG — no external dependency */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-400/40 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>
      </Card>
    </button>
  );
}
