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
