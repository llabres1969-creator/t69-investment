# Tony — menú y diseño de Documentos, Transacciones, Metas y Pasivos (sin conexiones)

## Contexto

Inspirado en la estructura de menú de CFO Silvia (My Portfolio, Vault, Transactions, Goals), el usuario quiere añadir a Tony el menú y el diseño de las secciones equivalentes — pero sin ninguna conexión real todavía: sin subida de documentos, sin importación de histórico, sin cuentas bancarias, sin creación de metas funcional. Es la fase "cascarón visual": el menú y las páginas existen y se ven coherentes con el resto de la app, pero no hay funcionalidad nueva detrás.

## Decisiones de alcance

- **"Activos y Pasivos" no es una página nueva.** Tony ya tiene "Mi cartera" para posiciones de inversión; en vez de duplicar, se añade una nueva `<Card>` "Pasivos" al final de la página existente `/portfolio`.
- **Tres páginas nuevas**: Transacciones (`/transacciones`), Metas (`/metas`), Documentos (`/documentos`) — cada una con un único estado: vacío, sin alternativa "con datos" porque no hay datos que cargar todavía.
- **Sin lógica nueva**: ninguna de las 3 páginas nuevas, ni la card de Pasivos, lee ni escribe datos. No hay subida de archivos, no hay formularios, no hay `localStorage` nuevo.
- **Botones deshabilitados, no botones falsos.** Cada estado vacío incluye un botón con `disabled`, etiquetado "Próximamente: …", para señalar honestamente que la acción no está implementada — en vez de un botón que parece funcional pero no hace nada al pulsarlo.
- **Transacciones estará siempre vacía** en esta fase, incluso si el usuario tiene posiciones en su cartera: Tony no modela un histórico de eventos de compra/venta (`usePortfolio` solo guarda `units`/`avgPrice` actuales, no transacciones individuales). Esto no es un bug, es el estado real del modelo de datos actual.
- **Las 3 páginas nuevas quedan protegidas por `<RequireProfile>`**, igual que `/portfolio` y `/explorar` — son páginas de "tu situación financiera", consistente con el resto de páginas de ese grupo.
- **Fuera de alcance**: subida real de documentos, importación de CSV/histórico, creación real de metas, cualquier conexión bancaria — todo eso son sub-proyectos de funcionalidad futuros, no parte de este cambio.

## Menú (`src/components/layout/Sidebar.tsx`)

Orden final de `NAV_ITEMS`:

```
Test de perfil   → /test
Mi cartera       → /portfolio
Transacciones    → /transacciones
Metas            → /metas
Documentos       → /documentos
Explorar activos → /explorar
Educación        → /educacion
Mis datos        → /datos
```

(Los 3 ítems nuevos se insertan entre "Mi cartera" y "Explorar activos"; el resto del orden no cambia.)

## Páginas nuevas

Cada página sigue el patrón ya establecido (ver `src/app/(dashboard)/datos/page.tsx`): `<h1 className="font-serif text-[28px] font-bold tracking-tight">` + subtítulo en `text-muted` + una `<Card>` con el estado vacío centrado (mismo patrón que la sección "Posiciones" de `/portfolio` cuando no hay posiciones: `text-muted` + botón).

### `/transacciones`

- Título: "Transacciones"
- Subtítulo: "Historial de compras y ventas en tu cartera."
- Card: "Aún no hay transacciones registradas." + `<Button disabled>Próximamente: importar histórico</Button>`

### `/metas`

- Título: "Metas"
- Subtítulo: "Define objetivos financieros y sigue tu progreso."
- Card: "Aún no has creado ninguna meta." + `<Button disabled>Próximamente: crear meta</Button>`

### `/documentos`

- Título: "Documentos"
- Subtítulo: "Guarda informes, contratos y otros documentos de tu inversión."
- Card: "Aún no has subido ningún documento." + `<Button disabled>Próximamente: subir documento</Button>`

## Pasivos (`src/app/(dashboard)/portfolio/page.tsx`)

Nueva `<Card>` añadida inmediatamente después de la `<Card>` "Posiciones" existente (antes del cierre del `<div>` envolvente y de `</RequireProfile>`):

- Título de la card: "Pasivos"
- Contenido: "Aún no tienes pasivos registrados (hipoteca, préstamos, tarjetas...)." + `<Button disabled>Próximamente: añadir pasivo</Button>`

No se modifica nada del resto de la página (KPIs, asignación, posiciones siguen exactamente igual).

## Auto-revisión

- Sin placeholders: el texto exacto de cada título, subtítulo y estado vacío está fijado, no hay "TBD".
- Consistencia interna: las 4 piezas (3 páginas + 1 card) siguen el mismo patrón visual y el mismo mecanismo de "deshabilitado, no falso" — ninguna se desvía.
- Alcance: cambio puramente de estructura/UI, cero lógica de datos nueva, fácil de implementar en un plan corto.
- Ambigüedad resuelta: se documenta explícitamente por qué Transacciones está siempre vacía (limitación real del modelo de datos, no un descuido), evitando que un futuro lector piense que falta conectar algo.
