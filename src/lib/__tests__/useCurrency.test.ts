import { describe, expect, it } from "vitest";
import { convert, formatCurrency } from "@/lib/useCurrency";

describe("convert", () => {
  it("returns the same amount when currencies match", () => {
    expect(convert(100, "EUR", "EUR")).toBe(100);
    expect(convert(100, "USD", "USD")).toBe(100);
  });

  it("converts EUR to USD using the published rate", () => {
    expect(convert(93, "EUR", "USD")).toBeCloseTo(100, 5);
  });

  it("converts USD to EUR using the published rate", () => {
    expect(convert(100, "USD", "EUR")).toBeCloseTo(93, 5);
  });

  it("round-trips without drifting", () => {
    const original = 132.4;
    const roundTripped = convert(convert(original, "EUR", "USD"), "USD", "EUR");
    expect(roundTripped).toBeCloseTo(original, 5);
  });
});

describe("formatCurrency", () => {
  it("places the euro symbol after the amount", () => {
    expect(formatCurrency(1234, "EUR")).toBe("1.234 €");
  });

  it("places the dollar symbol before the amount", () => {
    expect(formatCurrency(1234, "USD")).toBe("$1.234");
  });

  it("respects the requested decimal precision", () => {
    expect(formatCurrency(12.5, "EUR", 2)).toBe("12,50 €");
  });
});
