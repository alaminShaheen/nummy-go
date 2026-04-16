'use client';

/**
 * src/lib/themes/ThemeProvider.tsx
 * NummyGo Theme System — Provider
 *
 * Auto-detects theme based on time-of-day (similar to Google Maps):
 *   06:00 – 20:00  → light theme
 *   20:00 – 06:00  → dark theme
 *
 * Priority order (highest → lowest):
 *   1. sessionStorage override  (user explicitly toggled — session-scoped only)
 *   2. Time-of-day detection    (automatic, wins on every fresh page load)
 *   3. System prefers-color-scheme (fallback)
 *
 * Using sessionStorage (not localStorage) ensures a stale manual override
 * from a previous visit never blocks the time-of-day auto-detection on a
 * fresh browser session. The override still persists across in-session
 * navigations (e.g. SPA route changes).
 *
 * Re-evaluates every 60 seconds to catch dusk/dawn transitions.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { themes, darkTheme } from './tokens';
import type { ThemeName, ThemeTokens } from './types';

const STORAGE_KEY = 'nummygo-theme-override'; // sessionStorage — session-scoped, cleared on new tab/window
const LIGHT_START_HOUR = 6;   // 6:00 AM  → switch to light
const DARK_START_HOUR  = 20;  // 8:00 PM  → switch to dark

/* ──────────────────────────────────────────────────────── */
/* Utility: determine the auto theme based on current hour */
/* ──────────────────────────────────────────────────────── */
function getAutoTheme(): ThemeName {
  const hour = new Date().getHours();
  if (hour >= LIGHT_START_HOUR && hour < DARK_START_HOUR) return 'light';
  // Fallback to system preference before defaulting to dark
  if (typeof window !== 'undefined') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  return 'dark';
}

/* ──────────────────────────────────────────────────────── */
/* Context                                                  */
/* ──────────────────────────────────────────────────────── */
interface ThemeContextValue {
  /** Full token object for the active theme */
  theme: ThemeTokens;
  /** Current theme name */
  themeName: ThemeName;
  /** Programmatically switch to a specific theme (persists to localStorage) */
  setTheme: (name: ThemeName) => void;
  /** Toggle between dark ↔ light (persists to localStorage) */
  toggleTheme: () => void;
  /** Clear localStorage override — reverts to auto time-of-day detection */
  resetToAuto: () => void;
  /** Whether the current theme was manually chosen by the user */
  isManualOverride: boolean;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme:           darkTheme,
  themeName:       'dark',
  setTheme:        () => {},
  toggleTheme:     () => {},
  resetToAuto:     () => {},
  isManualOverride: false,
});

/* ──────────────────────────────────────────────────────── */
/* Provider                                                 */
/* ──────────────────────────────────────────────────────── */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('dark'); // SSR-safe default
  const [isManualOverride, setIsManualOverride] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Apply theme to DOM — this is the single place that mutates document */
  const applyToDom = useCallback((name: ThemeName) => {
    const html = document.documentElement;
    const body = document.body;
    const t = themes[name];

    html.setAttribute('data-theme', name);
    body.style.backgroundColor = t.bg;
    body.style.color = t.text.primary;
  }, []);

  /** Switch to a specific theme and persist the choice */
  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    setIsManualOverride(true);
    sessionStorage.setItem(STORAGE_KEY, name);
    applyToDom(name);
  }, [applyToDom]);

  /** Toggle between dark ↔ light */
  const toggleTheme = useCallback(() => {
    setTheme(themeName === 'dark' ? 'light' : 'dark');
  }, [themeName, setTheme]);

  /** Reset to automatic time-of-day detection */
  const resetToAuto = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsManualOverride(false);
    const auto = getAutoTheme();
    setThemeName(auto);
    applyToDom(auto);
  }, [applyToDom]);

  /** On mount: resolve initial theme and start tick interval */
  useEffect(() => {
    // 1. Check for explicit user override in sessionStorage (session-scoped)
    const stored = sessionStorage.getItem(STORAGE_KEY) as ThemeName | null;
    if (stored && stored in themes) {
      setThemeName(stored);
      setIsManualOverride(true);
      applyToDom(stored);
    } else {
      // 2. Auto: time-of-day detection
      const auto = getAutoTheme();
      setThemeName(auto);
      applyToDom(auto);
    }

    // 3. Re-check every 60 seconds to catch dusk/dawn transitions
    intervalRef.current = setInterval(() => {
      // Only re-evaluate if the user hasn't manually overridden this session
      const currentOverride = sessionStorage.getItem(STORAGE_KEY);
      if (!currentOverride) {
        const auto = getAutoTheme();
        setThemeName(auto);
        applyToDom(auto);
      }
    }, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [applyToDom]);

  const theme = themes[themeName];

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    themeName,
    setTheme,
    toggleTheme,
    resetToAuto,
    isManualOverride,
  }), [theme, themeName, setTheme, toggleTheme, resetToAuto, isManualOverride]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Convenience hook — shorthand for useContext(ThemeContext) */
export function useTheme() {
  return useContext(ThemeContext);
}
