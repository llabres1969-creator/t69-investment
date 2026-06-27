export type AssetClass = "rvg" | "rvus" | "rf" | "met" | "cri";

export interface Allocation {
  rvg: number;
  rvus: number;
  rf: number;
  met: number;
  cri: number;
}

export const ASSET_CLASS_LABEL: Record<AssetClass, string> = {
  rvg: "Renta variable global",
  rvus: "Renta variable EE. UU.",
  rf: "Renta fija",
  met: "Metales",
  cri: "Cripto",
};

export const ASSET_CLASS_COLOR: Record<AssetClass, string> = {
  rvg: "#4a6fa5",
  rvus: "#00a3ff",
  rf: "#8fb0a0",
  met: "#c89b6c",
  cri: "#ff6a00",
};

const MODEL_PORTFOLIOS: { minScore: number; allocation: Allocation; label: string }[] = [
  { minScore: 0, label: "Conservador", allocation: { rvg: 10, rvus: 5, rf: 75, met: 10, cri: 0 } },
  { minScore: 30, label: "Moderado", allocation: { rvg: 20, rvus: 15, rf: 55, met: 8, cri: 2 } },
  { minScore: 50, label: "Equilibrado", allocation: { rvg: 30, rvus: 25, rf: 35, met: 6, cri: 4 } },
  { minScore: 70, label: "Dinámico", allocation: { rvg: 35, rvus: 30, rf: 18, met: 5, cri: 12 } },
  { minScore: 85, label: "Agresivo", allocation: { rvg: 35, rvus: 35, rf: 5, met: 5, cri: 20 } },
];

export function profileLabel(score: number) {
  const tier = [...MODEL_PORTFOLIOS].reverse().find((p) => score >= p.minScore);
  return tier?.label ?? "Equilibrado";
}

function interpolate(a: Allocation, b: Allocation, t: number): Allocation {
  const keys = Object.keys(a) as AssetClass[];
  const result = {} as Allocation;
  for (const key of keys) {
    result[key] = a[key] + (b[key] - a[key]) * t;
  }
  return result;
}

export function idealAllocation(score: number): Allocation {
  const clamped = Math.max(0, Math.min(100, score));
  for (let i = 0; i < MODEL_PORTFOLIOS.length - 1; i++) {
    const lower = MODEL_PORTFOLIOS[i];
    const upper = MODEL_PORTFOLIOS[i + 1];
    if (clamped >= lower.minScore && clamped <= upper.minScore) {
      const t = (clamped - lower.minScore) / (upper.minScore - lower.minScore);
      return interpolate(lower.allocation, upper.allocation, t);
    }
  }
  return MODEL_PORTFOLIOS[MODEL_PORTFOLIOS.length - 1].allocation;
}

export function computeScore(answers: Record<string, number>): number {
  const values = Object.values(answers);
  if (values.length === 0) return 50;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}
