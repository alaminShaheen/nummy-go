'use client';

/**
 * src/components/ThemeToggle.tsx
 * NummyGo Theme Toggle Button
 *
 * Displays Sun in dark mode (click → switch to light)
 * Displays Moon in light mode (click → switch to dark)
 * Persists the choice to localStorage via ThemeProvider.
 */

import { useTheme } from '@/lib/themes';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { themeName, toggleTheme } = useTheme();
  const isLight = themeName === 'light';

  return (
    <button
      id="nav-theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      className={`
        relative flex items-center justify-center
        w-8 h-8 rounded-full
        transition-all duration-300 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60
        ${isLight
          ? 'bg-slate-900/10 border border-slate-900/10 text-slate-700 hover:text-violet-700 hover:border-violet-300 hover:bg-violet-50'
          : 'bg-white/5 border border-white/10 text-slate-400 hover:text-amber-400 hover:border-amber-400/30 hover:bg-amber-400/5'
        }
      `}
    >
      <span
        className={`
          absolute transition-all duration-300
          ${isLight ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}
        `}
        aria-hidden="true"
      >
        <Moon size={14} strokeWidth={2} />
      </span>
      <span
        className={`
          absolute transition-all duration-300
          ${isLight ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}
        `}
        aria-hidden="true"
      >
        <Sun size={14} strokeWidth={2} />
      </span>
    </button>
  );
}
