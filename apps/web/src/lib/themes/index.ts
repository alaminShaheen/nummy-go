/**
 * src/lib/themes/index.ts
 * Public barrel export for the NummyGo theme system.
 *
 * Usage:
 *   import { ThemeProvider, useTheme, darkTheme, lightTheme } from '@/lib/themes';
 */

export { ThemeProvider, useTheme, ThemeContext } from './ThemeProvider';
export { themes, darkTheme, lightTheme } from './tokens';
export type { ThemeName, ThemeTokens } from './types';
