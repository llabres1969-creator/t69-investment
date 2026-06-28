# T69 Investment — transparencia de comisiones

## Contexto

T69 quiere ser radicalmente transparente con las comisiones de cada activo: quién cobra qué, en cada uno de los 10 activos del catálogo (curados o no). Hoy la ficha de detalle de un activo no muestra ningún coste — el usuario no tiene forma de saber qué le cuesta tener ese activo más allá del precio de compra.

## Decisiones de alcance

- **Aplica a los 10 activos del catálogo**, no solo a los 6 curados — la transparencia de costes no depende de si T69 lo recomienda o no.
- **Tres partes que cobran**, modelo de transparencia tipo MiFID II (coste total ex-ante):
  - **Gestora**: coste de gestión del fondo/ETF (TER). 0% en activos sin gestora real (acciones individuales, cripto, derivado).
  - **T69**: comisión de distribución/servicio que recibe T69 por dar acceso y seguimiento al activo.
  - **Custodio**: comisión de custodia/depósito.
- **Formato**: cada comisión como **% anual sobre el valor de la posición** (estilo coste corriente/TER), no como importe fijo ni comisión única de compraventa.
- **Fuera de alcance** (sub-proyectos futuros): impacto en € sobre las posiciones reales del usuario en `/portfolio`, fiscalidad española, comisiones de compraventa/corretaje.

## Composición por activo

| ISIN | Activo | Gestora | T69 | Custodio | Total |
|---|---|---|---|---|---|
| `IE00BK5BQT80` | Vanguard FTSE All-World | 0,22% | 0,12% | 0,05% | 0,39% |
| `IE00B4L5Y983` | iShares Core MSCI World | 0,20% | 0,12% | 0,05% | 0,37% |
| `IE00B3F81409` | iShares Core Govt Bond | 0,20% | 0,10% | 0,05% | 0,35% |
| `US0378331005` | Apple Inc. | 0% | 0,10% | 0,05% | 0,15% |
| `US5949181045` | Microsoft Corp. | 0% | 0,10% | 0,05% | 0,15% |
| `US88160R1014` | Tesla Inc. | 0% | 0,10% | 0,05% | 0,15% |
| `XBT-EUR` | Bitcoin | 0% | 0,15% | 0,10% | 0,25% |
| `ETH-EUR` | Ethereum | 0% | 0,15% | 0,10% | 0,25% |
| `DE-KO-DAX` | Knock-out DAX 40 | 0% | 0,20% | 0,05% | 0,25% |
| `CASH-EUR` | Cuenta remunerada | 0% | 0% | 0% | 0% |

## Modelo de datos

Nuevo archivo `src/lib/fees.ts`:

```ts
export interface FeeBreakdown {
  managerPct: number;
  distributionPct: number;
  custodyPct: number;
}

export const FEES: Record<string, FeeBreakdown> = {
  // una entrada por cada uno de los 10 ISIN, valores de la tabla anterior
};

export function getFees(isin: string): FeeBreakdown | undefined {
  return FEES[isin];
}

export function totalFeePct(fees: FeeBreakdown): number {
  return fees.managerPct + fees.distributionPct + fees.custodyPct;
}
```

(`getFees` devuelve `undefined` solo si un ISIN no está en el mapa — no debería ocurrir nunca dado que los 10 activos del catálogo están todos presentes, pero el componente que lo consume debe comprobarlo igualmente por seguridad de tipos, igual que `getCuration` ya hace.)

## UI — Ficha de detalle del activo

Nueva sección **"Comisiones"**, visible para todos los activos, ubicada justo después de "Datos del catálogo" y antes de "¿Cuánto tendrías hoy?":

```
Comisiones
──────────
Gestora              0,22%
T69                   0,12%
Custodio              0,05%
──────────────────────────
Coste total anual estimado   0,39%
```

La fila de gestora/T69/custodio usa el mismo patrón visual que "Datos del catálogo" (`Row` con label + valor). La fila de total va destacada (negrita, separador encima) para que se distinga claramente de las tres partidas individuales.

## Auto-revisión

- Sin placeholders: los 10 valores de la tabla están fijados explícitamente, no hay "TBD".
- Consistencia interna: el patrón `getFees`/`Record<string, FeeBreakdown>` replica exactamente `getCuration`/`CURATION` ya existente en `curation.ts`, manteniendo el mismo estilo de módulo de datos en el proyecto.
- Alcance: cambio único y acotado (1 archivo de datos + 1 sección de UI), implementable en un plan corto. El impacto en cartera y la fiscalidad quedan explícitamente fuera, documentados como sub-proyectos futuros.
- Ambigüedad resuelta: se deja explícito que "Coste total anual estimado" es la suma simple de las tres partidas, sin componer ni anualizar de otra forma.
