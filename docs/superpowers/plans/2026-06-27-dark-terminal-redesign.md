# Dark Terminal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace T69 Investment's light, rounded, soft-shadow "consumer fintech" visual theme with a single dark, dense, hairline-bordered "professional financial terminal" theme — full app coverage, orange accent retained, every financial figure rendered in monospaced tabular numerals.

**Architecture:** This is a token-and-component-level visual change only. All business logic (profile scoring, currency conversion, portfolio math, asset data) is untouched. The change flows from one source of truth (`src/app/globals.css` CSS variables) outward to components that reference those variables, plus a handful of components that hardcoded colors tied to the old palette's meaning (e.g. `secondary-deep` used to mean "navy brand ink on white" and is being repurposed to mean "near-black sidebar surface" — every place that relied on the old meaning needs an explicit fix, not just a token value swap).

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4 (`@theme inline` token registration), TypeScript, Vitest, Playwright.

## Global Constraints

- No light/dark toggle — full replacement, single theme. (Spec: "Tema: reemplazo completo y único.")
- Accent color `#FF6A00` (orange) is retained exactly as-is. (Spec: "Acento de marca: se mantiene #FF6A00.")
- Base dark color is neutral graphite, no blue tint. (Spec: "Base oscura: grafito neutro, sin tinte azulado.")
- No business logic changes — purely visual. (Spec: "Fuera de alcance: no se toca la lógica de negocio.")
- Every financial figure (price, %, ratio, balance, units) renders in `font-mono` + `tabular-nums`. (Spec: "Tipografía.")
- Radii: control 8px, card 10px, panel 12px. Soft shadows removed entirely, hairline 1px borders (`--line`) are the only separation technique. (Spec: "Forma, densidad y elevación.")
- Reference spec: `docs/superpowers/specs/2026-06-27-dark-terminal-redesign-design.md`

---

## Task 1: Rewrite core design tokens

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: every CSS custom property consumed by Tailwind utility classes (`bg-bg`, `bg-surface`, `bg-surface-2`, `border-line`, `text-text`, `text-muted`, `bg-primary`, `text-primary`, `bg-primary-hover`, `bg-primary-soft`, `text-on-primary`, `bg-secondary`, `text-secondary`, `bg-secondary-hover`, `bg-secondary-deep`, `text-success`/`bg-success`, `text-danger`/`bg-danger`, `rounded-control`, `rounded-card`, `rounded-panel`) used by every other task in this plan.

- [ ] **Step 1: Replace the entire contents of `globals.css`**

```css
@import "tailwindcss";

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

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-line: var(--line);
  --color-text: var(--text);
  --color-muted: var(--muted);

  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-soft: var(--primary-soft);
  --color-on-primary: var(--on-primary);

  --color-secondary: var(--secondary);
  --color-secondary-hover: var(--secondary-hover);
  --color-secondary-deep: var(--secondary-deep);

  --color-success: var(--success);
  --color-danger: var(--danger);

  --radius-control: var(--radius-control);
  --radius-card: var(--radius-card);
  --radius-panel: var(--radius-panel);

  --font-sans: var(--font-inter);
  --font-mono: var(--font-mono);
}

body {
  background: var(--bg);
  color: var(--text);
}
```

Note: `--shadow-card` is intentionally removed (not just emptied) — Tailwind's `box-shadow` multi-value syntax breaks if one layer is the literal keyword `none` mixed with other shadow layers. Tasks 6 and 10 remove the two remaining `shadow-card` class references in component code instead of relying on a neutered token.

- [ ] **Step 2: Verify the build picks up the new tokens**

Run: `npm run build`
Expected: `✓ Compiled successfully` — no Tailwind errors about unknown utilities (if there were any utilities depending on a token we removed, the build would still succeed since Tailwind just wouldn't generate that class; the real check happens visually in Task 13).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "Replace light fintech palette with dark terminal tokens"
```

---

## Task 2: Numeric formatting utility + Button contrast fix

**Files:**
- Modify: `src/lib/format.ts`
- Modify: `src/components/ui/Button.tsx`

**Interfaces:**
- Produces: `NUM_CLASS` (string constant, exported from `@/lib/format`) — every later task that renders a financial figure imports and applies this.

- [ ] **Step 1: Add the `NUM_CLASS` constant to `format.ts`**

Add this as the first export in `src/lib/format.ts` (before `formatBigEur`):

```ts
export const NUM_CLASS = "font-mono tabular-nums";

```

- [ ] **Step 2: Fix Button contrast and remove the stale ghost-variant text color**

In `src/components/ui/Button.tsx`, replace:

```tsx
const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  ghost: "bg-surface text-secondary-deep border border-line hover:bg-surface-2",
};
```

with:

```tsx
const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  ghost: "bg-surface text-text border border-line hover:bg-surface-2",
};
```

(White text on `#FF6A00` fails WCAG AA contrast; `--on-primary` is a near-black tuned for it. The ghost variant's `text-secondary-deep` relied on the old "navy ink" meaning of that token, which Task 1 repurposed to "near-black sidebar surface" — using it as text color now would be nearly invisible, so it becomes `text-text`.)

- [ ] **Step 3: Run the unit test suite to confirm nothing broke**

Run: `npm test`
Expected: `Test Files  3 passed (3)` / `Tests  29 passed (29)` (these tests assert behavior and text content, not color, so they should be unaffected by this purely visual change — a failure here would mean something structural broke).

- [ ] **Step 4: Commit**

```bash
git add src/lib/format.ts src/components/ui/Button.tsx
git commit -m "Add NUM_CLASS helper and fix Button contrast on dark surfaces"
```

---

## Task 3: Clean up stray `secondary-deep` usages across small components

**Why this is one task:** Task 1 repurposed `--secondary-deep` from "navy brand ink, readable as text on white" to "near-black sidebar background." Every place in the codebase that used it as a **text color** or as an **active-state background on a small dark-page chip** needs an explicit fix — otherwise those usages either go invisible (near-black text on a dark page) or render an active toggle that's indistinguishable from its inactive state (near-black "active" background on an already-near-black page). These are small, mechanical, same-shaped fixes across many files, so they're grouped into one task with one commit.

**Files:**
- Modify: `src/components/ui/Pill.tsx`
- Modify: `src/components/ui/AssetCard.tsx`
- Modify: `src/components/ui/FilterPill.tsx`
- Modify: `src/components/ui/PriceChart.tsx`
- Modify: `src/components/ui/DcaCalculator.tsx`
- Modify: `src/app/(dashboard)/datos/page.tsx`
- Modify: `src/app/(dashboard)/explorar/AssetDetailView.tsx`

**Interfaces:**
- Consumes: `--secondary` token (already produced by Task 1) as the replacement for stray `text-secondary-deep` usages.

- [ ] **Step 1: Fix `Pill.tsx` blue tone text color**

Replace:

```tsx
const toneClasses: Record<Tone, string> = {
  orange: "bg-primary-soft text-primary-hover",
  blue: "bg-surface-2 text-secondary-deep",
};
```

with:

```tsx
const toneClasses: Record<Tone, string> = {
  orange: "bg-primary-soft text-primary-hover",
  blue: "bg-surface-2 text-secondary",
};
```

- [ ] **Step 2: Fix `AssetCard.tsx` ticker badge text color**

Replace:

```tsx
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10.5px] font-bold text-secondary-deep">
          {asset.ticker}
        </span>
```

with:

```tsx
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10.5px] font-bold text-secondary">
          {asset.ticker}
        </span>
```

- [ ] **Step 3: Fix `FilterPill.tsx` active state**

Replace:

```tsx
        active
          ? "bg-secondary-deep text-white"
          : "border border-line bg-surface text-muted hover:bg-surface-2",
```

with:

```tsx
        active
          ? "border border-primary/40 bg-surface-2 text-primary"
          : "border border-line bg-surface text-muted hover:bg-surface-2",
```

- [ ] **Step 4: Fix `PriceChart.tsx` range-button active state**

Replace:

```tsx
              range === r.key
                ? "bg-secondary-deep text-white"
                : "text-muted hover:bg-surface-2",
```

with:

```tsx
              range === r.key
                ? "border border-primary/40 bg-surface-2 text-primary"
                : "text-muted hover:bg-surface-2",
```

- [ ] **Step 5: Fix `DcaCalculator.tsx` legend swatch and chart line color**

Replace:

```tsx
        <polyline
          points={toPoints(periodicSeries)}
          fill="none"
          stroke="#0a2a66"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
        />
```

with:

```tsx
        <polyline
          points={toPoints(periodicSeries)}
          fill="none"
          stroke="#00a3ff"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
        />
```

Replace:

```tsx
        <span className="flex items-center gap-1.5 text-muted">
          <span className="inline-block h-0.5 w-4 bg-secondary-deep" /> Aportación periódica
          (mensual)
        </span>
```

with:

```tsx
        <span className="flex items-center gap-1.5 text-muted">
          <span className="inline-block h-0.5 w-4 bg-secondary" /> Aportación periódica
          (mensual)
        </span>
```

(The "aportación periódica" line was hardcoded navy `#0a2a66` — a literal hex tied to the old brand-navy concept, not a CSS variable. Since the redesign retires navy as a UI color entirely, this line switches to the existing electric-blue `--secondary` accent, matching its legend swatch.)

- [ ] **Step 6: Fix `datos/page.tsx` confirmation message color**

Replace:

```tsx
        {message && <p className="mt-2 text-[12.5px] font-semibold text-secondary-deep">{message}</p>}
```

with:

```tsx
        {message && <p className="mt-2 text-[12.5px] font-semibold text-secondary">{message}</p>}
```

- [ ] **Step 7: Fix `AssetDetailView.tsx` link colors (two occurrences)**

Replace:

```tsx
        className="mb-4 text-[13px] font-semibold text-secondary-deep"
      >
        ← Volver al mercado
```

with:

```tsx
        className="mb-4 text-[13px] font-semibold text-secondary"
      >
        ← Volver al mercado
```

Replace:

```tsx
            className="mt-3 w-full text-center text-[12.5px] font-semibold text-secondary-deep"
          >
            Ver en mi cartera →
```

with:

```tsx
            className="mt-3 w-full text-center text-[12.5px] font-semibold text-secondary"
          >
            Ver en mi cartera →
```

- [ ] **Step 8: Confirm no stray `text-secondary-deep` or `bg-secondary-deep` usages remain outside `Sidebar.tsx` and `Topbar.tsx`**

Run: `grep -rn "secondary-deep" src/`
Expected: only `src/components/layout/Sidebar.tsx` (the `aside` background — intentional, that's the new sidebar surface) and `src/components/layout/Topbar.tsx` (fixed in Task 5).

- [ ] **Step 9: Run the unit test suite**

Run: `npm test`
Expected: `Tests  29 passed (29)`

- [ ] **Step 10: Commit**

```bash
git add src/components/ui/Pill.tsx src/components/ui/AssetCard.tsx src/components/ui/FilterPill.tsx src/components/ui/PriceChart.tsx src/components/ui/DcaCalculator.tsx "src/app/(dashboard)/datos/page.tsx" "src/app/(dashboard)/explorar/AssetDetailView.tsx"
git commit -m "Fix components relying on the old secondary-deep meaning"
```

---

## Task 4: Redesign Sidebar active-item indicator

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

**Interfaces:**
- Consumes: `--primary`, `--surface-2`, `--text`, `--muted` tokens (Task 1).

- [ ] **Step 1: Replace the active/inactive nav-item styling**

Replace the full file content:

```tsx
"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/test", label: "Test de perfil" },
  { href: "/portfolio", label: "Mi cartera" },
  { href: "/explorar", label: "Explorar activos" },
  { href: "/educacion", label: "Educación" },
  { href: "/datos", label: "Mis datos" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="shrink-0 bg-secondary-deep px-4 py-4 text-text md:w-[220px] md:py-6">
      <div className="mb-4 text-[18px] font-extrabold tracking-tight md:mb-6">
        T69<span className="text-[#ff9a4d]">.</span>
      </div>
      <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
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
          );
        })}
      </nav>
    </aside>
  );
}
```

(Two changes from the original: the `aside` text color goes from the literal `text-white` to `text-text` — on the new graphite theme `--text` already resolves to an off-white, so this just removes a redundant hardcoded color. The active nav item drops the rounded white-overlay pill in favor of a 3px orange left border, per spec.)

- [ ] **Step 2: Visually verify in the dev server**

Run: `npm run dev` (if not already running), open `http://localhost:3000/test`
Expected: sidebar background is near-black, "Test de perfil" (the active route) shows an orange left border, other items are muted gray text with no border.

- [ ] **Step 3: Run the e2e suite**

Run: `npm run test:e2e`
Expected: `7 passed` — none of the e2e specs assert on sidebar color/border, only on navigation/text, so this should be unaffected.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "Redesign sidebar active-item indicator as a left border accent"
```

---

## Task 5: Fix Topbar currency-toggle active state and hover

**Files:**
- Modify: `src/components/layout/Topbar.tsx`

**Interfaces:**
- Consumes: `--primary`, `--surface-2` tokens (Task 1).

- [ ] **Step 1: Replace `CurrencyButton`'s className logic**

Replace:

```tsx
      className={cn(
        "h-8 w-8 rounded-full text-[13px] font-bold transition-colors",
        active ? "bg-secondary-deep text-white" : "text-muted hover:bg-white/60",
      )}
```

with:

```tsx
      className={cn(
        "h-8 w-8 rounded-full text-[13px] font-bold transition-colors",
        active
          ? "border border-primary/40 bg-surface-2 text-primary"
          : "text-muted hover:bg-surface-2",
      )}
```

(`hover:bg-white/60` was a near-white hover wash designed for a light page — on the dark theme it would flash a bright white circle on hover, which is wrong. It becomes `hover:bg-surface-2`, consistent with every other hover state in the app.)

- [ ] **Step 2: Visually verify**

Open `http://localhost:3000/portfolio`, click the `$` toggle in the top-right pill.
Expected: the active currency button shows a thin orange border + orange text on a slightly lighter dark background; the inactive one is muted gray; hovering the inactive one shows a subtle gray highlight, not a white flash.

- [ ] **Step 3: Run the e2e suite**

Run: `npm run test:e2e`
Expected: `7 passed` — the currency-toggle e2e spec (`currency-and-data.spec.ts`) asserts on the button's accessible name and resulting converted values, not its color, so it should still pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Topbar.tsx
git commit -m "Fix Topbar currency toggle active/hover states for dark theme"
```

---

## Task 6: Rewrite OptionCard active style

**Files:**
- Modify: `src/components/ui/OptionCard.tsx`

**Interfaces:**
- Consumes: nothing new (uses arbitrary rgba values directly, sidestepping any opacity-modifier-on-already-translucent-token issue).

- [ ] **Step 1: Replace the active/inactive className logic**

Replace:

```tsx
      className={cn(
        "rounded-2xl border p-4 text-left transition-colors",
        active
          ? "border-[#ffb380] bg-gradient-to-b from-surface to-primary-soft/40 shadow-card"
          : "border-line bg-surface hover:bg-surface-2",
      )}
```

with:

```tsx
      className={cn(
        "rounded-card border p-4 text-left transition-colors",
        active
          ? "border-[rgba(255,106,0,.5)] bg-[rgba(255,106,0,.06)]"
          : "border-line bg-surface hover:bg-surface-2",
      )}
```

(Also swaps `rounded-2xl` — Tailwind's hardcoded 16px native scale, unrelated to our tokens — for `rounded-card`, which resolves to the new 10px token from Task 1. This matters: changing `--radius-card` in `globals.css` has **no effect** on any element using the literal `rounded-2xl`/`rounded-xl` classes, since those map to Tailwind's own built-in spacing-derived radius scale, not our custom property. Task 12 below sweeps the rest of these literal-radius usages.)

(The old style was a white-to-pastel gradient + soft shadow — both ideas that don't exist in this theme. The new style is a single subtle orange-tinted background with a matching border, written as explicit `rgba()` arbitrary values rather than composing Tailwind's `/opacity` modifier on top of `--primary-soft` — which is now itself an `rgba()` value, and stacking an opacity modifier on an already-translucent color produces unpredictable results.)

- [ ] **Step 2: Visually verify in the test flow**

Open `http://localhost:3000/test`, click any answer option.
Expected: the selected option shows a warm, subtle orange-tinted background and a soft orange border — no gradient, no drop shadow, no leftover light-gray base showing through.

- [ ] **Step 3: Run the e2e suite**

Run: `npm run test:e2e`
Expected: `7 passed` — `test-profile.spec.ts` clicks options by role and checks resulting state, not color.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/OptionCard.tsx
git commit -m "Replace OptionCard active gradient/shadow with a flat tinted style"
```

---

## Task 7: Redesign KpiCard and StatGrid

**Files:**
- Modify: `src/components/ui/KpiCard.tsx`
- Modify: `src/components/ui/StatGrid.tsx`

**Interfaces:**
- Consumes: `NUM_CLASS` from `@/lib/format` (Task 2).
- Produces: every numeric value passed into `<KpiCard>` or `<StatGrid stats={...}>` now automatically renders in `font-mono tabular-nums` — callers don't need to do anything themselves. This is what makes the "Valoración y ratios," "Dividendos," "Rentabilidad y riesgo," and "Cotización" sections of `AssetDetailView.tsx`, plus the portfolio KPI row, compliant with the "every figure is monospaced" rule without touching those call sites.

- [ ] **Step 1: Replace `KpiCard.tsx`**

```tsx
import { cn } from "@/lib/cn";
import { NUM_CLASS } from "@/lib/format";

interface KpiCardProps {
  label: string;
  value: string;
  tone?: "default" | "up" | "down";
}

const toneClasses = {
  default: "text-text",
  up: "text-success",
  down: "text-danger",
};

export function KpiCard({ label, value, tone = "default" }: KpiCardProps) {
  return (
    <div className="rounded-control bg-surface-2 p-3.5">
      <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className={cn(NUM_CLASS, "text-xl font-extrabold tracking-tight", toneClasses[tone])}>
        {value}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `StatGrid.tsx`**

```tsx
import { cn } from "@/lib/cn";
import { NUM_CLASS } from "@/lib/format";

export interface Stat {
  label: string;
  value: string;
  tone?: "default" | "up" | "down";
}

const toneClasses = {
  default: "text-text",
  up: "text-success",
  down: "text-danger",
};

export function StatGrid({ stats, columns = 3 }: { stats: Stat[]; columns?: 2 | 3 }) {
  return (
    <div
      className={cn(
        "grid gap-2.5",
        columns === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3",
      )}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-control bg-surface-2 p-3.5">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            {stat.label}
          </div>
          <div
            className={cn(NUM_CLASS, "text-[16px] font-bold", toneClasses[stat.tone ?? "default"])}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
```

(Both: `rounded-2xl` → `rounded-control` per the new sharper radius scale; label text becomes uppercase + tracked, the terminal-style convention; value gains `NUM_CLASS`. Note `Stat.value` is typed `string` and sometimes contains non-numeric text, e.g. "Mercado cripto 24/7" or a date like "11/05/2026" — `font-mono tabular-nums` on text is harmless, it just renders in the monospace font, which is visually fine and consistent with the rest of the terminal aesthetic.)

- [ ] **Step 3: Visually verify**

Open `http://localhost:3000/portfolio` (KPI row) and `http://localhost:3000/explorar` → any stock (e.g. Apple) → scroll to "Valoración y ratios".
Expected: KPI labels are uppercase and tracked, values are monospaced and aligned; stat tiles in "Valoración y ratios" show the same treatment.

- [ ] **Step 4: Run the full test suite**

Run: `npm test && npm run test:e2e`
Expected: `Tests  29 passed (29)` and `7 passed` — these components are pure presentation wrappers around text content the tests already assert on; no text changed, only styling.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/KpiCard.tsx src/components/ui/StatGrid.tsx
git commit -m "Apply monospaced tabular numerals and terminal-style labels to KpiCard/StatGrid"
```

---

## Task 8: Fix AnalystBar visibility and numeral formatting

**Files:**
- Modify: `src/components/ui/AnalystBar.tsx`

**Interfaces:**
- Consumes: `NUM_CLASS` from `@/lib/format` (Task 2).

- [ ] **Step 1: Replace the full file content**

```tsx
import { AnalystRecommendation } from "@/lib/assetDetails";
import { cn } from "@/lib/cn";
import { NUM_CLASS } from "@/lib/format";

export function AnalystBar({ recommendation }: { recommendation: AnalystRecommendation }) {
  const { buy, hold, sell } = recommendation;
  const total = buy + hold + sell;
  const consensus = buy >= hold && buy >= sell ? "Compra" : hold >= sell ? "Mantener" : "Venta";

  return (
    <div>
      <div className="mb-2.5 flex h-2.5 overflow-hidden rounded-full bg-surface-2">
        <div style={{ width: `${(buy / total) * 100}%` }} className="bg-success" />
        <div style={{ width: `${(hold / total) * 100}%` }} className="bg-primary/35" />
        <div style={{ width: `${(sell / total) * 100}%` }} className="bg-danger" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
        <div className="flex gap-4">
          <span>
            <strong className={cn(NUM_CLASS, "text-success")}>{buy}</strong>{" "}
            <span className="text-muted">comprar</span>
          </span>
          <span>
            <strong className={NUM_CLASS}>{hold}</strong>{" "}
            <span className="text-muted">mantener</span>
          </span>
          <span>
            <strong className={cn(NUM_CLASS, "text-danger")}>{sell}</strong>{" "}
            <span className="text-muted">vender</span>
          </span>
        </div>
        <span className="text-muted">
          <span className={NUM_CLASS}>{total}</span> analistas · consenso:{" "}
          <strong className="text-text">{consensus}</strong>
        </span>
      </div>
    </div>
  );
}
```

(The "hold" segment used `bg-primary-soft`, which Task 1 redefined as a 12%-opacity rgba — at that opacity, the middle segment of the stacked bar would nearly disappear against the `bg-surface-2` track, making the chart look broken. `bg-primary/35` applies a 35% opacity modifier directly to the solid `--primary` token instead, which stays clearly visible as a distinct segment. This is a different use case from `Pill`'s `bg-primary-soft` — a literal bar segment needs to read as a color, not just a tint — so it gets its own treatment rather than reusing the soft-chip token.)

- [ ] **Step 2: Visually verify**

Open `http://localhost:3000/explorar` → Apple → scroll to "Recomendación de analistas".
Expected: three clearly distinct segments (green/orange/red) in the bar, all three counts rendered in monospaced digits.

- [ ] **Step 3: Run the unit test suite**

Run: `npm test`
Expected: `Tests  29 passed (29)`

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/AnalystBar.tsx
git commit -m "Fix AnalystBar hold-segment visibility and use mono numerals"
```

---

## Task 9: Chart opacity and DcaCalculator numeral formatting

**Files:**
- Modify: `src/components/ui/PriceChart.tsx`
- Modify: `src/components/ui/DcaCalculator.tsx`

**Interfaces:**
- Consumes: `NUM_CLASS` from `@/lib/format` (Task 2).

**Note on scope vs. the spec:** the spec's component table lists "PriceChart.tsx, DcaCalculator.tsx, FinancialsChart.tsx" together under "opacidad del área rellena sube de 8% a 12%." Only `PriceChart.tsx` actually has a translucent filled area (the `<polygon>` below) — `DcaCalculator.tsx` renders two plain `<polyline>`s with no fill, and `FinancialsChart.tsx` renders solid (non-translucent) bars. There is nothing to bump in those two files; this task instead applies their share of the spec's "todo número financiero en monoespaciada" rule (DcaCalculator's slider readouts and result cards). `FinancialsChart.tsx` needs no changes in this plan: its bar colors are solid hex values unrelated to opacity, and its only text (series legend labels, year labels) is not a financial figure under the spec's definition (see Task 11's reasoning for the same distinction applied to chart axis labels).

- [ ] **Step 1: Bump the price-chart area-fill opacity**

In `PriceChart.tsx`, replace:

```tsx
        <polygon points={areaPoints} fill={color} opacity="0.08" />
```

with:

```tsx
        <polygon points={areaPoints} fill={color} opacity="0.12" />
```

(A translucent fill calibrated for a white page background reads fainter against the new near-black page; 12% restores the same visual weight.)

- [ ] **Step 2: Apply `NUM_CLASS` to the DCA calculator's slider readouts**

In `DcaCalculator.tsx`, inside the `SliderField` function, replace:

```tsx
      <div className="mb-1.5 flex items-baseline justify-between text-[12.5px]">
        <span className="text-muted">{label}</span>
        <span className="font-bold">{display}</span>
      </div>
```

with:

```tsx
      <div className="mb-1.5 flex items-baseline justify-between text-[12.5px]">
        <span className="text-muted">{label}</span>
        <span className={`${NUM_CLASS} font-bold`}>{display}</span>
      </div>
```

(Add the import: in the existing `import { monthLabel } from "@/lib/format";` line, change it to `import { monthLabel, NUM_CLASS } from "@/lib/format";`.)

- [ ] **Step 3: Apply `NUM_CLASS` to the three results cards**

Replace:

```tsx
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-2xl bg-surface-2 p-3.5">
          <div className="mb-1 text-[11px] text-muted">Aportado</div>
          <div className="text-[16px] font-bold">{fmt(contributed)}</div>
        </div>
        <div className="rounded-2xl bg-surface-2 p-3.5">
          <div className="mb-1 text-[11px] text-muted">Hoy (mensual)</div>
          <div className="text-[16px] font-bold text-success">{fmt(periodicFinal)}</div>
        </div>
        <div className="rounded-2xl bg-surface-2 p-3.5">
          <div className="mb-1 text-[11px] text-muted">Hoy (de golpe)</div>
          <div className="text-[16px] font-bold text-success">{fmt(lumpFinal)}</div>
        </div>
      </div>
```

with:

```tsx
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-control bg-surface-2 p-3.5">
          <div className="mb-1 text-[11px] text-muted">Aportado</div>
          <div className={`${NUM_CLASS} text-[16px] font-bold`}>{fmt(contributed)}</div>
        </div>
        <div className="rounded-control bg-surface-2 p-3.5">
          <div className="mb-1 text-[11px] text-muted">Hoy (mensual)</div>
          <div className={`${NUM_CLASS} text-[16px] font-bold text-success`}>
            {fmt(periodicFinal)}
          </div>
        </div>
        <div className="rounded-control bg-surface-2 p-3.5">
          <div className="mb-1 text-[11px] text-muted">Hoy (de golpe)</div>
          <div className={`${NUM_CLASS} text-[16px] font-bold text-success`}>{fmt(lumpFinal)}</div>
        </div>
      </div>
```

- [ ] **Step 4: Visually verify**

Open `http://localhost:3000/explorar` → any asset → "¿Cuánto tendrías hoy?".
Expected: slider value readouts and the three result cards render in monospaced digits; the price chart's filled area is clearly visible against the dark background at every range button (1m/6m/1y/5y/max).

- [ ] **Step 5: Run the full test suite**

Run: `npm test && npm run test:e2e`
Expected: `Tests  29 passed (29)` and `7 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/PriceChart.tsx src/components/ui/DcaCalculator.tsx
git commit -m "Bump price chart fill opacity and apply mono numerals to DCA calculator"
```

---

## Task 10: Flatten the dashboard shell background

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`

**Interfaces:**
- Consumes: `--bg` token (Task 1).

- [ ] **Step 1: Replace the light gradient and drop the now-removed `shadow-card` class**

Replace:

```tsx
    <div className="mx-auto flex min-h-screen w-full max-w-[1100px] flex-col overflow-hidden border-line bg-surface md:my-6 md:flex-row md:rounded-card md:border md:shadow-card">
      <Sidebar />
      <div className="flex-1 bg-gradient-to-b from-surface to-[#f7fafe] p-4 md:p-6">
        <Topbar />
        {children}
      </div>
    </div>
```

with:

```tsx
    <div className="mx-auto flex min-h-screen w-full max-w-[1100px] flex-col overflow-hidden border-line bg-surface md:my-6 md:flex-row md:rounded-card md:border">
      <Sidebar />
      <div className="flex-1 bg-bg p-4 md:p-6">
        <Topbar />
        {children}
      </div>
    </div>
```

(`to-[#f7fafe]` was a literal near-white hex for the old light gradient — meaningless on a dark theme. The content pane becomes a flat `--bg` fill, visually distinct from the `--surface` cards rendered on top of it via their own borders.)

- [ ] **Step 2: Visually verify**

Open `http://localhost:3000/test` (or any route).
Expected: the whole app shell renders on a flat dark background with no leftover light gradient anywhere; cards stand out from the page via their hairline border, not a shadow.

- [ ] **Step 3: Run the full test suite**

Run: `npm test && npm run test:e2e`
Expected: `Tests  29 passed (29)` and `7 passed`.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(dashboard)/layout.tsx"
git commit -m "Flatten dashboard shell background, drop unused shadow-card class"
```

---

## Task 11: Apply mono numerals to AssetDetailView header/balance and Portfolio positions

**Files:**
- Modify: `src/app/(dashboard)/explorar/AssetDetailView.tsx`
- Modify: `src/app/(dashboard)/portfolio/page.tsx`

**Interfaces:**
- Consumes: `NUM_CLASS` from `@/lib/format` (Task 2). Note: `StatGrid` and `KpiCard` (Task 7) already apply `NUM_CLASS` internally, so the "Cotización," "Valoración y ratios," "Dividendos," "Rentabilidad y riesgo" sections of `AssetDetailView.tsx` and the KPI row of `portfolio/page.tsx` need **no changes here** — this task only covers the few numeric values that bypass those two shared components.

- [ ] **Step 1: Add `NUM_CLASS` to the `AssetDetailView.tsx` import line**

Replace:

```tsx
import { formatBigEur, formatDateEs, formatNumber, formatPct } from "@/lib/format";
```

with:

```tsx
import { formatBigEur, formatDateEs, formatNumber, formatPct, NUM_CLASS } from "@/lib/format";
```

- [ ] **Step 2: Apply it to the header price/change block**

Replace:

```tsx
          <div className="text-right">
            <div className="text-[20px] font-extrabold tracking-tight">
              {fmtAsset(asset.price)}
            </div>
            <div className={`text-[13px] font-bold ${up ? "text-success" : "text-danger"}`}>
              {formatPct(asset.changePct)}
            </div>
          </div>
```

with:

```tsx
          <div className="text-right">
            <div className={`${NUM_CLASS} text-[20px] font-extrabold tracking-tight`}>
              {fmtAsset(asset.price)}
            </div>
            <div
              className={`${NUM_CLASS} text-[13px] font-bold ${up ? "text-success" : "text-danger"}`}
            >
              {formatPct(asset.changePct)}
            </div>
          </div>
```

- [ ] **Step 3: Apply it to the five Balance rows**

Replace:

```tsx
          <div className="divide-y divide-line/60 text-[13px]">
            <Row label="Activos totales" value={formatBigEur(detail.balanceSheet.totalAssets)} />
            <Row
              label="Pasivos totales"
              value={formatBigEur(detail.balanceSheet.totalLiabilities)}
            />
            <Row label="Caja y equivalentes" value={formatBigEur(detail.balanceSheet.cash)} />
            <Row
              label="Deuda a largo plazo"
              value={formatBigEur(detail.balanceSheet.longTermDebt)}
            />
            <Row label="Patrimonio neto" value={formatBigEur(detail.balanceSheet.equity)} />
          </div>
```

with:

```tsx
          <div className="divide-y divide-line/60 text-[13px]">
            <Row
              label="Activos totales"
              value={formatBigEur(detail.balanceSheet.totalAssets)}
              valueClassName={NUM_CLASS}
            />
            <Row
              label="Pasivos totales"
              value={formatBigEur(detail.balanceSheet.totalLiabilities)}
              valueClassName={NUM_CLASS}
            />
            <Row
              label="Caja y equivalentes"
              value={formatBigEur(detail.balanceSheet.cash)}
              valueClassName={NUM_CLASS}
            />
            <Row
              label="Deuda a largo plazo"
              value={formatBigEur(detail.balanceSheet.longTermDebt)}
              valueClassName={NUM_CLASS}
            />
            <Row
              label="Patrimonio neto"
              value={formatBigEur(detail.balanceSheet.equity)}
              valueClassName={NUM_CLASS}
            />
          </div>
```

- [ ] **Step 4: Apply `NUM_CLASS` to the Portfolio positions list P/L figures**

In `src/app/(dashboard)/portfolio/page.tsx`, add the import. Replace:

```tsx
import { convert, formatCurrency, useCurrency } from "@/lib/useCurrency";
```

with:

```tsx
import { convert, formatCurrency, useCurrency } from "@/lib/useCurrency";
import { NUM_CLASS } from "@/lib/format";
```

Then replace:

```tsx
              <div>
                <div className="text-[13px] font-semibold">{p.asset.name}</div>
                <div className="text-[11.5px] text-muted">
                  {p.units.toFixed(4)} uds · {fmt(p.valueEur)}
                </div>
              </div>
              <span
                className={`text-[13px] font-bold ${p.plEur >= 0 ? "text-success" : "text-danger"}`}
              >
                {p.plEur >= 0 ? "+" : ""}
                {fmt(p.plEur)}
              </span>
```

with:

```tsx
              <div>
                <div className="text-[13px] font-semibold">{p.asset.name}</div>
                <div className={`${NUM_CLASS} text-[11.5px] text-muted`}>
                  {p.units.toFixed(4)} uds · {fmt(p.valueEur)}
                </div>
              </div>
              <span
                className={`${NUM_CLASS} text-[13px] font-bold ${
                  p.plEur >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {p.plEur >= 0 ? "+" : ""}
                {fmt(p.plEur)}
              </span>
```

- [ ] **Step 5: Visually verify**

Open `http://localhost:3000/explorar` → Apple (header price/change, and scroll to "Balance"). Open `http://localhost:3000/portfolio` with at least one position (buy something from Explorar first if the portfolio is empty).
Expected: header price/change, all five balance figures, and every position's units/value/P&L line render in monospaced tabular digits.

- [ ] **Step 6: Run the full test suite**

Run: `npm test && npm run test:e2e`
Expected: `Tests  29 passed (29)` and `7 passed`.

- [ ] **Step 7: Commit**

```bash
git add "src/app/(dashboard)/explorar/AssetDetailView.tsx" "src/app/(dashboard)/portfolio/page.tsx"
git commit -m "Apply mono numerals to remaining asset detail and portfolio figures"
```

---

## Task 12: Sweep remaining literal Tailwind radius classes to project tokens

**Why this is its own task:** `--radius-card`/`--radius-control` (Task 1) only affect elements using the `rounded-card`/`rounded-control` utility classes. Several components were written using Tailwind's own built-in `rounded-xl` (12px, hardcoded) or `rounded-2xl` (16px, hardcoded) instead — those are unrelated utilities and silently keep the old bubbly radius no matter what Task 1 changes. This is a mechanical sweep, grouped into one task like Task 3.

**Files:**
- Modify: `src/components/ui/AssetCard.tsx`
- Modify: `src/app/(dashboard)/explorar/AssetDetailView.tsx`
- Modify: `src/app/(dashboard)/explorar/page.tsx`
- Modify: `src/app/(dashboard)/portfolio/page.tsx`

**Interfaces:**
- Consumes: `--radius-card` / `--radius-control` tokens (Task 1), exposed as the `rounded-card` / `rounded-control` Tailwind utility classes.

- [ ] **Step 1: Fix `AssetCard.tsx`**

Replace:

```tsx
      className="rounded-2xl border border-line bg-surface p-4 text-left transition-colors hover:bg-surface-2"
```

with:

```tsx
      className="rounded-card border border-line bg-surface p-4 text-left transition-colors hover:bg-surface-2"
```

- [ ] **Step 2: Fix `AssetDetailView.tsx` (two occurrences)**

Replace:

```tsx
          className="mb-4 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] font-semibold outline-none focus:border-secondary"
```

with:

```tsx
          className="mb-4 w-full rounded-control border border-line bg-surface px-3.5 py-2.5 text-[14px] font-semibold outline-none focus:border-secondary"
```

Replace:

```tsx
        <div className="mb-4 rounded-xl bg-surface-2 p-4">
```

with:

```tsx
        <div className="mb-4 rounded-control bg-surface-2 p-4">
```

- [ ] **Step 3: Fix `explorar/page.tsx` search input**

Replace:

```tsx
          className="w-full max-w-[280px] rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13px] outline-none focus:border-secondary"
```

with:

```tsx
          className="w-full max-w-[280px] rounded-control border border-line bg-surface px-3.5 py-2.5 text-[13px] outline-none focus:border-secondary"
```

- [ ] **Step 4: Fix `portfolio/page.tsx` empty-state hint boxes (two occurrences)**

Replace both instances of:

```tsx
            <div className="rounded-xl bg-surface-2 p-3 text-[12.5px] text-muted">
```

(one inside the "Añade posiciones desde Explorar..." block, one inside the "Haz el test de perfil..." block — both lines are identical, so applying this replacement to both occurrences is correct) with:

```tsx
            <div className="rounded-control bg-surface-2 p-3 text-[12.5px] text-muted">
```

- [ ] **Step 5: Confirm no stray literal radius classes remain on token-bearing surfaces**

Run: `grep -rn "rounded-2xl\|rounded-xl\|rounded-3xl" src/`
Expected: no matches. (If any remain, decide per-case whether they were intentionally left at a native Tailwind size or missed — there should be none left after this task.)

- [ ] **Step 6: Visually verify**

Reload `/explorar` (asset grid cards), `/explorar` → any asset (search-style inputs, units box), `/portfolio` (empty-state hint boxes if no positions exist yet — clear positions via "Mis datos" → "Empezar de cero" to see them).
Expected: all these elements now show the sharper 8–10px radius, matching the rest of the app.

- [ ] **Step 7: Run the full test suite**

Run: `npm test && npm run test:e2e`
Expected: `Tests  29 passed (29)` and `7 passed`.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/AssetCard.tsx "src/app/(dashboard)/explorar/AssetDetailView.tsx" "src/app/(dashboard)/explorar/page.tsx" "src/app/(dashboard)/portfolio/page.tsx"
git commit -m "Sweep remaining literal Tailwind radius classes to project radius tokens"
```

---

## Task 13: Final verification sweep

**Files:** none (verification only)

- [ ] **Step 1: Full clean build**

```bash
rm -rf .next
npm run build
```

Expected: `✓ Compiled successfully`, all 7 routes listed (`/`, `/datos`, `/educacion`, `/explorar`, `/portfolio`, `/test`, `/_not-found`), no TypeScript errors.

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

Expected: `Tests  29 passed (29)` and `7 passed`.

- [ ] **Step 4: Manual visual check of every route**

Start the dev server if not already running (`npm run dev`), then open each of these in a browser and confirm: dark graphite background throughout, sharp (not bubbly) corners, hairline borders instead of soft shadows, orange accent visible and legible, and every financial figure in monospaced digits:

- `/test` — quiz options, active-option tint, progress bar, "Perfil provisional" pill
- `/portfolio` — KPI row, allocation bars, positions list (with at least one position added)
- `/explorar` — asset grid, category filter pills, search box
- `/explorar` → Apple Inc. — full detail page: price chart with range buttons, cotización, datos del catálogo, DCA calculator, recomendación de analistas, ingresos/balance, valoración y ratios, dividendos, rentabilidad y riesgo, comparables, datos clave
- `/explorar` → Bitcoin — confirm sections that don't apply (valuation, dividends, balance, analyst recommendation, comparables) are still correctly hidden, and the visible sections (quote, risk/return, key facts) read correctly on the new theme
- `/educacion` — article cards
- `/datos` — export/import/reset card

- [ ] **Step 5: Confirm the spec's open questions were resolved as designed**

Re-read `docs/superpowers/specs/2026-06-27-dark-terminal-redesign-design.md` side by side with the running app. Confirm: no light/dark toggle exists anywhere, the orange accent is the brand color used (not amber/gold or cold blue), and the sidebar/cards use hairline borders with no soft drop shadows.

- [ ] **Step 6: Final commit (if Step 4 surfaced any small fixes)**

If the manual visual check found anything to touch up, make the fix and commit it now with a specific message describing what was visually wrong and how it was fixed. If nothing needed touching up, this step is a no-op — the redesign is complete as of Task 12's commit.
