import { expect, test } from "@playwright/test";

test("completing the 15-question quiz redirects to the portfolio with an ideal allocation", async ({
  page,
}) => {
  await page.goto("/test");
  await expect(page.getByText("Pregunta 1 de 15")).toBeVisible();

  for (let i = 0; i < 15; i++) {
    const isLast = i === 14;
    const optionCards = page.locator(".grid > button");
    await optionCards.first().click();

    const buttonLabel = isLast ? "Ver mi cartera ideal →" : "Siguiente pregunta";
    await page.getByRole("button", { name: buttonLabel }).click();
  }

  await expect(page).toHaveURL("/portfolio");
  await expect(page.getByText("Perfil: Conservador")).toBeVisible();
  await expect(page.getByText("Ideal", { exact: true })).toBeVisible();
});

test("selecting an option enables the next-question button", async ({ page }) => {
  await page.goto("/test");
  const next = page.getByRole("button", { name: "Siguiente pregunta" });
  await expect(next).toBeDisabled();

  await page.locator(".grid > button").first().click();
  await expect(next).toBeEnabled();
});
