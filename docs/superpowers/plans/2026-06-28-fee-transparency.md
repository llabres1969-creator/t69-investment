# Fee Transparency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Comisiones" section to every asset's detail page, breaking down manager/T69/custodian fees as annual percentages, for all 10 catalog assets regardless of curation status.

**Architecture:** A new `src/lib/fees.ts` data module — same shape as the existing `curation.ts` (a `Record<string, T>` keyed by ISIN plus a lookup function) — holds the fee breakdown per asset. `AssetDetailView.tsx` renders a new unconditional "Comisiones" `<Card>` using the existing `Row` component, right after "Datos del catálogo".

**Tech Stack:** Next.js 16, TypeScript, Vitest (unit), Playwright (e2e) — no new dependencies.

## Global Constraints

- Aplica a los 10 activos del catálogo, no solo a los 6 curados.
- Tres partidas: `managerPct` (gestora/TER), `distributionPct` (T69), `custodyPct` (custodio) — cada una como % anual sobre el valor de la posición.
- Composición exacta por ISIN (de la spec):

| ISIN | managerPct | distributionPct | custodyPct |
|---|---|---|---|
| `IE00BK5BQT80` | 0.22 | 0.12 | 0.05 |
| `IE00B4L5Y983` | 0.20 | 0.12 | 0.05 |
| `IE00B3F81409` | 0.20 | 0.10 | 0.05 |
| `US0378331005` | 0 | 0.10 | 0.05 |
| `US5949181045` | 0 | 0.10 | 0.05 |
| `US88160R1014` | 0 | 0.10 | 0.05 |
| `XBT-EUR` | 0 | 0.15 | 0.10 |
| `ETH-EUR` | 0 | 0.15 | 0.10 |
| `DE-KO-DAX` | 0 | 0.20 | 0.05 |
| `CASH-EUR` | 0 | 0 | 0 |

- No se toca el modelo de portfolio, conversión de divisa, ni el test de perfil.
- No se añade comisión de compraventa/corretaje, ni impacto en € sobre posiciones reales — ambos son sub-proyectos futuros explícitamente fuera de alcance.
- Reference spec: `docs/superpowers/specs/2026-06-28-fee-transparency-design.md`

---

## Task 1: Create the fees data module

**Files:**
- Create: `src/lib/fees.ts`
- Test: `src/lib/__tests__/fees.test.ts`

**Interfaces:**
- Consumes: `ASSETS` from `@/lib/assets` (only in the test, to verify coverage — `fees.ts` itself does not import `assets.ts`, same pattern as `curation.ts`).
- Produces: `FeeBreakdown` interface (`{ managerPct: number; distributionPct: number; custodyPct: number }`), `getFees(isin: string): FeeBreakdown | undefined`, `totalFeePct(fees: FeeBreakdown): number`. Task 2 imports all three.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/__tests__/fees.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ASSETS } from "@/lib/assets";
import { getFees, totalFeePct } from "@/lib/fees";

describe("getFees", () => {
  it("returns a fee breakdown for every asset in the catalog", () => {
    for (const asset of ASSETS) {
      const fees = getFees(asset.isin);
      expect(fees, `expected fee data for ${asset.isin}`).toBeDefined();
    }
  });

  it("returns undefined for an unknown ISIN", () => {
    expect(getFees("NOT-A-REAL-ISIN")).toBeUndefined();
  });

  it("matches the exact composition for the Vanguard FTSE All-World ETF", () => {
    expect(getFees("IE00BK5BQT80")).toEqual({
      managerPct: 0.22,
      distributionPct: 0.12,
      custodyPct: 0.05,
    });
  });

  it("zeroes out the manager fee for individual stocks", () => {
    expect(getFees("US0378331005")?.managerPct).toBe(0);
  });

  it("charges no fees at all on the cash account", () => {
    const fees = getFees("CASH-EUR");
    expect(fees).toEqual({ managerPct: 0, distributionPct: 0, custodyPct: 0 });
  });
});

describe("totalFeePct", () => {
  it("sums all three fee components", () => {
    expect(
      totalFeePct({ managerPct: 0.22, distributionPct: 0.12, custodyPct: 0.05 }),
    ).toBeCloseTo(0.39, 5);
  });

  it("returns 0 when every component is 0", () => {
    expect(totalFeePct({ managerPct: 0, distributionPct: 0, custodyPct: 0 })).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/fees.test.ts`
Expected: FAIL — `Cannot find module '@/lib/fees'`.

- [ ] **Step 3: Write the fees module**

Create `src/lib/fees.ts`:

```ts
export interface FeeBreakdown {
  managerPct: number;
  distributionPct: number;
  custodyPct: number;
}

export const FEES: Record<string, FeeBreakdown> = {
  "IE00BK5BQT80": { managerPct: 0.22, distributionPct: 0.12, custodyPct: 0.05 },
  "IE00B4L5Y983": { managerPct: 0.20, distributionPct: 0.12, custodyPct: 0.05 },
  "IE00B3F81409": { managerPct: 0.20, distributionPct: 0.10, custodyPct: 0.05 },
  "US0378331005": { managerPct: 0, distributionPct: 0.10, custodyPct: 0.05 },
  "US5949181045": { managerPct: 0, distributionPct: 0.10, custodyPct: 0.05 },
  "US88160R1014": { managerPct: 0, distributionPct: 0.10, custodyPct: 0.05 },
  "XBT-EUR": { managerPct: 0, distributionPct: 0.15, custodyPct: 0.10 },
  "ETH-EUR": { managerPct: 0, distributionPct: 0.15, custodyPct: 0.10 },
  "DE-KO-DAX": { managerPct: 0, distributionPct: 0.20, custodyPct: 0.05 },
  "CASH-EUR": { managerPct: 0, distributionPct: 0, custodyPct: 0 },
};

export function getFees(isin: string): FeeBreakdown | undefined {
  return FEES[isin];
}

export function totalFeePct(fees: FeeBreakdown): number {
  return fees.managerPct + fees.distributionPct + fees.custodyPct;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/fees.test.ts`
Expected: PASS (7/7).

- [ ] **Step 5: Run the full unit suite**

Run: `npm test`
Expected: all test files pass (the new one plus the 6 pre-existing).

- [ ] **Step 6: Commit**

```bash
git add src/lib/fees.ts src/lib/__tests__/fees.test.ts
git commit -m "Add per-asset fee breakdown data module"
```

---

## Task 2: Add the "Comisiones" section to the asset detail page

**Files:**
- Modify: `src/app/(dashboard)/explorar/AssetDetailView.tsx`

**Interfaces:**
- Consumes: `getFees`, `totalFeePct` from `@/lib/fees` (Task 1); `NUM_CLASS`, `formatNumber` from `@/lib/format` (both already exported, used elsewhere in this same file).

- [ ] **Step 1: Add the import**

Replace:

```tsx
import { getCuration, REVIEW_STATUS_LABEL } from "@/lib/curation";
```

with:

```tsx
import { getCuration, REVIEW_STATUS_LABEL } from "@/lib/curation";
import { getFees, totalFeePct } from "@/lib/fees";
```

- [ ] **Step 2: Look up the fee data alongside the existing lookups**

Replace:

```tsx
  const detail = getAssetDetail(asset.isin);
  const curation = getCuration(asset.isin);
  const units = amount / asset.price;
```

with:

```tsx
  const detail = getAssetDetail(asset.isin);
  const curation = getCuration(asset.isin);
  const fees = getFees(asset.isin);
  const units = amount / asset.price;
```

- [ ] **Step 3: Render the section, right after "Datos del catálogo" and before "¿Cuánto tendrías hoy?"**

Replace:

```tsx
      <Card className="mb-4">
        <div className="mb-3 text-[13px] font-bold">¿Cuánto tendrías hoy?</div>
```

with:

```tsx
      {fees && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Comisiones</div>
          <div className="divide-y divide-line/60 text-[13px]">
            <Row label="Gestora" value={`${formatNumber(fees.managerPct, 2)}%`} valueClassName={NUM_CLASS} />
            <Row
              label="T69"
              value={`${formatNumber(fees.distributionPct, 2)}%`}
              valueClassName={NUM_CLASS}
            />
            <Row
              label="Custodio"
              value={`${formatNumber(fees.custodyPct, 2)}%`}
              valueClassName={NUM_CLASS}
            />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="text-[13px] font-bold">Coste total anual estimado</span>
            <span className={`${NUM_CLASS} text-[13px] font-bold`}>
              {formatNumber(totalFeePct(fees), 2)}%
            </span>
          </div>
        </Card>
      )}

      <Card className="mb-4">
        <div className="mb-3 text-[13px] font-bold">¿Cuánto tendrías hoy?</div>
```

(`fees` is defined for all 10 catalog assets per Task 1's data, so this section always renders in practice — the `{fees && (...)}` guard exists purely for type safety against `getFees`'s `| undefined` return, the same defensive style `curation &&` already uses a few sections below for a lookup that genuinely can be absent. The three individual rows reuse the existing `Row` component exactly as the neighboring "Datos del catálogo" section does; the total row is hand-rolled with its own bold styling and a top border, to visually separate it from the three line items above it.)

- [ ] **Step 4: Run the full test suite**

Run: `npm test` and `npm run test:e2e`
Expected: unit tests pass; e2e stays at 16/16 (pre-existing — this task adds no new e2e tests yet, that's Task 3).

- [ ] **Step 5: Commit**

```bash
git add "src/app/(dashboard)/explorar/AssetDetailView.tsx"
git commit -m "Add Comisiones section to the asset detail page"
```

---

## Task 3: Add e2e coverage for the fee breakdown

**Files:**
- Create: `e2e/fee-transparency.spec.ts`

**Interfaces:**
- Consumes: `seedProfile` from `./helpers/profile` (already exists — `/explorar` is gated behind a saved profile since the previous plan, so every test here must seed one before navigating).

- [ ] **Step 1: Write the spec**

Create `e2e/fee-transparency.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { seedProfile } from "./helpers/profile";

test("a curated asset's detail page shows its fee breakdown and total", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/explorar");
  await page.getByText("Apple Inc.", { exact: true }).click();

  await expect(page.getByText("Comisiones")).toBeVisible();
  await expect(page.getByText("Gestora")).toBeVisible();
  await expect(page.getByText("0,00%", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Coste total anual estimado")).toBeVisible();
  await expect(page.getByText("0,15%", { exact: true })).toBeVisible();
});

test("a non-curated asset's detail page also shows its fee breakdown", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/explorar");
  await page.getByText("Bitcoin", { exact: true }).click();

  await expect(page.getByText("Comisiones")).toBeVisible();
  await expect(page.getByText("Coste total anual estimado")).toBeVisible();
  await expect(page.getByText("0,25%", { exact: true })).toBeVisible();
});

test("the cash account shows zero fees on every line", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/explorar");
  await page.getByText("Cuenta remunerada", { exact: true }).click();

  await expect(page.getByText("Comisiones")).toBeVisible();
  const zeroPercentRows = page.getByText("0,00%", { exact: true });
  await expect(zeroPercentRows).toHaveCount(4); // Gestora, T69, Custodio, and the total
});
```

- [ ] **Step 2: Run the new spec in isolation**

Run: `npx playwright test e2e/fee-transparency.spec.ts`
Expected: 3/3 passing. If the "0,00%" exact-text count assertion in the third test doesn't match (e.g. because `formatNumber` renders zero differently than `"0,00"`), inspect the actual rendered text with `npx playwright test e2e/fee-transparency.spec.ts --debug` and adjust the literal string to match — don't change `formatNumber` itself to chase the test.

- [ ] **Step 3: Run the full e2e suite**

Run: `npm run test:e2e`
Expected: 19/19 passing (16 pre-existing + 3 new).

- [ ] **Step 4: Run the unit suite too**

Run: `npm test`
Expected: all test files pass.

- [ ] **Step 5: Commit**

```bash
git add e2e/fee-transparency.spec.ts
git commit -m "Add e2e coverage for the per-asset fee breakdown"
```

---

## Task 4: Final verification sweep

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

Expected: all unit tests pass (7 files now); e2e 19/19.

- [ ] **Step 4: Manual visual check**

With the dev server running and a saved profile (complete the test first if your browser's localStorage doesn't already have one):

- Open `/explorar` → Vanguard FTSE All-World (curated ETF). Confirm "Comisiones" appears after "Datos del catálogo": Gestora 0,22%, T69 0,12%, Custodio 0,05%, Coste total anual estimado 0,39%.
- Open `/explorar` → Apple Inc. (curated stock). Confirm Gestora 0,00%, T69 0,10%, Custodio 0,05%, total 0,15%.
- Open `/explorar` → Bitcoin (non-curated). Confirm the Comisiones section still appears (it's not gated by curation) — Gestora 0,00%, T69 0,15%, Custodio 0,10%, total 0,25%.
- Open `/explorar` → Cuenta remunerada. Confirm all four lines read 0,00%.
- Confirm every percentage renders in the monospaced figure style consistent with the rest of the page (same visual weight as the other ratio/percentage figures on the page).

- [ ] **Step 5: Final commit (if Step 4 surfaced any small fixes)**

If the manual check found anything to touch up, fix and commit it now with a message describing what was wrong. If nothing needed touching up, this step is a no-op.
