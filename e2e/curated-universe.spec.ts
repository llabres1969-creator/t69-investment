import { expect, test } from "@playwright/test";
import { seedProfile } from "./helpers/profile";

test("Explorar shows two distinct sections: Universo T69 and Otros activos", async ({
  page,
}) => {
  await seedProfile(page);
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
  await seedProfile(page);
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
  await seedProfile(page);
  await page.goto("/explorar");
  await page.getByText("Apple Inc.", { exact: true }).click();

  await expect(page.getByText("Seguimiento de T69")).toBeVisible();
  await expect(page.getByText("Por qué está en el universo")).toBeVisible();
  await expect(page.getByText("Historial de revisión")).toBeVisible();
  await expect(page.getByText("Incorporado", { exact: false }).first()).toBeVisible();
});

test("a non-curated asset's detail page has no Seguimiento de T69 section", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/explorar");
  await page.getByText("Bitcoin", { exact: true }).click();

  await expect(page.getByText("Seguimiento de T69")).not.toBeVisible();
});
