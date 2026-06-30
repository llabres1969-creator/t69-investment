import { expect, test } from "@playwright/test";
import { seedProfile } from "./helpers/profile";

test("the sidebar includes Pregunta a Tony right after Mi cartera", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/portfolio");

  const labels = await page.locator("nav a").allTextContents();
  const cartera = labels.indexOf("Mi cartera");
  const asesor = labels.indexOf("Pregunta a Tony");
  expect(asesor).toBe(cartera + 1);
});

test("Pregunta a Tony shows the welcome message", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/asesor");

  await expect(page.getByRole("heading", { name: "Pregunta a Tony" })).toBeVisible();
  await expect(page.getByText(/Hola, soy Tony/)).toBeVisible();
});

test("Pregunta a Tony redirects to /test without a saved profile", async ({ page }) => {
  await page.goto("/asesor");
  await expect(page).toHaveURL("/test");
});

test("sending a message without a configured API key shows a graceful error", async ({
  page,
}) => {
  await seedProfile(page);
  await page.goto("/asesor");

  await page.getByPlaceholder("Escribe tu pregunta...").fill("¿Cómo diversifico mejor?");
  await page.getByRole("button", { name: "Enviar" }).click();

  // The user's own message should appear immediately, regardless of the API outcome.
  await expect(page.getByText("¿Cómo diversifico mejor?")).toBeVisible();

  // Without ANTHROPIC_API_KEY configured in this environment, the route returns an
  // error and the page shows the graceful fallback message instead of crashing.
  await expect(
    page.getByText("Tony no ha podido responder ahora mismo. Inténtalo de nuevo en un momento."),
  ).toBeVisible({ timeout: 10000 });
});
