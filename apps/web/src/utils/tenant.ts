/**
 * apps/web/src/utils/tenant.ts
 *
 * Shared utility functions for tenant-related features.
 * Used by onboarding, edit profile, and storefront preview.
 */

/**
 * Converts an arbitrary string into a URL-safe slug.
 * e.g. "The Golden Fork!" → "the-golden-fork"
 */
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Formats a 24-hour time string (e.g. "09:00") to 12-hour AM/PM format.
 * e.g. "09:00" → "9:00 AM", "22:30" → "10:30 PM"
 */
export function fmt24To12(time: string | undefined | null): string {
  if (!time) return '';
  const parts = time.split(':');
  const h = parts[0] ?? '0';
  const m = parts[1] ?? '00';
  const hour = parseInt(h, 10);
  const period = hour < 12 ? 'AM' : 'PM';
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:${m} ${period}`;
}

export function getGoogleMapsUrl(address: string): string {
  const baseUrl = "https://www.google.com/maps/search/?api=1&query=";
  const encodedAddress = encodeURIComponent(address);
  return baseUrl + encodedAddress;
}