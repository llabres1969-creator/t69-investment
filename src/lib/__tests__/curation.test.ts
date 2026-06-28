import { describe, expect, it } from "vitest";
import { CURATED_ASSETS } from "@/lib/assets";
import { getCuration, REVIEW_STATUS_LABEL } from "@/lib/curation";

describe("getCuration", () => {
  it("returns a curation entry for every curated asset", () => {
    for (const asset of CURATED_ASSETS) {
      const curation = getCuration(asset.isin);
      expect(curation, `expected curation data for ${asset.isin}`).toBeDefined();
      expect(curation!.thesis.length).toBeGreaterThan(0);
      expect(curation!.reviewHistory.length).toBeGreaterThan(0);
    }
  });

  it("returns undefined for a non-curated asset", () => {
    expect(getCuration("US88160R1014")).toBeUndefined();
  });

  it("orders every review history most-recent-first", () => {
    for (const asset of CURATED_ASSETS) {
      const history = getCuration(asset.isin)!.reviewHistory;
      const dates = history.map((entry) => entry.date);
      const sortedDescending = [...dates].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
      expect(dates).toEqual(sortedDescending);
    }
  });

  it("has at least one asset with more than one review entry", () => {
    const hasMultiEntry = CURATED_ASSETS.some(
      (asset) => getCuration(asset.isin)!.reviewHistory.length > 1,
    );
    expect(hasMultiEntry).toBe(true);
  });
});

describe("REVIEW_STATUS_LABEL", () => {
  it("has a label for every status value used in the data", () => {
    for (const asset of CURATED_ASSETS) {
      for (const entry of getCuration(asset.isin)!.reviewHistory) {
        expect(REVIEW_STATUS_LABEL[entry.status]).toBeTruthy();
      }
    }
  });
});
