import { describe, expect, it } from "vitest";
import { buildPortfolioContext } from "@/lib/chatContext";

describe("buildPortfolioContext", () => {
  it("states the test hasn't been completed when score is null", () => {
    const context = buildPortfolioContext(null, []);
    expect(context).toContain("aún no ha completado el test de perfil");
  });

  it("states there are no positions when the portfolio is empty", () => {
    const context = buildPortfolioContext(50, []);
    expect(context).toContain("Equilibrado");
    expect(context).toContain("sin posiciones todavía");
  });

  it("summarizes value and allocation when positions exist", () => {
    const context = buildPortfolioContext(50, [
      { isin: "US0378331005", units: 2, avgPrice: 150 }, // Apple Inc., EUR-priced asset class rvus
    ]);
    expect(context).toContain("1 posiciones");
    expect(context).toContain("Apple Inc.");
    expect(context).toMatch(/Asignación actual:.*Renta variable EE\. UU\./);
  });

  it("includes a profit/loss percentage per position", () => {
    const context = buildPortfolioContext(50, [
      { isin: "US0378331005", units: 1, avgPrice: 100 },
    ]);
    expect(context).toMatch(/Apple Inc\. \([^)]+, [+-]\d+\.\d%\)/);
  });
});
