import { expect, test } from "@playwright/test";

test("toggling currency converts portfolio totals and persists across navigation", async ({
  page,
}) => {
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

test("resetting data clears the portfolio and the profile banner reappears", async ({ page }) => {
  await page.goto("/explorar");
  await page.getByText("Bitcoin", { exact: true }).click();
  await page.getByRole("button", { name: "Añadir a mi cartera" }).click();

  await page.goto("/datos");
  await page.getByRole("button", { name: "Empezar de cero" }).click();
  await expect(page.getByText("Se ha borrado tu cartera")).toBeVisible();

  await page.goto("/portfolio");
  await expect(page.getByText("Aún no tienes posiciones")).toBeVisible();
  await expect(page.getByText("Descubre cómo deberías repartir tu dinero")).toBeVisible();
});
