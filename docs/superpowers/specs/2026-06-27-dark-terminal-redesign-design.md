# T69 Investment — rediseño "dark fintech profesional"

## Contexto

El producto actual usa un tema claro, naranja/azul, con radios muy redondeados (16–28px) y sombras suaves — una estética de app de consumo amigable. El usuario quiere acercarse a la sensación de un terminal financiero profesional (referencia: Bloomberg Terminal, pero no literal) porque el blanco/redondeado actual se siente poco "serio" para una herramienta de inversión.

## Decisiones de alcance

- **Cobertura**: toda la app (test de perfil, portfolio, explorar, educación, mis datos), no solo las pantallas densas en datos. Coherencia visual completa.
- **Intensidad**: "dark fintech profesional", no terminal crudo de los 90 (sin negro puro, sin ámbar/verde fósforo, sin todo en monoespaciada). Referencia: plataformas de trading modernas.
- **Tema**: reemplazo completo y único. No se mantiene el tema claro ni se construye un toggle claro/oscuro — no se ha pedido y añadiría una paleta paralela a mantener sin beneficio claro ahora.
- **Acento de marca**: se mantiene `#FF6A00` (naranja) como acento principal — es la continuidad de identidad de T69. No se sustituye por ámbar/dorado ni por un acento frío.
- **Base oscura**: grafito neutro, sin tinte azulado. El antiguo `--secondary-deep` (azul marino) deja de tener un rol de "color de marca" y pasa a ser simplemente una superficie ligeramente distinta para el sidebar.

## Tokens de color (`globals.css`)

Sustituye por completo el bloque `:root` actual:

| Token | Valor actual | Valor nuevo | Uso |
|---|---|---|---|
| `--bg` | `#f7f9fc` | `#0b0d10` | fondo de página |
| `--surface` | `#ffffff` | `#15181d` | tarjetas |
| `--surface-2` | `#eef4fb` | `#1c2027` | fondos secundarios, hover, chips |
| `--line` | `#d6dfeb` | `#2a2f38` | bordes (hairline 1px) |
| `--text` | `#111111` | `#e8eaed` | texto principal |
| `--muted` | `#5f6b7a` | `#8b92a0` | texto secundario |
| `--primary` | `#ff6a00` | `#ff6a00` (sin cambio) | acento de marca, CTAs |
| `--primary-hover` | `#e85d00` | `#ff8a33` (más claro: en dark mode el hover aclara, no oscurece) | |
| `--primary-soft` | `#ffe3cf` | `rgba(255, 106, 0, 0.12)` (translúcido, ya no sólido) | chips, fondos suaves |
| `--secondary` | `#00a3ff` | `#00a3ff` (sin cambio) | links, acentos de datos |
| `--secondary-hover` | `#008ae0` | `#33b6ff` | |
| `--secondary-deep` | `#0a2a66` | `#0d0f13` (reasignado: ahora es "fondo del sidebar", no un color de marca) | sidebar bg |
| `--success` | `#19b56b` | `#2ecc81` (más brillante, mejor contraste en oscuro) | ganancias |
| `--danger` | `#e0473e` | `#f0524a` (idem) | pérdidas |

Nuevo token:
- `--on-primary: #1a1100` — color de texto sobre fondo `--primary`. **Corrección de accesibilidad incluida**: blanco sobre `#FF6A00` no cumple contraste AA; casi-negro sí. Se aplica al texto del botón primario.

## Forma, densidad y elevación

- Radios: `--radius-control: 8px` (antes 16), `--radius-card: 10px` (antes 22), `--radius-panel: 12px` (antes 28).
- `--shadow-card` se elimina (pasa a `none`). La separación entre superficies se hace con `--line` (borde 1px), no con sombra/blur.
- Padding interno de tarjetas y tiles de estadísticas se reduce de ~20px a ~14px para más densidad.
- Labels de estadísticas (`StatGrid`, `KpiCard`) pasan a mayúsculas con letter-spacing (`text-transform: uppercase; letter-spacing: 0.04em`), tamaño 10–11px.

## Tipografía

- Inter se mantiene para texto de UI (labels, botones, párrafos, navegación).
- **Toda cifra financiera pasa a monoespaciada con `font-variant-numeric: tabular-nums`**: precios, porcentajes, ratios, balances, unidades de activos, importes de KPI. Hoy solo el KPI "Valor total" de portfolio usa mono; el resto (StatGrid, AnalystBar, DcaCalculator, lista de posiciones, AssetCard) pasa a usar la misma convención.
- Se añade una utilidad de Tailwind reutilizable (clase `num` o equivalente vía `@apply`) para no repetir `font-mono tabular-nums` manualmente en cada sitio.

## Cambios por componente

| Componente | Cambio |
|---|---|
| `Sidebar.tsx` | Fondo `--secondary-deep` (ahora `#0d0f13`). Ítem activo: borde izquierdo naranja 3px en vez de fondo en pastilla blanca/10%. |
| `Topbar.tsx` (toggle €/$) | Segmento activo: `bg-surface-2` + texto `--primary`, sin el fondo navy sólido que usaba antes. |
| `Button.tsx` | Variante `primary`: texto `--on-primary` (casi negro) en vez de blanco — fix de contraste. Variante `ghost`: borde `--line`, texto `--text`, sin fondo blanco (ya no existe). |
| `Pill.tsx` | Tono `orange`: fondo translúcido `--primary-soft` + borde a juego, texto `#ff9a4d`. Tono `blue`: fondo `--surface-2`, texto `--secondary` (antes `--secondary-deep`, que ya no es un color de texto válido). |
| `OptionCard.tsx` (test de perfil) | Activa: borde `rgba(255,106,0,.5)` + tinte de fondo sutil (`rgba(255,106,0,.06)`) en vez del degradado blanco→pastel. |
| `KpiCard.tsx` / `StatGrid.tsx` | Label en mayúsculas tracked; valor siempre en mono/tabular. |
| `AnalystBar.tsx` | Usa los nuevos `--success` / `--danger` más brillantes; segmento "mantener" usa `--primary-soft` translúcido. |
| `PriceChart.tsx`, `DcaCalculator.tsx`, `FinancialsChart.tsx` | Opacidad del área rellena sube de 8% a 12% (se ve más débil sobre fondo oscuro). Colores de línea (verde/rojo/naranja/azul) sin cambio. Las cifras de los ejes/leyendas pasan a mono. |
| `(dashboard)/layout.tsx` | Quita la dependencia de `shadow-card` como elevación; el contorno del shell pasa a un borde `--line` simple. |
| `AssetDetailView.tsx`, `portfolio/page.tsx` | Todas las cifras (precios, P/L, ratios) pasan a la clase mono/tabular nueva. |

## Fuera de alcance

- No se toca la lógica de negocio (cálculo de perfil, conversión de divisa, posiciones) — esto es exclusivamente visual.
- No se añade toggle claro/oscuro.
- No se rediseña la estructura de información (qué secciones existen) — eso ya se hizo en el rediseño anterior de la ficha de activo.

## Auto-revisión

- Sin placeholders ni TBD: todos los valores de color están definidos con hex/rgba concretos.
- Consistencia interna: el acento naranja se mantiene en ambos extremos del documento (decisión de alcance y tabla de tokens); no hay contradicción con la elección de "grafito neutro" para el fondo.
- Alcance: enfocado a un solo cambio coherente (tema visual), abarcable en un plan de implementación único.
- Ambigüedad: la única decisión dejada abierta a interpretación ("nivel de densidad exacto en px") se resuelve con valores concretos en la tabla de tokens y la lista de radios.
