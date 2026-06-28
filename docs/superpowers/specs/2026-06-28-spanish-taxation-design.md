# T69 Investment — fiscalidad española por tipo de activo

## Contexto

T69 quiere que el usuario entienda cómo tributa fiscalmente, en España, cada tipo de activo del catálogo — no solo qué le cuesta (eso ya lo cubre la sección "Comisiones"), sino qué figura tributaria aplica y qué tramo de IRPF le corresponde a la ganancia o el rendimiento que obtenga. Hoy la ficha de detalle no dice nada sobre fiscalidad.

## Decisiones de alcance

- **Indexado por tipo de activo, no por ISIN.** Los 10 activos del catálogo caen en exactamente 5 tipos (`detail.catalog.type`): `"Acción"`, `"ETF"`, `"Criptomoneda"`, `"Derivado (Knock-out)"`, `"Cuenta remunerada"`. La fiscalidad depende del tipo, no del activo concreto, así que el dato se modela por tipo y se reutiliza entre todos los activos de ese tipo.
- **Contenido informativo y genérico**, no un cálculo personalizado — no se pide ni se usa la situación fiscal del usuario (tramo real de IRPF, otras rentas, etc.). Se muestra la figura tributaria aplicable, el rango de tipos (19%–28%, tramos del ahorro) y una nota específica relevante por tipo.
- **Disclaimer obligatorio** en la propia sección: el contenido es información general, no asesoramiento fiscal personalizado.
- **Ubicación**: nueva sección "Fiscalidad" en la ficha de detalle del activo (`/explorar`), justo después de "Comisiones".
- **Fuera de alcance**: cálculo de la ganancia/pérdida real del usuario, cualquier dato fiscal personal, IRPF de dividendos como caso aparte (se trata igual que cualquier rendimiento del capital mobiliario, sin desglosar), Patrimonio/Modelo 720 más allá de la mención puntual a cripto.

## Contenido fiscal por tipo

| `catalog.type` | Figura tributaria | Tramo | Nota clave |
|---|---|---|---|
| `Acción` | Ganancia patrimonial | 19% – 28% (tramos del ahorro) | Se aplica el método FIFO: se considera vendido primero lo que se compró primero. |
| `ETF` | Ganancia patrimonial | 19% – 28% (tramos del ahorro) | A diferencia de los fondos de inversión, los ETF no tienen diferimiento por traspaso: vender uno para comprar otro tributa siempre en el momento de la venta. |
| `Criptomoneda` | Ganancia patrimonial | 19% – 28% (tramos del ahorro) | Las tenencias en plataformas extranjeras por encima del umbral legal deben declararse en el Modelo 721. |
| `Derivado (Knock-out)` | Ganancia patrimonial | 19% – 28% (tramos del ahorro) | Las pérdidas solo compensan con otras ganancias patrimoniales de la base del ahorro, no con rendimientos del trabajo. |
| `Cuenta remunerada` | Rendimiento del capital mobiliario | 19% – 28% (tramos del ahorro) | La entidad aplica una retención del 19% en origen, a cuenta de la declaración anual. |

## Modelo de datos

Nuevo archivo `src/lib/taxation.ts`, mismo patrón que `fees.ts`/`curation.ts` pero indexado por tipo de activo en vez de por ISIN:

```ts
export interface TaxTreatment {
  figure: string;
  rateRange: string;
  note: string;
}

export const TAXATION: Record<string, TaxTreatment> = {
  // una entrada por cada uno de los 5 catalog.type, valores de la tabla anterior
};

export function getTaxation(catalogType: string): TaxTreatment | undefined {
  return TAXATION[catalogType];
}
```

(`getTaxation` devuelve `undefined` si el tipo no está en el mapa — no debería ocurrir nunca dado que los 5 tipos del catálogo están todos presentes, pero el componente que lo consume debe comprobarlo igual que ya hace con `getCuration`/`getFees`.)

## UI — Ficha de detalle del activo

Nueva sección **"Fiscalidad"**, visible para todos los activos, ubicada justo después de "Comisiones" y antes de "¿Cuánto tendrías hoy?":

```
Fiscalidad
──────────
Figura tributaria         Ganancia patrimonial
Tramo aplicable           19% – 28% (tramos del ahorro)
──────────────────────────────────────────────
A diferencia de los fondos de inversión, los ETF no tienen
diferimiento por traspaso: vender uno para comprar otro
tributa siempre en el momento de la venta.

Información general, no constituye asesoramiento fiscal
personalizado.
```

- "Figura tributaria" y "Tramo aplicable" usan el mismo patrón visual `Row` que el resto de secciones de datos.
- La nota específica va en texto normal (no en una `Row`), debajo de las dos filas, con un separador encima — mismo tratamiento visual que la nota de "Por qué está en el universo" en "Seguimiento de T69".
- El disclaimer va en texto más pequeño y atenuado (mismo estilo que el texto de ayuda bajo el título de Educación), siempre visible, sin condicionarlo a nada.

## Auto-revisión

- Sin placeholders: las 5 filas de la tabla están fijadas explícitamente.
- Consistencia interna: el patrón `getTaxation`/`Record<string, TaxTreatment>` replica `getFees`/`getCuration`, manteniendo el mismo estilo de módulo de datos del proyecto — la única diferencia deliberada es la clave (tipo de activo, no ISIN), justificada porque la fiscalidad es una propiedad del tipo.
- Alcance: cambio acotado (1 archivo de datos + 1 sección de UI), sin tocar comisiones, perfil, portfolio ni moneda.
- Ambigüedad resuelta: el contenido es siempre genérico y estático — no varía con el activo concreto dentro de un mismo tipo, ni con ningún dato del usuario. El disclaimer es fijo y no condicional.
