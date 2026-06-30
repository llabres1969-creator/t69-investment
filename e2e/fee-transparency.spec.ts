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
  // "Cuenta remunerada" is also a category filter pill label, so a plain text
  // locator matches both — scope to the asset-card button specifically (it has
  // the rounded-card class; the filter pill does not) rather than relying on
  // DOM order via .last().
  await page.locator("button.rounded-card", { hasText: "Cuenta remunerada" }).click();

  await expect(page.getByText("Comisiones")).toBeVisible();
  const zeroPercentRows = page.getByText("0,00%", { exact: true });
  await expect(zeroPercentRows).toHaveCount(4); // Gestora, Tony, Custodio, and the total
});
