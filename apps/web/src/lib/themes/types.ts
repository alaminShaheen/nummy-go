/**
 * src/lib/themes/types.ts
 * NummyGo Theme System — Type Definitions
 *
 * When adding a new theme (e.g. 'sepia', 'high-contrast', 'amoled'),
 * add its name here and create its token object in tokens.ts.
 */

export type ThemeName = 'dark' | 'light';
// Future expansions: 'sepia' | 'high-contrast' | 'amoled'

export interface CardTokens {
  bg: string;
  border: string;
  shadow: string;
  hoverShadow: string;
}

export interface TextTokens {
  primary: string;
  secondary: string;
  muted: string;
}

export interface AccentTokens {
  amber: string;
  amberHover: string;
  indigo: string;
  indigoHover: string;
}

export interface GradientTokens {
  /** Applied to text via background-clip:text  */
  text: string;
  /** Applied to the 1px gradient border wrapper */
  border: string;
}

export interface NavbarTokens {
  bg: string;
  border: string;
  /** Background of the authenticated partner pill capsule */
  pill: string;
}

export interface ScrollbarTokens {
  track: string;
  thumb: string;
}

export interface ThemeTokens {
  name: ThemeName;
  /** Page root background */
  bg: string;
  /** Elevated surface (e.g. sidebar, popover) */
  surface: string;
  card: CardTokens;
  text: TextTokens;
  accent: AccentTokens;
  gradient: GradientTokens;
  navbar: NavbarTokens;
  scrollbar: ScrollbarTokens;
}
