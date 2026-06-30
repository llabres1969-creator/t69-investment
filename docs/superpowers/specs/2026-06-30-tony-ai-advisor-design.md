# Tony — asesor con IA real ("Pregunta a Tony")

## Contexto

Fase 2 del rebrand a Tony (la fase 1, solo naming, ya está fusionada). El usuario quiere que Tony deje de ser solo un nombre y se convierta en un asesor con el que se puede chatear de verdad, inspirado en "Ask Silvia" — un chat con un modelo de lenguaje real (Claude Haiku, vía la API de Anthropic), con acceso al contexto de tu cartera para responder de forma personalizada.

## Decisiones de alcance

- **Chat real con IA**, no respuestas predefinidas — primera pieza de backend que tiene Tony (hasta ahora la app es 100% cliente).
- **Página dedicada** `/asesor`, accesible desde un nuevo ítem del sidebar "Pregunta a Tony", protegida por `<RequireProfile>`.
- **Contexto de cartera incluido**: cada pregunta se envía junto con un resumen (perfil de riesgo, posiciones, asignación actual) calculado en el cliente a partir de los datos ya existentes en `localStorage`.
- **Historial persistente** en `localStorage`, recuperado entre sesiones; se borra junto con el resto de datos al usar "Empezar de cero" en Mis datos.
- **Proveedor**: Anthropic, modelo Claude Haiku (rápido y barato, adecuado para un asistente conversacional).
- **La clave de API la gestiona el usuario** en un archivo `.env.local` (ya excluido de git vía `.gitignore`) — nunca se pide, se pega en el chat de esta conversación, ni se commitea.
- **Fuera de alcance**: órdenes de compra/venta ejecutables, recomendaciones de "compra esto" concretas, garantías de rentabilidad, cualquier acción que modifique la cartera desde el chat (el chat es solo conversación, no actúa sobre tus datos).

## Arquitectura y flujo de datos

```
Usuario escribe pregunta
  → Cliente (página /asesor) calcula resumen de cartera desde localStorage
  → POST /api/chat { messages: [...historial], portfolioContext: "..." }
  → Ruta de servidor (Next.js Route Handler) construye el system prompt
    (personalidad de Tony + contexto de cartera) y llama a la API de
    Anthropic con ANTHROPIC_API_KEY (variable de entorno, solo en servidor)
  → Respuesta de Claude Haiku vuelve al cliente
  → Se añade al historial, se persiste en localStorage
```

La clave de API nunca llega al navegador: solo existe en el proceso de servidor de Next.js, leída de `process.env.ANTHROPIC_API_KEY` dentro del Route Handler.

## Personalidad de Tony (system prompt)

Texto base (en español) que se envía como mensaje de sistema en cada llamada a la API:

> Eres Tony, el asesor de inversión de la app Tony Investment, dirigida a inversores particulares en España. Tu tono es cercano pero riguroso: tuteas, evitas la jerga innecesaria, pero eres técnicamente preciso y honesto sobre los riesgos. No prometes rentabilidades. No das órdenes concretas de compra o venta de activos específicos — en su lugar, explicas conceptos, ayudas a razonar sobre diversificación, riesgo y horizonte temporal, y remites a la sección correspondiente de la app cuando aplica (Comisiones, Fiscalidad, Explorar activos). Aclaras, si la conversación lo requiere, que tus respuestas son información general y no constituyen asesoramiento financiero personalizado regulado. Respondes siempre en español.

A este system prompt se le añade dinámicamente el resumen de cartera del usuario (perfil de riesgo, número de posiciones, valor total, asignación actual) generado en el cliente.

## Resumen de cartera (contexto enviado a la API)

Nuevo módulo `src/lib/chatContext.ts`, función `buildPortfolioContext()` que lee (vía los hooks ya existentes `useProfileScore`, `usePortfolio`, y los datos de `ASSETS`) y devuelve un texto plano tipo:

```
Perfil de riesgo: Equilibrado (puntuación 50/100).
Cartera: 3 posiciones, valor total 12.450 €.
Asignación actual: 40% renta variable global, 20% renta variable EE. UU., 25% renta fija, 15% cripto.
Posiciones: Vanguard FTSE All-World (4.200 €, +6,1%), Apple Inc. (3.100 €, +2,3%), Bitcoin (5.150 €, +18,4%).
```

Si el usuario no tiene posiciones, el resumen lo indica explícitamente ("Sin posiciones todavía") en vez de omitir la sección, para que Tony no asuma datos que no existen.

## Persistencia del historial

Nuevo hook `src/lib/useChat.ts`, mismo patrón que `usePortfolio`/`useProfileScore`:
- Clave de `localStorage`: `t69_chat_messages` (consistente con el prefijo interno `t69_` ya usado, sin relación con el naming visible "Tony").
- Forma: `{ role: "user" | "assistant"; content: string }[]`.
- `addMessage(role, content)`, `clearChat()` — `clearChat()` se invoca también desde el flujo de "Empezar de cero" en Mis datos.

## UI (`/asesor`)

- Página protegida por `<RequireProfile>`, con título de página "Pregunta a Tony" (serif, como el resto).
- Lista de mensajes en burbujas: mensajes del usuario alineados a la derecha (fondo naranja suave), de Tony a la izquierda (fondo blanco/tarjeta).
- Caja de texto + botón "Enviar" fijos abajo.
- Mientras se espera respuesta: indicador "Tony está escribiendo..." en vez del último mensaje.
- Si la llamada a la API falla (clave no configurada, error de red, error del proveedor): mensaje de error amigable en el propio hilo del chat ("Tony no ha podido responder ahora mismo. Inténtalo de nuevo en un momento."), sin romper la página ni perder el historial ya guardado.
- Mensaje de bienvenida cuando el historial está vacío: una burbuja de Tony con un saludo inicial fijo (no generado por IA, no cuenta como llamada a la API) invitando a preguntar.

## Configuración de la clave de API

`.env.local` (ya cubierto por `.gitignore`) debe contener:

```
ANTHROPIC_API_KEY=sk-ant-...
```

El usuario añade esta línea él mismo, directamente en el archivo, fuera de esta conversación. La ruta de servidor comprueba si la variable existe; si no, devuelve un error controlado que la UI muestra como el mensaje de error descrito arriba, en vez de fallar de forma opaca.

## Auto-revisión

- Sin placeholders: el system prompt, el formato del resumen de cartera, la clave de `localStorage`, y la ruta de API están todos fijados explícitamente.
- Consistencia interna: el patrón de `useChat.ts` replica exactamente `usePortfolio.ts`/`useProfileScore.ts` ya existentes; la integración con "Empezar de cero" reutiliza el flujo ya existente en `datos/page.tsx`.
- Alcance: una sola pieza de funcionalidad coherente (el asesor de chat), aunque toca varias capas (API route, lib de contexto, hook de persistencia, UI, integración con reset) — apropiado para un único plan con varias tareas, no necesita dividirse en sub-proyectos.
- Ambigüedad resuelta: se especifica explícitamente que el chat nunca actúa sobre los datos de la cartera (solo lee, nunca escribe), y que la clave de API es responsabilidad exclusiva del usuario, nunca compartida en la conversación con el agente.
