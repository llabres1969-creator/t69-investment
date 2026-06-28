import { describe, expect, it } from "vitest";
import { ASSETS, CURATED_ASSETS, NON_CURATED_ASSETS } from "@/lib/assets";

describe("curated universe composition", () => {
  it("marks exactly the six T69-curated ISINs as curated", () => {
    const curatedIsins = CURATED_ASSETS.map((a) => a.isin).sort();
    expect(curatedIsins).toEqual(
      [
        "CASH-EUR",
        "IE00B3F81409",
        "IE00B4L5Y983",
        "IE00BK5BQT80",
        "US0378331005",
        "US5949181045",
      ].sort(),
    );
  });

  it("marks exactly the four non-curated ISINs as not curated", () => {
    const nonCuratedIsins = NON_CURATED_ASSETS.map((a) => a.isin).sort();
    expect(nonCuratedIsins).toEqual(
      ["DE-KO-DAX", "ETH-EUR", "US88160R1014", "XBT-EUR"].sort(),
    );
  });

  it("partitions every asset into exactly one of the two groups", () => {
    expect(CURATED_ASSETS.length + NON_CURATED_ASSETS.length).toBe(ASSETS.length);
    const seen = new Set([...CURATED_ASSETS, ...NON_CURATED_ASSETS].map((a) => a.isin));
    expect(seen.size).toBe(ASSETS.length);
  });
});
