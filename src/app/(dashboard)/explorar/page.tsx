"use client";

import { useMemo, useState } from "react";
import { ASSETS, ASSET_CATEGORIES, Asset, AssetCategory } from "@/lib/assets";
import { AssetCard } from "@/components/ui/AssetCard";
import { FilterPill } from "@/components/ui/FilterPill";
import { AssetDetailView } from "./AssetDetailView";

type FilterValue = "all" | AssetCategory;

export default function ExplorarPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [selected, setSelected] = useState<Asset | null>(null);

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
    return <AssetDetailView asset={selected} onBack={() => setSelected(null)} />;
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
          className="w-full max-w-[280px] rounded-control border border-line bg-surface px-3.5 py-2.5 text-[13px] outline-none focus:border-secondary"
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
          <AssetCard key={asset.isin} asset={asset} onClick={() => setSelected(asset)} />
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
