import { beforeEach, describe, expect, it } from "vitest";
import { addPosition, exportPortfolio, importPortfolio, resetPortfolio } from "@/lib/usePortfolio";

beforeEach(() => {
  localStorage.clear();
});

describe("addPosition", () => {
  it("creates a new position when the asset is not held yet", () => {
    addPosition("ISIN-A", 2, 100);
    const positions = JSON.parse(exportPortfolio());
    expect(positions).toEqual([{ isin: "ISIN-A", units: 2, avgPrice: 100 }]);
  });

  it("computes a weighted average price when buying the same asset again", () => {
    addPosition("ISIN-A", 2, 100); // 2 units @ 100 = 200
    addPosition("ISIN-A", 2, 200); // 2 units @ 200 = 400
    const [position] = JSON.parse(exportPortfolio());
    expect(position.units).toBe(4);
    expect(position.avgPrice).toBe(150); // (200 + 400) / 4
  });

  it("keeps separate positions for different assets", () => {
    addPosition("ISIN-A", 1, 100);
    addPosition("ISIN-B", 3, 50);
    const positions = JSON.parse(exportPortfolio());
    expect(positions).toHaveLength(2);
  });
});

describe("resetPortfolio", () => {
  it("clears all positions", () => {
    addPosition("ISIN-A", 1, 100);
    resetPortfolio();
    expect(JSON.parse(exportPortfolio())).toEqual([]);
  });
});

describe("importPortfolio", () => {
  it("replaces existing positions with the imported ones", () => {
    addPosition("ISIN-A", 1, 100);
    importPortfolio(JSON.stringify([{ isin: "ISIN-B", units: 5, avgPrice: 20 }]));
    const positions = JSON.parse(exportPortfolio());
    expect(positions).toEqual([{ isin: "ISIN-B", units: 5, avgPrice: 20 }]);
  });

  it("throws on invalid JSON instead of silently corrupting storage", () => {
    addPosition("ISIN-A", 1, 100);
    expect(() => importPortfolio("not json")).toThrow();
    const positions = JSON.parse(exportPortfolio());
    expect(positions).toEqual([{ isin: "ISIN-A", units: 1, avgPrice: 100 }]);
  });
});
