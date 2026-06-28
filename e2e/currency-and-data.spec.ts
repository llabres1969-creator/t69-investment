import { expect, test } from "@playwright/test";
import { seedProfile } from "./helpers/profile";

test("toggling currency converts portfolio totals and persists across navigation", async ({
  page,
}) => {
  await seedProfile(page);
  await page.goto("/explorar");
  await page.getByText("Vanguard FTSE All-World").click();
  await page.getByRole("button", { name: "Añadir a mi cartera" }).click();

  await page.goto("/portfolio");
  await expect(page.getByText("200 €", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: "$", exact: true }).click();
  await expect(page.getByText("$215", { exact: true }).first()).toBeVisible();

  await page.goto("/explorar");
  await expect(page.getByRole("button", { name: "$", exact: true })).toHaveClass(/text-primary/);
});

test("resetting data clears the portfolio and the profile gate reactivates", async ({ page }) => {
  // Not seedProfile() here: addInitScript re-seeds localStorage on every navigation
  // in this context, which would silently undo the reset this test performs partway
  // through. A one-time page.evaluate sets the value without re-applying itself on
  // later navigations. /educacion isn't gated by RequireProfile, so it loads fine
  // even with no profile score yet — we just need any document to call evaluate on.
  await page.goto("/educacion");
  await page.evaluate(() => window.localStorage.setItem("t69_profile_score", "50"));

  await page.goto("/explorar");
  await page.getByText("Bitcoin", { exact: true }).click();
  await page.getByRole("button", { name: "Añadir a mi cartera" }).click();

  await page.goto("/datos");
  await page.getByRole("button", { name: "Empezar de cero" }).click();
  await expect(page.getByText("Se ha borrado tu cartera")).toBeVisible();

  // "Empezar de cero" also clears the saved profile score, so /portfolio is gated
  // again — it should redirect to /test instead of showing the (now reset) portfolio.
  await page.goto("/portfolio");
  await expect(page).toHaveURL("/test");
});
