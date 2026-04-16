# NummyGo Design System

> **Canonical reference for all UI contributors and AI assistants.**
> When building or modifying any NummyGo UI element, follow this document.
> You should never need to ask "what color should I use?" or "what's the button style?" — the answer is here.

---

## 1. Brand Identity

### Who We Are
NummyGo is a **premium, direct-ordering platform** connecting hungry customers with authentic local restaurants — no middlemen, no predatory commissions. Every design decision should reinforce three qualities:

| Quality | What it means in UI |
| :--- | :--- |
| **Premium** | Sophisticated surfaces, deep shadows, crisp typography |
| **Warm** | Amber/fire tones, playful copy, delightful micro-animations |
| **Trustworthy** | High-contrast text, clear hierarchy, accessible interactive states |

### Personality
- Bold, confident, never corporate
- Warm and approachable, not childish
- Locally-rooted, globally polished

---

## 2. Theme System

NummyGo has a **time-of-day adaptive theme system**. The theme auto-selects based on the hour:

| Time | Theme |
| :--- | :--- |
| 06:00 – 20:00 | Light — "Frosted Glass" |
| 20:00 – 06:00 | Dark — "Fire and Cosmic" |

Users can override the auto-selection via the **Sun/Moon toggle** in the Navbar. The choice persists in `localStorage` under the key `nummygo-theme-override`.

### Adding a New Theme
1. Add your new `ThemeName` to `src/lib/themes/types.ts`
2. Define its full `ThemeTokens` object in `src/lib/themes/tokens.ts`
3. Register it in the `themes` map at the bottom of `tokens.ts`
4. Add the corresponding `[data-theme="your-theme"]` CSS block in `globals.css`

---

## 3. Color System

All colors live in `src/lib/themes/tokens.ts`. Never hardcode hex values in components.
Use `theme.{category}.{token}` from the `useTheme()` hook.

### Dark Theme — "Fire and Cosmic"

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `theme.bg` | `#0D1117` | Page root background |
| `theme.surface` | `#13191f` | Elevated surfaces (sidebars, popovers) |
| `theme.card.bg` | `rgba(19,25,31,0.80)` | Glassmorphism card background |
| `theme.card.border` | `rgba(255,255,255,0.06)` | Subtle card border |
| `theme.text.primary` | `#f1f5f9` | Headings, bold body text |
| `theme.text.secondary` | `#94a3b8` | Body text, descriptions |
| `theme.text.muted` | `#475569` | Captions, placeholders, fine print |
| `theme.accent.amber` | `#f59e0b` | Labels, eyebrows, icons |
| `theme.accent.indigo` | `#818cf8` | Secondary accent, indigo section labels |

### Light Theme — "Frosted Glass"

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `theme.bg` | `#F4F6FB` | Page root background (icy white-blue) |
| `theme.surface` | `#FFFFFF` | Pure white elevated surfaces |
| `theme.card.bg` | `rgba(255,255,255,0.82)` | Frosted glass card background |
| `theme.card.border` | `rgba(15,23,42,0.07)` | Hairline slate border |
| `theme.text.primary` | `#0F172A` | Headings, bold body text |
| `theme.text.secondary` | `#475569` | Body text, descriptions |
| `theme.text.muted` | `#94A3B8` | Captions, placeholders |
| `theme.accent.amber` | `#C2410C` | Labels, eyebrows (deeper for light bg) |
| `theme.accent.indigo` | `#6D28D9` | Secondary accent |

---

## 4. Gradient Rules

> **Golden rule: gradients are decorative. Interactions are solid.**

### ✅ Gradient IS used for:
- Hero headline accent words (e.g. "Local Flavour", "Every Day")
- The `nummyGo` wordmark in the Navbar
- Thin decorative borders on auth pill wrappers
- Section divider `<GradientDivider>` component
- Ambient aurora orb backgrounds in hero
- Footer brand text

### ❌ Gradient is NEVER used for:
- Call-to-action buttons (solid amber `#EA580C` or `#f59e0b` only)
- Icon backgrounds
- Input fields or form elements
- Navigation links

### Gradient Values

| Usage | Value |
| :--- | :--- |
| **Dark mode text** | `linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #818cf8 100%)` |
| **Light mode text** | `linear-gradient(135deg, #EA580C 0%, #C2410C 30%, #7C3AED 100%)` |
| **Gradient border** | Same as text gradient, applied as `background` on a 1px wrapper |

Apply gradient text with:
```css
.gradient-text {
  background: <gradient>;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```
Or use the `gradient-text` CSS utility class defined in `globals.css`.

---

## 5. Typography

| Role | Style |
| :--- | :--- |
| **Display / Hero H1** | `font-black` (900), `tracking-tight`, `leading-[1.05]` |
| **Section H2** | `font-black` (900), `text-4xl sm:text-5xl` |
| **Card H3** | `font-black` (900), `text-xl`–`text-2xl` |
| **Body** | `font-normal`, `text-base`, `leading-relaxed` |
| **Label / Eyebrow** | `text-[10px] font-bold uppercase tracking-[2.5px]` |
| **Caption / Fine print** | `text-sm text-muted` |

**Font stack:** Geist (primary) + Inter (fallback), loaded via `next/font/google`.

The `font-sans` class is applied at the `<html>` level — never override the font per-component.

---

## 6. Buttons

Always use the `<GradientButton>` component. It renders a **solid amber/orange** button — no gradients on the button surface itself.

```tsx
import { GradientButton } from '@/components/ui';

// Standard CTA
<GradientButton>Open Your Kitchen on nummyGo</GradientButton>

// With icon
<GradientButton className="text-base px-10 py-4">
  Let's Eat <ArrowRight size={18} />
</GradientButton>
```

**Do not** create custom `<button>` elements with gradient backgrounds. If a button needs a different visual treatment, extend `GradientButton`'s props or create a named variant.

---

## 7. Cards

### Glassmorphism Card (`.glass` or inline style)
Used for: feature cards, benefit cards, bento grid cards.

From tokens:
```tsx
const { theme } = useTheme();

style={{
  background: theme.card.bg,
  border: `1px solid ${theme.card.border}`,
  backdropFilter: 'blur(20px)',
  boxShadow: theme.card.shadow,
}}
```

Hover treatment (via `onMouseEnter`/`onMouseLeave`):
```tsx
el.style.boxShadow = theme.card.hoverShadow;
el.style.transform = 'translateY(-4px)';
el.style.borderColor = `${accentColor}40`;
```

Use `border-radius: 1rem` (`rounded-2xl`) on all cards. Never `rounded-lg` for main surface cards.

---

## 8. Spacing & Layout

| Token | Value | Usage |
| :--- | :--- | :--- |
| Max content width | `max-w-7xl mx-auto` | All page-level content containers |
| Page horizontal padding | `px-4 sm:px-6 lg:px-8` | Applied inside max-w-7xl |
| Section vertical padding | `py-28` | Standard section top/bottom breathing room |
| Card padding | `p-6 md:p-7` (default), `p-6 md:p-10` (tall) | Bento cards |
| Card gap | `gap-4` | Bento grid, card grids |
| Bento grid | `grid-cols-1 md:grid-cols-3 auto-rows-[200px]` | Restaurant feature grid |

---

## 9. Animations & Motion

| Animation | Duration | Easing | Usage |
| :--- | :--- | :--- | :--- |
| Card hover lift | `0.4s` | `ease` | All cards |
| Card hover shadow | `0.4s` | `ease` | All cards |
| Scroll reveal | `0.65s` | `ease` | `[data-reveal]` elements |
| Navbar glass fade | `0.3s` | `ease` | On scroll |
| Theme icon crossfade | `0.3s` | `ease-in-out` | Sun/Moon toggle |
| Aurora orb drift | `11–16s` | `ease-in-out infinite alternate` | Hero background |
| Ticker scroll | `32s` | `linear infinite` | Restaurant name ticker |
| Ember rise | `2.5–6s` | `ease-out infinite` | Hero bottom particles |

**Easing to use:** `cubic-bezier(0.4, 0, 0.2, 1)` for card transitions (matches Tailwind's `ease-in-out`).

**Never use:** `animation: all` or `transition: all` without specifying the properties. Be explicit.

---

## 10. Component Index

| Component | Location | Purpose |
| :--- | :--- | :--- |
| `GradientButton` | `@/components/ui` | Primary CTA button |
| `GradientDivider` | `@/components/ui` | Section separator with amber/indigo fade |
| `SectionLabel` | `@/components/ui` | Small eyebrow label above section headings |
| `ThemeToggle` | `@/components/ThemeToggle` | Sun/Moon theme switch |
| `AnimatedCustomerCard` | `@/components/AnimatedCustomerCard` | Customer feature card with animated SVG icon |
| `RestaurantBentoFeatures` | `@/components/RestaurantBentoFeatures` | 3-column bento grid for restaurant features |
| `VendorSearchBar` | `@/components/VendorSearchBar` | Hero + Navbar unified search |
| `Navbar` | `@/components/Navbar` | Global navigation with auth cluster |
| `CartDrawer` | `@/components/CartDrawer` | Slide-in cart panel |

---

## 11. Tone of Voice (Copy)

- **Confident and warm:** "Let's Eat", "Who's cooking tonight? (Spoiler: Not you)…"
- **Empowering for restaurants:** "Your Kitchen Command Centre", "Build a Menu That Sells"
- **Honest, no jargon:** "No upfront fees", "Free from predatory commissions"
- **Avoid:** Corporate buzzwords, passive voice, exclamation marks overuse

---

## 12. Accessibility

- All interactive elements must have `id` attributes (used for browser testing)
- Buttons must have explicit `aria-label` when icon-only
- Focus state: `focus-visible:ring-2 focus-visible:ring-amber-400/60` (applied via globals.css)
- Color contrast: light theme text (`#0F172A`) on `#F4F6FB` background passes WCAG AA
- Never convey information via color alone — pair with text or iconography
