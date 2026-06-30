# Silvia Light Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Tony's dark "terminal" theme with a light, card-based theme inspired by CFO Silvia's dashboard — applied to the whole app, keeping Tony's orange as the accent color and adapting the structure to features Tony actually has.

**Architecture:** This is a token-and-component-level visual change only, following the same pattern as the prior dark-terminal-redesign: one source of truth (`src/app/globals.css` CSS variables) cascades to every component that consumes them, plus a small number of structural edits (sidebar active-item shape, a new serif display font, card shadows) that can't be expressed as token changes alone. No business logic, data, or routing changes.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4 (`@theme inline` token registration), TypeScript, Vitest, Playwright.

## Global Constraints

- Full theme replacement (dark → light), applied to the whole app, not just one page.
- Orange (`#ff6a00`) stays the accent color — not Silvia's mint.
- No drag-and-drop, no decorative drag-handle icons on cards — would imply a reordering affordance Tony doesn't have.
- No sidebar profile/plan row, no "Silvia Pro"-style upsell — Tony has no login or paid plans.
- No "Welcome, {name}" greeting, no "Customize"/"Add" header buttons — Tony has no logged-in identity and nothing to customize or add at the dashboard level.
- No equivalent of Silvia's "Radar" or "Connect Account" features — out of scope, future sub-projects if ever wanted.
- Serif display font (Source Serif 4) used only for: the sidebar logo and page `<h1>` titles. Everything else stays Inter (body/nav/buttons) and JetBrains Mono (financial figures) — unchanged.
- Reference spec: `docs/superpowers/specs/2026-06-30-silvia-light-redesign-design.md`

---

## Task 1: Rewrite core design tokens to the light palette

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: every CSS custom property consumed by Tailwind utility classes (`bg-bg`, `bg-surface`, `bg-surface-2`, `border-line`, `text-text`, `text-muted`, `bg-primary`, `text-primary`, `bg-primary-hover`, `bg-primary-soft`, `text-on-primary`, `bg-secondary`, `text-secondary`, `bg-secondary-deep`, `text-success`/`bg-success`, `text-danger`/`bg-danger`, `rounded-control`, `rounded-card`, `rounded-panel`) — every other task in this plan depends on these resolving to the new light values.

- [ ] **Step 1: Replace the `:root` token block**

Replace:
```css
:root {
  --bg: #0b0d10;
  --surface: #15181d;
  --surface-2: #1c2027;
  --line: #2a2f38;
  --text: #e8eaed;
  --muted: #8b92a0;

  --primary: #ff6a00;
  --primary-hover: #ff8a33;
  --primary-soft: rgba(255, 106, 0, 0.12);
  --on-primary: #1a1100;

  --secondary: #00a3ff;
  --secondary-hover: #33b6ff;
  --secondary-deep: #0d0f13;

  --success: #2ecc81;
  --danger: #f0524a;

  --radius-control: 8px;
  --radius-card: 10px;
  --radius-panel: 12px;
}
```

with:
```css
:root {
  --bg: #f7f6f3;
  --surface: #ffffff;
  --surface-2: #f1efe9;
  --line: #e7e4dd;
  --text: #1a1a1a;
  --muted: #6b6b66;

  --primary: #ff6a00;
  --primary-hover: #e85f00;
  --primary-soft: rgba(255, 106, 0, 0.10);
  --on-primary: #ffffff;

  --secondary: #0077c2;
  --secondary-hover: #1a8ad6;
  --secondary-deep: #ffffff;

  --success: #1ea672;
  --danger: #d6453d;

  --radius-control: 10px;
  --radius-card: 16px;
  --radius-panel: 18px;
}
```

(The `@theme inline { ... }` block below `:root` and the `body { ... }` block at the end of the file are unchanged — they just reference these variables by name, so they pick up the new values automatically.)

- [ ] **Step 2: Visual smoke check**

Run: `rm -rf .next && npm run build`
Expected: `✓ Compiled successfully`, no errors.

Start the dev server (`npm run dev` in the background) and open `/explorar` in a browser. Confirm the background is now a warm off-white, cards are white with visible borders, and orange buttons/badges still render in orange. It will look unstyled/inconsistent in places (sidebar shape, fonts) — that's expected, later tasks fix those.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: 51/51 passing — this task changes no text or logic, only CSS variable values, so nothing should break.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "Replace dark theme tokens with the Silvia-inspired light palette"
```

---

## Task 2: Add the serif display font and apply it to the sidebar logo

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/layout/Sidebar.tsx`

**Interfaces:**
- Produces: the `font-serif` Tailwind utility class, usable by Task 3 on the page `<h1>` elements.

- [ ] **Step 1: Load Source Serif 4 in the root layout**

Replace:
```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
```

with:
```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
});
```

Then replace:
```tsx
    <html
      lang="es"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
```

with:
```tsx
    <html
      lang="es"
      className={`${inter.variable} ${jetbrainsMono.variable} ${sourceSerif4.variable} h-full antialiased`}
    >
```

- [ ] **Step 2: Register the font as a Tailwind token**

In `src/app/globals.css`, find this line inside the `@theme inline { ... }` block:
```css
  --font-sans: var(--font-inter);
  --font-mono: var(--font-mono);
```

Replace it with:
```css
  --font-sans: var(--font-inter);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);
```

- [ ] **Step 3: Apply it to the sidebar logo**

In `src/components/layout/Sidebar.tsx`, replace:
```tsx
      <div className="mb-4 text-[18px] font-extrabold tracking-tight md:mb-6">
        Tony<span className="text-[#ff9a4d]">.</span>
      </div>
```

with:
```tsx
      <div className="mb-4 font-serif text-[20px] font-bold tracking-tight md:mb-6">
        Tony<span className="text-[#ff9a4d]">.</span>
      </div>
```

(Bumped from `text-[18px] font-extrabold` to `text-[20px] font-bold` — Source Serif 4's heavier weights read differently than Inter's at the same size and weight; this keeps the logo visually balanced against the nav items below it. Confirm visually in Step 4 and adjust the exact size by eye if it looks off — this is a judgment call, not a hard requirement.)

- [ ] **Step 4: Visual check**

With the dev server running, open `/explorar`. Confirm "Tony." in the sidebar now renders in a serif typeface, with the trailing dot still orange.

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: 51/51 passing.

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css src/components/layout/Sidebar.tsx
git commit -m "Add Source Serif 4 and apply it to the sidebar logo"
```

---

## Task 3: Apply the serif font to page titles

**Files:**
- Modify: `src/app/(dashboard)/portfolio/page.tsx`
- Modify: `src/app/(dashboard)/explorar/page.tsx`
- Modify: `src/app/(dashboard)/test/page.tsx`
- Modify: `src/app/(dashboard)/educacion/page.tsx`
- Modify: `src/app/(dashboard)/datos/page.tsx`

**Interfaces:**
- Consumes: the `font-serif` Tailwind class registered in Task 2.

- [ ] **Step 1: `src/app/(dashboard)/portfolio/page.tsx`**

Replace:
```tsx
          <h1 className="text-[24px] font-extrabold tracking-tight">Mi cartera</h1>
```
with:
```tsx
          <h1 className="font-serif text-[28px] font-bold tracking-tight">Mi cartera</h1>
```

- [ ] **Step 2: `src/app/(dashboard)/explorar/page.tsx`**

Replace:
```tsx
            <h1 className="text-[24px] font-extrabold tracking-tight">Explorar activos</h1>
```
with:
```tsx
            <h1 className="font-serif text-[28px] font-bold tracking-tight">Explorar activos</h1>
```

- [ ] **Step 3: `src/app/(dashboard)/test/page.tsx`**

Replace:
```tsx
          <h1 className="text-[24px] font-extrabold tracking-tight">Test de perfil</h1>
```
with:
```tsx
          <h1 className="font-serif text-[28px] font-bold tracking-tight">Test de perfil</h1>
```

- [ ] **Step 4: `src/app/(dashboard)/educacion/page.tsx`**

Replace:
```tsx
          <h1 className="text-[24px] font-extrabold tracking-tight">Educación</h1>
```
with:
```tsx
          <h1 className="font-serif text-[28px] font-bold tracking-tight">Educación</h1>
```

- [ ] **Step 5: `src/app/(dashboard)/datos/page.tsx`**

Replace:
```tsx
      <h1 className="mb-1 text-[24px] font-extrabold tracking-tight">Mis datos</h1>
```
with:
```tsx
      <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Mis datos</h1>
```

(`AssetDetailView.tsx`'s `<h1>` — the asset name on the detail page — is deliberately left out of this task: it's a per-asset name like "Apple Inc.", not a page title, and the spec scopes the serif treatment to page titles and the sidebar logo only.)

- [ ] **Step 6: Visual check**

With the dev server running, visit each of the 5 pages (`/portfolio`, `/explorar`, `/test`, `/educacion`, `/datos`) and confirm each page's main heading now renders in the serif font at a visibly larger size than before.

- [ ] **Step 7: Run the full test suite**

Run: `npm test` and `npm run test:e2e`
Expected: 51/51 unit tests pass; e2e tests pass too — none of the e2e assertions match on `<h1>` className, only on text content, which is unchanged.

- [ ] **Step 8: Commit**

```bash
git add "src/app/(dashboard)/portfolio/page.tsx" "src/app/(dashboard)/explorar/page.tsx" "src/app/(dashboard)/test/page.tsx" "src/app/(dashboard)/educacion/page.tsx" "src/app/(dashboard)/datos/page.tsx"
git commit -m "Apply the serif font to page titles"
```

---

## Task 4: Restyle the sidebar — white background, pill-shaped active nav item

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

**Interfaces:**
- Consumes: nothing new — uses tokens from Task 1.

- [ ] **Step 1: Add a right border to separate the sidebar from the main content**

Replace:
```tsx
    <aside className="shrink-0 bg-secondary-deep px-4 py-4 text-text md:w-[220px] md:py-6">
```
with:
```tsx
    <aside className="shrink-0 border-r border-line bg-secondary-deep px-4 py-4 text-text md:w-[220px] md:py-6">
```

- [ ] **Step 2: Replace the border-left active indicator with a pill shape**

Replace:
```tsx
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 border-l-[3px] px-3 py-2.5 text-[13px] font-semibold transition-colors",
                active
                  ? "border-primary bg-surface-2 text-text"
                  : "border-transparent text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              {item.label}
            </Link>
```
with:
```tsx
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              {item.label}
            </Link>
```

- [ ] **Step 3: Visual check**

With the dev server running, open `/explorar` and click through each sidebar item. Confirm: the sidebar has a visible thin border separating it from the main content area; the active nav item shows as a soft-orange pill (not a left border); inactive items show no border or pill, just muted text that highlights on hover.

- [ ] **Step 4: Run the full test suite**

Run: `npm test` and `npm run test:e2e`
Expected: 51/51 unit, e2e passing — no e2e test asserts on the sidebar's CSS classes, only on link text/hrefs, which are unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "Restyle sidebar with a white background and pill-shaped active nav item"
```

---

## Task 5: Add soft shadows to cards

**Files:**
- Modify: `src/components/ui/Card.tsx`

**Interfaces:**
- Consumes: nothing new.

- [ ] **Step 1: Add a soft shadow to the base Card class**

Replace:
```tsx
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface p-5",
        className,
      )}
      {...props}
    />
  );
}
```
with:
```tsx
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface p-5 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Visual check**

With the dev server running, open `/portfolio` and `/explorar` and confirm cards now show a subtle drop shadow beneath them, on top of the existing border — giving the "elevated widget" look from the spec, without any drag-handle icon (none was added; this task only touches the `Card` component's className).

- [ ] **Step 3: Run the full test suite**

Run: `npm test` and `npm run test:e2e`
Expected: 51/51 unit, e2e passing.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Card.tsx
git commit -m "Add soft shadows to cards for the elevated-widget look"
```

---

## Task 6: Final verification sweep

**Files:** none (verification only)

- [ ] **Step 1: Full clean build**

```bash
rm -rf .next
npm run build
```

Expected: `✓ Compiled successfully`, no TypeScript errors.

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Expected: no output (clean).

- [ ] **Step 3: Full test suite**

```bash
npm test
npm run test:e2e
```

Expected: 51/51 unit tests pass; 22/22 e2e tests pass.

- [ ] **Step 4: Manual visual check across the whole app**

With the dev server running and a saved profile (seed via `localStorage.setItem('t69_profile_score', '50')` in the browser console, then reload):

- `/explorar`: warm off-white background, white sidebar with a thin right border, serif "Tony." logo, pill-shaped active nav item, serif page title "Explorar activos", asset cards with visible shadow, orange badges/buttons still orange.
- Open an asset detail page (e.g. Apple): "Comisiones" and "Fiscalidad" cards (from the prior two sub-projects) render correctly on the new light theme — check that text is still legible (dark text on white/light cards, no leftover light-on-dark text colors that would now be invisible).
- `/portfolio`: serif "Mi cartera" title, allocation bars and balance figures still legible and correctly colored (success green / danger red readable on white).
- `/test`: serif "Test de perfil" title, quiz options render correctly.
- `/educacion`: serif "Educación" title, article cards readable.
- `/datos`: serif "Mis datos" title, the "Empezar de cero" reset button still visible and styled consistently.
- Confirm no leftover dark-theme artifacts: search visually for any element still using a hardcoded dark color that wasn't routed through a token (most likely candidates: anything using a literal hex/rgb color in a `className` rather than a `bg-*`/`text-*` token utility).

- [ ] **Step 5: Final commit (if Step 4 surfaced any small fixes)**

If the manual check found anything to touch up (e.g. a hardcoded color that needs to become a token reference, or a contrast issue), fix and commit it now with a message describing what was wrong. If nothing needed touching up, this step is a no-op.
