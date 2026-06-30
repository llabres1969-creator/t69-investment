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
