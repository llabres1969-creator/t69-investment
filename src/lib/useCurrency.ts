"use client";

import { useEffect, useState } from "react";

export type Currency = "EUR" | "USD";

const STORAGE_KEY = "t69_currency";
const EUR_PER_USD = 0.93;

export function convert(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  return from === "EUR" ? amount / EUR_PER_USD : amount * EUR_PER_USD;
}

export function formatCurrency(amount: number, currency: Currency, decimals = 0) {
  const symbol = currency === "EUR" ? "€" : "$";
  const value = amount.toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: "always",
  });
  return currency === "EUR" ? `${value} ${symbol}` : `${symbol}${value}`;
}

function read(): Currency {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "USD" ? "USD" : "EUR";
  } catch {
    return "EUR";
  }
}

export function setCurrency(currency: Currency) {
  try {
    localStorage.setItem(STORAGE_KEY, currency);
    window.dispatchEvent(new Event("t69-currency-updated"));
  } catch {
    // ignore
  }
}

export function useCurrency() {
  const [currency, setLocalCurrency] = useState<Currency>("EUR");

  useEffect(() => {
    function load() {
      setLocalCurrency(read());
    }
    load();
    window.addEventListener("t69-currency-updated", load);
    return () => window.removeEventListener("t69-currency-updated", load);
  }, []);

  return currency;
}
