"use client";

import { useEffect, useState } from "react";

export interface Position {
  isin: string;
  units: number;
  avgPrice: number;
}

const STORAGE_KEY = "t69_positions";

function read(): Position[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Position[]) : [];
  } catch {
    return [];
  }
}

function write(positions: Position[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    window.dispatchEvent(new Event("t69-positions-updated"));
  } catch {
    // ignore
  }
}

export function addPosition(isin: string, units: number, price: number) {
  const positions = read();
  const existing = positions.find((p) => p.isin === isin);
  if (existing) {
    const totalUnits = existing.units + units;
    const totalCost = existing.units * existing.avgPrice + units * price;
    existing.units = totalUnits;
    existing.avgPrice = totalCost / totalUnits;
  } else {
    positions.push({ isin, units, avgPrice: price });
  }
  write(positions);
}

export function resetPortfolio() {
  write([]);
}

export function exportPortfolio() {
  return JSON.stringify(read(), null, 2);
}

export function importPortfolio(json: string) {
  const parsed = JSON.parse(json) as Position[];
  write(parsed);
}

export function usePortfolio() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function load() {
      setPositions(read());
      setLoaded(true);
    }
    load();
    window.addEventListener("t69-positions-updated", load);
    return () => window.removeEventListener("t69-positions-updated", load);
  }, []);

  return { positions, loaded };
}
