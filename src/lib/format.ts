export const NUM_CLASS = "font-mono tabular-nums";

export function formatBigEur(value: number) {
  if (value >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toLocaleString("es-ES", { maximumFractionDigits: 2 })} bill. €`;
  }
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toLocaleString("es-ES", { maximumFractionDigits: 2 })} mil M €`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("es-ES", { maximumFractionDigits: 1 })} M €`;
  }
  return `${value.toLocaleString("es-ES")} €`;
}

export function formatPct(value: number, decimals = 1) {
  const formatted = value.toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${value > 0 ? "+" : ""}${formatted}%`;
}

export function formatDateEs(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function formatCompactNumber(value: number) {
  return value.toLocaleString("es-ES", { useGrouping: "always" });
}

export function formatNumber(value: number, decimals = 1) {
  return value.toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function monthLabel(monthsAgo: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  return date.toLocaleDateString("es-ES", { month: "short", year: "2-digit" }).replace(".", "");
}
