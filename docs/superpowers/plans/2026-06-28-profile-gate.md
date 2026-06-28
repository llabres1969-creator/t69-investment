# Profile Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Block `/explorar` and `/portfolio` behind having completed the profile test, redirecting instantly to `/test` when no profile score is saved.

**Architecture:** A single reusable client component, `RequireProfile`, wraps the existing content of both gated pages. It reads `useProfileScore()` (already exists), and on mount redirects to `/test` if no score is saved — rendering nothing while loading or redirecting, to avoid a flash of gated content. No backend, no session — this is a client-side flow gate over the same `localStorage` model the rest of the app already uses.

**Tech Stack:** Next.js 16 (App Router), React, TypeScript, Vitest + React Testing Library (component test), Playwright (e2e) — all already in place, no new dependencies. This plan adds `@testing-library/react`'s `render`/`screen`/`waitFor` usage to the codebase for the first time (the package is already an installed devDependency from an earlier redesign, just unused until now).

## Global Constraints

- Rutas bloqueadas: `/explorar` y `/portfolio` únicamente.
- Rutas siempre accesibles: `/test`, `/educacion`, `/datos`.
- Comportamiento: redirección inmediata a `/test`, sin pantalla intermedia ni mensaje.
- El bloqueo es 100% client-side sobre `localStorage` (clave `"t69_profile_score"`, ya definida in `src/lib/useProfileScore.ts`) — no hay backend, sesión ni cookie.
- No se modifica el sidebar ni se añade ningún indicador visual de "bloqueado" en la navegación.
- No se tocan `/educacion` ni `/datos`.
- No se modifica el test de perfil ni el cálculo de `score`.
- Reference spec: `docs/superpowers/specs/2026-06-28-profile-gate-design.md`

**Known, accepted consequence (not addressed by this plan):** once `RequireProfile` gates `/portfolio`, that page's own `score === null` branches (the "Descubre cómo deberías repartir tu dinero" banner, and the "Haz el test de perfil para ver tu cartera ideal aquí" fallback inside the allocation card) become unreachable — the gate guarantees `score` is never `null` by the time the page's own content renders. They are harmless dead code, not a bug, and are left untouched here to stay within this plan's scope (the spec explicitly excludes modifying the profile/score calculation, and removing them would mean editing `PortfolioPage`'s business logic beyond just adding the gate). If this bothers you later, removing those two branches is a clean, separate follow-up.

---

## Task 1: Create the `RequireProfile` component

**Files:**
- Create: `src/components/RequireProfile.tsx`
- Test: `src/components/__tests__/RequireProfile.test.tsx`

**Interfaces:**
- Consumes: `useProfileScore()` from `@/lib/useProfileScore` (existing, returns `{ score: number | null, loaded: boolean }`).
- Produces: `RequireProfile({ children }: { children: React.ReactNode })` — a client component. Tasks 2 and 3 import and wrap their page content with it.

- [ ] **Step 1: Write the failing tests**

Create `src/components/__tests__/RequireProfile.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { RequireProfile } from "@/components/RequireProfile";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

beforeEach(() => {
  localStorage.clear();
  replace.mockClear();
});

describe("RequireProfile", () => {
  it("renders children once a profile score is found in localStorage", async () => {
    localStorage.setItem("t69_profile_score", "42");

    render(
      <RequireProfile>
        <div>contenido protegido</div>
      </RequireProfile>,
    );

    await waitFor(() => {
      expect(screen.getByText("contenido protegido")).toBeInTheDocument();
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to /test and renders nothing when no profile score is saved", async () => {
    render(
      <RequireProfile>
        <div>contenido protegido</div>
      </RequireProfile>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/test");
    });
    expect(screen.queryByText("contenido protegido")).not.toBeInTheDocument();
  });
});
```

(`vi.hoisted` is required here, not just a top-level `const`: Vitest hoists `vi.mock(...)` calls to the very top of the file, above normal `const` declarations, so a plain `const replace = vi.fn()` referenced inside the `vi.mock` factory would be hoisted-undefined at the time the mock runs. `vi.hoisted` runs alongside the mock hoisting, avoiding that.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/__tests__/RequireProfile.test.tsx`
Expected: FAIL — `Cannot find module '@/components/RequireProfile'`.

- [ ] **Step 3: Write the component**

Create `src/components/RequireProfile.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileScore } from "@/lib/useProfileScore";

export function RequireProfile({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { score, loaded } = useProfileScore();

  useEffect(() => {
    if (loaded && score === null) {
      router.replace("/test");
    }
  }, [loaded, score, router]);

  if (!loaded || score === null) {
    return null;
  }

  return <>{children}</>;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/__tests__/RequireProfile.test.tsx`
Expected: PASS (2/2).

- [ ] **Step 5: Run the full unit suite**

Run: `npm test`
Expected: all test files pass (the new one plus the 5 pre-existing).

- [ ] **Step 6: Commit**

```bash
git add src/components/RequireProfile.tsx src/components/__tests__/RequireProfile.test.tsx
git commit -m "Add RequireProfile gate component with unit tests"
```

---

## Task 2: Gate `/explorar` behind `RequireProfile`

**Files:**
- Modify: `src/app/(dashboard)/explorar/page.tsx`

**Interfaces:**
- Consumes: `RequireProfile` from `@/components/RequireProfile` (Task 1).

- [ ] **Step 1: Replace the full file content**

Replace the entire contents of `src/app/(dashboard)/explorar/page.tsx` with:

```tsx
"use client";

import { useMemo, useState } from "react";
import {
  ASSET_CATEGORIES,
  Asset,
  AssetCategory,
  CURATED_ASSETS,
  NON_CURATED_ASSETS,
} from "@/lib/assets";
import { AssetCard } from "@/components/ui/AssetCard";
import { FilterPill } from "@/components/ui/FilterPill";
import { RequireProfile } from "@/components/RequireProfile";
import { AssetDetailView } from "./AssetDetailView";

type FilterValue = "all" | AssetCategory;

function matchesFilters(asset: Asset, query: string, filter: FilterValue) {
  const matchesCategory = filter === "all" || asset.category === filter;
  const matchesQuery =
    query.trim() === "" ||
    asset.name.toLowerCase().includes(query.toLowerCase()) ||
    asset.isin.toLowerCase().includes(query.toLowerCase()) ||
    asset.ticker.toLowerCase().includes(query.toLowerCase());
  return matchesCategory && matchesQuery;
}

export default function ExplorarPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [selected, setSelected] = useState<Asset | null>(null);

  const filteredCurated = useMemo(
    () => CURATED_ASSETS.filter((asset) => matchesFilters(asset, query, filter)),
    [query, filter],
  );
  const filteredOther = useMemo(
    () => NON_CURATED_ASSETS.filter((asset) => matchesFilters(asset, query, filter)),
    [query, filter],
  );

  const totalShown = filteredCurated.length + filteredOther.length;
  const totalAvailable = CURATED_ASSETS.length + NON_CURATED_ASSETS.length;
  const nothingFound = totalShown === 0;

  return (
    <RequireProfile>
      {selected ? (
        <AssetDetailView asset={selected} onBack={() => setSelected(null)} />
      ) : (
        <div>
          <div className="mb-4">
            <h1 className="text-[24px] font-extrabold tracking-tight">Explorar activos</h1>
            <p className="mt-0.5 text-[12.5px] text-muted">
              {totalShown} de {totalAvailable} activos disponibles. Pulsa cualquiera para ver su
              ficha.
            </p>
          </div>

          <div className="mb-3 flex flex-wrap gap-2.5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar por nombre, ticker o ISIN"
              placeholder="Buscar por nombre, ticker o ISIN…"
              className="w-full max-w-[280px] rounded-control border border-line bg-surface px-3.5 py-2.5 text-[13px] outline-none focus:border-secondary"
            />
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <FilterPill label="Todos" active={filter === "all"} onClick={() => setFilter("all")} />
            {ASSET_CATEGORIES.map((cat) => (
              <FilterPill
                key={cat}
                label={cat}
                active={filter === cat}
                onClick={() => setFilter(cat)}
              />
            ))}
          </div>

          {nothingFound && (
            <p className="py-10 text-center text-[13px] text-muted">
              No hay activos que coincidan con tu búsqueda.
            </p>
          )}

          {filteredCurated.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-1 text-[15px] font-bold">Universo T69</h2>
              <p className="mb-3 text-[12.5px] text-muted">
                Estos son los activos que seleccionamos y revisamos activamente. Es nuestra
                selección, no una lista exhaustiva de mercado.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCurated.map((asset) => (
                  <AssetCard key={asset.isin} asset={asset} onClick={() => setSelected(asset)} />
                ))}
              </div>
            </div>
          )}

          {filteredOther.length > 0 && (
            <div>
              <h2 className="mb-1 text-[15px] font-bold">Otros activos</h2>
              <p className="mb-3 text-[12.5px] text-muted">
                Accesibles pero fuera de nuestro universo curado — sin seguimiento de T69.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredOther.map((asset) => (
                  <AssetCard key={asset.isin} asset={asset} onClick={() => setSelected(asset)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </RequireProfile>
  );
}
```

(The only structural change from the previous version: the early `if (selected) return <AssetDetailView ... />` is now a ternary inside `RequireProfile`'s children, since a component can only have one `return`-style gate at its root. All JSX content is otherwise identical to before.)

- [ ] **Step 2: Run the full unit suite**

Run: `npm test`
Expected: all test files pass — this is a structural-only change (early return → ternary), no logic changed.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(dashboard)/explorar/page.tsx"
git commit -m "Gate /explorar behind RequireProfile"
```

(Don't run `npm run test:e2e` yet — the pre-existing e2e specs that visit `/explorar` directly will fail until Task 5 seeds a profile score for them. That's expected and fixed in Task 5, not a regression to chase down now.)

---

## Task 3: Gate `/portfolio` behind `RequireProfile`

**Files:**
- Modify: `src/app/(dashboard)/portfolio/page.tsx`

**Interfaces:**
- Consumes: `RequireProfile` from `@/components/RequireProfile` (Task 1).

- [ ] **Step 1: Add the import**

Replace:

```tsx
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
```

with:

```tsx
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { RequireProfile } from "@/components/RequireProfile";
```

- [ ] **Step 2: Wrap the returned JSX**

Replace:

```tsx
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
```

with:

```tsx
  return (
    <RequireProfile>
      <div>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
```

Then replace the very end of the function:

```tsx
      </Card>
    </div>
  );
}

function AllocationRow({
```

with:

```tsx
      </Card>
      </div>
    </RequireProfile>
  );
}

function AllocationRow({
```

(Everything between those two edits — the KPI grid, the allocation card, the positions card — is unchanged. The inner content is now indented one level less than ideal relative to its new `<RequireProfile><div>` wrapper; that's a cosmetic indentation mismatch only, not a lint or build error — Next's default ESLint config doesn't enforce JSX indentation. Reformat with your editor if you want it visually clean, but it isn't required for this task to be correct.)

- [ ] **Step 3: Run the full unit suite**

Run: `npm test`
Expected: all test files pass.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(dashboard)/portfolio/page.tsx"
git commit -m "Gate /portfolio behind RequireProfile"
```

(Same note as Task 2: pre-existing e2e specs visiting `/portfolio` directly will fail until Task 5. Expected.)

---

## Task 4: Add the e2e profile-seeding helper

**Files:**
- Create: `e2e/helpers/profile.ts`

**Interfaces:**
- Produces: `seedProfile(page: Page, score?: number): Promise<void>` — Task 5 imports this into every existing spec that navigates to `/explorar` or `/portfolio`, and the new gate spec uses it too.

- [ ] **Step 1: Write the helper**

Create `e2e/helpers/profile.ts`:

```ts
import { Page } from "@playwright/test";

export async function seedProfile(page: Page, score = 50) {
  await page.addInitScript((profileScore) => {
    window.localStorage.setItem("t69_profile_score", String(profileScore));
  }, score);
}
```

(`page.addInitScript` runs before any page script on every subsequent navigation in this `page`'s context — it must be called before the test's first `page.goto(...)`, which is why Task 5's edits insert the call as each test's very first line.)

- [ ] **Step 2: Commit**

```bash
git add e2e/helpers/profile.ts
git commit -m "Add seedProfile e2e helper for tests that need a saved profile"
```

---

## Task 5: Seed a profile in every existing e2e test that visits `/explorar` or `/portfolio`

**Why this is one task:** Tasks 2-3 made `/explorar` and `/portfolio` redirect to `/test` for any visitor with no saved profile score — which is every Playwright test by default (fresh browser context, empty `localStorage`). Three existing spec files have 9 tests total that navigate straight to one of those two routes; all of them need `seedProfile(page)` called before their first `page.goto`, or they'll now fail by landing on `/test` instead of the page they're testing. This is mechanical and the same shape across all 9 call sites, so it's one task with one commit.

**Files:**
- Modify: `e2e/explore-and-buy.spec.ts`
- Modify: `e2e/currency-and-data.spec.ts`
- Modify: `e2e/curated-universe.spec.ts`

**Interfaces:**
- Consumes: `seedProfile` from `./helpers/profile` (Task 4).

- [ ] **Step 1: Update `e2e/explore-and-buy.spec.ts`**

Add the import at the top. Replace:

```ts
import { expect, test } from "@playwright/test";
```

with:

```ts
import { expect, test } from "@playwright/test";
import { seedProfile } from "./helpers/profile";
```

Then, in each of the 3 tests in this file, add `await seedProfile(page);` as the first line of the test body, immediately before the existing first `await page.goto("/explorar");` line. Concretely, replace each of these 3 occurrences of:

```ts
  await page.goto("/explorar");
```

with:

```ts
  await seedProfile(page);
  await page.goto("/explorar");
```

(All 3 occurrences in this file are this exact line, each the first statement of its test — replace all 3.)

- [ ] **Step 2: Update `e2e/currency-and-data.spec.ts`**

Add the import. Replace:

```ts
import { expect, test } from "@playwright/test";
```

with:

```ts
import { expect, test } from "@playwright/test";
import { seedProfile } from "./helpers/profile";
```

Then add `await seedProfile(page);` as the first line of each of this file's 2 tests, before their first `page.goto`. Both tests in this file start with `await page.goto("/explorar");` as their first statement — replace both occurrences of:

```ts
  await page.goto("/explorar");
```

with:

```ts
  await seedProfile(page);
  await page.goto("/explorar");
```

- [ ] **Step 3: Update `e2e/curated-universe.spec.ts`**

Add the import. Replace:

```ts
import { expect, test } from "@playwright/test";
```

with:

```ts
import { expect, test } from "@playwright/test";
import { seedProfile } from "./helpers/profile";
```

Then add `await seedProfile(page);` as the first line of each of this file's 4 tests, before their first `page.goto("/explorar")`. All 4 tests in this file start with that exact line — replace all 4 occurrences of:

```ts
  await page.goto("/explorar");
```

with:

```ts
  await seedProfile(page);
  await page.goto("/explorar");
```

- [ ] **Step 4: Run the full e2e suite**

Run: `npm run test:e2e`
Expected: 11/11 passing (back to the pre-gate baseline — same tests, now seeded).

- [ ] **Step 5: Commit**

```bash
git add e2e/explore-and-buy.spec.ts e2e/currency-and-data.spec.ts e2e/curated-universe.spec.ts
git commit -m "Seed a profile score in existing e2e specs ahead of the new gate"
```

---

## Task 6: Add e2e coverage for the gate itself

**Files:**
- Create: `e2e/profile-gate.spec.ts`

**Interfaces:**
- Consumes: `seedProfile` from `./helpers/profile` (Task 4).

- [ ] **Step 1: Write the spec**

Create `e2e/profile-gate.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { seedProfile } from "./helpers/profile";

test("visiting /explorar without a saved profile redirects to /test", async ({ page }) => {
  await page.goto("/explorar");
  await expect(page).toHaveURL("/test");
});

test("visiting /portfolio without a saved profile redirects to /test", async ({ page }) => {
  await page.goto("/portfolio");
  await expect(page).toHaveURL("/test");
});

test("visiting /explorar with a saved profile shows the page normally", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/explorar");
  await expect(page).toHaveURL("/explorar");
  await expect(page.getByRole("heading", { name: "Explorar activos" })).toBeVisible();
});

test("visiting /portfolio with a saved profile shows the page normally", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/portfolio");
  await expect(page).toHaveURL("/portfolio");
  await expect(page.getByRole("heading", { name: "Mi cartera" })).toBeVisible();
});

test("Educación and Mis datos stay accessible without a saved profile", async ({ page }) => {
  await page.goto("/educacion");
  await expect(page).toHaveURL("/educacion");

  await page.goto("/datos");
  await expect(page).toHaveURL("/datos");
});
```

- [ ] **Step 2: Run the new spec in isolation**

Run: `npx playwright test e2e/profile-gate.spec.ts`
Expected: 5/5 passing.

- [ ] **Step 3: Run the full e2e suite**

Run: `npm run test:e2e`
Expected: 16/16 passing (11 pre-existing + 5 new).

- [ ] **Step 4: Run the full unit suite too**

Run: `npm test`
Expected: all test files pass.

- [ ] **Step 5: Commit**

```bash
git add e2e/profile-gate.spec.ts
git commit -m "Add e2e coverage for the profile gate on /explorar and /portfolio"
```

---

## Task 7: Final verification sweep

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

Expected: all unit tests pass (6 files now: 5 pre-existing `lib/__tests__` files + the new `components/__tests__/RequireProfile.test.tsx`); e2e 16/16.

- [ ] **Step 4: Manual visual check**

With the dev server running and your browser's localStorage cleared for `localhost:3000` (DevTools → Application → Local Storage → clear, or open a fresh private/incognito window):

- Open `http://localhost:3000/explorar` directly. Confirm you land on `/test` instead, instantly, with no flash of the asset grid first.
- Open `http://localhost:3000/portfolio` directly. Confirm the same — instant redirect to `/test`.
- Open `http://localhost:3000/educacion` and `http://localhost:3000/datos` directly. Confirm both load normally, no redirect.
- Complete the 15-question test. Confirm you land on `/portfolio` afterward (the existing post-test redirect, unchanged) and it shows normally.
- With the profile now saved, navigate to `/explorar` from the sidebar. Confirm it shows normally, no redirect.
- Refresh `/explorar` directly (full page reload, not client navigation). Confirm it still shows normally — i.e. the gate correctly reads the already-saved profile from `localStorage` on a fresh page load, not just during client-side navigation.

- [ ] **Step 5: Final commit (if Step 4 surfaced any small fixes)**

If the manual check found anything to touch up, fix and commit it now with a message describing what was wrong. If nothing needed touching up, this step is a no-op.
