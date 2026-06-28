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
  // "Cuenta remunerada" is also a category filter pill label, so a plain text
  // locator matches both — scope to the asset-card button specifically (it has
  // the rounded-card class; the filter pill does not).
  await page.locator("button.rounded-card", { hasText: "Cuenta remunerada" }).click();

  await expect(page.getByText("Fiscalidad")).toBeVisible();
  await expect(page.getByText("Rendimiento del capital mobiliario")).toBeVisible();
  await expect(page.getByText(/retención del 19% en origen/)).toBeVisible();
});
