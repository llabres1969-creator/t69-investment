"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ASSETS, ASSET_CATEGORIES, Asset, AssetCategory } from "@/lib/assets";
import { AssetCard } from "@/components/ui/AssetCard";
import { FilterPill } from "@/components/ui/FilterPill";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PriceChart } from "@/components/ui/PriceChart";
import { addPosition } from "@/lib/usePortfolio";

type FilterValue = "all" | AssetCategory;

export default function ExplorarPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [selected, setSelected] = useState<Asset | null>(null);
  const [amount, setAmount] = useState(200);
  const [added, setAdded] = useState(false);

  const filtered = useMemo(() => {
    return ASSETS.filter((asset) => {
      const matchesCategory = filter === "all" || asset.category === filter;
      const matchesQuery =
        query.trim() === "" ||
        asset.name.toLowerCase().includes(query.toLowerCase()) ||
        asset.isin.toLowerCase().includes(query.toLowerCase()) ||
        asset.ticker.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [query, filter]);

  if (selected) {
    const units = amount / selected.price;
    return (
      <div>
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="mb-4 text-[13px] font-semibold text-secondary-deep"
        >
          ← Volver al mercado
        </button>

        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight">{selected.name}</h1>
            <p className="mt-0.5 text-[12.5px] text-muted">
              {selected.ticker} · {selected.isin}
            </p>
          </div>
          <span
            className={`text-[14px] font-bold ${
              selected.changePct >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {selected.changePct >= 0 ? "+" : ""}
            {selected.changePct.toFixed(1)}%
          </span>
        </div>

        <Card className="mb-4">
          <PriceChart
            isin={selected.isin}
            currentPrice={selected.price}
            up={selected.changePct >= 0}
          />
        </Card>

        <Card className="mb-4">
          <p className="text-[14px] leading-relaxed text-muted">{selected.description}</p>
        </Card>

        <Card>
          <div className="mb-3 text-[13px] font-bold">Simular inversión</div>
          <label
            htmlFor="invest-amount"
            className="mb-1.5 block text-[12px] font-semibold text-muted"
          >
            Importe a invertir ({selected.currency === "EUR" ? "€" : "$"})
          </label>
          <input
            id="invest-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="mb-4 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] font-semibold outline-none focus:border-secondary"
          />
          <div className="mb-4 rounded-xl bg-surface-2 p-4">
            <div className="text-[12px] text-muted">Unidades estimadas al precio actual</div>
            <div className="font-mono text-[20px] font-extrabold tracking-tight">
              {units.toFixed(4)}
            </div>
          </div>
          <Button
            className="w-full justify-center"
            disabled={amount <= 0 || added}
            onClick={() => {
              addPosition(selected.isin, units, selected.price);
              setAdded(true);
            }}
          >
            {added ? "Añadido ✓" : "Añadir a mi cartera"}
          </Button>
          {added && (
            <button
              type="button"
              onClick={() => router.push("/portfolio")}
              className="mt-3 w-full text-center text-[12.5px] font-semibold text-secondary-deep"
            >
              Ver en mi cartera →
            </button>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-[24px] font-extrabold tracking-tight">Explorar activos</h1>
        <p className="mt-0.5 text-[12.5px] text-muted">
          {filtered.length} de {ASSETS.length} activos disponibles. Pulsa cualquiera para ver su ficha.
        </p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2.5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar por nombre, ticker o ISIN"
          placeholder="Buscar por nombre, ticker o ISIN…"
          className="w-full max-w-[280px] rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13px] outline-none focus:border-secondary"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterPill label="Todos" active={filter === "all"} onClick={() => setFilter("all")} />
        {ASSET_CATEGORIES.map((cat) => (
          <FilterPill
            key={cat}
            label={cat}
            active={filter === cat}
            onClick={() => setFilter(cat)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((asset) => (
          <AssetCard
            key={asset.isin}
            asset={asset}
            onClick={() => {
              setSelected(asset);
              setAdded(false);
              setAmount(200);
            }}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-[13px] text-muted">
            No hay activos que coincidan con tu búsqueda.
          </p>
        )}
      </div>
    </div>
  );
}
