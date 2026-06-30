# Tony — Sidebar jerárquico con grupos colapsables

## Contexto

El sidebar actual es una lista plana de 9 items. El objetivo es restructurarlo para que refleje la jerarquía de Silvia: dos grupos colapsables (Mi Cartera y Comunidad) con sub-items indentados, más cuatro shells nuevas (Dashboard, Radar, Roadmap, Comunidad) que completan la arquitectura de navegación prevista.

## Estructura de navegación definitiva

```
Dashboard                          /dashboard    (shell nueva)
Pregunta a Tony                    /asesor       (existente)
Radar                              /radar        (shell nueva)
Mi Cartera ▸                       /portfolio    (grupo colapsable, existente)
  └ Mis datos                      /datos        (existente)
  └ Test de perfil                 /test         (existente)
  └ Explorar activos               /explorar     (existente)
  └ Transacciones                  /transacciones (existente)
  └ Metas                          /metas        (existente)
  └ Documentos                     /documentos   (existente)
Roadmap                            /roadmap      (shell nueva)
Comunidad ▸                        /comunidad    (grupo colapsable, shell nueva)
  └ Educación                      /educacion    (existente)
```

## Decisiones de alcance

- **Dos grupos colapsables**: Mi Cartera y Comunidad. Sin persistencia de estado — al recargar, la ruta activa determina si el grupo está abierto.
- **Auto-expand**: Mi Cartera se abre automáticamente si la ruta activa empieza por `/portfolio`, `/datos`, `/test`, `/explorar`, `/transacciones`, `/metas` o `/documentos`. Comunidad se abre si la ruta empieza por `/comunidad` o `/educacion`.
- **Toggle**: un `<button>` con chevron en la fila del grupo controla abrir/cerrar. El `<Link>` del grupo navega a su página. Son dos elementos independientes en la misma fila.
- **Shells nuevas**: Dashboard, Radar, Roadmap, Comunidad siguen el mismo patrón empty-state que Transacciones/Metas/Documentos — heading, texto descriptivo, botón deshabilitado "Próximamente".
- **Fuera de alcance**: contenido real de las shells nuevas, autenticación, backend.

## Arquitectura

### Tipos (`Sidebar.tsx`)

```ts
type NavItem  = { href: string; label: string };
type NavGroup = { label: string; href: string; children: NavItem[] };
type NavEntry = NavItem | NavGroup;

function isGroup(e: NavEntry): e is NavGroup {
  return "children" in e;
}
```

### `NAV_ENTRIES` (nuevo array)

```ts
const NAV_ENTRIES: NavEntry[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/asesor",    label: "Pregunta a Tony" },
  { href: "/radar",     label: "Radar" },
  {
    label: "Mi Cartera",
    href: "/portfolio",
    children: [
      { href: "/datos",          label: "Mis datos" },
      { href: "/test",           label: "Test de perfil" },
      { href: "/explorar",       label: "Explorar activos" },
      { href: "/transacciones",  label: "Transacciones" },
      { href: "/metas",          label: "Metas" },
      { href: "/documentos",     label: "Documentos" },
    ],
  },
  { href: "/roadmap", label: "Roadmap" },
  {
    label: "Comunidad",
    href: "/comunidad",
    children: [
      { href: "/educacion", label: "Educación" },
    ],
  },
];
```

### Estado en `Sidebar`

```ts
const MI_CARTERA_PATHS = ["/portfolio", "/datos", "/test", "/explorar",
                           "/transacciones", "/metas", "/documentos"];
const COMUNIDAD_PATHS  = ["/comunidad", "/educacion"];

const [carteraOpen,   setCarteraOpen]   = useState(() =>
  MI_CARTERA_PATHS.some(p => pathname?.startsWith(p)));
const [comunidadOpen, setComunidadOpen] = useState(() =>
  COMUNIDAD_PATHS.some(p => pathname?.startsWith(p)));
```

Cada grupo recibe su propio par `(open, setOpen)`.

### Render del grupo

Fila del grupo: `<Link href={group.href}>` (label) + `<button onClick={() => setOpen(v => !v)}>` (chevron). Sub-items: `<Link>` indentados con `pl-6`, solo montados cuando `open === true`.

### Estilo de sub-items

- `pl-6` de indent izquierdo.
- `text-[12px]` (vs 13px de items top-level).
- Mismos tokens de color activo/hover que el resto del nav.
- Chevron: `›` rotado 90° cuando abierto (`rotate-90 transition-transform`).

## Shells nuevas

Cuatro páginas bajo `src/app/(dashboard)/`:

| Ruta        | Título        | Descripción empty-state                          | Botón                          |
|-------------|---------------|--------------------------------------------------|--------------------------------|
| `/dashboard`| Dashboard     | Vista general de tu situación financiera.        | Próximamente: ver resumen      |
| `/radar`    | Radar         | Señales y oportunidades de mercado.              | Próximamente: activar radar    |
| `/roadmap`  | Roadmap       | Las próximas funcionalidades de Tony.            | Próximamente                   |
| `/comunidad`| Comunidad     | Conecta con otros inversores particulares.       | Próximamente: unirte           |

No requieren `<RequireProfile>` — son páginas informativas/placeholder.

## Tests

### Unidad (Vitest + RTL) — `Sidebar.test.tsx`
- Renderiza todos los labels top-level.
- Sub-items de Mi Cartera no están en DOM cuando el grupo está cerrado.
- Sub-items de Mi Cartera están en DOM cuando el grupo está abierto.
- Chevron rota al hacer click.

### E2E (Playwright) — `e2e/silvia-menu-shell.spec.ts`
- Actualizar el array `labels` esperado al nuevo orden con grupos expandidos.
- Añadir tests de existencia para las 4 shells nuevas (heading visible).

### Array esperado (grupos abiertos, navegando a `/portfolio`)

```ts
["Dashboard", "Pregunta a Tony", "Radar", "Mi Cartera",
 "Mis datos", "Test de perfil", "Explorar activos",
 "Transacciones", "Metas", "Documentos",
 "Roadmap", "Comunidad"]
```

(Comunidad cerrado al navegar a `/portfolio`; Educación no visible en ese estado.)

## Auto-revisión

- Sin placeholders: rutas, labels, tokens de estilo y lógica de auto-expand están todos especificados.
- Consistencia: el array esperado en tests refleja el render real (grupos abiertos/cerrados según ruta).
- Alcance: una sola pieza coherente (sidebar + shells). No necesita subdivisión.
- Ambigüedad resuelta: el click en el label del grupo navega, el click en el chevron colapsa. Son acciones independientes.
