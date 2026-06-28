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
