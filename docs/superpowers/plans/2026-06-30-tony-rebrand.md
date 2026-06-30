# Tony Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename every user-visible occurrence of "T69" to "Tony" across the app's UI text, page title, and data-layer copy, without touching the GitHub repo name or any `localStorage` key.

**Architecture:** This is a pure text-rename change across 7 production files (no logic, no new components, no data-shape changes) plus 2 e2e spec files whose assertions hard-code the old text. Each task is a self-contained rename pass with its own test cycle, so a reviewer can approve production-code correctness independently from e2e-assertion correctness.

**Tech Stack:** Next.js 16, TypeScript, Vitest (unit), Playwright (e2e) — no new dependencies.

## Global Constraints

- Every occurrence of the literal text `T69` that is visible to the user, or that documents/labels something user-visible (test descriptions, data-layer notes), becomes `Tony`.
- Page `<title>` becomes exactly `"Tony"` — no suffix, no subtitle.
- Do NOT touch: the GitHub repo name (`t69-investment`), any `localStorage` key (`t69_currency`, `t69_positions`, `t69_profile_score` in `src/lib/useCurrency.ts`, `src/lib/usePortfolio.ts`, `src/lib/useProfileScore.ts`), `package.json`'s `name` field (already `"app"`, unrelated).
- No logic changes, no new components, no styling changes beyond the text itself — the orange-dot styling after the logo text in `Sidebar.tsx` stays exactly as-is, only the word before it changes.
- Reference spec: `docs/superpowers/specs/2026-06-30-tony-rebrand-design.md`

---

## Task 1: Rename "T69" to "Tony" in production code

**Files:**
- Modify: `src/components/layout/Sidebar.tsx:21`
- Modify: `src/app/layout.tsx:18`
- Modify: `src/components/ui/AssetCard.tsx:32`
- Modify: `src/app/(dashboard)/explorar/page.tsx:90`
- Modify: `src/app/(dashboard)/explorar/page.tsx:107`
- Modify: `src/app/(dashboard)/explorar/AssetDetailView.tsx:139`
- Modify: `src/app/(dashboard)/explorar/AssetDetailView.tsx:354`
- Modify: `src/lib/curation.ts:34`
- Modify: `src/lib/__tests__/assets.test.ts:5`

**Interfaces:**
- Consumes: nothing — this is a text-only change to existing JSX/string literals, no new functions or types.
- Produces: nothing new for later tasks to import. Task 2 depends on this task's *output text* matching exactly (`"Tony"`, `"Universo Tony"`, `"Seguimiento de Tony"`), since Task 2 updates e2e assertions to match.

- [ ] **Step 1: Confirm the current occurrences before editing**

Run:
```bash
grep -rn "T69" src/
```

Expected output (9 lines, matching exactly these locations):
```
src/app/layout.tsx:18:  title: "T69 Investment",
src/app/(dashboard)/explorar/page.tsx:90:              <h2 className="mb-1 text-[15px] font-bold">Universo T69</h2>
src/app/(dashboard)/explorar/page.tsx:107:                Accesibles pero fuera de nuestro universo curado — sin seguimiento de T69.
src/app/(dashboard)/explorar/AssetDetailView.tsx:139:              label="T69"
src/app/(dashboard)/explorar/AssetDetailView.tsx:354:          <div className="mb-3 text-[13px] font-bold">Seguimiento de T69</div>
src/components/layout/Sidebar.tsx:21:        T69<span className="text-[#ff9a4d]">.</span>
src/components/ui/AssetCard.tsx:32:              T69
src/lib/curation.ts:34:        note: "Entra en el universo T69 tras nuestra revisión trimestral de ETFs globales.",
src/lib/__tests__/assets.test.ts:5:  it("marks exactly the six T69-curated ISINs as curated", () => {
```

If your output differs (more, fewer, or different lines), STOP and report BLOCKED — the file contents have changed since this plan was written and the edits below may not apply cleanly.

- [ ] **Step 2: `src/components/layout/Sidebar.tsx`**

Replace:
```tsx
        T69<span className="text-[#ff9a4d]">.</span>
```
with:
```tsx
        Tony<span className="text-[#ff9a4d]">.</span>
```

- [ ] **Step 3: `src/app/layout.tsx`**

Replace:
```tsx
  title: "T69 Investment",
```
with:
```tsx
  title: "Tony",
```

- [ ] **Step 4: `src/components/ui/AssetCard.tsx`**

Replace:
```tsx
            <span className="rounded-full bg-primary-soft px-2 py-1 text-[9.5px] font-bold text-primary-hover">
              T69
            </span>
```
with:
```tsx
            <span className="rounded-full bg-primary-soft px-2 py-1 text-[9.5px] font-bold text-primary-hover">
              Tony
            </span>
```

- [ ] **Step 5: `src/app/(dashboard)/explorar/page.tsx`**

Replace:
```tsx
              <h2 className="mb-1 text-[15px] font-bold">Universo T69</h2>
```
with:
```tsx
              <h2 className="mb-1 text-[15px] font-bold">Universo Tony</h2>
```

Then replace:
```tsx
                Accesibles pero fuera de nuestro universo curado — sin seguimiento de T69.
```
with:
```tsx
                Accesibles pero fuera de nuestro universo curado — sin seguimiento de Tony.
```

- [ ] **Step 6: `src/app/(dashboard)/explorar/AssetDetailView.tsx`**

Replace:
```tsx
              label="T69"
```
with:
```tsx
              label="Tony"
```

Then replace:
```tsx
          <div className="mb-3 text-[13px] font-bold">Seguimiento de T69</div>
```
with:
```tsx
          <div className="mb-3 text-[13px] font-bold">Seguimiento de Tony</div>
```

- [ ] **Step 7: `src/lib/curation.ts`**

Replace:
```ts
        note: "Entra en el universo T69 tras nuestra revisión trimestral de ETFs globales.",
```
with:
```ts
        note: "Entra en el universo Tony tras nuestra revisión trimestral de ETFs globales.",
```

- [ ] **Step 8: `src/lib/__tests__/assets.test.ts`**

Replace:
```ts
  it("marks exactly the six T69-curated ISINs as curated", () => {
```
with:
```ts
  it("marks exactly the six Tony-curated ISINs as curated", () => {
```

- [ ] **Step 9: Confirm no occurrences remain in `src/`**

Run:
```bash
grep -rn "T69" src/
```
Expected: no output (exit code 1, nothing printed).

- [ ] **Step 10: Run the full unit suite**

Run: `npm test`
Expected: all 8 test files pass (51 tests), including the renamed test description in `assets.test.ts`.

- [ ] **Step 11: Commit**

```bash
git add src/components/layout/Sidebar.tsx src/app/layout.tsx src/components/ui/AssetCard.tsx "src/app/(dashboard)/explorar/page.tsx" "src/app/(dashboard)/explorar/AssetDetailView.tsx" src/lib/curation.ts src/lib/__tests__/assets.test.ts
git commit -m "Rename T69 to Tony across production code"
```

---

## Task 2: Update e2e assertions to match the new "Tony" text

**Files:**
- Modify: `e2e/curated-universe.spec.ts`
- Modify: `e2e/fee-transparency.spec.ts:37`

**Interfaces:**
- Consumes: the exact rendered strings from Task 1 (`"Universo Tony"`, `"Seguimiento de Tony"`) — these must match byte-for-byte or the Playwright assertions will fail to find the elements.

- [ ] **Step 1: Confirm the current occurrences before editing**

Run:
```bash
grep -n "T69" e2e/curated-universe.spec.ts e2e/fee-transparency.spec.ts
```

Expected output (10 lines):
```
e2e/curated-universe.spec.ts:4:test("Explorar shows two distinct sections: Universo T69 and Otros activos", async ({
e2e/curated-universe.spec.ts:10:  await expect(page.getByRole("heading", { name: "Universo T69" })).toBeVisible();
e2e/curated-universe.spec.ts:13:  // A curated asset (Apple) appears under "Universo T69" — find its card and confirm
e2e/curated-universe.spec.ts:14:  // the T69 badge renders.
e2e/curated-universe.spec.ts:16:    .getByRole("heading", { name: "Universo T69" })
e2e/curated-universe.spec.ts:20:  // A non-curated asset (Bitcoin) appears under "Otros activos", not under "Universo T69".
e2e/curated-universe.spec.ts:27:test("filtering to a category with no curated matches hides the Universo T69 heading", async ({
e2e/curated-universe.spec.ts:36:  await expect(page.getByRole("heading", { name: "Universo T69" })).not.toBeVisible();
e2e/curated-universe.spec.ts:41:test("a curated asset's detail page shows Seguimiento de T69 with thesis and review history", async ({
e2e/curated-universe.spec.ts:48:  await expect(page.getByText("Seguimiento de T69")).toBeVisible();
e2e/curated-universe.spec.ts:54:test("a non-curated asset's detail page has no Seguimiento de T69 section", async ({ page }) => {
e2e/curated-universe.spec.ts:59:  await expect(page.getByText("Seguimiento de T69")).not.toBeVisible();
e2e/fee-transparency.spec.ts:37:  await expect(zeroPercentRows).toHaveCount(4); // Gestora, T69, Custodio, and the total
```

If your output differs, STOP and report BLOCKED.

- [ ] **Step 2: `e2e/curated-universe.spec.ts` — replace every `T69` with `Tony`**

This file has 12 occurrences, all of them either test-name strings, code comments, or literal assertion strings — every single one becomes `Tony` (there is no occurrence in this file that should stay as `T69`). Open the file and replace each of the 12 lines listed in Step 1's expected output, substituting `T69` → `Tony` in place (test names, comments, `getByRole`/`getByText` arguments). For example, line 10:

Replace:
```ts
  await expect(page.getByRole("heading", { name: "Universo T69" })).toBeVisible();
```
with:
```ts
  await expect(page.getByRole("heading", { name: "Universo Tony" })).toBeVisible();
```

And line 48:

Replace:
```ts
  await expect(page.getByText("Seguimiento de T69")).toBeVisible();
```
with:
```ts
  await expect(page.getByText("Seguimiento de Tony")).toBeVisible();
```

Apply the same `T69` → `Tony` substitution to the remaining 10 occurrences (lines 4, 13, 14, 16, 20, 27, 36, 41, 59, and the test-name string on line 4 itself) — they're all plain string replacements with no structural changes.

- [ ] **Step 3: `e2e/fee-transparency.spec.ts`**

Replace:
```ts
  await expect(zeroPercentRows).toHaveCount(4); // Gestora, T69, Custodio, and the total
```
with:
```ts
  await expect(zeroPercentRows).toHaveCount(4); // Gestora, Tony, Custodio, and the total
```

(This is a comment only — the assertion itself counts `"0,00%"` occurrences and is unaffected by the rename, but the comment should stay accurate since it names the four fee rows.)

- [ ] **Step 4: Confirm no occurrences remain in `e2e/`**

Run:
```bash
grep -rn "T69" e2e/
```
Expected: no output.

- [ ] **Step 5: Run the full e2e suite**

Run: `npm run test:e2e`
Expected: 22/22 passing (the dev server must be running — start it with `npm run dev` in the background first if it isn't already, and confirm `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/explorar` returns `200` before running Playwright).

- [ ] **Step 6: Commit**

```bash
git add e2e/curated-universe.spec.ts e2e/fee-transparency.spec.ts
git commit -m "Update e2e assertions for the Tony rebrand"
```

---

## Task 3: Final verification sweep

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

- [ ] **Step 4: Confirm zero remaining "T69" anywhere in the app**

```bash
grep -rn "T69" src/ e2e/
```

Expected: no output.

- [ ] **Step 5: Manual visual check**

With the dev server running and a saved profile (seed via `localStorage.setItem('t69_profile_score', '50')` in the browser console, then reload `/explorar` — note the storage key itself stays `t69_profile_score` per the Global Constraints, only the visible text changes):

- Browser tab title reads exactly "Tony" (not "Tony Investment").
- Sidebar logo reads "Tony." with the orange dot in the same style as before.
- `/explorar` shows "Universo Tony" as the curated-section heading, and "sin seguimiento de Tony" under "Otros activos".
- A curated asset card (e.g. Apple) shows a "Tony" badge (not "T69").
- Opening Apple's detail page shows "Tony" as a row label in the "Comisiones" section, and "Seguimiento de Tony" as the curation-history section heading.
- Confirm `localStorage` keys are unchanged: in the browser console, `Object.keys(localStorage).filter(k => k.startsWith('t69_'))` still returns the three original keys.

- [ ] **Step 6: Final commit (if Step 5 surfaced any small fixes)**

If the manual check found anything to touch up, fix and commit it now with a message describing what was wrong. If nothing needed touching up, this step is a no-op.
