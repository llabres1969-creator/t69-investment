import { describe, expect, it } from "vitest";
import { ASSETS } from "@/lib/assets";
import { getFees, totalFeePct } from "@/lib/fees";

describe("getFees", () => {
  it("returns a fee breakdown for every asset in the catalog", () => {
    for (const asset of ASSETS) {
      const fees = getFees(asset.isin);
      expect(fees, `expected fee data for ${asset.isin}`).toBeDefined();
    }
  });

  it("returns undefined for an unknown ISIN", () => {
    expect(getFees("NOT-A-REAL-ISIN")).toBeUndefined();
  });

  it("matches the exact composition for the Vanguard FTSE All-World ETF", () => {
    expect(getFees("IE00BK5BQT80")).toEqual({
      managerPct: 0.22,
      distributionPct: 0.12,
      custodyPct: 0.05,
    });
  });

  it("zeroes out the manager fee for individual stocks", () => {
    expect(getFees("US0378331005")?.managerPct).toBe(0);
  });

  it("charges no fees at all on the cash account", () => {
    const fees = getFees("CASH-EUR");
    expect(fees).toEqual({ managerPct: 0, distributionPct: 0, custodyPct: 0 });
  });
});

describe("totalFeePct", () => {
  it("sums all three fee components", () => {
    expect(
      totalFeePct({ managerPct: 0.22, distributionPct: 0.12, custodyPct: 0.05 }),
    ).toBeCloseTo(0.39, 5);
  });

  it("returns 0 when every component is 0", () => {
    expect(totalFeePct({ managerPct: 0, distributionPct: 0, custodyPct: 0 })).toBe(0);
  });
});
