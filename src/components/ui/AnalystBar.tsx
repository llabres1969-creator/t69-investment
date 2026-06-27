import { AnalystRecommendation } from "@/lib/assetDetails";

export function AnalystBar({ recommendation }: { recommendation: AnalystRecommendation }) {
  const { buy, hold, sell } = recommendation;
  const total = buy + hold + sell;
  const consensus = buy >= hold && buy >= sell ? "Compra" : hold >= sell ? "Mantener" : "Venta";

  return (
    <div>
      <div className="mb-2.5 flex h-2.5 overflow-hidden rounded-full bg-surface-2">
        <div style={{ width: `${(buy / total) * 100}%` }} className="bg-success" />
        <div style={{ width: `${(hold / total) * 100}%` }} className="bg-primary-soft" />
        <div style={{ width: `${(sell / total) * 100}%` }} className="bg-danger" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
        <div className="flex gap-4">
          <span>
            <strong className="text-success">{buy}</strong>{" "}
            <span className="text-muted">comprar</span>
          </span>
          <span>
            <strong>{hold}</strong> <span className="text-muted">mantener</span>
          </span>
          <span>
            <strong className="text-danger">{sell}</strong>{" "}
            <span className="text-muted">vender</span>
          </span>
        </div>
        <span className="text-muted">
          {total} analistas · consenso: <strong className="text-text">{consensus}</strong>
        </span>
      </div>
    </div>
  );
}
