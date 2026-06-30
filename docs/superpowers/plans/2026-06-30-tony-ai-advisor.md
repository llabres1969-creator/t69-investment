# Tony AI Advisor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real AI chat advisor ("Pregunta a Tony") — a dedicated page where the user converses with Claude Haiku, grounded in their actual portfolio context, with the conversation persisted in `localStorage`.

**Architecture:** A pure-function context builder (`buildPortfolioContext`) turns the user's existing profile/portfolio data into a text summary. A `localStorage`-backed hook (`useChat`, mirroring `usePortfolio`'s exact pattern) persists the conversation. A Next.js Route Handler (`/api/chat`) is the only place that touches `ANTHROPIC_API_KEY` — it never reaches the browser. The page wires these together: send a message → append to local history → POST to the route with history + context → append the reply.

**Tech Stack:** Next.js 16 (App Router, Route Handlers), TypeScript, Vitest, Playwright. No new npm dependencies — the Anthropic call is a plain `fetch` to `https://api.anthropic.com/v1/messages`, not the SDK, to avoid adding a dependency for one call site.

## Global Constraints

- The API key (`ANTHROPIC_API_KEY`) lives only in `.env.local` (already covered by `.gitignore`) and is read server-side via `process.env.ANTHROPIC_API_KEY` inside the Route Handler — never sent to or read by client code.
- **No agent, subagent, or implementer in this plan ever requests, invents, reads, or logs the actual API key value.** Tasks that touch the route handle the "key missing" case as a normal, tested code path — they do not need a real key to be implemented or unit-tested.
- Model: `claude-haiku-4-5-20251001`, `max_tokens: 500`.
- System prompt (exact text, Spanish, defined once in the route — see Task 3): cercano pero riguroso tone, no concrete buy/sell orders, no return guarantees, always responds in Spanish, clarifies it's general information not regulated personalized advice.
- New page `/asesor`, sidebar label "Pregunta a Tony", protected by `<RequireProfile>`.
- Chat history persists in `localStorage` under `t69_chat_messages` (internal key, consistent with the existing `t69_` prefix — unrelated to the visible "Tony" branding, per the earlier rebrand decision to leave storage keys alone).
- "Empezar de cero" in `/datos` also clears the chat history.
- Reference spec: `docs/superpowers/specs/2026-06-30-tony-ai-advisor-design.md`

---

## Task 1: Portfolio context builder

**Files:**
- Create: `src/lib/chatContext.ts`
- Test: `src/lib/__tests__/chatContext.test.ts`

**Interfaces:**
- Consumes: `ASSETS` from `@/lib/assets` (each asset has `isin`, `name`, `price`, `currency`, `assetClass`); `Position` type and shape (`{ isin, units, avgPrice }`) from `@/lib/usePortfolio`; `idealAllocation`/`profileLabel`/`ASSET_CLASS_LABEL`/`Allocation`/`AssetClass` from `@/lib/profile`; `convert`/`formatCurrency` from `@/lib/useCurrency`.
- Produces: `buildPortfolioContext(score: number | null, positions: Position[]): string` — Task 4 (the UI page) calls this on every send.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/__tests__/chatContext.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildPortfolioContext } from "@/lib/chatContext";

describe("buildPortfolioContext", () => {
  it("states the test hasn't been completed when score is null", () => {
    const context = buildPortfolioContext(null, []);
    expect(context).toContain("aún no ha completado el test de perfil");
  });

  it("states there are no positions when the portfolio is empty", () => {
    const context = buildPortfolioContext(50, []);
    expect(context).toContain("Equilibrado");
    expect(context).toContain("sin posiciones todavía");
  });

  it("summarizes value and allocation when positions exist", () => {
    const context = buildPortfolioContext(50, [
      { isin: "US0378331005", units: 2, avgPrice: 150 }, // Apple Inc., EUR-priced asset class rvus
    ]);
    expect(context).toContain("1 posiciones");
    expect(context).toContain("Apple Inc.");
    expect(context).toMatch(/Asignación actual:.*Renta variable EE\. UU\./);
  });

  it("includes a profit/loss percentage per position", () => {
    const context = buildPortfolioContext(50, [
      { isin: "US0378331005", units: 1, avgPrice: 100 },
    ]);
    expect(context).toMatch(/Apple Inc\. \([^)]+, [+-]\d+\.\d%\)/);
  });
});
```

(`US0378331005` is Apple Inc.'s ISIN in `ASSETS` — confirm its `assetClass` is `"rvus"` and its `price`/`currency` by checking `src/lib/assets.ts` before relying on exact numeric assertions; the test above intentionally only asserts on text patterns and labels, not exact prices, so it stays valid regardless of the current mock price.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/chatContext.test.ts`
Expected: FAIL — `Cannot find module '@/lib/chatContext'`.

- [ ] **Step 3: Write the context builder**

Create `src/lib/chatContext.ts`:

```ts
import { ASSETS } from "@/lib/assets";
import {
  Allocation,
  ASSET_CLASS_LABEL,
  AssetClass,
  idealAllocation,
  profileLabel,
} from "@/lib/profile";
import { convert, formatCurrency } from "@/lib/useCurrency";
import { Position } from "@/lib/usePortfolio";

export function buildPortfolioContext(score: number | null, positions: Position[]): string {
  const lines: string[] = [];

  lines.push(
    score === null
      ? "Perfil de riesgo: aún no ha completado el test de perfil."
      : `Perfil de riesgo: ${profileLabel(score)} (puntuación ${score}/100).`,
  );

  if (positions.length === 0) {
    lines.push("Cartera: sin posiciones todavía.");
    return lines.join("\n");
  }

  const enriched = positions
    .map((pos) => {
      const asset = ASSETS.find((a) => a.isin === pos.isin);
      if (!asset) return null;
      const valueEur = convert(pos.units * asset.price, asset.currency, "EUR");
      const investedEur = convert(pos.units * pos.avgPrice, asset.currency, "EUR");
      const plPct = investedEur > 0 ? ((valueEur - investedEur) / investedEur) * 100 : 0;
      return { asset, valueEur, plPct };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const totalValue = enriched.reduce((sum, p) => sum + p.valueEur, 0);

  lines.push(
    `Cartera: ${enriched.length} posiciones, valor total ${formatCurrency(totalValue, "EUR", 0)}.`,
  );

  if (totalValue > 0) {
    const allocation: Allocation = { rvg: 0, rvus: 0, rf: 0, met: 0, cri: 0 };
    for (const p of enriched) {
      const key = p.asset.assetClass as AssetClass;
      allocation[key] += (p.valueEur / totalValue) * 100;
    }
    const allocationText = (Object.entries(allocation) as [AssetClass, number][])
      .filter(([, pct]) => pct > 0.5)
      .map(([key, pct]) => `${Math.round(pct)}% ${ASSET_CLASS_LABEL[key]}`)
      .join(", ");
    lines.push(`Asignación actual: ${allocationText}.`);
  }

  const positionsText = enriched
    .map(
      (p) =>
        `${p.asset.name} (${formatCurrency(p.valueEur, "EUR", 0)}, ${p.plPct >= 0 ? "+" : ""}${p.plPct.toFixed(1)}%)`,
    )
    .join(", ");
  lines.push(`Posiciones: ${positionsText}.`);

  return lines.join("\n");
}
```

(`idealAllocation` is imported but intentionally unused in this minimal version — remove the import if your editor/linter flags it as unused; it was listed in "Consumes" for awareness but the spec's example context text doesn't include the ideal allocation, only the actual one. If TypeScript/ESLint errors on the unused import, delete that one name from the import line.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/chatContext.test.ts`
Expected: PASS (4/4). If the allocation-label test fails because Apple's `assetClass` isn't `"rvus"` in the current data, open `src/lib/assets.ts`, find Apple's actual `assetClass`, and adjust the test's expected label/regex to match reality — don't change `assets.ts` to chase the test.

- [ ] **Step 5: Fix the unused import if needed**

Run: `npm run lint`
Expected: no output. If ESLint flags `idealAllocation` as unused, remove it from the import in `chatContext.ts` and re-run lint.

- [ ] **Step 6: Run the full unit suite**

Run: `npm test`
Expected: all test files pass (the new one plus the 8 pre-existing).

- [ ] **Step 7: Commit**

```bash
git add src/lib/chatContext.ts src/lib/__tests__/chatContext.test.ts
git commit -m "Add portfolio context builder for the Tony AI advisor"
```

---

## Task 2: Chat persistence hook

**Files:**
- Create: `src/lib/useChat.ts`
- Test: `src/lib/__tests__/useChat.test.ts`

**Interfaces:**
- Produces: `ChatMessage` interface (`{ role: "user" | "assistant"; content: string }`), `addMessage(message: ChatMessage)`, `clearChat()`, `getChatMessages(): ChatMessage[]`, `useChat()` hook returning `{ messages: ChatMessage[]; loaded: boolean }`. Task 3's route does NOT use this file (it's stateless). Task 4 (UI) and Task 5 (reset wiring) both import from here.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/__tests__/useChat.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { addMessage, clearChat, getChatMessages } from "@/lib/useChat";

beforeEach(() => {
  localStorage.clear();
});

describe("addMessage", () => {
  it("appends a message to an empty history", () => {
    addMessage({ role: "user", content: "Hola" });
    expect(getChatMessages()).toEqual([{ role: "user", content: "Hola" }]);
  });

  it("keeps messages in the order they were added", () => {
    addMessage({ role: "user", content: "Hola" });
    addMessage({ role: "assistant", content: "¿En qué puedo ayudarte?" });
    expect(getChatMessages()).toEqual([
      { role: "user", content: "Hola" },
      { role: "assistant", content: "¿En qué puedo ayudarte?" },
    ]);
  });
});

describe("clearChat", () => {
  it("empties the history", () => {
    addMessage({ role: "user", content: "Hola" });
    clearChat();
    expect(getChatMessages()).toEqual([]);
  });
});

describe("getChatMessages", () => {
  it("returns an empty array when nothing has been saved", () => {
    expect(getChatMessages()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/useChat.test.ts`
Expected: FAIL — `Cannot find module '@/lib/useChat'`.

- [ ] **Step 3: Write the hook**

Create `src/lib/useChat.ts`:

```ts
"use client";

import { useEffect, useState } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "t69_chat_messages";

function read(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function write(messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    window.dispatchEvent(new Event("t69-chat-updated"));
  } catch {
    // ignore
  }
}

export function getChatMessages(): ChatMessage[] {
  return read();
}

export function addMessage(message: ChatMessage) {
  const messages = read();
  messages.push(message);
  write(messages);
}

export function clearChat() {
  write([]);
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function load() {
      setMessages(read());
      setLoaded(true);
    }
    load();
    window.addEventListener("t69-chat-updated", load);
    return () => window.removeEventListener("t69-chat-updated", load);
  }, []);

  return { messages, loaded };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/useChat.test.ts`
Expected: PASS (4/4).

- [ ] **Step 5: Run the full unit suite**

Run: `npm test`
Expected: all test files pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/useChat.ts src/lib/__tests__/useChat.test.ts
git commit -m "Add chat history persistence hook for the Tony AI advisor"
```

---

## Task 3: `/api/chat` Route Handler

**Files:**
- Create: `src/app/api/chat/route.ts`
- Test: `src/app/api/chat/__tests__/route.test.ts`

**Interfaces:**
- Consumes: nothing from Tasks 1–2 (this route is stateless and takes `messages`/`portfolioContext` as request body fields — it does not import `chatContext.ts` or `useChat.ts`, since those are client-side and the route receives their output as plain data over HTTP).
- Produces: `POST` handler at `/api/chat`. Request body: `{ messages: { role: "user" | "assistant"; content: string }[]; portfolioContext: string }`. Success response: `{ reply: string }`, HTTP 200. Error responses: `{ error: string }` with HTTP 500 (missing API key), 400 (empty/invalid messages), or 502 (upstream Anthropic call failed). Task 4 (UI) calls this endpoint via `fetch("/api/chat", ...)`.

**Important — read before starting:** This task's tests use a mocked `global.fetch`, never a real network call to Anthropic. Do not add, request, or hardcode any real API key value anywhere in this task. The "missing key" code path is tested by ensuring `process.env.ANTHROPIC_API_KEY` is unset during that specific test.

- [ ] **Step 1: Write the failing tests**

Create `src/app/api/chat/__tests__/route.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/chat/route";

const ORIGINAL_ENV = process.env.ANTHROPIC_API_KEY;

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/chat", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = "test-key-not-real";
});

afterEach(() => {
  process.env.ANTHROPIC_API_KEY = ORIGINAL_ENV;
  vi.restoreAllMocks();
});

describe("POST /api/chat", () => {
  it("returns 500 when ANTHROPIC_API_KEY is not configured", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const response = await POST(
      makeRequest({ messages: [{ role: "user", content: "Hola" }], portfolioContext: "" }),
    );
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toMatch(/ANTHROPIC_API_KEY/);
  });

  it("returns 400 when messages is missing or empty", async () => {
    const response = await POST(makeRequest({ messages: [], portfolioContext: "" }));
    expect(response.status).toBe(400);
  });

  it("calls the Anthropic API with the system prompt and forwards the reply", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ content: [{ text: "Hola, soy Tony." }] }), { status: 200 }),
    );

    const response = await POST(
      makeRequest({
        messages: [{ role: "user", content: "¿Cómo va mi cartera?" }],
        portfolioContext: "Perfil de riesgo: Equilibrado.",
      }),
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.reply).toBe("Hola, soy Tony.");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-api-key": "test-key-not-real" }),
      }),
    );
    const callBody = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(callBody.system).toContain("Eres Tony");
    expect(callBody.system).toContain("Perfil de riesgo: Equilibrado.");
    expect(callBody.model).toBe("claude-haiku-4-5-20251001");
  });

  it("returns 502 when the Anthropic call fails", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("error", { status: 500 }));

    const response = await POST(
      makeRequest({ messages: [{ role: "user", content: "Hola" }], portfolioContext: "" }),
    );
    expect(response.status).toBe(502);
  });

  it("only forwards the most recent 20 messages", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ content: [{ text: "ok" }] }), { status: 200 }),
    );
    const longHistory = Array.from({ length: 25 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `mensaje ${i}`,
    }));

    await POST(makeRequest({ messages: longHistory, portfolioContext: "" }));

    const callBody = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(callBody.messages).toHaveLength(20);
    expect(callBody.messages[19].content).toBe("mensaje 24");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/api/chat/__tests__/route.test.ts`
Expected: FAIL — `Cannot find module '@/app/api/chat/route'`.

- [ ] **Step 3: Write the route**

Create `src/app/api/chat/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT =
  "Eres Tony, el asesor de inversión de la app Tony Investment, dirigida a inversores " +
  "particulares en España. Tu tono es cercano pero riguroso: tuteas, evitas la jerga " +
  "innecesaria, pero eres técnicamente preciso y honesto sobre los riesgos. No prometes " +
  "rentabilidades. No das órdenes concretas de compra o venta de activos específicos — en " +
  "su lugar, explicas conceptos, ayudas a razonar sobre diversificación, riesgo y horizonte " +
  "temporal, y remites a la sección correspondiente de la app cuando aplica (Comisiones, " +
  "Fiscalidad, Explorar activos). Aclaras, si la conversación lo requiere, que tus respuestas " +
  "son información general y no constituyen asesoramiento financiero personalizado regulado. " +
  "Respondes siempre en español.";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Falta configurar ANTHROPIC_API_KEY en el servidor." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as {
    messages?: IncomingMessage[];
    portfolioContext?: string;
  };
  const messages = body.messages ?? [];
  const portfolioContext = body.portfolioContext ?? "";

  if (messages.length === 0) {
    return NextResponse.json({ error: "No se ha enviado ningún mensaje." }, { status: 400 });
  }

  const recentMessages = messages.slice(-20);

  const upstreamResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: `${SYSTEM_PROMPT}\n\nContexto de la cartera del usuario:\n${portfolioContext}`,
      messages: recentMessages,
    }),
  });

  if (!upstreamResponse.ok) {
    return NextResponse.json({ error: "Tony no ha podido responder ahora mismo." }, { status: 502 });
  }

  const data = (await upstreamResponse.json()) as { content?: { text?: string }[] };
  const reply = data.content?.[0]?.text ?? "";

  return NextResponse.json({ reply });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/api/chat/__tests__/route.test.ts`
Expected: PASS (5/5).

- [ ] **Step 5: Run the full unit suite**

Run: `npm test`
Expected: all test files pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/chat/route.ts src/app/api/chat/__tests__/route.test.ts
git commit -m "Add /api/chat route handler calling Claude Haiku"
```

---

## Task 4: `/asesor` page and sidebar entry

**Files:**
- Create: `src/app/(dashboard)/asesor/page.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

**Interfaces:**
- Consumes: `buildPortfolioContext` from `@/lib/chatContext` (Task 1); `ChatMessage`, `addMessage`, `useChat` from `@/lib/useChat` (Task 2); the `/api/chat` endpoint (Task 3); `useProfileScore` from `@/lib/useProfileScore`; `usePortfolio` from `@/lib/usePortfolio`; `Button`/`Card` from `@/components/ui/*`; `RequireProfile` from `@/components/RequireProfile`.

- [ ] **Step 1: Add the sidebar entry**

In `src/components/layout/Sidebar.tsx`, replace:

```tsx
const NAV_ITEMS = [
  { href: "/test", label: "Test de perfil" },
  { href: "/portfolio", label: "Mi cartera" },
  { href: "/transacciones", label: "Transacciones" },
```

with:

```tsx
const NAV_ITEMS = [
  { href: "/test", label: "Test de perfil" },
  { href: "/portfolio", label: "Mi cartera" },
  { href: "/asesor", label: "Pregunta a Tony" },
  { href: "/transacciones", label: "Transacciones" },
```

- [ ] **Step 2: Create the chat page**

Create `src/app/(dashboard)/asesor/page.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RequireProfile } from "@/components/RequireProfile";
import { useProfileScore } from "@/lib/useProfileScore";
import { usePortfolio } from "@/lib/usePortfolio";
import { addMessage, ChatMessage, useChat } from "@/lib/useChat";
import { buildPortfolioContext } from "@/lib/chatContext";

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hola, soy Tony. Pregúntame lo que quieras sobre tu cartera, comisiones, fiscalidad o cualquier duda de inversión.",
};

export default function AsesorPage() {
  const { score } = useProfileScore();
  const { positions } = usePortfolio();
  const { messages } = useChat();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const displayMessages = messages.length > 0 ? messages : [WELCOME_MESSAGE];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages.length]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    setError(null);
    addMessage({ role: "user", content: text });
    setInput("");
    setSending(true);

    try {
      const portfolioContext = buildPortfolioContext(score, positions);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: text }],
          portfolioContext,
        }),
      });

      if (!response.ok) {
        throw new Error("request failed");
      }

      const data = (await response.json()) as { reply: string };
      addMessage({ role: "assistant", content: data.reply });
    } catch {
      setError("Tony no ha podido responder ahora mismo. Inténtalo de nuevo en un momento.");
    } finally {
      setSending(false);
    }
  }

  return (
    <RequireProfile>
      <div className="flex h-[calc(100vh-180px)] flex-col">
        <h1 className="mb-1 font-serif text-[28px] font-bold tracking-tight">Pregunta a Tony</h1>
        <p className="mb-5 text-[12.5px] text-muted">
          Chatea con Tony sobre tu cartera, comisiones, fiscalidad o cualquier duda de inversión.
        </p>

        <Card className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-3 overflow-y-auto py-2">
            {displayMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-card px-4 py-2.5 text-[13.5px] leading-relaxed ${
                    msg.role === "user" ? "bg-primary-soft text-text" : "bg-surface-2 text-text"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-card bg-surface-2 px-4 py-2.5 text-[13.5px] text-muted">
                  Tony está escribiendo...
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-card bg-danger/10 px-4 py-2.5 text-[13.5px] text-danger">
                  {error}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="mt-3 flex gap-2 border-t border-line pt-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Escribe tu pregunta..."
              className="flex-1 rounded-control border border-line bg-surface px-3 py-2.5 text-[13.5px] outline-none focus:border-primary"
            />
            <Button onClick={handleSend} disabled={sending || !input.trim()}>
              Enviar
            </Button>
          </div>
        </Card>
      </div>
    </RequireProfile>
  );
}
```

- [ ] **Step 3: Confirm a clean build**

Run: `rm -rf .next && npm run build`
Expected: `✓ Compiled successfully`, route table includes `/asesor` and `/api/chat`.

- [ ] **Step 4: Run the full unit suite**

Run: `npm test`
Expected: all test files pass.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(dashboard)/asesor/page.tsx" src/components/layout/Sidebar.tsx
git commit -m "Add the Pregunta a Tony chat page and sidebar entry"
```

---

## Task 5: Wire chat reset into "Empezar de cero"

**Files:**
- Modify: `src/app/(dashboard)/datos/page.tsx`

**Interfaces:**
- Consumes: `clearChat` from `@/lib/useChat` (Task 2).

- [ ] **Step 1: Import `clearChat`**

Replace:
```tsx
import { exportPortfolio, importPortfolio, resetPortfolio } from "@/lib/usePortfolio";
import { clearProfileScore } from "@/lib/useProfileScore";
```

with:
```tsx
import { exportPortfolio, importPortfolio, resetPortfolio } from "@/lib/usePortfolio";
import { clearProfileScore } from "@/lib/useProfileScore";
import { clearChat } from "@/lib/useChat";
```

- [ ] **Step 2: Call it inside `handleReset`**

Replace:
```tsx
  function handleReset() {
    resetPortfolio();
    clearProfileScore();
    setMessage("Se ha borrado tu cartera y tu perfil.");
  }
```

with:
```tsx
  function handleReset() {
    resetPortfolio();
    clearProfileScore();
    clearChat();
    setMessage("Se ha borrado tu cartera, tu perfil y tu conversación con Tony.");
  }
```

- [ ] **Step 3: Run the full test suite**

Run: `npm test` and `npm run test:e2e`
Expected: all unit tests pass. The e2e test `e2e/currency-and-data.spec.ts`'s "resetting data clears the portfolio and the profile gate reactivates" test only asserts on the portfolio/profile-gate behavior and the toast text isn't asserted character-for-character there — confirm by reading that test before running; if it does assert the exact old message text ("Se ha borrado tu cartera y tu perfil."), update it to match the new message in this same step.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(dashboard)/datos/page.tsx"
git commit -m "Clear chat history when resetting all data"
```

---

## Task 6: e2e coverage (non-AI paths only)

**Files:**
- Create: `e2e/tony-advisor.spec.ts`

**Interfaces:**
- Consumes: `seedProfile` from `./helpers/profile`.

**Why this task doesn't test a real AI response:** running a real Claude API call from an automated test suite would require a real, paid API key available in the test environment — not appropriate for a repo-committed test that runs on every `npm run test:e2e`. Instead, this task covers everything that's testable without a real key: the UI renders, the welcome message shows, the sidebar link works, the profile gate works, and the graceful error path when the API call fails (which is exactly what happens today since no `ANTHROPIC_API_KEY` is configured in this environment) shows the expected error message instead of crashing.

- [ ] **Step 1: Write the spec**

Create `e2e/tony-advisor.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { seedProfile } from "./helpers/profile";

test("the sidebar includes Pregunta a Tony right after Mi cartera", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/portfolio");

  const labels = await page.locator("nav a").allTextContents();
  const cartera = labels.indexOf("Mi cartera");
  const asesor = labels.indexOf("Pregunta a Tony");
  expect(asesor).toBe(cartera + 1);
});

test("Pregunta a Tony shows the welcome message", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/asesor");

  await expect(page.getByRole("heading", { name: "Pregunta a Tony" })).toBeVisible();
  await expect(page.getByText(/Hola, soy Tony/)).toBeVisible();
});

test("Pregunta a Tony redirects to /test without a saved profile", async ({ page }) => {
  await page.goto("/asesor");
  await expect(page).toHaveURL("/test");
});

test("sending a message without a configured API key shows a graceful error", async ({
  page,
}) => {
  await seedProfile(page);
  await page.goto("/asesor");

  await page.getByPlaceholder("Escribe tu pregunta...").fill("¿Cómo diversifico mejor?");
  await page.getByRole("button", { name: "Enviar" }).click();

  // The user's own message should appear immediately, regardless of the API outcome.
  await expect(page.getByText("¿Cómo diversifico mejor?")).toBeVisible();

  // Without ANTHROPIC_API_KEY configured in this environment, the route returns an
  // error and the page shows the graceful fallback message instead of crashing.
  await expect(
    page.getByText("Tony no ha podido responder ahora mismo. Inténtalo de nuevo en un momento."),
  ).toBeVisible({ timeout: 10000 });
});
```

- [ ] **Step 2: Run the new spec in isolation**

Run: `npx playwright test e2e/tony-advisor.spec.ts`
Expected: 4/4 passing, as long as `ANTHROPIC_API_KEY` is NOT set in the shell running the dev server (the default state for this repo). If you have set the key locally while testing, temporarily unset it (`unset ANTHROPIC_API_KEY`) before running this spec, or the 4th test will see a real AI reply instead of the error message and fail — that's expected and not a bug, just re-run without the key set.

- [ ] **Step 3: Run the full e2e suite**

Run: `npm run test:e2e`
Expected: 32/32 passing (28 pre-existing + 4 new).

- [ ] **Step 4: Run the unit suite too**

Run: `npm test`
Expected: all test files pass.

- [ ] **Step 5: Commit**

```bash
git add e2e/tony-advisor.spec.ts
git commit -m "Add e2e coverage for the Pregunta a Tony chat (non-AI paths)"
```

---

## Task 7: Final verification sweep

**Files:** none (verification only)

- [ ] **Step 1: Full clean build**

```bash
rm -rf .next
npm run build
```

Expected: `✓ Compiled successfully`, no TypeScript errors, route table includes `/asesor` and `/api/chat`.

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Expected: no output.

- [ ] **Step 3: Full test suite**

```bash
npm test
npm run test:e2e
```

Expected: all unit tests pass (11 files now); 32/32 e2e tests pass.

- [ ] **Step 4: Manual check — graceful failure path (no API key required)**

With the dev server running and a saved profile, go to "Pregunta a Tony", send a message, and confirm: your message appears immediately on the right, "Tony está escribiendo..." shows briefly, then (since no `ANTHROPIC_API_KEY` is configured by default) the graceful error bubble appears instead of a crash or a blank screen.

- [ ] **Step 5: Ask the user whether they want to verify the real AI path**

This step requires the user's own Anthropic API key — do not attempt it without explicit confirmation. Ask: "¿Has añadido tu `ANTHROPIC_API_KEY` a `.env.local`? Si quieres, paramos aquí y verificamos juntos una respuesta real de Tony — pero la clave la pones tú directamente en el archivo, nunca aquí en el chat." If they confirm the key is set, restart the dev server (env vars are only read at server start) and send a real message; confirm a real, on-topic, Spanish-language reply appears, referencing the portfolio context where relevant (e.g., ask "¿qué perfil de riesgo tengo?" and confirm the answer matches the actual saved profile). If they haven't set a key yet or don't want to right now, skip this step — the feature is already fully verified via the graceful-failure path above.

- [ ] **Step 6: Final commit (if any step surfaced fixes)**

If any of the above steps found something to touch up, fix and commit it now with a message describing what was wrong. If nothing needed touching up, this step is a no-op.
