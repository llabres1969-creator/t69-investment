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
