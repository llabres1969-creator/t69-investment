import { FinancialYear } from "@/lib/assetDetails";

const SERIES: { key: keyof Omit<FinancialYear, "year">; label: string; color: string }[] = [
  { key: "revenue", label: "Ingresos", color: "#d6dfeb" },
  { key: "grossProfit", label: "Margen bruto", color: "#19b56b" },
  { key: "operatingProfit", label: "B. operativo", color: "#ff6a00" },
  { key: "netProfit", label: "B. neto", color: "#00a3ff" },
];

export function FinancialsChart({ data }: { data: FinancialYear[] }) {
  const max = Math.max(...data.flatMap((d) => SERIES.map((s) => d[s.key])));
  const height = 140;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-[11px] text-muted">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: s.color }}
            />
            {s.label}
          </div>
        ))}
      </div>
      <div className="flex items-end gap-4" style={{ height }}>
        {data.map((d) => (
          <div key={d.year} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex items-end gap-1" style={{ height: height - 24 }}>
              {SERIES.map((s) => (
                <div
                  key={s.key}
                  style={{
                    height: `${(d[s.key] / max) * 100}%`,
                    background: s.color,
                  }}
                  className="w-3 rounded-t-sm"
                  title={`${s.label}: ${d[s.key]} mil M`}
                />
              ))}
            </div>
            <div className="text-[11px] text-muted">{d.year}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
