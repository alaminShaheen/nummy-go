'use client';

/**
 * src/components/ThemeToggle.tsx
 * NummyGo — Animated Day/Night Pill Toggle
 *
 * Dark mode  → night sky rail: twinkling stars, crescent moon, subtle aurora
 * Light mode → daytime rail: drifting clouds, sun glow, warm sky gradient
 *
 * The circular thumb slides left↔right with a spring-like cubic-bezier.
 * All animations are pure CSS; no JS timers needed.
 */

import { useTheme } from '@/lib/themes';

export default function ThemeToggle() {
  const { themeName, toggleTheme } = useTheme();
  const isDark = themeName === 'dark';

  return (
    <button
      id="nav-theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="theme-toggle-pill"
      data-dark={isDark ? 'true' : 'false'}
    >
      {/* ── Rail ──────────────────────────────────────── */}
      <span className="theme-toggle-rail" aria-hidden="true">

        {/* Night layer — stars + moon */}
        <span className="theme-toggle-night">
          {/* Stars — each has its own twinkle delay */}
          <span className="tt-star tt-star--1" />
          <span className="tt-star tt-star--2" />
          <span className="tt-star tt-star--3" />
          <span className="tt-star tt-star--4" />
          <span className="tt-star tt-star--5" />
          <span className="tt-star tt-star--6" />
          <span className="tt-star tt-star--7" />
          <span className="tt-star tt-star--8" />

          {/* Shooting star */}
          <span className="tt-shooting-star" />

          {/* Subtle aurora band */}
          <span className="tt-aurora" />
        </span>

        {/* Day layer — clouds + sun glow */}
        <span className="theme-toggle-day">
          {/* Sun orb */}
          <span className="tt-sun-orb">
            <span className="tt-sun-halo" />
            <span className="tt-sun-core" />
          </span>

          {/* Clouds */}
          <span className="tt-cloud tt-cloud--1" />
          <span className="tt-cloud tt-cloud--2" />
          <span className="tt-cloud tt-cloud--3" />
        </span>

      </span>

      {/* ── Sliding thumb ─────────────────────────────── */}
      <span className="theme-toggle-thumb" aria-hidden="true">
        {/* Icon inside thumb */}
        <span className="tt-thumb-icon">
          {/* Moon icon (shown in dark mode) */}
          <svg
            className="tt-thumb-moon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
              fill="#fbbf24"
            />
          </svg>
          {/* Sun icon (shown in light mode) */}
          <svg
            className="tt-thumb-sun"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EA580C"
            strokeWidth="2"
            strokeLinecap="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="5" fill="#fbbf24" stroke="none" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </span>
      </span>
    </button>
  );
}
