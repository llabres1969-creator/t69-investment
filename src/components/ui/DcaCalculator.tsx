"use client";

import { useMemo, useState } from "react";
import { buildFullSeries, TOTAL_MONTHS } from "@/lib/priceSeries";
import { monthLabel, NUM_CLASS } from "@/lib/format";
import { Currency, convert, formatCurrency } from "@/lib/useCurrency";

const MAX_YEARS = Math.floor(TOTAL_MONTHS / 12);

interface DcaCalculatorProps {
  isin: string;
  currentPrice: number;
  assetCurrency: Currency;
  displayCurrency: Currency;
}

export function DcaCalculator({
  isin,
  currentPrice,
  assetCurrency,
  displayCurrency,
}: DcaCalculatorProps) {
  const [initial, setInitial] = useState(1000);
  const [monthly, setMonthly] = useState(200);
  const [years, setYears] = useState(5);

  const fullSeries = useMemo(() => buildFullSeries(isin, currentPrice), [isin, currentPrice]);

  const { periodicSeries, lumpSeries, contributed, periodicFinal, lumpFinal } = useMemo(() => {
    const months = years * 12;
    const prices = fullSeries.slice(TOTAL_MONTHS - months);

    let units = 0;
    const periodic: number[] = [];
    for (let i = 0; i < months; i++) {
      const contribution = i === 0 ? initial : monthly;
      units += contribution / prices[i];
      periodic.push(units * prices[i]);
    }

    const totalContributed = initial + monthly * (months - 1);
    const lumpUnits = totalContributed / prices[0];
    const lump = prices.map((p) => lumpUnits * p);

    return {
      periodicSeries: periodic,
      lumpSeries: lump,
      contributed: totalContributed,
      periodicFinal: periodic[periodic.length - 1],
      lumpFinal: lump[lump.length - 1],
    };
  }, [fullSeries, initial, monthly, years]);

  function fmt(amount: number) {
    return formatCurrency(convert(amount, assetCurrency, displayCurrency), displayCurrency);
  }

  const width = 100;
  const height = 100;
  const max = Math.max(...periodicSeries, ...lumpSeries);

  function toPoints(series: number[]) {
    return series
      .map((v, i) => {
        const x = series.length === 1 ? width : (i / (series.length - 1)) * width;
        const y = height - (v / max) * height;
        return `${x},${y}`;
      })
      .join(" ");
  }

  return (
    <div>
      <p className="mb-4 text-[13px] text-muted">
        Si hubieras empezado a invertir hace X años (hasta hoy), con el comportamiento simulado
        del activo.
      </p>

      <div className="mb-4 space-y-4">
        <SliderField
          label="Aportación inicial"
          value={initial}
          display={fmt(initial)}
          min={0}
          max={10000}
          step={100}
          onChange={setInitial}
        />
        <SliderField
          label="Aportación mensual"
          value={monthly}
          display={fmt(monthly)}
          min={0}
          max={1000}
          step={50}
          onChange={setMonthly}
        />
        <SliderField
          label="Empezando hace"
          value={years}
          display={`${years} año${years === 1 ? "" : "s"}`}
          min={1}
          max={MAX_YEARS}
          step={1}
          onChange={setYears}
        />
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-32 w-full">
        <polyline
          points={toPoints(lumpSeries)}
          fill="none"
          stroke="#ff9a4d"
          strokeWidth="1.4"
          strokeDasharray="3,2"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={toPoints(periodicSeries)}
          fill="none"
          stroke="#00a3ff"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mb-4 flex justify-between text-[10.5px] text-muted">
        <span>{monthLabel(years * 12 - 1)}</span>
        <span>{monthLabel(0)}</span>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-[11.5px]">
        <span className="flex items-center gap-1.5 text-muted">
          <span className="inline-block h-0.5 w-4 bg-secondary" /> Aportación periódica
          (mensual)
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <span className="inline-block h-0.5 w-4 border-t border-dashed border-[#ff9a4d]" />{" "}
          Todo de golpe al inicio
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-control bg-surface-2 p-3.5">
          <div className="mb-1 text-[11px] text-muted">Aportado</div>
          <div className={`${NUM_CLASS} text-[16px] font-bold`}>{fmt(contributed)}</div>
        </div>
        <div className="rounded-control bg-surface-2 p-3.5">
          <div className="mb-1 text-[11px] text-muted">Hoy (mensual)</div>
          <div className={`${NUM_CLASS} text-[16px] font-bold text-success`}>
            {fmt(periodicFinal)}
          </div>
        </div>
        <div className="rounded-control bg-surface-2 p-3.5">
          <div className="mb-1 text-[11px] text-muted">Hoy (de golpe)</div>
          <div className={`${NUM_CLASS} text-[16px] font-bold text-success`}>{fmt(lumpFinal)}</div>
        </div>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-[12.5px]">
        <span className="text-muted">{label}</span>
        <span className={`${NUM_CLASS} font-bold`}>{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}
