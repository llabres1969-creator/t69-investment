"use client";

import { useMemo, useState } from "react";
import {
  ASSET_CATEGORIES,
  Asset,
  AssetCategory,
  CURATED_ASSETS,
  NON_CURATED_ASSETS,
} from "@/lib/assets";
import { AssetCard } from "@/components/ui/AssetCard";
import { FilterPill } from "@/components/ui/FilterPill";
import { RequireProfile } from "@/components/RequireProfile";
import { AssetDetailView } from "./AssetDetailView";

type FilterValue = "all" | AssetCategory;

function matchesFilters(asset: Asset, query: string, filter: FilterValue) {
  const matchesCategory = filter === "all" || asset.category === filter;
  const matchesQuery =
    query.trim() === "" ||
    asset.name.toLowerCase().includes(query.toLowerCase()) ||
    asset.isin.toLowerCase().includes(query.toLowerCase()) ||
    asset.ticker.toLowerCase().includes(query.toLowerCase());
  return matchesCategory && matchesQuery;
}

export default function ExplorarPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [selected, setSelected] = useState<Asset | null>(null);

  const filteredCurated = useMemo(
    () => CURATED_ASSETS.filter((asset) => matchesFilters(asset, query, filter)),
    [query, filter],
  );
  const filteredOther = useMemo(
    () => NON_CURATED_ASSETS.filter((asset) => matchesFilters(asset, query, filter)),
    [query, filter],
  );

  const totalShown = filteredCurated.length + filteredOther.length;
  const totalAvailable = CURATED_ASSETS.length + NON_CURATED_ASSETS.length;
  const nothingFound = totalShown === 0;

  return (
    <RequireProfile>
      {selected ? (
        <AssetDetailView asset={selected} onBack={() => setSelected(null)} />
      ) : (
        <div>
          <div className="mb-4">
            <h1 className="text-[24px] font-extrabold tracking-tight">Explorar activos</h1>
            <p className="mt-0.5 text-[12.5px] text-muted">
              {totalShown} de {totalAvailable} activos disponibles. Pulsa cualquiera para ver su
              ficha.
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

          {nothingFound && (
            <p className="py-10 text-center text-[13px] text-muted">
              No hay activos que coincidan con tu búsqueda.
            </p>
          )}

          {filteredCurated.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-1 text-[15px] font-bold">Universo T69</h2>
              <p className="mb-3 text-[12.5px] text-muted">
                Estos son los activos que seleccionamos y revisamos activamente. Es nuestra
                selección, no una lista exhaustiva de mercado.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCurated.map((asset) => (
                  <AssetCard key={asset.isin} asset={asset} onClick={() => setSelected(asset)} />
                ))}
              </div>
            </div>
          )}

          {filteredOther.length > 0 && (
            <div>
              <h2 className="mb-1 text-[15px] font-bold">Otros activos</h2>
              <p className="mb-3 text-[12.5px] text-muted">
                Accesibles pero fuera de nuestro universo curado — sin seguimiento de T69.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredOther.map((asset) => (
                  <AssetCard key={asset.isin} asset={asset} onClick={() => setSelected(asset)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </RequireProfile>
  );
}
