/**
 * apps/web/src/constants/tenant.ts
 *
 * Tenant-domain constants shared across onboarding, edit profile,
 * StorefrontPreview, and any future tenant-facing pages.
 */

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

export interface DayHours {
  open:   string;   // "HH:MM" 24-hour
  close:  string;   // "HH:MM" 24-hour
  closed: boolean;
}

export type WeeklyHours = Record<Day, DayHours>;

export function makeDefaultDayHours(): DayHours {
  return { open: '09:00', close: '22:00', closed: false };
}

export function makeDefaultWeeklyHours(): WeeklyHours {
  return Object.fromEntries(
    DAYS.map((d) => [d, makeDefaultDayHours()]),
  ) as WeeklyHours;
}

// ─── Form shape (shared between onboarding & edit profile) ───────────────────

export interface TenantFormValues {
  name:          string;
  slug:          string;
  phoneNumber:   string;
  email:         string;
  address:       string;
  businessHours: WeeklyHours;
}

export function makeDefaultTenantForm(): TenantFormValues {
  return {
    name:          '',
    slug:          '',
    phoneNumber:   '',
    email:         '',
    address:       '',
    businessHours: makeDefaultWeeklyHours(),
  };
}
