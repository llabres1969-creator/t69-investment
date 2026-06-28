# Spanish Taxation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Fiscalidad" section to every asset's detail page, showing the Spanish tax treatment (figure, rate range, a type-specific note, and a disclaimer) keyed by the asset's catalog type rather than by ISIN.

**Architecture:** A new `src/lib/taxation.ts` data module — same shape as `fees.ts`/`curation.ts` but keyed by `detail.catalog.type` (5 distinct values across the 10 catalog assets) instead of ISIN. `AssetDetailView.tsx` renders a new unconditional "Fiscalidad" `<Card>` right after "Comisiones", using the existing `Row` component for the two structured fields and plain paragraphs for the note and disclaimer.

**Tech Stack:** Next.js 16, TypeScript, Vitest (unit), Playwright (e2e) — no new dependencies.

## Global Constraints

- Indexado por `catalog.type`, no por ISIN. Los 5 tipos exactos presentes en el catálogo (ver `src/lib/assetDetails.ts`): `"Acción"`, `"ETF"`, `"Criptomoneda"`, `"Derivado (Knock-out)"`, `"Cuenta remunerada"`.
- Contenido exacto por tipo (de la spec):

| `catalog.type` | figure | rateRange | note |
|---|---|---|---|
| `Acción` | Ganancia patrimonial | 19% – 28% (tramos del ahorro) | Se aplica el método FIFO: se considera vendido primero lo que se compró primero. |
| `ETF` | Ganancia patrimonial | 19% – 28% (tramos del ahorro) | A diferencia de los fondos de inversión, los ETF no tienen diferimiento por traspaso: vender uno para comprar otro tributa siempre en el momento de la venta. |
| `Criptomoneda` | Ganancia patrimonial | 19% – 28% (tramos del ahorro) | Las tenencias en plataformas extranjeras por encima del umbral legal deben declararse en el Modelo 721. |
| `Derivado (Knock-out)` | Ganancia patrimonial | 19% – 28% (tramos del ahorro) | Las pérdidas solo compensan con otras ganancias patrimoniales de la base del ahorro, no con rendimientos del trabajo. |
| `Cuenta remunerada` | Rendimiento del capital mobiliario | 19% – 28% (tramos del ahorro) | La entidad aplica una retención del 19% en origen, a cuenta de la declaración anual. |

- El contenido es siempre genérico y estático — no depende del activo individual ni de ningún dato del usuario. Es información general, no asesoramiento fiscal personalizado: el disclaimer es obligatorio y fijo, sin condicionarlo a nada.
- No se toca el modelo de comisiones, perfil, portfolio ni moneda.
- Reference spec: `docs/superpowers/specs/2026-06-28-spanish-taxation-design.md`

---

## Task 1: Create the taxation data module

**Files:**
- Create: `src/lib/taxation.ts`
- Test: `src/lib/__tests__/taxation.test.ts`

**Interfaces:**
- Consumes: nothing from other lib modules (`taxation.ts` itself imports nothing from `assets.ts` or `assetDetails.ts`, same isolation pattern as `fees.ts`/`curation.ts`). The test imports `ASSET_DETAILS` from `@/lib/assetDetails` only to enumerate the real catalog types in use.
- Produces: `TaxTreatment` interface (`{ figure: string; rateRange: string; note: string }`), `getTaxation(catalogType: string): TaxTreatment | undefined`. Task 2 imports both.

- [ ] **Step 1: Write the failing tests**

First, check the exact shape of `ASSET_DETAILS` so the test enumerates real types correctly:

```bash
grep -n "type:" src/lib/assetDetails.ts
```

Expected output (5 distinct type strings across 10 entries):
```
      type: "Acción",
      type: "Acción",
      type: "Acción",
      type: "ETF",
      type: "ETF",
      type: "ETF",
      type: "Criptomoneda",
      type: "Criptomoneda",
      type: "Derivado (Knock-out)",
      type: "Cuenta remunerada",
```

Create `src/lib/__tests__/taxation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ASSET_DETAILS } from "@/lib/assetDetails";
import { getTaxation } from "@/lib/taxation";

describe("getTaxation", () => {
  it("returns a tax treatment for every catalog type actually used in the catalog", () => {
    const typesInUse = new Set(Object.values(ASSET_DETAILS).map((d) => d.catalog.type));
    expect(typesInUse.size).toBe(5);
    for (const type of typesInUse) {
      const treatment = getTaxation(type);
      expect(treatment, `expected tax treatment for catalog type "${type}"`).toBeDefined();
    }
  });

  it("returns undefined for an unknown catalog type", () => {
    expect(getTaxation("Not A Real Type")).toBeUndefined();
  });

  it("classifies shares as a ganancia patrimonial taxed at 19%-28%", () => {
    expect(getTaxation("Acción")).toEqual({
      figure: "Ganancia patrimonial",
      rateRange: "19% – 28% (tramos del ahorro)",
      note: "Se aplica el método FIFO: se considera vendido primero lo que se compró primero.",
    });
  });

  it("flags that ETFs have no traspaso deferral, unlike mutual funds", () => {
    expect(getTaxation("ETF")?.note).toContain("no tienen diferimiento por traspaso");
  });

  it("classifies the cash account as rendimiento del capital mobiliario", () => {
    expect(getTaxation("Cuenta remunerada")).toEqual({
      figure: "Rendimiento del capital mobiliario",
      rateRange: "19% – 28% (tramos del ahorro)",
      note: "La entidad aplica una retención del 19% en origen, a cuenta de la declaración anual.",
    });
  });
});
```

(`ASSET_DETAILS` is `Record<string, AssetDetail>` keyed by ISIN — confirmed at `src/lib/assetDetails.ts:101` — so `Object.values(ASSET_DETAILS)` above is correct as written.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/taxation.test.ts`
Expected: FAIL — `Cannot find module '@/lib/taxation'`.

- [ ] **Step 3: Write the taxation module**

Create `src/lib/taxation.ts`:

```ts
export interface TaxTreatment {
  figure: string;
  rateRange: string;
  note: string;
}

export const TAXATION: Record<string, TaxTreatment> = {
  "Acción": {
    figure: "Ganancia patrimonial",
    rateRange: "19% – 28% (tramos del ahorro)",
    note: "Se aplica el método FIFO: se considera vendido primero lo que se compró primero.",
  },
  "ETF": {
    figure: "Ganancia patrimonial",
    rateRange: "19% – 28% (tramos del ahorro)",
    note: "A diferencia de los fondos de inversión, los ETF no tienen diferimiento por traspaso: vender uno para comprar otro tributa siempre en el momento de la venta.",
  },
  "Criptomoneda": {
    figure: "Ganancia patrimonial",
    rateRange: "19% – 28% (tramos del ahorro)",
    note: "Las tenencias en plataformas extranjeras por encima del umbral legal deben declararse en el Modelo 721.",
  },
  "Derivado (Knock-out)": {
    figure: "Ganancia patrimonial",
    rateRange: "19% – 28% (tramos del ahorro)",
    note: "Las pérdidas solo compensan con otras ganancias patrimoniales de la base del ahorro, no con rendimientos del trabajo.",
  },
  "Cuenta remunerada": {
    figure: "Rendimiento del capital mobiliario",
    rateRange: "19% – 28% (tramos del ahorro)",
    note: "La entidad aplica una retención del 19% en origen, a cuenta de la declaración anual.",
  },
};

export function getTaxation(catalogType: string): TaxTreatment | undefined {
  return TAXATION[catalogType];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/taxation.test.ts`
Expected: PASS (5/5).

- [ ] **Step 5: Run the full unit suite**

Run: `npm test`
Expected: all test files pass (the new one plus the 7 pre-existing).

- [ ] **Step 6: Commit**

```bash
git add src/lib/taxation.ts src/lib/__tests__/taxation.test.ts
git commit -m "Add Spanish tax treatment data module keyed by asset type"
```

---

## Task 2: Add the "Fiscalidad" section to the asset detail page

**Files:**
- Modify: `src/app/(dashboard)/explorar/AssetDetailView.tsx`

**Interfaces:**
- Consumes: `getTaxation` from `@/lib/taxation` (Task 1); `detail.catalog.type` (already available via the existing `detail` lookup at the top of the component — see current line 27, `const detail = getAssetDetail(asset.isin);`); the `Row` component already defined in this file (see current lines 440-454).

- [ ] **Step 1: Add the import**

Replace:

```tsx
import { getFees, totalFeePct } from "@/lib/fees";
```

with:

```tsx
import { getFees, totalFeePct } from "@/lib/fees";
import { getTaxation } from "@/lib/taxation";
```

- [ ] **Step 2: Look up the tax treatment alongside the existing lookups**

Replace:

```tsx
  const detail = getAssetDetail(asset.isin);
  const curation = getCuration(asset.isin);
  const fees = getFees(asset.isin);
  const units = amount / asset.price;
```

with:

```tsx
  const detail = getAssetDetail(asset.isin);
  const curation = getCuration(asset.isin);
  const fees = getFees(asset.isin);
  const taxation = detail ? getTaxation(detail.catalog.type) : undefined;
  const units = amount / asset.price;
```

- [ ] **Step 3: Render the section, right after "Comisiones" and before "¿Cuánto tendrías hoy?"**

Replace:

```tsx
      <Card className="mb-4">
        <div className="mb-3 text-[13px] font-bold">¿Cuánto tendrías hoy?</div>
```

with:

```tsx
      {taxation && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Fiscalidad</div>
          <div className="divide-y divide-line/60 text-[13px]">
            <Row label="Figura tributaria" value={taxation.figure} />
            <Row label="Tramo aplicable" value={taxation.rateRange} />
          </div>
          <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-muted">
            {taxation.note}
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Información general, no constituye asesoramiento fiscal personalizado.
          </p>
        </Card>
      )}

      <Card className="mb-4">
        <div className="mb-3 text-[13px] font-bold">¿Cuánto tendrías hoy?</div>
```

(`taxation` is defined for all 5 catalog types present in the data, so this section renders for every asset in practice — the `{taxation && (...)}` guard exists purely for type safety against `getTaxation`'s `| undefined` return and the fact that `detail` itself can theoretically be `undefined`, mirroring the existing `fees &&` and `curation &&` guards a few sections above and below. The two `Row` lines reuse the exact same component as "Comisiones"; the note and disclaimer are plain paragraphs, not `Row`s, since they're prose rather than label/value pairs — the note gets a top border to separate it from the two structured rows above, matching how the total row in "Comisiones" is set off; the disclaimer is smaller and always rendered unconditionally within this block, never hidden or styled as a tooltip.)

- [ ] **Step 4: Run the full test suite**

Run: `npm test` and `npm run test:e2e`
Expected: unit tests pass; e2e stays at 19/19 (pre-existing — this task adds no new e2e tests yet, that's Task 3).

- [ ] **Step 5: Commit**

```bash
git add "src/app/(dashboard)/explorar/AssetDetailView.tsx"
git commit -m "Add Fiscalidad section to the asset detail page"
```

---

## Task 3: Add e2e coverage for the tax treatment section

**Files:**
- Create: `e2e/spanish-taxation.spec.ts`

**Interfaces:**
- Consumes: `seedProfile` from `./helpers/profile` (already exists — `/explorar` is gated behind a saved profile, so every test here must seed one before navigating).

- [ ] **Step 1: Write the spec**

Create `e2e/spanish-taxation.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { seedProfile } from "./helpers/profile";

test("a share's detail page shows ganancia patrimonial taxation with the FIFO note", async ({
  page,
}) => {
  await seedProfile(page);
  await page.goto("/explorar");
  await page.getByText("Apple Inc.", { exact: true }).click();

  await expect(page.getByText("Fiscalidad")).toBeVisible();
  await expect(page.getByText("Figura tributaria")).toBeVisible();
  await expect(page.getByText("Ganancia patrimonial")).toBeVisible();
  await expect(page.getByText("19% – 28% (tramos del ahorro)").first()).toBeVisible();
  await expect(page.getByText(/método FIFO/)).toBeVisible();
  await expect(page.getByText(/no constituye asesoramiento fiscal personalizado/)).toBeVisible();
});

test("an ETF's detail page flags the lack of traspaso deferral", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/explorar");
  await page.getByText("Vanguard FTSE All-World", { exact: true }).click();

  await expect(page.getByText("Fiscalidad")).toBeVisible();
  await expect(page.getByText(/no tienen diferimiento por traspaso/)).toBeVisible();
});

test("the cash account's detail page shows rendimiento del capital mobiliario", async ({
  page,
}) => {
  await seedProfile(page);
  await page.goto("/explorar");
  await page.locator("button.rounded-card", { hasText: "Cuenta remunerada" }).click();

  await expect(page.getByText("Fiscalidad")).toBeVisible();
  await expect(page.getByText("Rendimiento del capital mobiliario")).toBeVisible();
  await expect(page.getByText(/retención del 19% en origen/)).toBeVisible();
});
```

(The third test reuses the same `button.rounded-card` disambiguation as `e2e/fee-transparency.spec.ts`'s cash-account test, for the same reason: "Cuenta remunerada" is also a category filter pill label, so a plain exact-text locator would match two elements.)

- [ ] **Step 2: Run the new spec in isolation**

Run: `npx playwright test e2e/spanish-taxation.spec.ts`
Expected: 3/3 passing. If any text-based assertion doesn't match exactly (e.g. an em-dash rendering differently, or wording wrapping mid-string so `getByText` with a regex doesn't find it), inspect the actual rendered text with `npx playwright test e2e/spanish-taxation.spec.ts --debug` and adjust the literal string/regex in the test file to match — don't change the wording in `taxation.ts` or `AssetDetailView.tsx` to chase the test.

- [ ] **Step 3: Run the full e2e suite**

Run: `npm run test:e2e`
Expected: 22/22 passing (19 pre-existing + 3 new).

- [ ] **Step 4: Run the unit suite too**

Run: `npm test`
Expected: all test files pass.

- [ ] **Step 5: Commit**

```bash
git add e2e/spanish-taxation.spec.ts
git commit -m "Add e2e coverage for the Spanish tax treatment section"
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

Expected: all unit tests pass (8 files now); e2e 22/22.

- [ ] **Step 4: Manual visual check**

With the dev server running and a saved profile (seed one via `localStorage.setItem('t69_profile_score', '50')` in the browser console if needed, then reload `/explorar`):

- Open `/explorar` → Apple Inc. (acción). Confirm "Fiscalidad" appears after "Comisiones": Figura tributaria "Ganancia patrimonial", Tramo aplicable "19% – 28% (tramos del ahorro)", la nota FIFO, y el disclaimer visible.
- Open `/explorar` → Vanguard FTSE All-World (ETF). Confirm la nota menciona la falta de diferimiento por traspaso.
- Open `/explorar` → Bitcoin (criptomoneda). Confirm la nota menciona el Modelo 721.
- Open `/explorar` → Knock-out DAX 40 (derivado). Confirm la nota menciona la compensación de pérdidas.
- Open `/explorar` → Cuenta remunerada. Confirm Figura tributaria "Rendimiento del capital mobiliario" y la nota sobre la retención del 19%.
- Confirm el disclaimer aparece en los 10 activos, siempre con el mismo texto, sin variar.

- [ ] **Step 5: Final commit (if Step 4 surfaced any small fixes)**

If the manual check found anything to touch up, fix and commit it now with a message describing what was wrong. If nothing needed touching up, this step is a no-op.
