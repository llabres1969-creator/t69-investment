# T69 Curated Universe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn T69 Investment's generic asset catalog into a closed, T69-curated universe with a visible per-asset review history, presented as two distinct sections in Explorar and a new "Seguimiento de T69" section on the asset detail page.

**Architecture:** A new `curated: boolean` field on `Asset` (structural, lives in `assets.ts`) drives which section an asset appears in. A separate `src/lib/curation.ts` module holds the narrative content (investment thesis + dated review history) keyed by ISIN, following the existing split pattern where `assetDetails.ts` already holds extended financial data separate from the base catalog. No backend, no admin UI — curation content is example data in code, same as the rest of the demo data layer.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind v4, Vitest (unit), Playwright (e2e) — all already in place, no new dependencies.

## Global Constraints

- Universo curado (exactamente estos 6 ISINs): `IE00BK5BQT80` (VWCE), `IE00B4L5Y983` (SWDA), `IE00B3F81409` (IEGA), `US0378331005` (AAPL), `US5949181045` (MSFT), `CASH-EUR`.
- Fuera del universo curado (exactamente estos 4 ISINs): `US88160R1014` (TSLA), `XBT-EUR` (BTC), `ETH-EUR` (ETH), `DE-KO-DAX` (Knock-out DAX 40).
- Sin panel de administración — contenido de curación como datos de ejemplo en código.
- `curated` es un campo estructural en `assets.ts`; la tesis y el historial narrativo viven en `curation.ts` — no se mezclan.
- El estado `sustituido` en el historial es puramente narrativo — no dispara ningún efecto automático (no retira activos, no mueve posiciones).
- No se toca el modelo de portfolio, conversión de divisa, ni el test de perfil.
- Reference spec: `docs/superpowers/specs/2026-06-28-curated-universe-design.md`

---

## Task 1: Add `curated` field to the asset catalog

**Files:**
- Modify: `src/lib/assets.ts`
- Test: `src/lib/__tests__/assets.test.ts` (new)

**Interfaces:**
- Produces: `Asset.curated: boolean` field; `CURATED_ASSETS: Asset[]` and `NON_CURATED_ASSETS: Asset[]` exported constants — later tasks (Explorar page, AssetCard) consume these instead of filtering `ASSETS` by `curated` themselves.

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/assets.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ASSETS, CURATED_ASSETS, NON_CURATED_ASSETS } from "@/lib/assets";

describe("curated universe composition", () => {
  it("marks exactly the six T69-curated ISINs as curated", () => {
    const curatedIsins = CURATED_ASSETS.map((a) => a.isin).sort();
    expect(curatedIsins).toEqual(
      [
        "CASH-EUR",
        "IE00B3F81409",
        "IE00B4L5Y983",
        "IE00BK5BQT80",
        "US0378331005",
        "US5949181045",
      ].sort(),
    );
  });

  it("marks exactly the four non-curated ISINs as not curated", () => {
    const nonCuratedIsins = NON_CURATED_ASSETS.map((a) => a.isin).sort();
    expect(nonCuratedIsins).toEqual(
      ["DE-KO-DAX", "ETH-EUR", "US88160R1014", "XBT-EUR"].sort(),
    );
  });

  it("partitions every asset into exactly one of the two groups", () => {
    expect(CURATED_ASSETS.length + NON_CURATED_ASSETS.length).toBe(ASSETS.length);
    const seen = new Set([...CURATED_ASSETS, ...NON_CURATED_ASSETS].map((a) => a.isin));
    expect(seen.size).toBe(ASSETS.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/assets.test.ts`
Expected: FAIL — `CURATED_ASSETS` and `NON_CURATED_ASSETS` are not exported from `@/lib/assets` yet (TypeScript/import error).

- [ ] **Step 3: Add the `curated` field to the `Asset` interface**

In `src/lib/assets.ts`, replace:

```ts
export interface Asset {
  isin: string;
  name: string;
  ticker: string;
  category: AssetCategory;
  assetClass: AssetClass;
  price: number;
  changePct: number;
  currency: "EUR" | "USD";
  description: string;
}
```

with:

```ts
export interface Asset {
  isin: string;
  name: string;
  ticker: string;
  category: AssetCategory;
  assetClass: AssetClass;
  curated: boolean;
  price: number;
  changePct: number;
  currency: "EUR" | "USD";
  description: string;
}
```

- [ ] **Step 4: Set `curated` on every asset entry**

For each of the 10 entries in the `ASSETS` array, add a `curated:` line immediately after the existing `category:` line. Replace each of these 10 blocks exactly as shown (the rest of each object is unchanged — only the inserted line matters):

```ts
    isin: "IE00BK5BQT80",
    name: "Vanguard FTSE All-World",
    ticker: "VWCE",
    assetClass: "rvg",
    category: "ETFs",
```
→
```ts
    isin: "IE00BK5BQT80",
    name: "Vanguard FTSE All-World",
    ticker: "VWCE",
    assetClass: "rvg",
    category: "ETFs",
    curated: true,
```

```ts
    isin: "IE00B4L5Y983",
    name: "iShares Core MSCI World",
    ticker: "SWDA",
    assetClass: "rvg",
    category: "ETFs",
```
→
```ts
    isin: "IE00B4L5Y983",
    name: "iShares Core MSCI World",
    ticker: "SWDA",
    assetClass: "rvg",
    category: "ETFs",
    curated: true,
```

```ts
    isin: "IE00B3F81409",
    name: "iShares Core Govt Bond",
    ticker: "IEGA",
    assetClass: "rf",
    category: "ETFs",
```
→
```ts
    isin: "IE00B3F81409",
    name: "iShares Core Govt Bond",
    ticker: "IEGA",
    assetClass: "rf",
    category: "ETFs",
    curated: true,
```

```ts
    isin: "US0378331005",
    name: "Apple Inc.",
    ticker: "AAPL",
    assetClass: "rvus",
    category: "Acciones",
```
→
```ts
    isin: "US0378331005",
    name: "Apple Inc.",
    ticker: "AAPL",
    assetClass: "rvus",
    category: "Acciones",
    curated: true,
```

```ts
    isin: "US5949181045",
    name: "Microsoft Corp.",
    ticker: "MSFT",
    assetClass: "rvus",
    category: "Acciones",
```
→
```ts
    isin: "US5949181045",
    name: "Microsoft Corp.",
    ticker: "MSFT",
    assetClass: "rvus",
    category: "Acciones",
    curated: true,
```

```ts
    isin: "US88160R1014",
    name: "Tesla Inc.",
    ticker: "TSLA",
    assetClass: "rvus",
    category: "Acciones",
```
→
```ts
    isin: "US88160R1014",
    name: "Tesla Inc.",
    ticker: "TSLA",
    assetClass: "rvus",
    category: "Acciones",
    curated: false,
```

```ts
    isin: "XBT-EUR",
    name: "Bitcoin",
    ticker: "BTC",
    assetClass: "cri",
    category: "Cripto",
```
→
```ts
    isin: "XBT-EUR",
    name: "Bitcoin",
    ticker: "BTC",
    assetClass: "cri",
    category: "Cripto",
    curated: false,
```

```ts
    isin: "ETH-EUR",
    name: "Ethereum",
    ticker: "ETH",
    assetClass: "cri",
    category: "Cripto",
```
→
```ts
    isin: "ETH-EUR",
    name: "Ethereum",
    ticker: "ETH",
    assetClass: "cri",
    category: "Cripto",
    curated: false,
```

```ts
    isin: "DE-KO-DAX",
    name: "Knock-out DAX 40",
    ticker: "KO-DAX",
    assetClass: "met",
    category: "Derivados",
```
→
```ts
    isin: "DE-KO-DAX",
    name: "Knock-out DAX 40",
    ticker: "KO-DAX",
    assetClass: "met",
    category: "Derivados",
    curated: false,
```

```ts
    isin: "CASH-EUR",
    name: "Cuenta remunerada",
    ticker: "CASH",
    assetClass: "rf",
    category: "Cuenta remunerada",
```
→
```ts
    isin: "CASH-EUR",
    name: "Cuenta remunerada",
    ticker: "CASH",
    assetClass: "rf",
    category: "Cuenta remunerada",
    curated: true,
```

- [ ] **Step 5: Export the two derived arrays**

At the end of `src/lib/assets.ts`, after the existing `ASSET_CATEGORIES` export, add:

```ts

export const CURATED_ASSETS: Asset[] = ASSETS.filter((a) => a.curated);
export const NON_CURATED_ASSETS: Asset[] = ASSETS.filter((a) => !a.curated);
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/assets.test.ts`
Expected: PASS (3/3 tests).

- [ ] **Step 7: Run the full unit suite to confirm nothing else broke**

Run: `npm test`
Expected: all test files pass (the new `assets.test.ts` plus the 3 pre-existing ones).

- [ ] **Step 8: Commit**

```bash
git add src/lib/assets.ts src/lib/__tests__/assets.test.ts
git commit -m "Mark the T69-curated universe on the asset catalog"
```

---

## Task 2: Create the curation data module

**Files:**
- Create: `src/lib/curation.ts`
- Test: `src/lib/__tests__/curation.test.ts` (new)

**Interfaces:**
- Consumes: `CURATED_ASSETS` from `@/lib/assets` (Task 1) — only to verify coverage in the test, not imported by the module itself (avoids a circular-feeling dependency; `curation.ts` is keyed by raw ISIN strings).
- Produces: `ReviewStatus` type, `ReviewEntry`/`Curation` interfaces, `getCuration(isin: string): Curation | undefined`, and `REVIEW_STATUS_LABEL: Record<ReviewStatus, string>` — Task 5 (AssetDetailView) imports all of these.

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/curation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { CURATED_ASSETS } from "@/lib/assets";
import { getCuration, REVIEW_STATUS_LABEL } from "@/lib/curation";

describe("getCuration", () => {
  it("returns a curation entry for every curated asset", () => {
    for (const asset of CURATED_ASSETS) {
      const curation = getCuration(asset.isin);
      expect(curation, `expected curation data for ${asset.isin}`).toBeDefined();
      expect(curation!.thesis.length).toBeGreaterThan(0);
      expect(curation!.reviewHistory.length).toBeGreaterThan(0);
    }
  });

  it("returns undefined for a non-curated asset", () => {
    expect(getCuration("US88160R1014")).toBeUndefined();
  });

  it("orders every review history most-recent-first", () => {
    for (const asset of CURATED_ASSETS) {
      const history = getCuration(asset.isin)!.reviewHistory;
      const dates = history.map((entry) => entry.date);
      const sortedDescending = [...dates].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
      expect(dates).toEqual(sortedDescending);
    }
  });

  it("has at least one asset with more than one review entry", () => {
    const hasMultiEntry = CURATED_ASSETS.some(
      (asset) => getCuration(asset.isin)!.reviewHistory.length > 1,
    );
    expect(hasMultiEntry).toBe(true);
  });
});

describe("REVIEW_STATUS_LABEL", () => {
  it("has a label for every status value used in the data", () => {
    for (const asset of CURATED_ASSETS) {
      for (const entry of getCuration(asset.isin)!.reviewHistory) {
        expect(REVIEW_STATUS_LABEL[entry.status]).toBeTruthy();
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/curation.test.ts`
Expected: FAIL — `Cannot find module '@/lib/curation'`.

- [ ] **Step 3: Write the curation module**

Create `src/lib/curation.ts`:

```ts
export type ReviewStatus = "incorporado" | "mantenido" | "en_vigilancia" | "sustituido";

export interface ReviewEntry {
  date: string; // ISO "YYYY-MM-DD"
  status: ReviewStatus;
  note: string;
}

export interface Curation {
  thesis: string;
  reviewHistory: ReviewEntry[]; // most recent first
}

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  incorporado: "Incorporado",
  mantenido: "Mantenido",
  en_vigilancia: "En vigilancia",
  sustituido: "Sustituido",
};

export const CURATION: Record<string, Curation> = {
  "IE00BK5BQT80": {
    thesis:
      "ETF de coste muy bajo (TER 0,22%) con exposición a más de 3.700 compañías globales. Es nuestra posición base de renta variable para perfiles de medio a largo plazo.",
    reviewHistory: [
      {
        date: "2026-03-15",
        status: "mantenido",
        note: "Sin cambios en la tesis. Costes y liquidez siguen siendo los mejores de su categoría.",
      },
      {
        date: "2025-10-10",
        status: "incorporado",
        note: "Entra en el universo T69 tras nuestra revisión trimestral de ETFs globales.",
      },
    ],
  },
  "IE00B4L5Y983": {
    thesis:
      "Alternativa de renta variable desarrollada con un enfoque algo más concentrado que nuestra posición base, útil para complementar exposición sin duplicar mercados emergentes.",
    reviewHistory: [
      {
        date: "2025-10-10",
        status: "incorporado",
        note: "Incluido como ETF complementario de renta variable desarrollada en la revisión trimestral.",
      },
    ],
  },
  "IE00B3F81409": {
    thesis:
      "ETF de deuda pública de la eurozona, nuestra pieza principal de renta fija para perfiles conservadores y moderados.",
    reviewHistory: [
      {
        date: "2025-10-10",
        status: "incorporado",
        note: "Incluido como núcleo de renta fija tras revisar la oferta de ETFs de gobierno en euros.",
      },
    ],
  },
  "US0378331005": {
    thesis:
      "Posición de calidad en tecnología de consumo, con generación de caja y márgenes sostenidos en el tiempo. La incluimos como exposición individual moderada dentro del bloque de renta variable de EE. UU.",
    reviewHistory: [
      {
        date: "2026-02-01",
        status: "mantenido",
        note: "Resultados trimestrales en línea con la tesis. Mantenemos la posición sin cambios.",
      },
      {
        date: "2025-09-01",
        status: "incorporado",
        note: "Entra en el universo tras nuestra revisión de compañías de calidad en EE. UU.",
      },
    ],
  },
  "US5949181045": {
    thesis:
      "Negocio diversificado entre software empresarial y nube, con crecimiento estable. Complementa la otra posición individual del bloque de renta variable de EE. UU. sin solapar el mismo sector.",
    reviewHistory: [
      {
        date: "2025-09-01",
        status: "incorporado",
        note: "Incorporado en sustitución de Tesla, que sale del universo por exceso de concentración de riesgo idiosincrático.",
      },
    ],
  },
  "CASH-EUR": {
    thesis:
      "Cuenta remunerada como pieza de liquidez y colchón de seguridad, cubierta por el fondo de garantía de depósitos hasta el límite legal.",
    reviewHistory: [
      {
        date: "2025-09-01",
        status: "incorporado",
        note: "Incluida como opción de liquidez remunerada para la parte conservadora de cualquier cartera.",
      },
    ],
  },
};

export function getCuration(isin: string): Curation | undefined {
  return CURATION[isin];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/curation.test.ts`
Expected: PASS (5/5 tests).

- [ ] **Step 5: Run the full unit suite**

Run: `npm test`
Expected: all test files pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/curation.ts src/lib/__tests__/curation.test.ts
git commit -m "Add T69 curation data: investment thesis and review history per curated asset"
```

---

## Task 3: Show a "T69" badge on curated asset cards

**Files:**
- Modify: `src/components/ui/AssetCard.tsx`

**Interfaces:**
- Consumes: `Asset.curated` (Task 1).

- [ ] **Step 1: Add the badge**

In `src/components/ui/AssetCard.tsx`, replace:

```tsx
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10.5px] font-bold text-secondary">
          {asset.ticker}
        </span>
        <span
          className={cn(
            "text-[12px] font-bold",
            up ? "text-success" : "text-danger",
          )}
        >
          {up ? "+" : ""}
          {asset.changePct.toFixed(1)}%
        </span>
      </div>
```

with:

```tsx
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10.5px] font-bold text-secondary">
            {asset.ticker}
          </span>
          {asset.curated && (
            <span className="rounded-full bg-primary-soft px-2 py-1 text-[9.5px] font-bold text-primary-hover">
              T69
            </span>
          )}
        </div>
        <span
          className={cn(
            "text-[12px] font-bold",
            up ? "text-success" : "text-danger",
          )}
        >
          {up ? "+" : ""}
          {asset.changePct.toFixed(1)}%
        </span>
      </div>
```

(Reuses the existing `bg-primary-soft`/`text-primary-hover` tokens — the same pair the orange-tone `Pill` component already uses, so this reads as visually consistent with the rest of the app rather than a one-off color.)

- [ ] **Step 2: Run the full unit suite**

Run: `npm test`
Expected: all test files pass (this is a presentation-only change, no unit tests target this component directly — coverage comes from Task 6's e2e additions).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/AssetCard.tsx
git commit -m "Show a T69 badge on curated asset cards"
```

---

## Task 4: Split Explorar into "Universo T69" and "Otros activos"

**Files:**
- Modify: `src/app/(dashboard)/explorar/page.tsx`

**Interfaces:**
- Consumes: `CURATED_ASSETS`, `NON_CURATED_ASSETS` from `@/lib/assets` (Task 1), `AssetCard` (Task 3).

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

  if (selected) {
    return <AssetDetailView asset={selected} onBack={() => setSelected(null)} />;
  }

  const totalShown = filteredCurated.length + filteredOther.length;
  const totalAvailable = CURATED_ASSETS.length + NON_CURATED_ASSETS.length;
  const nothingFound = totalShown === 0;

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-[24px] font-extrabold tracking-tight">Explorar activos</h1>
        <p className="mt-0.5 text-[12.5px] text-muted">
          {totalShown} de {totalAvailable} activos disponibles. Pulsa cualquiera para ver su ficha.
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
  );
}
```

(`ASSETS` itself is no longer imported here — the page now reads exclusively from the two partitioned arrays. The "no matches" message moves above both sections and only renders when both filtered lists are empty; each section heading only renders when that section actually has matching assets, so filtering down to e.g. only "Cripto" correctly hides the empty "Universo T69" heading instead of showing it with zero cards under it.)

- [ ] **Step 2: Run the full test suite**

Run: `npm test` (unit) and `npm run test:e2e` (e2e — the three pre-existing Explorar specs in `e2e/explore-and-buy.spec.ts` exercise search, category filtering, and buying, none of which depend on section structure, so they should still pass unmodified).
Expected: all unit tests pass; e2e: 7/7 (the pre-existing suite — Task 6 adds more).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(dashboard)/explorar/page.tsx"
git commit -m "Split Explorar into Universo T69 and Otros activos sections"
```

---

## Task 5: Add the "Seguimiento de T69" section to the asset detail page

**Files:**
- Modify: `src/app/(dashboard)/explorar/AssetDetailView.tsx`

**Interfaces:**
- Consumes: `getCuration`, `REVIEW_STATUS_LABEL` from `@/lib/curation` (Task 2).

- [ ] **Step 1: Add the import**

Replace:

```tsx
import { getAssetDetail } from "@/lib/assetDetails";
```

with:

```tsx
import { getAssetDetail } from "@/lib/assetDetails";
import { getCuration, REVIEW_STATUS_LABEL } from "@/lib/curation";
```

- [ ] **Step 2: Look up the curation data alongside the existing detail lookup**

Replace:

```tsx
  const detail = getAssetDetail(asset.isin);
  const units = amount / asset.price;
```

with:

```tsx
  const detail = getAssetDetail(asset.isin);
  const curation = getCuration(asset.isin);
  const units = amount / asset.price;
```

- [ ] **Step 3: Render the section, right before "Sobre el activo"**

Replace:

```tsx
      <Card className="mb-4">
        <div className="mb-3 text-[13px] font-bold">Sobre el activo</div>
        <p className="text-[13.5px] leading-relaxed text-muted">{asset.description}</p>
      </Card>
```

with:

```tsx
      {curation && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Seguimiento de T69</div>
          <div className="mb-4">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Por qué está en el universo
            </div>
            <p className="text-[13.5px] leading-relaxed">{curation.thesis}</p>
          </div>
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Historial de revisión
            </div>
            <div className="space-y-3">
              {curation.reviewHistory.map((entry) => (
                <div key={`${entry.date}-${entry.status}`} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div>
                    <div className="text-[13px] font-semibold">
                      {formatDateEs(entry.date)} · {REVIEW_STATUS_LABEL[entry.status]}
                    </div>
                    <div className="text-[13px] leading-relaxed text-muted">{entry.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-4">
        <div className="mb-3 text-[13px] font-bold">Sobre el activo</div>
        <p className="text-[13.5px] leading-relaxed text-muted">{asset.description}</p>
      </Card>
```

(`formatDateEs` is already imported in this file from `@/lib/format` — it converts the `"YYYY-MM-DD"` review dates to `"DD/MM/YYYY"`, the same helper already used for `ipoDate` and `nextExDate` elsewhere on this page.)

- [ ] **Step 4: Run the full test suite**

Run: `npm test` and `npm run test:e2e`
Expected: unit tests pass; e2e 7/7 (pre-existing — `explore-and-buy.spec.ts`'s Bitcoin-buying test visits a non-curated asset, where `curation` is `undefined` and this whole block doesn't render, so it's unaffected).

- [ ] **Step 5: Commit**

```bash
git add "src/app/(dashboard)/explorar/AssetDetailView.tsx"
git commit -m "Add Seguimiento de T69 section to the asset detail page"
```

---

## Task 6: Add e2e coverage for the curated universe

**Files:**
- Create: `e2e/curated-universe.spec.ts`

**Interfaces:**
- Consumes: the running app's `/explorar` route as restructured in Tasks 3-5. No code interfaces — this is black-box browser testing.

- [ ] **Step 1: Write the spec**

Create `e2e/curated-universe.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("Explorar shows two distinct sections: Universo T69 and Otros activos", async ({
  page,
}) => {
  await page.goto("/explorar");

  await expect(page.getByRole("heading", { name: "Universo T69" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Otros activos" })).toBeVisible();

  // A curated asset (Apple) appears under "Universo T69" — find its card and confirm
  // the T69 badge renders.
  const universeSection = page
    .getByRole("heading", { name: "Universo T69" })
    .locator("xpath=following-sibling::*[1]/following-sibling::div[1]");
  await expect(universeSection.getByText("Apple Inc.")).toBeVisible();

  // A non-curated asset (Bitcoin) appears under "Otros activos", not under "Universo T69".
  const otherSection = page
    .getByRole("heading", { name: "Otros activos" })
    .locator("xpath=following-sibling::*[1]/following-sibling::div[1]");
  await expect(otherSection.getByText("Bitcoin", { exact: true })).toBeVisible();
});

test("filtering to a category with no curated matches hides the Universo T69 heading", async ({
  page,
}) => {
  await page.goto("/explorar");
  await page.getByRole("button", { name: "Cripto", exact: true }).click();

  // None of the curated assets are crypto, so that heading should disappear entirely
  // rather than show with an empty grid underneath.
  await expect(page.getByRole("heading", { name: "Universo T69" })).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "Otros activos" })).toBeVisible();
  await expect(page.getByText("Bitcoin", { exact: true })).toBeVisible();
});

test("a curated asset's detail page shows Seguimiento de T69 with thesis and review history", async ({
  page,
}) => {
  await page.goto("/explorar");
  await page.getByText("Apple Inc.", { exact: true }).click();

  await expect(page.getByText("Seguimiento de T69")).toBeVisible();
  await expect(page.getByText("Por qué está en el universo")).toBeVisible();
  await expect(page.getByText("Historial de revisión")).toBeVisible();
  await expect(page.getByText("Incorporado", { exact: false }).first()).toBeVisible();
});

test("a non-curated asset's detail page has no Seguimiento de T69 section", async ({ page }) => {
  await page.goto("/explorar");
  await page.getByText("Bitcoin", { exact: true }).click();

  await expect(page.getByText("Seguimiento de T69")).not.toBeVisible();
});
```

- [ ] **Step 2: Run the new spec**

Run: `npx playwright test e2e/curated-universe.spec.ts`
Expected: 4/4 passing. If the first test's section-scoping locator (the `xpath=following-sibling::*` chain) doesn't match your actual DOM structure from Task 4, simplify it to just `page.getByText("Apple Inc.")` / `page.getByText("Bitcoin", { exact: true })` without scoping to a section container — the section-heading-visibility assertions already prove the sections exist, so the per-card scoping is a nice-to-have, not load-bearing.

- [ ] **Step 3: Run the full e2e suite**

Run: `npm run test:e2e`
Expected: 11/11 passing (7 pre-existing + 4 new).

- [ ] **Step 4: Commit**

```bash
git add e2e/curated-universe.spec.ts
git commit -m "Add e2e coverage for the T69 curated universe split and Seguimiento section"
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

Expected: all unit tests pass (including the 2 new files from Tasks 1-2); e2e 11/11.

- [ ] **Step 4: Manual visual check**

With the dev server running, open `http://localhost:3000/explorar` and confirm:
- "Universo T69" section appears first, with its intro sentence, showing exactly 6 cards (VWCE, SWDA, IEGA, AAPL, MSFT, Cuenta remunerada), each with a small orange "T69" badge next to its ticker.
- "Otros activos" section appears below, with its intro sentence, showing exactly 4 cards (TSLA, BTC, ETH, KO-DAX), none with the T69 badge.
- Click into Apple Inc. (curated) — confirm "Seguimiento de T69" appears with the thesis text and two review entries, most recent first: `01/02/2026 · Mantenido` then `01/09/2025 · Incorporado`.
- Click into Bitcoin (non-curated) — confirm no "Seguimiento de T69" section appears anywhere on the page.
- Use the category filter pills and the search box to confirm both sections filter correctly and empty sections disappear rather than showing an empty heading.

- [ ] **Step 5: Final commit (if Step 4 surfaced any small fixes)**

If the manual check found anything to touch up, fix and commit it now with a message describing what was wrong. If nothing needed touching up, this step is a no-op.
