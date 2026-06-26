import { describe, expect, it } from "vitest";
import { computeScore, idealAllocation, profileLabel } from "@/lib/profile";

describe("computeScore", () => {
  it("returns 50 when there are no answers", () => {
    expect(computeScore({})).toBe(50);
  });

  it("averages all answer values", () => {
    expect(computeScore({ a: 0, b: 100 })).toBe(50);
    expect(computeScore({ a: 20, b: 40, c: 60 })).toBe(40);
  });
});

describe("profileLabel", () => {
  it.each([
    [0, "Conservador"],
    [29, "Conservador"],
    [30, "Moderado"],
    [49, "Moderado"],
    [50, "Equilibrado"],
    [69, "Equilibrado"],
    [70, "Dinámico"],
    [84, "Dinámico"],
    [85, "Agresivo"],
    [100, "Agresivo"],
  ])("score %i maps to %s", (score, label) => {
    expect(profileLabel(score)).toBe(label);
  });
});

describe("idealAllocation", () => {
  it("always sums to 100 across the score range", () => {
    for (let score = 0; score <= 100; score += 5) {
      const allocation = idealAllocation(score);
      const total = Object.values(allocation).reduce((sum, v) => sum + v, 0);
      expect(total).toBeCloseTo(100, 5);
    }
  });

  it("never returns a negative weight", () => {
    for (let score = 0; score <= 100; score += 5) {
      const allocation = idealAllocation(score);
      for (const value of Object.values(allocation)) {
        expect(value).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("clamps scores outside the 0-100 range", () => {
    expect(idealAllocation(-50)).toEqual(idealAllocation(0));
    expect(idealAllocation(500)).toEqual(idealAllocation(100));
  });

  it("shifts weight from renta fija to renta variable/cripto as score rises", () => {
    const conservative = idealAllocation(0);
    const aggressive = idealAllocation(100);
    expect(aggressive.rf).toBeLessThan(conservative.rf);
    expect(aggressive.cri).toBeGreaterThan(conservative.cri);
  });
});
