# T69 Investment — universo curado y seguimiento

## Contexto

Hasta ahora `/explorar` muestra un catálogo genérico de 10 activos de ejemplo, todos con el mismo estatus: cualquiera es "comprable" sin distinción. El usuario (asesor financiero senior, propietario del producto) quiere que el core business de T69 sea otro: T69 selecciona y hace seguimiento activo de un universo reducido de activos, y esa selección — no un catálogo abierto — es la propuesta de valor.

Este spec cubre **solo** el modelo de datos y la presentación del universo curado + su historial de seguimiento. Quedan fuera de este spec (son sub-proyectos independientes a diseñar después):
- Bloquear el acceso a `/explorar` hasta completar el test de perfil
- Desglose de comisiones por activo y por parte que las cobra
- Tratamiento fiscal español por tipo de activo
- Metodología formal de selección de activos (más allá de la tesis textual por activo)

## Decisiones de alcance

- **Universo cerrado, no un sello sobre un catálogo abierto.** Los activos curados son los únicos que T69 "recomienda"; el resto del catálogo sigue siendo accesible pero está explícitamente fuera del universo curado.
- **Seguimiento vivo y visible**: cada activo curado tiene una tesis de inversión (por qué está) y un historial de revisiones con fecha, estado y nota — no una etiqueta estática de bienvenida.
- **Sin panel de administración todavía.** El contenido de curación se mantiene como datos de ejemplo en código, igual que `assetDetails.ts` ya hace con ratios/balance/etc. Un panel de gestión es un sub-proyecto futuro si se decide construirlo.
- **Composición del universo demo actual**:
  - ✅ Curados: Vanguard FTSE All-World (`IE00BK5BQT80`), iShares Core MSCI World (`IE00B4L5Y983`), iShares Core Govt Bond (`IE00B3F81409`), Apple Inc. (`US0378331005`), Microsoft Corp. (`US5949181045`), Cuenta remunerada (`CASH-EUR`)
  - ❌ Fuera del universo curado (visibles, accesibles, explícitamente no recomendados): Tesla Inc. (`US88160R1014` — alta volatilidad/especulativo), Bitcoin (`XBT-EUR`), Ethereum (`ETH-EUR`), Knock-out DAX 40 (`DE-KO-DAX`)

## Modelo de datos

Nuevo archivo `src/lib/curation.ts`:

```ts
export type ReviewStatus = "incorporado" | "mantenido" | "en_vigilancia" | "sustituido";

export interface ReviewEntry {
  date: string;          // ISO "YYYY-MM-DD"
  status: ReviewStatus;
  note: string;           // motivo en lenguaje claro, una frase
}

export interface Curation {
  thesis: string;                 // por qué está en el universo, 1-2 frases
  reviewHistory: ReviewEntry[];   // más reciente primero
}

export const CURATION: Record<string, Curation> = {
  // keyed by ISIN, solo para los activos curados
};

export function getCuration(isin: string): Curation | undefined {
  return CURATION[isin];
}
```

`src/lib/assets.ts` gana un campo nuevo en `Asset`:

```ts
export interface Asset {
  // ...campos existentes sin cambios...
  curated: boolean;
}
```

(`curated` vive en `assets.ts` porque es una propiedad estructural del activo dentro del catálogo; el contenido narrativo de la curación — tesis e historial — vive separado en `curation.ts`, igual que `assetDetails.ts` ya separa los datos financieros extendidos del catálogo base. Esto evita que `assets.ts` crezca con bloques de texto largos.)

## UI — Explorar

La página `/explorar` pasa de un grid plano a dos secciones:

1. **"Universo T69"** (activos con `curated: true`) — arriba, con una frase introductoria fija explicando qué significa ("Estos son los activos que seleccionamos y revisamos activamente. Es nuestra selección, no una lista exhaustiva de mercado.")
2. **"Otros activos"** (el resto) — abajo, con un aviso claro ("Accesibles pero fuera de nuestro universo curado — sin seguimiento de T69.")

Los filtros de categoría existentes (Acciones/ETFs/Cripto/Derivados/Cuenta remunerada) se mantienen, pero ahora filtran dentro de cada sección, no sobre una lista única. La búsqueda por nombre/ticker/ISIN busca en ambas secciones a la vez.

`AssetCard` gana un pequeño indicador visual cuando `curated: true` (un badge o icono — color del acento naranja, consistente con el resto del diseño) para que se distinga incluso si el usuario llega a la ficha de detalle sin pasar por la sección.

## UI — Ficha de detalle del activo

Nueva sección **"Seguimiento de T69"**, visible solo si el activo es curado, ubicada antes de "Sobre el activo":

```
Seguimiento de T69
──────────────────
Por qué está en el universo
{thesis}

Historial de revisión
● {fecha} · {Estado capitalizado}
  {note}
● {fecha} · {Estado capitalizado}
  {note}
```

Mapeo de `status` a etiqueta visible:
- `incorporado` → "Incorporado"
- `mantenido` → "Mantenido"
- `en_vigilancia` → "En vigilancia"
- `sustituido` → "Sustituido"

Para los activos fuera del universo curado, esta sección no aparece — la ficha sigue mostrando el resto de secciones ya existentes sin cambios.

## Datos de ejemplo a escribir

Cada uno de los 6 activos curados necesita al menos una entrada de tipo `incorporado` y, para mostrar que el seguimiento es real (no cosmético), al menos uno de ellos debe tener una segunda entrada posterior con estado distinto a `incorporado` (p. ej. `mantenido`, fechada después de la de incorporación). El tono de las notas es profesional y conciso, una frase, en español, consistente con el resto del copy de la app (ver ejemplos ya acordados en la conversación: ETF de coste bajo, revisión trimestral, etc.).

## Fuera de alcance

- No se construye ninguna lógica de sustitución automática de activos — el estado `sustituido` es solo un valor narrativo en el historial, no dispara ningún efecto (p. ej. no retira el activo del universo automáticamente ni mueve posiciones existentes de usuarios).
- No se toca el modelo de portfolio, conversión de divisa, ni el test de perfil.
- No se construye control de acceso ligado al test (sub-proyecto aparte).
- No se construyen comisiones ni fiscalidad (sub-proyectos aparte).

## Auto-revisión

- Sin placeholders: la composición exacta del universo (6 curados / 4 fuera) y sus ISINs están fijados explícitamente.
- Consistencia interna: el campo `curated` vive en `assets.ts` (estructural) y el contenido narrativo en `curation.ts` (presentación), sin solaparse; coherente con el patrón ya existente `assets.ts` / `assetDetails.ts`.
- Alcance: enfocado a un único cambio coherente (modelo + presentación del universo curado), implementable en un plan único. Las dependencias futuras (comisiones, fiscalidad, control de acceso) quedan explícitamente fuera y documentadas como próximos sub-proyectos.
- Ambigüedad resuelta: el comportamiento del estado `sustituido` (puramente narrativo, sin efectos automáticos) se deja explícito para que no se interprete como una funcionalidad de gestión real.
