"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Asset } from "@/lib/assets";
import { getAssetDetail } from "@/lib/assetDetails";
import { getCuration, REVIEW_STATUS_LABEL } from "@/lib/curation";
import { getFees, totalFeePct } from "@/lib/fees";
import { getTaxation } from "@/lib/taxation";
import { addPosition } from "@/lib/usePortfolio";
import { useCurrency, convert, formatCurrency } from "@/lib/useCurrency";
import { formatBigEur, formatDateEs, formatNumber, formatPct, NUM_CLASS } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { PriceChart } from "@/components/ui/PriceChart";
import { DcaCalculator } from "@/components/ui/DcaCalculator";
import { StatGrid } from "@/components/ui/StatGrid";
import { FinancialsChart } from "@/components/ui/FinancialsChart";
import { AnalystBar } from "@/components/ui/AnalystBar";

export function AssetDetailView({ asset, onBack }: { asset: Asset; onBack: () => void }) {
  const router = useRouter();
  const displayCurrency = useCurrency();
  const [amount, setAmount] = useState(200);
  const [added, setAdded] = useState(false);

  const detail = getAssetDetail(asset.isin);
  const curation = getCuration(asset.isin);
  const fees = getFees(asset.isin);
  const taxation = detail?.catalog ? getTaxation(detail.catalog.type) : undefined;
  const units = amount / asset.price;
  const up = asset.changePct >= 0;

  function fmtAsset(amountInAssetCurrency: number) {
    return formatCurrency(
      convert(amountInAssetCurrency, asset.currency, displayCurrency),
      displayCurrency,
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-[13px] font-semibold text-secondary"
      >
        ← Volver al mercado
      </button>

      <Card className="mb-4">
        <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-extrabold tracking-tight">{asset.name}</h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
              <span>
                {asset.ticker} · {asset.isin}
              </span>
              {detail?.catalog?.type && <Pill tone="blue">{detail.catalog.type}</Pill>}
              {detail?.catalog?.country && <Pill tone="blue">{detail.catalog.country}</Pill>}
            </p>
          </div>
          <div className="text-right">
            <div className={`${NUM_CLASS} text-[20px] font-extrabold tracking-tight`}>
              {fmtAsset(asset.price)}
            </div>
            <div
              className={`${NUM_CLASS} text-[13px] font-bold ${up ? "text-success" : "text-danger"}`}
            >
              {formatPct(asset.changePct)}
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <div className="mb-3 text-[13px] font-bold">Evolución del precio</div>
        <PriceChart isin={asset.isin} currentPrice={asset.price} up={up} />
      </Card>

      {detail?.quote && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Cotización</div>
          <StatGrid
            columns={2}
            stats={[
              {
                label: "Rango del día",
                value: `${fmtAsset(detail.quote.dayLow)} – ${fmtAsset(detail.quote.dayHigh)}`,
              },
              {
                label: "Mín./Máx. 52 sem.",
                value: `${fmtAsset(detail.quote.week52Low)} – ${fmtAsset(detail.quote.week52High)}`,
              },
              { label: "Cierre anterior", value: fmtAsset(detail.quote.previousClose) },
              {
                label: "Volumen",
                value: detail.quote.volume > 0 ? detail.quote.volume.toLocaleString("es-ES") : "—",
              },
              { label: "Mercado", value: detail.quote.exchange },
            ]}
          />
        </Card>
      )}

      {detail?.catalog && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Datos del catálogo</div>
          <div className="divide-y divide-line/60 text-[13px]">
            <Row label="Tipo" value={detail.catalog.type} />
            {detail.catalog.sector && <Row label="Sector" value={detail.catalog.sector} />}
            {detail.catalog.country && <Row label="País" value={detail.catalog.country} />}
            {detail.catalog.indices && detail.catalog.indices.length > 0 && (
              <Row label="Índice" value={detail.catalog.indices.join(", ")} />
            )}
            {detail.catalog.derivativesAvailable && detail.catalog.derivativesAvailable.length > 0 && (
              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-muted">Derivados disponibles</span>
                <span className="flex flex-wrap justify-end gap-1.5">
                  {detail.catalog.derivativesAvailable.map((d) => (
                    <Pill key={d} tone="blue">
                      {d}
                    </Pill>
                  ))}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {fees && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Comisiones</div>
          <div className="divide-y divide-line/60 text-[13px]">
            <Row label="Gestora" value={`${formatNumber(fees.managerPct, 2)}%`} valueClassName={NUM_CLASS} />
            <Row
              label="T69"
              value={`${formatNumber(fees.distributionPct, 2)}%`}
              valueClassName={NUM_CLASS}
            />
            <Row
              label="Custodio"
              value={`${formatNumber(fees.custodyPct, 2)}%`}
              valueClassName={NUM_CLASS}
            />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="text-[13px] font-bold">Coste total anual estimado</span>
            <span className={`${NUM_CLASS} text-[13px] font-bold`}>
              {formatNumber(totalFeePct(fees), 2)}%
            </span>
          </div>
        </Card>
      )}

      {taxation && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Fiscalidad</div>
          <div className="divide-y divide-line/60 text-[13px]">
            <Row label="Figura tributaria" value={taxation.figure} />
            <Row label="Tramo aplicable" value={taxation.rateRange} />
          </div>
          <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-muted">
            {taxation.note}
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Información general, no constituye asesoramiento fiscal personalizado.
          </p>
        </Card>
      )}

      <Card className="mb-4">
        <div className="mb-3 text-[13px] font-bold">¿Cuánto tendrías hoy?</div>
        <DcaCalculator
          isin={asset.isin}
          currentPrice={asset.price}
          assetCurrency={asset.currency}
          displayCurrency={displayCurrency}
        />
      </Card>

      {detail?.analystRecommendation && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Recomendación de analistas</div>
          <AnalystBar recommendation={detail.analystRecommendation} />
        </Card>
      )}

      {detail?.financials && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Ingresos, beneficio y caja</div>
          <FinancialsChart data={detail.financials} />
        </Card>
      )}

      {detail?.balanceSheet && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Balance</div>
          <div className="divide-y divide-line/60 text-[13px]">
            <Row
              label="Activos totales"
              value={formatBigEur(detail.balanceSheet.totalAssets)}
              valueClassName={NUM_CLASS}
            />
            <Row
              label="Pasivos totales"
              value={formatBigEur(detail.balanceSheet.totalLiabilities)}
              valueClassName={NUM_CLASS}
            />
            <Row
              label="Caja y equivalentes"
              value={formatBigEur(detail.balanceSheet.cash)}
              valueClassName={NUM_CLASS}
            />
            <Row
              label="Deuda a largo plazo"
              value={formatBigEur(detail.balanceSheet.longTermDebt)}
              valueClassName={NUM_CLASS}
            />
            <Row
              label="Patrimonio neto"
              value={formatBigEur(detail.balanceSheet.equity)}
              valueClassName={NUM_CLASS}
            />
          </div>
        </Card>
      )}

      {detail?.valuation && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Valoración y ratios</div>
          <StatGrid
            stats={[
              { label: "PER", value: `${formatNumber(detail.valuation.per)}x` },
              {
                label: "Precio/Valor contable",
                value: `${formatNumber(detail.valuation.priceToBook)}x`,
              },
              {
                label: "Precio/Ventas",
                value: `${formatNumber(detail.valuation.priceToSales)}x`,
              },
              { label: "ROE", value: formatPct(detail.valuation.roe) },
              { label: "ROA", value: formatPct(detail.valuation.roa) },
              { label: "Margen bruto", value: formatPct(detail.valuation.grossMargin) },
              { label: "Margen neto", value: formatPct(detail.valuation.netMargin) },
              { label: "Beta", value: formatNumber(detail.valuation.beta, 2) },
              { label: "BPA (TTM)", value: formatNumber(detail.valuation.epsTtm, 2) },
              {
                label: "Deuda/Patrimonio",
                value: formatNumber(detail.valuation.debtToEquity, 1),
              },
              {
                label: "Ratio corriente",
                value: formatNumber(detail.valuation.currentRatio, 2),
              },
              {
                label: "Rentab. 52 sem.",
                value: formatPct(detail.valuation.return52w),
                tone: detail.valuation.return52w >= 0 ? "up" : "down",
              },
            ]}
          />
        </Card>
      )}

      {detail?.dividends && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Dividendos</div>
          <StatGrid
            stats={[
              { label: "Rentab. por dividendo", value: formatPct(detail.dividends.yieldPct) },
              {
                label: "Dividendo anual",
                value: `${detail.dividends.annualDividend.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €`,
              },
              { label: "Próx. ex-dividendo", value: formatDateEs(detail.dividends.nextExDate) },
            ]}
          />
        </Card>
      )}

      {detail?.riskReturn && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Rentabilidad y riesgo</div>
          <StatGrid
            stats={[
              {
                label: "Rentab. anualizada",
                value: formatPct(detail.riskReturn.annualizedReturn),
                tone: detail.riskReturn.annualizedReturn >= 0 ? "up" : "down",
              },
              {
                label: "Anualizada 5 años",
                value: formatPct(detail.riskReturn.annualized5y),
                tone: detail.riskReturn.annualized5y >= 0 ? "up" : "down",
              },
              { label: "Volatilidad anual", value: formatPct(detail.riskReturn.volatility) },
              {
                label: "Máxima caída",
                value: formatPct(detail.riskReturn.maxDrawdown),
                tone: "down",
              },
              {
                label: "Mejor año",
                value: `${detail.riskReturn.bestYear.year} · ${formatPct(detail.riskReturn.bestYear.pct)}`,
                tone: "up",
              },
              {
                label: "Peor año",
                value: `${detail.riskReturn.worstYear.year} · ${formatPct(detail.riskReturn.worstYear.pct)}`,
                tone: "down",
              },
              {
                label: "Rentab. total (simulada)",
                value: formatPct(detail.riskReturn.totalReturn10y),
                tone: "up",
              },
              {
                label: "Peor 12 meses",
                value: formatPct(detail.riskReturn.worst12m),
                tone: "down",
              },
              {
                label: "Ratio rentab./riesgo",
                value: formatNumber(detail.riskReturn.returnRiskRatio, 2),
              },
              {
                label: "Meses en positivo",
                value: formatPct(detail.riskReturn.positiveMonthsPct, 0),
              },
            ]}
          />
        </Card>
      )}

      {detail?.comparables && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Empresas comparables</div>
          <div className="flex flex-wrap gap-2">
            {detail.comparables.map((c) => (
              <Pill key={c} tone="blue">
                {c}
              </Pill>
            ))}
          </div>
        </Card>
      )}

      {curation && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Seguimiento de T69</div>
          <div className="mb-4">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Por qué está en el universo
            </div>
            <p className="text-[13.5px] leading-relaxed">{curation.thesis}</p>
          </div>
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Historial de revisión
            </div>
            <div className="space-y-3">
              {curation.reviewHistory.map((entry) => (
                <div key={`${entry.date}-${entry.status}`} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div>
                    <div className="text-[13px] font-semibold">
                      {formatDateEs(entry.date)} · {REVIEW_STATUS_LABEL[entry.status]}
                    </div>
                    <div className="text-[13px] leading-relaxed text-muted">{entry.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-4">
        <div className="mb-3 text-[13px] font-bold">Sobre el activo</div>
        <p className="text-[13.5px] leading-relaxed text-muted">{asset.description}</p>
      </Card>

      {detail?.keyFacts && (
        <Card className="mb-4">
          <div className="mb-3 text-[13px] font-bold">Datos clave</div>
          <div className="divide-y divide-line/60 text-[13px]">
            {detail.keyFacts.sector && <Row label="Sector" value={detail.keyFacts.sector} />}
            {detail.keyFacts.industry && (
              <Row label="Industria" value={detail.keyFacts.industry} />
            )}
            {detail.keyFacts.country && <Row label="País" value={detail.keyFacts.country} />}
            {detail.keyFacts.marketCapEur !== undefined && (
              <Row label="Capitalización" value={formatBigEur(detail.keyFacts.marketCapEur)} />
            )}
            {detail.keyFacts.ceo && <Row label="CEO" value={detail.keyFacts.ceo} />}
            {detail.keyFacts.employees !== undefined && (
              <Row label="Empleados" value={detail.keyFacts.employees.toLocaleString("es-ES")} />
            )}
            {detail.keyFacts.ipoDate && (
              <Row label="Salida a bolsa" value={formatDateEs(detail.keyFacts.ipoDate)} />
            )}
            {detail.keyFacts.exchange && <Row label="Bolsa" value={detail.keyFacts.exchange} />}
            {detail.keyFacts.website && (
              <Row label="Web" value={detail.keyFacts.website} valueClassName="text-secondary" />
            )}
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-3 text-[13px] font-bold">Simular inversión</div>
        <label
          htmlFor="invest-amount"
          className="mb-1.5 block text-[12px] font-semibold text-muted"
        >
          Importe a invertir ({asset.currency === "EUR" ? "€" : "$"})
        </label>
        <input
          id="invest-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          className="mb-4 w-full rounded-control border border-line bg-surface px-3.5 py-2.5 text-[14px] font-semibold outline-none focus:border-secondary"
        />
        <div className="mb-4 rounded-control bg-surface-2 p-4">
          <div className="text-[12px] text-muted">Unidades estimadas al precio actual</div>
          <div className="font-mono text-[20px] font-extrabold tracking-tight">
            {units.toFixed(4)}
          </div>
        </div>
        <Button
          className="w-full justify-center"
          disabled={amount <= 0 || added}
          onClick={() => {
            addPosition(asset.isin, units, asset.price);
            setAdded(true);
          }}
        >
          {added ? "Añadido ✓" : "Añadir a mi cartera"}
        </Button>
        {added && (
          <button
            type="button"
            onClick={() => router.push("/portfolio")}
            className="mt-3 w-full text-center text-[12.5px] font-semibold text-secondary"
          >
            Ver en mi cartera →
          </button>
        )}
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-muted">{label}</span>
      <span className={`font-semibold ${valueClassName ?? ""}`}>{value}</span>
    </div>
  );
}
