"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { useProfileScore } from "@/lib/useProfileScore";
import { usePortfolio } from "@/lib/usePortfolio";
import { ASSETS } from "@/lib/assets";
import { convert, formatCurrency, useCurrency } from "@/lib/useCurrency";
import {
  Allocation,
  AssetClass,
  ASSET_CLASS_COLOR,
  ASSET_CLASS_LABEL,
  idealAllocation,
  profileLabel,
} from "@/lib/profile";

const EMPTY_ALLOCATION: Allocation = { rvg: 0, rvus: 0, rf: 0, met: 0, cri: 0 };

export default function PortfolioPage() {
  const currency = useCurrency();
  const { score, loaded: scoreLoaded } = useProfileScore();
  const { positions, loaded: positionsLoaded } = usePortfolio();
  const ideal = score !== null ? idealAllocation(score) : null;

  function fmt(amountEur: number, decimals = 0) {
    return formatCurrency(convert(amountEur, "EUR", currency), currency, decimals);
  }

  const enriched = useMemo(
    () =>
      positions
        .map((pos) => {
          const asset = ASSETS.find((a) => a.isin === pos.isin);
          if (!asset) return null;
          const valueEur = convert(pos.units * asset.price, asset.currency, "EUR");
          const investedEur = convert(pos.units * pos.avgPrice, asset.currency, "EUR");
          return { ...pos, asset, valueEur, investedEur, plEur: valueEur - investedEur };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null),
    [positions],
  );

  const totalValue = enriched.reduce((sum, p) => sum + p.valueEur, 0);
  const totalInvested = enriched.reduce((sum, p) => sum + p.investedEur, 0);
  const totalPL = totalValue - totalInvested;
  const plPct = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  const actualAllocation = useMemo(() => {
    if (totalValue === 0) return EMPTY_ALLOCATION;
    const result: Allocation = { ...EMPTY_ALLOCATION };
    for (const p of enriched) {
      const key = p.asset.assetClass as AssetClass;
      result[key] += (p.valueEur / totalValue) * 100;
    }
    return result;
  }, [enriched, totalValue]);

  const hasPositions = enriched.length > 0;
  const loaded = scoreLoaded && positionsLoaded;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight">Mi cartera</h1>
          <p className="mt-0.5 text-[12.5px] text-muted">
            Tus posiciones y su rendimiento.
          </p>
        </div>
        <Link href="/explorar">
          <Button variant="ghost" size="sm">
            Buscar activos
          </Button>
        </Link>
      </div>

      {loaded && score === null && (
        <Card className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-bold">Descubre cómo deberías repartir tu dinero</h3>
            <p className="mt-1 text-[13px] text-muted">
              Haz el test de perfil para comparar tu cartera ideal con lo que ya tienes.
            </p>
          </div>
          <Link href="/test">
            <Button size="sm">Empezar test →</Button>
          </Link>
        </Card>
      )}

      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <KpiCard label="Valor total" value={fmt(totalValue)} />
        <KpiCard label="Invertido" value={fmt(totalInvested)} />
        <KpiCard
          label="Ganancia"
          value={`${totalPL >= 0 ? "+" : ""}${fmt(totalPL)}`}
          tone={totalPL >= 0 ? "up" : "down"}
        />
        <KpiCard
          label="Rentabilidad"
          value={`${plPct >= 0 ? "+" : ""}${plPct.toFixed(1)}%`}
          tone={plPct >= 0 ? "up" : "down"}
        />
      </div>

      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[13px] font-bold">Cartera actual vs. ideal</div>
          {ideal && (
            <span className="text-[11.5px] font-semibold text-muted">
              Perfil: {profileLabel(score!)}
            </span>
          )}
        </div>

        <div className="mb-3 flex flex-wrap gap-3">
          {Object.entries(ASSET_CLASS_LABEL).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5 text-[11.5px] text-muted">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: ASSET_CLASS_COLOR[key as AssetClass] }}
              />
              {label}
            </div>
          ))}
        </div>

        <div className="space-y-2.5">
          {hasPositions ? (
            <AllocationRow label="Actual" allocation={actualAllocation} />
          ) : (
            <div className="rounded-xl bg-surface-2 p-3 text-[12.5px] text-muted">
              Añade posiciones desde Explorar para ver tu reparto actual.
            </div>
          )}
          {ideal ? (
            <AllocationRow label="Ideal" allocation={ideal} />
          ) : (
            <div className="rounded-xl bg-surface-2 p-3 text-[12.5px] text-muted">
              Haz el test de perfil para ver tu cartera ideal aquí.
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="mb-3 text-[13px] font-bold">Posiciones</div>
        {hasPositions ? (
          enriched.map((p, i) => (
            <div
              key={p.isin}
              className={`flex items-center justify-between py-2.5 ${
                i < enriched.length - 1 ? "border-b border-line/60" : ""
              }`}
            >
              <div>
                <div className="text-[13px] font-semibold">{p.asset.name}</div>
                <div className="text-[11.5px] text-muted">
                  {p.units.toFixed(4)} uds · {fmt(p.valueEur)}
                </div>
              </div>
              <span
                className={`text-[13px] font-bold ${p.plEur >= 0 ? "text-success" : "text-danger"}`}
              >
                {p.plEur >= 0 ? "+" : ""}
                {fmt(p.plEur)}
              </span>
            </div>
          ))
        ) : (
          <div className="py-6 text-center">
            <p className="mb-3 text-[13px] text-muted">Aún no tienes posiciones.</p>
            <Link href="/explorar">
              <Button size="sm">Explorar activos →</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

function AllocationRow({
  label,
  allocation,
}: {
  label: string;
  allocation: Allocation;
}) {
  return (
    <div>
      <div className="mb-1 text-[11.5px] font-semibold text-muted">{label}</div>
      <div className="flex h-7 w-full overflow-hidden rounded-full bg-surface-2">
        {Object.entries(allocation).map(([key, value]) =>
          value > 0.5 ? (
            <div
              key={key}
              style={{
                width: `${value}%`,
                background: ASSET_CLASS_COLOR[key as AssetClass],
              }}
              className="flex items-center justify-center text-[10px] font-bold text-white"
            >
              {value >= 8 ? `${Math.round(value)}%` : ""}
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
