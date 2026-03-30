/**
 * packages/shared/src/ui/utils.ts
 *
 * Shared utility for merging Tailwind CSS class names.
 * `clsx` handles conditional classes; `tailwind-merge` resolves conflicts
 * (e.g. both `p-2` and `p-4` → `p-4` wins).
 *
 * Re-exported as `cn` – the de-facto convention in the shadcn/ui ecosystem.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
