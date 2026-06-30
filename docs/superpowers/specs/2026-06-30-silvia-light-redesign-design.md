# Tony — rediseño claro inspirado en CFO Silvia

## Contexto

El usuario descubrió [CFO Silvia](https://www.cfosilvia.com) (un "CFO de IA personal" para inversores en EE. UU.) y quiere adoptar la estructura visual de su dashboard para Tony, manteniendo la identidad de marca propia (naranja). Esto sustituye el tema oscuro "terminal" del redesign anterior por un tema claro, con tarjetas tipo widget, sidebar con pill activa, y tipografía serif para titulares — aplicado a toda la app, no solo a una página.

Referencia visual: captura de pantalla del dashboard de Silvia aportada por el usuario (ver conversación), mostrando: sidebar blanco con logo serif "Silvia", nav con pill activa en menta, fila de perfil/plan al fondo del sidebar, cabecera "Welcome, Antonio" + selector de periodo + botones "Customize"/"Add", tarjetas de métricas con sombra suave y esquinas redondeadas, una tarjeta "Radar" con icono de arrastre decorativo.

## Decisiones de alcance

- **Alcance: toda la app** (Mi cartera, Explorar activos, Test de perfil, Educación, Mis datos) — no solo una página.
- **Tema claro completo**, sustituyendo el tema oscuro actual — no es un cambio aditivo, es un reemplazo de los tokens de color.
- **Naranja (`#ff6a00`) como acento principal**, no el menta de Silvia — mantiene la identidad de marca de Tony ya establecida en el rebrand anterior.
- **Sin drag-and-drop real**: las tarjetas adoptan el aspecto visual de "widget" (sombra suave, esquinas redondeadas) pero el orden es fijo, igual que ahora. No se añade el icono decorativo de arrastre (`⠿`) de Silvia, porque sugeriría una funcionalidad de reordenación que no existe — sería una afordancia falsa.
- **Sin equivalente de "Radar" ni "Connect Account"**: son funciones específicas de Silvia (alertas de IA, conexión de cuentas reales) que no tienen equivalente en Tony hoy. Fuera de alcance — si se quieren en el futuro, son sub-proyectos de funcionalidad nueva, no parte de este cambio visual.
- **Sin fila de perfil/plan en el sidebar**: Tony no tiene login ni planes de pago, así que se omite la fila "Antonio Llabres · Free" y el upsell "Silvia Pro" — no hay nada real que mostrar ahí.
- **Cabecera sin "Welcome, {nombre}"**: Tony no tiene una identidad de usuario logueada. Cada página mantiene su título actual (ej. "Mi cartera"), solo que reestilizado con la nueva tipografía serif, integrado en la misma barra que ya aloja el selector de moneda.
- **Tipografía serif solo para titulares**: el logo del sidebar y los `<h1>` de página. El resto del texto (navegación, botones, párrafos) sigue en Inter; las cifras financieras siguen en JetBrains Mono.

## Paleta de colores (tokens en `src/app/globals.css`)

```css
:root {
  --bg: #f7f6f3;
  --surface: #ffffff;
  --surface-2: #f1efe9;
  --line: #e7e4dd;
  --text: #1a1a1a;
  --muted: #6b6b66;

  --primary: #ff6a00;
  --primary-hover: #e85f00;
  --primary-soft: rgba(255, 106, 0, 0.10);
  --on-primary: #ffffff;

  --secondary: #0077c2;
  --secondary-hover: #1a8ad6;
  --secondary-deep: #ffffff;

  --success: #1ea672;
  --danger: #d6453d;

  --radius-control: 10px;
  --radius-card: 16px;
  --radius-panel: 18px;
}
```

Notas sobre los cambios respecto al tema oscuro actual:
- `--on-primary` pasa de `#1a1100` (texto oscuro sobre naranja, pensado para el tema oscuro) a `#ffffff` (texto blanco sobre naranja) — mejor contraste cuando el resto de la UI es clara.
- `--success`/`--danger` se oscurecen ligeramente respecto a sus valores actuales (`#2ecc81`/`#f0524a`) para mantener un contraste AA suficiente sobre fondo blanco — los tonos originales, pensados para fondo oscuro, resultan demasiado claros sobre blanco.
- `--secondary-deep` (antes el fondo oscuro del sidebar, `#0d0f13`) pasa a `#ffffff` — el sidebar ahora es blanco, diferenciado del fondo principal (`--bg`, gris cálido) por un borde derecho fino en `--line`.

## Sidebar (`src/components/layout/Sidebar.tsx`)

- `<aside>` cambia de `bg-secondary-deep` a `bg-surface` (blanco), con `border-r border-line` para separarlo visualmente del contenido (que usa `--bg`, ligeramente distinto).
- El logo `Tony<span>.</span>` pasa a la nueva clase de fuente serif (`font-serif` vía el token de fuente añadido en `globals.css`/`layout.tsx`); el punto se mantiene en naranja.
- El item de navegación activo cambia de "borde izquierdo + fondo `surface-2`" a una **pill**: `rounded-full bg-primary-soft text-primary px-4 py-2.5` (sin borde lateral). Los items inactivos mantienen su estilo actual (texto `muted`, hover `surface-2`), también en formato pill para consistencia visual con el activo.
- No se añade ninguna sección bajo la navegación (sin perfil, sin upsell) — el `<aside>` termina en el último `<Link>` de `NAV_ITEMS`.

## Cabecera de página

`Topbar` (el selector de moneda) se renderiza una sola vez en `src/app/(dashboard)/layout.tsx`, compartido por todas las páginas — no es algo que cada página controle individualmente. Cada página, por debajo, pinta su propio `<h1>` con el título. En vez de forzar una fusión artificial de ambos en un único componente (que requeriría que el layout compartido conociera la ruta activa para elegir el título), la adaptación es más sencilla y respeta la arquitectura existente:

- `Topbar` no cambia de estructura — solo hereda el nuevo estilo de tokens (pill `bg-surface-2`, ya `rounded-full`) automáticamente.
- Cada uno de los 5 `<h1>` existentes (`datos/page.tsx`, `explorar/page.tsx`, `test/page.tsx`, `portfolio/page.tsx`, `educacion/page.tsx`) añade la clase `font-serif` a su `className` actual, sin tocar el tamaño (`text-[24px]`) ni el resto del layout de cada página. El resultado visual — selector de moneda arriba, título grande en serif justo debajo — consigue el mismo efecto de cabecera que en Silvia, sin necesitar un componente nuevo.
- No se añaden botones "Customize" ni "Add" — no hay nada que personalizar o añadir en Tony hoy.

## Tarjetas (`src/components/ui/Card.tsx`)

- Sin cambios estructurales: sigue siendo `rounded-card border border-line bg-surface p-5`. El efecto visual cambia automáticamente por la actualización de tokens (`--radius-card: 16px`, `--surface: #ffffff`, `--line: #e7e4dd`).
- Se añade `shadow-sm` (sombra suave de Tailwind) a la clase base de `Card`, para reforzar la sensación de tarjeta "elevada" tipo widget — el tema oscuro no tenía sombra porque no se aprecia sobre fondo oscuro; en claro sí aporta profundidad.
- No se añade ningún icono de arrastre.

## Tipografía (`src/app/layout.tsx`, `src/app/globals.css`)

- Se añade `Source_Serif_4` desde `next/font/google` junto a las fuentes ya cargadas (Inter, JetBrains Mono), expuesta como variable `--font-serif` y token Tailwind `--font-serif` en `@theme inline`.
- Uso: clase utilitaria `font-serif` aplicada solo al logo del sidebar y a los títulos de página vía `Topbar`. El resto de la app no cambia de fuente.

## Auto-revisión

- Sin placeholders: todos los valores de color, radios y la fuente están fijados explícitamente.
- Consistencia interna: el cambio de paleta es puramente de tokens (cascada automática a `Card`, `Button`, `Pill`, `Topbar`, etc.), mientras que los cambios estructurales son ediciones puntuales a 3 archivos (`globals.css`, `layout.tsx` raíz para la fuente, `Sidebar.tsx`) más una edición repetida y mínima (añadir `font-serif` al `<h1>` existente) en las 5 páginas con título.
- Alcance: cambio grande pero acotado — solo visual/estructural, sin tocar lógica de negocio, datos, ni añadir features nuevas (Radar, Connect Account, drag-and-drop quedan explícitamente fuera).
- Ambigüedad resuelta: se documenta explícitamente por qué se omiten el icono de arrastre, la fila de perfil/plan, y los botones "Customize"/"Add" — no son omisiones accidentales, son adaptaciones deliberadas a lo que Tony realmente tiene.
