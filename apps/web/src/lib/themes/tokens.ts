/**
 * src/lib/themes/tokens.ts
 * NummyGo Theme System — Design Tokens
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  THIS IS THE SINGLE SOURCE OF TRUTH FOR ALL THEME COLORS.  │
 * │  To adjust any color in dark or light mode, edit here only. │
 * │  To add a new theme, add a new const below and add it to    │
 * │  the `themes` map at the bottom.                             │
 * └─────────────────────────────────────────────────────────────┘
 */

import type { ThemeTokens } from './types';

/* ═══════════════════════════════════════════════════════
   DARK THEME — NummyGo's original premium dark aesthetic
   Deep navy canvas, amber fire, cosmic indigo accents.
═══════════════════════════════════════════════════════ */
export const darkTheme: ThemeTokens = {
  name: 'dark',

  bg:      '#0D1117',
  surface: '#13191f',

  card: {
    bg:          'rgba(19,25,31,0.80)',
    border:      'rgba(255,255,255,0.06)',
    shadow:      'none',
    hoverShadow: '0 24px 48px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,191,36,0.08)',
  },

  text: {
    primary:   '#f1f5f9',   // slate-100
    secondary: '#94a3b8',   // slate-400
    muted:     '#475569',   // slate-600
  },

  accent: {
    amber:      '#f59e0b',  // amber-500
    amberHover: '#fbbf24',  // amber-400
    indigo:     '#818cf8',  // indigo-400
    indigoHover:'#a5b4fc',  // indigo-300
  },

  gradient: {
    text:   'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #818cf8 100%)',
    border: 'linear-gradient(135deg, #fbbf24, #f97316, #818cf8)',
  },

  navbar: {
    bg:     'rgba(13,17,23,0.80)',
    border: 'rgba(255,255,255,0.05)',
    pill:   'rgba(19,25,31,0.88)',
  },

  scrollbar: {
    track: '#0D1117',
    thumb: '#252e3f',
  },
};

/* ═══════════════════════════════════════════════════════
   LIGHT THEME — Frosted Glass Variation
   Icy white canvas, deep sunset orange fire, cosmic
   violet/indigo accents. Gradients on text/borders only.
   Buttons remain solid (never gradient).
═══════════════════════════════════════════════════════ */
export const lightTheme: ThemeTokens = {
  name: 'light',

  bg:      '#F4F6FB',
  surface: '#FFFFFF',

  card: {
    bg:          'rgba(255,255,255,0.82)',
    border:      'rgba(15,23,42,0.07)',
    shadow:      '0 4px 24px -6px rgba(15,23,42,0.10), 0 1px 3px -1px rgba(15,23,42,0.06)',
    hoverShadow: '0 20px 50px -10px rgba(15,23,42,0.18), 0 0 0 1px rgba(234,88,12,0.12)',
  },

  text: {
    primary:   '#0F172A',   // slate-900
    secondary: '#475569',   // slate-600
    muted:     '#94A3B8',   // slate-400
  },

  accent: {
    amber:       '#C2410C', // orange-700 (deeper for light bg contrast)
    amberHover:  '#EA580C', // orange-600
    indigo:      '#6D28D9', // violet-700
    indigoHover: '#7C3AED', // violet-600
  },

  gradient: {
    text:   'linear-gradient(135deg, #EA580C 0%, #C2410C 30%, #7C3AED 100%)',
    border: 'linear-gradient(135deg, #EA580C, #C2410C, #7C3AED)',
  },

  navbar: {
    bg:     'rgba(255,255,255,0.85)',
    border: 'rgba(15,23,42,0.07)',
    pill:   'rgba(255,255,255,0.92)',
  },

  scrollbar: {
    track: '#F4F6FB',
    thumb: '#CBD5E1',
  },
};

/* ═══════════════════════════════════════════════════════
   THEME REGISTRY
   Add any new theme here to make it available system-wide.
═══════════════════════════════════════════════════════ */
export const themes = {
  dark:  darkTheme,
  light: lightTheme,
} as const satisfies Record<string, ThemeTokens>;
