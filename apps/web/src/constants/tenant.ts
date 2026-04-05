/**
 * apps/web/src/constants/tenant.ts
 *
 * Tenant-domain constants shared across onboarding, edit profile,
 * StorefrontPreview, and any future tenant-facing pages.
 */

import type { BusinessHours } from '@nummygo/shared/models/types';

// ─── Day ordering ─────────────────────────────────────────────────────────────

export const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type Day = (typeof DAYS)[number];

export const DAY_LABELS: Record<Day, string> = {
  monday:    'Mon',
  tuesday:   'Tue',
  wednesday: 'Wed',
  thursday:  'Thu',
  friday:    'Fri',
  saturday:  'Sat',
  sunday:    'Sun',
};

// ─── Business hours defaults ──────────────────────────────────────────────────

export function makeDefaultWeeklyHours(): BusinessHours {
  const defaultDay: BusinessHours['monday'] = { open: '09:00', close: '22:00', closed: false };
  return {
    monday: defaultDay,
    tuesday: defaultDay,
    wednesday: defaultDay,
    thursday: defaultDay,
    friday: defaultDay,
    saturday: defaultDay,
    sunday: defaultDay,
  };
}
