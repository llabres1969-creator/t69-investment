"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { buildFullSeries, TOTAL_MONTHS } from "@/lib/priceSeries";
import { monthLabel } from "@/lib/format";

const RANGES = [
  { key: "1m", label: "1m", months: 2 },
  { key: "6m", label: "6m", months: 6 },
  { key: "1y", label: "1y", months: 12 },
  { key: "5y", label: "5y", months: 60 },
  { key: "max", label: "max", months: TOTAL_MONTHS },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

interface PriceChartProps {
  isin: string;
  currentPrice: number;
  up: boolean;
}

export function PriceChart({ isin, currentPrice, up }: PriceChartProps) {
  const [range, setRange] = useState<RangeKey>("1y");
  const fullSeries = useMemo(() => buildFullSeries(isin, currentPrice), [isin, currentPrice]);

  const months = RANGES.find((r) => r.key === range)!.months;
  const series = fullSeries.slice(TOTAL_MONTHS - months);

  const min = Math.min(...series);
  const max = Math.max(...series);
  const width = 100;
  const height = 36;

  const points = series.map((value, i) => {
    const x = series.length === 1 ? width : (i / (series.length - 1)) * width;
    const y = max === min ? height / 2 : height - ((value - min) / (max - min)) * height;
    return `${x},${y}`;
  });

  const color = up ? "#19b56b" : "#e0473e";
  const areaPoints = `0,${height} ${points.join(" ")} ${width},${height}`;

  return (
    <div>
      <div className="mb-2 flex justify-end gap-1">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors",
              range === r.key
                ? "border border-primary/40 bg-surface-2 text-primary"
                : "text-muted hover:bg-surface-2",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-24 w-full"
        role="img"
        aria-label={`Evolución del precio en los últimos ${months} meses`}
      >
        <polygon points={areaPoints} fill={color} opacity="0.12" />
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-1 flex justify-between text-[10.5px] text-muted">
        <span>{monthLabel(months - 1)}</span>
        {months > 6 && <span>{monthLabel(Math.floor((months - 1) / 2))}</span>}
        <span>{monthLabel(0)}</span>
      </div>
    </div>
  );
}
