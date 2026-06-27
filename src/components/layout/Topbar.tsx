"use client";

import { cn } from "@/lib/cn";
import { Currency, setCurrency, useCurrency } from "@/lib/useCurrency";

export function Topbar() {
  const currency = useCurrency();

  function toggle(value: Currency) {
    setCurrency(value);
  }

  return (
    <div className="mb-4 flex items-center justify-end gap-1 rounded-full bg-surface-2 p-1">
      <CurrencyButton label="€" active={currency === "EUR"} onClick={() => toggle("EUR")} />
      <CurrencyButton label="$" active={currency === "USD"} onClick={() => toggle("USD")} />
    </div>
  );
}

function CurrencyButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 w-8 rounded-full text-[13px] font-bold transition-colors",
        active
          ? "border border-primary/40 bg-surface-2 text-primary"
          : "text-muted hover:bg-surface-2",
      )}
    >
      {label}
    </button>
  );
}
