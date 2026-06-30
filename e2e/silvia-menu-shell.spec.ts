import { expect, test } from "@playwright/test";
import { seedProfile } from "./helpers/profile";

test("the sidebar shows Transacciones, Metas and Documentos between Mi cartera and Explorar activos", async ({
  page,
}) => {
  await seedProfile(page);
  await page.goto("/portfolio");

  const labels = await page.locator("nav a").allTextContents();
  expect(labels).toEqual([
    "Test de perfil",
    "Mi cartera",
    "Pregunta a Tony",
    "Transacciones",
    "Metas",
    "Documentos",
    "Explorar activos",
    "Educación",
    "Mis datos",
  ]);
});

test("Transacciones shows the empty state with a disabled action", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/transacciones");

  await expect(page.getByRole("heading", { name: "Transacciones" })).toBeVisible();
  await expect(page.getByText("Aún no hay transacciones registradas.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Próximamente: importar histórico" }),
  ).toBeDisabled();
});

test("Metas shows the empty state with a disabled action", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/metas");

  await expect(page.getByRole("heading", { name: "Metas" })).toBeVisible();
  await expect(page.getByText("Aún no has creado ninguna meta.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Próximamente: crear meta" })).toBeDisabled();
});

test("Documentos shows the empty state with a disabled action", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/documentos");

  await expect(page.getByRole("heading", { name: "Documentos" })).toBeVisible();
  await expect(page.getByText("Aún no has subido ningún documento.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Próximamente: subir documento" }),
  ).toBeDisabled();
});

test("Transacciones, Metas, and Documentos redirect to /test without a saved profile", async ({
  page,
}) => {
  await page.goto("/transacciones");
  await expect(page).toHaveURL("/test");

  await page.goto("/metas");
  await expect(page).toHaveURL("/test");

  await page.goto("/documentos");
  await expect(page).toHaveURL("/test");
});

test("Mi cartera shows the Pasivos empty state with a disabled action", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/portfolio");

  await expect(page.getByText("Pasivos", { exact: true })).toBeVisible();
  await expect(page.getByText(/Aún no tienes pasivos registrados/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Próximamente: añadir pasivo" })).toBeDisabled();
});

test("Dashboard shows the empty state", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Vista general de tu situación financiera.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Próximamente: ver resumen" }),
  ).toBeDisabled();
});

test("Radar shows the empty state", async ({ page }) => {
  await page.goto("/radar");
  await expect(page.getByRole("heading", { name: "Radar" })).toBeVisible();
  await expect(page.getByText("Señales y oportunidades de mercado.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Próximamente: activar radar" }),
  ).toBeDisabled();
});

test("Roadmap shows the empty state", async ({ page }) => {
  await page.goto("/roadmap");
  await expect(page.getByRole("heading", { name: "Roadmap" })).toBeVisible();
  await expect(page.getByText("Las próximas funcionalidades de Tony.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Próximamente" }),
  ).toBeDisabled();
});

test("Comunidad shows the empty state", async ({ page }) => {
  await page.goto("/comunidad");
  await expect(page.getByRole("heading", { name: "Comunidad" })).toBeVisible();
  await expect(page.getByText("Conecta con otros inversores particulares.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Próximamente: unirte" }),
  ).toBeDisabled();
});
