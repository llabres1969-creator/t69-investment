import { expect, test } from "@playwright/test";

test("buying an asset from the explorer shows up as a real position in the portfolio", async ({
  page,
}) => {
  await page.goto("/explorar");
  await page.getByText("Bitcoin", { exact: true }).click();

  await expect(page.getByRole("heading", { name: "Bitcoin" })).toBeVisible();

  const amountInput = page.getByLabel(/Importe a invertir/);
  await amountInput.fill("500");

  await page.getByRole("button", { name: "Añadir a mi cartera" }).click();
  await expect(page.getByRole("button", { name: "Añadido" })).toBeDisabled();

  await page.getByRole("button", { name: "Ver en mi cartera →" }).click();
  await expect(page).toHaveURL("/portfolio");

  await expect(page.getByText("Bitcoin")).toBeVisible();
  await expect(page.getByText("500 €", { exact: true }).first()).toBeVisible();
});

test("the search box filters the asset grid", async ({ page }) => {
  await page.goto("/explorar");
  await expect(page.getByText("Vanguard FTSE All-World")).toBeVisible();

  await page.getByPlaceholder(/Buscar por nombre/).fill("bitcoin");
  await expect(page.getByText("Vanguard FTSE All-World")).not.toBeVisible();
  await expect(page.getByText("Bitcoin", { exact: true })).toBeVisible();
});

test("category pills filter the asset grid", async ({ page }) => {
  await page.goto("/explorar");
  await page.getByRole("button", { name: "Cripto", exact: true }).click();

  await expect(page.getByText("Bitcoin", { exact: true })).toBeVisible();
  await expect(page.getByText("Vanguard FTSE All-World")).not.toBeVisible();
});
