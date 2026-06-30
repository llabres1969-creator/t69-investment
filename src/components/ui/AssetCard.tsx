import { cn } from "@/lib/cn";
import { Asset } from "@/lib/assets";
import { convert, formatCurrency, useCurrency } from "@/lib/useCurrency";

function formatPrice(asset: Asset, displayCurrency: "EUR" | "USD") {
  const decimals = asset.price >= 1000 ? 0 : 2;
  const converted = convert(asset.price, asset.currency, displayCurrency);
  return formatCurrency(converted, displayCurrency, decimals);
}

interface AssetCardProps {
  asset: Asset;
  onClick?: () => void;
}

export function AssetCard({ asset, onClick }: AssetCardProps) {
  const currency = useCurrency();
  const up = asset.changePct >= 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-card border border-line bg-surface p-4 text-left transition-colors hover:bg-surface-2"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10.5px] font-bold text-secondary">
            {asset.ticker}
          </span>
          {asset.curated && (
            <span className="rounded-full bg-primary-soft px-2 py-1 text-[9.5px] font-bold text-primary-hover">
              Tony
            </span>
          )}
        </div>
        <span
          className={cn(
            "text-[12px] font-bold",
            up ? "text-success" : "text-danger",
          )}
        >
          {up ? "+" : ""}
          {asset.changePct.toFixed(1)}%
        </span>
      </div>
      <div className="mb-1 text-[14px] font-bold leading-snug text-text">{asset.name}</div>
      <div className="font-mono text-[15px] font-semibold text-muted">
        {formatPrice(asset, currency)}
      </div>
    </button>
  );
}
