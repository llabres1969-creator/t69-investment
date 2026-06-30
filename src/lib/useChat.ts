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
