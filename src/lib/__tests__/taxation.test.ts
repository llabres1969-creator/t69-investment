import { describe, expect, it } from "vitest";
import { ASSET_DETAILS } from "@/lib/assetDetails";
import { getTaxation } from "@/lib/taxation";

describe("getTaxation", () => {
  it("returns a tax treatment for every catalog type actually used in the catalog", () => {
    const typesInUse = new Set(Object.values(ASSET_DETAILS).map((d) => d.catalog.type));
    expect(typesInUse.size).toBe(5);
    for (const type of typesInUse) {
      const treatment = getTaxation(type);
      expect(treatment, `expected tax treatment for catalog type "${type}"`).toBeDefined();
    }
  });

  it("returns undefined for an unknown catalog type", () => {
    expect(getTaxation("Not A Real Type")).toBeUndefined();
  });

  it("classifies shares as a ganancia patrimonial taxed at 19%-28%", () => {
    expect(getTaxation("Acción")).toEqual({
      figure: "Ganancia patrimonial",
      rateRange: "19% – 28% (tramos del ahorro)",
      note: "Se aplica el método FIFO: se considera vendido primero lo que se compró primero.",
    });
  });

  it("flags that ETFs have no traspaso deferral, unlike mutual funds", () => {
    expect(getTaxation("ETF")?.note).toContain("no tienen diferimiento por traspaso");
  });

  it("classifies the cash account as rendimiento del capital mobiliario", () => {
    expect(getTaxation("Cuenta remunerada")).toEqual({
      figure: "Rendimiento del capital mobiliario",
      rateRange: "19% – 28% (tramos del ahorro)",
      note: "La entidad aplica una retención del 19% en origen, a cuenta de la declaración anual.",
    });
  });
});
