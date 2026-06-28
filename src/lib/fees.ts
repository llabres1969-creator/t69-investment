export interface FeeBreakdown {
  managerPct: number;
  distributionPct: number;
  custodyPct: number;
}

export const FEES: Record<string, FeeBreakdown> = {
  "IE00BK5BQT80": { managerPct: 0.22, distributionPct: 0.12, custodyPct: 0.05 },
  "IE00B4L5Y983": { managerPct: 0.20, distributionPct: 0.12, custodyPct: 0.05 },
  "IE00B3F81409": { managerPct: 0.20, distributionPct: 0.10, custodyPct: 0.05 },
  "US0378331005": { managerPct: 0, distributionPct: 0.10, custodyPct: 0.05 },
  "US5949181045": { managerPct: 0, distributionPct: 0.10, custodyPct: 0.05 },
  "US88160R1014": { managerPct: 0, distributionPct: 0.10, custodyPct: 0.05 },
  "XBT-EUR": { managerPct: 0, distributionPct: 0.15, custodyPct: 0.10 },
  "ETH-EUR": { managerPct: 0, distributionPct: 0.15, custodyPct: 0.10 },
  "DE-KO-DAX": { managerPct: 0, distributionPct: 0.20, custodyPct: 0.05 },
  "CASH-EUR": { managerPct: 0, distributionPct: 0, custodyPct: 0 },
};

export function getFees(isin: string): FeeBreakdown | undefined {
  return FEES[isin];
}

export function totalFeePct(fees: FeeBreakdown): number {
  return fees.managerPct + fees.distributionPct + fees.custodyPct;
}
