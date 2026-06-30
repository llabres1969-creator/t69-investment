import { ASSETS } from "@/lib/assets";
import {
  Allocation,
  ASSET_CLASS_LABEL,
  AssetClass,
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
