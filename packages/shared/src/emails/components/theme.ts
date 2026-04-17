import React from 'react';

// ── nummyGo Light Theme Palette ────────────────────────────────────────────
// Matches [data-theme="light"] in globals.css

export const C = {
  pageBg: '#F4F6FB',
  cardBg: '#FFFFFF',
  stripBg: '#F8FAFC',
  totalBg: '#FFF7ED',
  dangerBg: '#FEF2F2',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textLabel: '#64748B',

  accentOrange: '#EA580C',
  accentDeep: '#C2410C',
  accentPurple: '#7C3AED',
  amber: '#F59E0B',
  green: '#10B981',
  indigo: '#818CF8',
  red: '#DC2626',
  rose: '#F43F5E',

  border: 'rgba(15,23,42,0.08)',
  borderCard: 'rgba(15,23,42,0.06)',
  divider: '#E2E8F0',
} as const;

export const fontStack =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/** Format cents → "$12.50" */
export const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

/** Responsive CSS injected via <style> in <Head>. Shared across all templates. */
export const responsiveCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  @media only screen and (max-width: 480px) {
    .email-container { padding: 12px !important; }
    .email-card { border-radius: 12px !important; }
    .meta-strip td { display: block !important; width: 100% !important; border-left: none !important; border-bottom: 1px solid ${C.divider} !important; padding: 10px 16px !important; }
    .meta-strip td:last-child { border-bottom: none !important; }
    .vendor-header-pills { display: block !important; margin-top: 8px !important; text-align: left !important; }
    .vendor-header-name { display: block !important; }
  }
`;

/** Gradient for the top accent bar */
export const GRADIENT_BAR = `linear-gradient(90deg, ${C.accentOrange} 0%, ${C.accentDeep} 50%, ${C.accentPurple} 100%)`;

/** Gradient for brand text */
export const BRAND_GRADIENT = `linear-gradient(135deg, ${C.accentOrange}, ${C.accentDeep}, ${C.accentPurple})`;
