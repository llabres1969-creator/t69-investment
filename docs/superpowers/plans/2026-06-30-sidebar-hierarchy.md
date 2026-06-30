# Sidebar Jerárquico Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructurar el sidebar de Tony en una jerarquía con dos grupos colapsables (Mi Cartera, Comunidad) y crear cuatro shells nuevas (Dashboard, Radar, Roadmap, Comunidad).

**Architecture:** `Sidebar.tsx` pasa de un array plano `NAV_ITEMS` a un array tipado `NAV_ENTRIES` que soporta `NavItem` y `NavGroup`. Dos `useState` independientes controlan el estado abierto/cerrado de cada grupo, inicializados según la ruta activa. Cuatro páginas shell siguen el patrón empty-state ya establecido en el proyecto.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4, Vitest + React Testing Library, Playwright.

## Global Constraints

- Tailwind v4 con `@theme inline` — usar tokens existentes (`text-muted`, `text-primary`, `bg-primary-soft`, `bg-surface-2`, `border-line`, `rounded-full`, `rounded-control`) sin añadir clases arbitrarias de color.
- Fuente serif: `font-serif` para títulos de página (Source Serif 4). Cuerpo: sans-serif por defecto.
- Texto de labels del sidebar: `text-[13px] font-semibold` (top-level), `text-[12px] font-medium` (sub-items).
- Rutas: kebab-case, todo en minúsculas, sin trailing slash.
- Copy siempre en español.
- No hay backend — todas las páginas son client-side o Server Components estáticos.
- `ANTHROPIC_API_KEY` nunca en cliente ni en commits.

---

### Task 1: Tipos y NAV_ENTRIES en Sidebar.tsx

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Sidebar.test.tsx`

**Interfaces:**
- Produces: tipos exportables `NavItem`, `NavGroup`, `NavEntry`, `isGroup` (para uso en tests)

- [ ] **Step 1: Escribir el test que falla**

Crear `src/components/layout/Sidebar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

describe("Sidebar top-level items", () => {
  it("renders all top-level labels", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/dashboard");
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Pregunta a Tony")).toBeInTheDocument();
    expect(screen.getByText("Radar")).toBeInTheDocument();
    expect(screen.getByText("Mi Cartera")).toBeInTheDocument();
    expect(screen.getByText("Roadmap")).toBeInTheDocument();
    expect(screen.getByText("Comunidad")).toBeInTheDocument();
  });
});

describe("Mi Cartera group", () => {
  it("hides sub-items when group is closed", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/dashboard");
    render(<Sidebar />);
    expect(screen.queryByText("Mis datos")).not.toBeInTheDocument();
    expect(screen.queryByText("Transacciones")).not.toBeInTheDocument();
  });

  it("shows sub-items when on a child route (auto-expand)", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/transacciones");
    render(<Sidebar />);
    expect(screen.getByText("Transacciones")).toBeInTheDocument();
    expect(screen.getByText("Mis datos")).toBeInTheDocument();
    expect(screen.getByText("Metas")).toBeInTheDocument();
  });

  it("toggles open when chevron button is clicked", async () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/dashboard");
    render(<Sidebar />);
    expect(screen.queryByText("Mis datos")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /mi cartera/i }));
    expect(screen.getByText("Mis datos")).toBeInTheDocument();
  });
});

describe("Comunidad group", () => {
  it("shows Educación sub-item when on /educacion", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/educacion");
    render(<Sidebar />);
    expect(screen.getByText("Educación")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Ejecutar el test para verificar que falla**

```bash
cd /Users/antoniollabresgimenez/T69_Investment/app
npx vitest run src/components/layout/Sidebar.test.tsx
```

Esperado: FAIL — `Sidebar` no tiene grupos todavía.

- [ ] **Step 3: Implementar los tipos y NAV_ENTRIES en Sidebar.tsx**

Reemplazar el contenido completo de `src/components/layout/Sidebar.tsx`:

```tsx
"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export type NavItem  = { href: string; label: string };
export type NavGroup = { label: string; href: string; children: NavItem[] };
export type NavEntry = NavItem | NavGroup;

export function isGroup(e: NavEntry): e is NavGroup {
  return "children" in e;
}

const NAV_ENTRIES: NavEntry[] = [
  { href: "/dashboard",      label: "Dashboard" },
  { href: "/asesor",         label: "Pregunta a Tony" },
  { href: "/radar",          label: "Radar" },
  {
    label: "Mi Cartera",
    href: "/portfolio",
    children: [
      { href: "/datos",         label: "Mis datos" },
      { href: "/test",          label: "Test de perfil" },
      { href: "/explorar",      label: "Explorar activos" },
      { href: "/transacciones", label: "Transacciones" },
      { href: "/metas",         label: "Metas" },
      { href: "/documentos",    label: "Documentos" },
    ],
  },
  { href: "/roadmap",   label: "Roadmap" },
  {
    label: "Comunidad",
    href: "/comunidad",
    children: [
      { href: "/educacion", label: "Educación" },
    ],
  },
];

const MI_CARTERA_PATHS = [
  "/portfolio", "/datos", "/test", "/explorar",
  "/transacciones", "/metas", "/documentos",
];
const COMUNIDAD_PATHS = ["/comunidad", "/educacion"];

export function Sidebar() {
  const pathname = usePathname();

  const [carteraOpen, setCarteraOpen] = useState(
    () => MI_CARTERA_PATHS.some((p) => pathname?.startsWith(p)),
  );
  const [comunidadOpen, setComunidadOpen] = useState(
    () => COMUNIDAD_PATHS.some((p) => pathname?.startsWith(p)),
  );

  function groupState(label: string): [boolean, () => void] {
    if (label === "Mi Cartera") return [carteraOpen, () => setCarteraOpen((v) => !v)];
    return [comunidadOpen, () => setComunidadOpen((v) => !v)];
  }

  return (
    <aside className="shrink-0 border-r border-line bg-secondary-deep px-4 py-4 text-text md:w-[220px] md:py-6">
      <div className="mb-4 font-serif text-[20px] font-bold tracking-tight md:mb-6">
        Tony<span className="text-[#ff9a4d]">.</span>
      </div>
      <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
        {NAV_ENTRIES.map((entry) => {
          if (isGroup(entry)) {
            const [open, toggle] = groupState(entry.label);
            const groupActive = entry.children.some((c) => pathname?.startsWith(c.href))
              || pathname?.startsWith(entry.href);
            return (
              <div key={entry.label}>
                <div className="flex items-center">
                  <Link
                    href={entry.href}
                    className={cn(
                      "flex-1 shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors",
                      groupActive
                        ? "bg-primary-soft text-primary"
                        : "text-muted hover:bg-surface-2 hover:text-text",
                    )}
                  >
                    {entry.label}
                  </Link>
                  <button
                    onClick={toggle}
                    aria-label={entry.label}
                    className="shrink-0 rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text"
                  >
                    <span
                      className={cn(
                        "inline-block text-[11px] transition-transform duration-200",
                        open ? "rotate-90" : "rotate-0",
                      )}
                    >
                      ›
                    </span>
                  </button>
                </div>
                {open && (
                  <div className="mt-1 flex flex-col gap-0.5 pl-4">
                    {entry.children.map((child) => {
                      const active = pathname?.startsWith(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "rounded-full px-3 py-2 text-[12px] font-medium transition-colors",
                            active
                              ? "bg-primary-soft text-primary"
                              : "text-muted hover:bg-surface-2 hover:text-text",
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = pathname?.startsWith(entry.href);
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={cn(
                "shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              {entry.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 4: Ejecutar los tests para verificar que pasan**

```bash
npx vitest run src/components/layout/Sidebar.test.tsx
```

Esperado: PASS — 5 tests verdes.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Sidebar.tsx src/components/layout/Sidebar.test.tsx
git commit -m "feat: sidebar jerárquico con grupos colapsables Mi Cartera y Comunidad"
```

---

### Task 2: Shells nuevas (Dashboard, Radar, Roadmap, Comunidad)

**Files:**
- Create: `src/app/(dashboard)/dashboard/page.tsx`
- Create: `src/app/(dashboard)/radar/page.tsx`
- Create: `src/app/(dashboard)/roadmap/page.tsx`
- Create: `src/app/(dashboard)/comunidad/page.tsx`

**Interfaces:**
- Consumes: `Button` de `@/components/ui/Button`, `Card` de `@/components/ui/Card` — ya existentes.
- Produces: cuatro páginas con heading visible para los tests e2e.

- [ ] **Step 1: Escribir los tests e2e que fallan**

Añadir al final de `e2e/silvia-menu-shell.spec.ts`:

```ts
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
```

- [ ] **Step 2: Ejecutar los tests para verificar que fallan**

```bash
npx playwright test e2e/silvia-menu-shell.spec.ts --grep "empty state" 2>&1 | tail -20
```

Esperado: FAIL — rutas 404.

- [ ] **Step 3: Crear las cuatro páginas shell**

`src/app/(dashboard)/dashboard/page.tsx`:
```tsx
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Dashboard</h1>
      <p className="mb-5 text-[12.5px] text-muted">
        Vista general de tu situación financiera.
      </p>
      <Card className="py-10 text-center">
        <p className="mb-3 text-[13px] text-muted">Aún no hay datos que mostrar.</p>
        <Button disabled>Próximamente: ver resumen</Button>
      </Card>
    </div>
  );
}
```

`src/app/(dashboard)/radar/page.tsx`:
```tsx
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function RadarPage() {
  return (
    <div>
      <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Radar</h1>
      <p className="mb-5 text-[12.5px] text-muted">
        Señales y oportunidades de mercado.
      </p>
      <Card className="py-10 text-center">
        <p className="mb-3 text-[13px] text-muted">Aún no hay señales disponibles.</p>
        <Button disabled>Próximamente: activar radar</Button>
      </Card>
    </div>
  );
}
```

`src/app/(dashboard)/roadmap/page.tsx`:
```tsx
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function RoadmapPage() {
  return (
    <div>
      <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Roadmap</h1>
      <p className="mb-5 text-[12.5px] text-muted">
        Las próximas funcionalidades de Tony.
      </p>
      <Card className="py-10 text-center">
        <p className="mb-3 text-[13px] text-muted">Próximamente compartiremos el roadmap público.</p>
        <Button disabled>Próximamente</Button>
      </Card>
    </div>
  );
}
```

`src/app/(dashboard)/comunidad/page.tsx`:
```tsx
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ComunidadPage() {
  return (
    <div>
      <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Comunidad</h1>
      <p className="mb-5 text-[12.5px] text-muted">
        Conecta con otros inversores particulares.
      </p>
      <Card className="py-10 text-center">
        <p className="mb-3 text-[13px] text-muted">La comunidad está en construcción.</p>
        <Button disabled>Próximamente: unirte</Button>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Ejecutar los tests e2e para verificar que pasan**

```bash
npx playwright test e2e/silvia-menu-shell.spec.ts --grep "empty state" 2>&1 | tail -20
```

Esperado: PASS — 4 tests verdes.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/page.tsx \
        src/app/\(dashboard\)/radar/page.tsx \
        src/app/\(dashboard\)/roadmap/page.tsx \
        src/app/\(dashboard\)/comunidad/page.tsx \
        e2e/silvia-menu-shell.spec.ts
git commit -m "feat: shells Dashboard, Radar, Roadmap, Comunidad + tests e2e"
```

---

### Task 3: Actualizar el test e2e de orden del sidebar

**Files:**
- Modify: `e2e/silvia-menu-shell.spec.ts`

**Interfaces:**
- Consumes: sidebar con grupos colapsables de Task 1, shells de Task 2.

El test de orden espera el array antiguo de 9 items en orden plano. Ahora el sidebar tiene una estructura diferente y el grupo Mi Cartera está cerrado por defecto cuando se está en `/portfolio`... espera, `/portfolio` SÍ es una ruta hija de Mi Cartera, así que el grupo se auto-abre. El test navega a `/portfolio`, el grupo Mi Cartera se abre automáticamente. El resultado de `nav a` en ese estado incluye el `<Link>` del grupo ("Mi Cartera") + los 6 sub-items + los items planos. Comunidad está cerrado (no estamos en `/educacion`).

Nuevo orden esperado de `nav a` (navegando a `/portfolio`, Mi Cartera abierto, Comunidad cerrado):

```
Dashboard, Pregunta a Tony, Radar, Mi Cartera,
Mis datos, Test de perfil, Explorar activos, Transacciones, Metas, Documentos,
Roadmap, Comunidad
```

- [ ] **Step 1: Ejecutar el test de orden actual para ver que falla**

```bash
npx playwright test e2e/silvia-menu-shell.spec.ts --grep "sidebar shows" 2>&1 | tail -30
```

Esperado: FAIL — el array no coincide.

- [ ] **Step 2: Actualizar el test de orden**

En `e2e/silvia-menu-shell.spec.ts`, reemplazar el test `"the sidebar shows Transacciones, Metas and Documentos between Mi cartera and Explorar activos"`:

```ts
test("the sidebar shows the hierarchical nav with Mi Cartera group expanded", async ({
  page,
}) => {
  await seedProfile(page);
  await page.goto("/portfolio");

  const labels = await page.locator("nav a").allTextContents();
  expect(labels).toEqual([
    "Dashboard",
    "Pregunta a Tony",
    "Radar",
    "Mi Cartera",
    "Mis datos",
    "Test de perfil",
    "Explorar activos",
    "Transacciones",
    "Metas",
    "Documentos",
    "Roadmap",
    "Comunidad",
  ]);
});
```

- [ ] **Step 3: Ejecutar el test para verificar que pasa**

```bash
npx playwright test e2e/silvia-menu-shell.spec.ts --grep "hierarchical nav" 2>&1 | tail -20
```

Esperado: PASS.

- [ ] **Step 4: Ejecutar toda la suite e2e**

```bash
npx playwright test e2e/silvia-menu-shell.spec.ts 2>&1 | tail -30
```

Esperado: todos los tests de la suite en verde.

- [ ] **Step 5: Commit**

```bash
git add e2e/silvia-menu-shell.spec.ts
git commit -m "test: actualizar e2e orden sidebar a jerarquía con grupos colapsables"
```

---

### Task 4: Verificación final

**Files:** ninguno nuevo — solo ejecución de suites.

- [ ] **Step 1: Ejecutar todos los tests unitarios**

```bash
cd /Users/antoniollabresgimenez/T69_Investment/app
npx vitest run 2>&1 | tail -20
```

Esperado: PASS — todos los tests incluyendo `Sidebar.test.tsx`.

- [ ] **Step 2: Ejecutar todos los tests e2e**

```bash
npx playwright test 2>&1 | tail -30
```

Esperado: PASS — suite completa en verde.

- [ ] **Step 3: Verificar en el navegador**

```bash
npm run dev
```

Navegar a `http://localhost:3000`. Verificar:
- Sidebar muestra: Dashboard, Pregunta a Tony, Radar, Mi Cartera (con chevron), Roadmap, Comunidad (con chevron).
- Click en chevron de Mi Cartera: despliega 6 sub-items indentados.
- Navegar a `/transacciones`: Mi Cartera se auto-abre.
- Navegar a `/educacion`: Comunidad se auto-abre mostrando Educación.
- Las 4 shells nuevas muestran su empty state correctamente.

- [ ] **Step 4: Push a origin**

```bash
git push origin main
```
