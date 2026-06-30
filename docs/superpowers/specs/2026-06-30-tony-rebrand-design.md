# Tony Investment — rebranding de T69 a Tony

## Contexto

Inspirado en CFO Silvia (un "CFO de IA personal" con nombre propio para el mercado de inversores estadounidense), el usuario quiere darle a la app una identidad con personalidad propia adaptada al público español: **"Tony"**, en lugar del nombre actual "T69". Esta es la primera de dos fases: este sub-proyecto cubre solo el cambio de nombre/identidad visible; el diseño de "Tony" como asesor con personalidad propia (tono de voz, posibles mensajes personalizados) es un sub-proyecto futuro independiente, a abordar una vez el nombre esté asentado en toda la app.

## Decisiones de alcance

- **Solo cambios visibles al usuario.** Se actualiza todo el texto que el usuario ve en la interfaz.
- **No se toca el repo de GitHub** (`t69-investment`) — detalle técnico interno sin beneficio en renombrarlo ahora.
- **No se tocan las claves de `localStorage`** (`t69_currency`, `t69_positions`, `t69_profile_score`) — son internas, invisibles para el usuario, y renombrarlas arriesgaría perder los datos guardados de usuarios existentes sin ningún beneficio visible.
- **Título de página**: simplemente **"Tony"** (no "Tony Investment" ni ningún subtítulo).
- **Fuera de alcance**: diseño del asesor con personalidad (tono de voz, mensajes, posible chat) — sub-proyecto futuro.

## Cambios exactos por archivo

| Archivo | Texto actual | Texto nuevo |
|---|---|---|
| `src/components/layout/Sidebar.tsx` | `T69` + `.` naranja | `Tony` + `.` naranja (mismo estilo, solo cambia el texto) |
| `src/app/layout.tsx` | `title: "T69 Investment"` | `title: "Tony"` |
| `src/components/ui/AssetCard.tsx` | badge `T69` en tarjetas de activos curados | badge `Tony` |
| `src/app/(dashboard)/explorar/page.tsx` | encabezado `Universo T69` | encabezado `Universo Tony` |
| `src/app/(dashboard)/explorar/page.tsx` | `sin seguimiento de T69` | `sin seguimiento de Tony` |
| `src/app/(dashboard)/explorar/AssetDetailView.tsx` | fila de comisión con label `T69` | label `Tony` |
| `src/app/(dashboard)/explorar/AssetDetailView.tsx` | encabezado `Seguimiento de T69` | encabezado `Seguimiento de Tony` |
| `src/lib/curation.ts` | nota: `...universo T69...` | nota: `...universo Tony...` |
| `src/lib/__tests__/assets.test.ts` | cualquier assertion que dependa del texto `T69` | actualizada a `Tony` |

Cualquier prueba e2e existente que haga `getByText`/`getByRole` sobre alguno de estos textos (p.ej. `"Universo T69"`, `"Seguimiento de T69"`) debe actualizarse en el mismo cambio para no romper la suite — se localizan con `grep -rn "T69" e2e/` antes de implementar.

## Auto-revisión

- Sin placeholders: la tabla cubre los 9 puntos de cambio identificados por una búsqueda exhaustiva de `T69` en `src/`.
- Consistencia interna: el alcance excluye explícitamente repo de GitHub y claves de `localStorage`, evitando que la implementación se extienda sin querer a esos sitios.
- Alcance: cambio acotado de texto/branding, sin tocar lógica de negocio ni estructura de datos — implementable en un único plan corto.
- Ambigüedad resuelta: el título de página es exactamente `"Tony"`, sin sufijo ni subtítulo.
