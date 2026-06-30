# Silvia Menu Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three new menu sections (Transacciones, Metas, Documentos) and a Pasivos card on the portfolio page, mirroring CFO Silvia's menu structure as a pure visual shell — empty-state-only, no real data, no new business logic.

**Architecture:** Three new route pages under `src/app/(dashboard)/`, each a server component (no `"use client"` needed — no interactivity) wrapped in the existing `<RequireProfile>` client component, following the exact static-page pattern already used by `datos/page.tsx`. The sidebar's `NAV_ITEMS` array gets three new entries. The portfolio page gets one new `<Card>` appended after the existing "Posiciones" card. No new data model, no new hooks, no new `localStorage` keys.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Playwright (e2e). No unit tests needed — these are static pages with no logic to unit-test; coverage comes entirely from e2e.

## Global Constraints

- Every empty-state action button is rendered with the native `disabled` attribute (via the existing `<Button>` component, which already styles `disabled` with `disabled:cursor-not-allowed disabled:opacity-40`) — never a button that looks active but silently does nothing on click.
- Three new pages: `/transacciones`, `/metas`, `/documentos` — each protected by `<RequireProfile>`, each with exactly one state (empty), no conditional "has data" branch since there is no data source yet.
- Sidebar order: Test de perfil, Mi cartera, **Transacciones, Metas, Documentos**, Explorar activos, Educación, Mis datos.
- No new `<Card>`/page outside of what's listed below. No file uploads, no CSV import, no goal-creation form, no liability-entry form — all explicitly out of scope per the spec.
- Reference spec: `docs/superpowers/specs/2026-06-30-silvia-menu-shell-design.md`

---

## Task 1: Create the three new empty-state pages

**Files:**
- Create: `src/app/(dashboard)/transacciones/page.tsx`
- Create: `src/app/(dashboard)/metas/page.tsx`
- Create: `src/app/(dashboard)/documentos/page.tsx`

**Interfaces:**
- Consumes: `Button` from `@/components/ui/Button` (existing `disabled` support), `Card` from `@/components/ui/Card`, `RequireProfile` from `@/components/RequireProfile` — all already exist, no changes to any of them.
- Produces: three new routes (`/transacciones`, `/metas`, `/documentos`) that Task 2 will link to from the sidebar, and Task 4 will cover with e2e tests.

- [ ] **Step 1: Create `src/app/(dashboard)/transacciones/page.tsx`**

```tsx
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RequireProfile } from "@/components/RequireProfile";

export default function TransaccionesPage() {
  return (
    <RequireProfile>
      <div>
        <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Transacciones</h1>
        <p className="mb-5 text-[12.5px] text-muted">
          Historial de compras y ventas en tu cartera.
        </p>
        <Card className="py-10 text-center">
          <p className="mb-3 text-[13px] text-muted">Aún no hay transacciones registradas.</p>
          <Button disabled>Próximamente: importar histórico</Button>
        </Card>
      </div>
    </RequireProfile>
  );
}
```

- [ ] **Step 2: Create `src/app/(dashboard)/metas/page.tsx`**

```tsx
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RequireProfile } from "@/components/RequireProfile";

export default function MetasPage() {
  return (
    <RequireProfile>
      <div>
        <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Metas</h1>
        <p className="mb-5 text-[12.5px] text-muted">
          Define objetivos financieros y sigue tu progreso.
        </p>
        <Card className="py-10 text-center">
          <p className="mb-3 text-[13px] text-muted">Aún no has creado ninguna meta.</p>
          <Button disabled>Próximamente: crear meta</Button>
        </Card>
      </div>
    </RequireProfile>
  );
}
```

- [ ] **Step 3: Create `src/app/(dashboard)/documentos/page.tsx`**

```tsx
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RequireProfile } from "@/components/RequireProfile";

export default function DocumentosPage() {
  return (
    <RequireProfile>
      <div>
        <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Documentos</h1>
        <p className="mb-5 text-[12.5px] text-muted">
          Guarda informes, contratos y otros documentos de tu inversión.
        </p>
        <Card className="py-10 text-center">
          <p className="mb-3 text-[13px] text-muted">Aún no has subido ningún documento.</p>
          <Button disabled>Próximamente: subir documento</Button>
        </Card>
      </div>
    </RequireProfile>
  );
}
```

- [ ] **Step 4: Confirm a clean build**

Run: `rm -rf .next && npm run build`
Expected: `✓ Compiled successfully`, and the route list in the build output includes `/transacciones`, `/metas`, `/documentos` as new static routes alongside the existing ones.

- [ ] **Step 5: Run the full unit suite**

Run: `npm test`
Expected: 51/51 passing — no existing test touches these new files.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(dashboard)/transacciones/page.tsx" "src/app/(dashboard)/metas/page.tsx" "src/app/(dashboard)/documentos/page.tsx"
git commit -m "Add empty-state pages for Transacciones, Metas, and Documentos"
```

---

## Task 2: Add the three new items to the sidebar

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

**Interfaces:**
- Consumes: the three routes created in Task 1 (`/transacciones`, `/metas`, `/documentos`).

- [ ] **Step 1: Insert the new nav entries**

Replace:
```tsx
const NAV_ITEMS = [
  { href: "/test", label: "Test de perfil" },
  { href: "/portfolio", label: "Mi cartera" },
  { href: "/explorar", label: "Explorar activos" },
  { href: "/educacion", label: "Educación" },
  { href: "/datos", label: "Mis datos" },
];
```

with:
```tsx
const NAV_ITEMS = [
  { href: "/test", label: "Test de perfil" },
  { href: "/portfolio", label: "Mi cartera" },
  { href: "/transacciones", label: "Transacciones" },
  { href: "/metas", label: "Metas" },
  { href: "/documentos", label: "Documentos" },
  { href: "/explorar", label: "Explorar activos" },
  { href: "/educacion", label: "Educación" },
  { href: "/datos", label: "Mis datos" },
];
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test` and `npm run test:e2e`
Expected: 51/51 unit tests pass; e2e stays at 22/22 (pre-existing — this task's own e2e coverage is Task 4).

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "Add Transacciones, Metas, and Documentos to the sidebar"
```

---

## Task 3: Add the Pasivos card to the portfolio page

**Files:**
- Modify: `src/app/(dashboard)/portfolio/page.tsx`

**Interfaces:**
- Consumes: `Button`, `Card` — both already imported in this file, no new imports needed.

- [ ] **Step 1: Insert the Pasivos card after the Posiciones card**

Replace:
```tsx
              <Link href="/explorar">
                <Button size="sm">Explorar activos →</Button>
              </Link>
            </div>
          )}
      </Card>
      </div>
    </RequireProfile>
  );
}
```

with:
```tsx
              <Link href="/explorar">
                <Button size="sm">Explorar activos →</Button>
              </Link>
            </div>
          )}
      </Card>

      <Card className="mt-4">
        <div className="mb-3 text-[13px] font-bold">Pasivos</div>
        <div className="py-6 text-center">
          <p className="mb-3 text-[13px] text-muted">
            Aún no tienes pasivos registrados (hipoteca, préstamos, tarjetas...).
          </p>
          <Button disabled size="sm">
            Próximamente: añadir pasivo
          </Button>
        </div>
      </Card>
      </div>
    </RequireProfile>
  );
}
```

(This snippet is the exact tail of the current file — confirmed by reading `src/app/(dashboard)/portfolio/page.tsx` directly. If the live file has changed since this plan was written and the snippet doesn't match character-for-character, locate the `<Card>` that renders "Posiciones" and insert the new `<Card className="mt-4">...</Card>` block immediately after its closing `</Card>`, before the closing `</div>` that wraps the whole page and the closing `</RequireProfile>`.)

- [ ] **Step 2: Run the full test suite**

Run: `npm test` and `npm run test:e2e`
Expected: 51/51 unit tests pass; e2e stays at 22/22 (no existing e2e test asserts on the full set of cards in `/portfolio`, only on specific text that remains unchanged).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(dashboard)/portfolio/page.tsx"
git commit -m "Add Pasivos empty-state card to the portfolio page"
```

---

## Task 4: Add e2e coverage

**Files:**
- Create: `e2e/silvia-menu-shell.spec.ts`

**Interfaces:**
- Consumes: `seedProfile` from `./helpers/profile` (existing helper, already used by every other gated-page e2e spec).

- [ ] **Step 1: Write the spec**

Create `e2e/silvia-menu-shell.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { seedProfile } from "./helpers/profile";

test("the sidebar shows Transacciones, Metas and Documentos between Mi cartera and Explorar activos", async ({
  page,
}) => {
  await seedProfile(page);
  await page.goto("/portfolio");

  const labels = await page.locator("nav a").allTextContents();
  expect(labels).toEqual([
    "Test de perfil",
    "Mi cartera",
    "Transacciones",
    "Metas",
    "Documentos",
    "Explorar activos",
    "Educación",
    "Mis datos",
  ]);
});

test("Transacciones shows the empty state with a disabled action", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/transacciones");

  await expect(page.getByRole("heading", { name: "Transacciones" })).toBeVisible();
  await expect(page.getByText("Aún no hay transacciones registradas.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Próximamente: importar histórico" }),
  ).toBeDisabled();
});

test("Metas shows the empty state with a disabled action", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/metas");

  await expect(page.getByRole("heading", { name: "Metas" })).toBeVisible();
  await expect(page.getByText("Aún no has creado ninguna meta.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Próximamente: crear meta" })).toBeDisabled();
});

test("Documentos shows the empty state with a disabled action", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/documentos");

  await expect(page.getByRole("heading", { name: "Documentos" })).toBeVisible();
  await expect(page.getByText("Aún no has subido ningún documento.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Próximamente: subir documento" }),
  ).toBeDisabled();
});

test("Transacciones, Metas, and Documentos redirect to /test without a saved profile", async ({
  page,
}) => {
  await page.goto("/transacciones");
  await expect(page).toHaveURL("/test");

  await page.goto("/metas");
  await expect(page).toHaveURL("/test");

  await page.goto("/documentos");
  await expect(page).toHaveURL("/test");
});

test("Mi cartera shows the Pasivos empty state with a disabled action", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/portfolio");

  await expect(page.getByText("Pasivos")).toBeVisible();
  await expect(page.getByText(/Aún no tienes pasivos registrados/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Próximamente: añadir pasivo" })).toBeDisabled();
});
```

- [ ] **Step 2: Run the new spec in isolation**

Run: `npx playwright test e2e/silvia-menu-shell.spec.ts`
Expected: 6/6 passing. If the sidebar-order assertion fails because `page.locator("nav a")` picks up unexpected elements, inspect with `npx playwright test e2e/silvia-menu-shell.spec.ts --debug` and adjust the locator (e.g. scope it more tightly to the `<nav>` inside the sidebar `<aside>`) — don't change `Sidebar.tsx`'s markup to chase the test.

- [ ] **Step 3: Run the full e2e suite**

Run: `npm run test:e2e`
Expected: 28/28 passing (22 pre-existing + 6 new).

- [ ] **Step 4: Run the unit suite too**

Run: `npm test`
Expected: 51/51 passing.

- [ ] **Step 5: Commit**

```bash
git add e2e/silvia-menu-shell.spec.ts
git commit -m "Add e2e coverage for the Documentos/Transacciones/Metas/Pasivos shell"
```

---

## Task 5: Final verification sweep

**Files:** none (verification only)

- [ ] **Step 1: Full clean build**

```bash
rm -rf .next
npm run build
```

Expected: `✓ Compiled successfully`, no TypeScript errors, and the route table lists `/transacciones`, `/metas`, `/documentos` alongside the 5 pre-existing routes (8 total static routes).

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

Expected: 51/51 unit tests pass; 28/28 e2e tests pass.

- [ ] **Step 4: Manual visual check**

With the dev server running and a saved profile (seed via `localStorage.setItem('t69_profile_score', '50')` in the browser console, then reload `/portfolio`):

- Sidebar shows all 8 items in order: Test de perfil, Mi cartera, Transacciones, Metas, Documentos, Explorar activos, Educación, Mis datos.
- Click "Transacciones": serif title, subtitle, card with muted text and a visibly disabled (grayed out, not clickable) button reading "Próximamente: importar histórico".
- Click "Metas": same pattern, "Próximamente: crear meta".
- Click "Documentos": same pattern, "Próximamente: subir documento".
- Go to "Mi cartera": scroll to the bottom — a new "Pasivos" card appears below "Posiciones", with the same disabled-button pattern, "Próximamente: añadir pasivo".
- Open a private/incognito-style fresh browser state (or clear `localStorage`) and visit `/transacciones` directly — confirm it redirects to `/test` instead of showing the page.

- [ ] **Step 5: Final commit (if Step 4 surfaced any small fixes)**

If the manual check found anything to touch up, fix and commit it now with a message describing what was wrong. If nothing needed touching up, this step is a no-op.
